import json
from flask import Blueprint, request, jsonify
from services.DeepSeek import DeepseekAPI
import time
import datetime

job_compatibility_bp = Blueprint('job_compatibility', __name__)

@job_compatibility_bp.route('/analyze', methods=['POST'])
def analyze_job_compatibility():
    """
    分析工作适配度
    接收用户问卷答案，通过AI分析生成适配度报告
    """
    try:
        data = request.get_json()
        
        if not data or 'answers' not in data:
            return jsonify({'error': '缺少问卷答案数据'}), 400
        
        answers = data['answers']
        job_info = data.get('jobInfo', {})
        
        # 验证答案完整性
        required_questions = ['salary', 'workMode', 'interests', 'companySize', 
                            'overtime', 'careerPriority', 'location', 'education']
        
        for q in required_questions:
            if q not in answers:
                return jsonify({'error': f'缺少问题 {q} 的答案'}), 400
        
        # 调用AI分析
        analysis_result = analyze_compatibility_with_ai(answers, job_info)
        
        # 保存分析结果（可选）
        save_analysis_result(analysis_result, answers)
        
        return jsonify({
            'status': 'success',
            'data': analysis_result,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"工作适配度分析错误: {str(e)}")
        return jsonify({'error': '分析过程中发生错误，请稍后重试'}), 500

def analyze_compatibility_with_ai(answers, job_info):
    """
    使用AI分析工作适配度
    """
    try:
        # 构建分析提示词
        prompt = build_analysis_prompt(answers, job_info)
        
        # 调用DeepSeek API
        deepseek_api = DeepseekAPI()
        ai_response = deepseek_api.safe_generate_content_deepseek2(prompt)
        
        # 解析AI响应并生成结构化结果
        analysis_result = parse_ai_response(ai_response, answers)
        
        return analysis_result
        
    except Exception as e:
        print(f"AI分析错误: {str(e)}")
        # 如果AI分析失败，返回基于规则的分析结果
        return generate_fallback_analysis(answers)

def build_analysis_prompt(answers, job_info):
    """
    构建AI分析提示词
    """
    job_description = job_info.get('description', '通用岗位')
    
    prompt = f"""
作为专业的职业规划师，请根据以下用户问卷答案分析其与目标岗位的适配度：

目标岗位：{job_description}

用户问卷答案：
1. 薪资期望：{answers.get('salary', 'N/A')}
2. 工作偏好：{answers.get('workMode', 'N/A')}
3. 兴趣方向：{', '.join(answers.get('interests', []))}
4. 公司规模偏好：{answers.get('companySize', 'N/A')}
5. 加班接受度：{answers.get('overtime', 'N/A')}
6. 职业发展重点：{answers.get('careerPriority', 'N/A')}
7. 工作地点偏好：{answers.get('location', 'N/A')}
8. 学历背景：{answers.get('education', 'N/A')}

请从以下四个维度进行分析，每个维度给出0-100的分数：

1. 薪资匹配度：分析用户薪资期望与市场行情的匹配程度
2. 兴趣契合度：分析用户兴趣与岗位要求的契合程度  
3. 发展前景：分析该岗位对用户职业发展的帮助程度
4. 工作环境：分析工作模式、公司文化等环境因素的匹配度

请以JSON格式返回分析结果：
{{
    "overall_score": 整体适配度分数(0-100),
    "dimensions": {{
        "salary_match": 薪资匹配度分数,
        "interest_alignment": 兴趣契合度分数,
        "development_prospect": 发展前景分数,
        "work_environment": 工作环境分数
    }},
    "strengths": ["优势点1", "优势点2", "优势点3"],
    "improvements": ["改进建议1", "改进建议2", "改进建议3"],
    "summary": "整体分析总结（100字以内）"
}}
"""
    
    return prompt

def parse_ai_response(ai_response, answers):
    """
    解析AI响应，提取结构化数据
    """
    try:
        # 尝试直接解析JSON
        if ai_response.strip().startswith('{'):
            result = json.loads(ai_response)
            return result
        
        # 如果不是直接的JSON，尝试提取JSON部分
        start_idx = ai_response.find('{')
        end_idx = ai_response.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = ai_response[start_idx:end_idx]
            result = json.loads(json_str)
            return result
        
        # 如果解析失败，返回默认结果
        return generate_fallback_analysis(answers)
        
    except Exception as e:
        print(f"解析AI响应错误: {str(e)}")
        return generate_fallback_analysis(answers)

def generate_fallback_analysis(answers):
    """
    生成基于规则的分析结果（当AI分析失败时使用）
    """
    # 基于问卷答案的简单评分逻辑
    scores = {
        'salary_match': calculate_salary_score(answers.get('salary')),
        'interest_alignment': calculate_interest_score(answers.get('interests', [])),
        'development_prospect': calculate_development_score(answers.get('careerPriority')),
        'work_environment': calculate_environment_score(answers)
    }
    
    overall_score = sum(scores.values()) // 4
    
    return {
        'overall_score': overall_score,
        'dimensions': scores,
        'strengths': generate_strengths(answers, scores),
        'improvements': generate_improvements(answers, scores),
        'summary': f'基于您的问卷答案，整体适配度为{overall_score}分。建议关注个人发展规划和技能提升。'
    }

def calculate_salary_score(salary_expectation):
    """计算薪资匹配度分数"""
    if not salary_expectation:
        return 70
    
    salary_map = {
        '3k-5k': 85,
        '5k-8k': 88,
        '8k-12k': 90,
        '12k-20k': 85,
        '20k+': 75
    }
    
    return salary_map.get(salary_expectation, 75)

def calculate_interest_score(interests):
    """计算兴趣契合度分数"""
    if not interests:
        return 60
    
    # 兴趣越多样化，分数越高
    base_score = 70
    diversity_bonus = min(len(interests) * 5, 25)
    
    return min(base_score + diversity_bonus, 95)

def calculate_development_score(career_priority):
    """计算发展前景分数"""
    priority_map = {
        '技能提升': 90,
        '薪资增长': 85,
        '工作稳定': 80,
        '工作生活平衡': 75
    }
    
    return priority_map.get(career_priority, 80)

def calculate_environment_score(answers):
    """计算工作环境分数"""
    base_score = 75
    
    # 加班接受度影响
    overtime = answers.get('overtime')
    if overtime == '完全不接受':
        base_score += 10  # 明确边界是好事
    elif overtime == '偶尔可以':
        base_score += 5
    
    # 工作模式影响
    work_mode = answers.get('workMode')
    if work_mode in ['远程工作', '混合工作']:
        base_score += 5  # 灵活工作模式加分
    
    return min(base_score, 95)

def generate_strengths(answers, scores):
    """生成优势点"""
    strengths = []
    
    if scores['salary_match'] >= 85:
        strengths.append('薪资期望合理，符合市场行情')
    
    if scores['interest_alignment'] >= 85:
        strengths.append('个人兴趣与岗位需求高度匹配')
    
    if scores['development_prospect'] >= 85:
        strengths.append('职业发展目标明确，成长潜力大')
    
    if scores['work_environment'] >= 85:
        strengths.append('工作环境适应性强，协作能力佳')
    
    # 确保至少有3个优势点
    default_strengths = [
        '学习能力强，适应性好',
        '职业规划清晰，目标明确',
        '工作态度积极，责任心强'
    ]
    
    while len(strengths) < 3:
        for strength in default_strengths:
            if strength not in strengths:
                strengths.append(strength)
                break
    
    return strengths[:3]

def generate_improvements(answers, scores):
    """生成改进建议"""
    improvements = []
    
    if scores['salary_match'] < 80:
        improvements.append('建议了解行业薪资水平，调整期望值')
    
    if scores['interest_alignment'] < 80:
        improvements.append('可以进一步探索岗位相关的兴趣领域')
    
    if scores['development_prospect'] < 80:
        improvements.append('建议制定更明确的职业发展规划')
    
    if scores['work_environment'] < 80:
        improvements.append('可以提升团队协作和沟通能力')
    
    # 确保至少有3个建议
    default_improvements = [
        '持续学习新技能，保持竞争力',
        '积极参与行业交流，扩展人脉',
        '定期反思和调整职业目标'
    ]
    
    while len(improvements) < 3:
        for improvement in default_improvements:
            if improvement not in improvements:
                improvements.append(improvement)
                break
    
    return improvements[:3]

def save_analysis_result(analysis_result, answers):
    """
    保存分析结果到文件（可选功能）
    """
    try:
        # 创建保存目录
        save_dir = 'resource/job_compatibility'
        os.makedirs(save_dir, exist_ok=True)
        
        # 生成文件名
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'analysis_{timestamp}.json'
        filepath = os.path.join(save_dir, filename)
        
        # 保存数据
        save_data = {
            'timestamp': datetime.datetime.now().isoformat(),
            'answers': answers,
            'analysis_result': analysis_result
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(save_data, f, ensure_ascii=False, indent=2)
        
        print(f"分析结果已保存到: {filepath}")
        
    except Exception as e:
        print(f"保存分析结果错误: {str(e)}")

@job_compatibility_bp.route('/questions', methods=['GET'])
def get_questions():
    """
    获取工作适配度问卷题目
    """
    questions = [
        {
            'id': 'salary',
            'title': '您的薪资期望范围是？',
            'type': 'radio',
            'options': ['3k-5k', '5k-8k', '8k-12k', '12k-20k', '20k+']
        },
        {
            'id': 'workMode',
            'title': '您偏好的工作模式是？',
            'type': 'radio',
            'options': ['现场工作', '远程工作', '混合工作', '无所谓']
        },
        {
            'id': 'interests',
            'title': '您的兴趣方向有哪些？（多选）',
            'type': 'checkbox',
            'options': ['技术研发', '产品设计', '数据分析', '市场营销', '项目管理', '用户体验']
        },
        {
            'id': 'companySize',
            'title': '您偏好的公司规模是？',
            'type': 'radio',
            'options': ['创业公司(小于50人)', '中小企业(50-500人)', '大型企业(500人以上)', '无偏好']
        },
        {
            'id': 'overtime',
            'title': '您对加班的接受程度？',
            'type': 'radio',
            'options': ['完全不接受', '偶尔可以', '经常加班也OK', '996都可以']
        },
        {
            'id': 'careerPriority',
            'title': '您最看重的职业发展因素是？',
            'type': 'radio',
            'options': ['技能提升', '薪资增长', '工作稳定', '工作生活平衡']
        },
        {
            'id': 'location',
            'title': '您偏好的工作地点类型？',
            'type': 'radio',
            'options': ['一线城市', '二线城市', '三线及以下', '无偏好']
        },
        {
            'id': 'education',
            'title': '您的最高学历是？',
            'type': 'radio',
            'options': ['高中及以下', '大专', '本科', '硕士', '博士']
        }
    ]
    
    return jsonify({
        'status': 'success',
        'data': questions
    })

@job_compatibility_bp.route('/history', methods=['GET'])
def get_analysis_history():
    """
    获取历史分析记录
    """
    try:
        save_dir = 'resource/job_compatibility'
        if not os.path.exists(save_dir):
            return jsonify({
                'status': 'success',
                'data': []
            })
        
        history = []
        for filename in os.listdir(save_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(save_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        history.append({
                            'id': filename.replace('.json', ''),
                            'timestamp': data.get('timestamp'),
                            'overall_score': data.get('analysis_result', {}).get('overall_score', 0)
                        })
                except Exception as e:
                    print(f"读取历史记录错误: {str(e)}")
        
        # 按时间倒序排列
        history.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'data': history[:10]  # 只返回最近10条记录
        })
        
    except Exception as e:
        print(f"获取历史记录错误: {str(e)}")
        return jsonify({'error': '获取历史记录失败'}), 500
