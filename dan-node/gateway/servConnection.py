import websocket
import json
import threading
import time
import os
import inspect
import sys

running = True
servAskOffline = False
msgBody = {}
apiKey = ""
nodeName = ""
needSendMsgs = []
needGetResultMsgs = []  # Add the sendtime field on top of needSendMsgs to determine if the message has timed out
sessionId = "" 
needSendMsgsLock = threading.Lock()
needGetResultMsgsLock = threading.Lock()
currentDir= os.path.dirname(inspect.getfile(inspect.currentframe()))
heartCondition = threading.Condition()
heartbeatStatus = 1
hasConnected = False
webuiStatus = {
    "offline": 0,
    "online": 1
}
msgTypePair = {
    "register" : "register-result",
    "heartbeat" : "heartbeat-result",
    #"command" : "command-result",
    "offline" : "offline-result",
    "online" : "online-result"
}

def onConnect(ws):
    print("connect success, now login")
    createOnlineInfo()
    return True

def checkSid(msg):
    if sessionId != "" and msg["sessionId"] != sessionId:
        print("sessionId is different, local:", sessionId, ", remote:", msg["sessionId"])
        return False
    return True

def delNeedGetResultMsgs(msg):
    needGetResultMsgsLock.acquire()

    delList = []
    for info in needGetResultMsgs:
        if msg["msgType"] == msgTypePair[info["msgType"]]:
            if msg["msgType"] != "heartbeat-result":
                delList.append(info)
            elif msg["time"] == info["time"]:
                delList.append(info)
    # print("delList:", delList)
    for info in delList:
        needGetResultMsgs.remove(info)
    needGetResultMsgsLock.release()    

def onMessage(ws, msg):
    # print("omMessage:", msg)
    global sessionId
    msg = json.loads(msg)
    if not checkSid(msg):
        return False
    type = msg["msgType"]
    if type == "register-result":
        if msg["code"] != 200:
            print("error, code:", msg["code"])
            return False
        sessionId = msg["sessionId"]
        print("connect server, sessionId:", sessionId)
        # start heartbeat
        global hasConnected
        hasConnected = True
        heartCondition.acquire()
        heartCondition.notify()
        heartCondition.release()

    elif type == "command":
        msgs = {}
        msgs["request"] = msg["request"]
        msgs["taskId"] = msg["taskId"]
        
        callback("command", msgs)
    # elif type == "offline-result":
    #     callback("offline-result")
    elif type == "offline" and msg["type"] == 1:
        print("serv ask this node offline, reason:", msg["reason"])
        callback("offline", None)
        global servAskOffline
        servAskOffline = True
    delNeedGetResultMsgs(msg)
    return True

def onDisconnect(ws, close_status_code, close_msg):
    if running:
        print("disconnect, need restart, code", close_status_code, ", msg:", close_msg)
        global hasConnected
        hasConnected = False
        if not servAskOffline:
            time.sleep(0.5)
            threading.Thread(target=creatConnection).start()
    return True

def onDisconnectInLinux(ws):
    if running:
        print("disconnect, need restart")
        global hasConnected
        hasConnected = False
        if not servAskOffline:
            time.sleep(0.5)
            threading.Thread(target=creatConnection).start()
    return True

def onError(ws, err):
    print("websocket error:", err)

def getMessageBody():
    global msgBody
    f = open(os.path.join(currentDir, "messageBody.json"), "r", encoding="utf-8")
    msgBody = json.load(f)

# create socketIo connection
def creatConnection():
    global ws, needSendMsgs, needGetResultMsgs, sessionId
    needSendMsgs = []
    needGetResultMsgs = []
    sessionId = ""
    if sys.platform == "win32":
        ws = websocket.WebSocketApp(servAddr, on_open=onConnect, on_message=onMessage, on_close=onDisconnect, on_error=onError)
    elif sys.platform.startswith('linux'):
        ws = websocket.WebSocketApp(servAddr, on_open=onConnect, on_message=onMessage, on_close=onDisconnectInLinux, on_error=onError)
    ws.run_forever()
    print("create socketio over")
    
        # threading.Thread(target=creatConnection).start()
    return True

def appendMsg(msg):
    global needSendMsgs
    needSendMsgsLock.acquire()
    needSendMsgs.append(msg)
    needSendMsgsLock.release()

