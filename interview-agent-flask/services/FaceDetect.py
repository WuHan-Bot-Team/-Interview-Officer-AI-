# -*- coding: utf-8 -*-
import json

import requests
import time
import hashlib
import base64

# 人脸特征分析表情webapi接口地址
URL = "http://tupapi.xfyun.cn/v1/expression"
# 应用ID  (必须为webapi类型应用，并人脸特征分析服务，参考帖子如何创建一个webapi应用：http://bbs.xfyun.cn/forum.php?mod=viewthread&tid=36481)
APPID = "ac2532df"
# 接口密钥 (webapi类型应用开通人脸特征分析服务后，控制台--我的应用---人脸特征分析---服务的apikey)
API_KEY = "3c01f5920b924cf1f2ea452c9b9b0983"
ImageName = "img.jpg"
# FilePath = r"C:\Users\Admin\Desktop\1539656523.png"
# 图片数据可以通过两种方式上传，第一种在请求头设置image_url参数，第二种将图片二进制数据写入请求体中。若同时设置，以第一种为准。
# 此demo使用第一种方式进行上传图片地址，如果想使用第二种方式，将图片二进制数据写入请求体即可。

bendiimage="2.jpg"

def getHeader(image_name, image_url=None):
    curTime = str(int(time.time()))
    # print("curTime:", curTime)
    param = "{\"image_name\":\"" + image_name + "\",\"image_url\":\"\"}"
    paramBase64 = base64.b64encode(param.encode('utf-8'))
    tmp = str(paramBase64, 'utf-8')
    m2 = hashlib.md5()
    m2.update((API_KEY + curTime + tmp).encode('utf-8'))
    checkSum = m2.hexdigest()

    header = {
        'X-CurTime': curTime,
        'X-Param': paramBase64,
        'X-Appid': APPID,
        'X-CheckSum': checkSum,
    }
    return header

def getBody(filePath):
    binfile = open(filePath, 'rb')
    data = binfile.read()
    return data

def facial_detect(bendiimage=""):
    if not bendiimage:
        return "请输入图片路径"
    '''
    需要启用接口时，解开下两行注释，并注释第三行
    '''
    # response = requests.post(URL, headers=getHeader(ImageName, ""), data=getBody(bendiimage))
    # res = response.content
    res = b'{"code":0,"data":{"fileList":[{"code":0,"file_name":"/cloud-api/storage-weed201/2025-06-29/15-7/5ba9e2d5b80487a3fda9f10b/17511808577860.05705165842072746.jpeg","label":0,"labels":[],"name":"img.jpg","rate":0.2993952,"rates":[0.2993952,0.095906556,0.25659272,0.023318144,0.10905228,0.060586903,0.018070705,0.13707751],"review":true,"subLabels":[]}],"reviewCount":1,"statistic":[1,0,0,0,0,0,0,0]},"desc":"success","sid":"tup000208d4@dx435f1bbc3239a00100"}'

    # 步骤1：将字节字符串解码为普通字符串（UTF-8编码）
    json_str = res.decode('utf-8')

    # 步骤2：将JSON字符串解析为Python字典
    data_dict = json.loads(json_str)
    if data_dict['code'] == 0:
        statistic_array = data_dict['data']['statistic']
        print(statistic_array)
        print(type(statistic_array))
        return statistic_array
    else:
        return [0,0,0,0,0,0,0,0]


def add_arrays(arr1, arr2):
    return [a + b for a, b in zip(arr1, arr2)]

# facial_detect(bendiimage)

# print(r.content)

