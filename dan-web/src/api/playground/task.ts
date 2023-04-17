import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'
import { Task } from 'typings/Task'

export interface TaskResponseData extends Task {
  images: string[]
}

/**
 * Get the Task Status
 *
 * @param taskId TASK ID
 * @returns Task Status
 */
export async function getTaskStatus(taskId: string): Promise<TaskResponseData> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<TaskResponseData>>(
        `${config.getBaseApiUrl()}/api/sd/task/status`,
        {
          taskId,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${config.getApiKey()}`,
          },
        },
      )
      .then((resp) => {
        if (resp.data.code === config.getSuccessCode()) {
          resolve(resp.data.data)
        } else {
          reject(new Error(`Failed: ${resp.data.code}`))
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}
