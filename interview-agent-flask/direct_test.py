import json
import glob
import os

# 直接测试 recent_feedbacks 功能
def test_recent_feedbacks_function():
    FEEDBACK_FOLDER_ROUTE = 'resource/feedback/'
    
    try:
        print("🔍 正在搜索反馈文件...")
        feedback_files = glob.glob(os.path.join(FEEDBACK_FOLDER_ROUTE, "*.txt"))
        print(f"找到 {len(feedback_files)} 个反馈文件")
        
        if not feedback_files:
            print("❌ 没有找到反馈文件")
            return
            
        # 按修改时间降序排序
        sorted_files = sorted(feedback_files, key=os.path.getmtime, reverse=True)
        recent_files = sorted_files[:5]  # 获取最近的5个文件
        
        print(f"📋 获取最近的 {len(recent_files)} 个文件:")
        
        feedbacks = []
        for i, file in enumerate(recent_files, 1):
            print(f"\n--- 文件 {i}: {os.path.basename(file)} ---")
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    print(f"文件大小: {len(content)} 字符")
                    
                    # 尝试解析为 JSON
                    try:
                        json_data = json.loads(content)
                        print("✅ JSON 格式有效")
                        print(f"包含键: {list(json_data.keys())}")
                    except json.JSONDecodeError:
                        print("⚠️ 不是有效的 JSON 格式")
                    
                    feedbacks.append({
                        'filename': os.path.basename(file), 
                        'content': content
                    })
                    
            except Exception as e:
                print(f"❌ 读取文件失败: {str(e)}")
                
        print(f"\n✅ 成功处理 {len(feedbacks)} 个反馈文件")
        print("recent_feedbacks 功能测试完成!")
        
        return feedbacks
        
    except Exception as e:
        print(f"❌ 发生错误: {str(e)}")

if __name__ == "__main__":
    test_recent_feedbacks_function()
