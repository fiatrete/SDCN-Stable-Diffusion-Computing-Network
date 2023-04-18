import requests
import json
import base64
import sys
import common.parameters
import common.utils


def interrogate(filename):
    init_img = common.parameters.load_image_file_as_base64(filename)
    params = {
        "image": init_img,
        "model": "clip"
    }
    url = common.parameters.get_http_url("/api/sd/interrogate")
    headers = common.parameters.get_http_headers()

    try:
        response = requests.request(
            "POST", url, headers=headers, data=json.dumps(params))
        response.raise_for_status()
        resp_obj = json.loads(response.content)
    except requests.exceptions.RequestException:
        print(response.content)
        return ""
    result = resp_obj["data"]["caption"]
    print("interrogate:" + result)

    return result


init_img_filename = sys.argv[1]
target_filename = common.utils.generate_output_filename(init_img_filename, "3d_to_2d")

width, height = common.utils.get_image_size(init_img_filename)
width, height = common.utils.resize(width, height)

with open(init_img_filename, "rb") as f:
    init_img = base64.b64encode(f.read()).decode()

prompt = interrogate(init_img_filename)
body = common.parameters.get_img2img_parameters({
    "init_image": init_img,
    "prompt": prompt,
    "loras": [
        ["759d6fdf539f44f6991efd27ef1767c7779ac8884defc71dd909e5808b5ea74b", 1]
    ],
    "denoising_strength": 0.45,
    "sampler_name": "Euler a",
    "model": "6e430eb51421ce5bf18f04e2dbe90b2cad437311948be4ef8c33658a73c86b2a",
    "width": width,
    "height": height,
    "negative_prompt":
        '''EasyNegative, lowres, bad anatomy, hands, text, error,
        missing fingers , extra digit, fewer digit, cropped,
        worst quality, low quality, normal quality, jpeg artifacts,
        signature, watermark, username , blurry '''
})
url = common.parameters.get_http_url("/api/sd/img2img")
headers = common.parameters.get_http_headers()

try:
    response = requests.request("POST", url, headers=headers, data=body)
    response.raise_for_status()
except requests.exceptions.RequestException:
    print(response.content)
    sys.exit(1)

resp_obj = json.loads(response.content)
if resp_obj.get("code") == 200 and "data" in resp_obj.keys():
    images = resp_obj.get('data').get('images')
    for index, img in zip(range(len(images)), images):
        data = base64.b64decode(img)
        with open(target_filename, "wb") as f:
            f.write(data)
else:
    print(response.content)
    print(
        "The response is not as expected,\
        I have print out the original response string")