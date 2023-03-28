import requests
import json
import base64

with open("./5-out-6.png", "rb") as f:
    init_img = base64.b64encode(f.read()).decode()

params = {
    "image": init_img,
    "model": "clip"
}

url = 'http://127.0.0.1:6006/interrogate'
headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
}

response = requests.request("POST", url, headers=headers, data=json.dumps(params))
resp_obj = json.loads(response.content)

if "caption" in resp_obj.keys():
    print(resp_obj["caption"])
else:
    print(response.content)
