import requests
import json
import base64
import sys
import common
import common.parameters
import common.utils


init_img_filename = sys.argv[1]
target_filename = common.utils.generate_output_filename(
    init_img_filename, "2d_to_3d")

width, height = common.utils.get_image_size(init_img_filename)
width, height = common.utils.resize(width, height)

prompt = '''(8k, RAW photo, best quality, masterpiece:1.2),
        (realistic, photo-realistic:1.37),1 girl,(Kpop idol),
        portrait, cute, night, professional lighting, photon mapping,
        radiosity, physically-based rendering, thighhighs,
        warm light, (ulzzang-6500:0.725), pureerosface_v1,
        detailed clothes,cleavage, (PureErosFace_V1:0.5),'''
body = common.parameters.get_img2img_parameters({
    "init_image": common.parameters.load_image_file_as_base64(init_img_filename),
    "prompt": prompt,
    "negative_prompt":
        "plastic, Deformed, blurry, bad anatomy, bad eyes,\
        crossed eyes, disfigured, poorly drawn face, mutation,\
        mutated, ((extra limb)), ugly, poorly drawn hands,\
        missing limb, blurry, floating limbs, disconnected limbs,\
        malformed hands, blur, out of focus, long neck, long body,\
        ((((mutated hands and fingers)))), (((out of frame))),\
        blender, doll, cropped, low-res, close-up, poorly-drawn \
        face, out of frame double, two heads, blurred, ugly,\
        disfigured, too many fingers, deformed, repetitive,\
        black and white, grainy, extra limbs, bad anatomyHigh pass filter,\
        airbrush, portrait, zoomed, soft light, smooth skin,\
        closeup, deformed, extra limbs, extra fingers, mutated hands,\
        bad anatomy, bad proportions , blind, bad eyes, ugly eyes,\
        dead eyes, blur, vignette, out of shot, out of focus,\
        gaussian, closeup, monochrome, grainy, noisy, text,\
        writing, watermark, logo, oversaturation , over saturation, over shadow",
    "denoising_strength": 0.5,
    "width": width,
    "height": height,
})
url = common.parameters.get_http_url('/api/sd/img2img')
headers = common.parameters.get_http_headers()

try:
    response = requests.request("POST", url, headers=headers, data=body)
    response.raise_for_status()
    resp_obj = json.loads(response.content)
except requests.exceptions.RequestException:
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
