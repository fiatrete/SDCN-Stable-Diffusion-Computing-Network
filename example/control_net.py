# import requests
# import json
# import base64
import sys
import requests
import common.parameters

cn_img_filename = sys.argv[1]
body = common.parameters.get_txt2img_parameters({
    "control_net": [
        {
            "image": common.parameters.load_image_file_as_base64(cn_img_filename),
            "preprocess": "canny",
            "model": "sd15_canny",
            "preprocess_param1": 100,
            "preprocess_param2": 200,
            "weight": 1,
            "resize_mode": 2,
            "guidance_start": 0,
            "guidance_end": 1,
            "guessmode": False
        }
    ]
})
url = common.parameters.get_http_url('/api/sd/txt2img')
headers = common.parameters.get_http_headers()

response = requests.request("POST", url, headers=headers, data=body)
print(response.content)
common.parameters.handle_image_response(response)
