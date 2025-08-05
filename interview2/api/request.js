const config = require('../config');

const { baseUrl } = config;
const delay = config.isMock ? 500 : 0;

// 获取全局应用实例
const app = getApp();

function request(url, method = 'GET', data = {}) {
  const header = {
    'content-type': 'application/json',
    // 有其他content-type需求加点逻辑判断处理即可
  };
  // 获取token，有就丢进请求头
  const tokenString = wx.getStorageSync('access_token');
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
  }
  
  // 使用 globalData.url 作为 baseUrl，如果没有设置则使用 config 中的 baseUrl
  const requestBaseUrl = app.globalData.url || baseUrl;
  
  // 正确处理URL拼接，避免双斜杠
  let fullUrl;
  if (requestBaseUrl.endsWith('/') && url.startsWith('/')) {
    fullUrl = requestBaseUrl + url.substring(1);
  } else if (!requestBaseUrl.endsWith('/') && !url.startsWith('/')) {
    fullUrl = requestBaseUrl + '/' + url;
  } else {
    fullUrl = requestBaseUrl + url;
  }
  
  console.log('🚀 开始请求:', {
    fullUrl,
    method,
    data,
    header
  });
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      data,
      timeout: 120000, // 30秒超时
      dataType: 'json', // 微信官方文档中介绍会对数据进行一次JSON.parse
      header,
      success(res) {
        console.log('✅ 请求成功:', {
          statusCode: res.statusCode,
          data: res.data,
          fullResponse: res
        });
        
        setTimeout(() => {
          // HTTP状态码为200才视为成功
          if (res.statusCode === 200) {
            // 返回 data 部分，这是小程序解析后的JSON数据
            resolve(res.data);
          } else {
            console.log('❌ 状态码错误:', res.statusCode);
            // wx.request的特性，只要有响应就会走success回调，所以在这里判断状态，非200的均视为请求失败
            reject(res);
          }
        }, delay);
      },
      fail(err) {
        console.log('❌ 请求失败:', err);
        setTimeout(() => {
          // 断网、服务器挂了都会fail回调，直接reject即可
          reject(err);
        }, delay);
      },
    });
  });
}

// 导出请求和服务地址
export default request;
