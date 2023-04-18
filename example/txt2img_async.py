import base64
import time
import requests
import json
import common.parameters

body = common.parameters.get_txt2img_parameters()
url = common.parameters.get_http_url('/api/sd/txt2img/async')
headers = common.parameters.get_http_headers()

# submit the task
response = requests.request("POST", url, headers=headers, data=body)
response_obj = json.loads(response.content)
if response_obj.get('code') != 200:
    print(f"Request failed: {response.content}")
    exit(1)

task_id = response_obj.get('data').get("taskId")
print(f"Task ID is {task_id}")

# query the task status and get the result
body = json.dumps({"taskId": task_id})
url = common.parameters.get_http_url('/api/sd/task/status')
while True:
    response = requests.request("POST", url, headers=headers, data=body)
    response_obj = json.loads(response.content)
    if response_obj.get('code') != 200:
        print(f"Failed to get status: {response_obj.get('message')}")
        print(response.content)
        time.sleep(1)
        continue

    data = response_obj.get('data')
    status = data.get('status')

    # 0:default(pending), 1:processing, 2:success, 3:failure
    if status == 0:
        print(
            f"The task is pending, queue position: {data.get('queuePosition')}")
        time.sleep(1)

    if status == 1:
        print("The task is being processed, please wait")
        time.sleep(1)
        continue

    if status == 2:
        images = data.get('images')
        for index, img in zip(range(len(images)), images):
            data = base64.b64decode(img)
            with open(f"{index}.png", "wb") as f:
                f.write(data)
        exit(0)

    if status == 3:
        print("Failed to generate image")
        exit(2)
