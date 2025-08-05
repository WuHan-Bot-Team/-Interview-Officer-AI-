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
from config.avatar_config import get_avatar_config, switch_to_backup
import threading

interview_bp = Blueprint('interview', __name__)

UPLOAD_FOLDER_FACE_ROUTE = 'resource/face_image/'
# 修复HLS文件路径 - 使用绝对路径确保FFmpeg能找到正确位置
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HLS_FOLDER = os.path.join(BASE_DIR, 'resource', 'stream')
HLS_PLAYLIST_FILE = os.path.join(HLS_FOLDER, 'playlist.m3u8')
FEEDBACK_FOLDER_ROUTE = os.path.join(BASE_DIR, 'resource', 'feedback')

# FFmpeg进程管理
ffmpeg_process = None
ffmpeg_lock = threading.Lock()

user_info = {
    "major": "",
    "intention": "",
    "job_description": "",
    "deepseek_history": [],
}
facial_expression_list = [0,0,0,0,0,0,0,0]
facial_expression_label = ["其他(非人脸表情图片)","其他表情","喜悦","愤怒","悲伤","惊恐","厌恶","中性"]
wsclient = None

def stop_ffmpeg_process():
    """停止FFmpeg进程"""
    global ffmpeg_process, ffmpeg_lock
    
    with ffmpeg_lock:
        if ffmpeg_process and ffmpeg_process.poll() is None:
            try:
                print("🛑 正在停止FFmpeg进程...")
                ffmpeg_process.terminate()
                
                # 等待进程正常终止
                try:
                    ffmpeg_process.wait(timeout=5)
                    print("✅ FFmpeg进程已正常终止")
                except subprocess.TimeoutExpired:
                    print("⚠️ FFmpeg进程未正常终止，强制结束...")
                    ffmpeg_process.kill()
                    ffmpeg_process.wait()
                    print("✅ FFmpeg进程已强制终止")
                    
            except Exception as e:
                print(f"❌ 停止FFmpeg进程时出错: {e}")
            finally:
                ffmpeg_process = None
        elif ffmpeg_process:
            print("🔍 FFmpeg进程已停止")
            ffmpeg_process = None
        else:
            print("🔍 没有运行中的FFmpeg进程")

def is_ffmpeg_running():
    """检查FFmpeg进程是否正在运行"""
    global ffmpeg_process
    return ffmpeg_process and ffmpeg_process.poll() is None

