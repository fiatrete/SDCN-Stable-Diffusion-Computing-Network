# API reference
At present, only HTTP requests are supported to complete image generation tasks.

The APIs has similar respones.

On success, then server will response http `status code` 200 and an object in JSON as below:

```JSON
{
    "code": 200,
    "data": `The returned object`,
    "message": "success"
}
```

On failure, the server will response a non-ok http `status code` (i.e. not 200, may be 401 for an example) and an object JSON as below:

```JSON
{
    "code": `Error code`,
    "message": `A string describe the error`
}
```

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
| model | string | The model (weights) used to generate the image |
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
