import useToastBehavior from '~/behaviors/useToast';
import  request  from '~/api/request';

Page({
  behaviors: [useToastBehavior],

  data: {
    loading: false,
    
    // 用户输入数据
    majorInput: '',
    positionInput: '',
    
    // 选择器数据
    difficulties: ['简单', '中等', '困难'],
    difficultyIndex: 1,
    
    types: ['技术', '行为', '逻辑', '综合'],
    typeIndex: 0,
    
    // 推荐结果
    questions: [],
    studySuggestions: ''
  },

  onMajorInput(e) {
    this.setData({
      majorInput: e.detail.value
    });
  },

  onPositionInput(e) {
    this.setData({
      positionInput: e.detail.value
    });
  },

  onDifficultyChange(e) {
    this.setData({
      difficultyIndex: parseInt(e.detail.value)
    });
  },

  onTypeChange(e) {
    this.setData({
      typeIndex: parseInt(e.detail.value)
    });
  },

  // 将中文难度转换为CSS类名
  getDifficultyClass(difficulty) {
    const difficultyMap = {
      '简单': 'easy',
      '中等': 'medium', 
      '困难': 'hard'
    };
    return difficultyMap[difficulty] || 'medium';
  },

  async generateQuestions() {
    // 验证必填项
    if (!this.data.majorInput.trim()) {
      this.onShowToast('#t-toast', '请输入专业方向');
      return;
    }
    
    if (!this.data.positionInput.trim()) {
      this.onShowToast('#t-toast', '请输入目标岗位');
      return;
    }

    this.setData({ loading: true });

    try {
      const params = {
        major: this.data.majorInput.trim(),
        position: this.data.positionInput.trim(),
        difficulty: this.data.difficulties[this.data.difficultyIndex],
        type: this.data.types[this.data.typeIndex]
      };

      console.log('📝 请求参数:', params);

      // 构建查询字符串
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

      console.log('🔗 查询字符串:', queryString);

      const response = await request(`practice/recommend_questions?${queryString}`, 'GET');

      console.log('📥 收到响应:', response);

      if (response.success) {
        console.log('✅ 响应成功，数据:', response.data);
        const result = response.data;
        
        if (result.questions && result.questions.length > 0) {
          console.log('📚 找到题目数量:', result.questions.length);
          this.setData({
            questions: result.questions,
            studySuggestions: result.study_suggestions || ''
          });
          
          this.onShowToast('#t-toast', '推荐题目生成成功！');
        } else {
          console.log('⚠️ 没有题目，使用原始内容');
          // 处理原始文本结果
          this.setData({
            questions: [],
            studySuggestions: result.raw_content || result.study_suggestions || ''
          });
          
          this.onShowToast('#t-toast', '已生成学习建议');
        }
      } else {
        console.log('❌ 响应失败:', response);
        throw new Error(response.error || '生成失败');
      }
    } catch (error) {
      console.error('💥 生成推荐题目错误:', error);
      this.onShowToast('#t-toast', '生成失败，请稍后重试');
    } finally {
      this.setData({ loading: false });
    }
  },

  startPractice(e) {
    const question = e.currentTarget.dataset.question;
    
    // 将题目信息传递给练习页面
    wx.navigateTo({
      url: `/pages/practice/index?question=${encodeURIComponent(question.question)}&tips=${encodeURIComponent(question.tips)}`
    });
  },

  saveQuestion(e) {
    const question = e.currentTarget.dataset.question;
    
    // 保存题目到本地存储
    let savedQuestions = wx.getStorageSync('savedQuestions') || [];
    
    // 检查是否已经保存过
    const exists = savedQuestions.some(q => q.question === question.question);
    if (exists) {
      this.onShowToast('#t-toast', '题目已在收藏夹中');
      return;
    }
    
    savedQuestions.push({
      ...question,
      savedAt: new Date().toISOString()
    });
    
    wx.setStorageSync('savedQuestions', savedQuestions);
    this.onShowToast('#t-toast', '题目已收藏');
  }
});
