# 音乐平台双场景启动指南

## 📋 概述

项目支持两种开发场景，每种场景有独立的配置和启动脚本：

| 场景 | 描述 | 启动脚本 | 访问方式 |
|------|------|----------|----------|
| **局域网模式** | Ubuntu开发，局域网设备访问 | `./start-lan.sh` | `http://192.168.1.118:xxxx` |
| **本地模式** | 办公室电脑，本机访问 | `./start-local.sh` | `http://localhost:xxxx` |

---

## 🚀 场景一：局域网开发模式

### 适用场景

- 在Ubuntu (192.168.1.118) 上开发和编译
- 需要在局域网其他电脑上访问管理后台
- 需要在局域网其他电脑上编译微信小程序

### 一键启动

```bash
cd /home/chenbang/app/music/musicdev/music
./start-lan.sh
```

### 配置文件

自动使用以下配置：

#### 1. 后端配置 (`backend/.env.lan`)
```bash
HOST=0.0.0.0                    # 监听所有网络接口
PORT=3000
STORAGE_BASE_URL=http://192.168.1.118:3000/uploads
FRONTEND_URL=http://192.168.1.118:5173
```

#### 2. 前端配置 (`admin/.env.lan`)
```bash
VITE_API_BASE_URL=http://192.168.1.118:3000/api
```

#### 3. 小程序配置 (`miniprogram/config/index.lan.js`)
```javascript
const ipAddress = 'http://192.168.1.118:3000/api'
const fileAddr = 'http://192.168.1.118:3000/fileUpload/'
```

### 访问地址

| 服务 | Ubuntu本机访问 | 局域网其他设备访问 |
|------|---------------|-------------------|
| 后端API | http://localhost:3000 | http://192.168.1.118:3000 |
| API文档 | http://localhost:3000/api/docs | http://192.168.1.118:3000/api/docs |
| 管理后台 | http://localhost:5173 | http://192.168.1.118:5173 |

### 小程序开发

1. 在Ubuntu或局域网其他电脑上打开HBuilderX
2. 打开 `miniprogram` 目录
3. 运行到微信开发者工具
4. 小程序会自动连接到 `http://192.168.1.118:3000/api`

### 端口说明

- `3000` - 后端API服务（监听 0.0.0.0）
- `5173` - 管理后台（监听 0.0.0.0）

---

## 🏠 场景二：本地开发模式

### 适用场景

- 在办公室电脑上开发
- 仅需要本机访问
- 不需要其他设备访问

### 一键启动

```bash
cd /home/chenbang/app/music/musicdev/music
./start-local.sh
```

### 配置文件

自动使用以下配置：

#### 1. 后端配置 (`backend/.env.local`)
```bash
HOST=localhost                  # 仅监听本机
PORT=3000
STORAGE_BASE_URL=http://localhost:3000/uploads
FRONTEND_URL=http://localhost:5173
```

#### 2. 前端配置 (`admin/.env.local`)
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

#### 3. 小程序配置 (`miniprogram/config/index.local.js`)
```javascript
const ipAddress = 'http://localhost:3000/api'
const fileAddr = 'http://localhost:3000/fileUpload/'
```

### 访问地址

| 服务 | 访问地址 |
|------|---------|
| 后端API | http://localhost:3000 |
| API文档 | http://localhost:3000/api/docs |
| 管理后台 | http://localhost:5173 |

### 小程序开发

1. 在本机打开HBuilderX
2. 打开 `miniprogram` 目录
3. 运行到微信开发者工具
4. 小程序会自动连接到 `http://localhost:3000/api`

### 端口说明

- `3000` - 后端API服务（仅监听 localhost）
- `5173` - 管理后台（仅监听 localhost）

---

## 🛠️ 管理命令

### 查看状态

```bash
./status-all.sh
```

显示信息：
- 当前配置模式（局域网/本地）
- 后端服务状态和访问地址
- 管理后台状态和访问地址
- 数据库连接状态
- 日志文件位置和大小

### 停止服务

```bash
./stop-all.sh
```

功能：
- 停止后端服务
- 停止管理后台
- 强制释放端口（3000, 5173, 5174）

### 查看日志

