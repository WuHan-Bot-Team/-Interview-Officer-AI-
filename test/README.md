# 前端测试文档

## 测试概述

本项目采用 Jest 测试框架进行前端测试，涵盖了微信小程序的各个方面，包括工具函数、组件、页面、API 请求和集成测试。

## 测试结构

```
test/
├── __mocks__/           # Mock 文件
│   └── wx.js           # 微信 API Mock
├── utils/              # 工具函数测试
│   ├── util.test.js    # 通用工具函数测试
│   └── eventBus.test.js # 事件总线测试
├── mock/               # Mock 系统测试
│   └── mock.test.js    # 请求拦截和数据模拟测试
├── components/         # 组件测试
│   └── customTabBar.test.js # 自定义导航栏测试
├── pages/              # 页面测试
│   ├── home2.test.js   # 首页测试
│   └── practice.test.js # 练习页面测试
├── api/                # API 测试
│   └── request.test.js # HTTP 请求测试
├── integration/        # 集成测试
│   └── app.test.js     # 应用集成测试
├── package.json        # 测试依赖配置
├── .babelrc.js         # Babel 配置
└── README.md          # 本文档
```

## 运行测试

### 安装依赖
```bash
cd test
npm install
```

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npm test -- utils/util.test.js
```

### 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

### 监听模式运行测试
```bash
npm run test:watch
```

## 测试类型

### 1. 工具函数测试 (utils/)

测试项目中的通用工具函数，包括：

- **util.test.js**: 时间格式化、数字格式化、URL 处理等
- **eventBus.test.js**: 事件总线的订阅、发布、取消订阅功能

```javascript
// 示例：测试时间格式化函数
test('formatTime 应该正确格式化时间', () => {
  expect(formatTime(1640995200000)).toBe('2022-01-01 08:00:00');
});
```

### 2. Mock 系统测试 (mock/)

测试 Mock 数据系统的功能：

- 请求拦截
- 响应数据模拟
- 错误处理
- 参数验证

```javascript
// 示例：测试请求拦截
test('应该能够拦截 wx.request 请求', () => {
  wxMock.request({ url: '/api/test', method: 'GET' });
  expect(wxMock.getRequests()).toHaveLength(1);
});
```

### 3. 组件测试 (components/)

使用 miniprogram-simulate 测试小程序组件：

- 组件渲染
- 事件处理
- 数据绑定
- 样式状态

```javascript
// 示例：测试组件点击事件
test('点击标签应该切换选中状态', () => {
  const comp = simulate.render(id);
  const tabItems = comp.querySelectorAll('.tab-item');
  tabItems[1].dispatchEvent('tap');
  expect(comp.data.selected).toBe(1);
});
```

### 4. 页面测试 (pages/)

测试页面组件的完整功能：

- 页面初始化
- 数据加载
- 用户交互
- 导航跳转
- 生命周期

```javascript
// 示例：测试页面导航
test('点击功能模块应该导航到对应页面', () => {
  const comp = simulate.render(id);
  const featureItems = comp.querySelectorAll('.feature-item');
  featureItems[0].dispatchEvent('tap');
  expect(mockNavigateTo).toHaveBeenCalledWith({
    url: '/pages/interviewHome/index'
  });
});
```

### 5. API 测试 (api/)

测试 HTTP 请求相关功能：

- GET/POST/PUT/DELETE 请求
- 请求参数处理
- 响应数据处理
- 错误处理
- 并发请求

```javascript
// 示例：测试 API 请求
test('应该能够发送 POST 请求', async () => {
  wx.request.mockImplementation((options) => {
    options.success({ code: 200, data: 'success' });
  });
  
  const response = await request.post('/api/login', { username: 'test' });
  expect(response.code).toBe(200);
});
```

### 6. 集成测试 (integration/)

测试应用的整体功能：

- 应用启动流程
- 页面间导航
- 数据流传递
- 事件通信
- 存储功能
- 错误处理

```javascript
// 示例：测试应用启动
test('应该能够正常启动应用', () => {
  expect(() => {
    mockApp.onLaunch();
  }).not.toThrow();
  expect(mockApp.globalData).toBeDefined();
});
```

## Mock 功能

### 微信 API Mock (wx.js)

提供完整的微信小程序 API 模拟：

- **存储 API**: getStorageSync, setStorageSync 等
- **网络 API**: request, uploadFile, downloadFile 等
- **导航 API**: navigateTo, switchTab, navigateBack 等
- **界面 API**: showToast, showModal, showLoading 等
- **系统 API**: getSystemInfo, getNetworkType 等

### 请求拦截系统

支持请求拦截和响应模拟：

```javascript
// 设置模拟响应
wxMock.setResponse('/api/test', { 
  success: true, 
  data: { code: 200, message: 'success' } 
});

