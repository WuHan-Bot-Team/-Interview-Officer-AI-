// pages/test/index.js
const request = require('../../api/request');

Page({
  data: {
    result: '',
    loading: false
  },

  onLoad() {
    console.log('测试页面加载完成');
  },

  // 测试基本连接
  async testConnection() {
    console.log('测试基本连接...');
    this.setData({ loading: true, result: '正在测试基本连接...' });

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: 'http://192.168.87.228:5000/', // 测试根路径，使用局域网IP
          method: 'GET',
          timeout: 10000, // 10秒超时
          success: resolve,
          fail: reject
        });
      });

      console.log('基本连接响应:', response);
      this.setData({
        result: `连接成功!\n状态码: ${response.statusCode}\n响应: ${JSON.stringify(response.data, null, 2)}`
      });

    } catch (error) {
      console.error('基本连接失败:', error);
      this.setData({
        result: `连接失败: ${error.errMsg || JSON.stringify(error, null, 2)}`
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async testAPI() {
    console.log('开始测试API连接...');
    this.setData({ loading: true, result: '正在测试...' });

    try {
      // 使用wx.request直接测试
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: 'http://192.168.87.228:5000/practice/recommend_questions',
          method: 'GET',
          timeout: 30000, // 30秒超时
          data: {
            major: '计算机科学',
            position: '前端工程师', 
            difficulty: '简单',
            type: '技术'
          },
          success: resolve,
          fail: reject
        });
      });

      console.log('API响应:', response);
      this.setData({
        result: JSON.stringify(response, null, 2)
      });

    } catch (error) {
      console.error('API请求失败:', error);
      this.setData({
        result: `错误: ${JSON.stringify(error, null, 2)}`
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async testAPIWithRequest() {
    console.log('使用request函数测试...');
    this.setData({ loading: true, result: '使用request函数测试...' });

    try {
      const queryString = 'major=计算机科学&position=前端工程师&difficulty=简单&type=技术';
      const response = await request(`/practice/recommend_questions?${queryString}`, 'GET');
      
      console.log('Request函数响应:', response);
      this.setData({
        result: JSON.stringify(response, null, 2)
      });

    } catch (error) {
      console.error('Request函数失败:', error);
      this.setData({
        result: `Request函数错误: ${JSON.stringify(error, null, 2)}`
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
