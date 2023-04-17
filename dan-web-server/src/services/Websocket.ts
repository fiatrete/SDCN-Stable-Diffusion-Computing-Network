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

  async addNewClient(ws: WebSocket, message: RegisterMessage) {
    const accountId = await this.userRepository.getAccountIdByApiKey(message.apikey);
    if (accountId === undefined || accountId === null) {
      logger.error('Invalid apiKey');
      const result: RegisterMessageResult = {
        msgtype: MessageType.RegisterResult,
        sessionId: '',
        code: 500,
      };
      ws.send(JSON.stringify(result));
      return;
    }
    logger.info('accountId:', accountId);

    const node = await this.nodeService.getOrCreateNodeByNodeName(message.nodeName, String(accountId), true);
    if (node === undefined) {
      const result: RegisterMessageResult = {
        msgtype: MessageType.RegisterResult,
        sessionId: '',
        code: 500,
      };
      ws.send(JSON.stringify(result));
      return;
    }
    const client: Client = {
      nodeName: message.nodeName,
      apiKey: message.apikey,
      accountId: accountId,
      nodeId: node.nodeSeq,
      sessionId: uuidv4(),
      socket: ws,
      status: Status.OK,
    };

    this.clients.set(`${accountId}:${message.nodeName}`, client);
    this.clientBySessionId.set(client.sessionId, client);

    const result: RegisterMessageResult = {
      msgtype: MessageType.RegisterResult,
      sessionId: client.sessionId,
      code: 200,
    };
    ws.send(JSON.stringify(result));
  }

  async removeClient(client: Client) {
    this.clients.delete(`${client.accountId}:${client.nodeName}`);
    this.clientBySessionId.delete(client.sessionId);
    this.nodeService.offlineNode(client.nodeId);
  }

  async registerClient(ws: WebSocket, message: any) {
    const registerMsg: RegisterMessage = message as RegisterMessage;
    if (registerMsg.nodeName === '') {
      const result: RegisterMessageResult = {
        msgtype: MessageType.RegisterResult,
        sessionId: '',
        code: 500,
      };
      ws.send(JSON.stringify(result));
      return;
    }

    let existingClient0: Client | undefined;
    this.clients.forEach((client) => {
      if (client.socket === ws) {
        existingClient0 = client;
      }
    });
    if (existingClient0 !== undefined) {
      const result: RegisterMessageResult = {
        msgtype: MessageType.RegisterResult,
        sessionId: (existingClient0 as unknown as Client).sessionId,
        code: 200,
      };
      ws.send(JSON.stringify(result));
      return;
    }

    let existingClient: Client | undefined;
    this.clients.forEach((client) => {
      if (client.apiKey === registerMsg.apikey && client.nodeName === registerMsg.nodeName) {
        existingClient = client;
      }
    });

    if (existingClient) {
      const offlineMsg: OfflineMessage = {
        msgtype: MessageType.Offline,
        sessionId: existingClient.sessionId,
        type: 1,
        reason: 'duplicate registration',
      };
      existingClient.socket.send(JSON.stringify(offlineMsg));

      existingClient.socket.once('message', function onMessage(response: string) {
        const responseMsg: OfflineResultMessage = JSON.parse(response);
        if (responseMsg.msgtype === 'offline-result' && responseMsg.sessionId === existingClient?.sessionId) {
          logger.info(`received offline-result from ${registerMsg.nodeName}`);
          existingClient.socket.close();
        } else {
          logger.error(`received unexpected message: ${response}`);
        }
      });
    }
    this.addNewClient(ws, registerMsg);
  }

  async handleHeartbeat(ws: WebSocket, message: any) {
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
        msgtype: MessageType.Offline,
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
        msgtype: MessageType.Offline,
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
    } else {
      this.nodeService.offlineNode(client.nodeId);
    }

    const heartbeatResultMsg: HeartbeatResultMessage = {
      msgtype: MessageType.HeartbeatResult,
      sessionId: heartbeatMsg.sessionId,
      time: heartbeatMsg.time,
    };
    ws.send(JSON.stringify(heartbeatResultMsg));
  }

  async handleIncomingMessage(ws: WebSocket, message: string) {
    try {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.msgtype) {
        case MessageType.Register:
          this.registerClient(ws, parsedMessage);
          break;
        case MessageType.Heartbeat:
          this.handleHeartbeat(ws, parsedMessage);
          break;
        default:
          logger.info(`Received unknown message type: ${parsedMessage.msgtype}`);
          break;
      }
    } catch (error) {
      logger.error(`Error parsing incoming message: ${message}`, error);
    }
  }

  async createWebSocketServer(server: any) {
    const wss = new WebSocket.Server({ server, path: '/websocket' });
    wss.on('connection', (ws) => {
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

  async sendCommand(key: string, request: CommandRequest, callback: (result: CommandResultData) => void) {
    const client = this.clients.get(key);
    if (client === undefined) {
      // const
      // callback();
      return;
    }
    const sessionId = client.sessionId;
    const commandMsg: CommandMessage = {
      msgtype: MessageType.Command,
      sessionId: client.sessionId,
      request: request,
    };

    const ws = client.socket;
    if (ws) {
      ws.send(JSON.stringify(commandMsg));

      ws.onmessage = function (event) {
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

        if (data.msgtype === MessageType.CommandResult && data.sessionId === sessionId) {
          const resultMsg: CommandResultMessage = data as CommandResultMessage;
          callback(resultMsg.result);
        }
      };
    }
  }
}
