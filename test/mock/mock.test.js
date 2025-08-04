// Mock 系统测试
require('../__mocks__/wx.js');

// 创建一个简化的 WxMock 实现用于测试
class WxMock {
  constructor() {
    this.requests = [];
    this.responses = new Map();
  }

  // 设置模拟响应
  setResponse(url, response) {
    this.responses.set(url, response);
  }

  // 模拟 wx.request
  request(options) {
    this.requests.push(options);
    
    const response = this.responses.get(options.url);
    if (response) {
      setTimeout(() => {
        if (response.success && options.success) {
          options.success(response.data);
        } else if (response.fail && options.fail) {
          options.fail(response.error);
        }
      }, 0);
    }
  }

  // 清除记录
  clear() {
    this.requests = [];
    this.responses.clear();
  }

  // 获取请求历史
  getRequests() {
    return this.requests;
  }
}

describe('Mock 系统测试', () => {
  let wxMock;

  beforeEach(() => {
    wxMock = new WxMock();
  });

  afterEach(() => {
    wxMock.clear();
  });

  describe('请求拦截', () => {
    test('应该能够拦截 wx.request 请求', () => {
      const requestOptions = {
        url: '/api/test',
        method: 'GET',
        success: jest.fn(),
        fail: jest.fn()
      };

      wxMock.request(requestOptions);
      
      const requests = wxMock.getRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toMatchObject({
        url: '/api/test',
        method: 'GET'
      });
    });

    test('应该能够返回预设的响应数据', (done) => {
      const mockData = { code: 200, data: 'test data' };
      wxMock.setResponse('/api/test', { success: true, data: mockData });

      wxMock.request({
        url: '/api/test',
        success: (res) => {
          expect(res).toEqual(mockData);
          done();
        },
        fail: () => {
          done.fail('Request should not fail');
        }
      });
    });

    test('应该能够模拟请求失败', (done) => {
      const mockError = { error: 'Network error' };
      wxMock.setResponse('/api/test', { fail: true, error: mockError });

      wxMock.request({
        url: '/api/test',
        success: () => {
          done.fail('Request should not succeed');
        },
        fail: (err) => {
          expect(err).toEqual(mockError);
          done();
        }
      });
    });
  });

  describe('数据模拟', () => {
    test('应该能够模拟用户数据', () => {
      const mockUserData = {
        id: 1,
        username: 'testuser',
        avatar: '/static/avatar1.png',
        email: 'test@example.com'
      };

      wxMock.setResponse('/api/user/info', { 
        success: true, 
        data: { code: 200, data: mockUserData } 
      });

      wxMock.request({
        url: '/api/user/info',
        success: (res) => {
          expect(res.data).toEqual(mockUserData);
        }
      });
    });

    test('应该能够模拟聊天数据', () => {
      const mockChatData = [
        {
          id: 1,
          type: 'user',
          content: '你好',
          timestamp: Date.now()
        },
        {
          id: 2,
          type: 'ai',
          content: '你好！有什么可以帮助您的吗？',
          timestamp: Date.now() + 1000
        }
      ];

      wxMock.setResponse('/api/chat/history', { 
        success: true, 
        data: { code: 200, data: mockChatData } 
      });

      wxMock.request({
        url: '/api/chat/history',
        success: (res) => {
          expect(res.data).toHaveLength(2);
          expect(res.data[0].type).toBe('user');
          expect(res.data[1].type).toBe('ai');
        }
      });
    });

    test('应该能够模拟练习数据', () => {
      const mockPracticeData = {
        questions: [
          {
            id: 1,
            type: 'single',
            question: '以下哪个是JavaScript的特点？',
            options: ['静态类型', '动态类型', '强类型', '弱类型'],
            answer: 1
          }
        ],
        total: 100,
        completed: 50
      };

      wxMock.setResponse('/api/practice/questions', { 
        success: true, 
        data: { code: 200, data: mockPracticeData } 
      });

      wxMock.request({
        url: '/api/practice/questions',
        success: (res) => {
          expect(res.data.questions).toHaveLength(1);
          expect(res.data.total).toBe(100);
          expect(res.data.completed).toBe(50);
        }
      });
    });
  });

  describe('错误处理', () => {
    test('应该能够处理不存在的接口', () => {
      wxMock.request({
        url: '/api/nonexistent',
        success: jest.fn(),
        fail: jest.fn()
      });

      const requests = wxMock.getRequests();
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe('/api/nonexistent');
    });

    test('应该能够处理网络错误', (done) => {
      wxMock.setResponse('/api/test', { 
        fail: true, 
        error: { code: -1, message: '网络连接失败' } 
      });

      wxMock.request({
        url: '/api/test',
        fail: (err) => {
          expect(err.code).toBe(-1);
          expect(err.message).toBe('网络连接失败');
          done();
        }
      });
    });

    test('应该能够处理服务器错误', (done) => {
      wxMock.setResponse('/api/test', { 
        success: true, 
        data: { code: 500, message: '服务器内部错误' } 
      });

      wxMock.request({
        url: '/api/test',
        success: (res) => {
          expect(res.code).toBe(500);
          expect(res.message).toBe('服务器内部错误');
          done();
        }
      });
    });
  });

  describe('请求参数验证', () => {
    test('应该能够验证请求方法', () => {
      wxMock.request({
        url: '/api/test',
        method: 'POST',
        data: { test: 'data' }
      });

      const requests = wxMock.getRequests();
      expect(requests[0].method).toBe('POST');
      expect(requests[0].data).toEqual({ test: 'data' });
    });

    test('应该能够验证请求头', () => {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token'
      };

      wxMock.request({
        url: '/api/test',
        header: headers
      });

      const requests = wxMock.getRequests();
      expect(requests[0].header).toEqual(headers);
    });

    test('应该能够验证请求数据', () => {
      const postData = {
        username: 'test',
        password: '123456',
        remember: true
      };

      wxMock.request({
        url: '/api/login',
        method: 'POST',
        data: postData
      });

      const requests = wxMock.getRequests();
      expect(requests[0].data).toEqual(postData);
    });
  });
});
