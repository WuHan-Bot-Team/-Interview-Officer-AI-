const app = getApp();

Component({
  data: {
    value: 'home2', // 设置默认值为首页
    list: [
      {
        icon: 'home',
        value: 'home2',
        label: '首页',
      },
      {
        icon: 'dashboard',
        value: 'practice',
        label: '练习',
      },
      {
        icon: 'user',
        value: 'my',
        label: '我的',
      },
    ],
  },
  lifetimes: {
    ready() {
      const pages = getCurrentPages();
      const curPage = pages[pages.length - 1];
      if (curPage) {
        // 根据当前页面路径设置选中状态
        if (curPage.route.includes('home2')) {
          this.setData({ value: 'home2' });
        } else if (curPage.route.includes('practice')) {
          this.setData({ value: 'practice' });
        } else if (curPage.route.includes('my')) {
          this.setData({ value: 'my' });
        }
      }
    },
  },
  methods: {
    handleChange(e) {
      const { value } = e.detail;
      console.log('切换到:', value);
      
      // 更新选中状态
      this.setData({ value });
      
      // 根据不同的页面进行跳转
      let url = '';
      switch (value) {
        case 'home2':
          url = '/pages/home2/index';
          break;
        case 'practice':
          url = '/pages/practice/index';
          break;
        case 'my':
          url = '/pages/my/index';
          break;
      }
      
      if (url) {
        wx.switchTab({ url: url });
      }
    },
  },
});
