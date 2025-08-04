# 快速开始指南

## 🚀 5分钟快速上手

### 1. 安装依赖
```bash
cd test
npm install
```

### 2. 运行测试
```bash
# 运行所有测试
npm test

# 或使用脚本
./run-tests.sh
```

### 3. 查看覆盖率
```bash
npm run test:coverage
```

## 📋 测试清单

✅ **工具函数测试**
- [x] 时间格式化 (`formatTime`)
- [x] 数字格式化 (`formatNumber`) 
- [x] URL 处理 (`getLocalUrl`)
- [x] 事件总线 (`EventBus`)

✅ **Mock 系统测试**
- [x] 请求拦截
- [x] 响应模拟
- [x] 错误处理
- [x] 参数验证

✅ **组件测试**
- [x] 自定义导航栏 (`CustomTabBar`)
- [x] 组件渲染
- [x] 事件处理
- [x] 状态管理

✅ **页面测试**
- [x] 首页 (`Home2`)
- [x] 练习页面 (`Practice`)
- [x] 页面导航
- [x] 数据加载

✅ **API 测试**
- [x] HTTP 请求方法
- [x] 错误处理
- [x] 并发请求
- [x] 请求拦截器

✅ **集成测试**
- [x] 应用启动流程
- [x] 页面间通信
- [x] 数据持久化
- [x] 错误处理

## 🎯 常用命令

```bash
# 安装依赖
npm install

# 运行所有测试
npm test

# 生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch

# 运行特定测试
npm test -- utils/util.test.js

# 详细输出
npm test -- --verbose

# 清理缓存
./run-tests.sh --clean
```

## 📊 当前测试状态

- ✅ **80+** 个测试用例
- ✅ **覆盖率目标**: 80%+
- ✅ **支持的功能**: 工具函数、组件、页面、API、集成
- ✅ **Mock 支持**: 完整的微信小程序 API

## 🔧 开发工具

- **测试框架**: Jest
- **组件测试**: miniprogram-simulate  
- **覆盖率**: Jest 内置
- **Mock**: 自定义 wx API Mock

## 📖 更多信息

详细文档请查看 [README.md](./README.md)
