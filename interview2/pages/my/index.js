import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';

Page({
  behaviors: [useToastBehavior],

  data: {
    settingList: [
      { name: '联系作者', icon: 'service', type: 'contact_author' },
      { name: '设置', icon: 'setting', type: 'setting', url: '/pages/setting/index' },
    ],
  },

  onLoad() {
    // 页面加载时的初始化
  },

  async onShow() {
    // 页面显示时的处理
  },

  // 刷题推荐功能
  onQuestionRecommend() {
    wx.navigateTo({
      url: '/pages/questionRecommend/index'
    });
  },

  // 学习推荐功能
  onLearningRecommend() {
    wx.navigateTo({
      url: '/pages/learningRecommend/index'
    });
  },

  // 项目包装功能
  onProjectPackaging() {
    wx.navigateTo({
      url: '/pages/projectPackaging/index'
    });
  },

  // Offer对比功能
  onOfferCompare() {
    wx.navigateTo({
      url: '/pages/offerCompare/index'
    });
  },

  // 工作适配度测评功能
  onJobCompatibility() {
    wx.navigateTo({
      url: '/pages/jobCompatibility/index'
    });
  },

  // 处理设置列表点击事件
  onEleClick(e) {
    const { type } = e.currentTarget.dataset.data;
    
    if (type === 'contact_author') {
      // 联系作者
      wx.showModal({
        title: '联系作者',
        content: '作者邮箱：\n2320242004@qq.com\n2024302111357@whu.edu.cn\n\n如有问题或建议，欢迎发邮件联系！',
        showCancel: true,
        cancelText: '关闭',
        confirmText: '复制邮箱',
        confirmColor: '#0052d9',
        success: (res) => {
          if (res.confirm) {
            // 显示选择邮箱的弹窗
            wx.showActionSheet({
              itemList: ['复制QQ邮箱: 2320242004@qq.com', '复制武大邮箱: 2024302111357@whu.edu.cn'],
              success: (actionRes) => {
                let emailToCopy = '';
                if (actionRes.tapIndex === 0) {
                  emailToCopy = '2320242004@qq.com';
                } else if (actionRes.tapIndex === 1) {
                  emailToCopy = '2024302111357@whu.edu.cn';
                }
                
                if (emailToCopy) {
                  wx.setClipboardData({
                    data: emailToCopy,
                    success: () => {
                      wx.showToast({
                        title: '邮箱已复制到剪贴板',
                        icon: 'success',
                        duration: 2000
                      });
                    },
                    fail: (err) => {
                      console.error('复制邮箱失败:', err);
                      wx.showToast({
                        title: '复制失败',
                        icon: 'none'
                      });
                    }
                  });
                }
              }
            });
          }
        }
      });
    } else {
      // 其他设置项的处理
      this.onShowToast('#t-toast', `点击了${e.currentTarget.dataset.data.name}`);
    }
  },
});
