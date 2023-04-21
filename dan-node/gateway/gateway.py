import threading
import json
import servConnection
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
configInfo = {}

webuiSetupCond = threading.Condition()

def getConfig():
    global configInfo
    f = open(os.path.join(currentDir, "config.json"), "r", encoding="utf-8")
    try:
        configInfo = json.loads(f.read())
        print(configInfo)
    except:
        print("config.json file maybe error")
        exit(0)
    return True


# wait for webui connection, after connect success, connect server
def startServConnection():
    webuiSetupCond.acquire()
    webuiSetupCond.wait()
    servConnection.startConnection(configInfo["servAddr"], configInfo["apiKey"], configInfo["nodeName"], servConnCallback)
    webuiSetupCond.release()

def startWebuiConnection():
    webuiConnection.startWebuiCon(configInfo["webuiLocalUrl"], configInfo["supportModels"], webuiConnCallback)

def webuiConnCallback(type, result):
    if type == "command":
        servConnection.createCommandResult(result)
    elif type == "nodeOffline":
        servConnection.createNodeOfflineInfo()
    elif type == "nodeOnline":
        servConnection.createNodeOnlineInfo()
    elif type == "webuiSetup":
        webuiSetupCond.acquire()
        webuiSetupCond.notify_all()
        webuiSetupCond.release()
    elif type == "stop":
        stop()
    return True

def servConnCallback(type, msg):
    if type == "command":
        webuiConnection.sendWebuiApiRequest(msg)
    elif type == "offline":
        stop()
    # notify deal servmsg thread
    return True

def stop():
    servConnection.stop()
    webuiConnection.stop()
    return True

if __name__ == "__main__" :
    if not getConfig():
        exit(0)

    thread1 = threading.Thread(target=startServConnection)
    thread2 = threading.Thread(target=startWebuiConnection)


    thread1.start()
    thread2.start()