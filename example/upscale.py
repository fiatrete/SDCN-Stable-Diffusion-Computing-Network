import json
import sys
import requests
import common.parameters

img_file = sys.argv[1]

body = json.dumps({
    "image": common.parameters.load_image_file_as_base64(img_file),
    "upscalingRate": 2,
    "upscaler": "Lanczos",
    "upscaler2": "Lanczos",
    "upscaler2_factor": 0
})

url = common.parameters.get_http_url('/api/sd/upscale')
headers = common.parameters.get_http_headers()

response = requests.request("POST", url, headers=headers, data=body)
common.parameters.handle_image_response(response)
