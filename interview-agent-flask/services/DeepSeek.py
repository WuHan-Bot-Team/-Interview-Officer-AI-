import os
import re
import json
import time
from openai import OpenAI

API_KEY_DEEPSEEK = "sk-418c53002f48457493af9c841d779e9a"


def chunk_text(text, chunk_size=4000):
    """
    按指定大小把文本分割成多个块，防止一次性输入过长导致 API 调用失败。
    """
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]

def split_into_chunks(text, chunk_size=50):
    # 1. 先用双换行符分割原始字符串
    segments = [segment.strip()+"\n" for segment in text.split('\n\n') if segment.strip()]
    # 2. 按指定大小分块
    chunks = []
    for i in range(0, len(segments), chunk_size):
        chunk = segments[i:i + chunk_size]
        chunks.append(chunk)
    return chunks


class DeepseekAPI():
    _instance = None

    def __init__(self):
        self.global_deepseek_client = OpenAI(
            api_key=API_KEY_DEEPSEEK,
            base_url="https://api.deepseek.com",)
        print("[Deepseek] 初始化成功")
    def safe_generate_content_deepseek2(self, prompt, max_retries=1):
        class DeepseekResponse:
            def __init__(self, text):
                self.text = text

        for attempt in range(1, max_retries + 1):
            try:
                response = self.global_deepseek_client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[{"role": "user", "content": prompt}],
                    stream=False
                )
                # print(json.loads(response.choices[0].message.content))
                print(response.choices[0].message.content)
                return DeepseekResponse(response.choices[0].message.content)

            except Exception as e:
                print(f"[Deepseek] 第 {attempt} 次调用出错: {e}")
                if attempt == max_retries:
                    print("[Deepseek] 已达最大重试次数，抛出异常。")
                    raise
                print("[Deepseek] 等待 5 秒后重试...")
                time.sleep(5)

        return ""

    def chat_with_history(self, deepseek_history=[], max_retries=1):
        """
        支持多轮对话，deepseek_history为历史消息列表（每项为dict: {"role": ..., "content": ...}），prompt为当前用户输入。
        返回完整的message内容。
        需要在外边拼接prompt到history中。
        """
        # messages = deepseek_history.copy() if deepseek_history else []
        # messages.append({"role": "user", "content": prompt})
        if not deepseek_history:
            return {}
        history = deepseek_history.copy()
        history.insert(0, {"role": "user", "content": "所有回答控制在100字以内"})
        print(history)

        for attempt in range(1, max_retries + 1):
            try:
                response = self.global_deepseek_client.chat.completions.create(
                    model="deepseek-chat",
                    messages=history,  # 修复：使用修改后的 history 而不是原始的 deepseek_history
                    stream=False
                )
                message = response.choices[0].message
                print(message)
                return message
            except Exception as e:
                print(f"[Deepseek 多轮对话] 第 {attempt} 次调用出错: {e}")
                if attempt == max_retries:
                    print("[Deepseek 多轮对话] 已达最大重试次数，抛出异常。")
                    raise
                print("[Deepseek 多轮对话] 等待 5 秒后重试...")
                time.sleep(5)
        return {}

    def chat_return_json(self, prompt="", max_retries=1):
        if not prompt:
            return {}

        for attempt in range(1, max_retries + 1):
            try:
                response = self.global_deepseek_client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[{"role": "user", "content": prompt}],
                    stream=False,
                    response_format={
                        'type': 'json_object'
                    }
                )
                message = response.choices[0].message
                print(message)
                return message
            except Exception as e:
                print(f"[Deepseek 多轮对话] 第 {attempt} 次调用出错: {e}")
                if attempt == max_retries:
                    print("[Deepseek 多轮对话] 已达最大重试次数，抛出异常。")
                    raise
                print("[Deepseek 多轮对话] 等待 5 秒后重试...")
                time.sleep(5)
        return {}



    @classmethod
    def getInstance(cls)-> "DeepseekAPI":
        if not cls._instance:
            cls._instance = DeepseekAPI()
        return cls._instance
