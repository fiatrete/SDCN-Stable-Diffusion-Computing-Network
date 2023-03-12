import requests
import json
import base64

params = {
    "prompt": "(8k, RAW photo, best quality, masterpiece:1.2), (realistic, photo-realistic:1.37),1 girl,(Kpop idol), (aegyo sal:1),hair ornament, portrait, cute, night, professional lighting, photon mapping, radiosity, physically-based rendering, thighhighs, smile, pose, long hair, (sexy shorts),cat ear, wavy hair, warm light, shiny eyes,(ulzzang-6500:0.725), pureerosface_v1,detailed clothes,cleavage, (scattered sakura petals:1.331),(nude:1), (PureErosFace_V1:0.5), pov, nsfw, bed, slim legs, loving, (black hair:1.4)",
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
    "negative_prompt": "sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, bad anatomy,DeepNegative,(fat:1.2),facing away, looking away,tilted head, {Multiple people}, lowres,bad anatomy,bad hands, text, error, missing fingers,extra digit, fewer digits, cropped, worstquality, low quality, normal quality,jpegartifacts,signature, watermark, username,blurry,bad feet,cropped,poorly drawn hands,poorly drawn face,mutation,deformed,worst quality,low quality,normal quality,jpeg artifacts,signature,watermark,extra fingers,fewer digits,extra limbs,extra arms,extra legs,malformed limbs,fused fingers,too many fingers,long neck,cross-eyed,mutated hands,polar lowres,bad body,bad proportions,gross proportions,text,error,missing fingers,missing arms,missing legs,extra digit, extra arms,wrong hand",
    "model": "3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401"
}

url = 'https://SDCN_SERVER/txt2img'
headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
}

response = requests.request("POST", url, headers=headers, data=json.dumps(params))
print(response.content)
resp_obj = json.loads(response.content)

if "images" in resp_obj.keys():
    images = resp_obj["images"]
    for index, img in zip(range(len(images)), images):
        data = base64.b64decode(img)
        with open(f"{index}.png", "wb") as f:
            f.write(data)
else:
    print(response.content)
