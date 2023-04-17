import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'
import { User } from 'typings/User'

/**
 * Get User Info
 *
 * @returns User Info
 */
export async function userInfo(): Promise<User> {
  return new Promise((resolve, reject) => {
    axios
      .get<ApiResponse<User>>(`${config.getBaseApiUrl()}/api/user/info`, {
        params: {},
        withCredentials: true,
      })
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

interface PresentHonorResponseData {
  success: boolean
}

/**
 * Present ${amount} honors to ${uid}
 * Administrators only
 */
export async function presentHonor(
  uid: string,
  amount: number,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<PresentHonorResponseData>>(
        `${config.getBaseApiUrl()}/api/wallet/present-honor`,
        {
          userId: uid,
          amount,
        },
        {
          withCredentials: true,
        },
      )
      .then((resp) => {
        if (resp.data.code === config.getSuccessCode()) {
          resolve(resp.data.data.success)
        } else {
          reject(new Error(`Failed: ${resp.data.code}`))
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}

interface UpdatePublicApiKeyResponseData {
  apiKey: string
}

export async function updatePublicApiKey(): Promise<string> {
  return new Promise((resolve, reject) => {
    axios
      .get<ApiResponse<UpdatePublicApiKeyResponseData>>(
        `${config.getBaseApiUrl()}/api/user/public-api-key`,
        {
          params: {},
          withCredentials: true,
        },
      )
      .then((resp) => {
        if (resp.data.code === config.getSuccessCode()) {
          resolve(resp.data.data.apiKey)
        } else {
          reject(new Error(`Failed: ${resp.data.code}`))
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}
