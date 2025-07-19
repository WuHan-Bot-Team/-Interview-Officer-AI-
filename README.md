# ZhiMian · 智面 —— AI Interview Practice Suite  
**“让每一次模拟面试都像真面试一样严谨、深入、可量化。”**

> 🔥 _All-in-one_ 面试练习平台：**简历分析 ✚ 智能面试问答 ✚ 实时表情检测 ✚ 数字人交互**

---

## 📑 目录

- [项目亮点](#项目亮点)
- [功能详解](#功能详解)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [开发与测试](#开发与测试)
- [API 文档](#api-文档)
- [部署方案](#部署方案)
- [路线图](#路线图)
- [贡献指南](#贡献指南)
- [常见问题](#常见问题)
- [致谢](#致谢)
- [许可证](#许可证)
- [联系作者](#联系作者)

---

## 🌟 项目亮点

| ⭐ | 亮点 | 价值 |
|----|------|------|
| 1 | **多模型融合问答**（DeepSeek + 讯飞星火） | 中英皆精，多轮追问、实时评分 |
| 2 | **7 类表情检测 & 紧张度量化** | 捕捉“微表情”，生成情绪曲线图 |
| 3 | **数字 HR**：音视频 WebSocket 即时推流 | 告别枯燥对话框，沉浸式体验 |
| 4 | **简历语义解析 + 智能改进建议** | 一键“体检”简历，弱项直观展示 |
| 5 | **小程序端扫码即用** | 无需安装 App，分享即练习 |
| 6 | **插件化服务封装** | 轻松替换 LLM / 表情 API / 存储后端 |

---

## 🛠️ 功能详解

### 简历分析 Resume Inspector
- **格式识别**：PDF / DOCX / TXT → JSON
- **要素抽取**：教育、技能、项目、成果
- **诊断评分**：STAR 范式 / 关键词匹配 / ATS 可读性
- **改进建议**：用语精简、量化成果、逻辑顺序

### 智能问答 Interview AI
- **职位定制**：上传 JD，问题粒度自动匹配
- **深度追问**：基于上一答案自调整难度
- **即时打分**：内容完整度、逻辑性、表达清晰度
- **语义回放**：答案关键信息高亮 & 纠错

### 实时表情分析 Facial Metrics
- **分类**：高兴 / 惊讶 / 紧张 / 悲伤 / 无表情…
- **指标**：情绪波动曲线 + 紧张指数 (0-100)
- **建议**：呼吸节奏、目光接触、手势控制

### 数字人模拟 Virtual HR
- **Aipaas Avatar**：Lip-Sync + Motion Sync
- **客户端渲染**：前端低延迟播放 (≤200 ms)
- **多角色**：校招面试官 / 技术 Leader / HR BP

### 小程序端 WeChat Mini App
- 一键扫码进入，兼容 **iOS & Android**
- 富文本问题展示、倒计时、音视频回放
- 个人面试报告自动生成，可导出 PDF

---

## 🚀 快速开始

> 开发者机器：macOS / Linux，Python ≥ 3.10，Node ≥ 18

```bash
git clone https://github.com/YourUser/zhimian.git && cd zhimian

后端（Flask API）

cd interview-agent-flask
python -m venv .venv && source .venv/bin/activate   # Win: .\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # 填写密钥
flask db upgrade             # 若启用数据库
python run.py

前端（微信小程序）

cd interview2
npm install
npm run dev                  # 热更新，端口 5173
# 打开微信开发者工具，导入 interview2/，AppID 改为测试号

一键启动（Docker Compose）

docker compose up -d          # 包含 nginx + flask + redis
# 如需 GPU 推理，可在 compose.yml 中切换 image

⸻

⚙️ 配置说明

变量	示例值	说明
DEEPSEEK_API_KEY	sk-xxx	DeepSeek LLM
SPARK_APPID	xxx	讯飞星火 AppID
REDIS_URL	redis://redis:6379/0	Redis 连接串
LOG_LEVEL	INFO	运行日志级别

	•	完整变量见 interview-agent-flask/.env.example
	•	安全提示：生产环境请改为 export VAR=value 或 Secrets Manager

⸻

🧪 开发与测试

# 代码检查 & 格式化
ruff check . && ruff format .
# 单元测试 & 覆盖率
pytest -q && coverage html
# 前端 Lint
npm run lint && npm run format

Git 提交遵循 Conventional Commits；提交前自动执行 pre-commit 钩子。

⸻

📚 API 文档

启动后访问 http://127.0.0.1:5000/docs（FastAPI-like Swagger UI）。

示例：获取下一道问题

curl -N http://127.0.0.1:5000/interview/question \
  -H "Accept: text/event-stream"

响应（SSE）👇

data: {"type":"question","content":"请介绍一下你最近的项目..."}

完整 OpenAPI JSON 导出：/openapi.json

⸻

📦 部署方案

场景	推荐方案	备注
内网演示	Docker Compose + 内网穿透	简单快捷
公有云生产	K8s（Ingress + HPA）	自动伸缩，支持 GPU
Serverless	Vercel (front) + Cloud Functions	静态小程序部署
CI/CD	GitHub Actions + Docker Hub	自动构建镜像、推送

参考 deploy/ 目录提供的 Helm Chart 与 GitHub Actions Workflow。

⸻

🗺️ 路线图
	•	MVP：简历解析 + 问答 + 表情检测
	•	数字人 HR 角色切换
	•	2025 Q3：多房间并行模拟、团队面试
	•	2025 Q4：企业专属私有化部署、一键导入 ATS
	•	2026 Q1：国际化（英 / 日 / 韩 UI）

Roadmap 详细讨论请见 Projects。

⸻

🤝 贡献指南
	1.	Fork & 新建分支（feat/xxx）
	2.	提交代码前：npm run lint && ruff check . && pytest
	3.	发起 Pull Request，并描述变更 / 截图 / 关联 Issue
	4.	Maintainers 在通过 CI 后 Review & Merge

参与方式：Bug 反馈、功能提案、文档改进、翻译本地化均欢迎！

⸻

❓ 常见问题

问题	解答
Q: 运行 python run.py 报 model not found？	> 请检查 DEEPSEEK_API_KEY & SPARK_API_KEY 是否正确，以及是否绑定白名单 IP。
Q: 表情检测延迟高？	> 开启 GPU 推理或将视频分辨率降低至 640×480。
Q: 如何导出面试报告？	> 小程序“我的”页面 → 历史记录 → 选择面试 → 点击“导出 PDF”。

更多疑难可搜索 Discussions。

⸻

🙏 致谢
	•	DeepSeek & 科大讯飞 提供大语言模型接口
	•	Aipaas Avatar 数字人方案赞助
	•	微信 TDesign 组件库
	•	何老师的支持，Leiyuze和Hermit127的帮助 ❤️

⸻

📄 许可证

本项目基于 MIT License 开源。

⸻

📬 联系作者
	•	GitHub: @Lyceum-xs
	•	邮箱: 2024302111357@whu.edu.cn

「Made with ☕ & ❤️ in Wuhan University — 期待与你在开源社区相遇！」

