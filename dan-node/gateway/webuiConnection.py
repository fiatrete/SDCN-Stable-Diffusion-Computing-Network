###
# check webui status
# connect webui with api
###
import requests
import os
import inspect
import threading
import time
import datetime
import subprocess
import urllib.request
import hashlib
import json
import sys
from tqdm import tqdm
import utils

webui_file_dir = ""
webui_api_msg = []
running = True
webui_watch_dog_interval = 3
first_setup_webui = True
blocksize = 10485760
cond = threading.Condition()
last_launch_time = int(time.time())
headers = {
    "accept": "application/json",
    "Content-Type": "application/json",
}
timer_check_models_condition = threading.Condition()
current_dir = os.path.dirname(inspect.getfile(inspect.currentframe()))


def download_model(url, path):
    print("download model from:", url, ", to:", path)
    try:
        response = urllib.request.urlopen(url)
    except Exception as e:
        print("error:", e, ", url:", url, ", can't be downloaded!!!")
        return
    total_size = int(response.headers.get('Content-Length', 0))
    progress_bar = tqdm(total=total_size, unit='B', unit_scale=True)

    with open(path, 'wb') as output:
        while True:
            buffer = response.read(blocksize)
            if not buffer:
                break
            output.write(buffer)
            progress_bar.update(len(buffer))

    progress_bar.close()


# if models exit, need to check it's hash with we support
def check_hash(filename, hash_val):
    print("check_hash from:", filename)
    sha256 = hashlib.sha256()
    # Open the file and read data by block
    with open(filename, 'rb') as f:
        while True:
            data = f.read(blocksize)
            if not data:
                break
            sha256.update(data)

    result = sha256.hexdigest()
    return result == hash_val

def get_remote_models():
    try:
        response = requests.get(online_models_url)
    except Exception as e:
        print("check models error:", e)
        return None
    if response.status_code == 200:
        return response.json()
    else:
        print("check models error, code:", response.status_code)
        return None


def compire_model(remote_models, local_models):
    for model in remote_models.keys():
        if ((local_models.get(model, None) is None) or
            (local_models[model]["hash"] != remote_models[model]["hash"])):
            print("local models is the different with online models:", model)
            model_url = remote_models[model]["download"]["fileurl"]
            model_file_name = model_url[str(model_url).rfind("/")+1:]
            model_file_path = os.path.join(webui_file_dir, remote_models[model]["download"]["path"][1:], model_file_name)
            print(model_file_path)
            if ((not os.path.isfile(model_file_path)) or
                (not check_hash(model_file_path, remote_models[model]["hash"]))):
                download_model(model_url, model_file_path)
            else:
                print("models exits")
    return True


def check_models():
    remote_models_info = get_remote_models()
    if remote_models_info is None:
        return False
    # check local models.json
    local_models_file = os.path.join(current_dir, "models.json")
    if not os.path.isfile(local_models_file):
        print("first start, no local models")
        for model in remote_models_info.keys():
            download_info = remote_models_info[model]["download"]
            model_url = download_info["fileurl"]
            model_file_name = model_url[str(model_url).rfind("/")+1:]
            model_file_path = os.path.join(webui_file_dir, download_info["path"][1:], model_file_name)
            print(download_info["path"][1:], ", ", webui_file_dir)
            if ((not os.path.isfile(model_file_path)) or
                (not check_hash(model_file_path, remote_models_info[model]["hash"]))):
                download_model(model_url, model_file_path)
    else:
        fr = open(local_models_file, "r", encoding="utf-8")
        local_models_info = json.loads(fr.read())
        print("local:", local_models_info)
        compire_model(remote_models_info, local_models_info)
    fw = open(os.path.join(current_dir, "models.json"), "w")
    fw.write(json.dumps(remote_models_info))
    return True


