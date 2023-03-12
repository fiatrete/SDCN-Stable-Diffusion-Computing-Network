import requests
import json
import base64
import sys

def print_usage(error_msg = None):
    print("Usage:")
    print(f"\t{sys.argv[0]} txt2img PARAMS_JSON.json OUTPUT_IMAGE.png")
    print(f"\t{sys.argv[0]} img2img PARAMS_JSON.json ORIGINAL_IMAGE.png OUTPUT_IMAGE.png")
    if error_msg is not None:
        print(error_msg)

def load_params(params_file, init_image_file = None):
    params = None
    with open(params_file, "rb") as f:
        params = json.load(f)

    if params == None:
        raise RuntimeError("Failed to load parameters")

    if init_image_file is not None:
        with open(init_image_file, "rb") as f:
            params["init_image"] = base64.b64encode(f.read()).decode()
        if params["init_image"] is None:
            raise RuntimeError("Failed to load init_image")
    
    return params

SERVICE_PREFIX = 'https://SDCN_SERVER'

def do_request_and_save_image(func_type, params, save_to):
    url = SERVICE_PREFIX + '/' + func_type
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
    }

    response = requests.request("POST", url, headers=headers, data=json.dumps(params))
    resp_obj = json.loads(response.content)

    if "images" in resp_obj.keys():
        images = resp_obj["images"]
        for _, img in zip(range(len(images)), images):
            data = base64.b64decode(img)
            with open(save_to, "wb") as f:
                f.write(data)
            break
    else:
        print(response.content)

def img2img():
    if len(sys.argv) != 5:
        print_usage("img2img need exactly 5 parameters")
        exit(1)
    
    params_json_file = sys.argv[2]
    init_image_file = sys.argv[3]
    output_image_file = sys.argv[4]

    params = load_params(params_json_file, init_image_file)
    do_request_and_save_image('img2img', params, output_image_file)

def txt2img():
    if len(sys.argv) != 4:
        print_usage("txt2img need exactly 4 parameters")
        exit(1)
    params_json_file = sys.argv[2]
    output_image_file = sys.argv[3]
    params = load_params(params_json_file)
    do_request_and_save_image('txt2img', params, output_image_file)

def main():
    args = sys.argv
    if len(args) < 2:
        print_usage()
        exit(1)
    cmd = args[1]
    if cmd == 'img2img':
        img2img()
    elif cmd == 'txt2img':
        txt2img()
    else:
        print_usage(f"Unknown command: {cmd}")
        exit(1)

if __name__ == '__main__':
    main()