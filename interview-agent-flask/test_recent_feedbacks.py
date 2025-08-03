import requests
import json

# 测试 recent_feedbacks 路由
def test_recent_feedbacks():
    url = "http://127.0.0.1:5000/interview/recent_feedbacks"
    
    try:
        response = requests.get(url)
        print(f"状态码: {response.status_code}")
        print(f"响应头: {response.headers}")
        
        if response.status_code == 200:
            print("✅ 请求成功!")
            data = response.json()
            print(f"返回的反馈数量: {len(data)}")
            
            # 打印每个反馈的信息
            for i, feedback in enumerate(data, 1):
                print(f"\n--- 反馈 {i} ---")
                print(f"文件名: {feedback.get('filename', 'N/A')}")
                content = feedback.get('content', '')
                print(f"内容长度: {len(content)} 字符")
                # 只显示内容的前100个字符
                print(f"内容预览: {content[:100]}...")
                
        else:
            print(f"❌ 请求失败! 状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ 连接失败! 请确保 Flask 应用正在运行在 http://127.0.0.1:5000")
    except Exception as e:
        print(f"❌ 发生错误: {str(e)}")

if __name__ == "__main__":
    test_recent_feedbacks()
