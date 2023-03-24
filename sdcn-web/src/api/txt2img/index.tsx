export interface txt2imgParams {
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

export async function txt2img(params: txt2imgParams): Promise<string> {
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

  const response = await fetch('/txt2img', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  })
  const resp_json = await response.json()
  const img_data_url = resp_json.images[0]
  return 'data:image/png;base64,' + img_data_url
}
