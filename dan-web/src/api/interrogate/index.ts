import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'

export interface InterrogateResponseData {
  caption: string
}

export async function interrogate(
  image: string,
  model: string,
): Promise<InterrogateResponseData> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<InterrogateResponseData>>(
        `${config.getBaseApiUrl()}/api/sd/interrogate`,
        {
          model,
          image,
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
          reject(new Error(`Failed: ${resp.data.code}-${resp.data.message}`))
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}
