import { Account } from './Account'

export interface Node {
  nodeId: string // 数据库表ID
  nodeSeq: string // 序号(显示为NodeID)
  account: Account
  status: NodeStatus
  taskHandlerCount: number
}

export enum NodeStatus {
  Online = 1,
  Offline = 2,
  Processing = 3,
}

export interface Donor {
  account: Account
  nodeCount: number
  taskHandlerCount: number
}
