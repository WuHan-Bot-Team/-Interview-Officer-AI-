# -*- coding: utf-8 -*-
import time
import uuid
import queue
import json
from ws4py.client.threadedclient import WebSocketClient
from ws4py.client.threadedclient import WebSocketBaseClient
import _thread
from avatar import AipaasAuth
# import avatar.AipaasAuth
import threading
import cv2


class avatarWebsocket(WebSocketClient, threading.Thread):

    def __init__(self, url, protocols=None, extensions=None, heartbeat_freq=None, ssl_options=None, headers=None,
                 exclude_headers=None, parent=None):
        WebSocketBaseClient.__init__(self, url, protocols=None, extensions=None, heartbeat_freq=None, ssl_options=None,
                                     headers=None, exclude_headers=None)
        threading.Thread.__init__(self)
        self._th = threading.Thread(target=super().run, name='WebSocketClient')
        self._th.daemon = True
        self.appId = ''
        self.vcn = ''
        self.anchorId = ''
        self.dataList = queue.Queue(maxsize=100)
        self.status = True
        self.linkConnected = False
        self.avatarLinked = False
        self.streamUrl = ''

    def run(self):
        try:
            self.connect()
            self.connectAvatar()
            _thread.start_new_thread(self.send_Message, ())
            while self.status and not self.terminated:
                self._th.join(timeout=0.1)
        except Exception as e:
            self.status = False
            print(e)

    def stop(self):
        self.status = False
        self.close(code=1000)

    def send_Message(self):
        """
        send msg to server, if no message to send, send ping msg
        :return:
        """
        while self.status:
            if self.linkConnected:
                try:
                    if self.avatarLinked:
                        task = self.dataList.get(block=True, timeout=5)
                        print('%s send msg: %s' % (time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())), task))
                        self.send(task)
                except queue.Empty:
                    if self.status and self.avatarLinked:
                        self.send(self.getPingMsg())
                    else:
                        time.sleep(0.1)
                except AttributeError:
                    pass
            else:
                time.sleep(0.1)

    def sendDriverText(self, driverText):
        """
        send text msg, interactive_mode default 0
        :param driverText:
        :return:
        """
        try:
            print("发送文本：", driverText)
            textMsg = {
                "header": {
                    "app_id": self.appId,
                    "request_id": str(uuid.uuid4()),
                    "ctrl": "text_driver"
                },
                "parameter": {
                    "tts": {
                        "vcn": self.vcn
                    },
                    "avatar_dispatch": {
                        "interactive_mode": 0
                    }
                },
                "payload": {
                    "text": {
                        "content": driverText
                    }
                }
            }
            self.dataList.put_nowait(json.dumps(textMsg))
        except Exception as e:
            print(e)

    def connectAvatar(self):
        """
        send avatar start Msg
        :return:
        """
        try:
            startMsg = {
                "header": {
                    "app_id": self.appId,
                    "request_id": str(uuid.uuid4()),
                    "ctrl": "start"
                },
                "parameter": {
                    "tts": {
                        "vcn": self.vcn
                    },
                    "avatar": {
                        "stream": {
                            "protocol": "rtmp"
                        },
                        "avatar_id": self.anchorId
                    }
                }
            }
            print("%s send start request: %s" % (time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())), json.dumps(startMsg)))
            self.send(json.dumps(startMsg))
        except Exception as e:
            print(e)

    def getPingMsg(self):
        """
        :return: ping msg
        """
        pingMsg = {
            "header": {
                "app_id": self.appId,
                "request_id": str(uuid.uuid4()),
                "ctrl": "ping"
            },
        }
        return json.dumps(pingMsg)

    def opened(self):
        """
        ws connected, msg can be sent
        :return:
        """
        self.linkConnected = True

    def closed(self, code, reason=None):
        msg = 'receive closed, code: ' + str(code)
        print(msg)
        self.status = False

    def received_message(self, message):
        try:
            # print(message)
            data = json.loads(str(message))
            if data['header']['code'] != 0:
                self.status = False
                print('receive error msg: %s' % str(message))
            else:
                if 'avatar' in data['payload'] and data['payload']['avatar']['error_code'] == 0 and \
                        data['payload']['avatar']['event_type'] == 'stop':
                    raise BreakException()
                if 'avatar' in data['payload'] and data['payload']['avatar']['event_type'] == 'stream_info':
                    self.avatarLinked = True
                    print('avatar ws connected: %s \n' % str(message))
                    print('stream url: %s \n' % data['payload']['avatar']['stream_url'])
                    streamUrl = data['payload']['avatar']['stream_url']
                    self.streamUrl = streamUrl
                    # def play_stream(url):
                    #     cap = cv2.VideoCapture(url)
                    #     if not cap.isOpened():
                    #         print("Cannot open stream:", url)
                    #         return
                    #     while cap.isOpened():
                    #         ret, frame = cap.read()
                    #         if not ret:
                    #             print("Stream ended or cannot fetch frame.")
                    #             break
                    #         cv2.imshow('RTMP Stream', frame)
                    #         if cv2.waitKey(1) & 0xFF == ord('q'):
                    #             break
                    #     cap.release()
                    #     cv2.destroyAllWindows()

                    # threading.Thread(target=play_stream, args=(streamUrl,), daemon=True).start()
                if 'avatar' in data['payload'] and data['payload']['avatar']['event_type'] == 'pong':
                    pass
        except BreakException:
            print('receive error but continue')
        except Exception as e:
            print(e)


class BreakException(Exception):
    """自定义异常类，实现异常退出功能"""
    pass


if __name__ == '__main__':
    url = 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact'
    appId = 'a9730a45'
    appKey = 'fe16118b2de28ee8fff8046b015e3358'
    appSecret = 'NmJkYjU3OTI1NDRlNDViOWY1NjYyYzMx'
    anchorId = 'cnr5dg8n2000000003'
    vcn = 'x4_lingxiaoqi_oral'
    authUrl = AipaasAuth.assemble_auth_url(url, 'GET', appKey, appSecret)
    wsclient = avatarWebsocket(authUrl, protocols='', headers=None)
    try:
        wsclient.appId = appId
        wsclient.anchorId = anchorId
        wsclient.vcn = vcn
        wsclient.start()
        while wsclient.status and not wsclient.terminated:
            time.sleep(15)
            text = '你好，欢迎使用虚拟人'
            wsclient.sendDriverText(text)
    except Exception as e:
        print('receive error')
        print(e)
        wsclient.close()

