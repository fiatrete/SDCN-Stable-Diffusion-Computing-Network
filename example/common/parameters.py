
import base64
import json

import requests


def get_txt2img_parameters(overrideParams=None):
    params = {
        "prompt":
            "(8k, RAW photo, best quality, masterpiece:1.2),\
            (realistic, photo-realistic:1.37),1 girl,(Kpop idol),\
            (aegyo sal:1), hair ornament, portrait, cute, night,\
            professional lighting, photon mapping, radiosity,\
            physically-based rendering, thighhighs, smile, pose,\
            long hair, (sexy shorts), cat ear, wavy hair, warm light,\
            shiny eyes,(ulzzang-6500:0.725), pureerosface_v1,\
            detailed clothes,cleavage, (scattered sakura petals:1.331),\
            (nude:1), (PureErosFace_V1:0.5), pov, nsfw, bed,\
            slim legs, loving, (black hair:1.4)",
        "loras": [
            ["62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c", 0.5],
            ["3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac", 0.7]
        ],
        "seed": -1,
        "sampler_name": "DPM++ SDE Karras",
        "steps": 20,
        "cfg_scale": 7,
        "width": 600,
        "height": 800,
        "negative_prompt":
            "sketches, (worst quality:2), (low quality:2),\
            (normal quality:2), lowres, normal quality,\
            ((monochrome)), ((grayscale)), skin spots, acnes,\
            skin blemishes, bad anatomy,DeepNegative,(fat:1.2),\
            facing away, looking away, tilted head, {Multiple people},\
            lowres,bad anatomy,bad hands, text, error,\
            missing fingers,extra digit, fewer digits, cropped,\
            worstquality, low quality, normal quality,\
            jpegartifacts,signature, watermark, username,\
            blurry,bad feet,cropped,poorly drawn hands,\
            poorly drawn face, mutation, deformed, worst quality,\
            low quality, normal quality, jpeg artifacts, signature,\
            watermark,extra fingers,fewer digits,extra limbs,\
            extra arms,extra legs,malformed limbs,fused fingers,\
            too many fingers,long neck, cross-eyed,mutated hands,\
            polar lowres,bad body,bad proportions,gross proportions,\
            text,error,missing fingers,missing arms, missing legs,\
            extra digit, extra arms,wrong hand",
        "model": "3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401",
        "upscale": {
            "denoising_strength": 0.5,
            "scale": 1.5,
            "upscaler": "Latent",
        }
    }
    if overrideParams is not None:
        for k, v in overrideParams.items():
            params[k] = v
    return json.dumps(params)


def get_img2img_parameters(overrideParams=None):
    params = {
        "denoising_strength": 0.55,
        "prompt":
            "(8k, RAW photo, best quality, masterpiece:1.2),\
            (realistic, photo-realistic:1.37), 1 girl, (Kpop idol),\
            (aegyo sal:1), hair ornament, portrait, cute, night,\
            professional lighting, photon mapping, radiosity,\
            physically-based rendering, thighhighs, smile, pose,\
            long hair, (sexy shorts),cat ear, wavy hair, warm light,\
            shiny eyes,(ulzzang-6500:0.725), pureerosface_v1,\
            detailed clothes,cleavage, (scattered sakura petals:1.331),\
            (nude:1), (PureErosFace_V1:0.5), pov, nsfw, bed, slim legs,\
            loving, (black hair:1.4)",
        "loras": [
            ["62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c", 0.5],
            ["3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac", 0.7]
        ],
        "resize_mode": 1,
        "seed": -1,
        "sampler_name": "DPM++ SDE Karras",
        "steps": 20,
        "cfg_scale": 7,
        "width": 600,
        "height": 800,
        "negative_prompt":
            "sketches, (worst quality:2), (low quality:2),\
            (normal quality:2), lowres, normal quality, ((monochrome)),\
            ((grayscale)), skin spots, acnes, skin blemishes,\
            bad anatomy, DeepNegative,(fat:1.2),facing away,\
            looking away, tilted head, {Multiple people},\
            lowres, bad anatomy,bad hands, text, error,\
            missing fingers,extra digit, fewer digits, cropped,\
            worstquality, low quality, normal quality, jpegartifacts,\
            signature, watermark, username, blurry, bad feet,\
            cropped, poorly drawn hands, poorly drawn face,\
            mutation, deformed, worst quality, low quality,\
            normal quality,jpeg artifacts, signature, watermark,\
            extra fingers, fewer digits, extra limbs, extra arms,\
            extra legs, malformed limbs, fused fingers,too many fingers,\
            long neck, cross-eyed, mutated hands, polar lowres,\
            bad body, bad proportions, gross proportions, text,\
            error, missing fingers, missing arms, missing legs,\
            extra digit, extra arms,wrong hand",
        "model": "3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401"
    }
    if overrideParams is not None:
        for k, v in overrideParams.items():
            params[k] = v
    return json.dumps(params)


def load_image_file_as_base64(file):
    img = None
    with open(file, "rb") as f:
        img = base64.b64encode(f.read()).decode()
    return img


def _get_public_api_key():
    response = requests.request(
        "GET", get_http_url('/api/user/public-api-key'), headers={
        'accept': 'application/json',
        'Content-Type': 'application/json',
    })
    resp_obj = json.loads(response.content)
    return resp_obj["data"]["apiKey"]


_api_key = None


def get_http_headers():
    global _api_key
    if _api_key is None:
        _api_key = _get_public_api_key()
        assert _api_key is not None, "Failed to get _api_key"

    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
    }

    headers["Authorization"] = _api_key
    return headers


def get_http_url(path):
    if path.startswith('/'):
        return 'https://api.opendan.ai' + path
    return 'https://api.opendan.ai/' + path


def handle_image_response(response):
    resp_obj = json.loads(response.content)
    if resp_obj.get("code") == 200 and "data" in resp_obj.keys():
        images = resp_obj.get('data').get('images')
        for index, img in zip(range(len(images)), images):
            data = base64.b64decode(img)
            with open(f"{index}.png", "wb") as f:
                f.write(data)
    else:
        print(response.content)
        print(
            "The response is not as expected,\
            I have print out the original response string")
