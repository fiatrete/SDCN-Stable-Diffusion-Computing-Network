import { User } from './User'

export interface Node {
  nodeId: number
  account: User
  status: NodeStatus
  taskHandlerCount: number
  nodeName?: string
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
