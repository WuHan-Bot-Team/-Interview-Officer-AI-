#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
流健康检查测试脚本
用于测试修复后的视频流管理系统
"""

import requests
import time
import json

def test_stream_health():
    """测试流健康检查"""
    base_url = "http://127.0.0.1:5000"
    
    print("🩺 开始流健康检查测试...")
    
    try:
        # 1. 测试健康检查接口
        print("\n1️⃣ 测试健康检查接口...")
        response = requests.get(f"{base_url}/interview/stream_health", timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            health_data = response.json()
            print("✅ 健康检查成功")
            print(f"📊 健康状态: {health_data.get('status', 'unknown')}")
            print(f"🎬 FFmpeg运行: {health_data.get('ffmpeg_running', False)}")
            print(f"🔗 WebSocket连接: {health_data.get('wsclient_connected', False)}")
            print(f"📁 播放列表存在: {health_data.get('playlist_exists', False)}")
            print(f"📁 目录内容: {health_data.get('hls_folder_contents', [])}")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            print(response.text)
        
        # 2. 测试调试接口
        print("\n2️⃣ 测试调试信息接口...")
        response = requests.get(f"{base_url}/interview/debug", timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            debug_data = response.json()
            print("✅ 调试信息获取成功")
            print(f"🎯 HLS目录: {debug_data.get('HLS_FOLDER', 'N/A')}")
            print(f"📝 播放列表文件: {debug_data.get('HLS_PLAYLIST_FILE', 'N/A')}")
            print(f"📁 目录存在: {debug_data.get('hls_folder_exists', False)}")
            print(f"📄 文件存在: {debug_data.get('playlist_file_exists', False)}")
        else:
            print(f"❌ 调试信息获取失败: {response.status_code}")
        
        # 3. 测试视频文件请求
        print("\n3️⃣ 测试视频文件请求...")
        response = requests.get(f"{base_url}/interview/video/playlist.m3u8", timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ playlist.m3u8 文件请求成功")
            content = response.text[:200]  # 只显示前200个字符
            print(f"📄 文件内容开头: {content}...")
        elif response.status_code == 404:
            print("⚠️ playlist.m3u8 文件不存在 (这是正常的，如果还没初始化数字人)")
            try:
                error_info = response.json()
                print(f"📊 调试信息: {json.dumps(error_info, indent=2, ensure_ascii=False)}")
            except:
                print(f"📄 响应内容: {response.text}")
        else:
            print(f"❌ playlist.m3u8 请求失败: {response.status_code}")
        
        print("\n✅ 所有测试完成!")
        print("\n💡 使用说明:")
        print("1. 如果想要测试完整流程，请先调用 /interview/init_shuziren")
        print("2. 然后再次运行此脚本查看健康状态")
        print("3. 可以通过 /interview/restart_stream 重启流转换")
        
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到服务器，请确保Flask应用正在运行")
        print("   运行命令: python run.py")
    except Exception as e:
        print(f"❌ 测试过程中出错: {e}")

def test_init_digital_human():
    """测试数字人初始化 (可选)"""
    base_url = "http://127.0.0.1:5000"
    
    print("\n🤖 测试数字人初始化 (这可能需要较长时间)...")
    
    try:
        response = requests.get(f"{base_url}/interview/init_shuziren", timeout=60)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 数字人初始化成功")
            print(f"📊 状态: {data.get('status', 'unknown')}")
            print(f"🔗 流URL: {data.get('stream_url', 'N/A')}")
        else:
            print(f"❌ 数字人初始化失败: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.Timeout:
        print("⏰ 数字人初始化超时 (这可能是正常的)")
    except Exception as e:
        print(f"❌ 数字人初始化出错: {e}")

if __name__ == "__main__":
    print("🧪 面试AI系统流管理测试")
    print("=" * 50)
    
    # 基础健康检查
    test_stream_health()
    
    # 询问是否测试数字人初始化
    user_input = input("\n❓ 是否测试数字人初始化? (这可能需要较长时间) [y/N]: ")
    if user_input.lower() in ['y', 'yes']:
        test_init_digital_human()
        
        # 再次进行健康检查
        print("\n🔄 重新进行健康检查...")
        time.sleep(2)
        test_stream_health()
