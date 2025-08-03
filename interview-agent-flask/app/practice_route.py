import json
from flask import Blueprint, request, Response, jsonify, stream_with_context
import PyPDF2
import time
import docx
from io import BytesIO
from services.DeepSeek import DeepseekAPI
from services.SparkPractice import AIPracticeAPI
import os
import datetime


practice_bp = Blueprint('practice', __name__)

@practice_bp.route('/answer', methods=['GET'])
def handle_answer():
    user_message = request.args.get('page', default=1, type=str)
    # user_message = request.json.get('message', '')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    # 模拟流式输出
    def generate_response():
        responses = [
            '正在分析您的问题...\n',
            '根据您的描述，我认为...\n',
            '以下是我的建议：\n',
            '1. 首先...\n',
            '2. 其次...\n',
            '3. 最后...\n'
        ]
        for resp in responses:
            time.sleep(0.5)  # 模拟处理延迟
            yield resp.encode('utf-8')
    
    return Response(generate_response(), mimetype='text/event-stream')


@practice_bp.route('/answer_v1', methods=['GET'])
def handle_answer_v1():
    user_message = request.args.get('prompt', default="", type=str)
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    if user_message:
        AIPractice = AIPracticeAPI.getInstance()
        res = AIPractice.get_answer(user_message)
        print(res)
        if res:
            return jsonify({'content': res})
        else:
            return jsonify({'error': 'Deepseek API error'}), 500
    

@practice_bp.route('/evaluate', methods=['GET'])
def evaluate():
    history_data = request.args.get('historyData', default="", type=str)
    if not history_data:
        return jsonify({'error': 'No history_data provided'}), 400
    
    print(history_data)
    prompt = '''请根据我的根据历史刷题记录分析我的薄弱环节、高频错误点，并给出针对性的提升策略（如重点练习哪些题型、时间管理建议等）。要求分析简洁清晰，建议可操作性强。
                以下是我的历史刷题记录：
                <{}>
             '''.format(history_data)
    print(prompt)
    if history_data:
        Deepseek = DeepseekAPI.getInstance()
        res = Deepseek.safe_generate_content_deepseek2(prompt)
        print(res)
        print(res.text)
        if res:
            return jsonify({'content': res.text})
        else:
            return jsonify({'error': 'Deepseek API error'}), 500

@practice_bp.route('/evaluate_v2', methods=['GET'])
def evaluate_stream():
    history_data = request.args.get('historyData', default="", type=str)
    if not history_data:
        return jsonify({'error': 'No history_data provided'}), 400
    
    print(history_data)
    prompt = '''请根据我的根据历史刷题记录分析我的薄弱环节、高频错误点，并给出针对性的提升策略（如重点练习哪些题型、时间管理建议等）。要求分析简洁清晰，建议可操作性强。
                以下是我的历史刷题记录：
                <{}>
             '''.format(history_data)
    def generate():
        stream = DeepseekAPI.getInstance().global_deepseek_client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )
        all_text = ""
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                all_text += chunk.choices[0].delta.content
                print(all_text)
                yield f"data: {chunk.choices[0].delta.content}\n\n"
    return Response(generate(), mimetype='text/event-stream', headers = {'Cache-Control': 'no-cache','Connection': 'keep-alive'})


@practice_bp.route('/resume', methods=['POST'])
def handle_resume():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    prompt = request.form.get('prompt', '')
    prompt = '''你是一名资深职业规划师，请根据用户提供的简历内容，按以下要求输出优化建议：
        ## 输出规则
        1. **格式要求**：必须使用Markdown结构化输出
        2. **长度控制**：每条建议不超过3句话，总输出不超过400字
        3. **内容分级**：按优先级标注（❗关键项 / ⚠️改进项 / 💡加分项）
        4. **禁止事项**：不得出现"建议优化"等模糊表述，必须给出具体修改方案
        结尾不要出现"字数统计等字眼"
        '''
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        content = ''
        if file.filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(BytesIO(file.read()))
            for page in pdf_reader.pages:
                content += page.extract_text() + '\n'
        elif file.filename.endswith('.docx'):
            doc = docx.Document(file)
            content = '\n'.join([para.text for para in doc.paragraphs])
        # 保存简历内容到本地文件
        save_dir = os.path.join(os.path.dirname(__file__), '../resource/resume')
        timestamp = int(time.time())
        filename = f"resume-{timestamp}.txt"
        filepath = os.path.join(save_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(content)
        print(prompt)
        if content:
            Deepseek = DeepseekAPI.getInstance()
            res = Deepseek.safe_generate_content_deepseek2(prompt+"，以下是简历内容："+content)
            print(res)
            print(res.text)
            if res:
                return jsonify({'content': res.text})
            else:
                return jsonify({'error': 'Deepseek API error'}), 500
    
    return jsonify({'error': 'Invalid file type. Only PDF files are allowed.'}), 400
