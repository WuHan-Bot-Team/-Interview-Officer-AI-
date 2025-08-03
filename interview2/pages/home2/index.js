Page({
  data: {
    // 热门面试推荐列表
    // id 必须与 interviewSetting/index.js 中的 preinput 对象的键一一对应
    recommendedInterviews: [
      {
        id: 1,
        title: '前端工程师',
        desc: '15个常见问题 · 平均难度3.8',
        tags: ['技术面', '项目复盘'],
        hotness: '92%',
        icon: 'code',
        iconColor: '#6366f1',
        bgColor: 'blue-bg'
      },
      {
        id: 2,
        title: 'AI产品经理',
        desc: '12个案例分析 · 平均难度4.2',
        tags: ['需求分析', '用户研究'],
        hotness: '88%',
        icon: 'layers',
        iconColor: '#8b5cf6',
        bgColor: 'purple-bg'
      },
      {
        id: 3,
        title: '算法工程师',
        desc: '10个代码题 · 平均难度4.5',
        tags: ['机器学习', '数学推导'],
        hotness: '85%',
        icon: 'calculation-1',
        iconColor: '#10b981',
        bgColor: 'green-bg'
      },
      {
        id: 4,
        title: '投资分析师',
        desc: '8个估值模型 · 平均难度4.3',
        tags: ['行业研究', '财务分析'],
        hotness: '82%',
        icon: 'chart-bar',
        iconColor: '#f59e0b',
        bgColor: 'yellow-bg' // 你需要在wxss中添加这个背景色类
      },
      {
        id: 5,
        title: '管理培训生',
        desc: '10个领导力题 · 平均难度3.9',
        tags: ['轮岗', '案例分析'],
        hotness: '80%',
        icon: 'usergroup',
        iconColor: '#ef4444',
        bgColor: 'red-bg' // 你需要在wxss中添加这个背景色类
      },
      {
        id: 6,
        title: '新媒体运营',
        desc: '12个创意策划 · 平均难度3.5',
        tags: ['内容为王', '用户增长'],
        hotness: '86%',
        icon: 'image',
        iconColor: '#3b82f6',
        bgColor: 'blue-bg'
      },
      {
        id: 7,
        title: 'K12学科教师',
        desc: '15个教学试讲 · 平均难度3.7',
        tags: ['说课', '课堂管理'],
        hotness: '78%',
        icon: 'education',
        iconColor: '#10b981',
        bgColor: 'green-bg'
      },
      {
        id: 8,
        title: '研发科学家',
        desc: '9个实验设计 · 平均难度4.6',
        tags: ['生物', '文献解读'],
        hotness: '81%',
        icon: 'component-space',
        iconColor: '#8b5cf6',
        bgColor: 'purple-bg'
      },
      {
        id: 9,
        title: '临床监查员',
        desc: '11个GCP问题 · 平均难度4.1',
        tags: ['医学', '法规'],
        hotness: '79%',
        icon: 'file-lock',
        iconColor: '#ef4444',
        bgColor: 'red-bg'
      },
      {
        id: 10,
        title: '医疗器械注册',
        desc: '13个法规问题 · 平均难度4.0',
        tags: ['合规', '申报资料'],
        hotness: '77%',
        icon: 'file-attach',
        iconColor: '#f59e0b',
        bgColor: 'yellow-bg'
      },
    ]
  },

  onLoad() {
    console.log('home2页面加载完成');
  },

  onReady() {
    console.log('home2页面渲染完成');
  },

  // 跳转到面试设置页
  navigateToInterviewSetting(e) {
    const id = e.currentTarget.dataset.id;
    console.log('选择了面试, ID:', id);
    wx.navigateTo({ url: `/pages/interviewSetting/index?id=${id}` });
  },

  // 其他功能按钮点击事件
  onFeatureClick(e) {
    const buttonName = e.currentTarget.dataset.name;
    console.log('点击了按钮:', buttonName);
    
    // 对于旧的 "AI模拟面试" 按钮，我们让它默认进入第一个面试场景
    if (buttonName === "AI模拟面试") {
      wx.navigateTo({ url: `/pages/interviewSetting/index?id=0` });
      return;
    }

    wx.showToast({
      title: `点击了${buttonName}`,
      icon: 'none',
      duration: 1000
    });

    if (buttonName === "刷题训练" || buttonName === "简历优化") {
      wx.switchTab({ url: '/pages/practice/index' });
    }
    if (buttonName === "面试报告") {
      wx.navigateTo({ url: `/pages/feedback/index?id=1` });
    }
  },

  onSearchInput(e) {
    const value = e.detail.value;
    console.log('搜索内容:', value);
  },

  onSearchConfirm(e) {
    const value = e.detail.value;
    console.log('确认搜索:', value);
    wx.showToast({
      title: `搜索: ${value}`,
      icon: 'none'
    });
  }
});