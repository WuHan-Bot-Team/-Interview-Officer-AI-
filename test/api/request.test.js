// API 请求测试
require('../__mocks__/wx.js');

// 模拟请求模块
const request = {
  get(url, data = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'GET',
        data,
        success: resolve,
        fail: reject
      });
    });
  },
  
  post(url, data = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'POST',
        data,
        success: resolve,
        fail: reject
      });
    });
  },
  
  put(url, data = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'PUT',
        data,
        success: resolve,
        fail: reject
      });
    });
  },
  
  delete(url) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method: 'DELETE',
        success: resolve,
        fail: reject
      });
    });
  }
};

describe('API 请求测试', () => {
  beforeEach(() => {
    // 重置 wx.request mock
    wx.request = jest.fn();
  });

  describe('GET 请求', () => {
    test('应该能够发送 GET 请求', async () => {
      const mockResponse = { code: 200, data: 'success' };
      wx.request.mockImplementation((options) => {
        options.success(mockResponse);
      });

      const response = await request.get('/api/test');
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/test',
        method: 'GET',
        data: {},
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(response).toEqual(mockResponse);
    });

    test('应该能够发送带参数的 GET 请求', async () => {
      const params = { page: 1, size: 10 };
      wx.request.mockImplementation((options) => {
        options.success({ code: 200, data: [] });
      });

      await request.get('/api/list', params);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/list',
        method: 'GET',
        data: params,
        success: expect.any(Function),
        fail: expect.any(Function)
      });
    });

    test('应该能够处理 GET 请求失败', async () => {
      const mockError = { code: -1, message: '网络错误' };
      wx.request.mockImplementation((options) => {
        options.fail(mockError);
      });

      await expect(request.get('/api/test')).rejects.toEqual(mockError);
    });
  });

  describe('POST 请求', () => {
    test('应该能够发送 POST 请求', async () => {
      const postData = { username: 'test', password: '123456' };
      const mockResponse = { code: 200, message: '登录成功' };
      
      wx.request.mockImplementation((options) => {
        options.success(mockResponse);
      });

      const response = await request.post('/api/login', postData);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/login',
        method: 'POST',
        data: postData,
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(response).toEqual(mockResponse);
    });

    test('应该能够发送空数据的 POST 请求', async () => {
      wx.request.mockImplementation((options) => {
        options.success({ code: 200 });
      });

      await request.post('/api/logout');
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/logout',
        method: 'POST',
        data: {},
        success: expect.any(Function),
        fail: expect.any(Function)
      });
    });

    test('应该能够处理 POST 请求失败', async () => {
      const mockError = { code: 400, message: '参数错误' };
      wx.request.mockImplementation((options) => {
        options.fail(mockError);
      });

      await expect(request.post('/api/invalid')).rejects.toEqual(mockError);
    });
  });

  describe('PUT 请求', () => {
    test('应该能够发送 PUT 请求', async () => {
      const updateData = { id: 1, name: '更新后的名称' };
      const mockResponse = { code: 200, message: '更新成功' };
      
      wx.request.mockImplementation((options) => {
        options.success(mockResponse);
      });

      const response = await request.put('/api/update', updateData);
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/update',
        method: 'PUT',
        data: updateData,
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(response).toEqual(mockResponse);
    });

    test('应该能够处理 PUT 请求失败', async () => {
      const mockError = { code: 403, message: '权限不足' };
      wx.request.mockImplementation((options) => {
        options.fail(mockError);
      });

      await expect(request.put('/api/update', {})).rejects.toEqual(mockError);
    });
  });

  describe('DELETE 请求', () => {
    test('应该能够发送 DELETE 请求', async () => {
      const mockResponse = { code: 200, message: '删除成功' };
      
      wx.request.mockImplementation((options) => {
        options.success(mockResponse);
      });

      const response = await request.delete('/api/delete/1');
      
      expect(wx.request).toHaveBeenCalledWith({
        url: '/api/delete/1',
        method: 'DELETE',
        success: expect.any(Function),
        fail: expect.any(Function)
      });
      expect(response).toEqual(mockResponse);
    });

    test('应该能够处理 DELETE 请求失败', async () => {
      const mockError = { code: 404, message: '资源不存在' };
      wx.request.mockImplementation((options) => {
        options.fail(mockError);
      });

      await expect(request.delete('/api/delete/999')).rejects.toEqual(mockError);
    });
  });

  describe('请求拦截器', () => {
    test('应该能够添加请求头', async () => {
      const mockRequest = jest.fn((options) => {
        options.success({ code: 200 });
      });
      wx.request = mockRequest;

      // 模拟添加通用请求头的拦截器
      const requestWithHeaders = (url, method, data = {}) => {
        return new Promise((resolve, reject) => {
          wx.request({
            url,
            method,
            data,
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer token123'
            },
            success: resolve,
            fail: reject
          });
        });
      };

      await requestWithHeaders('/api/test', 'GET');
      
      expect(mockRequest).toHaveBeenCalledWith({
        url: '/api/test',
        method: 'GET',
        data: {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        },
        success: expect.any(Function),
        fail: expect.any(Function)
      });
    });

    test('应该能够处理响应数据', async () => {
      const mockResponse = {
        statusCode: 200,
        data: {
          code: 200,
          message: 'success',
          data: { id: 1, name: 'test' }
        }
      };
      
      wx.request.mockImplementation((options) => {
        options.success(mockResponse);
      });

      // 模拟响应拦截器
      const requestWithInterceptor = async (url) => {
        return new Promise((resolve, reject) => {
          wx.request({
            url,
            method: 'GET',
            success: (res) => {
              if (res.statusCode === 200 && res.data.code === 200) {
                resolve(res.data.data);
              } else {
                reject(new Error(res.data.message || '请求失败'));
              }
            },
            fail: reject
          });
        });
      };

      const result = await requestWithInterceptor('/api/test');
      expect(result).toEqual({ id: 1, name: 'test' });
    });
  });

  describe('错误处理', () => {
    test('应该能够处理网络错误', async () => {
      wx.request.mockImplementation((options) => {
        options.fail({ code: -1, message: '网络连接失败' });
      });

      await expect(request.get('/api/test')).rejects.toMatchObject({
        code: -1,
        message: '网络连接失败'
      });
    });

    test('应该能够处理超时错误', async () => {
      wx.request.mockImplementation((options) => {
        options.fail({ code: -2, message: '请求超时' });
      });

      await expect(request.post('/api/slow')).rejects.toMatchObject({
        code: -2,
        message: '请求超时'
      });
    });

    test('应该能够处理服务器错误', async () => {
      wx.request.mockImplementation((options) => {
        options.success({
          statusCode: 500,
          data: { code: 500, message: '服务器内部错误' }
        });
      });

      const response = await request.get('/api/error');
      expect(response.statusCode).toBe(500);
      expect(response.data.code).toBe(500);
    });
  });

  describe('并发请求', () => {
    test('应该能够同时发送多个请求', async () => {
      wx.request.mockImplementation((options) => {
        setTimeout(() => {
          options.success({ code: 200, data: options.url });
        }, Math.random() * 100);
      });

      const promises = [
        request.get('/api/test1'),
        request.get('/api/test2'),
        request.get('/api/test3')
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      expect(wx.request).toHaveBeenCalledTimes(3);
    });

    test('应该能够处理并发请求中的部分失败', async () => {
      wx.request
        .mockImplementationOnce((options) => {
          options.success({ code: 200, data: 'success1' });
        })
        .mockImplementationOnce((options) => {
          options.fail({ code: -1, message: 'error' });
        })
        .mockImplementationOnce((options) => {
          options.success({ code: 200, data: 'success3' });
        });

      const promises = [
        request.get('/api/test1'),
        request.get('/api/test2').catch(err => err),
        request.get('/api/test3')
      ];

      const results = await Promise.all(promises);
      
      expect(results[0].data).toBe('success1');
      expect(results[1].code).toBe(-1);
      expect(results[2].data).toBe('success3');
    });
  });
});

