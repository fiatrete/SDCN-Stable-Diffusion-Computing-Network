
# In this example, you need to give the program 2 images,
#   1. the image to be inpainted
#   2. a mask image indicating where needs to be regenerated

import sys
import requests
import common.parameters

init_img_filename = sys.argv[1]
inpaint_mask_filename = sys.argv[2]

body = common.parameters.get_img2img_parameters({
    "init_image": common.parameters.load_image_file_as_base64(init_img_filename),
    "prompt": "red jacket",
    "negative_prompt": "",
    "loras": [],
    "seed": 163766588,
    "inpaint": {
        "mask": common.parameters.load_image_file_as_base64(inpaint_mask_filename),
        "mask_blur": 0,
        "mask_mode": 0,
        "inpaint_area": 0,
    }
})

url = common.parameters.get_http_url('/api/sd/img2img')
headers = common.parameters.get_http_headers()

response = requests.request("POST", url, headers=headers, data=body)
common.parameters.handle_image_response(response)
