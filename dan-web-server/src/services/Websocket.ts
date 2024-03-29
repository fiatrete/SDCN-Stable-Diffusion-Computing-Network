import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import {
  MessageType,
  RegisterMessage,
  RegisterMessageResult,
  HeartbeatMessage,
  HeartbeatResultMessage,
  OfflineMessage,
  OfflineResultMessage,
  CommandMessage,
  CommandRequest,
  CommandResultMessage,
  CommandResultData,
} from '../models';
import { UserRepository } from '../repositories';
import NodeService from './NodeService';

interface Client {
  nodeName: string;
  apiKey: string;
  accountId: bigint;
  nodeId: bigint;
  sessionId: string;
  socket: WebSocket;
  status: number;
}
enum Status {
  ERROR = 0,
  OK,
}

export default class WebsocketService {
  userRepository: UserRepository;
  nodeService: NodeService;
  constructor(inject: { userRepository: UserRepository; nodeService: NodeService }) {
    this.userRepository = inject.userRepository;
    this.nodeService = inject.nodeService;
  }
  clients: Map<string, Client> = new Map();
  clientBySessionId: Map<string, Client> = new Map();

  private async addNewClient(ws: WebSocket, message: RegisterMessage) {
    const accountId = await this.userRepository.getAccountIdByApiKey(message.apiKey);
    if (accountId === undefined || accountId === null) {
      logger.warn('Invalid apiKey');
      const result: RegisterMessageResult = {
        msgType: MessageType.RegisterResult,
        sessionId: '',
        code: 500,
      };
      ws.send(JSON.stringify(result));
      ws.close();
      return;
    }
    logger.info('accountId:', accountId);

    const node = await this.nodeService.getOrCreateNodeByNodeName(message.nodeName, String(accountId), true);
    if (node === undefined) {
      logger.warn('Cannot get node By:', message.nodeName);
      const result: RegisterMessageResult = {
        msgType: MessageType.RegisterResult,
        sessionId: '',
        code: 500,
      };
      ws.send(JSON.stringify(result));
      return;
    }
    const client: Client = {
      nodeName: message.nodeName,
      apiKey: message.apiKey,
      accountId: accountId,
      nodeId: node.nodeSeq,
      sessionId: uuidv4(),
      socket: ws,
      status: Status.OK,
    };

    this.clients.set(`${accountId}:${message.nodeName}`, client);
    this.clientBySessionId.set(client.sessionId, client);

    const result: RegisterMessageResult = {
      msgType: MessageType.RegisterResult,
      sessionId: client.sessionId,
      code: 200,
    };
    ws.send(JSON.stringify(result));
  }

  private async removeClient(client: Client) {
    this.clients.delete(`${client.accountId}:${client.nodeName}`);
    this.clientBySessionId.delete(client.sessionId);
    this.nodeService.offlineNode(client.nodeId);
  }

  private async registerClient(ws: WebSocket, message: any) {
    const registerMsg: RegisterMessage = message as RegisterMessage;
    if (registerMsg.nodeName === undefined || registerMsg.nodeName === '') {
      logger.warn('Invaild nodeName');
      const result: RegisterMessageResult = {
        msgType: MessageType.RegisterResult,
        sessionId: '',
        code: 500,
      };
      ws.send(JSON.stringify(result));
      ws.close();
      return;
    }

    if (message.apiKey === undefined || message.apiKey === '') {
      logger.warn('Invalid apiKey');
      const result: RegisterMessageResult = {
        msgType: MessageType.RegisterResult,
        sessionId: '',
        code: 500,
      };
      ws.send(JSON.stringify(result));
      ws.close();
      return;
    }

    let existingClient0: Client | undefined;
    this.clients.forEach((client) => {
      if (client.socket === ws) {
        existingClient0 = client;
      }
    });
    if (existingClient0 !== undefined) {
      logger.warn('Already registered:', existingClient0.accountId, existingClient0.nodeName);
      const result: RegisterMessageResult = {
        msgType: MessageType.RegisterResult,
        sessionId: (existingClient0 as unknown as Client).sessionId,
        code: 200,
      };
      ws.send(JSON.stringify(result));
      return;
    }

    let existingClient: Client | undefined;
    this.clients.forEach((client) => {
      if (client.apiKey === registerMsg.apiKey && client.nodeName === registerMsg.nodeName) {
        existingClient = client;
      }
    });

    if (existingClient) {
      logger.warn('Duplicate registration:', existingClient.apiKey, existingClient.nodeName);
      const offlineMsg: OfflineMessage = {
        msgType: MessageType.Offline,
        sessionId: existingClient.sessionId,
        type: 1,
        reason: 'Duplicate registration',
      };
      existingClient.socket.send(JSON.stringify(offlineMsg));
    }
    this.addNewClient(ws, registerMsg);
  }

  private async handleOfflineResult(ws: WebSocket, message: any) {
    const responseMsg: OfflineResultMessage = message as OfflineResultMessage;
    const client = this.clientBySessionId.get(responseMsg.sessionId);
    if (client === undefined) {
      logger.info(`received offline-result from unknown client.`);
    } else {
      logger.info(`received offline-result from ${client.nodeName}.`);
    }
    ws.close();
  }

