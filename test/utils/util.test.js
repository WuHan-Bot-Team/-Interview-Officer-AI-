// 测试工具函数
require('../__mocks__/wx.js');

// 模拟 utils/util.js 的函数
const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const getLocalUrl = (path, name) => {
  const fs = wx.getFileSystemManager();
  const tempFileName = `${wx.env.USER_DATA_PATH}/${name}`;
  fs.copyFileSync(path, tempFileName);
  return tempFileName;
};

describe('工具函数测试', () => {
  describe('formatTime', () => {
    test('应该正确格式化日期时间', () => {
      const testDate = new Date('2023-12-25 15:30:45');
      const result = formatTime(testDate);
      expect(result).toBe('2023/12/25 15:30:45');
    });

    test('应该正确补零', () => {
      const testDate = new Date('2023-01-05 09:08:07');
      const result = formatTime(testDate);
      expect(result).toBe('2023/01/05 09:08:07');
    });
  });

  describe('formatNumber', () => {
    test('个位数应该补零', () => {
      expect(formatNumber(5)).toBe('05');
      expect(formatNumber(0)).toBe('00');
    });

    test('两位数不应该补零', () => {
      expect(formatNumber(15)).toBe('15');
      expect(formatNumber(99)).toBe('99');
    });
  });

  describe('getLocalUrl', () => {
    test('应该调用文件系统API复制文件', () => {
      const mockFs = {
        copyFileSync: jest.fn()
      };
      wx.getFileSystemManager.mockReturnValue(mockFs);

      const result = getLocalUrl('/static/test.png', 'test.png');
      
      expect(wx.getFileSystemManager).toHaveBeenCalled();
      expect(mockFs.copyFileSync).toHaveBeenCalledWith('/static/test.png', '/mock/user/data/path/test.png');
      expect(result).toBe('/mock/user/data/path/test.png');
    });
  });
});
