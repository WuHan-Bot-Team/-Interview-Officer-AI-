#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
配置生成器 - 自动生成小程序网络配置
"""

import socket
import json
import os

def get_local_ip():
    """获取本机局域网IP地址"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def generate_network_config():
    """生成网络配置信息"""
    local_ip = get_local_ip()
    port = 5000
    
    config = {
        "backend_urls": {
            "local": f"http://127.0.0.1:{port}",
            "lan": f"http://{local_ip}:{port}"
        },
        "mini_program_config": {
            "requestDomain": [
                f"{local_ip}:{port}",
                f"127.0.0.1:{port}",
                "localhost:5000"
            ],
            "downloadDomain": [
                f"{local_ip}:{port}",
                f"127.0.0.1:{port}"
            ],
            "uploadDomain": [
                f"{local_ip}:{port}",
                f"127.0.0.1:{port}"
            ]
        },
        "video_stream_url": f"http://{local_ip}:{port}/interview/video/playlist.m3u8",
        "api_examples": {
            "init": f"http://{local_ip}:{port}/interview/init",
            "answer": f"http://{local_ip}:{port}/interview/answer",
            "init_shuziren": f"http://{local_ip}:{port}/interview/init_shuziren"
        }
    }
    
    return config, local_ip

def save_config_file():
    """保存配置到文件"""
    config, local_ip = generate_network_config()
    
    # 保存配置文件
    config_path = os.path.join(os.path.dirname(__file__), 'network_config.json')
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, ensure_ascii=False, indent=2)
    
    return config_path, local_ip

def print_config_info():
    """打印配置信息"""
    config, local_ip = generate_network_config()
    
    print("\n" + "="*80)
    print("🔧 网络配置信息生成器")
    print("="*80)
    print(f"🌐 当前局域网IP: {local_ip}")
    print(f"📍 本地地址: {config['backend_urls']['local']}")
    print(f"🌏 局域网地址: {config['backend_urls']['lan']}")
    print("="*80)
    print("📱 小程序app.json配置 (复制到networkConfig中):")
    print(json.dumps(config['mini_program_config'], ensure_ascii=False, indent=2))
    print("="*80)
    print("🎯 替换指南:")
    print(f"   将小程序代码中的 '127.0.0.1:5000' 替换为 '{local_ip}:5000'")
    print("="*80)
    print("🔗 重要API地址:")
    for name, url in config['api_examples'].items():
        print(f"   {name}: {url}")
    print("="*80)
    print(f"📺 数字人视频流: {config['video_stream_url']}")
    print("="*80 + "\n")

if __name__ == "__main__":
    # 生成并保存配置
    config_path, local_ip = save_config_file()
    print(f"✅ 配置已保存到: {config_path}")
    
    # 打印配置信息
    print_config_info()
