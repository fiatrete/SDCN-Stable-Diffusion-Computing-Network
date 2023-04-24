import threading
import json
import servConnection
import webuiConnection
import os
import inspect

current_dir = os.path.dirname(inspect.getfile(inspect.currentframe()))
# read config.json
config_info = {}

webui_setup_cond = threading.Condition()


def get_config():
    global config_info
    f = open(os.path.join(current_dir, "config.json"), "r", encoding="utf-8")
    try:
        config_info = json.loads(f.read())
        print(config_info)
    except Exception as e:
        print("config.json file maybe error, ", e)
        exit(0)
    return True


# wait for webui connection, after connect success, connect server
def start_serv_connection():
    webui_setup_cond.acquire()
    webui_setup_cond.wait()
    servConnection.start_connection(
        config_info["servAddr"],
        config_info["apiKey"],
        config_info["nodeName"],
        serv_conn_callback,
    )
    webui_setup_cond.release()


def start_webui_connection():
    webuiConnection.start_webui_con(
        config_info["webuiLocalUrl"],
        config_info["supportModels"],
        webui_conn_callback
    )


def webui_conn_callback(type, result):
    if type == "command":
        servConnection.create_command_result(result)
    elif type == "node_offline":
        servConnection.create_node_offline_info()
    elif type == "node_online":
        servConnection.create_node_online_info()
    elif type == "webui_setup":
        webui_setup_cond.acquire()
        webui_setup_cond.notify_all()
        webui_setup_cond.release()
    elif type == "stop":
        stop()
    return True


def serv_conn_callback(type, msg):
    if type == "command":
        webuiConnection.send_webui_api_request(msg)
    elif type == "offline":
        stop()
    # notify deal servmsg thread
    return True


def stop():
    servConnection.stop()
    webuiConnection.stop()
    return True


if __name__ == "__main__":
    if not get_config():
        exit(0)

    thread1 = threading.Thread(target=start_serv_connection)
    thread2 = threading.Thread(target=start_webui_connection)

    thread1.start()
    thread2.start()
