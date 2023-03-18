import requests
import json
import base64
import sys
import os

from PIL import Image
from math import ceil

def get_image_size(filename):
    with Image.open(filename) as img:
        width, height = img.size
        print("img size：%d x %d px" % (width, height))
    return width, height

def resize(width, height):
    if width > 1024 or height > 1024:
        ratio = min(1024 / width, 1024 / height)
        return (ceil(width * ratio), ceil(height * ratio))
    else:
        return (width, height)

def generate_output_filename(input_filename):
    dir_name, base_name = os.path.split(os.path.splitext(input_filename)[0])
    ext = os.path.splitext(input_filename)[1]

    id_int = 1
    new_base_name = f"{base_name}-out-{id_int}"
    new_file_path = os.path.join(dir_name, new_base_name + ext)
    
    while os.path.exists(new_file_path):
        id_int += 1
        new_base_name = f"{base_name}-out-{id_int}"
        new_file_path = os.path.join(dir_name, new_base_name + ext)
    
    return new_file_path

init_img_filename = sys.argv[1]
target_filename = generate_output_filename(init_img_filename)

width, height = get_image_size(init_img_filename)
width, height = resize(width, height)

with open(init_img_filename, "rb") as f:
    init_img = base64.b64encode(f.read()).decode()

prompt='''(8k, RAW photo, best quality, masterpiece:1.2), (realistic, photo-realistic:1.37),1 girl,(Kpop idol), portrait, cute, night, professional lighting, photon mapping, 
radiosity, physically-based rendering, thighhighs, warm light,(ulzzang-6500:0.725), pureerosface_v1,detailed clothes,cleavage, (PureErosFace_V1:0.5),'''

params = {
    "init_image": init_img,
    "denoising_strength": 0.5,
    "prompt": prompt,
    "loras": [
        ["62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c", 0.5],
        ["3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac", 0.7]
    ],
    "seed": -1,
    "sampler_name": "DPM++ SDE Karras",
    "steps": 20,
    "cfg_scale": 7,
    "width": width,
    "height": height,
    "negative_prompt": "plastic, Deformed, blurry, bad anatomy, bad eyes, crossed eyes, disfigured, poorly drawn face, mutation, mutated, ((extra limb)), ugly, poorly drawn hands, missing limb, blurry, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, ((((mutated hands and fingers)))), (((out of frame))), blender, doll, cropped, low-res, close-up, poorly-drawn face, out of frame double, two heads, blurred, ugly, disfigured, too many fingers, deformed, repetitive, black and white, grainy, extra limbs, bad anatomyHigh pass filter, airbrush, portrait, zoomed, soft light, smooth skin, closeup, deformed, extra limbs, extra fingers, mutated hands, bad anatomy, bad proportions , blind, bad eyes, ugly eyes, dead eyes, blur, vignette, out of shot, out of focus, gaussian, closeup, monochrome, grainy, noisy, text, writing, watermark, logo, oversaturation , over saturation, over shadow",
    "model": "3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401"
}

url = 'https://api.sdcn.info/img2img'
headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
}

try:
    response = requests.request("POST", url, headers=headers, data=json.dumps(params))
    response.raise_for_status()
    resp_obj = json.loads(response.content)
except requests.exceptions.RequestException as e:
    print(response.content)
    sys.exit(1)

if "images" in resp_obj.keys():
    images = resp_obj["images"]
    for index, img in zip(range(len(images)), images):
        data = base64.b64decode(img)
        with open(target_filename, "wb") as f:
            f.write(data)
else:
    print(response.content)
