// const { RenderSystem } = require("XrFrame/systems");
const app = getApp(); 
// pages/practice/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'practice', // 当前激活的标签页
    messages: [], // 当前标签页的消息列表
    inputMessage: '我是一名[人工智能]专业的大学生，求职意向为[算法工程师], 请你协助我进行一次笔试刷题训练。', // 输入框内容
    scrollToView: '', // 滚动到指定消息
    messageId: 0, // 消息ID计数器
    resumeFile: null,
    // 历史聊天记录
    practiceHistory: [], // 刷题训练历史记录
    resumeHistory: [] // 简历优化历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('practice页面加载完成');
    
    // 初始化消息
    this.initMessages();
    
    // 添加一些测试数据（可选）
    // this.addTestData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('practice页面渲染完成');
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
    // 页面隐藏时保存当前历史记录
    this.saveCurrentHistory();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 页面卸载时保存当前历史记录
    this.saveCurrentHistory();
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

  // 初始化消息
  initMessages() {
    const welcomeMessage = {
      id: this.data.messageId,
      type: 'ai',
      content: this.getWelcomeMessage(),
      showHint: false
    };
    
    this.setData({
      messages: [welcomeMessage],
      scrollToView: `msg-${welcomeMessage.id}`,
      messageId: this.data.messageId + 1
    });
  },

  // 获取欢迎消息
  getWelcomeMessage() {
    if (this.data.activeTab === 'practice') {
      return '我是你的面试训练AI助手，你可以：\n• 选择下方预设问题开始刷题\n• 上传简历获取分析建议\n• 直接输入你的问题';
    } else {
      return '我是你的简历优化AI助手，你可以：\n• 上传简历获取优化建议\n• 询问简历相关问题\n• 获取面试技巧指导';
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    // 保存当前标签页的历史记录
    this.saveCurrentHistory();    
    // 切换到新标签页
    this.setData({
      activeTab: tab,
      inputMessage: ''
    });
    if (this.data.activeTab === 'resume'){
      this.setData({
        inputMessage: '阅读这份简历，给出简历优化建议！'
      });
    }else{
      console.log(this.data.practiceHistory.length)
      if(this.data.practiceHistory.length<=1){
        this.setData({
          inputMessage: '我是一名[人工智能]专业的大学生，求职意向为[算法工程师], 请你协助我进行一次笔试刷题训练。'
        });
      }else{
        this.setData({
          inputMessage: ''
        });
      }
    }
    // 加载新标签页的历史记录
    this.loadHistory(tab);
    console.log('切换到标签页:', tab);
  },

  // 保存当前历史记录
  saveCurrentHistory() {
    const currentHistory = this.data.messages;
    if (this.data.activeTab === 'practice') {
      this.setData({
        practiceHistory: currentHistory
      });
    } else {
      this.setData({
        resumeHistory: currentHistory
      });
    }
  },

  // 加载历史记录
  loadHistory(tab) {
    let history = [];
    if (tab === 'practice') {
      history = this.data.practiceHistory;
    } else {
      history = this.data.resumeHistory;
    }
    
    // 如果有历史记录，使用历史记录；否则初始化欢迎消息
    if (history.length > 0) {
      this.setData({
        messages: history,
        scrollToView: `msg-${history[history.length - 1].id}`
      });
    } else {
      this.initMessages();
    }
  },

  // 总结评估
  historyEvaluate() {
    if(this.data.messages.length<=2){
      wx.showToast({ title: '请先刷题', icon: 'none' });
      return;
    }
    const prompt = '对这次刷题训练做一下评估！';
    this.addUserMessage(prompt);
    wx.request({
      url: `${app.globalData.url}practice/evaluate`,
      method: 'GET',
      data: { // 查询参数
        historyData: this.data.messages.slice(2).join(">;<")
      },
      success: (res) => {
          console.log(res)
          if(res.statusCode==200){
            this.simulateAIResponse(res.data.content);
          }
      }
    })
  },

  // 常见面试题
  commonQuestions() {
    console.log("bbb");
  },

  // 算法题练习
  algorithmPractice() {
    const prompt = '请提供一道算法题练习';
    this.addUserMessage(prompt);
    this.simulateAIResponse('【算法题练习】\n\n题目：两数之和\n给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。\n\n示例：\n输入：nums = [2,7,11,15], target = 9\n输出：[0,1]');
  },

  // 上传简历
  uploadResume() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx'],
      success: (res) => {        
        this.setData({
          resumeFile: res.tempFiles[0]
        });
        this.setData({
          inputMessage: "<"+this.data.resumeFile.name+">:" + this.data.inputMessage.replace(/^<[^>]+>:\s*/, ''),
        });
        console.log('选择的文件:', this.data.resumeFile);
        wx.showToast({
          title: '文件上传成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        wx.showToast({
          title: '选择文件失败',
          icon: 'error'
        });
      }
    });
  },

  // 添加附件
  addAttachment() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择', '选择文件'],
      success: (res) => {
        console.log('选择操作:', res.tapIndex);
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        });
      }
    });
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputMessage: e.detail.value
    });
  },

  // 发送消息
  sendMessage() {
    const message = this.data.inputMessage.trim();
    if (!message) return;    

    this.addUserMessage(message);
    this.setData({ inputMessage: '' });
    if (this.data.activeTab === 'practice') {
      console.log("a");
      const msg = message.replace(/^<[^>]+>:\s*/, '');
      console.log(msg)
      if(this.data.resumeFile!=null){
        console.log("aaa")
      }
      wx.request({
        url: `${app.globalData.url}practice/answer_v1`,
        method: 'GET',
        data: { // 查询参数
          prompt: msg
        },
        success: (res) => {
            console.log(res)
            if(res.statusCode==200){
              this.simulateAIResponse(res.data.content);
            }
        }
      })

    } else {
      if(this.data.resumeFile==null){
        wx.showToast({
          title: '请先上传简历附件',
          icon: 'none'
        });
        return;
      }else{
        this.simulateAIResponse("正在解析中，请稍等！");
        wx.uploadFile({
          url: `${app.globalData.url}practice/resume`,
          filePath: this.data.resumeFile.path,
          name: 'file',
          formData: { // 额外参数
            prompt: message,
          },
          success: (res) => {
            console.log(res)
            res = JSON.parse(res.data)
            console.log('上传响应:', res)
            this.delFile(this.data.resumeFile.path)
            this.simulateAIResponse(res.content);
          },
          fail: (err) => {
            console.error('请求失败:', err);
            this.delFile(this.data.resumeFile.path)
            wx.showToast({ title: '网络错误', icon: 'none' });
          }
        })
      }
    }

    // 模拟AI回复
    // this.simulateAIResponse(this.getAIResponse(message));
  },

  // 添加用户消息
  addUserMessage(content) {
    const newMessage = {
      id: this.data.messageId,
      type: 'user',
      content: content
    };
    
    const messages = [...this.data.messages, newMessage];
    this.setData({
      messages: messages,
      scrollToView: `msg-${newMessage.id}`,
      messageId: this.data.messageId + 1
    });
  },

  // 模拟AI回复
  simulateAIResponse(content) {
    setTimeout(() => {
      const newMessage = {
        id: this.data.messageId,
        type: 'ai',
        content: content,
        showHint: Math.random() > 0.5 // 随机显示提示按钮
      };
      
      const messages = [...this.data.messages, newMessage];
      this.setData({
        messages: messages,
        scrollToView: `msg-${newMessage.id}`,
        messageId: this.data.messageId + 1
      });
    }, 1);
  },

  // 获取AI回复内容
  getAIResponse(userMessage) {
    const responses = [
      '这是一个很好的问题！让我来详细解释一下...',
      '根据您的问题，我建议从以下几个方面来思考...',
      '这个问题涉及到几个重要的概念，我来为您分析...',
      '很好的提问！这确实是面试中的常见问题...',
      '让我为您提供一个详细的解答...'
    ];
    
    // 根据用户消息内容返回相应回复
    if (userMessage.includes('React') || userMessage.includes('react')) {
      return '关于React的问题，让我为您详细解答：\n\nReact是一个用于构建用户界面的JavaScript库，它的核心特性包括：\n• 组件化开发\n• 虚拟DOM\n• 单向数据流\n• JSX语法';
    } else if (userMessage.includes('Vue') || userMessage.includes('vue')) {
      return '关于Vue的问题：\n\nVue是一个渐进式JavaScript框架，主要特点：\n• 响应式数据绑定\n• 组件化开发\n• 指令系统\n• 生态系统丰富';
    } else if (userMessage.includes('算法') || userMessage.includes('数据结构')) {
      return '关于算法和数据结构：\n\n这是编程面试中的重要部分，建议重点掌握：\n• 数组、链表、栈、队列\n• 树、图、哈希表\n• 排序算法\n• 搜索算法';
    } else {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  },

  // 显示提示
  showHint(e) {
    const messageId = e.currentTarget.dataset.id;
    console.log('显示提示，消息ID:', messageId);
    
    wx.showToast({
      title: '提示功能开发中',
      icon: 'none'
    });
  },

  // 添加测试数据（用于测试历史记录功能）
  addTestData() {
    // 模拟一些历史对话
    setTimeout(() => {
      this.addUserMessage('你好，我想练习前端面试');
      this.simulateAIResponse('你好！很高兴为你提供前端面试训练。我们可以从基础概念开始，比如HTML、CSS、JavaScript等。你想从哪个方面开始呢？');
    }, 1000);
  },

  delFile(path){
    wx.getFileSystemManager().saveFile({
      tempFilePath: path,
      success(res) {
        console.log();(res.savedFilePath)
        wx.getFileSystemManager().removeSavedFile({
          filePath: res.savedFilePath,
          fail(err) {
            console.log("删除文件出错：", res, err);
          },
        });
      },
      fail(err) {
        console.log("保存文件出错：", err);
      },
    });
  },
})