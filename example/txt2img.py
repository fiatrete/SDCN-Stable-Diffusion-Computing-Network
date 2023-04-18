import requests
import common.parameters

body = common.parameters.get_txt2img_parameters()
url = common.parameters.get_http_url('/api/sd/txt2img')
headers = common.parameters.get_http_headers()

response = requests.request("POST", url, headers=headers, data=body)
common.parameters.handle_image_response(response)
