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
            return jsonify({'error': 'No answer found'}), 500
    
    return jsonify({'error': 'Invalid request'}), 400


@practice_bp.route('/project_packaging', methods=['POST'])
def project_packaging():
    """处理项目文件上传并返回文件内容"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # 检查文件大小 (5MB限制)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        if file_size > 5 * 1024 * 1024:
            return jsonify({'error': 'File size exceeds 5MB limit'}), 400
        
        file.seek(0)
        content = ""
        
        # 根据文件类型读取内容
        if file.filename.endswith('.pdf'):
            try:
                pdf_reader = PyPDF2.PdfReader(BytesIO(file.read()))
                for page in pdf_reader.pages:
                    content += page.extract_text() + "\n"
            except Exception as e:
                return jsonify({'error': f'Failed to read PDF: {str(e)}'}), 400
                
        elif file.filename.endswith(('.docx', '.doc')):
            try:
                doc = docx.Document(BytesIO(file.read()))
                for paragraph in doc.paragraphs:
                    content += paragraph.text + "\n"
            except Exception as e:
                return jsonify({'error': f'Failed to read Word document: {str(e)}'}), 400
                
        elif file.filename.endswith(('.txt', '.py', '.js', '.html', '.css', '.json', '.md', '.java', '.cpp', '.c')):
            try:
                content = file.read().decode('utf-8')
            except UnicodeDecodeError:
                try:
                    file.seek(0)
                    content = file.read().decode('gbk')
                except UnicodeDecodeError:
                    return jsonify({'error': 'Unable to decode file content'}), 400
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        if not content.strip():
            return jsonify({'error': 'File content is empty'}), 400
        
        return jsonify({
            'success': True,
            'filename': file.filename,
            'content': content,
            'size': file_size
        })
        
    except Exception as e:
        return jsonify({'error': f'Processing failed: {str(e)}'}), 500


@practice_bp.route('/answer_v2', methods=['POST'])
def handle_answer_v2():
    """专门用于项目包装的AI分析接口"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        file_content = data.get('file_content', '')
        project_name = data.get('project_name', '')
        project_desc = data.get('project_desc', '')
        
        if not file_content:
            return jsonify({'error': 'No file content provided'}), 400
        
        # 构建专门的项目包装提示词
        prompt = f'''请你作为一名资深职业规划师，帮助学生将学校项目包装成有竞争力的简历项目。

项目信息：
项目名称：{project_name or '未提供'}
项目描述：{project_desc or '未提供'}

项目文件内容：
{file_content}

请按照以下要求生成项目包装文案：

1. **项目标题**：给出一个有吸引力的项目名称
2. **技术栈**：列出项目使用的技术和工具
3. **核心功能**：总结项目的主要功能模块
4. **技术亮点**：突出项目的技术难点和创新点
5. **个人贡献**：描述在项目中的具体贡献和角色
6. **项目成果**：量化项目的影响和成果

要求：
- 语言专业，突出商业价值
- 使用量化数据（如可能）
- 强调技术深度和复杂度
- 适合写在简历上
- 控制在300字以内

请直接输出包装后的项目描述，不要包含其他说明文字。'''

        try:
            # 调用DeepSeek API
            deepseek = DeepseekAPI.getInstance()
            response = deepseek.safe_generate_content_deepseek2(prompt)
            
            if response and response.text:
                return jsonify({
                    'success': True,
                    'content': response.text
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'AI生成内容为空'
                }), 500
                
        except Exception as e:
            error_msg = str(e)
            print(f"项目包装AI分析错误: {error_msg}")
            
            return jsonify({
                'success': False,
                'error': f'AI服务暂时不可用: {error_msg}'
            }), 500
            
    except Exception as e:
        return jsonify({'error': f'Request processing failed: {str(e)}'}), 500


@practice_bp.route('/evaluate', methods=['GET'])
def evaluate():
    return jsonify({'message': 'Evaluate endpoint working'})
