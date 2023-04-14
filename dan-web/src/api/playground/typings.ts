export type TaskStatus = 0 | 1 | 2 | 3 // 0:pending 1:processing 2:success 3:fail

export interface TaskResult {
  taskId: string
  status: TaskStatus
  queuePosition: number // == 0 when status != 0
  images: string[]
}

export interface Task {
  taskId: string
  queuePosition: number
}
