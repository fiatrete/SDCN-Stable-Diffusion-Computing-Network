import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'
import { Donor, Node } from 'typings/Node'

export interface NodesResponseData {
  items: Node[]
  page: number
  pageSize: number
  totalSize: number
  totalPages: number
}

/**
 * 获取Nodes列表
 *
 * @param pageNo 页码
 * @param pageSize 每页数量
 * @param status 0-全部 1-正在运行的
 * @returns Nodes列表
 */
export async function nodes(
  pageNo: number,
  pageSize = 10,
  status: 0 | 1 = 0,
): Promise<NodesResponseData> {
  return new Promise((resolve, reject) => {
    axios
      .get<ApiResponse<NodesResponseData>>(
        `${config.getBaseApiUrl()}/api/node`,
        {
          params: {
            status,
            pageNo,
            pageSize,
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

export interface DonorsResponseData {
  items: Donor[]
  page: number
  pageSize: number
  totalSize: number
  totalPages: number
}

/**
 * 获取Donors列表
 *
 * @param pageNo 页码
 * @param pageSize 每页数量
 * @returns Nodes列表
 */
export async function donors(
  pageNo: number,
  pageSize = 10,
): Promise<DonorsResponseData> {
  return new Promise((resolve, reject) => {
    axios
      .get<ApiResponse<DonorsResponseData>>(
        `${config.getBaseApiUrl()}/api/list-by-task`,
        {
          params: {
            pageNo,
            pageSize,
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

/**
 * 获取我的Nodes列表
 *
 * @param pageNo 页码
 * @param pageSize 每页数量
 * @param status 0-全部 1-正在运行的
 * @returns Nodes列表
 */
export async function myNodes(
  pageNo: number,
  pageSize = 10,
): Promise<NodesResponseData> {
  return new Promise((resolve, reject) => {
    axios
      .get<ApiResponse<NodesResponseData>>(
        `${config.getBaseApiUrl()}/api/mine/node`,
        {
          params: {
            status,
            pageNo,
            pageSize,
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
