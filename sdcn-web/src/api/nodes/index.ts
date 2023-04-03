import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'
import { Donor, Node } from 'typings/Node'

export interface NodesResponseData {
  items: Node[]
  pageNo: number
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
  type: 0 | 1 = 0,
): Promise<NodesResponseData> {
  return new Promise((resolve, reject) => {
    axios
      .get<ApiResponse<NodesResponseData>>(
        `${config.getBaseApiUrl()}/api/node`,
        {
          params: {
            type,
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
  pageNo: number
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
        `${config.getBaseApiUrl()}/api/user/list-by-task`,
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
        `${config.getBaseApiUrl()}/api/node/mine`,
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
 * Donate Node
 *
 * @param worker Worker URL
 * @returns Node Info
 */
export async function donateNode(worker: string): Promise<Node> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Node>>(`${config.getBaseApiUrl()}/api/node/donate`, {
        worker,
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

/**
 * Revoke Node
 *
 * @param nodeId 节点ID
 * @returns Node Info
 */
export async function revokeNode(nodeId: number): Promise<Node> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Node>>(`${config.getBaseApiUrl()}/api/node/revoke`, {
        nodeId,
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

/**
 * Launch Node
 *
 * @param nodeId 节点ID
 * @returns Node Info
 */
export async function launchNode(nodeId: number): Promise<Node> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Node>>(`${config.getBaseApiUrl()}/api/node/launch`, {
        nodeId,
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

/**
 * Stop Node
 *
 * @param nodeId 节点ID
 * @returns Node Info
 */
export async function stopNode(nodeId: number): Promise<Node> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Node>>(`${config.getBaseApiUrl()}/api/node/stop`, {
        nodeId,
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
