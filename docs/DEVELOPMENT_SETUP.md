# 开发环境配置文档

## 数据库配置

### 阿里云RDS配置信息

- **主机**: rm-bp1s2o0qzqdwdif9nko.mysql.rds.aliyuncs.com
- **端口**: 3306
- **数据库名**: music
- **用户名**: musicadmin
- **密码**: Chenbang198859

### 已完成的配置

✅ 后端数据库连接配置 (`backend/.env`)
✅ 数据库表结构初始化
✅ 种子数据填充
✅ 依赖包安装

## 项目结构

```
music/
├── backend/          # NestJS后端服务 (端口3000)
│   ├── src/         # 源代码
│   ├── .env         # 环境变量配置（已配置阿里云RDS）
│   └── package.json
├── admin/           # Vue3管理后台 (端口5173)
│   ├── src/
│   └── package.json
└── miniprogram/     # uni-app微信小程序
    ├── pages/
    └── config/
```

## 启动开发环境

### 1. 启动后端服务

```bash
cd backend
npm run start:dev
```

后端服务将在 `http://localhost:3000` 启动

### 2. 启动管理后台

```bash
cd admin
pnpm run dev
```

管理后台将在 `http://localhost:5173` 启动

### 3. 启动小程序

使用HBuilderX打开 `miniprogram` 目录，然后：
1. 点击"运行" -> "运行到小程序模拟器" -> "微信开发者工具"
2. 或使用命令行：`npm run dev:mp-weixin`

## 快速启动脚本

项目根目录提供了快速启动脚本：

```bash
# 启动所有服务
./start-dev.sh

# 查看服务状态
./status-dev.sh

# 停止所有服务
./stop-dev.sh
```

## 数据库操作

### 重新初始化数据库

```bash
cd backend
node scripts/init-database.js
```

### 测试数据库连接

```bash
cd backend
node test-db-connection.js
```

### 创建管理员用户

```bash
cd backend
node scripts/create-admin-user.js
```

## API文档

启动后端服务后，访问以下地址查看API文档：

- Swagger UI: http://localhost:3000/api/docs

## 常见问题

### 1. 数据库连接失败

检查：
- 网络是否可以访问阿里云RDS
- `.env` 文件中的数据库配置是否正确
- 数据库用户是否有足够的权限

### 2. 端口被占用

如果3000端口被占用，可以在 `backend/.env` 中修改：
```
PORT=3001
```

### 3. 前端API请求失败

确认：
- 后端服务是否正常运行
- 前端配置的API地址是否正确
- 小程序：`miniprogram/config/index.js`
- 管理后台：`admin/.env.production`

## 环境要求

- Node.js: v18.20.8
- npm: 10.8.2
- pnpm: 10.18.2
- MySQL: 5.7+

## 下一步

1. 配置微信小程序APPID和SECRET
2. 配置第三方AI服务密钥（Gemini、Suno等）
3. 根据需要调整Redis配置
4. 配置文件存储路径

## 配置文件说明

### backend/.env
主要配置项：
- 数据库连接信息（已配置）
- Redis连接信息
- JWT密钥
- 微信小程序配置
- AI服务API密钥

### miniprogram/config/index.js
配置后端API地址，当前配置为：
```javascript
const ipAddress = 'http://localhost:3000/api'
```

### admin/.env.production
配置后端API地址，当前配置为：
```
VITE_API_BASE_URL=https://adminapi.jianzhile.vip/api
```

## 技术栈

- **后端**: NestJS + TypeORM + MySQL
- **管理后台**: Vue 3 + TypeScript + Vite + Tailwind CSS
- **小程序**: uni-app
- **缓存**: Redis
- **文档**: Swagger

---

*最后更新: 2025-01-16*
*配置完成人: AI Assistant*