# heartbeat
def Heartbeat():
    while running:
        if hasConnected:
            heartbeatMsg = dict(msgBody["nodeHeartbeat"])
            heartbeatMsg["sessionId"] = sessionId
            heartbeatMsg["time"] = str(timeNow())
            heartbeatMsg["status"] = heartbeatStatus
            appendMsg(heartbeatMsg)
        heartCondition.acquire()
        heartCondition.wait(4)
    print("heartbeat over")
    return True

# register
def createOnlineInfo():
    onlineMsg = dict(msgBody["nodeRegister"])
    onlineMsg["apiKey"] = apiKey
    onlineMsg["nodeName"] = nodeName
    appendMsg(onlineMsg)
    return True

# webui offline
def createNodeOfflineInfo():
    global heartbeatStatus
    heartCondition.acquire()
    heartbeatStatus = webuiStatus["offline"]
    heartCondition.notify()
    heartCondition.release()
    return True

# webui online
def createNodeOnlineInfo():
    global heartbeatStatus
    heartCondition.acquire()
    heartbeatStatus = webuiStatus["online"]
    heartCondition.notify()
    heartCondition.release()
    return True

def createCommandResult(msg):
    commandResult = dict(msgBody["nodeCommandResult"])
    commandResult["sessionId"] = sessionId
    commandResult["taskId"] = msg.get("taskId")
    commandResult["result"] = msg.get("result")
    appendMsg(commandResult)
    return True

def createServAskOfflineResult():
    offlineResult = dict(msgBody["servAskOfflineResult"])
    offlineResult["sessionId"] = sessionId
    appendMsg(offlineResult)
    return True

def sendMsgs():
    global needSendMsgs, needGetResultMsgs
    while running:
        time.sleep(0.2)
        needSendMsgsLock.acquire()
       
        needResultMsgsCopy = []
        needSaveMsgs = []
        # print("needSendMsgs:", needSendMsgs)
        for msg in needSendMsgs:
            msgStr = json.dumps(msg)
            try:
                ws.send(msgStr)
                msg["sendTime"] = timeNow()
                if (msg["msgType"] != "command-result") and (msg["msgType"] != "offline-result"):
                    needResultMsgsCopy.append(msg)
            except Exception as e:
                print("send msg error:", e, ", msg:", msg)
                needSaveMsgs.append(msg)
        needSendMsgs = needSaveMsgs
        needSendMsgsLock.release()
        
        needGetResultMsgsLock.acquire()
        needGetResultMsgs.extend(needResultMsgsCopy) 
        needGetResultMsgsLock.release()
    print("sendMsgs over")
    return True

def timerCheck():
    global needGetResultMsgs
    while running:
        time.sleep(0.5)
        needGetResultMsgsLock.acquire()
        needDel = []
        for msg in needGetResultMsgs:
            type = msg["msgType"]
            if type == "heartbeat":
                if (timeNow() - msg["sendTime"]) > 5:
                    print("heart msgs block, need send register again")
                    needDel.append(msg)
                    # ws.close()
                    # continue
            elif (timeNow() - msg["sendTime"]) > 3:
                print("msg no response, need resend")
                copyMsg = dict(msg)
                copyMsg.pop("sendTime")
                # don't check this msg again
                appendMsg(copyMsg)
                needDel.append(msg)
        
        for msg in needDel:
            needGetResultMsgs.remove(msg)

        needGetResultMsgsLock.release()
    print("timerCheck over")
    return True

def timeNow():
    return int(time.time())

def stop():
    global running
    createServAskOfflineResult()
    time.sleep(1)
    print("stop servConnection!!!!!!!!!!!!!")
    running = False
    ws.close()

def startConnection(addr, key, name, cb):
    global apiKey,nodeName, callback, servAddr
    apiKey = key
    nodeName = name
    callback = cb
    servAddr = addr
    getMessageBody()
    threading.Thread(target=sendMsgs).start()
    threading.Thread(target=timerCheck).start()
    threading.Thread(target=Heartbeat).start()

    threading.Thread(target=creatConnection).start()

if __name__ == "__main__" :
    startConnection("ws://127.0.0.1:8888", "111", "222", None)
   
    