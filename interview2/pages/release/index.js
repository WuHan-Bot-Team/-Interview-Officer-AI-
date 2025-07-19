// pages/release/index.js

Page({
  /**
   * 页面的初始数据
   */
  data: {
    originFiles: [
      {
        url: '/static/image1.png',
        name: 'uploaded1.png',
        type: 'image',
      },
      {
        url: '/static/image2.png',
        name: 'uploaded2.png',
        type: 'image',
      },
    ],
    gridConfig: {
      column: 4,
      width: 160,
      height: 160,
    },
    config: {
      count: 1,
    },
    tags: ['AI绘画', '版权素材', '原创', '风格灵动', '设计灵感', '创意分享'],
    selectedTags: [0], // 默认选中第一个标签
    description: '',
    charCount: 0,
    location: '',
    isSubmitting: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化页面
  },

  /**
   * 处理图片上传成功
   */
  handleSuccess(e) {
    const { files } = e.detail;
    this.setData({
      originFiles: files,
    });
    
    wx.showToast({
      title: '上传成功',
      icon: 'success',
      duration: 1500,
    });
  },

  /**
   * 处理图片删除
   */
  handleRemove(e) {
    const { index } = e.detail;
    const { originFiles } = this.data;
    originFiles.splice(index, 1);
    this.setData({
      originFiles,
    });
  },

  /**
   * 处理描述文本变化
   */
  onDescriptionChange(e) {
    const { value } = e.detail;
    const charCount = value.length;
    
    this.setData({
      description: value,
      charCount: charCount,
    });
  },

  /**
   * 处理标签选择变化
   */
  onTagChange(e) {
    const { checked } = e.detail;
    const index = e.currentTarget.dataset.index;
    const { selectedTags } = this.data;
    
    if (checked) {
      // 如果标签被选中，且不在已选列表中
      if (!selectedTags.includes(index)) {
        // 最多选择3个标签
        if (selectedTags.length < 3) {
          selectedTags.push(index);
        } else {
          wx.showToast({
            title: '最多选择3个标签',
            icon: 'none',
            duration: 1500,
          });
          return;
        }
      }
    } else {
      // 如果标签被取消，且在已选列表中
      const tagIndex = selectedTags.indexOf(index);
      if (tagIndex > -1) {
        selectedTags.splice(tagIndex, 1);
      }
    }
    
    this.setData({
      selectedTags,
    });
  },

  /**
   * 跳转到地图页面
   */
  gotoMap() {
    wx.showLoading({
      title: '获取位置中...',
    });
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.hideLoading();
        const { latitude, longitude } = res;
        
        // 模拟获取位置信息
        setTimeout(() => {
          this.setData({
            location: '北京市朝阳区三里屯SOHO',
          });
          
          wx.showToast({
            title: '位置已更新',
            icon: 'success',
            duration: 1500,
          });
        }, 500);
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '获取位置失败',
          icon: 'none',
          duration: 1500,
        });
      }
    });
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { originFiles, description, selectedTags } = this.data;
    
    if (originFiles.length === 0) {
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none',
        duration: 1500,
      });
      return false;
    }
    
    if (!description.trim()) {
      wx.showToast({
        title: '请添加描述内容',
        icon: 'none',
        duration: 1500,
      });
      return false;
    }
    
    if (selectedTags.length === 0) {
      wx.showToast({
        title: '请至少选择一个标签',
        icon: 'none',
        duration: 1500,
      });
      return false;
    }
    
    return true;
  },

  /**
   * 保存草稿
   */
  saveDraft() {
    if (this.data.isSubmitting) return;
    
    this.setData({
      isSubmitting: true,
    });
    
    if (!this.validateForm()) {
      this.setData({
        isSubmitting: false,
      });
      return;
    }
    
    wx.showLoading({
      title: '保存中...',
      mask: true,
    });
    
    // 模拟保存操作
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '草稿已保存',
        icon: 'success',
        duration: 1500,
      });
      
      this.setData({
        isSubmitting: false,
      });
      
      // 延迟跳转
      setTimeout(() => {
        wx.reLaunch({
          url: `/pages/home/index?oper=save`,
        });
      }, 1500);
    }, 1000);
  },

  /**
   * 发布动态
   */
  release() {
    if (this.data.isSubmitting) return;
    
    this.setData({
      isSubmitting: true,
    });
    
    if (!this.validateForm()) {
      this.setData({
        isSubmitting: false,
      });
      return;
    }
    
    wx.showLoading({
      title: '发布中...',
      mask: true,
    });
    
    // 模拟发布操作
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500,
      });
      
      this.setData({
        isSubmitting: false,
      });
      
      // 延迟跳转
      setTimeout(() => {
        wx.reLaunch({
          url: `/pages/home/index?oper=release`,
        });
      }, 1500);
    }, 1000);
  },
});
