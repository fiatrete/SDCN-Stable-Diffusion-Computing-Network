import config from 'api/config'
import { ApiResponse } from 'typings/ApiResponse'
import axios from 'axios'
import { Task } from 'typings/Task'

export interface Img2imgParams {
  init_image: string
  denoising_strength: number
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
  inpaint?: {
    mask: string
    mask_blur: number // [0, 64], default 0
    mask_mode: 0 | 1
    inpaint_area: 0 | 1
  }
}

export async function img2imgAsync(params: Img2imgParams): Promise<Task> {
  const data = {
    init_image: params.init_image,
    denoising_strength: params.denoising_strength,
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
    inpaint: params.inpaint,
  }

  return new Promise((resolve, reject) => {
    axios
      .post<ApiResponse<Task>>(
        `${config.getBaseApiUrl()}/api/sd/img2img/async`,
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
          reject(new Error(`Failed: ${resp.data.code}-${resp.data.message}`))
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}
