export type TaskStatus = 0 | 1 | 2 | 3 // 0:pending 1:processing 2:success 3:fail

export interface Task {
  taskId: string
  status: TaskStatus
  queuePosition: number // == 0 when status != 0
}
