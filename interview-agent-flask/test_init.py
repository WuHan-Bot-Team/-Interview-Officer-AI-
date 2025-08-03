import requests
import json

def test_init_endpoint():
    url = "http://127.0.0.1:5000/interview/init"
    
    # 测试数据
    test_data = {
        "major": "计算机科学与技术",
        "intention": "后端开发工程师",
        "job_description": "负责服务端系统开发，包括API设计、数据库优化、微服务架构等工作"
    }
    
    try:
        print("正在测试 /interview/init 端点...")
        print(f"请求数据: {test_data}")
        
        response = requests.post(url, json=test_data, headers={'Content-Type': 'application/json'})
        
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ 请求成功!")
            try:
                data = response.json()
                print(f"响应数据: {data}")
            except json.JSONDecodeError:
                print(f"响应内容 (非JSON): {response.text}")
        else:
            print(f"❌ 请求失败! 状态码: {response.status_code}")
            try:
                error_data = response.json()
                print(f"错误信息: {error_data}")
            except json.JSONDecodeError:
                print(f"错误内容: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败! 请确保 Flask 应用正在运行在 http://127.0.0.1:5000")
    except Exception as e:
        print(f"❌ 发生错误: {str(e)}")

if __name__ == "__main__":
    test_init_endpoint()
