import sdConfig from '../../config/sdConfig';
import { ErrorCode, SdcnError, StatusCode } from '../../utils/responseHandler';

function requireString(v: unknown, defaultValue: string | undefined): string | undefined {
  if (typeof v === 'string') {
    return v as string;
  }
  return defaultValue;
}

function requireStringIn(v: unknown, list: string[]): string | undefined {
  for (let i = 0; i < list.length; ++i) {
    if (v === list[i]) {
      return v;
    }
  }
  return undefined;
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
function gatewayParamsToWebUI_xxx2img(gatewayParams: DictionaryLike, reqType: number): DictionaryLike {
  const webuiParams: DictionaryLike = {
    prompt: requireString(gatewayParams.prompt, undefined),
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
  if (webuiParams.prompt === undefined) {
    throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid prompt');
  }
  if (webuiParams.sampler_name === undefined) {
    throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid sampler_name');
  }

  if (!webuiParams.override_settings.sd_model_checkpoint) {
    throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid model');
  }
  if (reqType === 0 && typeof gatewayParams.upscale === 'object') {
    const upscale = gatewayParams.upscale;
    webuiParams.enable_hr = true;
    webuiParams.denoising_strength = requireNumberRangeOr(upscale.denoising_strength, 0.01, 0.99, 0.5);
    webuiParams.hr_scale = requireNumberRangeOr(upscale.scale, 1.0, 2.0, 1.0);
    webuiParams.upscaler = requireStringIn(upscale.upscaler, sdConfig.kValidUpscalers);
    if (webuiParams.upscaler === undefined) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid upscaler');
    }
  }

  // width and height must be multiple of 8
  webuiParams.width &= ~0x7;
  webuiParams.height &= ~0x7;

  if (gatewayParams.loras) {
    if (!Array.isArray(gatewayParams.loras)) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'nvalid lora');
    }

    for (let i = 0; i < gatewayParams.loras.length; ++i) {
      const loraParams = gatewayParams.loras[i];
      if (!Array.isArray(loraParams) || loraParams.length !== 2) {
        throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'nvalid lora');
      }
      const lora: string = (sdConfig.kValidLoras as DictionaryLike)[loraParams[0]];
      const weight: number = loraParams[1];
      if (!lora || typeof weight !== 'number') {
        throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'nvalid lora');
      }
      webuiParams.prompt += `,<lora:${lora}:${weight}>`;
    }
  }

  if (reqType === 1) {
    const initImg = requireString(gatewayParams.init_image, undefined);
    webuiParams.denoising_strength = requireNumberRangeOr(gatewayParams.denoising_strength, 0, 1, 0.5);
    if (initImg === undefined) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid init_image');
    }
    webuiParams.init_images = [initImg];
  }
  return webuiParams;
}

function gatewayParamsToWebUI_interrogate(gatewayParams: DictionaryLike): DictionaryLike {
  const webuiParams = {
    image: requireString(gatewayParams.image, undefined),
    model: requireStringIn(gatewayParams.model, sdConfig.kValidInterrogateModel),
  };
  if (webuiParams.image === undefined) {
    throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid image');
  }
  if (webuiParams.model === undefined) {
    throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid model');
  }
  return webuiParams;
}

export { gatewayParamsToWebUI_xxx2img, gatewayParamsToWebUI_interrogate };
