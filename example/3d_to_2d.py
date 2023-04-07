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
    ratio = min(1024 / width, 1024 / height)
    w, h = (ceil(width * ratio), ceil(height * ratio))
    print("resize to：%d x %d px" % (w, h))
    return w, h

def generate_output_filename(input_filename):
    dir_name, base_name = os.path.split(os.path.splitext(input_filename)[0])
    ext = os.path.splitext(input_filename)[1]

    id_int = 1
    new_base_name = f"{base_name}-3d_to_2d-{id_int}"
    new_file_path = os.path.join(dir_name, new_base_name + ext)
    
    while os.path.exists(new_file_path):
        id_int += 1
        new_base_name = f"{base_name}-3d_to_2d-{id_int}"
        new_file_path = os.path.join(dir_name, new_base_name + ext)
    
    return new_file_path

def interrogate(filename):
	with open(filename, "rb") as f:
		init_img = base64.b64encode(f.read()).decode()

	params = {
	    "image": init_img,
	    "model": "clip"
	}

	url = 'https://api.opendan.ai/api/sd/interrogate'
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
	    return ""
	result = resp_obj["caption"]
	print("interrogate:" + result)

	return result


init_img_filename = sys.argv[1]
target_filename = generate_output_filename(init_img_filename)

width, height = get_image_size(init_img_filename)
width, height = resize(width, height)

with open(init_img_filename, "rb") as f:
    init_img = base64.b64encode(f.read()).decode()

prompt=interrogate(init_img_filename)
# prompt=''' 1girl '''

params = {
	"model": "6e430eb51421ce5bf18f04e2dbe90b2cad437311948be4ef8c33658a73c86b2a",
    "prompt": prompt,
    "init_image": init_img,
    "loras": [
        ["759d6fdf539f44f6991efd27ef1767c7779ac8884defc71dd909e5808b5ea74b", 1]
    ],
    "denoising_strength": 0.45,
    "seed": -1,
    "sampler_name": "Euler a",
    "steps": 20,
    "cfg_scale": 7,
    "width": width,
    "height": height,
    "negative_prompt": '''EasyNegative, lowres, bad anatomy, hands, text, error ,missing fingers , extra digit, fewer digit, cropped ,worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username , blurry '''

}

url = 'https://api.opendan.ai/api/sd/txt2img'
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

if "data" in resp_obj.keys():
    images = resp_obj.get('data').get('images')
    for index, img in zip(range(len(images)), images):
        data = base64.b64decode(img)
        with open(target_filename, "wb") as f:
            f.write(data)
else:
    print(response.content)