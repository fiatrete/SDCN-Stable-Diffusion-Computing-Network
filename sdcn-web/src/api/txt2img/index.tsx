async function txt2img(params:any):Promise<string> {
  const data = {
    prompt: params.prompt,
    loras: (() => {
      const loras = [];
      if(params.lora1) { loras.push([params.lora1, params.weight1]);}
      if(params.lora2) { loras.push([params.lora2, params.weight2]);}
      return loras;
    })(),
    seed: parseInt(params.seed),
    sampler_name: params.sampler_name,
    steps: parseInt(params.steps),
    cfg_scale: parseInt(params.cfg_scale),
    width: parseInt(params.width),
    height: parseInt(params.height),
    negative_prompt: params.negative_prompt,
    model: params.model,
  }

  const response = await fetch('/txt2img', {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  const resp_json = await response.json();
  const img_data_url = resp_json.images[0];
  return 'data:image/png;base64,' + img_data_url;
}

export default txt2img;