// 特定API端点测试
describe('特定 API 端点测试', () => {
  beforeEach(() => {
    wx.request = jest.fn();
  });

  describe('用户相关 API', () => {
    test('获取用户信息', async () => {
      const mockUserInfo = {
        code: 200,
        data: {
          id: 1,
          username: 'testuser',
          avatar: '/static/avatar1.png',
          email: 'test@example.com'
        }
      };
      
      wx.request.mockImplementation((options) => {
        options.success(mockUserInfo);
      });

      const response = await request.get('/api/user/info');
      
      expect(response.code).toBe(200);
      expect(response.data.username).toBe('testuser');
    });

    test('更新用户信息', async () => {
      const updateData = { username: 'newname', email: 'new@example.com' };
      const mockResponse = { code: 200, message: '更新成功' };
      
      wx.request.mockImplementation((options) => {
        options.success(mockResponse);
      });

      const response = await request.put('/api/user/update', updateData);
      
      expect(response.code).toBe(200);
      expect(response.message).toBe('更新成功');
    });
  });

  describe('练习相关 API', () => {
    test('获取题目列表', async () => {
      const mockQuestions = {
        code: 200,
        data: [
          { id: 1, question: '题目1', type: 'single' },
          { id: 2, question: '题目2', type: 'multiple' }
        ]
      };
      
      wx.request.mockImplementation((options) => {
        options.success(mockQuestions);
      });

      const response = await request.get('/api/practice/questions', { category: 1 });
      
      expect(response.code).toBe(200);
      expect(response.data).toHaveLength(2);
    });

    test('提交答案', async () => {
      const answerData = {
        questionId: 1,
        answers: [2],
        timeSpent: 30
      };
      const mockResponse = {
        code: 200,
        data: { correct: true, score: 10 }
      };
      
      wx.request.mockImplementation((options) => {
        options.success(mockResponse);
      });

      const response = await request.post('/api/practice/submit', answerData);
      
      expect(response.code).toBe(200);
      expect(response.data.correct).toBe(true);
    });
  });

  describe('面试相关 API', () => {
    test('开始面试', async () => {
      const interviewData = { type: 'technical', level: 'junior' };
      const mockResponse = {
        code: 200,
        data: { sessionId: 'session123', firstQuestion: '请自我介绍' }
      };
      
      wx.request.mockImplementation((options) => {
        options.success(mockResponse);
      });

      const response = await request.post('/api/interview/start', interviewData);
      
      expect(response.code).toBe(200);
      expect(response.data.sessionId).toBe('session123');
    });

    test('获取面试反馈', async () => {
      const mockFeedback = {
        code: 200,
        data: {
          sessionId: 'session123',
          score: 85,
          feedback: '表现良好，建议加强技术深度',
          suggestions: ['多练习算法题', '了解更多框架']
        }
      };
      
      wx.request.mockImplementation((options) => {
        options.success(mockFeedback);
      });

      const response = await request.get('/api/interview/feedback/session123');
      
      expect(response.code).toBe(200);
      expect(response.data.score).toBe(85);
      expect(response.data.suggestions).toHaveLength(2);
    });
  });
});
