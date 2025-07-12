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
    const preinput = {1:{"major":"软件工程","intention":"前端工程师","description":"岗位职责：\n1. 负责Web前端开发，使用HTML/CSS/JavaScript构建高性能、可复用的用户界面\n2. 配合UI/UX设计师实现交互效果，优化用户体验\n3. 使用Vue/React等框架开发单页应用（SPA），并确保代码可维护性\n4. 与后端工程师协作，完成API对接及数据交互\n5. 优化前端性能，解决浏览器兼容性问题\n\n任职要求：\n1. 本科及以上学历，计算机相关专业优先\n2. 熟练掌握HTML5/CSS3/JavaScript（ES6+）\n3. 熟悉Vue/React框架及生态（如Vuex/Redux、Vue Router/React Router）\n4. 了解Webpack/Vite等构建工具，掌握Git版本控制\n5. 良好的代码规范、沟通能力和团队协作精神"},
    2:{"major":"市场营销","intention":"AI产品经理","description":"岗位职责：\n1. 负责AI相关产品的规划、设计和全生命周期管理\n2. 深入理解AI技术能力边界，将技术能力转化为产品解决方案\n3. 分析行业趋势和用户需求，制定产品路线图和迭代计划\n4. 协调算法、工程、设计等团队，推动产品研发和落地\n5. 设计产品指标体系，监控产品效果并持续优化\n6. 负责产品文档撰写，包括PRD、用户手册等\n\n任职要求：\n1. 有AI/大数据产品经验者优先\n2. 具备优秀的需求分析、产品设计和项目管理能力\n3. 熟练使用Axure、XMind等产品设计工具\n4. 良好的沟通协调能力和跨团队协作能力\n5. 对AI行业发展趋势有敏锐洞察力"},
    3:{"major":"计算机科学与技术","intention":"算法工程师","description":"岗位职责：\n1. 负责金融风控、量化交易、信用评估等场景的算法研发与优化\n2. 构建金融数据特征工程，开发高精度预测模型\n3. 研究并应用时间序列分析、图神经网络等算法解决金融问题\n4. 优化算法性能，满足金融场景对实时性和稳定性的高要求\n5. 与业务部门协作，推动算法在金融产品中的落地应用\n\n任职要求：\n1. 3年以上金融领域算法开发经验，熟悉金融业务逻辑\n2. 精通机器学习/深度学习算法，熟悉XGBoost/LightGBM等金融常用模型\n3. 熟练使用Python/SQL，有大规模金融数据处理经验\n4. 熟悉金融风控体系或量化交易策略者优先"}
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