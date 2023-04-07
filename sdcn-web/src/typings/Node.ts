import { User } from './User'

export interface Node {
  nodeId: number // 数据库表ID
  account: User
  status: NodeStatus
  taskHandlerCount: number
  worker?: string // Worker URL
}

export enum NodeStatus {
  Online = 1,
  Offline = 2,
  Processing = 3,
}

export interface Donor {
  account: User
  nodeCount: number
  taskHandlerCount: number
}
