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
| loras | Array | A list of LoRAs to be applied and their weights. |
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
    }
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

### img2img

For `img2img` tasks, the url path is:

```
/api/sd/img2img
```

And all the parameters are listed below:

| Parameter | Type | Description |
| --- | --- | --- |
| init_image | string | The base64-encoded string of your original image |
| denoising_strength | float | Controls the level of denoising; smaller values yield results that are closer to the original image. Valid range is [0, 1] |
| prompt | string | A positive prompt that describes what you want in the resulting image |
| negative_prompt | string | A negative prompt that describes what you don't want in the resulting image |
| loras | Array | A list of LoRAs to be applied and their weights. |
| seed | integer | -1 for a random seed |
| sampler_name | string | The name of the sampling algorithm used |
| steps | integer | Number of inference steps |
| cfg_scale | integer | A classifier-free guidance scale; smaller values result in higher quality images, and larger values yield images closer to the provided prompt |
| width | integer | The desired width of the resulting image |
| height | integer | The desired height of the resulting image |
| model | string | The model (weights) used to generate the image |

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
    "model": "XXXXXXXX"
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

On success, the response has the following format:

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
