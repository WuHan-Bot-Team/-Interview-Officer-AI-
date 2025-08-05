# 🤖 智能面试官AI系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/flask-2.0+-green.svg)](https://flask.palletsprojects.com)
[![WeChat Mini Program](https://img.shields.io/badge/platform-微信小程序-brightgreen.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)

> 基于AI技术的智能面试系统，集成数字人交互、工作适配度测评、AI刷题等功能，为求职者提供全方位的面试准备和评估服务。

## 📋 目录

- [功能特性](#-功能特性)
- [技术架构](#-技术架构)
- [快速开始](#-快速开始)
- [项目结构](#-项目结构)
- [功能模块](#-功能模块)
- [API文档](#-api文档)
- [部署指南](#-部署指南)
- [开发说明](#-开发说明)
- [更新日志](#-更新日志)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

## ✨ 功能特性

### 🎯 核心功能

- **📺 数字人面试**: 基于AI技术的虚拟面试官，支持实时语音交互
- **📊 工作适配度测评**: 8维度职业适配度分析，AI智能推荐匹配岗位
- **🧠 AI智能刷题**: 针对性题目推荐，实时答案解析和评分
- **📝 简历分析**: 智能简历解析和优化建议
- **🎭 情感识别**: 基于面部表情的情感状态分析
- **📈 数据统计**: 详细的面试表现分析和成长轨迹

### 🎨 界面特色

- **🍊 现代化橙色主题**: 温暖专业的视觉设计
- **📱 响应式设计**: 完美适配各种屏幕尺寸
- **🔄 实时交互**: 流畅的用户体验和即时反馈
- **🎪 动画效果**: 精美的过渡动画和交互反馈

## 🏗️ 技术架构

### 前端技术栈
- **框架**: 微信小程序原生开发
- **UI组件**: TDesign小程序组件库
- **状态管理**: 小程序原生数据绑定
- **样式**: LESS预处理器
- **图标**: TDesign图标库

### 后端技术栈
- **框架**: Flask 2.0+
- **数据库**: SQLite/MySQL
- **AI模型**: DeepSeek API
- **实时通信**: WebSocket
- **文件处理**: 多媒体文件上传和处理
- **部署**: Docker支持

### AI服务
- **语言模型**: DeepSeek V2
- **语音识别**: 科大讯飞语音SDK
- **图像处理**: OpenCV
- **情感分析**: 自研算法模型

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 14+
- 微信开发者工具
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/Lyceum-xs/-ai-.git
cd -ai-
```

2. **后端环境配置**
```bash
cd interview-agent-flask
pip install -r requirements.txt
```

3. **启动后端服务**
```bash
python run.py
```

4. **前端配置**
```bash
# 使用微信开发者工具打开 interview2 目录
# 配置小程序AppID和服务器域名
```

5. **访问应用**
- 后端服务: http://localhost:5001
- 小程序: 使用微信开发者工具预览

## 📁 项目结构

```
├── interview-agent-flask/          # 后端Flask服务
│   ├── app/                       # 应用核心模块
│   │   ├── practice_route.py      # 刷题功能路由
│   │   ├── interview_route.py     # 面试功能路由
│   │   └── job_compatibility_route.py # 工作适配度路由
│   ├── services/                  # 业务逻辑服务
│   │   ├── DeepSeek.py           # AI模型服务
│   │   ├── FaceDetect.py         # 人脸识别服务
│   │   └── AnalysisResume.py     # 简历分析服务
│   ├── avatar/                    # 数字人相关
│   ├── resource/                  # 资源文件
│   └── run.py                    # 应用启动文件
├── interview2/                    # 前端小程序
│   ├── pages/                    # 页面文件
│   │   ├── home2/               # 首页
│   │   ├── practice/            # 刷题页面
│   │   ├── jobCompatibility/    # 工作适配度测评
│   │   ├── chat/               # AI聊天
│   │   └── my/                 # 个人中心
│   ├── components/              # 组件库
│   ├── utils/                   # 工具函数
│   ├── static/                  # 静态资源
│   └── app.js                   # 应用入口
└── README.md                     # 项目说明文档
```

## 🔧 功能模块

### 1. 数字人面试系统
- **实时交互**: WebSocket连接，支持语音和文字交流
- **智能问答**: 基于岗位和简历的个性化面试题目
- **表情分析**: 实时情感状态监测和反馈
- **面试报告**: 详细的面试表现分析和改进建议

### 2. 工作适配度测评
- **8维度评估**: 薪资期望、兴趣匹配、工作环境等全面分析
- **AI智能分析**: DeepSeek模型提供专业的职业建议
- **岗位推荐**: 基于测评结果推荐合适的工作岗位
- **发展规划**: 个人职业发展路径建议

### 3. AI刷题系统
- **智能题库**: 涵盖技术、行为、逻辑等多种题型
- **个性化推荐**: 根据用户水平推荐合适难度题目
- **实时评分**: 即时答案解析和评分反馈
- **学习轨迹**: 记录学习进度和知识掌握情况

### 4. 简历分析优化
- **智能解析**: 自动提取简历关键信息
- **优化建议**: AI提供专业的简历改进意见
- **匹配分析**: 简历与目标岗位的匹配度评估

## 📚 API文档

### 基础配置
```
Base URL: http://localhost:5001
Content-Type: application/json
```

### 主要API端点

#### 工作适配度测评
```http
GET  /job_compatibility/questions     # 获取测评问题
POST /job_compatibility/analyze       # 提交答案并分析
```

#### 面试功能
```http
POST /interview/init                  # 初始化面试
POST /interview/answer               # 提交面试答案
GET  /interview/feedback             # 获取面试反馈
```

#### 刷题功能
```http
GET  /practice/questions             # 获取题目列表
POST /practice/submit               # 提交答案
GET  /practice/analysis             # 获取答题分析
```

### 请求示例

**获取工作适配度问题**
```bash
curl -X GET http://localhost:5001/job_compatibility/questions
```

**提交适配度分析**
```bash
curl -X POST http://localhost:5001/job_compatibility/analyze \
  -H "Content-Type: application/json" \
  -d '{"answers": {"salary": "8k-12k", "workMode": "混合工作"}}'
```

## 🐳 部署指南

### Docker部署

1. **构建镜像**
```bash
docker build -t interview-ai .
```

2. **运行容器**
```bash
docker run -p 5001:5001 interview-ai
```

### 生产环境部署

1. **服务器配置**
```bash
# 安装依赖
sudo apt update
sudo apt install python3 python3-pip nginx

# 配置虚拟环境
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Nginx配置**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 💻 开发说明

### 环境配置

1. **Python环境**
```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

2. **配置文件**
```python
# config.py
class Config:
    SECRET_KEY = 'your-secret-key'
    DEEPSEEK_API_KEY = 'your-deepseek-api-key'
    DATABASE_URL = 'sqlite:///interview.db'
```

### 开发工具推荐

- **后端开发**: PyCharm, VS Code
- **前端开发**: 微信开发者工具
- **API测试**: Postman, curl
- **版本控制**: Git
- **代码格式化**: Black, Prettier

### 代码规范

- **Python**: 遵循PEP 8规范
- **JavaScript**: 使用ESLint + Prettier
- **Git提交**: 遵循Conventional Commits规范

## 📝 更新日志

### v2.0.0 (2025-08-06)
- ✨ 新增工作适配度测评功能
- 🎨 全新橙色主题UI设计
- 🔧 修复Toast组件导入问题
- 🐛 修复DeepSeek API调用错误
- ⚡ 优化API响应性能

### v1.5.0
- 📺 数字人面试功能上线
- 🧠 AI刷题系统优化
- 📱 小程序界面重构

### v1.0.0
- 🎉 项目初始版本发布
- 📝 基础面试功能实现
- 🔧 Flask后端架构搭建

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范

- 代码需要通过所有测试
- 新功能需要添加相应的测试用例
- 提交信息需要清晰描述更改内容
- 遵循项目的代码规范

## 📞 联系方式

- **项目维护**: [Lyceum-xs](https://github.com/Lyceum-xs)
- **问题反馈**: [Issues](https://github.com/Lyceum-xs/-ai-/issues)
- **技术讨论**: [Discussions](https://github.com/Lyceum-xs/-ai-/discussions)

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 感谢 [TDesign](https://tdesign.tencent.com/) 提供优秀的UI组件库
- 感谢 [DeepSeek](https://www.deepseek.com/) 提供强大的AI模型支持
- 感谢所有贡献者的辛勤工作

---

<div align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-red.svg" alt="Made with love">
  <img src="https://img.shields.io/badge/Powered%20by-AI-blue.svg" alt="Powered by AI">
</div>

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Lyceum-xs">Lyceum-xs</a></sub>
</div>

