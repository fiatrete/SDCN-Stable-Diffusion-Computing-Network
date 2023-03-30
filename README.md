# SDCN

## **What is SDCN?**

- SDCN is an infrastructure for sharing stable diffusion computing power.
- By running the SDCN node program, users can register their idle computing resources with the SDCN network.
- SDCN abstracts the capabilities of stable diffusion into a set of atomic interface calls and hides the computing process from application developers.
- Application developers can quickly develop their own applications based on the stable diffusion-related capabilities provided by SDCN, without worrying about how these interfaces are implemented or how computing power is provided.

## **Getting Started**

Try out SDCN functionalities in [our website](https://www.sdcn.info/).
Feel free to file tickets for bugs or feature requests. 

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
refer to [API reference](doc/api.md).

## **How to use**

### Run sdcn-server locally in docker

I supose you have Stable Diffusion webui and docker installed.

1. make sure the following models & loras are installed:
    1. chillout_mix, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/chilloutmix_NiPrunedFp32Fix.safetensors)
    2. clarity, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/clarity.safetensors)
    3. koreanDollLikeness_v10, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/koreandolllikeness_V10.safetensors)
    4. stLouisLuxuriousWheels_v1, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/stLouisLuxuriousWheels_v1.safetensors)
    5. taiwanDollLikeness_v10, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/taiwanDollLikeness_v10.safetensors)
    6. kobeni_v10, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/kobeni_v10.safetensors)
2. startup Stable Diffusion webui with `--listen --api` argument 

```bash
bash webui.sh --listen --api
```

3. start sdcn-server locally in docker with [Docker Compose](https://github.com/docker/compose):
```
docker-compose up -d 
```

Now your sdcn-server is available on "[http://127.0.0.1:6006](http://127.0.0.1:6006/)"

4. register your Stable Diffusion webui instance as a SDCN node by sending an HTTP request as below:

```bash
curl -XPOST 'https://api.sdcn.info/admin/regworker' -d '{"worker":"http://yourlocalip:7860","owner":"yourname","nodeId":"yournodeid"}'
```

You can unregister an instance by sending an HTTP request as below if you need:

```bash
curl -XPOST 'https://api.sdcn.info/admin/unregworker' -d '{"worker":"http://yourlocalip:7860"}'
```

> Please note that you cannot use 127.0.0.1 or 'localhost' since our docker container's `hostnet` is not enabled; instead, you must use the local IP address.

5. config SERVICE_PREFIX in example/sdcn_run.py to "[http://127.0.0.1:6006](http://127.0.0.1:6006/)". 

```python
SERVICE_PREFIX = 'http://127.0.0.1:6006'
```

6. execute the example with your local sdcn-server:

```bash
python3 sdcn_run.py txt2img params-txt2img.json OUTPUT_IMAGE.png
```

### For application developers

- The SDCN service is provided from [https://api.sdcn.info](https://api.sdcn.info)
- Try the sample code in folder example. You can modify the 'params-xxx.json' file to experiment with different parameter combinations.

```bash
python3 sdcn_run.py txt2img params-txt2img.json OUTPUT_IMAGE.png
python3 sdcn_run.py img2img params-img2img.json ORIGINAL_IMAGE.png OUTPUT_IMAGE.png
```

- try with curl
  - install required tools
```bash
brew install curl jq
```
  - enter example folder and execute
```bash
cd example
cat params-txt2img.json \
| curl --location --request POST 'https://api.sdcn.info/txt2img' \
--header 'Content-Type: application/json' -d @- \
| jq '.images[0]' |tr -d '\"' | tr -d '\\' | base64 -d > out.png
```

### For those who want to contribute computing power

1. install lastest [Stable Diffusion webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
2. make sure the following models & loras are installed:
    1. chillout_mix, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/chilloutmix_NiPrunedFp32Fix.safetensors)
    2. clarity, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/clarity.safetensors)
    3. koreanDollLikeness_v10, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/koreandolllikeness_V10.safetensors)
    4. stLouisLuxuriousWheels_v1, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/stLouisLuxuriousWheels_v1.safetensors)
    5. taiwanDollLikeness_v10, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/taiwanDollLikeness_v10.safetensors)
    6. kobeni_v10, [download](https://huggingface.co/fiatrete/sdcn-used-models/resolve/main/kobeni_v10.safetensors)
3. startup Stable Diffusion webui with `--listen --api --share` argument 

```bash
bash webui.sh --listen --api --share
```
you will get a public URL like `https://f00bfa54-7b3c-476b.gradio.live`.

4. register the public URL in sdcn.info.



## Roadmap & TODO list


- [ ] Provide a management GUI for computing power donors
    - [ ] Add login to the SDCN website
    - [ ] CRUD management of computing power provided by donors
- [ ] Workload ranking page
    - [ ] Node-based workload ranking
    - [ ] Donor-based workload ranking
    - [ ] Model-based workload ranking
    - [ ] API-based workload ranking
- [ ] Complete basic SDCN functional interfaces
    - [ ] scale interface
    - [ ] inpaint interface
    - [ ] support for controlnet
- [ ] Enrich examples in the playground (continuously adding)
    - [ ] 2D to 3D style conversion
    - [ ] 3D to 2D style conversion
- [ ] One-click installation of Stable Diffusion webui as an SDCN node(support for Windows&Linux)
    - [ ] Customize Stable Diffusion webui installer
    - [ ] Automatically download necessary model files
    - [ ] Customize SDCN node daemon as intermediary for communication between Stable Diffusion webui and sdcn- [ ]server
- [ ] Establish a plugin mechanism for the playground
    - [ ] A pipeline-based workflow editor running in web form
    - [ ] A UI generator that generates interactive web pages based on input/output parameters
    - [ ] Plugin code sharing mechanism? Need to discuss
- [ ] Add a image stream generated by the SDCN tool to the SDCN website
    - [ ] Add sharing mechanisms for images generated through API or playground
    - [ ] develop a page to display shared images in a waterfall flow
- [ ] Design constraints for the use of computing resources (appkey?)
    - [ ] To be discussed
- [ ] Design task scheduling mechanism
    - [ ] Schedule to nodes with required models already loaded
    - [ ] Global load balancing
