# SDCN

## **What is SDCN?**

- SDCN is an infrastructure for sharing stable diffusion computing power.
- By running the SDCN node program, users can register their idle computing resources with the SDCN network.
- SDCN abstracts the capabilities of stable diffusion into a set of atomic interface calls and hides the computing process from application developers.
- Application developers can quickly develop their own applications based on the stable diffusion-related capabilities provided by SDCN, without worrying about how these interfaces are implemented or how computing power is provided.

## **Why SDCN?**

- Everyone should have the ability to use AI freely. AI will be a public good.
- For the public, the cost of trying various ways of stable diffusion is too high.
    - It's difficult to set up a stable diffusion runtime environment on your own.
        - Computer performance may not support it.
        - Downloading code from GitHub and running Stable Diffusion webui is beyond the ability of most non-programmers(even programmers).
    - Learning about models and prompt knowledge requires high learning costs.
- More application developers should be supported in popularizing AI capabilities to the public.
- For application developers, the cost of building a publicly available image generation service is too high.
    - Application developers should focus on implementing business requirements.
- The utilization of GPU computing power for home and cloud procurement is very low, leading to significant wastage.

## **How does SDCN work?**

![SDCN structure](imgs/sdcn_structure_image.png)

- SDCN Node
  - Executes image generation tasks
  - Currently, we use Stable Diffusion webui with API mode directly
- SDCN Server
  - Manage and route image generation tasks to SDCN Nodes
  - Hide the image generating details and expose a standard interface to application developers
  - Currently, we implement SDCN server with openresty
- API
  - Currently, only txt2img and img2img is implemeted

## **API reference**

At present, only HTTP requests are supported to complete image generation tasks.

The request format:

- Method: POST
- Body: A set of generation task parameters encoded in JSON format

The response format:

```
{
  "msg": "string",
  "images": [
    "string"
  ]
}

```

- In case of success, an array called `images` will be returned, which contains the generated result images in base64 encoding. The `msg` field will not be included.
- In case of failure, the `images` field will not be included, and the `msg` field will contain the error message.

### txt2img

For `txt2img` tasks, all the parameters are listed below:

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
    "model": "XXXXXXXX"
}

```

### img2img

For `img2img` tasks, the following parameters are required:

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

## **How to use**

### For application developers

- The SDCN service is provided from [https://api.sdcn.info](https://api.sdcn.info)
- Try the sample code in folder example. You can modify the 'params-xxx.json' file to experiment with different parameter combinations.

```bash
sdcn_run.py txt2img params-txt2img.json OUTPUT_IMAGE.png
sdcn_run.py img2img params-img2img.json ORIGINAL_IMAGE.png OUTPUT_IMAGE.png
```

### For those who want to contribute computing power

## TODO list

- To be updated
