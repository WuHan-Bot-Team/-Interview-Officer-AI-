import requests
import json
import time

def test_with_valid_params():
    """使用有效参数测试推荐接口"""
    print("🔍 使用有效参数测试推荐接口...")
    
    url = "http://127.0.0.1:5000/practice/recommend_questions"
    
    # 使用合理的参数
    valid_params = {
        "major": "计算机科学",
        "position": "软件工程师", 
        "difficulty": "中等",
        "type": "技术"
    }
    
    print(f"请求URL: {url}")
    print(f"有效参数: {json.dumps(valid_params, ensure_ascii=False)}")
    
    try:
        print("⏱️ 发送请求...")
        start_time = time.time()
        response = requests.get(url, params=valid_params, timeout=90)
        end_time = time.time()
        
        print(f"⏱️ 响应时间: {end_time - start_time:.2f}秒")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ 请求成功!")
            data = response.json()
            print(f"success: {data.get('success')}")
            
            if data.get('success'):
                questions = data.get('data', {}).get('questions', [])
                print(f"生成题目数量: {len(questions)}")
                if questions:
                    print(f"第一题: {questions[0].get('question', 'N/A')[:100]}...")
            else:
                print(f"接口返回失败: {data.get('error', 'N/A')}")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except Exception as e:
        print(f"❌ 请求异常: {str(e)}")

def test_with_original_params():
    """使用原始参数测试（模拟前端请求）"""
    print("\n🔍 使用原始参数测试（模拟前端）...")
    
    url = "http://127.0.0.1:5000/practice/recommend_questions"
    
    # 使用前端实际发送的参数
    original_params = {
        "major": "原神",
        "position": "原神", 
        "difficulty": "中等",
        "type": "技术"
    }
    
    print(f"请求URL: {url}")
    print(f"原始参数: {json.dumps(original_params, ensure_ascii=False)}")
    
    try:
        print("⏱️ 发送请求...")
        start_time = time.time()
        response = requests.get(url, params=original_params, timeout=90)
        end_time = time.time()
        
        print(f"⏱️ 响应时间: {end_time - start_time:.2f}秒")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ 请求成功!")
            data = response.json()
            print(f"success: {data.get('success')}")
            
            if data.get('success'):
                questions = data.get('data', {}).get('questions', [])
                print(f"生成题目数量: {len(questions)}")
                if questions:
                    print(f"第一题: {questions[0].get('question', 'N/A')[:100]}...")
                else:
                    print("⚠️ 没有生成题目")
                    raw_content = data.get('data', {}).get('raw_content', '')
                    if raw_content:
                        print(f"AI原始回复: {raw_content[:200]}...")
            else:
                print(f"接口返回失败: {data.get('error', 'N/A')}")
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except Exception as e:
        print(f"❌ 请求异常: {str(e)}")

if __name__ == "__main__":
    print("="*60)
    print("🚀 测试不同参数对接口的影响")
    print("="*60)
    
    # 先测试有效参数
    test_with_valid_params()
    
    # 再测试原始参数  
    test_with_original_params()
    
    print("\n" + "="*60)
    print("📋 测试完成")
    print("="*60)
