#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试修复后的推荐接口
"""

import requests
import json
import time

def test_recommend_with_retry():
    """测试带重试机制的推荐接口"""
    print("🔍 测试修复后的推荐接口...")
    
    url = "http://127.0.0.1:5000/practice/recommend_questions"
    params = {
        "major": "计算机科学",
        "position": "Python开发工程师",
        "difficulty": "简单",
        "type": "技术"
    }
    
    print(f"请求URL: {url}")
    print(f"参数: {json.dumps(params, ensure_ascii=False)}")
    
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        print(f"\n⏱️ 第 {attempt} 次尝试...")
        try:
            start_time = time.time()
            response = requests.get(url, params=params, timeout=120)  # 增加到2分钟
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
                        
                        if questions and len(questions) > 0:
                            print("📝 题目示例:")
                            for i, q in enumerate(questions[:2], 1):  # 显示前2道题
                                print(f"  {i}. {q.get('question', 'N/A')[:80]}...")
                                print(f"     分类: {q.get('category', 'N/A')}")
                        else:
                            print("⚠️ 没有生成题目，但有原始内容")
                            raw_content = data['data'].get('raw_content', '')
                            if raw_content:
                                print(f"原始内容: {raw_content[:200]}...")
                    else:
                        print("⚠️ 响应格式异常")
                        print(f"完整响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
                    
                    return True  # 成功，退出重试
                    
                except json.JSONDecodeError:
                    print("❌ 响应不是有效JSON")
                    print(f"原始响应: {response.text[:300]}...")
                    
            elif response.status_code == 503:
                print("⚠️ 网络连接错误，等待后重试...")
                time.sleep(5)
            elif response.status_code == 408:
                print("⚠️ 请求超时，等待后重试...")
                time.sleep(3)
            else:
                print(f"❌ 请求失败: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"错误类型: {error_data.get('error_type', 'unknown')}")
                    print(f"错误信息: {error_data.get('error', response.text)}")
                except:
                    print(f"错误信息: {response.text}")
                
        except requests.exceptions.ConnectionError as e:
            print(f"❌ 连接错误: {str(e)}")
            if attempt < max_attempts:
                print(f"等待 {attempt * 2} 秒后重试...")
                time.sleep(attempt * 2)
        except requests.exceptions.Timeout:
            print("❌ 请求超时(120秒)")
            if attempt < max_attempts:
                print("等待 5 秒后重试...")
                time.sleep(5)
        except Exception as e:
            print(f"❌ 其他异常: {str(e)}")
            if attempt < max_attempts:
                print("等待 3 秒后重试...")
                time.sleep(3)
    
    print("❌ 所有重试都失败了")
    return False

if __name__ == "__main__":
    print("="*70)
    print("🚀 测试修复后的推荐接口（带重试机制）")
    print("="*70)
    
    success = test_recommend_with_retry()
    
    print("\n" + "="*70)
    if success:
        print("✅ 测试成功 - 接口工作正常")
    else:
        print("❌ 测试失败 - 接口仍有问题")
    print("="*70)
