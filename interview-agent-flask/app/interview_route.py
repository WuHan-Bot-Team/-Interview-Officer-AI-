import glob
import json
import os
import subprocess
from flask import Blueprint, logging, request, Response, jsonify, send_from_directory, stream_with_context
import PyPDF2
import time
import docx
from io import BytesIO
from avatar import AipaasAuth
from services.DeepSeek import DeepseekAPI
from services.SparkPractice import AIPracticeAPI
from avatar.AvatarWebSocket import avatarWebsocket
from services.FaceDetect import facial_detect, add_arrays
import threading

interview_bp = Blueprint('interview', __name__)

UPLOAD_FOLDER_FACE_ROUTE = 'resource/face_image/'
hls_FOLDER_FILE = 'resource/stream/playlist.m3u8'
# 使用绝对路径确保能找到反馈文件
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEEDBACK_FOLDER_ROUTE = os.path.join(BASE_DIR, 'resource', 'feedback')
user_info = {
    "major": "",
    "intention": "",
    "job_description": "",
    "deepseek_history": [],
}
facial_expression_list = [0,0,0,0,0,0,0,0]
facial_expression_label = ["其他(非人脸表情图片)","其他表情","喜悦","愤怒","悲伤","惊恐","厌恶","中性"]
wsclient = None

@interview_bp.route('/init', methods=['POST'])
def init():
    global user_info
    data = request.get_json()
    major = data.get('major')
    intention = data.get('intention')
    job_description = data.get('job_description')
    if not all([major, intention, job_description]):
        return jsonify({'error': 'Missing required fields'}), 400
    # 清空全局数据
    user_info.clear()
    user_info['major'] = major
    user_info['intention'] = intention
    user_info['job_description'] = job_description
    # 初始化deepseek历史聊天记录结构
    user_info['deepseek_history'] = []
    print("user_info初始化:",user_info)
    return initdeepseek()



@interview_bp.route('/image_detect', methods=['POST'])
def image_detect():
    global facial_expression_list
    if 'file' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    file = request.files['file']
    timestamp = request.form.get('timestamp', '')
    print(timestamp)
    print(file.filename)
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        save_path = os.path.join(UPLOAD_FOLDER_FACE_ROUTE, file.filename+"_"+timestamp + '.jpg')
        file.save(save_path)
        # if False:
        facial_expression = facial_detect(save_path)
        facial_expression_list = add_arrays(facial_expression_list, facial_expression)
        return jsonify({'content': 'Success'})
    return jsonify({'error': 'Invalid file type. Only image files are allowed.'}), 400


def initdeepseek():
    global user_info
    # 获取历史对话记录
    history = user_info.get('deepseek_history', [])
    # 读取 prompt.txt 内容 - 使用绝对路径
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prompt_path = os.path.join(base_dir, 'services', 'prompt.txt')
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            prompt = f.read()
    except Exception as e:
        print(f"Failed to read prompt.txt from {prompt_path}: {str(e)}")
        return jsonify({'error': f'Failed to read prompt.txt: {str(e)}'}), 500
    print(prompt)
    # 将 prompt 加入历史记录
    history.append({"role": "user", "content": prompt})
    user_info['deepseek_history'] = history
    # 调用 DeepseekAPI 的 chatwithhistory
    try:
        print("正在调用 DeepseekAPI...")
        response = DeepseekAPI.getInstance().chat_with_history(history)
        print(f"DeepseekAPI 响应: {response}")
        # 驱动数字人进行开场白
        send_text_in_thread("您好，欢迎来到面试室，我是本轮面试的面试官，请简要介绍一下自己吧!")
        if response:
            user_info['deepseek_history'].append(response)
            print("历史对话初始化1:", user_info['deepseek_history'])
            # 传递 major, intention, job_description，开启第二轮对话
            major = user_info.get('major', '')
            intention = user_info.get('intention', '')
            job_description = user_info.get('job_description', '')
            second_prompt = f"专业：{major}\n求职意向：{intention}\n岗位职责：{job_description}\n请根据这些信息定制合理的面试内容。你这次只需要回复'您好，我是本轮面试的面试官，请简要介绍一下自己吧!'"
            user_info['deepseek_history'].append({"role": "user", "content": second_prompt})
            print("正在调用第二轮 DeepseekAPI...")
            second_response = DeepseekAPI.getInstance().chat_with_history(user_info['deepseek_history'])
            print(f"第二轮 DeepseekAPI 响应: {second_response}")
            if second_response:
                user_info['deepseek_history'].append(second_response)
                print("历史对话初始化2:", user_info['deepseek_history'])
                return jsonify({'content': second_response.content})
            else:
                print("第二轮 DeepseekAPI 调用返回空响应")
                return jsonify({'error': 'Second DeepseekAPI call returned empty response'}), 500
        else:
            print("首轮 DeepseekAPI 调用返回空响应")
            return jsonify({'error': 'First DeepseekAPI call returned empty response'}), 500

    except Exception as e:
        return jsonify({'error': f'Failed to call DeepseekAPI: {str(e)}'}), 500
    return jsonify({'content': second_response.content})


