import sdConfig from '../../config/sdConfig';
import logger from '../../utils/logger';
import { ErrorCode, SdcnError, StatusCode } from '../../utils/responseHandler';

enum Xxx2ImgType {
  kTxt,
  kImg,
}

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

function requireBool(v: unknown, defaultValue: boolean | undefined): boolean | undefined {
  if (typeof v === 'boolean') {
    return v as boolean;
  }
  return defaultValue;
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

enum ResizeMode {
  kJustResize = 0,
  kResizeAndCrop = 1,
  kResizeAndFill = 2,
}
enum ControlNetResizeMode {
  ['Just Resize'] = 0,
  ['Scale to Fit (Inner Fit)'] = 1,
  ['Envelope (Outer Fit)'] = 2,
}
// NOTE: Don't enum the following constant in ResizeMode and ControlNetResizeMode,
//   this will result in the corresponding enum name be replaced.
const kMaxResizeMode = 2;
const kMaxControlNetResizeMode = 2;

interface DictionaryLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

function convertPluginParams(gatewayParams: DictionaryLike) {
  const alwayson_scripts: DictionaryLike = {};

  if (gatewayParams.control_net && gatewayParams.control_net[0]) {
    const cnet = gatewayParams.control_net[0] as DictionaryLike;

    const cnetPreprocess = requireStringIn(cnet.preprocess, sdConfig.kValidControlNetPreprocess);
    if (!cnetPreprocess) {
      logger.error(`Invalid control net preprocess: ${cnet.preprocess}`);
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid control net preprocess');
    }

    const cnetModel = (sdConfig.kValidControlNetModels as DictionaryLike)[cnet.model];
    if (!cnetModel) {
      logger.error(`Invalid control net model: ${cnet.model}`);
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid control net model');
    }

    const cnetImage = requireString(cnet.image, undefined);
    if (!cnetImage) {
      logger.error(`Invalid control net image: ${cnet.model}`);
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Control net requires an input image');
    }

    let preprocessParam1 = undefined;
    let preprocessParam2 = undefined;
    switch (cnetPreprocess) {
      case 'canny':
        preprocessParam1 = Math.floor(requireNumberRangeOr(cnet.preprocess_param1, 0, 255, 100));
        preprocessParam2 = Math.floor(requireNumberRangeOr(cnet.preprocess_param2, 0, 255, 200));
        break;
      case 'openpose':
        break;
    }

    const resizeModeNumber = Math.floor(requireNumberRangeOr(cnet.resize_mode, 0, kMaxControlNetResizeMode, 0));
    const resizeMode = ControlNetResizeMode[resizeModeNumber];
    alwayson_scripts.ControlNet = {
      args: [
        {
          input_image: cnetImage,
          module: cnetPreprocess,
          model: cnetModel,
          weight: requireNumberRangeOr(cnet.weight, 0, 2, 1),
          resize_mode: resizeMode,
          lowvram: true,
          processor_res: 512, // The input_image will be resize to this size when processing
          threshold_a: preprocessParam1, // Additional parameters, ignored by some certain model
          threshold_b: preprocessParam2, // Additional parameters, ignored by some certain model
          // "guidance": undefined, // Don't need to set it, sd-webui will use this value as guidance_end if < 1
          guidance_start: requireNumberRangeOr(cnet.guidance_start, 0, 1, 0),
          guidance_end: requireNumberRangeOr(cnet.guidance_end, 0, 1, 1),
          guessmode: requireBool(cnet.guess_mode, false),
        },
      ],
    };
  }

  if (Object.keys(alwayson_scripts).length === 0) {
    return undefined;
  }

  return alwayson_scripts;
}

function convertInpaintParams(webuiParams: DictionaryLike, inpaintParams: DictionaryLike) {
  webuiParams.mask = requireString(inpaintParams.mask, undefined);
  if (!webuiParams.mask) {
    throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid mask in inpaint params');
  }
  webuiParams.mask_blur = Math.floor(requireNumberRangeOr(inpaintParams.mask_blur, 0, 64, 0));
  webuiParams.inpainting_fill = 0; // 0->fill, 1->original. TODO: Not sure how this parameter effects the result, thus leave it to default value now.
  webuiParams.inpainting_mask_invert = 1 - Math.floor(requireNumberRangeOr(inpaintParams.mask_mode, 0, 1, 0)); // webui's 0 and 1 are opposite to our 0 and 1
  webuiParams.inpaint_full_res = Math.floor(requireNumberRangeOr(inpaintParams.inpaint_area, 0, 1, 0));
  webuiParams.inpaint_full_res_padding = 0; // TODO: Not sure how this parameter effects the result, thus leave it to default value now.
}

// reqType:
//  0 --> txt2img
//  1 --> img2img
function gatewayParamsToWebUI_xxx2img(gatewayParams: DictionaryLike, reqType: Xxx2ImgType): DictionaryLike {
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

  webuiParams.alwayson_scripts = convertPluginParams(gatewayParams);

  if (reqType === Xxx2ImgType.kTxt) {
    if (typeof gatewayParams.upscale === 'object') {
      const upscale = gatewayParams.upscale;
      webuiParams.enable_hr = true;
      webuiParams.denoising_strength = requireNumberRangeOr(upscale.denoising_strength, 0.01, 0.99, 0.5);
      webuiParams.hr_scale = requireNumberRangeOr(upscale.scale, 1.0, 2.0, 1.0);
      webuiParams.upscaler = requireStringIn(upscale.upscaler, sdConfig.kValidUpscalers);
      if (webuiParams.upscaler === undefined) {
        throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid upscaler');
      }
    }
  } else if (reqType === Xxx2ImgType.kImg) {
    const initImg = requireString(gatewayParams.init_image, undefined);
    webuiParams.denoising_strength = requireNumberRangeOr(gatewayParams.denoising_strength, 0, 1, 0.5);
    if (initImg === undefined) {
      throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid init_image');
    }
    webuiParams.init_images = [initImg];
    webuiParams.resize_mode = Math.floor(requireNumberRangeOr(gatewayParams.resize_mode, 0, kMaxResizeMode, 0));
    if (gatewayParams.inpaint) {
      convertInpaintParams(webuiParams, gatewayParams.inpaint);
    }
  }
  return webuiParams;
}

function gatewayParamsToWebUI_interrogate(gatewayParams: DictionaryLike): DictionaryLike {
  const webuiParams = {
    image: requireString(gatewayParams.image, undefined),
    model: requireStringIn(gatewayParams.model, sdConfig.kValidInterrogateModels),
  };
  if (webuiParams.image === undefined) {
    throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid image');
  }
  if (webuiParams.model === undefined) {
    throw new SdcnError(StatusCode.BadRequest, ErrorCode.InvalidArgument, 'Invalid model');
  }
  return webuiParams;
}

export { gatewayParamsToWebUI_xxx2img, gatewayParamsToWebUI_interrogate, Xxx2ImgType };
