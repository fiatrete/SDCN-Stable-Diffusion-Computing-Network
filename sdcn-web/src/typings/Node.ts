export interface Node {
  nodeId: string
  donor: string
  tasksHandled: number
  status: NodeStatus
}

export enum NodeStatus {
  Online = 1,
  Offline = 2,
  Processing = 3,
}
