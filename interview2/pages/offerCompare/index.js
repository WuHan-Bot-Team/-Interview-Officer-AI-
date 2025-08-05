import useToastBehavior from '~/behaviors/useToast';
import request from '~/api/request';

Page({
  behaviors: [useToastBehavior],

  data: {
    offerA: '',
    offerB: '',
    priority: '',
    compareResult: '',
    loading: false
  },

  onLoad() {
    console.log('Offer对比页面加载');
  },

  // Offer A 输入
  onOfferAInput(e) {
    this.setData({
      offerA: e.detail.value
    });
  },

  // Offer B 输入
  onOfferBInput(e) {
    this.setData({
      offerB: e.detail.value
    });
  },

  // 个人优先级输入
  onPriorityInput(e) {
    this.setData({
      priority: e.detail.value
    });
  },

  // 开始AI对比分析
  async onStartCompare() {
    if (!this.data.offerA.trim() || !this.data.offerB.trim()) {
      wx.showToast({
        title: '请输入两个Offer的详细信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const response = await request('/practice/offer_compare', 'POST', {
        offer_a: this.data.offerA,
        offer_b: this.data.offerB,
        priority: this.data.priority
      });

      if (response.success) {
        this.setData({
          compareResult: response.content,
          loading: false
        });

        wx.showToast({
          title: 'AI分析完成',
          icon: 'success'
        });

        // 滚动到结果区域
        wx.pageScrollTo({
          selector: '.result-section',
          duration: 500
        });
      } else {
        throw new Error(response.error || 'AI分析失败');
      }
    } catch (error) {
      console.error('Offer对比失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      });
    }
  },

  // 复制结果
  onCopyResult() {
    wx.setClipboardData({
      data: this.data.compareResult,
      success: () => {
        wx.showToast({
          title: '分析结果已复制',
          icon: 'success'
        });
      }
    });
  },

  // 重新分析
  onRegenerateResult() {
    this.onStartCompare();
  }
});
