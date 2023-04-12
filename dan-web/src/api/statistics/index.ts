import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'

export interface ImageGenerationStatisticsResponseData {
  totalCount: number
  countInLastWeek: number
  countInLast24Hours: number
}

export async function getImageGenerationStatistics(): Promise<ImageGenerationStatisticsResponseData> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<ImageGenerationStatisticsResponseData>>(
        `${config.getBaseApiUrl()}/api/sd/statistics`,
        {},
        {
          withCredentials: true,
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
