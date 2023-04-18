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

      existingClient.socket.once('message', function onMessage(response: string) {
        const responseMsg: OfflineResultMessage = JSON.parse(response);
        if (responseMsg.msgType === 'offline-result' && responseMsg.sessionId === existingClient?.sessionId) {
          logger.info(`received offline-result from ${registerMsg.nodeName}`);
          existingClient.socket.close();
        } else {
          logger.error(`received unexpected message: ${response}`);
        }
      });
    }
    this.addNewClient(ws, registerMsg);
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
          this.registerClient(ws, parsedMessage);
          break;
        case MessageType.Heartbeat:
          this.handleHeartbeat(ws, parsedMessage);
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
        logger.info(`Received message: ${message}`);
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

  async sendCommand(nodeId: string, request: CommandRequest): Promise<CommandResultData> {
    let existingClient: Client | undefined;
    this.clients.forEach((client) => {
      if (nodeId === String(client.nodeId)) {
        existingClient = client;
      }
    });
    if (existingClient === undefined) {
      return {
        type: 'sd',
        status: 500,
        data: {
          result: false,
        },
      };
    }

    const sessionId = existingClient.sessionId;
    const commandMsg: CommandMessage = {
      msgType: MessageType.Command,
      sessionId: sessionId,
      request: request,
    };
    const ws = existingClient.socket;
    if (ws) {
      return new Promise((resolve, reject) => {
        ws.send(JSON.stringify(commandMsg));

        ws.once('message', (data) => {
          const commandResult: CommandResultMessage = JSON.parse(data.toString()) as CommandResultMessage;
          resolve(commandResult.result);
        });

        ws.once('error', (err) => {
          logger.info(err);
          reject(err);
        });
      });
    } else {
      return {
        type: 'sd',
        status: 500,
        data: {
          result: false,
        },
      };
    }
  }
}
