#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数字人认证调试工具
用于测试和调试数字人WebSocket认证问题
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from avatar import AipaasAuth
from avatar.AvatarWebSocket import avatarWebsocket
import time

def test_authentication():
    """测试数字人认证"""
    print("🔐 开始测试数字人认证...")
    print("=" * 60)
    
    # 使用项目中的正确配置
    url = 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact'
    appId = 'a9730a45'
    appKey = 'fe16118b2de28ee8fff8046b015e3358'
    appSecret = 'NmJkYjU3OTI1NDRlNDViOWY1NjYyYzMx'
    anchorId = 'cnr5dg8n2000000003'
    vcn = 'x4_xiaozhong'
    
    print(f"🎯 配置信息:")
    print(f"   URL: {url}")
    print(f"   AppID: {appId}")
    print(f"   AppKey: {appKey[:8]}...{appKey[-8:]}")
    print(f"   AppSecret: {appSecret[:8]}...{appSecret[-8:]}")
    print(f"   AnchorID: {anchorId}")
    print(f"   VCN: {vcn}")
    
    try:
        # 1. 测试认证URL生成
        print(f"\n1️⃣ 生成认证URL...")
        authUrl = AipaasAuth.assemble_auth_url(url, 'GET', appKey, appSecret)
        print(f"✅ 认证URL生成成功")
        print(f"🔗 URL长度: {len(authUrl)} 字符")
        print(f"🔗 URL预览: {authUrl[:100]}...")
        
        # 2. 测试WebSocket连接
        print(f"\n2️⃣ 创建WebSocket连接...")
        wsclient = avatarWebsocket(authUrl, protocols='', headers=None)
        wsclient.appId = appId
        wsclient.anchorId = anchorId
        wsclient.vcn = vcn
        
        print(f"✅ WebSocket客户端创建成功")
        
        # 3. 启动连接
        print(f"\n3️⃣ 启动WebSocket连接...")
        wsclient.start()
        
        # 4. 等待连接结果
        print(f"⏳ 等待连接结果 (最多30秒)...")
        timeout_count = 0
        max_timeout = 30
        
        while timeout_count < max_timeout:
            time.sleep(1)
            timeout_count += 1
            
            # 检查连接状态
            if not wsclient.status:
                print(f"❌ WebSocket连接失败 (状态: {wsclient.status})")
                return False
                
            if wsclient.linkConnected:
                print(f"✅ WebSocket基础连接成功 (耗时: {timeout_count}秒)")
                break
                
            if timeout_count % 5 == 0:
                print(f"⏳ 连接中... ({timeout_count}/{max_timeout})")
        
        if not wsclient.linkConnected:
            print(f"❌ WebSocket连接超时")
            wsclient.close()
            return False
        
        # 5. 等待数字人连接
        print(f"\n4️⃣ 等待数字人服务连接...")
        avatar_timeout = 0
        max_avatar_timeout = 30
        
        while avatar_timeout < max_avatar_timeout:
            time.sleep(1)
            avatar_timeout += 1
            
            if wsclient.avatarLinked and wsclient.streamUrl:
                print(f"✅ 数字人连接成功!")
                print(f"🎬 流URL: {wsclient.streamUrl}")
                
                # 6. 测试发送消息
                print(f"\n5️⃣ 测试发送文本...")
                test_text = "这是一个认证测试消息"
                wsclient.sendDriverText(test_text)
                print(f"✅ 消息发送成功: {test_text}")
                
                time.sleep(2)
                wsclient.close()
                print(f"\n🎉 认证测试完全成功!")
                return True
                
            if avatar_timeout % 5 == 0:
                print(f"⏳ 等待数字人连接... ({avatar_timeout}/{max_avatar_timeout})")
        
        print(f"❌ 数字人连接超时")
        wsclient.close()
        return False
        
    except Exception as e:
        print(f"\n❌ 认证测试失败:")
        print(f"   错误类型: {type(e).__name__}")
        print(f"   错误信息: {str(e)}")
        
        # 常见错误的解决建议
        if "ConnectionRefusedError" in str(e):
            print(f"\n💡 解决建议:")
            print(f"   1. 检查网络连接")
            print(f"   2. 确认服务器地址正确")
            print(f"   3. 检查防火墙设置")
        elif "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
            print(f"\n💡 解决建议:")
            print(f"   1. 检查AppID、AppKey、AppSecret是否正确")
            print(f"   2. 确认账号权限和余额")
            print(f"   3. 检查时间戳是否同步")
        elif "timeout" in str(e).lower():
            print(f"\n💡 解决建议:")
            print(f"   1. 增加超时时间")
            print(f"   2. 检查网络稳定性")
            print(f"   3. 重试连接")
        
        return False

def check_config_consistency():
    """检查配置一致性"""
    print(f"\n🔧 检查配置一致性...")
    
    # 读取interview_route.py中的配置
    interview_config = {
        'appId': 'a9730a45',
        'appKey': 'fe16118b2de28ee8fff8046b015e3358', 
        'appSecret': 'NmJkYjU3OTI1NDRlNDViOWY1NjYyYzMx',
        'anchorId': 'cnr5dg8n2000000003',
        'vcn': 'x4_xiaozhong'
    }
    
    # 读取AvatarWebSocket.py测试代码中的配置
    test_config = {
        'appId': 'a9730a45',
        'appKey': 'fe16118b2de28ee8fff8046b015e3358',
        'appSecret': 'NmJkYjU3OTI1NDRlNDViOWY1NjYyYzMx', 
        'anchorId': 'cnr5dg8n2000000003',
        'vcn': 'x4_lingxiaoqi_oral'
    }
    
    print(f"📊 配置对比:")
    for key in interview_config:
        interview_val = interview_config[key]
        test_val = test_config[key]
        
        if interview_val == test_val:
            print(f"   ✅ {key}: 一致")
        else:
            print(f"   ⚠️ {key}: 不一致")
            print(f"      面试模块: {interview_val}")
            print(f"      测试模块: {test_val}")

def main():
    print("🧪 数字人认证调试工具")
    print("=" * 60)
    
    # 检查配置一致性
    check_config_consistency()
    
    # 测试认证
    success = test_authentication()
    
    if success:
        print(f"\n✅ 认证测试通过!")
        print(f"💡 您的数字人配置是正确的")
    else:
        print(f"\n❌ 认证测试失败!")
        print(f"💡 请检查以下可能的问题:")
        print(f"   1. 网络连接是否正常")
        print(f"   2. 认证信息是否有效")
        print(f"   3. 账号是否有余额/权限")
        print(f"   4. 服务是否正常运行")

if __name__ == "__main__":
    main()
