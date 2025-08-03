// pages/interviewHome/index.js
// 引入插件
const plugin = requirePlugin('WechatSI');
// 获取全局唯一语音识别管理器
const manager = plugin.getRecordRecognitionManager();

// 获取全局应用实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    jobIntention: '',
    major: '',
    jobDescription: '',

    duration: 0, // 秒
    durationStr: '00:00',
    timer: null,
    micOn: true,
    messageId: 0, //当前消息计数器
    scrollToView: '', // 滚动到指定消息
    messageId: 0, // 消息ID计数器
    cameraContext: null, //摄像头上下文
    timeTask: null, //
    voiceContent: '',
    avatarStreamUrl: "", // 数字人RTMP流地址
    // http://127.0.0.1:5000/interview/video/playlist.m3u8

    deepseekInitMessage: '',
  },
  onVideoTap() {
    console.log("Video clicked, refreshing src...");
    this.setData({
      avatarStreamUrl: `${app.globalData.url}interview/video/playlist.m3u8`
    });
  },
  videoErrorCallback(e){
    console.error("视频播放错误:", e);
    
    // 尝试重新加载
    this.setData({
      avatarStreamUrl: ""
    });
    
    setTimeout(() => {
      console.log("重新尝试加载数字人视频...");
      this.setData({
        avatarStreamUrl: `${app.globalData.url}interview/video/playlist.m3u8`
      });
    }, 2000); // 增加延迟到2秒
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.clearTimer()
    console.log("面试室加载完成");
    this.initSI() // 初始化录音器
    // 读取面试设置信息
    const settings = wx.getStorageSync('interviewSettings') || {};
    this.setData({
      jobIntention: settings.jobIntention || 'AI',
      major: settings.major || 'AI',
      jobDescription: settings.jobDescription || 'AI',
      cameraContext: wx.createCameraContext(this)
    });
    // 启动时长计时器
    this.startTimer();  // 面试计时
    this.initMessages();  
    console.log("c");
    // 初始化数字人和deepseek驱动
    this.initAvatar();
    // 启动摄像头定时任务
    this.startCapture();
  },

  initMessages() {
    const welcomeMessage = {
      id: this.data.messageId,
      type: 'ai',
      content: "欢迎来到面试室",
      showHint: false
    };
    this.setData({
      messages: [welcomeMessage],
      scrollToView: `msg-${welcomeMessage.id}`,
      messageId: this.data.messageId + 1
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  startCapture() {
    this.data.timeTask = setInterval(() => {
      if (this.data.cameraContext) {
        this.data.cameraContext.takePhoto({
          quality: 'medium',
          success: (res) => {
            const tempFilePath = res.tempImagePath;
            console.log(tempFilePath);
            wx.uploadFile({
              url: `${app.globalData.url}interview/image_detect`,
              filePath: tempFilePath,
              name: 'file',
              formData: {
                timestamp: new Date().getTime()
              },
              success: (res) => {
                console.log(tempFilePath);
                this.delFile(tempFilePath)
                // wx.getFileSystemManager().unlink({filePath: tempFilePath})
                console.log(res)
                console.log('上传响应:', res)
              },
            })
          },
          fail: (err) => {
            console.error('拍照失败:', err);
            this.delFile(tempFilePath)
            // wx.getFileSystemManager().unlink({filePath: tempFilePath})
          }
        });
      }
    }, 5000); // 5秒钟间隔,5秒拍一次
  },


  delFile(path) {
    wx.getFileSystemManager().saveFile({
      tempFilePath: path,
      success(res) {
        console.log();
        (res.savedFilePath)
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

  initDeepseek() {
    console.log("正在使用的URL:", `${app.globalData.url}interview/init`);
    wx.request({
      url: `${app.globalData.url}interview/init`, // 替换为你的Flask接口地址
      method: 'POST',
      data: {
        major: this.data.major,
        intention: this.data.jobIntention,
        job_description: this.data.jobDescription,
      },
      header: {
        'Content-Type': 'application/json' // 必须声明JSON格式
      },
      success: (res) => {
        console.log('请求成功', res.data);
        if (res.statusCode == 200) {
          this.addMessage(res.data.content, "ai")
          // this.setDeepseekInitMessage(res.data.content)
        }
      },
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 恢复计时
    if (!this.data.timer) {
      this.startTimer();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.clearTimer();
    wx.request({
      url: `${app.globalData.url}interview/del_wss`,
      method: 'GET',
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.clearTimer();
    wx.request({
      url: `${app.globalData.url}interview/del_wss`,
      method: 'GET',
    })
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

  startTimer() {
    if (this.data.timer) return;
    this.setData({
      timer: setInterval(() => {
        this.setData({
          duration: this.data.duration + 1,
          durationStr: this.formatDuration(this.data.duration + 1)
        });
      }, 1000)
    });
  },
  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({
        timer: null
      });
    }
    if (this.data.timeTask) {
      clearInterval(this.data.timeTask);
      this.setData({
        timeTask: null
      });
    }
  },
  formatDuration(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  },

  // 摄像头错误处理
  onCameraError(e) {
    wx.showToast({
      title: '摄像头打开失败',
      icon: 'none'
    });
  },

  // 麦克风按钮切换
  toggleMic() {
    this.setData({
      micOn: !this.data.micOn
    });
    wx.showToast({
      title: this.data.micOn ? '麦克风已开启' : '麦克风已关闭',
      icon: 'none'
    });
  },

  // 按住说话
  startRecord() {
    wx.showToast({
      title: '开始说话...',
      icon: 'none'
    });
    manager.start({
      duration: 30000,
      lang: 'zh_CN'
    });
    // TODO: 录音逻辑
  },
  stopRecord() {
    wx.showToast({
      title: '录音结束',
      icon: 'none'
    });
    // TODO: 录音结束逻辑
    manager.stop();
  },

  // 返回按钮
  handleBack() {
    wx.showModal({
      title: '提示',
      content: '确定要结束面试吗？',
      success(res) {
        if (res.confirm) {
          // 用户点击了确定
          wx.reLaunch({url: `/pages/feedback/index?id=0`})
        } 
      }
    })
  },

  //添加消息
  addMessage(content, role) {
    const newMessage = {
      id: this.data.messageId,
      type: role,
      content: content,
      showHint: false
    };

    const messages = [...this.data.messages, newMessage];
    this.setData({
      messages: messages,
      scrollToView: `msg-${newMessage.id}`,
      messageId: this.data.messageId + 1
    });
  },
  // 插件初始化
  initSI() {
    const that = this;
    // 有新的识别内容返回，则会调用此事件
    manager.onRecognize = function (res) {
      console.log(res);
    };
    manager.onStart = function (res) {
      console.log('成功开始录音识别', res);
      wx.vibrateShort({
        type: 'medium'
      });
    };
    manager.onError = function (res) {
      console.error('error msg', res);
      const tips = {
        '-30003': '说话时间间隔太短，无法识别语音',
        '-30004': '没有听清，请再说一次~',
        '-30011': '上个录音正在识别中，请稍后尝试',
      };
      const retcode = res?.retcode.toString();
      retcode &&
        wx.showToast({
          title: tips[`${retcode}`],
          icon: 'none',
          duration: 2000,
        });
    };

    manager.onStop = function (res) {
      console.log('..............结束录音', res);
      console.log('录音临时文件地址 -->', res.tempFilePath);
      console.log('录音总时长 -->', res.duration, 'ms');
      console.log('文件大小 --> ', res.fileSize, 'B');
      console.log('语音内容 --> ', res.result);

      if (res.result === '') {
        wx.showModal({
          title: '提示',
          content: '没有听清，请再说一次~',
          showCancel: false,
        });
        return;
      }
      that.addMessage(res.result, "user")
      that.setData({
        voiceContent: res.result,
      });
      let message = res.result
      that.delFile(res.tempFilePath)
      //在这里向后端发送请求
      wx.request({
        url: `${app.globalData.url}interview/answer`,
        method: 'GET',
        data: {
          message: message
        },
        success: (res) => {
            console.log("ai回复:", res.data)
            if(res.statusCode==200){
              this.addMessage(res.data.content, "ai")
            }
        }
      })
    };
  },

  // ==================== 数字人SDK相关代码 ====================
  initAvatar(){
    console.log("正在初始化数字人...");
    console.log("正在使用的URL:", `${app.globalData.url}interview/init_shuziren`);
    wx.showLoading({
      title: '数字人加载中...',
      mask: true
    });
    
    wx.request({
      url: `${app.globalData.url}interview/init_shuziren`,
      method: 'GET',
      timeout: 30000, // 30秒超时
      success: (res) => {
          console.log("数字人初始化响应:", res);
          wx.hideLoading();
          
          if (res.statusCode === 200) {
            console.log("数字人初始化成功");
            this.setData({
              avatarStreamUrl: `${app.globalData.url}interview/video/playlist.m3u8`
            });
            
            // 延迟一秒后初始化Deepseek，确保数字人已经准备好
            setTimeout(() => {
              this.initDeepseek();
            }, 1000);
          } else {
            console.error("数字人初始化失败:", res);
            wx.showToast({
              title: '数字人加载失败',
              icon: 'error',
              duration: 2000
            });
          }
      },
      fail: (err) => {
          console.error("数字人初始化请求失败:", err);
          wx.hideLoading();
          wx.showToast({
            title: '网络连接失败',
            icon: 'error',
            duration: 2000
          });
      }
    });
  },
})