# webui watchDog
def webui_watchdog():
    print("start watch dog")
    webui_useable = False
    global first_setup_webui
    global last_launch_time
    while running:
        try:
            # visit Stable Diffusion WebUI page
            requests.get(webui_url)
            if not webui_useable:
                if not first_setup_webui:
                    print("webui reconnect")
                    callback("node_online", None)
                webui_useable = True

            # If the returned status code is not within the range of 200-299,
            # it indicates that there is a problem with the Stable Diffusion
            # and it needs to be restarted
            # if not(200 <= response.status_code < 300):
            #     print(f'Stable Diffusion WebUI returned status code
            #     {response.status_code}. Restarting...')
            #     subprocess.run(restart_cmd, check=True)
            if first_setup_webui:
                print("first connect webui, congratulation!")
                callback("webui_setup", None)
                first_setup_webui = False
        except Exception as e:
            # If there is an exception when accessing the Stable Diffusion
            # WebUI, a reboot is also required
            if webui_useable:
                callback("node_offline", None)
                webui_useable = False
            if (not first_setup_webui) and (int(time.time()) - last_launch_time > 120):
                print(f'Error accessing Stable Diffusion WebUI: {e}. Restarting...')
                launch_webui()
            else:
                print(f"can't connect webui, maybe wait a miniute")
        # Wait for the specified interval before detecting again
        time.sleep(webui_watch_dog_interval)
    print("webui watchdog over")


def launch():
    global last_launch_time
    last_launch_time = int(time.time())

    if sys.platform == "win32":
        os.chdir(webui_file_dir)
        print("launch in win, dir:", webui_file_dir + "/webui-user.bat")
        cmd = utils.os.path.join(webui_file_dir, "webui-user.bat")
        subprocess.call(cmd)
    elif sys.platform.startswith('linux'):
        os.chdir(webui_file_dir)
        print("launch in linux, dir:", webui_file_dir+"/webui.sh")
        # Start another Python program
        subprocess.run(['bash', webui_file_dir+"/webui.sh"])
    else:
        print("unknow system")
        callback("stop", None)


def launch_webui():
    thread1 = threading.Thread(target=launch)
    thread1.start()


def get_webui_dir():
    global webui_file_dir
    dir = os.path.dirname(current_dir)
    webui_file_dir = os.path.join(dir, "stable-diffusion-webui-master")
    if not os.path.exists(webui_file_dir):
        print("webui dir error, should be:", webui_file_dir)
        callback("stop", None)


def deal_webui_api_request():
    print("start deal webui api request")
    global webui_api_msg
    api_requests = []
    while running:
        for api_request in api_requests:
            request = api_request["request"]
            data = request["data"]
            type = request["type"]
            url = webui_url + request["uri"]
            print(int(time.time()), ", command url:", url, ", taskId:", api_request["taskId"])
            try:
                response = requests.post(url, headers=headers, data=json.dumps(data))
                result = {}
                result["type"] = type
                result["code"] = response.status_code
                if response.status_code == 200:
                    result["data"] = response.json()
                re = {}
                re["taskId"] = api_request["taskId"]
                re["result"] = result
                print("webui response code:", response.status_code)
            except Exception as e:
                result = {}
                result["type"] = type
                result["code"] = 10001
                re = {}
                re["taskId"] = api_request["taskId"]
                re["result"] = result
                print("webui request error:", e)

            callback("command", re)
        api_requests.clear()
        cond.acquire()
        if (len(webui_api_msg) == 0):
            cond.wait()
            api_requests = webui_api_msg[:]
            webui_api_msg.clear()
        else:
            api_requests = webui_api_msg
            webui_api_msg.clear()
            cond.release()
        # print("api_requests len:", len(api_requests))
    print("deal_webui_api_request over")


def send_webui_api_request(data):
    global webui_api_msg
    cond.acquire()
    webui_api_msg.append(data)
    # print("webui_api_msg len:", len(webui_api_msg))
    cond.notify()
    cond.release()


def timer_check():
    time = 1
    last_day = datetime.datetime.now().day
    while running:
        time = datetime.datetime.now().hour
        day = datetime.datetime.now().day

        if time == 1 and (last_day != day):
            last_day = day
            print("timer check models")
            check_models()
        timer_check_models_condition.acquire()
        timer_check_models_condition.wait(3600)


def start_webui_con(webuiurl, models_url, cb):
    global webui_url, online_models_url, callback
    webui_url = webuiurl
    online_models_url = models_url

    callback = cb
    get_webui_dir()
    if not check_models():
        print("check models error")
        callback("stop", None)
    watch_dog_thread = threading.Thread(target=webui_watchdog)
    task_thread = threading.Thread(target=deal_webui_api_request)

    watch_dog_thread.start()
    task_thread.start()
    threading.Thread(target=timer_check).start()
    launch_webui()


def stop():
    global running
    running = False
    # if not launch_webui():
    #     exit(0)


if __name__ == "__main__":
    start_webui_con()
