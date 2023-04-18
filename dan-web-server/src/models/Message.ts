export enum MessageType {
  Register = 'register',
  RegisterResult = 'register-result',
  Heartbeat = 'heartbeat',
  HeartbeatResult = 'heartbeat-result',
  Offline = 'offline',
  OfflineResult = 'offline-result',
  Command = 'command',
  CommandResult = 'command-result',
}

interface IMessage {
  msgType: string;
}
interface sessionMessage extends IMessage {
  sessionId: string;
}
export interface RegisterMessage extends IMessage {
  msgType: MessageType.Register;
  nodeName: string;
  apiKey: string;
}

export interface RegisterMessageResult extends sessionMessage {
  msgType: MessageType.RegisterResult;
  code: number;
}

export interface HeartbeatMessage extends sessionMessage {
  msgType: MessageType.Heartbeat;
  status: number; // 0 mean webui is error，1 means webui is ok
  time: number;
}

export interface HeartbeatResultMessage extends sessionMessage {
  msgType: MessageType.HeartbeatResult;
  time: number;
}

export interface OfflineMessage extends sessionMessage {
  msgType: MessageType.Offline;
  type: number; // 0mean this message is from client，1 means this message is from server
  reason: string;
}

export interface OfflineResultMessage extends sessionMessage {
  msgType: MessageType.OfflineResult;
}

export interface CommandRequest {
  type: string;
  uri: string;
  data: any;
}

export interface CommandMessage {
  msgType: MessageType.Command;
  sessionId: string;
  request: CommandRequest;
}

export interface CommandResultData {
  type: string;
  status: number;
  data: any;
}

export interface CommandResultImageData {
  images: string;
}

export interface CommandResultMessage {
  msgType: MessageType.CommandResult;
  sessionId: string;
  result: CommandResultData;
}
