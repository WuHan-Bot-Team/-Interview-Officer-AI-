import useToastBehavior from '~/behaviors/useToast';

Page({
  behaviors: [useToastBehavior],

  data: {
    resourceList: [
      {
        id: 1,
        title: 'LeetCode 算法练习',
        description: '海量算法题目，提升编程能力',
        tag: '算法 · 编程',
        icon: '💻',
        url: 'https://leetcode.cn/'
      },
      {
        id: 2,
        title: 'GitHub 开源项目',
        description: '优质开源项目，学习最佳实践',
        tag: '开源 · 项目',
        icon: '🔧',
        url: 'https://github.com/'
      },
      {
        id: 3,
        title: 'MDN Web 文档',
        description: 'Web 开发权威参考文档',
        tag: '前端 · 文档',
        icon: '📖',
        url: 'https://developer.mozilla.org/'
      },
      {
        id: 4,
        title: '菜鸟教程',
        description: '编程入门教程，简单易懂',
        tag: '教程 · 入门',
        icon: '🎓',
        url: 'https://www.runoob.com/'
      },
      {
        id: 5,
        title: 'Stack Overflow',
        description: '程序员问答社区，解决技术难题',
        tag: '问答 · 社区',
        icon: '❓',
        url: 'https://stackoverflow.com/'
      },
      {
        id: 6,
        title: 'Coursera 在线课程',
        description: '世界名校课程，提升专业技能',
        tag: '课程 · 学习',
        icon: '🎯',
        url: 'https://www.coursera.org/'
      },
      {
        id: 7,
        title: 'TED 演讲',
        description: '优质演讲视频，拓展视野思维',
        tag: '演讲 · 思维',
        icon: '🎤',
        url: 'https://www.ted.com/'
      },
      {
        id: 8,
        title: 'Medium 技术博客',
        description: '高质量技术文章和见解',
        tag: '博客 · 技术',
        icon: '✍️',
        url: 'https://medium.com/'
      }
    ]
  },

  onLoad() {
    console.log('学习推荐页面加载');
  },

  // 点击资源卡片
  onResourceClick(e) {
    const { url, title } = e.currentTarget.dataset;
    
    // 显示提示信息
    this.onShowToast('#t-toast', `即将跳转到: ${title}`);
    
    // 这里可以根据需要实现跳转逻辑
    // 由于小程序限制，无法直接跳转外部链接
    // 可以考虑以下方案：
    // 1. 复制链接到剪贴板
    // 2. 在 webview 中打开
    // 3. 显示二维码让用户扫描
    
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '链接已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      }
    });
  }
});
