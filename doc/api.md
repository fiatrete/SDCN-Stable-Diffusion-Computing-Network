[TOC]

# API Reference Introduction
The reference is your key to a comprehensive understanding of the DAN API.


## Conventions

The base URL to send all API requests is
``` 
https://api.opendan.ai 
```

HTTPS is required for all API requests.

The DAN API follows RESTful conventions when possible, with most operations performed via GET, POST, PATCH, and DELETE requests on page and database resources. Request and response bodies are encoded as JSON.

At present, only HTTP requests are supported to complete image generation tasks.

The APIs has similar respones.

On success, dan server will response http `status code` 200 and an object in JSON as below:

```JSON
{
    "code": 200,
    "data": `The returned object`,
    "message": "success"
}
```

On failure, dan server will response a non-ok http `status code` (i.e. not 200, may be 401 for an example) and an object JSON as below:

```JSON
{
    "code": `Error code`,
    "message": `A string describe the error`
}
```

## Supported list values
Under rapid expansion, please stay tuned.

### Models
| Name | Value | Ref | Download |
| --- | --- | ---| ---|
| chillout_mix | 3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401 | [link to civitai](https://civitai.com/models/6424/chilloutmix) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/chilloutmix_NiPrunedFp32Fix.safetensors)
| clarity | 627a6f5c8bf7669d4a224ac041d527debc65d2d435b16e54ead8ee2c901d1634 |[link to civitai](https://civitai.com/models/5062/clarity) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/clarity.safetensors)|
| anything-v4.5-pruned | 6e430eb51421ce5bf18f04e2dbe90b2cad437311948be4ef8c33658a73c86b2a | [link to huggingface](https://huggingface.co/andite/anything-v4.0) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/anything-v4.5-pruned.safetensors)|



### LoRa

| Name | Value | Ref| Download |
| --- | --- | --- | --- |
| koreanDollLikeness_v10 | 62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c| [link to civitai](https://civitai.com/models/19356/koreandolllikenessv10) |[download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/koreandolllikeness_V10.safetensors)|
| stLouisLuxuriousWheels_v1 | f1efd7b748634120b70343bc3c3b425c06c51548431a1264a2fcb5368352349f | [link to civitai](https://civitai.com/models/6669/st-louis-luxurious-wheels-azur-lane) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/stLouisLuxuriousWheels_v1.safetensors) |
| taiwanDollLikeness_v10 | 5bbaabc04553d5821a3a45e4de5a02b2e66ecb00da677dd8ae862efd8ba59050 | [link to civitai](https://civitai.com/models/17497/taiwan-doll-likeness) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/taiwanDollLikeness_v10.safetensors) |
| kobeni_v10 | 3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac | [link to civitai](https://civitai.com/models/6679/kobeni) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/kobeni_v10.safetensors) |
| thickerLinesAnimeStyle_loraVersion | 759d6fdf539f44f6991efd27ef1767c7779ac8884defc71dd909e5808b5ea74b | [link to civitai](https://civitai.com/models/13910/thicker-lines-anime-style-lora-mix) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/thickerLinesAnimeStyle_loraVersion.safetensors) |



### Samplers
- DPM++ SDE Karras
- Euler a
- Euler
- DPM++ SDE
- LMS
- DDIM

## API

All API calls are implemented in the form of `HTTP POST` with header `Content-Type: application/json`.

### txt2img

For `txt2img` tasks, the url path is:

```
/api/sd/txt2img
```

And all the parameters are listed below:

| Parameter | Type | Description |
| --- | --- | --- |
| prompt | string | A positive prompt that describes what you want the image to be |
| negative_prompt | string | A negative prompt that describes what you don't want in the image |
| loras | array | A list of LoRAs to be applied and their weights. |
| seed | integer | -1 for a random seed |
| sampler_name | string | The name of the sampling algorithm used |
| steps | integer | Number of inference steps |
| cfg_scale | integer | A classifier-free guidance scale; smaller values result in higher quality images, and larger values yield images closer to the provided prompt |
| width | integer | The desired width of the resulting image |
| height | integer | The desired height of the resulting image |
| model | string | The model used to generate the image |
| upscale | object | Optional, add it if you want to upscale the result |
| upscale.denoising_strength | float | Controls the level of denoising; smaller values yield results that are closer to the original generated image, but may be blurry; larger values may lead the output looks different from the original generated image and may looks strange. Valid range is [0, 1], but I recomment you make it between 0.4 and 0.6. |
| upscale.scale | float | The upscale rate. Valid range is (1.0, 2.0] |
| upscale.upscaler | string | The upscaler algorithm name |
| control_net | array | Optional, an array of `control net` parameters. But currently only up to 1 control net is supported, if you specify more than 1 set of paramters, the rest (i.e. not the first one) will be ignored. |
| control_net[i].image | string | The reference image file, encoded in base64 |
| control_net[i].preprocess | string | How the reference image should be preprocessed, you can specify the preprocess method name. Valid options are: `canny` and `openopse` |
| control_net[i].model | string | The control net model. Valid options are: `sd15_canny` and `sd15_openpose` |
| control_net[i].preprocess_param1 | unknown | Optional. Some control net model (e.g. `sd15_canny`) requires parameters, this is the first parameter. For detail, see the table below. If you don't known what to fill in here, just leave it undefined. |
| control_net[i].preprocess_param2 | unknown | Optional. Some control net model (e.g. `sd15_canny`) requires parameters, this is the second parameter. For detail, see the table below. If you don't known what to fill in here, just leave it undefined. |
| control_net[i].weight | number | Before merging control net into the main SD model, all weights will be scaled by this value. Valid range is [0, 2], default value is 1. |
| control_net[i].resize_mode | number | 0 means `just resize`, 1 means `resize and crop`, 2 means `resize and fill`, otherwise use default value: 0 |
| control_net[i].guidance_start | number | The control net will be applied in [guidance_start, guidance_end] percents inference steps. Valid range is [0, 1], default: 0. |
| control_net[i].guidance_end | number | The control net will be applied in [guidance_start, guidance_end] percents inference steps. Valid range is [0, 1], default: 1. |
| control_net[i].guessmode | bool | Optional. Default: false. If true, you can just remove all prompts, and then the control net encoder will recognize the content of the input control map. For this mode, we recommend to use 50 steps and guidance scale between 3 and 5. |

Control net preprocess parameters:

| Control net model | Parameter | Type |  Description |
| --- | --- | --- | --- |
| sd15_canny | preprocess_param1 | number | The first threshold of canny algorithm. For more information, see [opencv doc](https://docs.opencv.org/3.4/da/d22/tutorial_py_canny.html) |
| sd15_canny | preprocess_param2 | number | The first threshold of canny algorithm. For more information, see [opencv doc](https://docs.opencv.org/3.4/da/d22/tutorial_py_canny.html) |
| sd15_openpose | preprocess_param1 | Ignored | Ignored |
| sd15_openpose | preprocess_param2 | Ignored | Ignored |

The following is an example:

```
{
    "prompt": "A dog",
    "loras": [
        ["XXXXXXXX", 0.5],
        ["XXXXXXXX", 0.6]
    ],
    "seed": -1,
    "sampler_name": "DDIM",
    "steps": 20,
    "cfg_scale": 7,
    "width": 512,
    "height": 512,
    "negative_prompt": "",
    "model": "XXXXXXXX",
    "upscale": {
        "denoising_strength": 0.5,
        "scale": 2,
        "upscaler": "Latent",
    },
    "control_net": [
        {
            "image": "string",
            "preprocess": "canny",
            "model": "sd15_canny",
            "preprocess_param1": 100,
            "preprocess_param2": 200,
            "weight": 1,
            "resize_mode": 2,
            "guidance_start": 0,
            "guidance_end": 1,
            "guessmode": False
        }
    ]
}

```

On success, the response should something like:

```JSON
{
    "code": 200,
    "data": {
        "images": [
            "string of base 64 encoded png file"
        ]
    },
    "message": "success"
}
```

### txt2img-async

For `txt2img` tasks, there is an asynchronous version. The url path is:

```
/api/sd/txt2img/async
```

The parameters are exactly the same as `txt2img`. See [txt2img](#txt2img).

On success, the response should something like:

```JSON
{
    "code": 200,
    "data": {
        "status": 0,
        "taskId": "803f1804-c79b-4c33-afd2-0d054076dea9",
        "queuePosition": 1
    },
    "message": "success"
}
```

After this call, you can use [task status](#task-status) API to query the progress or the final result.

### img2img

For `img2img` tasks, the url path is:

```
/api/sd/img2img
```

And all the parameters are listed below:

| Parameter | Type | Description |
| --- | --- | --- |
| init_image | string | The base64-encoded string of your original image |
| resize_mode | number | 0 means `just resize`, 1 means `resize and crop`, 2 means `resize and fill`, otherwise use default value: 0. |
| denoising_strength | float | Controls the level of denoising; smaller values yield results that are closer to the original image. Valid range is [0, 1] |
| prompt | string | A positive prompt that describes what you want in the resulting image |
| negative_prompt | string | A negative prompt that describes what you don't want in the resulting image |
| loras | array | A list of LoRAs to be applied and their weights. |
| seed | integer | -1 for a random seed |
| sampler_name | string | The name of the sampling algorithm used |
| steps | integer | Number of inference steps |
| cfg_scale | integer | A classifier-free guidance scale; smaller values result in higher quality images, and larger values yield images closer to the provided prompt |
| width | integer | The desired width of the resulting image |
| height | integer | The desired height of the resulting image |
| model | string | The model (weights) used to generate the image |
| inpaint | object | If you want to regenerate part of your image, this will be what you want. |
| inpaint.mask | string | This is a base64 encoded image of a mask which defined where you want to regenerate. |
| inpaint.mask_blur | number | Before regenerating, the image and mask will be gaussian blured by this radius. Valid range is [0, 64], default 0. |
| inpaint.mask_mode | number | 0 means regenerate where is masked; 1 means regenerate where is not masked.  |
| inpaint.inpaint_area | number | 0 means regenerate whole image, then paste corresponding area back. 1 means only the masked area will be regenereate, then paste corresponding area back. |
| control_net | array | See [txt2img](#txt2img). |

Here is an example JSON object with these parameters:

```
{
    "init_image": "string",
    "denoising_strength": 0.55,
    "prompt": "A dog",
    "loras": [
        ["XXXXXXXX", 0.5],
        ["XXXXXXXX", 0.6]
    ],
    "seed": -1,
    "sampler_name": "DDIM",
    "steps": 20,
    "cfg_scale": 7,
    "width": 512,
    "height": 512,
    "negative_prompt": "",
    "model": "XXXXXXXX",
    "control_net": [
        {
            "image": "string",
            "preprocess": "canny",
            "model": "sd15_canny",
            "preprocess_param1": 100,
            "preprocess_param2": 200,
            "weight": 1,
            "resize_mode": 2,
            "guidance_start": 0,
            "guidance_end": 1,
            "guessmode": False
        }
    ]
}

```

On success, the response should something like:

```JSON
{
    "code": 200,
    "data": {
        "images": [
            "string of base 64 encoded png file"
        ]
    },
    "message": "success"
}
```

### img2img-async

For `img2img` tasks, there is an asynchronous version. The url path is:

```
/api/sd/img2img/async
```

The parameters are exactly the same as `img2img`. See [img2img](#img2img).

On success, the response should something like:

```JSON
{
    "code": 200,
    "data": {
        "status": 0,
        "taskId": "803f1804-c79b-4c33-afd2-0d054076dea9",
        "queuePosition": 1
    },
    "message": "success"
}
```

After this call, you can use [task status](#task-status) API to query the progress or the final result.

### interrogate
For `interrogate` tasks, the url path is:

```
/api/sd/interrogate
```

Interrogate tasks will generate a description for an input image. The parameters for interrogate tasks are listed below:

| Parameter | Type | Description |
| --- | --- | --- |
| image | string | The base64-encoded string of your input image |
| model | string | The model name used to describe the image, avalaible options are `clip` and `deepdanbooru` |

Here is an example JSON object with these parameters:

```
{
    "image": "string",
    "model": "clip"
}
```

On success, the response should something like:

```JSON
{
    "code": 200,
    "data": {
        "caption": "The scription"
    },
    "message": "success"
}
```

### task status

For those asynchronous tasks (e.g. txt2img-async and img2img-async), the API call returns a `taskId` instead of the final result.

To get the `status` or the final result, you can use `task-status` API.

The http url path is:

```
/api/sd/task/status
```

The parameters a listed below:

| Parameter | Type | Description |
| --- | --- | --- |
| taskId | string | The task id returned by asynchronous API, which is the task you care about. |

Here is an example JSON object with these parameters:

```
{
    "taskId": "803f1804-c79b-4c33-afd2-0d054076dea9"
}
```

On success, the response should something like:

```JSON
{
    "code": 200,
    "data": {
        "taskId": "803f1804-c79b-4c33-afd2-0d054076dea9",
        "status": 2,
        "queuePosition": 0,
        "images": [
            "string of base 64 encoded png file"
        ]
    },
    "message": "success"
}
```
