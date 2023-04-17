import sys
import requests
import common.parameters

init_img_filename = sys.argv[1]

body = common.parameters.get_img2img_parameters({
    "init_image": common.parameters.load_image_file_as_base64(init_img_filename),
})

url = common.parameters.get_http_url('/api/sd/img2img')
headers = common.parameters.get_http_headers()

response = requests.request("POST", url, headers=headers, data=body)
common.parameters.handle_image_response(response)
