import os
import json
import inspect
import threading
import time
import websocket_server
import base64

current_dir = os.path.dirname(inspect.getfile(inspect.currentframe()))

lock = threading.Lock()
# eventlet.monkey_patch()
msgs = []
msgBody = {}

params = {
    "prompt": "(8k, RAW photo, best quality, masterpiece:1.2), (realistic, photo-realistic:1.37),1 girl,(Kpop idol), (aegyo sal:1),hair ornament, portrait, cute, night, professional lighting, photon mapping, radiosity, physically-based rendering, thighhighs, smile, pose, long hair, (sexy shorts),cat ear, wavy hair, warm light, shiny eyes,(ulzzang-6500:0.725), pureerosface_v1,detailed clothes,cleavage, (scattered sakura petals:1.331),(nude:1), (PureErosFace_V1:0.5), pov, nsfw, bed, slim legs, loving, (black hair:1.4)",
    "loras": [
        ["62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c", 0.5],
        ["3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac", 0.7]
    ],
    "seed": -1,
    "sampler_name": "DPM++ SDE Karras",
    "steps": 10,
    "cfg_scale": 7,
    "width": 600,
    "height": 800,
    "negative_prompt": "sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, bad anatomy,DeepNegative,(fat:1.2),facing away, looking away,tilted head, {Multiple people}, lowres,bad anatomy,bad hands, text, error, missing fingers,extra digit, fewer digits, cropped, worstquality, low quality, normal quality,jpegartifacts,signature, watermark, username,blurry,bad feet,cropped,poorly drawn hands,poorly drawn face,mutation,deformed,worst quality,low quality,normal quality,jpeg artifacts,signature,watermark,extra fingers,fewer digits,extra limbs,extra arms,extra legs,malformed limbs,fused fingers,too many fingers,long neck,cross-eyed,mutated hands,polar lowres,bad body,bad proportions,gross proportions,text,error,missing fingers,missing arms,missing legs,extra digit, extra arms,wrong hand",
    "model": "3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401",
    "upscale": {
        "denoising_strength": 0.5,
        "scale": 1.5,
        "upscaler": "Latent",
    }
}


def connect(client, server):
    print("New client connected and was given id %d" % client['id'])
    global sessionId
    sessionId = "111hhh"
    threading.Thread(target=emit_msg).start()
    global client1
    client1 = client


def disconnect(client, server):
    print("Client(%d) disconnected" % client['id'])


def error():
    return True


def message(client, server, data):
    data = json.loads(data)
    print('Message received:', data)
    msgtype = data["msgType"]
    if msgtype == "register":
        re = msgBody["servRegisterResult"]
        re["sessionId"] = str(sessionId)
        re["code"] = 200
        co = create_command()
        threading.Thread(target=send_command, args=(5, co)).start()
        # threading.Thread(target=send_command, args=(10, co)).start()
        threading.Thread(target=send_offline, args=(10,)).start()
    if msgtype == "heartbeat":
        re = msgBody["servHeartbeatResult"]
        re["sessionId"] = data["sessionId"]
        re["time"] = data["time"]
    if msgtype == "command-result":
        result = data["result"]
        if "data" in result.keys():
            print(1)
            images = result.get("data").get("images")
            print(2)
            for index, img in zip(range(len(images)), images):
                print(3)
                da = base64.b64decode(img)
                with open(f"{index}.png", "wb") as f:
                    print(4)
                    f.write(da)
        return
    if msgtype == "offline-result":
        return
    # sio.emit('message', json.dumps(re), room=sessionId)
    # eventlet.spawn(other_function, sessionId, re)
    put_msg(re)


def other_function(sid, data):
    print("emit data")
    server1.send(json.dumps(data))


def send_command(t, data):
    time.sleep(t)
    print("seng command, sid:{sessionId}")
    put_msg(data)


def send_offline(t):
    time.sleep(t)
    re = msgBody["servAskOffline"]
    re["sessionId"] = sessionId
    re["reason"] = "kick offline"
    put_msg(re)


def create_command():
    re = msgBody["servCommand"]
    re["sessionId"] = sessionId
    re["taskId"] = "taskId"
    re["request"] = {
        "type": "sd",
        "uri": "/sdapi/v1/txt2img",
        "data": params
    }
    return re


def put_msg(info):
    lock.acquire()
    global msgs
    msgs.append(info)
    # print("put_msg:", msgs)
    lock.release()


def emit_msg():
    print("start emitmsg")
    global msgs
    global sessionId
    while True:
        time.sleep(0.5)
        lock.acquire()
        for info in msgs:
            print("emit msg:", info, ", sid:", sessionId)
            server1.send_message(client1, json.dumps(info))
        msgs.clear()
        lock.release()


def get_message_body():
    global msgBody
    dir = os.path.dirname(current_dir)
    f = open(os.path.join(dir, "messageBody.json"), "r", encoding="utf-8")
    msgBody = json.load(f)


if __name__ == '__main__':
    get_message_body()
    # th = threading.Thread(target=emit_msg)
    # th.start()
    # wsgi.server(eventlet.listen(('localhost', 12345)), app)
    global server1
    server1 = websocket_server.WebsocketServer(port=12345, host='127.0.0.1')
    server1.set_fn_new_client(connect)
    server1.set_fn_client_left(disconnect)
    server1.set_fn_message_received(message)
    # Start the server
    server1.run_forever()
