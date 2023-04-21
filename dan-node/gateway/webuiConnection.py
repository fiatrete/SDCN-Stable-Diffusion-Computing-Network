###
# check webui status
# connect webui with api
###
import requests
import os
import inspect
import threading
import time
import subprocess
import urllib.request
import hashlib
import json
import sys

webuiModelDir = ""
webuiFileDir = ""
modelsUrl = ""
webuiApiMsg = []
running = True
webuiApirequest = {}
webuiWatchDogInterval = 3
firstSetupWebui = True
blocksize = 10485760
cond = threading.Condition()
lastLaunchTime = int(time.time())
headers = {
    "accept": "application/json",
    "Content-Type": "application/json",
}

def downloadModel(url, path):
    print("download model from:", url, ", to:", path)
    with urllib.request.urlopen(url) as response:
        with open(path, 'wb') as f:
            while True:
                data = response.read(blocksize)
                if not data:
                    break
                f.write(data)
    print("download finish")

# if models exit, need to check it's hash with we support
def checkHash(filename, hasl):
    print("checkHash from:", filename)
    sha256 = hashlib.sha256()
    # Open the file and read data by block
    with open(filename, 'rb') as f:
        while True:
            data = f.read(blocksize)
            if not data:
                break
            sha256.update(data)

    result = sha256.hexdigest()
    return result == hasl

# check models
def checkFiles(fileName, models, type):
    needModels = models[type]
    dir = os.path.join(webuiModelDir, fileName)
    print("all models:", dir)
    files = os.listdir(dir)
    for model in needModels.keys():
        if model not in files:
            # download
            path = os.path.join(dir, model)
            downloadModel(modelsUrl+model, path)
        else:
            # check sha256
            path = os.path.join(dir, model)
            re = checkHash(path, needModels[model])
            if not re:
                print("check hash error, path:", path)
                downloadModel(modelsUrl+model, path)

def checkModels(models):
    for type in models.keys():
        if type == "Lora":
            fileName = "Lora"
            checkFiles(fileName, models, type)
        elif type == "CheckPoint":
            fileName = "Stable-diffusion"
            checkFiles(fileName, models, type)
    return True

# webui watchDog
def webuiWatchDog():
    print("start watch dog")
    webuiUseable = False
    global firstSetupWebui
    global lastLaunchTime
    while running:
        try:
            # visit Stable Diffusion WebUI page
            response = requests.get(webuiUrl)
            if not webuiUseable:
                if not firstSetupWebui:
                    print("webui reconnect")
                    callback("nodeOnline", None)
                webuiUseable = True
                
            # If the returned status code is not within the range of 200-299, it indicates that there is a problem with the Stable Diffusion and it needs to be restarted
            # if not(200 <= response.status_code < 300):
            #     print(f'Stable Diffusion WebUI returned status code {response.status_code}. Restarting...')
            #     subprocess.run(restart_cmd, check=True)
            if firstSetupWebui:
                print("first connect webui, congratulation!")
                callback("webuiSetup", None)
                firstSetupWebui = False
        except Exception as e:
            # If there is an exception when accessing the Stable Diffusion WebUI, a reboot is also required
            if webuiUseable:
                callback("nodeOffline", None)
                webuiUseable = False
            if (not firstSetupWebui) and (int(time.time()) - lastLaunchTime > 120):
                print(f'Error accessing Stable Diffusion WebUI: {e}. Restarting...')
                launchWebui()
            else:
                print(f"can't connect webui, maybe wait a miniute")
        # Wait for the specified interval before detecting again
        time.sleep(webuiWatchDogInterval)
    print("webui watchdog over")

def launch():
    global lastLaunchTime
    lastLaunchTime = int(time.time())

    if sys.platform == "win32":
        os.chdir(webuiFileDir)
        print("launch in win, dir:", webuiFileDir + "/webui-user.bat")
        cmd = os.path.join(webuiFileDir, "webui-user.bat")
        subprocess.call(cmd)
    elif sys.platform.startswith('linux'):
        os.chdir(webuiFileDir)
        print("launch in linux, dir:", webuiFileDir+"/webui.sh")
        # Start another Python program
        subprocess.run(['bash', webuiFileDir+"/webui.sh"])
    else:
        print("unknow system")
        callback("stop", None)

def launchWebui():
    thread1 = threading.Thread(target=launch)
    thread1.start()
    

def getWebuiDir():
    global webuiFileDir
    global webuiModelDir
    currentFileName = inspect.getfile(inspect.currentframe())
    currentFileDir = os.path.dirname(currentFileName)
    dir = os.path.dirname(currentFileDir)
    webuiFileDir = os.path.join(dir, "stable-diffusion-webui-master")
    webuiModelDir = os.path.join(webuiFileDir, "models")
    if not os.path.exists(webuiFileDir):
        print("webui dir error, should be:", webuiFileDir)
        callback("stop", None)

def dealWebuiApiRequest():
    print("start deal webui api request")
    global webuiApiMsg
    apiRequests = []
    while running:
        for apiRequest in apiRequests:
            request = apiRequest["request"]
            data = request["data"]
            type = request["type"]
            url = webuiUrl + request["uri"]
            print(int(time.time()), ", command url:", url, ", taskId:", apiRequest["taskId"])
            try:
                response = requests.post(url, headers=headers, data=json.dumps(data))
                result = {}
                result["type"] = type
                result["code"] = response.status_code
                if response.status_code == 200:
                    result["data"] = response.json()
                re = {}
                re["taskId"] = apiRequest["taskId"]
                re["result"] = result
                print("webui response code:", response.status_code) #, ", text:", response.text)
            except Exception as e:
                result = {}
                result["type"] = type
                result["code"] = 10001
                re = {}
                re["taskId"] = apiRequest["taskId"]
                re["result"] = result
                print("webui request error:", e) #, ", text:", response.text)

            callback("command", re)
        apiRequests.clear()
        cond.acquire()
        if (len(webuiApiMsg) == 0):
            cond.wait()
            apiRequests = webuiApiMsg[:]
            webuiApiMsg.clear()
        else:
            apiRequests = webuiApiMsg
            webuiApiMsg.clear()
            cond.release()
        # print("apiRequests len:", len(apiRequests))
    print("dealWebuiApiRequest over")

def sendWebuiApiRequest(data):
    global webuiApiMsg
    cond.acquire()
    webuiApiMsg.append(data)
    # print("webuiApiMsg len:", len(webuiApiMsg))
    cond.notify()
    cond.release()

def startWebuiCon(webuiurl, models, cb):
    global webuiUrl, modelsUrl
    webuiUrl = webuiurl
    modelsUrl = models["downloadPrefix"]

    global callback
    callback = cb
    getWebuiDir()
    if not checkModels(models):
       print("check models error")
       callback("stop", None)
    watchDogThread = threading.Thread(target=webuiWatchDog)
    taskThread = threading.Thread(target=dealWebuiApiRequest)

    watchDogThread.start()
    taskThread.start()
    launchWebui()

def stop():
    global running
    running = False
    # if not launchWebui():
    #     exit(0)

if __name__ == "__main__":
    startWebuiCon()