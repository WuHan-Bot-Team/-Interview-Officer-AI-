# from app import create_app
from flask import Flask
from flask_cors import CORS
from app.practice_route import practice_bp
from app.interview_route import interview_bp
import os
import glob
import socket


def get_local_ip():
    """获取本机局域网IP地址"""
    try:
        # 连接到一个外部地址来获取本机IP（不会实际发送数据）
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def delete_files_in_folder(folder_path):
    files = glob.glob(os.path.join(folder_path, '*'))
    for f in files:
        if os.path.isfile(f):
            os.remove(f)

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.register_blueprint(practice_bp, url_prefix='/practice')
    app.register_blueprint(interview_bp, url_prefix='/interview')
    
    # 只清理人脸图片，不要清理stream文件（避免中断正在播放的视频）
    # delete_files_in_folder('resource/stream')  # ❌ 注释掉避免删除视频文件
    delete_files_in_folder('resource/face_image')
    
    # 确保stream目录存在
    os.makedirs('resource/stream', exist_ok=True)
    return app


app = create_app()

if __name__ == '__main__':
    local_ip = get_local_ip()
    port = 5000
    
    print("\n" + "="*70)
    print("🚀 面试官AI系统启动成功！")
    print("="*70)
    print(f"📍 本地地址:     http://127.0.0.1:{port}")
    print(f"🌐 局域网地址:   http://{local_ip}:{port}")
    print("="*70)
    print("📱 前端配置说明:")
    print(f"   请将小程序中的所有 '127.0.0.1' 替换为: {local_ip}")
    print("   或者直接使用局域网地址进行访问")
    print("="*70)
    print("⚠️  重要提醒:")
    print("   1. 确保防火墙允许端口5000的访问")
    print("   2. 同一局域网下的设备都可通过局域网地址访问")
    print("   3. 如果小程序无法连接，请检查网络配置")
    print("="*70)
    print("🎯 当前使用的IP地址配置:")
    print(f"   数字人视频流: http://{local_ip}:{port}/interview/video/playlist.m3u8")
    print(f"   接口地址示例: http://{local_ip}:{port}/interview/init")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=True)