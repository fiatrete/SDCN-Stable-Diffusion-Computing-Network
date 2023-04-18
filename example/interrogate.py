import requests
import json
import sys
import common.parameters

init_img_filename = sys.argv[1]
params = {
    "image": common.parameters.load_image_file_as_base64(init_img_filename),
    # "model": "clip"
    "model": "deepdanbooru"
}

url = common.parameters.get_http_url("/api/sd/interrogate")
headers = common.parameters.get_http_headers()

try:
    response = requests.request(
        "POST", url, headers=headers, data=json.dumps(params))
    response.raise_for_status()
    resp_obj = json.loads(response.content)
    # print(resp_obj)
except requests.exceptions.RequestException:
    print(response.content)
    sys.exit(1)

if "data" in resp_obj.keys():
    print(resp_obj["data"]["caption"])
else:
    print(response.content)