```bash
# 实时查看后端日志
tail -f /tmp/music-platform/backend.log

# 实时查看前端日志
tail -f /tmp/music-platform/admin.log

# 查看最后50行
tail -50 /tmp/music-platform/backend.log
tail -50 /tmp/music-platform/admin.log
```

---

## 📁 项目结构

```
music/
├── backend/
│   ├── .env           # 当前使用的配置（自动生成）
│   ├── .env.lan       # 局域网配置
│   └── .env.local     # 本地配置
├── admin/
│   ├── .env           # 当前使用的配置（自动生成）
│   ├── .env.lan       # 局域网配置
│   └── .env.local     # 本地配置
├── miniprogram/
│   └── config/
│       ├── index.js        # 当前使用的配置（自动生成）
│       ├── index.lan.js    # 局域网配置
│       └── index.local.js  # 本地配置
├── start-lan.sh       # 局域网模式启动
├── start-local.sh     # 本地模式启动
├── stop-all.sh        # 停止所有服务
└── status-all.sh      # 查看服务状态
```

---

## 🔄 场景切换

### 从本地模式切换到局域网模式

```bash
./stop-all.sh      # 先停止当前服务
./start-lan.sh     # 启动局域网模式
```

### 从局域网模式切换到本地模式

```bash
./stop-all.sh      # 先停止当前服务
./start-local.sh   # 启动本地模式
```

---

## ⚙️ 配置说明

### 自动配置切换

启动脚本会自动完成以下操作：

1. **复制对应的环境配置文件**
   ```bash
   # 局域网模式
   cp backend/.env.lan backend/.env
   cp admin/.env.lan admin/.env
   cp miniprogram/config/index.lan.js miniprogram/config/index.js
   
   # 本地模式
   cp backend/.env.local backend/.env
   cp admin/.env.local admin/.env
   cp miniprogram/config/index.local.js miniprogram/config/index.js
   ```

2. **测试数据库连接**
3. **启动后端服务**
4. **启动管理后台**

### 手动配置（不推荐）

如需手动切换配置，请确保三个项目的配置一致：

1. 后端：`backend/.env`
2. 前端：`admin/.env`
3. 小程序：`miniprogram/config/index.js`

---

## 🐛 故障排查

### 问题：端口被占用

**症状**：启动失败，提示端口3000或5173已被占用

**解决**：
```bash
# 方法1：使用停止脚本
./stop-all.sh

# 方法2：手动停止
kill $(lsof -t -i:3000)  # 停止后端
kill $(lsof -t -i:5173)  # 停止前端

# 方法3：查看并手动停止
lsof -i:3000  # 查看占用端口的进程
kill <PID>    # 停止指定进程
```

### 问题：数据库连接失败

**症状**：启动时显示数据库连接失败

**检查**：
1. 网络连接是否正常
2. 阿里云RDS安全组是否允许访问
3. 数据库配置是否正确

**测试**：
```bash
cd backend
node test-db-connection.js
```

### 问题：前端无法访问后端API

**症状**：前端页面加载正常，但API请求失败

**检查**：

1. **局域网模式**：
   - 后端是否监听 0.0.0.0
   - 防火墙是否允许端口3000
   - 前端配置的API地址是否正确（192.168.1.118）

2. **本地模式**：
   - 前端配置的API地址是否为localhost
   - 后端服务是否正常运行

**调试**：
```bash
# 查看后端监听地址
./status-all.sh

# 测试API连接（局域网模式）
curl http://192.168.1.118:3000/api

# 测试API连接（本地模式）
curl http://localhost:3000/api

# 查看后端日志
tail -f /tmp/music-platform/backend.log
```

### 问题：小程序无法连接后端

**症状**：小程序编译正常，但API请求失败

**检查**：
1. 小程序配置文件是否正确切换
2. 后端服务是否正常运行
3. 网络是否可达

**验证配置**：
```bash
# 查看当前小程序配置
cat miniprogram/config/index.js

# 应该显示对应模式的IP地址
# 局域网模式：http://192.168.1.118:3000/api
# 本地模式：http://localhost:3000/api
```

### 问题：服务启动后无法访问

**症状**：服务显示启动成功，但无法访问

**排查步骤**：

