import requests
import json
import time

print("🔍 测试推荐题目接口（90秒超时）...")

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
    response = requests.get(url, params=params, timeout=90)
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
    print("❌ 请求超时(90秒) - DeepSeek API 响应时间过长")
except Exception as e:
    print(f"❌ 请求异常: {str(e)}")

print("\n💡 如果接口仍然超时，说明 DeepSeek API 响应确实很慢")
print("💡 前端需要设置更长的超时时间（至少60-90秒）")
