// pages/interviewSetting/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 表单数据
    major: '',
    jobIntention: '',
    jobDescription: '',
    
    // 设备状态
    microphoneStatus: 'default', // default, testing, granted, denied
    cameraStatus: 'default', // default, testing, granted, denied
    
    // 状态文本
    microphoneStatusText: '未检测',
    cameraStatusText: '未检测',
    
    // 是否可以进入面试室
    canEnter: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查设备权限状态
    this.checkDevicePermissions();
    let id = options.id
    console.log(id);
    const preinput = {
      1:{"major":"软件工程","intention":"前端工程师","description":"岗位职责：\n1. 负责Web前端开发，使用HTML/CSS/JavaScript构建高性能、可复用的用户界面\n2. 配合UI/UX设计师实现交互效果，优化用户体验\n3. 使用Vue/React等框架开发单页应用（SPA），并确保代码可维护性\n4. 与后端工程师协作，完成API对接及数据交互\n5. 优化前端性能，解决浏览器兼容性问题\n\n任职要求：\n1. 本科及以上学历，计算机相关专业优先\n2. 熟练掌握HTML5/CSS3/JavaScript（ES6+）\n3. 熟悉Vue/React框架及生态（如Vuex/Redux、Vue Router/React Router）\n4. 了解Webpack/Vite等构建工具，掌握Git版本控制\n5. 良好的代码规范、沟通能力和团队协作精神"},
      2:{"major":"市场营销","intention":"AI产品经理","description":"岗位职责：\n1. 负责AI相关产品的规划、设计和全生命周期管理\n2. 深入理解AI技术能力边界，将技术能力转化为产品解决方案\n3. 分析行业趋势和用户需求，制定产品路线图和迭代计划\n4. 协调算法、工程、设计等团队，推动产品研发和落地\n5. 设计产品指标体系，监控产品效果并持续优化\n6. 负责产品文档撰写，包括PRD、用户手册等\n\n任职要求：\n1. 有AI/大数据产品经验者优先\n2. 具备优秀的需求分析、产品设计和项目管理能力\n3. 熟练使用Axure、XMind等产品设计工具\n4. 良好的沟通协调能力和跨团队协作能力\n5. 对AI行业发展趋势有敏锐洞察力"},
      3:{"major":"计算机科学与技术","intention":"算法工程师","description":"岗位职责：\n1. 负责金融风控、量化交易、信用评估等场景的算法研发与优化\n2. 构建金融数据特征工程，开发高精度预测模型\n3. 研究并应用时间序列分析、图神经网络等算法解决金融问题\n4. 优化算法性能，满足金融场景对实时性和稳定性的高要求\n5. 与业务部门协作，推动算法在金融产品中的落地应用\n\n任职要求：\n1. 3年以上金融领域算法开发经验，熟悉金融业务逻辑\n2. 精通机器学习/深度学习算法，熟悉XGBoost/LightGBM等金融常用模型\n3. 熟练使用Python/SQL，有大规模金融数据处理经验\n4. 熟悉金融风控体系或量化交易策略者优先"},
      4:{"major":"金融学","intention":"投资分析师 (商)","description":"岗位职责：\n1. 对宏观经济、行业及公司进行深入研究，撰写研究报告\n2. 构建财务模型，对目标公司进行估值分析\n3. 跟踪市场动态，为投资决策提供支持\n4. 参与项目尽职调查，评估投资风险与回报\n\n任职要求：\n1. 金融、经济或相关专业背景，硕士及以上学历优先\n2. 具备扎实的财务知识和数据分析能力，熟悉估值模型\n3. 通过CFA、CPA等专业资格考试者优先\n4. 优秀的逻辑思维、沟通表达和抗压能力"},
      5:{"major":"工商管理","intention":"管理培训生 (商)","description":"岗位职责：\n1. 在公司各核心业务部门进行轮岗，熟悉公司运营模式\n2. 参与跨部门项目，分析并解决业务问题\n3. 培养领导力与综合管理能力，快速成长为中层管理人员\n4. 定期向导师和管理层汇报学习和工作成果\n\n任职要求：\n1. 专业不限，商科背景优先\n2. 具备卓越的领导力潜质、学习能力和解决问题的能力\n3. 优秀的沟通协调能力和团队合作精神\n4. 积极主动，对职业发展有清晰规划"},
      6:{"major":"新闻与传播","intention":"新媒体运营 (文)","description":"岗位职责：\n1. 负责公司官方社交媒体账号（如微信、微博、抖音）的内容策划、撰写与发布\n2. 策划并执行线上活动，提升用户活跃度和品牌影响力\n3. 监控运营数据，分析用户行为，优化内容策略\n4. 追踪行业热点，结合品牌进行创意营销\n\n任职要求：\n1. 对社交媒体有浓厚兴趣和深入理解，是重度用户\n2. 具备优秀的文案功底和创意策划能力\n3. 熟练使用图文、视频编辑工具\n4. 具备良好的数据分析能力和用户洞察力"},
      7:{"major":"教育学","intention":"K12学科教师 (文)","description":"岗位职责：\n1. 负责相应学科（如语文、数学、英语）的教学工作\n2. 根据教学大纲和学生情况，制定教学计划并备课\n3. 设计并实施互动式教学，激发学生学习兴趣\n4. 批改作业，进行课后辅导，与家长保持沟通\n\n任职要求：\n1. 持有相应学段和学科的教师资格证\n2. 热爱教育事业，有责任心和亲和力\n3. 具备扎实的学科知识和良好的授课技巧\n4. 优秀的沟通能力和课堂管理能力"},
      8:{"major":"生物技术","intention":"研发科学家 (理)","description":"岗位职责：\n1. 负责新药研发项目中的实验设计、执行和数据分析\n2. 开发和优化分子生物学、细胞生物学相关实验方法\n3. 查阅并解读最新科研文献，跟进技术前沿\n4. 撰写实验记录、SOP和研究报告\n\n任职要求：\n1. 生物学、药学等相关专业，硕士或博士学历\n2. 熟练掌握PCR、Western Blot、细胞培养等核心实验技能\n3. 具备独立思考和解决科研问题的能力\n4. 良好的英文读写能力和团队协作精神"},
      9:{"major":"临床医学","intention":"临床监查员 (医)","description":"岗位职责：\n1. 负责临床试验项目的监查工作，确保试验严格按照方案和GCP规定执行\n2. 筛选并启动研究中心，对研究者进行培训\n3. 定期访视研究中心，进行源数据核对（SDV）\n4. 管理试验文档，确保其准确、完整并实时更新\n\n任职要求：\n1. 医学、药学、护理学等相关专业背景\n2. 熟悉GCP及临床试验相关法规\n3. 工作严谨细致，有原则性，具备良好的沟通和项目管理能力\n4. 能适应频繁出差"},
      10:{"major":"生物医学工程","intention":"医疗器械注册专员 (医)","description":"岗位职责：\n1. 负责医疗器械产品的注册申报，撰写、整理和提交注册资料\n2. 与药监局（NMPA）等审评机构保持良好沟通，跟进审批进度\n3. 跟踪国内外医疗器械法规变化，确保公司产品合规\n4. 维护产品注册证，办理变更和延续注册\n\n任职要求：\n1. 生物医学工程、临床医学等相关专业\n2. 熟悉医疗器械注册流程和相关法规（如ISO13485）\n3. 具备出色的资料撰写和信息检索能力\n4. 工作细致，有条理，具备良好的项目协调能力"}
    }
    if (preinput[id]) {
      const item = preinput[id];
      console.log(item);
      // 赋值给对应的属性
      this.setData({
        major: item.major,
        jobIntention: item.intention,
        jobDescription: item.description
      });
    } 
    this.checkCanEnter()    
  },

  /**
   * 检查设备权限状态
   */
  checkDevicePermissions() {
    // 检查麦克风权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.record']) {
          this.setData({
            microphoneStatus: 'granted',
            microphoneStatusText: '已授权'
          });
          this.checkCanEnter()
        }
      }
    });

    // 检查摄像头权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera']) {
          this.setData({
            cameraStatus: 'granted',
            cameraStatusText: '已授权'
          });
          this.checkCanEnter()
        }
      }
    });
  },

  /**
   * 专业输入处理
   */
  onMajorInput(e) {
    this.setData({
      major: e.detail.value
    });
    this.checkCanEnter();
  },

  /**
   * 求职意向输入处理
   */
  onJobIntentionInput(e) {
    this.setData({
      jobIntention: e.detail.value
    });
    this.checkCanEnter();
  },

  /**
   * 岗位职责输入处理
   */
  onJobDescriptionInput(e) {
    this.setData({
      jobDescription: e.detail.value
    });
    this.checkCanEnter();
  },

  /**
   * 麦克风检测
   */
  onMicrophoneTest() {
    this.setData({
      microphoneStatus: 'testing',
      microphoneStatusText: '检测中...'
    });

    // 请求麦克风权限
    wx.authorize({
      scope: 'scope.record',
      success: () => {
        // 权限获取成功，进行麦克风测试
        this.testMicrophone();
      },
      fail: () => {
        this.setData({
          microphoneStatus: 'denied',
          microphoneStatusText: '权限被拒绝'
        });
        this.checkCanEnter();
        
        wx.showModal({
          title: '权限提示',
          content: '需要麦克风权限才能进行面试，请在设置中开启',
          showCancel: false
        });
      }
    });
  },

  /**
   * 麦克风测试
   */
  testMicrophone() {
    // 这里可以添加实际的麦克风测试逻辑
    // 例如播放测试音频或录制测试音频
    
    setTimeout(() => {
      this.setData({
        microphoneStatus: 'granted',
        microphoneStatusText: '检测正常'
      });
      this.checkCanEnter();
      
      wx.showToast({
        title: '麦克风检测成功',
        icon: 'success'
      });
    }, 2000);
  },

  /**
   * 摄像头检测
   */
  onCameraTest() {
    this.setData({
      cameraStatus: 'testing',
      cameraStatusText: '检测中...'
    });

    // 请求摄像头权限
    wx.authorize({
      scope: 'scope.camera',
      success: () => {
        // 权限获取成功，进行摄像头测试
        this.testCamera();
      },
      fail: () => {
        this.setData({
          cameraStatus: 'denied',
          cameraStatusText: '权限被拒绝'
        });
        this.checkCanEnter();
        
        wx.showModal({
          title: '权限提示',
          content: '需要摄像头权限才能进行面试，请在设置中开启',
          showCancel: false
        });
      }
    });
  },

  /**
   * 摄像头测试
   */
  testCamera() {
    // 这里可以添加实际的摄像头测试逻辑
    // 例如预览摄像头画面
    
    setTimeout(() => {
      this.setData({
        cameraStatus: 'granted',
        cameraStatusText: '检测正常'
      });
      this.checkCanEnter();
      
      wx.showToast({
        title: '摄像头检测成功',
        icon: 'success'
      });
    }, 2000);
  },

  /**
   * 检查是否可以进入面试室
   */
  checkCanEnter() {
    const { major, jobIntention, jobDescription, microphoneStatus, cameraStatus } = this.data;
    console.log("here");
    const canEnter = major.trim() && 
                    jobIntention.trim() && 
                    jobDescription.trim() && 
                    microphoneStatus === 'granted' && 
                    cameraStatus === 'granted';
    this.setData({
      canEnter
    });
  },

  /**
   * 确认进入面试室
   */
  onConfirmEnter() {
    if (!this.data.canEnter) {
      wx.showToast({
        title: '请完成所有设置',
        icon: 'none'
      });
      return;
    }

    // 保存用户信息到本地存储
    wx.setStorageSync('interviewSettings', {
      major: this.data.major,
      jobIntention: this.data.jobIntention,
      jobDescription: this.data.jobDescription,
      timestamp: Date.now()
    });

    // 显示加载提示
    wx.showLoading({
      title: '正在进入面试室...'
    });

    // 模拟进入面试室的延迟
    setTimeout(() => {
      wx.hideLoading();
      
      // 跳转到面试室页面
      wx.navigateTo({
        url: '/pages/interviewHome/index',
        success: () => {
          console.log('成功进入面试室');
        },
        fail: (err) => {
          console.error('进入面试室失败:', err);
          wx.showToast({
            title: '进入失败，请重试',
            icon: 'none'
          });
        }
      });
    }, 100);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  handleBack() {
    // e.stopPropagation();
    // e.preventDefault();
    console.log("a");
    const pages = getCurrentPages();
    // 如果页面栈长度小于等于1，表示没有上一页
    console.log(pages);
    if (pages.length <= 1) {
      wx.reLaunch({
        url: '/pages/home2/index' // 替换为你的首页路径
      });
    } else {
      wx.navigateBack();
    }
  },
})