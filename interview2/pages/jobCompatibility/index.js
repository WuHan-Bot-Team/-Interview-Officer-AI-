// 页面配置和导入
import useToastBehavior from '~/behaviors/useToast';
import { config } from '../../config/index.js';

Page({
  behaviors: [useToastBehavior],
  
  data: {
    // 问卷题目（从后端获取）
    questions: [],
    
    // 当前问题索引
    currentQuestion: 0,
    
    // 用户答案
    answers: {},
    
    // 是否显示问卷
    showQuestionnaire: false,
    
    // 是否显示结果
    showResults: false,
    
    // 分析结果
    analysisResult: null,
    
    // 加载状态
    loading: false,
    
    // 分析加载状态  
    analyzing: false
  },
  
  onLoad() {
    console.log('工作适配度页面加载');
    this.loadQuestions();
  },
  
  onShow() {
    console.log('工作适配度页面显示');
  },
  
  // 从后端加载问卷题目
  loadQuestions() {
    console.log('开始加载问卷题目');
    const that = this;
    this.setData({ loading: true });
    
    wx.request({
      url: `${config.baseURL}/job_compatibility/questions`,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success(response) {
        console.log('题目加载成功:', response.data);
        if (response.data.status === 'success') {
          that.setData({
            questions: response.data.data,
            loading: false
          });
        } else {
          throw new Error('获取题目失败');
        }
      },
      fail(error) {
        console.error('加载题目失败:', error);
        that.onShowToast('#t-toast', '加载题目失败，使用默认题目');
        
        // 使用本地备用题目
        that.setData({
          questions: that.getDefaultQuestions(),
          loading: false
        });
      }
    });
  },
  
  // 获取默认题目（备用）
  getDefaultQuestions() {
    return [
      {
        id: 'salary',
        title: '您的薪资期望范围是？',
        type: 'radio',
        options: ['3k-5k', '5k-8k', '8k-12k', '12k-20k', '20k+']
      },
      {
        id: 'workMode',
        title: '您偏好的工作模式是？',
        type: 'radio',
        options: ['现场工作', '远程工作', '混合工作', '无所谓']
      },
      {
        id: 'interests',
        title: '您的兴趣方向有哪些？（多选）',
        type: 'checkbox',
        options: ['技术研发', '产品设计', '数据分析', '市场营销', '项目管理', '用户体验']
      },
      {
        id: 'companySize',
        title: '您偏好的公司规模是？',
        type: 'radio',
        options: ['创业公司(小于50人)', '中小企业(50-500人)', '大型企业(500人以上)', '无偏好']
      },
      {
        id: 'overtime',
        title: '您对加班的接受程度？',
        type: 'radio',
        options: ['完全不接受', '偶尔可以', '经常加班也OK', '996都可以']
      },
      {
        id: 'careerPriority',
        title: '您最看重的职业发展因素是？',
        type: 'radio',
        options: ['技能提升', '薪资增长', '工作稳定', '工作生活平衡']
      },
      {
        id: 'location',
        title: '您偏好的工作地点类型？',
        type: 'radio',
        options: ['一线城市', '二线城市', '三线及以下', '无偏好']
      },
      {
        id: 'education',
        title: '您的最高学历是？',
        type: 'radio',
        options: ['高中及以下', '大专', '本科', '硕士', '博士']
      }
    ];
  },
  
  // 开始问卷测评
  startQuestionnaire() {
    console.log('开始问卷测评');
    this.setData({
      showQuestionnaire: true,
      currentQuestion: 0,
      answers: {}
    });
  },
  
  // 选择选项
  selectOption(e) {
    const value = e.currentTarget.dataset.value;
    const currentQuestion = this.data.questions[this.data.currentQuestion];
    
    console.log('选择选项:', value, '当前题目:', currentQuestion);
    
    if (currentQuestion.type === 'radio') {
      // 单选题
      this.setData({
        [`answers.${currentQuestion.id}`]: value
      });
    } else if (currentQuestion.type === 'checkbox') {
      // 多选题
      let currentAnswers = this.data.answers[currentQuestion.id] || [];
      const index = currentAnswers.indexOf(value);
      
      if (index > -1) {
        // 取消选择
        currentAnswers.splice(index, 1);
      } else {
        // 添加选择
        currentAnswers.push(value);
      }
      
      this.setData({
        [`answers.${currentQuestion.id}`]: currentAnswers
      });
    }
  },
  
  // 下一题
  nextQuestion() {
    const currentQuestion = this.data.questions[this.data.currentQuestion];
    const answer = this.data.answers[currentQuestion.id];
    
    // 验证答案
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      this.onShowToast('#t-toast', '请选择答案后再继续');
      return;
    }
    
    if (this.data.currentQuestion < this.data.questions.length - 1) {
      this.setData({
        currentQuestion: this.data.currentQuestion + 1
      });
    } else {
      // 最后一题，提交分析
      this.submitAnalysis();
    }
  },
  
  // 上一题
  prevQuestion() {
    if (this.data.currentQuestion > 0) {
      this.setData({
        currentQuestion: this.data.currentQuestion - 1
      });
    }
  },
  
  // 提交分析
  submitAnalysis() {
    console.log('提交分析', this.data.answers);
    const that = this;
    this.setData({ analyzing: true });
    
    wx.request({
      url: `${config.baseURL}/job_compatibility/analyze`,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        answers: this.data.answers,
        jobInfo: {
          description: '软件开发岗位' // 可以根据需要修改
        }
      },
      success(response) {
        console.log('分析结果:', response.data);
        if (response.data.status === 'success') {
          that.setData({
            analysisResult: response.data.data,
            showResults: true,
            showQuestionnaire: false,
            analyzing: false
          });
        } else {
          throw new Error('分析失败');
        }
      },
      fail(error) {
        console.error('分析失败:', error);
        that.onShowToast('#t-toast', '分析失败，使用模拟结果');
        
        // 使用模拟结果
        that.setData({
          analysisResult: that.generateMockResult(),
          showResults: true,
          showQuestionnaire: false,
          analyzing: false
        });
      }
    });
  },
  
  // 生成模拟结果（备用）
  generateMockResult() {
    return {
      overall_score: 78,
      dimensions: {
        salary_match: 82,
        interest_alignment: 88,
        development_prospect: 85,
        work_environment: 75
      },
      strengths: [
        '薪资期望合理，符合市场行情',
        '个人兴趣与岗位需求高度匹配',
        '职业发展目标明确，成长潜力大'
      ],
      improvements: [
        '建议了解更多行业发展趋势',
        '可以提升团队协作能力',
        '持续学习新技术保持竞争力'
      ],
      summary: '您与目标岗位的整体适配度较高，在兴趣匹配和发展前景方面表现突出。建议继续提升技术能力和团队协作技能。'
    };
  },
  
  // 重新测试
  retakeTest() {
    this.setData({
      currentQuestion: 0,
      answers: {},
      showResults: false,
      showQuestionnaire: true,
      analysisResult: null
    });
  },
  
  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/home2/index'
    });
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
  
  // 多选框切换
  toggleCheckbox(e) {
    this.selectOption(e);
  },
  
  // 提交问卷
  submitQuestionnaire() {
    this.submitAnalysis();
  },
  
  // 重新开始测试
  restartTest() {
    this.retakeTest();
  },
  
  // 分享结果
  shareResults() {
    const result = this.data.analysisResult;
    if (result) {
      wx.showModal({
        title: '分享结果',
        content: `我的职业适配度测评结果：${result.overall_score}分！${result.summary}`,
        showCancel: false
      });
    }
  }
});
