import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'
import { User } from 'typings/User'

/**
 * 获取用户信息
 *
 * @returns 用户信息
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