def send_text_in_thread(text):
    global wsclient
    def target(wsclient: avatarWebsocket, text):
        print("进入")
        print(wsclient.streamUrl)
        if wsclient is not None:
            wsclient.sendDriverText(text)
    if wsclient is not None:
        thread = threading.Thread(target=lambda: target(wsclient, text))
        thread.start()

@interview_bp.route('/answer', methods=['GET'])
def answer():
    global user_info
    # 获取历史对话记录
    user_message = request.args.get('message', default="", type=str)
    user_info['deepseek_history'].append({"role": "user", "content": user_message})
    try:
        response = DeepseekAPI.getInstance().chat_with_history(deepseek_history=user_info['deepseek_history'])
        if response:
            user_info['deepseek_history'].append(response)
            send_text_in_thread(response.content)
    except Exception as e:
        return jsonify({'error': f'Failed to call DeepseekAPI: {str(e)}'}), 500
    return jsonify({'content': response.content})



@interview_bp.route('/init_shuziren', methods=['GET'])
def init_shuziren():
    global wsclient
    if wsclient is not None:
        print("启动process")
        rtmp_to_hls(wsclient.streamUrl, hls_FOLDER_FILE)
        return jsonify({'content': "true"})
    url = 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact'
    appId = 'a9730a45'
    appKey = 'fe16118b2de28ee8fff8046b015e3358'
    appSecret = 'NmJkYjU3OTI1NDRlNDViOWY1NjYyYzMx'
    anchorId = 'cnr5dg8n2000000003'
    vcn = 'x4_xiaozhong'
    authUrl = AipaasAuth.assemble_auth_url(url, 'GET', appKey, appSecret)
    wsclient = avatarWebsocket(authUrl, protocols='', headers=None)
    try:
        wsclient.appId = appId
        wsclient.anchorId = anchorId
        wsclient.vcn = vcn
        wsclient.start()
        while not wsclient.streamUrl:
            time.sleep(1)
            pass
        print(wsclient.streamUrl)
        rtmp_to_hls(wsclient.streamUrl, hls_FOLDER_FILE)
        return jsonify({'content': "true"})

    except Exception as e:
        print('receive error')
        print(e)
        wsclient.close()
        return jsonify({'error': f'Failed to connect wss: {str(e)}'}), 500

