const Mock = require('./WxMock');
// 导入包含path和data的对象
const loginMock = require('./login/index');
const homeMock = require('./home/index');
const searchMock = require('./search/index');
const dataCenter = require('./dataCenter/index');
const my = require('./my/index');

module.exports = () => {
  // 在这里添加新的mock数据
  const mockData = [...loginMock, ...homeMock, ...searchMock, ...dataCenter, ...my];
  mockData.forEach((item) => {
    Mock.mock(item.path, { code: 200, success: true, data: item.data });
  });
};
