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
 * Get Nodes List
 *
 * @param pageNo pageNo
 * @param pageSize pageSize
 * @param status 0-ALL 1-RUNNING
 * @returns Nodes List
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
          withCredentials: true,
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

export interface DonorsResponseData {
  items: Donor[]
  pageNo: number
  pageSize: number
  totalSize: number
  totalPages: number
}

/**
 * Get Donors List
 *
 * @param pageNo pageNo
 * @param pageSize pageSize
 * @returns Donors List
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
          withCredentials: true,
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

/**
 * Get My Nodes List
 *
 * @param pageNo pageNo
 * @param pageSize pageSize
 * @returns My Nodes List
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
          withCredentials: true,
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

/**
 * Donate Node
 *
 * @param worker Worker URL
 * @returns Node Info
 */
export async function donateNode(worker: string): Promise<Node> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Node>>(
        `${config.getBaseApiUrl()}/api/node/donate`,
        {
          worker,
        },
        {
          withCredentials: true,
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

/**
 * Revoke Node
 *
 * @param nodeId NODE ID
 * @returns Node Info
 */
export async function revokeNode(nodeId: number): Promise<Node> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Node>>(
        `${config.getBaseApiUrl()}/api/node/revoke`,
        {
          nodeId,
        },
        {
          withCredentials: true,
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

/**
 * Launch Node
 *
 * @param nodeId NODE ID
 * @returns Node Info
 */
export async function launchNode(nodeId: number): Promise<Node> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Node>>(
        `${config.getBaseApiUrl()}/api/node/launch`,
        {
          nodeId,
        },
        {
          withCredentials: true,
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

/**
 * Stop Node
 *
 * @param nodeId NODE ID
 * @returns Node Info
 */
export async function stopNode(nodeId: number): Promise<Node> {
  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Node>>(
        `${config.getBaseApiUrl()}/api/node/stop`,
        {
          nodeId,
        },
        {
          withCredentials: true,
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
