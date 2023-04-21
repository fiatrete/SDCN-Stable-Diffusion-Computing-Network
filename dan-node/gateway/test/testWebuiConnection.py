import time
import threading
import json
import webuiConnection
import os
import inspect

# 
# webui watchdog interval
webuiWatchDogInterval = 10
webuiUrl = 'http://localhost:8000'
webuiAuthCookie = {'session': 'your_session_cookie'}

currentDir= os.path.dirname(inspect.getfile(inspect.currentframe()))
# read config.json

webuiSetupCond = threading.Condition()

def getConfig():
    f = open(os.path.join(currentDir, "config.json"), "r", encoding="utf-8")
    try:
        global configInfo
        configInfo = json.loads(f.read())
        print(configInfo)
    except:
        print("config.json file maybe error")
        exit(0)
    return True


def webuiConSucess():
    print("webuiConSucess")
    webuiSetupCond.acquire()
    webuiSetupCond.wait(10)
    webuiSetupCond.release()
    print("******************webui connect success*******************")

def startWebuiConnection():
    time.sleep(1)
    webuiConnection.startWebuiCon(configInfo["webuiLocalUrl"], configInfo["supportModels"], webuiConnCallback)

def webuiConnCallback(type, result):
    if type == "command":
        print("command")
    elif type == "nodeOffline":
        print("nodeOffline")
    elif type == "nodeOnline":
        print("nodeOnline")
    elif type == "webuiSetup":
        print("webuiSetup")
        webuiSetupCond.acquire()
        webuiSetupCond.notify()
        webuiSetupCond.release()
    return True

def servConnCallback(type, msg):
    if type == "command":
        webuiConnection.sendWebuiApiRequest(msg)
    elif type == "offline":
        stop()
    # notify deal servmsg thread
    return True

def stop():
    webuiConnection.stop()
    return True

if __name__ == "__main__" :
    getConfig()
        # exit(0)

    thread1 = threading.Thread(target=webuiConSucess)
    thread2 = threading.Thread(target=startWebuiConnection)



    thread1.start()
    thread2.start()