// 发送请求会返回模拟数据
wx.request({
  url: '/api/test',
  success: (res) => {
    console.log(res); // { code: 200, message: 'success' }
  }
});
```

## 测试工具和配置

### Jest 配置

- **测试环境**: jsdom
- **模块转换**: babel-jest
- **覆盖率**: 包含 HTML 和文本报告
- **测试匹配**: `**/*.test.js` 文件

### Babel 配置

- **预设**: @babel/preset-env
- **目标**: Node.js 12+
- **模块**: CommonJS

### 依赖包

- **jest**: 测试框架
- **miniprogram-simulate**: 小程序组件测试
- **babel-jest**: ES6+ 语法支持
- **jsdom**: DOM 环境模拟

## 最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 采用 `应该...` 的格式
- 按功能分组测试用例

```javascript
describe('用户登录功能', () => {
  test('应该能够验证用户凭据', () => {
    // 测试代码
  });
  
  test('应该处理登录失败情况', () => {
    // 测试代码
  });
});
```

### 2. Mock 使用

- 在每个测试前重置 Mock
- 使用具体的断言验证 Mock 调用
- 为不同场景设置不同的 Mock 行为

```javascript
beforeEach(() => {
  jest.clearAllMocks();
  wx.request = jest.fn();
});
```

### 3. 异步测试

- 使用 async/await 处理异步操作
- 使用 Promise 和 done 回调处理复杂异步流程
- 设置合适的超时时间

```javascript
test('应该处理异步数据加载', async () => {
  const data = await loadUserData();
  expect(data.username).toBe('testuser');
});
```

### 4. 错误处理测试

- 测试正常和异常情况
- 验证错误信息和错误码
- 测试边界条件

```javascript
test('应该处理网络错误', async () => {
  wx.request.mockImplementation((options) => {
    options.fail({ code: -1, message: '网络连接失败' });
  });
  
  await expect(request.get('/api/test')).rejects.toMatchObject({
    code: -1,
    message: '网络连接失败'
  });
});
```

## 覆盖率要求

- **行覆盖率**: >= 80%
- **函数覆盖率**: >= 85%
- **分支覆盖率**: >= 75%
- **语句覆盖率**: >= 80%

## 持续集成

测试应该在以下情况下自动运行：

1. 代码提交前 (pre-commit hook)
2. Pull Request 创建时
3. 代码合并到主分支时
4. 定期构建 (每日/每周)

## 调试测试

### 调试单个测试
```bash
npm test -- --testNamePattern="特定测试名称"
```

### 查看详细输出
```bash
npm test -- --verbose
```

### 调试模式运行
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 问题排查

### 常见问题

1. **Mock 不生效**: 检查 Mock 文件路径和导入方式
2. **异步测试超时**: 增加超时时间或使用 fake timers
3. **组件测试失败**: 确认 miniprogram-simulate 配置正确
4. **覆盖率不足**: 添加缺失的测试用例

### 获取帮助

如果遇到测试相关问题：

1. 查看 Jest 官方文档
2. 检查 miniprogram-simulate 使用指南  
3. 查看项目测试示例
4. 联系开发团队获取支持

---

## 更新日志

- **v1.0.0**: 初始版本，包含基础测试套件
- **v1.1.0**: 添加组件测试和集成测试
- **v1.2.0**: 完善 Mock 系统和 API 测试
