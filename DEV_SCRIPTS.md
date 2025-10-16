# 音乐平台本地开发环境管理脚本

## 📋 脚本说明

本目录包含三个用于管理本地开发环境的脚本：

| 脚本 | 说明 |
|------|------|
| `start-dev.sh` | 启动所有开发环境服务（数据库 + 后端 + 管理后台） |
| `stop-dev.sh` | 停止所有开发环境服务 |
| `status-dev.sh` | 查看所有服务的运行状态 |

## 🚀 快速开始

### 1. 启动开发环境

```bash
cd /Users/bang/Documents/dev/miniprogram1/music
./start-dev.sh
```

脚本会按顺序执行：
1. 检查 Docker 是否运行
2. 启动 MySQL 和 Redis 容器
3. 启动后端 API 服务（端口 3000）
4. 启动管理后台前端（端口 5173）

### 2. 查看服务状态

```bash
./status-dev.sh
```

显示所有服务的运行状态，包括：
- Docker 服务状态
- MySQL、Redis、Adminer 容器状态
- 后端 API 服务状态
- 管理后台前端状态
- 日志文件位置

### 3. 停止开发环境

```bash
./stop-dev.sh
```

脚本会：
1. 停止管理后台前端
2. 停止后端 API 服务
3. 询问是否停止数据库服务（可选）
4. 询问是否清理日志文件（可选）

## 🌐 服务访问地址

启动成功后，可以通过以下地址访问：

| 服务 | 地址 | 说明 |
|------|------|------|
| 后端 API | http://localhost:3000/api | NestJS 后端服务 |
| 管理后台 | http://localhost:5173 | Vue 3 管理界面 |
| 数据库管理 | http://localhost:8080 | Adminer 数据库管理工具 |
| MySQL | localhost:3306 | 用户: root, 密码: root123456 |
| Redis | localhost:6379 | 密码: redis123456 |

## 📝 日志文件

日志文件保存在 `/tmp` 目录：

```bash
# 查看后端实时日志
tail -f /tmp/backend_startup.log

# 查看管理后台实时日志
tail -f /tmp/admin_startup.log
```

## 🔧 进程管理

PID 文件保存在 `/tmp` 目录：
- 后端 PID: `/tmp/backend_pid.txt`
- 前端 PID: `/tmp/admin_pid.txt`

## ⚠️ 注意事项

1. **Docker 必须运行**：启动脚本会检查 Docker 是否运行，如未运行请先启动 Docker Desktop

2. **端口占用**：脚本会自动清理端口 3000 和 5173 的占用进程

3. **数据库持久化**：停止数据库服务不会删除数据，数据保存在 Docker 卷中

4. **首次启动**：首次启动可能需要等待较长时间，等待数据库初始化和依赖安装

## 🐛 故障排查

### 服务无法启动

```bash
# 1. 查看服务状态
./status-dev.sh

# 2. 查看详细日志
tail -n 100 /tmp/backend_startup.log
tail -n 100 /tmp/admin_startup.log

# 3. 手动清理端口
lsof -ti :3000 | xargs kill -9  # 清理后端端口
lsof -ti :5173 | xargs kill -9  # 清理前端端口

# 4. 重启 Docker 容器
cd /Users/bang/Documents/dev/miniprogram/backend
docker-compose restart mysql redis
```

### 数据库连接失败

```bash
# 检查 MySQL 容器状态
docker ps | grep ai_music_mysql

# 测试 MySQL 连接
docker exec ai_music_mysql mysqladmin ping -h localhost -uroot -proot123456

# 检查 Redis 容器状态
docker ps | grep ai_music_redis

# 测试 Redis 连接
docker exec ai_music_redis redis-cli -a redis123456 ping
```

### API 请求失败

```bash
# 测试 API 接口
curl http://localhost:3000/api/public/banner/list

# 如果返回 500 错误，检查数据库表结构
# 确保所有表都有 deleted_at 字段
```

## 📦 项目结构

```
/Users/bang/Documents/dev/miniprogram1/music/
├── backend/              # 后端 NestJS 项目
├── admin/                # 管理后台 Vue 3 项目
├── miniprogram/          # 微信小程序项目（不在启动脚本中）
├── start-dev.sh          # 启动脚本
├── stop-dev.sh           # 停止脚本
├── status-dev.sh         # 状态查看脚本
└── DEV_SCRIPTS.md        # 本文档
```

## 🔄 开发工作流

1. **每天开始工作**
   ```bash
   ./start-dev.sh
   ```

2. **开发过程中**
   ```bash
   ./status-dev.sh          # 随时查看服务状态
   tail -f /tmp/backend_startup.log  # 查看后端日志
   ```

3. **结束工作**
   ```bash
   ./stop-dev.sh            # 停止服务
   # 选择 N 保留数据库运行（推荐）
   # 选择 N 保留日志文件（推荐）
   ```

## 📧 问题反馈

如遇到问题，请提供：
1. 运行 `./status-dev.sh` 的输出
2. 相关日志文件内容
3. 错误信息截图
