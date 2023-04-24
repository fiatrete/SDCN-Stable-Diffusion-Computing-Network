import websocket
import json
import threading
import time
import os
import inspect

running = True
serv_adk_offline = False
msg_body = {}
api_key = ""
node_name = ""
need_send_msgs = []
# Add the sendtime field on top of need_send_msgs to determine if the message has timed out
need_get_result_msgs = []
session_id = ""
need_send_msgs_lock = threading.Lock()
need_get_result_msgs_lock = threading.Lock()
current_dir = os.path.dirname(inspect.getfile(inspect.currentframe()))
heart_condition = threading.Condition()
heartbeat_status = 1
has_connected = False
webui_status = {
    "offline": 0,
    "online": 1
}
msg_type_pair = {
    "register": "register-result",
    "heartbeat": "heartbeat-result",
    "offline": "offline-result",
    "online": "online-result"
}


def on_connect(ws):
    print("connect success, now login")
    create_online_info()
    return True


def check_sid(msg):
    if session_id != "" and msg["sessionId"] != session_id:
        print("session_id is different, local:", session_id, ", remote:", msg["sessionId"])
        return False
    return True


def del_need_get_result_msgs(msg):
    need_get_result_msgs_lock.acquire()

    delList = []
    for info in need_get_result_msgs:
        if msg["msgType"] == msg_type_pair[info["msgType"]]:
            if msg["msgType"] != "heartbeat-result":
                delList.append(info)
            elif msg["time"] == info["time"]:
                delList.append(info)
    # print("delList:", delList)
    for info in delList:
        need_get_result_msgs.remove(info)
    need_get_result_msgs_lock.release()


def on_message(ws, msg):
    # print("omMessage:", msg)
    global session_id
    msg = json.loads(msg)
    if not check_sid(msg):
        return False
    type = msg["msgType"]
    if type == "register-result":
        if msg["code"] != 200:
            print("error, code:", msg["code"])
            return False
        session_id = msg["sessionId"]
        print("connect server, session_id:", session_id)
        # start heartbeat
        global has_connected
        has_connected = True
        heart_condition.acquire()
        heart_condition.notify()
        heart_condition.release()

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
        global serv_adk_offline
        serv_adk_offline = True
    del_need_get_result_msgs(msg)
    return True


def on_disconnect(ws, close_status_code, close_msg):
    if running:
        print("disconnect, need restart, code", close_status_code, ", msg:", close_msg)
        global has_connected
        has_connected = False
        if not serv_adk_offline:
            time.sleep(0.5)
            threading.Thread(target=create_connection).start()
    return True


def on_error(ws, err):
    print("websocket error:", err)


def get_message_body():
    global msg_body
    f = open(os.path.join(current_dir, "messageBody.json"), "r", encoding="utf-8")
    msg_body = json.load(f)


# create socketIo connection
def create_connection():
    global ws, need_send_msgs, need_get_result_msgs, session_id
    need_send_msgs = []
    need_get_result_msgs = []
    session_id = ""
    ws = websocket.WebSocketApp(servAddr,
                                on_open=on_connect,
                                on_message=on_message,
                                on_close=on_disconnect,
                                on_error=on_error)
    ws.run_forever()
    print("create socketio over")
    return True


def append_msg(msg):
    global need_send_msgs
    need_send_msgs_lock.acquire()
    need_send_msgs.append(msg)
    need_send_msgs_lock.release()


# heartbeat
def heartbeat():
    while running:
        if has_connected:
            heartbeatMsg = dict(msg_body["nodeHeartbeat"])
            heartbeatMsg["sessionId"] = session_id
            heartbeatMsg["time"] = str(time_now())
            heartbeatMsg["status"] = heartbeat_status
            append_msg(heartbeatMsg)
        heart_condition.acquire()
        heart_condition.wait(4)
    print("heartbeat over")
    return True


# register
def create_online_info():
    onlineMsg = dict(msg_body["nodeRegister"])
    onlineMsg["apiKey"] = api_key
    onlineMsg["nodeName"] = node_name
    append_msg(onlineMsg)
    return True


# webui offline
def create_node_offline_info():
    global heartbeat_status
    heart_condition.acquire()
    heartbeat_status = webui_status["offline"]
    heart_condition.notify()
    heart_condition.release()
    return True


# webui online
def create_node_online_info():
    global heartbeat_status
    heart_condition.acquire()
    heartbeat_status = webui_status["online"]
    heart_condition.notify()
    heart_condition.release()
    return True


def create_command_result(msg):
    commandResult = dict(msg_body["nodeCommandResult"])
    commandResult["sessionId"] = session_id
    commandResult["taskId"] = msg.get("taskId")
    commandResult["result"] = msg.get("result")
    append_msg(commandResult)
    return True


def create_serv_adk_offline_result():
    offlineResult = dict(msg_body["servAskOfflineResult"])
    offlineResult["sessionId"] = session_id
    append_msg(offlineResult)
    return True


def send_msgs():
    global need_send_msgs, need_get_result_msgs
    while running:
        time.sleep(0.2)
        need_send_msgs_lock.acquire()

        need_result_msgs_copy = []
        need_save_msgs = []
        # print("need_send_msgs:", need_send_msgs)
        for msg in need_send_msgs:
            msgStr = json.dumps(msg)
            try:
                ws.send(msgStr)
                msg["sendTime"] = time_now()
                if (msg["msgType"] != "command-result") and (msg["msgType"] != "offline-result"):
                    need_result_msgs_copy.append(msg)
            except Exception as e:
                print("send msg error:", e, ", msg:", msg)
                need_save_msgs.append(msg)
        need_send_msgs = need_save_msgs
        need_send_msgs_lock.release()
        need_get_result_msgs_lock.acquire()
        need_get_result_msgs.extend(need_result_msgs_copy)
        need_get_result_msgs_lock.release()
    print("send_msgs over")
    return True


def timer_check():
    global need_get_result_msgs
    while running:
        time.sleep(0.5)
        need_get_result_msgs_lock.acquire()
        needDel = []
        for msg in need_get_result_msgs:
            type = msg["msgType"]
            if type == "heartbeat":
                if (time_now() - msg["sendTime"]) > 5:
                    print("heart msgs block, need send register again")
                    needDel.append(msg)
                    # ws.close()
                    # continue
            elif (time_now() - msg["sendTime"]) > 3:
                print("msg no response, need resend")
                copyMsg = dict(msg)
                copyMsg.pop("sendTime")
                # don't check this msg again
                append_msg(copyMsg)
                needDel.append(msg)

        for msg in needDel:
            need_get_result_msgs.remove(msg)

        need_get_result_msgs_lock.release()
    print("timer_check over")
    return True


def time_now():
    return int(time.time())


def stop():
    global running
    create_serv_adk_offline_result()
    time.sleep(1)
    print("stop servConnection!!!!!!!!!!!!!")
    running = False
    ws.close()


def start_connection(addr, key, name, cb):
    global api_key, node_name, callback, servAddr
    api_key = key
    node_name = name
    callback = cb
    servAddr = addr
    get_message_body()
    threading.Thread(target=send_msgs).start()
    threading.Thread(target=timer_check).start()
    threading.Thread(target=heartbeat).start()

    threading.Thread(target=create_connection).start()


if __name__ == "__main__":
    start_connection("ws://127.0.0.1:8888", "111", "222", None)
    