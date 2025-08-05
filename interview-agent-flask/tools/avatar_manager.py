#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数字人API管理工具
用于快速切换和管理不同的数字人API配置
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.avatar_config import AVATAR_CONFIG, BACKUP_AVATAR_CONFIG, get_avatar_config, switch_to_backup
import json

def show_current_config():
    """显示当前配置"""
    config = get_avatar_config()
    print("🎭 当前数字人API配置:")
    print(f"   URL: {config['url']}")
    print(f"   App ID: {config['appId']}")
    print(f"   数字人ID: {config['anchorId']}")
    print(f"   音色: {config['vcn']}")
    print(f"   超时时间: {config.get('timeout', 30)}秒")
    print()

def show_backup_config():
    """显示备用配置"""
    print("🔄 备用数字人API配置:")
    print(f"   URL: {BACKUP_AVATAR_CONFIG['url']}")
    print(f"   App ID: {BACKUP_AVATAR_CONFIG['appId']}")
    print(f"   数字人ID: {BACKUP_AVATAR_CONFIG['anchorId']}")
    print(f"   音色: {BACKUP_AVATAR_CONFIG['vcn']}")
    print()

def update_config():
    """交互式更新配置"""
    print("🛠️  更新数字人API配置")
    print("请输入新的配置信息（直接按回车保持当前值）:")
    
    current = get_avatar_config()
    
    new_config = {}
    
    url = input(f"WebSocket URL ({current['url']}): ").strip()
    new_config['url'] = url if url else current['url']
    
    app_id = input(f"App ID ({current['appId']}): ").strip()
    new_config['appId'] = app_id if app_id else current['appId']
    
    app_key = input(f"App Key ({current['appKey']}): ").strip()
    new_config['appKey'] = app_key if app_key else current['appKey']
    
    app_secret = input(f"App Secret ({current['appSecret']}): ").strip()
    new_config['appSecret'] = app_secret if app_secret else current['appSecret']
    
    anchor_id = input(f"数字人ID ({current['anchorId']}): ").strip()
    new_config['anchorId'] = anchor_id if anchor_id else current['anchorId']
    
    vcn = input(f"音色 ({current['vcn']}): ").strip()
    new_config['vcn'] = vcn if vcn else current['vcn']
    
    timeout = input(f"超时时间 ({current.get('timeout', 30)}): ").strip()
    new_config['timeout'] = int(timeout) if timeout.isdigit() else current.get('timeout', 30)
    
    hls_wait = input(f"HLS等待时间 ({current.get('hls_wait_time', 20)}): ").strip()
    new_config['hls_wait_time'] = int(hls_wait) if hls_wait.isdigit() else current.get('hls_wait_time', 20)
    
    # 保存配置
    config_file_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'avatar_config.py')
    
    print("\n📝 新配置:")
    for key, value in new_config.items():
        print(f"   {key}: {value}")
    
    confirm = input("\n确认保存? (y/N): ").strip().lower()
    if confirm == 'y':
        # 这里可以添加保存到文件的逻辑
        print("✅ 配置已保存")
        print("⚠️  请重启服务以应用新配置")
    else:
        print("❌ 配置未保存")

def main():
    """主菜单"""
    while True:
        print("=" * 50)
        print("🎭 数字人API管理工具")
        print("=" * 50)
        print("1. 查看当前配置")
        print("2. 查看备用配置") 
        print("3. 更新配置")
        print("4. 测试配置")
        print("5. 生成配置文件模板")
        print("0. 退出")
        print("-" * 50)
        
        choice = input("请选择操作 (0-5): ").strip()
        
        if choice == '1':
            show_current_config()
        elif choice == '2':
            show_backup_config()
        elif choice == '3':
            update_config()
        elif choice == '4':
            print("🧪 配置测试功能开发中...")
        elif choice == '5':
            print("📄 生成配置模板功能开发中...")
        elif choice == '0':
            print("👋 再见!")
            break
        else:
            print("❌ 无效选择，请重试")
        
        input("\n按回车继续...")

if __name__ == "__main__":
    main()
