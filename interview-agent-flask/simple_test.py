import requests

print("测试服务器连通性...")
try:
    response = requests.get("http://127.0.0.1:5000", timeout=5)
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        print("✅ 服务器正常")
        data = response.json()
        print(f"服务器信息: {data}")
    else:
        print("❌ 服务器异常")
except Exception as e:
    print(f"❌ 连接失败: {e}")

print("\n测试推荐题目接口...")
try:
    url = "http://127.0.0.1:5000/practice/recommend_questions"
    params = {"major": "计算机科学", "position": "Python开发", "difficulty": "简单"}
    response = requests.get(url, params=params, timeout=30)
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        print("✅ 推荐接口正常")
        data = response.json()
        print(f"响应: {data.get('success', False)}")
    else:
        print(f"❌ 推荐接口失败: {response.text}")
except Exception as e:
    print(f"❌ 推荐接口异常: {e}")

print("\n测试回答接口...")
try:
    url = "http://127.0.0.1:5000/interview/answer"
    params = {"message": "你好"}
    response = requests.get(url, params=params, timeout=30)
    print(f"状态码: {response.status_code}")
    if response.status_code == 200:
        print("✅ 回答接口正常")
        data = response.json()
        print(f"AI回复: {data.get('content', 'N/A')[:100]}...")
    else:
        print(f"❌ 回答接口失败: {response.text}")
except Exception as e:
    print(f"❌ 回答接口异常: {e}")
