import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'
import { Task } from './typings'

export interface Txt2imgParams {
  prompt: string
  lora1: string
  weight1: number
  lora2: string
  weight2: number
  seed: number
  sampler_name: string
  steps: number
  cfg_scale: number
  width: number
  height: number
  negative_prompt: string
  model: string
}

export async function txt2imgAsync(params: Txt2imgParams): Promise<Task> {
  const data = {
    prompt: params.prompt,
    loras: (() => {
      const loras = []
      if (params.lora1) {
        loras.push([params.lora1, params.weight1])
      }
      if (params.lora2) {
        loras.push([params.lora2, params.weight2])
      }
      return loras
    })(),
    seed: params.seed,
    sampler_name: params.sampler_name,
    steps: params.steps,
    cfg_scale: params.cfg_scale,
    width: params.width,
    height: params.height,
    negative_prompt: params.negative_prompt,
    model: params.model,
  }

  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Task>>(
        `${config.getBaseApiUrl()}/api/sd/txt2img/async`,
        data,
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