1. **检查服务状态**
   ```bash
   ./status-all.sh
   ```

2. **检查日志**
   ```bash
   tail -100 /tmp/music-platform/backend.log
   tail -100 /tmp/music-platform/admin.log
   ```

3. **检查端口监听**
   ```bash
   lsof -i:3000  # 后端
   lsof -i:5173  # 前端
   ```

4. **测试连接**
   ```bash
   # 本机测试
   curl http://localhost:3000
   
   # 局域网测试（在其他设备上）
   curl http://192.168.1.118:3000
   ```

---

## 📊 性能监控

### 查看资源使用

```bash
# 查看后端进程资源
ps aux | grep node | grep backend

# 查看内存使用
free -h

# 查看磁盘使用
df -h
```

### 日志管理

```bash
# 清理日志（如果太大）
> /tmp/music-platform/backend.log
> /tmp/music-platform/admin.log

# 或者删除旧日志
rm /tmp/music-platform/*.log
```

---

## 🔐 安全建议

### 局域网模式

⚠️ 局域网模式会将服务暴露在网络上，请注意：

1. **仅在可信任的局域网中使用**
2. **不要在公网环境使用局域网模式**
3. **及时更新JWT密钥和加密密钥**
4. **使用防火墙限制访问来源**

### 防火墙配置（可选）

```bash
# 允许局域网访问端口3000和5173
sudo ufw allow from 192.168.1.0/24 to any port 3000
sudo ufw allow from 192.168.1.0/24 to any port 5173

# 或限制特定IP访问
sudo ufw allow from 192.168.1.100 to any port 3000
sudo ufw allow from 192.168.1.100 to any port 5173
```

---

## 📝 快速参考

### 常用命令

```bash
# 启动服务
./start-lan.sh      # 局域网模式
./start-local.sh    # 本地模式

# 管理服务
./status-all.sh     # 查看状态
./stop-all.sh       # 停止服务

# 查看日志
tail -f /tmp/music-platform/backend.log
tail -f /tmp/music-platform/admin.log

# 测试数据库
cd backend && node test-db-connection.js

# 强制停止端口
kill $(lsof -t -i:3000)
kill $(lsof -t -i:5173)
```

### 访问地址速查

#### 局域网模式
- 后端API: http://192.168.1.118:3000
- API文档: http://192.168.1.118:3000/api/docs
- 管理后台: http://192.168.1.118:5173

#### 本地模式
- 后端API: http://localhost:3000
- API文档: http://localhost:3000/api/docs
- 管理后台: http://localhost:5173

### 配置文件速查

| 组件 | 局域网配置 | 本地配置 |
|------|-----------|---------|
| 后端 | `backend/.env.lan` | `backend/.env.local` |
| 前端 | `admin/.env.lan` | `admin/.env.local` |
| 小程序 | `miniprogram/config/index.lan.js` | `miniprogram/config/index.local.js` |

---

## 🎯 最佳实践

### 开发流程

1. **启动服务**
   ```bash
   # 根据场景选择启动脚本
   ./start-lan.sh 或 ./start-local.sh
   ```

2. **确认服务状态**
   ```bash
   ./status-all.sh
   ```

3. **开始开发**
   - 后端：修改代码后自动重启（热重载）
   - 前端：修改代码后自动刷新（热重载）
   - 小程序：在HBuilderX中开发和调试

4. **结束开发**
   ```bash
   ./stop-all.sh
   ```

### 团队协作

1. **不要提交 `.env` 文件到版本控制**
   - `.env` 文件已在 `.gitignore` 中
   - 只提交 `.env.lan` 和 `.env.local` 模板

2. **统一使用启动脚本**
   - 避免手动修改配置文件
   - 确保团队成员使用相同的配置

3. **记录环境差异**
   - 如有特殊配置，在项目文档中记录
   - 及时同步配置变更

---

## 📞 技术支持

遇到问题请：

1. 查看本文档的故障排查部分
2. 查看日志文件：`/tmp/music-platform/`
3. 运行状态检查：`./status-all.sh`
4. 测试数据库连接：`cd backend && node test-db-connection.js`

---

*最后更新：2025-01-16*
*版本：v2.0*
