
# In this example, you need to give the program 2 images,
#   1. the image to be inpainted
#   2. a mask image indicating where needs to be regenerated

import sys
import requests
import json
import base64

init_img_filename = sys.argv[1]
with open(init_img_filename, "rb") as f:
    init_img = base64.b64encode(f.read()).decode()

inpaint_mask_filename = sys.argv[2]
with open(inpaint_mask_filename, "rb") as f:
    inpaint_mask = base64.b64encode(f.read()).decode()

params = {
    "init_image": init_img,
    "resize_mode": 1,
    "denoising_strength": 0.55,
    "prompt": "red jacket",
    "loras": [],
    "seed": 163766588,
    "sampler_name": "DPM++ SDE Karras",
    "steps": 20,
    "cfg_scale": 7,
    "width": 600,
    "height": 800,
    "negative_prompt": "",
    "model": "3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401",
    "inpaint": {
        "mask": inpaint_mask,
        "mask_blur": 0,
        "mask_mode": 0,
        "inpaint_area": 0,
    }
}

url = 'http://api.opendan.ai/api/sd/img2img'
headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
}

response = requests.request("POST", url, headers=headers, data=json.dumps(params))
resp_obj = json.loads(response.content)

if "data" in resp_obj.keys():
    images = resp_obj.get('data').get('images')
    for index, img in zip(range(len(images)), images):
        data = base64.b64decode(img)
        with open(f"inpaint_out{index}.png", "wb") as f:
            f.write(data)
else:
    print(response.content)
