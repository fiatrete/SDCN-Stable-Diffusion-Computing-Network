import axios from 'axios'

import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'

export interface ModelInfos {
  Models: {
    name: string
    hash: string
  }[]
  LoRAs: {
    name: string
    hash: string
  }[]
  Samplers: string[]
}

export async function getSupportedModelInfo(): Promise<ModelInfos> {
  return new Promise((resolve, reject) => {
    axios
      .get<ApiResponse<ModelInfos>>(
        `${config.getBaseApiUrl()}/api/sd/supportedModelInfo`,
      )
      .then((resp) => {
        if (resp.data.code === config.getSuccessCode()) {
          resolve(resp.data.data)
        } else {
          reject(new Error(`Failed: ${resp.data.code}-${resp.data.message}`))
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}
