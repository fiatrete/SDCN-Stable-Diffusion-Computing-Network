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
  msgtype: string;
}
interface sessionMessage extends IMessage {
  sessionId: string;
}
export interface RegisterMessage extends IMessage {
  msgtype: MessageType.Register;
  nodeName: string;
  apikey: string;
}

export interface RegisterMessageResult extends sessionMessage {
  msgtype: MessageType.RegisterResult;
  code: number;
}

export interface HeartbeatMessage extends sessionMessage {
  msgtype: MessageType.Heartbeat;
  status: number; // 0 mean webui is error，1 means webui is ok
  time: number;
}

export interface HeartbeatResultMessage extends sessionMessage {
  msgtype: MessageType.HeartbeatResult;
  time: number;
}

export interface OfflineMessage extends sessionMessage {
  msgtype: MessageType.Offline;
  type: number; // 0mean this message is from client，1 means this message is from server
  reason: string;
}

export interface OfflineResultMessage extends sessionMessage {
  msgtype: MessageType.OfflineResult;
}

export interface CommandRequest {
  type: string;
  uri: string;
  data: Record<string, unknown>;
}

export interface CommandMessage {
  msgtype: MessageType.Command;
  sessionId: string;
  request: CommandRequest;
}

export interface CommandResultData {
  type: string;
  data: Record<string, unknown>;
}

export interface CommandResultMessage {
  msgtype: MessageType.CommandResult;
  sessionId: string;
  result: CommandResultData;
}
