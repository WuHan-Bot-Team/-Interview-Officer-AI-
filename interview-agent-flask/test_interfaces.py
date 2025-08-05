#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试面试官AI接口
"""

import requests
import json
import time

def test_server_health():
    """测试服务器基本连通性"""
    print("🔍 测试服务器连通性...")
    try:
        response = requests.get("http://127.0.0.1:5000", timeout=5)
        if response.status_code == 200:
            print("✅ 服务器运行正常")
            data = response.json()
            print(f"服务器信息: {data.get('message', 'N/A')}")
            return True
        else:
            print(f"❌ 服务器响应异常: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 服务器连接失败: {str(e)}")
        return False

def test_recommend_questions():
    """测试推荐题目接口"""
    print("\n🔍 测试 /practice/recommend_questions 接口...")
    
    url = "http://127.0.0.1:5000/practice/recommend_questions"
    params = {
        "major": "计算机科学",
        "position": "Python开发工程师",
        "difficulty": "简单",
        "type": "技术"
    }
    
    print(f"请求URL: {url}")
    print(f"参数: {json.dumps(params, ensure_ascii=False)}")
    
    try:
        print("⏱️ 发送请求...")
        start_time = time.time()
        response = requests.get(url, params=params, timeout=90)  # 增加到90秒
        end_time = time.time()
        
        print(f"⏱️ 响应时间: {end_time - start_time:.2f}秒")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ 请求成功!")
            try:
                data = response.json()
                print(f"响应结构: success={data.get('success')}")
                
                if data.get('success') and 'data' in data:
                    questions = data['data'].get('questions', [])
                    print(f"推荐题目数量: {len(questions)}")
                    
                    if questions:
                        print("📝 第一道题目示例:")
                        first_q = questions[0]
                        print(f"  问题: {first_q.get('question', 'N/A')[:100]}...")
                        print(f"  分类: {first_q.get('category', 'N/A')}")
                else:
                    print("⚠️ 响应格式异常")
                    print(f"完整响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
                    
            except json.JSONDecodeError:
                print("❌ 响应不是有效JSON")
                print(f"原始响应: {response.text[:300]}...")
                
        else:
            print(f"❌ 请求失败: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时(60秒)")
    except Exception as e:
        print(f"❌ 请求异常: {str(e)}")

def test_answer_interface():
    """测试回答接口"""
    print("\n🔍 测试 /interview/answer 接口...")
    
    url = "http://127.0.0.1:5000/interview/answer"
    params = {"message": "你好，我想面试Python开发工程师"}
    
    print(f"请求URL: {url}")
    print(f"参数: {json.dumps(params, ensure_ascii=False)}")
    
    try:
        print("⏱️ 发送请求...")
        start_time = time.time()
        response = requests.get(url, params=params, timeout=60)
        end_time = time.time()
        
        print(f"⏱️ 响应时间: {end_time - start_time:.2f}秒")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ 请求成功!")
            try:
                data = response.json()
                content = data.get('content', '')
                print(f"AI回复: {content[:200]}{'...' if len(content) > 200 else ''}")
            except json.JSONDecodeError:
                print("❌ 响应不是有效JSON")
                print(f"原始响应: {response.text[:300]}...")
        else:
            print(f"❌ 请求失败: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时(60秒)")
    except Exception as e:
        print(f"❌ 请求异常: {str(e)}")

def main():
    print("="*60)
    print("🚀 开始测试面试官AI接口")
    print("="*60)
    
    # 1. 测试服务器健康状态
    if not test_server_health():
        return
    
    # 2. 测试推荐题目接口
    test_recommend_questions()
    
    # 3. 测试回答接口
    test_answer_interface()
    
    print("\n" + "="*60)
    print("📋 测试完成")
    print("="*60)

if __name__ == "__main__":
    main()
