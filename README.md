# 音乐平台项目

## 项目概述
本项目是一个音乐创作和分享平台，包含微信小程序前端和管理后台前端。

## 项目结构

```
music_platform-master/
├── miniprogram/          # 微信小程序前端（uni-app）
│   ├── pages/           # 页面
│   ├── components/      # 组件
│   ├── api/             # API 接口
│   ├── config/          # 配置文件
│   └── utils/           # 工具函数
│
├── admin/               # 管理后台前端（Vue3 + Vite）
│   ├── src/            # 源代码
│   │   ├── api/        # API 接口
│   │   ├── views/      # 页面视图
│   │   ├── components/ # 组件
│   │   └── router/     # 路由配置
│   └── dist/           # 构建输出
│
└── README.md           # 项目说明
```

## 技术栈

### 微信小程序前端
- **框架**: uni-app
- **UI 库**: ColorUI
- **状态管理**: Vuex
- **HTTP 请求**: uni.request

### 管理后台前端
- **框架**: Vue 3
- **构建工具**: Vite
- **UI 库**: Element Plus / Ant Design
- **路由**: Vue Router
- **状态管理**: Pinia
- **样式**: Tailwind CSS

## 当前状态

✅ **已完成**：
- 微信小程序前端代码保留
- 管理后台前端代码保留

⏳ **待重构**：
- 后端服务（需要重新设计和实现）
- API 接口（需要重新定义）
- 数据库设计（需要重新规划）

## 开发计划

### 后端重构目标
1. 设计 RESTful API 架构
2. 选择后端技术栈（建议：Node.js + Express/NestJS 或 Python + FastAPI）
3. 设计数据库模型（MySQL/PostgreSQL + Redis）
4. 实现用户认证和授权
5. 实现核心业务逻辑
6. 集成第三方服务（微信登录、支付、AI 服务等）

### 后续步骤
1. 确定后端技术选型
2. 设计数据库表结构
3. 定义 API 接口文档
4. 搭建后端项目框架
5. 实现核心功能模块
6. 前后端联调测试

## 许可证
待定
