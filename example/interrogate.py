import requests
import json
import base64
import sys


init_img_filename = sys.argv[1]

with open(init_img_filename, "rb") as f:
    init_img = base64.b64encode(f.read()).decode()

params = {
    "image": init_img,
    # "model": "clip"
    "model": "deepdanbooru"
}

url = 'https://api.sdcn.info/interrogate'
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

if "caption" in resp_obj.keys():
    print(resp_obj["caption"])
else:
    print(response.content)

