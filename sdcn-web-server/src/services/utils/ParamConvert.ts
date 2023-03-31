import sdConfig from '../../config/sdConfig';

function requireString(v: unknown, defaultValue: string): string {
  if (typeof v === 'string') {
    return v;
  }
  return defaultValue;
}

function requireStringIn(v: unknown, list: string[]): string {
  for (let i = 0; i < list.length; ++i) {
    if (v === list[i]) {
      return v;
    }
  }
  return list[0];
}

function requireNumberRangeOr(v: unknown, min: number, max: number, defaultValue: number): number {
  if (typeof v === 'number') {
    if (v < min) {
      return min;
    }
    if (v > max) {
      return max;
    }
    return v;
  }
  return defaultValue;
}

function requireNumberRange(v: unknown, min: number, max: number): number {
  return requireNumberRangeOr(v, min, max, min);
}

function requireNumberOr(v: unknown, otherwise: number): number {
  if (typeof v === 'number') {
    return v;
  }
  return otherwise;
}

interface DictionaryLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// reqType:
//  0 --> txt2img
//  1 --> img2img
function gatewayParamsToWebUI(gatewayParams: DictionaryLike, reqType: number): [DictionaryLike?, Error?] {
  const webuiParams: DictionaryLike = {
    prompt: requireString(gatewayParams.prompt, ''),
    seed: requireNumberOr(gatewayParams.seed, -1),
    sampler_name: requireStringIn(gatewayParams.sampler_name, sdConfig.kValidSamplers),
    steps: requireNumberRange(gatewayParams.steps, 20, 60),
    cfg_scale: requireNumberRange(gatewayParams.cfg_scale, 1, 30),
    width: requireNumberRange(gatewayParams.width, 8, 1024),
    height: requireNumberRange(gatewayParams.height, 8, 1024),
    negative_prompt: requireString(gatewayParams.negative_prompt, ''),
    override_settings: {
      sd_model_checkpoint: (sdConfig.kValidModels as DictionaryLike)[gatewayParams.model],
    },
    override_settings_restore_afterwards: false,
  };

  if (!webuiParams.override_settings.sd_model_checkpoint) {
    return [undefined, Error('Invalid model')];
  }
  if (typeof gatewayParams.upscale === 'object') {
    const upscale = gatewayParams.upscale;
    webuiParams.enable_hr = true;
    webuiParams.denoising_strength = requireNumberRange(upscale.denoising_strength, 0.01, 0.99);
    webuiParams.hr_scale = requireNumberRange(upscale.scale, 1.0, 2.0);
    webuiParams.upscaler = requireStringIn(upscale.upscaler, sdConfig.kValidUpscalers);
  }

  // width and height must be multiple of 8
  webuiParams.width &= ~0x7;
  webuiParams.height &= ~0x7;

  if (gatewayParams.loras) {
    if (!Array.isArray(gatewayParams.loras)) {
      return [undefined, Error('Invalid lora param')];
    }

    for (let i = 0; i < gatewayParams.loras.length; ++i) {
      const loraParams = gatewayParams.loras[i];
      if (!Array.isArray(loraParams) || loraParams.length !== 2) {
        return [undefined, Error('Invalid lora param')];
      }
      const lora: string = (sdConfig.kValidLoras as DictionaryLike)[loraParams[0]];
      const weight: number = loraParams[1];
      if (!lora || typeof weight !== 'number') {
        return [undefined, Error('Invalid lora param')];
      }
      webuiParams.prompt += `,<lora:${lora}:${weight}>`;
    }
  }

  if (reqType === 1) {
    webuiParams.init_images = [requireString(gatewayParams.init_image, '')];
    webuiParams.denoising_strength = requireNumberRangeOr(gatewayParams.denoising_strength, 0, 1, 0.5);
  }
  return [webuiParams, undefined];
}

export { gatewayParamsToWebUI };
