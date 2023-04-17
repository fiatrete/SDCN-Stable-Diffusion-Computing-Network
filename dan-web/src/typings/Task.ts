export type TaskStatus = 0 | 1 | 2 | 3 // 0:pending 1:processing 2:success 3:fail

export const getTaskStatusDesc = (_s: TaskStatus) => {
  switch (_s) {
    case 0:
      return 'Pending'
    case 1:
      return 'Processing'
    case 2:
      return 'Success'
    case 3:
      return 'Failed'
    default:
      return ''
  }
}
export interface Task {
  taskId: string
  status: TaskStatus
  queuePosition: number // == 0 when status != 0
}
