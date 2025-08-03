#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数字人服务器测试脚本
用于在服务器上测试数字人连接和视频流
"""

import requests
import time
import json
import sys

def test_digital_human_connection(server_ip, port=5000):
    """测试数字人连接"""
    base_url = f"http://{server_ip}:{port}"
    
    print(f"🤖 开始测试数字人连接 - 服务器: {server_ip}:{port}")
    print("=" * 60)
    
    try:
        # 1. 检查服务器是否可达
        print("\n1️⃣ 检查服务器连通性...")
        response = requests.get(f"{base_url}/interview/stream_health", timeout=10)
        if response.status_code == 200:
            print("✅ 服务器连接正常")
        else:
            print(f"⚠️ 服务器响应异常: {response.status_code}")
        
        # 2. 查看当前数字人状态
        print("\n2️⃣ 检查数字人当前状态...")
        response = requests.get(f"{base_url}/interview/debug_paths", timeout=15)
        if response.status_code == 200:
            debug_data = response.json()
            print(f"🔗 WebSocket状态: {debug_data.get('wsclient_status', False)}")
            print(f"📺 流URL: {debug_data.get('wsclient_streamUrl', 'None')}")
            print(f"📁 HLS目录: {debug_data.get('HLS_FOLDER', 'Unknown')}")
            print(f"📄 播放列表存在: {debug_data.get('playlist_file_exists', False)}")
        
        # 3. 初始化数字人
        print("\n3️⃣ 开始初始化数字人...")
        print("⏳ 这个过程可能需要30-60秒，请耐心等待...")
        
        start_time = time.time()
        response = requests.get(f"{base_url}/interview/init_shuziren", timeout=120)
        elapsed_time = time.time() - start_time
        
        print(f"⏱️ 初始化耗时: {elapsed_time:.2f}秒")
        print(f"📊 状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ 数字人初始化成功!")
            print(f"📊 状态: {data.get('status', 'unknown')}")
            print(f"🔗 流URL: {data.get('stream_url', 'N/A')}")
            
            if data.get('status') == 'success':
                print("\n🎉 数字人完全初始化成功!")
                return True
            elif data.get('status') == 'partial_success':
                print("\n⚠️ 数字人部分初始化成功，流转换可能需要更多时间")
                return True
            else:
                print(f"\n⚠️ 数字人初始化状态异常: {data.get('status')}")
                return False
                
        else:
            print(f"❌ 数字人初始化失败: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 错误信息: {error_data}")
            except:
                print(f"📄 响应内容: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ 无法连接到服务器 {server_ip}:{port}")
        print("   请检查:")
        print("   1. 服务器IP地址是否正确")
        print("   2. Flask应用是否正在运行") 
        print("   3. 防火墙是否开放5000端口")
        return False
    except requests.exceptions.Timeout:
        print("⏰ 数字人初始化超时")
        print("   这可能是正常的，数字人初始化需要较长时间")
        return False
    except Exception as e:
        print(f"❌ 测试过程中出错: {e}")
        return False

def test_video_stream(server_ip, port=5000):
    """测试视频流"""
    base_url = f"http://{server_ip}:{port}"
    
    print(f"\n📺 测试视频流...")
    
    try:
        # 测试playlist.m3u8
        response = requests.get(f"{base_url}/interview/video/playlist.m3u8", timeout=10)
        
        if response.status_code == 200:
            print("✅ playlist.m3u8 可以访问")
            content = response.text[:200]
            print(f"📄 文件内容开头: {content}...")
            
            # 检查HLS格式
            if '#EXTM3U' in response.text:
                print("✅ HLS格式正确")
                
                # 提供访问URL
                video_url = f"{base_url}/interview/video/playlist.m3u8"
                print(f"\n🎬 视频流URL: {video_url}")
                print("💡 您可以用以下方式测试:")
                print(f"   浏览器访问: {video_url}")
                print("   或使用VLC等播放器打开此URL")
                
                return True
            else:
                print("⚠️ 文件格式不正确，不是有效的HLS文件")
                return False
                
        elif response.status_code == 404:
            print("❌ playlist.m3u8 文件不存在")
            try:
                debug_info = response.json()
                print(f"📊 调试信息:")
                print(f"   目录存在: {debug_info.get('directory_exists', False)}")
                print(f"   目录内容: {debug_info.get('directory_contents', [])}")
                print(f"   FFmpeg运行: {debug_info.get('ffmpeg_running', False)}")
            except:
                pass
            return False
        else:
            print(f"❌ 访问失败: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 视频流测试失败: {e}")
        return False

def main():
    print("🧪 数字人服务器连接测试工具")
    print("=" * 60)
    
    # 获取服务器IP
    if len(sys.argv) > 1:
        server_ip = sys.argv[1]
    else:
        server_ip = input("请输入服务器IP地址 (例: 192.168.1.100): ").strip()
        
    if not server_ip:
        print("❌ 请提供有效的服务器IP地址")
        return
    
    print(f"🎯 目标服务器: {server_ip}:5000")
    
    # 测试数字人连接
    success = test_digital_human_connection(server_ip)
    
    if success:
        # 如果数字人初始化成功，测试视频流
        time.sleep(3)  # 等待视频流生成
        test_video_stream(server_ip)
        
        print(f"\n🌐 完整的访问信息:")
        print(f"   后端API: http://{server_ip}:5000")
        print(f"   视频流: http://{server_ip}:5000/interview/video/playlist.m3u8")
        print(f"   健康检查: http://{server_ip}:5000/interview/stream_health")
        
    print(f"\n📋 测试完成!")

if __name__ == "__main__":
    main()