  private async handleHeartbeat(ws: WebSocket, message: any) {
    const heartbeatMsg: HeartbeatMessage = message as HeartbeatMessage;
    let existingClient: Client | undefined;
    this.clients.forEach((client) => {
      if (client.socket === ws) {
        existingClient = client;
      }
    });
    if (existingClient === undefined) {
      logger.warn('Unregister client: sessionId:', heartbeatMsg.sessionId);
      const offlineMsg: OfflineMessage = {
        msgType: MessageType.Offline,
        sessionId: message.sessionId,
        type: 1,
        reason: 'Unregister client',
      };
      ws.send(JSON.stringify(offlineMsg));
      ws.close();
      return;
    }

    const client = this.clientBySessionId.get(message.sessionId);
    if (client === undefined) {
      const offlineMsg: OfflineMessage = {
        msgType: MessageType.Offline,
        sessionId: message.sessionId,
        type: 1,
        reason: 'Invaild sessionId',
      };
      ws.send(JSON.stringify(offlineMsg));
      return;
    }
    client.status = heartbeatMsg.status;
    if (client.status === Status.OK) {
      this.nodeService.onlineNode(client.nodeId);
      this.nodeService.addNodeByNodeName({
        nodeName: client.nodeName,
        nodeId: String(client.nodeId),
        accountId: String(client.accountId),
      });
    } else {
      this.nodeService.offlineNode(client.nodeId);
      this.nodeService.removeNodeByNodeName(String(client.nodeId));
    }

    const heartbeatResultMsg: HeartbeatResultMessage = {
      msgType: MessageType.HeartbeatResult,
      sessionId: heartbeatMsg.sessionId,
      time: heartbeatMsg.time,
    };
    ws.send(JSON.stringify(heartbeatResultMsg));
  }

  private async handleIncomingMessage(ws: WebSocket, message: string) {
    try {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.msgType) {
        case MessageType.Register:
          logger.info(`Received message: ${message}`);
          this.registerClient(ws, parsedMessage);
          break;
        case MessageType.Heartbeat:
          this.handleHeartbeat(ws, parsedMessage);
          break;
        case MessageType.OfflineResult:
          this.handleOfflineResult(ws, parsedMessage);
          break;
        case MessageType.CommandResult:
          break;
        default:
          logger.info(`Received unknown message type: ${parsedMessage.msgType}`);
          break;
      }
    } catch (error) {
      logger.error(`Error parsing incoming message: ${message}`, error);
    }
  }

  async createWebSocketServer(server: any) {
    const wss = new WebSocket.Server({ server, path: '/websocket' });
    wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        this.handleIncomingMessage(ws, message);
      });

      ws.on('close', () => {
        logger.info('WebSocket connection closed');
        let existingClient: Client | undefined;
        this.clients.forEach((client) => {
          if (client.socket === ws) {
            existingClient = client;
          }
        });
        if (existingClient) {
          this.removeClient(existingClient);
        }
      });
    });
  }

  async sendCommand(taskId: string, nodeId: string, request: CommandRequest): Promise<CommandResultData> {
    let existingClient: Client | undefined;
    this.clients.forEach((client) => {
      if (nodeId === String(client.nodeId)) {
        existingClient = client;
      }
    });
    if (existingClient === undefined) {
      logger.info('existingClient is undefined');
      return {
        type: 'sd',
        code: 500,
        data: {},
      };
    }

    const sessionId = existingClient.sessionId;
    const commandMsg: CommandMessage = {
      msgType: MessageType.Command,
      sessionId: sessionId,
      taskId: taskId,
      request: request,
    };
    const ws = existingClient.socket;
    if (ws) {
      return new Promise((resolve, reject) => {
        let hasResolved = false;
        const timer = setTimeout(() => {
          if (!hasResolved) {
            reject(new Error('Timeout'));
          }
        }, 180 * 1000);
        ws.send(JSON.stringify(commandMsg));

        function onMessage(event: WebSocket.MessageEvent) {
          let data: any;
          if (typeof event.data === 'string') {
            data = JSON.parse(event.data);
          } else if (event.data instanceof ArrayBuffer) {
            const buffer = new Uint8Array(event.data);
            data = JSON.parse(Buffer.from(buffer).toString());
          } else if (event.data instanceof Array) {
            const buffer = Buffer.concat(event.data);
            data = JSON.parse(buffer.toString());
          } else {
            throw new Error('Invalid message format.');
          }
          if (data.msgType === MessageType.CommandResult && data.taskId === taskId) {
            const resultMsg: CommandResultMessage = data as CommandResultMessage;
            ws.removeEventListener('message', onMessage);
            clearTimeout(timer);
            hasResolved = true;
            resolve(resultMsg.result);
          }
        }
        ws.addEventListener('message', onMessage);

        ws.once('error', (err) => {
          logger.error(err);
          ws.removeEventListener('message', onMessage);
          reject(err);
        });
      });
    } else {
      logger.info('ws is:', ws);
      return {
        type: 'sd',
        code: 500,
        data: {},
      };
    }
  }

  async isAliveNode(nodeId: string): Promise<boolean> {
    let existingClient: Client | undefined;
    this.clients.forEach((client) => {
      if (nodeId === String(client.nodeId)) {
        existingClient = client;
      }
    });
    if (existingClient === undefined) {
      return false;
    }
    return true;
  }
}
