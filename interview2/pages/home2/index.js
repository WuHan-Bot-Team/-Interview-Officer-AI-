Page({
  data: {
    // 页面数据
  },

  // 生命周期
  onLoad() {
    console.log('home2页面加载完成');
  },

  onReady() {
    console.log('home2页面渲染完成');
  },

  // 功能按钮点击事件
  onFeatureClick(e) {
    const buttonName = e.currentTarget.dataset.name;
    console.log('点击了按钮:', buttonName);
    // 显示点击反馈
    wx.showToast({
      title: `点击了${buttonName}`,
      icon: 'none',
      duration: 1000
    });
    if(buttonName=="刷题训练" || buttonName=="简历优化"){
      wx.switchTab({url: '/pages/practice/index',});
    }
    if(buttonName=="面试报告"){
      wx.navigateTo({url: `/pages/feedback/index?id=1`})
    }
    if(buttonName=="AI模拟面试" || buttonName=="前端工程师"||buttonName=="产品经理"||buttonName=="算法工程师"){
      console.log("here");
      const dict={"AI模拟面试":0, "前端工程师":1, "产品经理":2, "算法工程师":3}
      let id = dict[buttonName]
      console.log(id);
      wx.navigateTo({url: `/pages/interviewSetting/index?id=${id}`})
    }
  },

  // 搜索框输入事件
  onSearchInput(e) {
    const value = e.detail.value;
    console.log('搜索内容:', value);
  },

  // 搜索框确认事件
  onSearchConfirm(e) {
    const value = e.detail.value;
    console.log('确认搜索:', value);
    
    // 这里可以添加搜索逻辑
    wx.showToast({
      title: `搜索: ${value}`,
      icon: 'none'
    });
  }
}); 