def rtmp_to_hls(input_rtmp_url, output_hls_path):
    """
    将 RTMP 流转换为 HLS 格式
    
    参数:
        input_rtmp_url: 输入RTMP地址 (e.g. "rtmp://example.com/live/stream")
        output_hls_path: 输出HLS目录和文件名 (e.g. "static/stream/playlist.m3u8")
    """
    
    ffmpeg_cmd = [
        'ffmpeg',
        '-i', input_rtmp_url,          # 输入源
        '-c:v', 'libx264',             # 视频编码
        '-c:a', 'aac',                 # 音频编码
        '-f', 'hls',                   # 输出格式为HLS
        '-hls_time', '1',              # 每个TS切片2秒
        '-hls_list_size', '6',         # 播放列表保留3个片段
        '-hls_flags', 'delete_segments+append_list', # 自动删除旧片段
        output_hls_path                # 输出路径
    ]
    try:
        # 启动FFmpeg进程
        process = subprocess.Popen(
            ffmpeg_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
                    
        return process
    except Exception as e:
        print(f"Error: {e}")
        return None


# 请求hls推流文件
@interview_bp.route('/video/<path:filename>')
def video(filename):
    return send_from_directory('resource/stream', filename)

# 删除websocket连接
@interview_bp.route('/del_wss', methods=['GET'])
def del_wss():
    global wsclient
    if wsclient is not None:
        print("成功关闭")
        wsclient.close()
    delete_files_in_folder('resource/stream')
    return jsonify({"content":"true"})



@interview_bp.route('/feedback', methods=['GET'])
def feedback():
    global user_info
    if len(user_info['deepseek_history'])<=3:
        return jsonify({'error': 'no history'}), 500
    
    # 读取 prompt.txt 内容
    prompt_path = os.path.join('services', 'feedbackPrompt.txt')
    try:
        with open(prompt_path, 'r', encoding='utf-8') as f:
            prompt = f.read()
            # prompt+=user_info['deepseek_history'][3:]
    except Exception as e:
        return jsonify({'error': f'Failed to read prompt.txt: {str(e)}'}), 500
    try:
        response = DeepseekAPI.getInstance().chat_return_json(prompt)
        if response:
            print(response.content)
            timestamp = int(time.time())
            filename = f"feedback-{timestamp}.txt"
            filepath = os.path.join(FEEDBACK_FOLDER_ROUTE, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(response.content)
    except Exception as e:
        return jsonify({'error': f'Failed to call DeepseekAPI: {str(e)}'}), 500
    return jsonify({'content': response.content})

@interview_bp.route('/recent_feedbacks',methods=['GET'])
def get_recent_feedbacks():
    """获取最近的反馈记录"""
    try:
        # 使用绝对路径查找反馈文件
        feedback_files = glob.glob(os.path.join(FEEDBACK_FOLDER_ROUTE, "*.txt"))
        
        # 添加调试信息
        print(f"查找路径: {FEEDBACK_FOLDER_ROUTE}")
        print(f"找到文件数量: {len(feedback_files)}")
        print(f"文件列表: {feedback_files}")
        
        if not feedback_files:
            return jsonify({
                'error': 'no feedback record',
                'debug_info': {
                    'search_path': FEEDBACK_FOLDER_ROUTE,
                    'path_exists': os.path.exists(FEEDBACK_FOLDER_ROUTE),
                    'files_found': len(feedback_files)
                }
            }), 500
            
        # 按修改时间降序排序
        sorted_files = sorted(feedback_files, key=os.path.getmtime, reverse=True)
        recent_files = sorted_files[:5]  # 获取最近的5个文件
        feedbacks = []
        for file in recent_files:       
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    feedbacks.append({'filename': os.path.basename(file), 'content': content})
            except Exception as e:
                return jsonify({'error': f'Failed to read {file}: {str(e)}'}), 500
        return jsonify(feedbacks)
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve feedbacks: {str(e)}'}), 500


@interview_bp.route('/feedback2', methods=['GET'])
def feedback2():
    global user_info
    txt_files = glob.glob(os.path.join(FEEDBACK_FOLDER_ROUTE, "*.txt"))
    
    if not txt_files:
        return jsonify({'error': 'no feedback record'}), 500
    
    latest_file = max(txt_files, key=os.path.getmtime)
    print(latest_file)
    try:
        with open(latest_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return jsonify({'error': f'Failed to read feedback.txt: {str(e)}'}), 500
    return jsonify({'content': content})


def delete_files_in_folder(folder_path):
    files = glob.glob(os.path.join(folder_path, '*'))
    for f in files:
        if os.path.isfile(f):
            os.remove(f)

   
   