def cleanup_old_stream_files():
    """清理旧的流文件但保留目录结构"""
    try:
        if os.path.exists(HLS_FOLDER):
            for file in os.listdir(HLS_FOLDER):
                file_path = os.path.join(HLS_FOLDER, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
            print(f"🧹 已清理流文件目录: {HLS_FOLDER}")
    except Exception as e:
        print(f"⚠️ 清理流文件时出错: {e}")

def wait_for_hls_file(max_wait=15):
    """等待HLS文件生成"""
    wait_time = 0
    while wait_time < max_wait:
        if os.path.exists(HLS_PLAYLIST_FILE):
            # 检查文件是否有内容
            try:
                with open(HLS_PLAYLIST_FILE, 'r') as f:
                    content = f.read().strip()
                    if content and '#EXTM3U' in content:
                        print(f"✅ playlist.m3u8 已生成且有效: {HLS_PLAYLIST_FILE}")
                        return True
            except Exception as e:
                print(f"⚠️ 读取playlist.m3u8时出错: {e}")
        
        time.sleep(1)
        wait_time += 1
        print(f"⏳ 等待HLS文件生成... ({wait_time}/{max_wait})")
    
    print(f"❌ 等待超时，HLS文件未生成: {HLS_PLAYLIST_FILE}")
    return False

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



@interview_bp.route('/debug_paths', methods=['GET'])
def debug_paths():
    """调试路径和文件状态"""
    debug_info = {
        "BASE_DIR": BASE_DIR,
        "HLS_FOLDER": HLS_FOLDER,
        "HLS_PLAYLIST_FILE": HLS_PLAYLIST_FILE,
        "hls_folder_exists": os.path.exists(HLS_FOLDER),
        "playlist_file_exists": os.path.exists(HLS_PLAYLIST_FILE),
        "current_working_directory": os.getcwd(),
        "wsclient_status": wsclient is not None,
        "wsclient_streamUrl": wsclient.streamUrl if wsclient else None
    }
    
    # 检查目录内容
    if os.path.exists(HLS_FOLDER):
        debug_info["hls_folder_contents"] = os.listdir(HLS_FOLDER)
    else:
        debug_info["hls_folder_contents"] = "目录不存在"
        
    # 检查是否有FFmpeg进程在运行
    try:
        # 尝试导入psutil，如果没有就跳过进程检查
        import psutil
        ffmpeg_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if 'ffmpeg' in proc.info['name'].lower():
                    ffmpeg_processes.append({
                        'pid': proc.info['pid'],
                        'cmdline': ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else 'N/A'
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        debug_info["ffmpeg_processes"] = ffmpeg_processes
    except ImportError:
        debug_info["ffmpeg_processes"] = "psutil未安装，无法检查系统进程"
        # 使用简单的进程状态检查
        debug_info["managed_ffmpeg_running"] = is_ffmpeg_running()
    except Exception as e:
        debug_info["ffmpeg_processes"] = f"检查进程时出错: {str(e)}"
        debug_info["managed_ffmpeg_running"] = is_ffmpeg_running()
    
    return jsonify(debug_info)

@interview_bp.route('/init_shuziren', methods=['GET'])
def init_shuziren():
    global wsclient
    try:
        # 如果已有连接且FFmpeg正在运行，直接返回
        if wsclient is not None and is_ffmpeg_running():
            print("🔍 数字人已连接且流转换正在运行")
            return jsonify({
                'content': "true", 
                'status': 'existing_connection',
                'stream_url': wsclient.streamUrl
            })
        
        # 如果有连接但FFmpeg没运行，重新启动FFmpeg
        if wsclient is not None and wsclient.streamUrl:
            print("🔄 数字人已连接但流转换未运行，重启转换...")
            process = rtmp_to_hls(wsclient.streamUrl, HLS_PLAYLIST_FILE)
            if process and wait_for_hls_file():
                return jsonify({
                    'content': "true", 
                    'status': 'stream_restarted',
                    'stream_url': wsclient.streamUrl
                })
            else:
                print("❌ 流转换重启失败")
        
        print("🚀 正在初始化数字人...")
        
        # 从配置文件获取数字人API配置
        config = get_avatar_config()
        url = config["url"]
        appId = config["appId"]
        appKey = config["appKey"]
        appSecret = config["appSecret"]
        anchorId = config["anchorId"]
        vcn = config["vcn"]
        
        print(f"📡 使用数字人API: {url}")
        print(f"🎭 数字人ID: {anchorId}, 音色: {vcn}")
        
        print("📡 正在获取认证URL...")
        authUrl = AipaasAuth.assemble_auth_url(url, 'GET', appKey, appSecret)
        print(f"✅ 认证URL获取成功")
        
        print("🔗 正在创建WebSocket连接...")
        wsclient = avatarWebsocket(authUrl, protocols='', headers=None)
        
        wsclient.appId = appId
        wsclient.anchorId = anchorId
        wsclient.vcn = vcn
        
        print("🚀 正在启动WebSocket...")
        wsclient.start()
        
        # 等待流URL，增加超时机制和进度提示
        timeout_count = 0
        max_timeout = config.get("timeout", 30)  # 使用配置的超时时间
        
        while not wsclient.streamUrl and timeout_count < max_timeout:
            time.sleep(1)
            timeout_count += 1
            if timeout_count % 5 == 0:  # 每5秒输出一次进度
                print(f"⏳ 等待流URL... ({timeout_count}/{max_timeout})")
            
        if not wsclient.streamUrl:
            print("❌ 数字人初始化超时")
            if wsclient:
                wsclient.close()
                wsclient = None
            return jsonify({
                'error': '数字人初始化超时，请重试',
                'status': 'timeout'
            }), 500
            
        print(f"✅ 获取到流URL: {wsclient.streamUrl}")
        
        # 启动RTMP到HLS转换
        print("🎬 正在启动流转换...")
        process = rtmp_to_hls(wsclient.streamUrl, HLS_PLAYLIST_FILE)
        
        if process:
            # 等待HLS文件生成
            print("⏳ 等待HLS文件生成...")
            hls_wait_time = config.get("hls_wait_time", 20)  # 使用配置的等待时间
            if wait_for_hls_file(max_wait=hls_wait_time):
                return jsonify({
                    'content': "true", 
                    'status': 'success',
                    'stream_url': wsclient.streamUrl,
                    'playlist_path': HLS_PLAYLIST_FILE
                })
            else:
                print("❌ HLS文件生成超时")
                # 即使文件没生成也返回成功，让客户端稍后重试
                return jsonify({
                    'content': "true",
                    'status': 'partial_success',
                    'message': 'WebSocket连接成功，流转换可能需要更多时间',
                    'stream_url': wsclient.streamUrl
                })
        else:
            print("❌ 流转换启动失败")
            return jsonify({
                'error': '流转换启动失败，但WebSocket连接成功',
                'status': 'stream_conversion_failed',
                'stream_url': wsclient.streamUrl
            }), 500

    except Exception as e:
        print(f'❌ 数字人初始化异常: {e}')
        if wsclient:
            try:
                wsclient.close()
            except:
                pass
            wsclient = None
        return jsonify({
            'error': f'数字人初始化失败: {str(e)}',
            'status': 'initialization_failed'
        }), 500

def rtmp_to_hls(input_rtmp_url, output_hls_path):
    """
    将 RTMP 流转换为 HLS 格式，带完整的进程管理
    
    参数:
        input_rtmp_url: 输入RTMP地址 (e.g. "rtmp://example.com/live/stream")
        output_hls_path: 输出HLS完整文件路径 (e.g. "/path/to/resource/stream/playlist.m3u8")
    """
    global ffmpeg_process, ffmpeg_lock
    
    with ffmpeg_lock:
        # 先停止现有的FFmpeg进程
        if ffmpeg_process and ffmpeg_process.poll() is None:
            print("🔄 检测到现有FFmpeg进程，正在停止...")
            stop_ffmpeg_process()
        
        # 确保输出目录存在
        output_dir = os.path.dirname(output_hls_path)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            print(f"✅ 创建目录: {output_dir}")
        
        # 清理旧文件
        cleanup_old_stream_files()
        
        print(f"🎯 FFmpeg输入: {input_rtmp_url}")
        print(f"🎯 FFmpeg输出: {output_hls_path}")
        print(f"🎯 输出目录: {output_dir}")
        
        # 检查FFmpeg是否可用
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                 capture_output=True, 
                                 check=True, 
                                 timeout=10)
            print("✅ FFmpeg 可用")
        except subprocess.CalledProcessError as e:
            print(f"❌ FFmpeg 不可用或版本检查失败: {e}")
            return None
        except subprocess.TimeoutExpired:
            print("❌ FFmpeg 版本检查超时")
            return None
        except FileNotFoundError:
            print("❌ 找不到 FFmpeg，请确保已安装并添加到PATH")
            return None
        
        # 优化的FFmpeg命令
        ffmpeg_cmd = [
            'ffmpeg',
            '-i', input_rtmp_url,          # 输入源
            '-c:v', 'libx264',             # 视频编码
            '-preset', 'ultrafast',        # 编码预设，优先速度
            '-tune', 'zerolatency',        # 零延迟调优
            '-c:a', 'aac',                 # 音频编码
            '-f', 'hls',                   # 输出格式为HLS
            '-hls_time', '2',              # 每个TS切片2秒
            '-hls_list_size', '6',         # 播放列表保留6个片段
            '-hls_flags', 'delete_segments+append_list', # 自动删除旧片段
            '-hls_segment_filename', os.path.join(output_dir, 'segment_%03d.ts'),  # 指定分段文件名
            '-y',                          # 覆盖输出文件
            '-loglevel', 'warning',        # 减少日志输出
            '-reconnect', '1',             # 启用重连
            '-reconnect_streamed', '1',    # 对流媒体启用重连
            '-reconnect_delay_max', '5',   # 最大重连延迟
            output_hls_path                # 输出路径
        ]
        
        print(f"🚀 执行FFmpeg命令: {' '.join(ffmpeg_cmd)}")
        
        try:
            # 启动FFmpeg进程
            ffmpeg_process = subprocess.Popen(
                ffmpeg_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                bufsize=1
            )
            
            print(f"✅ FFmpeg进程已启动，PID: {ffmpeg_process.pid}")
            
            # 在另一个线程中监控FFmpeg输出
            def monitor_ffmpeg():
                try:
                    while ffmpeg_process and ffmpeg_process.poll() is None:
                        output = ffmpeg_process.stderr.readline()
                        if output == '':
                            break
                        if output and ('error' in output.lower() or 'warning' in output.lower()):
                            print(f"FFmpeg: {output.strip()}")
                    
                    # 进程结束，检查返回码
                    if ffmpeg_process:
                        return_code = ffmpeg_process.poll()
                        if return_code != 0 and return_code is not None:
                            print(f"⚠️ FFmpeg进程异常结束，返回码: {return_code}")
                        else:
                            print("🔍 FFmpeg进程正常结束")
                            
                except Exception as e:
                    print(f"❌ 监控FFmpeg输出时出错: {e}")
            
            # 启动监控线程
            monitor_thread = threading.Thread(target=monitor_ffmpeg, daemon=True)
            monitor_thread.start()
            
            return ffmpeg_process
            
        except Exception as e:
            print(f"❌ FFmpeg启动失败: {e}")
            ffmpeg_process = None
            return None


# 请求hls推流文件
@interview_bp.route('/video/<path:filename>')
def video(filename):
    """提供HLS视频流文件，带智能重试机制"""
    print(f"🎬 请求视频文件: {filename}")
    print(f"🎬 服务目录: {HLS_FOLDER}")
    
    # 检查文件是否存在
    file_path = os.path.join(HLS_FOLDER, filename)
    
    # 特殊处理playlist.m3u8文件
    if filename == 'playlist.m3u8':
        # 如果文件不存在且有WebSocket连接，尝试重启FFmpeg
        if not os.path.exists(file_path) and wsclient and wsclient.streamUrl:
            print("🔄 playlist.m3u8不存在，尝试重启流转换...")
            
            # 重启FFmpeg
            process = rtmp_to_hls(wsclient.streamUrl, HLS_PLAYLIST_FILE)
            if process:
                # 短暂等待文件生成
                if wait_for_hls_file(max_wait=5):
                    file_path = HLS_PLAYLIST_FILE  # 重新设置路径
                else:
                    print("⚠️ 重启后仍未生成playlist.m3u8")
            else:
                print("❌ 重启流转换失败")
    
    # 检查文件存在性
    if os.path.exists(file_path):
        print(f"✅ 提供文件: {file_path}")
        
        # 为不同文件类型设置合适的Content-Type
        if filename.endswith('.m3u8'):
            response = send_from_directory(HLS_FOLDER, filename)
            response.headers['Content-Type'] = 'application/vnd.apple.mpegurl'
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            return response
        elif filename.endswith('.ts'):
            response = send_from_directory(HLS_FOLDER, filename)
            response.headers['Content-Type'] = 'video/mp2t'
            return response
        else:
            return send_from_directory(HLS_FOLDER, filename)
    else:
        print(f"❌ 文件不存在: {file_path}")
        print(f"📁 目录内容: {os.listdir(HLS_FOLDER) if os.path.exists(HLS_FOLDER) else '目录不存在'}")
        
        # 提供调试信息
        debug_info = {
            'error': 'File not found',
            'requested_file': filename,
            'full_path': file_path,
            'directory_exists': os.path.exists(HLS_FOLDER),
            'directory_contents': os.listdir(HLS_FOLDER) if os.path.exists(HLS_FOLDER) else [],
            'ffmpeg_running': is_ffmpeg_running(),
            'wsclient_connected': wsclient is not None,
            'stream_url': wsclient.streamUrl if wsclient else None
        }
        
        return jsonify(debug_info), 404

# 删除websocket连接和清理资源
@interview_bp.route('/del_wss', methods=['GET'])
def del_wss():
    global wsclient
    
    print("🛑 开始清理数字人连接和流资源...")
    
    # 停止FFmpeg进程
    stop_ffmpeg_process()
    
    # 关闭WebSocket连接
    if wsclient is not None:
        try:
            print("🔌 关闭WebSocket连接...")
            wsclient.close()
            print("✅ WebSocket连接已关闭")
        except Exception as e:
            print(f"⚠️ 关闭WebSocket时出错: {e}")
        finally:
            wsclient = None
    
    # 清理流文件
    cleanup_old_stream_files()
    
    print("✅ 清理完成")
    return jsonify({
        "content": "true",
        "status": "cleanup_completed",
        "message": "数字人连接和流资源已清理"
    })

@interview_bp.route('/stream_health', methods=['GET'])
def stream_health():
    """检查流转换健康状态"""
    health_info = {
        'timestamp': time.time(),
        'ffmpeg_running': is_ffmpeg_running(),
        'wsclient_connected': wsclient is not None,
        'wsclient_has_stream': wsclient is not None and hasattr(wsclient, 'streamUrl') and wsclient.streamUrl,
        'playlist_exists': os.path.exists(HLS_PLAYLIST_FILE),
        'hls_folder_exists': os.path.exists(HLS_FOLDER),
        'hls_folder_contents': []
    }
    
    # 检查目录内容
    if os.path.exists(HLS_FOLDER):
        try:
            health_info['hls_folder_contents'] = os.listdir(HLS_FOLDER)
        except Exception as e:
            health_info['hls_folder_error'] = str(e)
    
    # 检查playlist.m3u8文件的新鲜度
    if health_info['playlist_exists']:
        try:
            file_stat = os.stat(HLS_PLAYLIST_FILE)
            health_info['playlist_age'] = time.time() - file_stat.st_mtime
            health_info['playlist_size'] = file_stat.st_size
            
            # 读取文件内容检查有效性
            with open(HLS_PLAYLIST_FILE, 'r') as f:
                content = f.read()
                health_info['playlist_valid'] = '#EXTM3U' in content and len(content.strip()) > 20
        except Exception as e:
            health_info['playlist_error'] = str(e)
    
    # 判断整体健康状态
    health_info['status'] = 'healthy' if (
        health_info.get('ffmpeg_running', False) and 
        health_info.get('playlist_exists', False) and
        health_info.get('playlist_valid', False) and
        health_info.get('playlist_age', 999) < 30  # 文件不超过30秒
    ) else 'unhealthy'
    
    return jsonify(health_info)

@interview_bp.route('/restart_stream', methods=['POST'])
def restart_stream():
    """重启流转换"""
    try:
        if not wsclient or not wsclient.streamUrl:
            return jsonify({
                'error': '没有可用的流连接',
                'status': 'no_stream_connection'
            }), 400
        
        print("🔄 手动重启流转换...")
        
        # 停止现有进程
        stop_ffmpeg_process()
        
        # 清理旧文件
        cleanup_old_stream_files()
        
        # 重新启动
        process = rtmp_to_hls(wsclient.streamUrl, HLS_PLAYLIST_FILE)
        
        if process and wait_for_hls_file(max_wait=15):
            return jsonify({
                'content': 'true',
                'status': 'restart_successful',
                'message': '流转换已重启'
            })
        else:
            return jsonify({
                'error': '重启失败',
                'status': 'restart_failed'
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': f'重启时出错: {str(e)}',
            'status': 'restart_error'
        }), 500



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

@interview_bp.route('/switch_avatar_api', methods=['POST'])
def switch_avatar_api():
    """切换数字人API配置"""
    global wsclient
    
    try:
        # 先关闭现有连接
        if wsclient is not None:
            print("🔄 关闭当前数字人连接...")
            wsclient.close()
            wsclient = None
        
        # 停止FFmpeg进程
        stop_ffmpeg_process()
        
        # 切换到备用配置
        new_config = switch_to_backup()
        
        print(f"✅ 已切换到新的数字人API: {new_config['url']}")
        print(f"🎭 新数字人ID: {new_config['anchorId']}, 音色: {new_config['vcn']}")
        
        return jsonify({
            'content': 'true',
            'status': 'api_switched',
            'message': '数字人API已切换，请重新初始化数字人',
            'new_config': {
                'url': new_config['url'],
                'anchorId': new_config['anchorId'],
                'vcn': new_config['vcn']
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': f'切换API时出错: {str(e)}',
            'status': 'switch_failed'
        }), 500

@interview_bp.route('/avatar_config_info', methods=['GET'])  
def get_avatar_config_info():
    """获取当前数字人API配置信息"""
    try:
        config = get_avatar_config()
        return jsonify({
            'status': 'success',
            'config': {
                'url': config['url'],
                'appId': config['appId'],
                'anchorId': config['anchorId'],
                'vcn': config['vcn'],
                'timeout': config.get('timeout', 30),
                'hls_wait_time': config.get('hls_wait_time', 20)
            },
            'wsclient_connected': wsclient is not None,
            'ffmpeg_running': is_ffmpeg_running()
        })
    except Exception as e:
        return jsonify({
            'error': f'获取配置信息时出错: {str(e)}',
            'status': 'get_config_failed'
        }), 500

   
   
