# 环境切换指南

本项目提供了两个环境切换脚本，便于在本地局域网开发和公网环境之间快速切换。

## 📋 概述

- **本地局域网环境**: 适用于局域网内开发调试
- **公网环境**: 适用于通过 Cloudflare Tunnel 进行公网访问和调试

## 🚀 快速开始

### 本地局域网环境

```bash
# 切换到本地局域网配置
./start-local.sh

# 重启服务
./restart-backend.sh    # 重启后端
./restart-admin.sh      # 重启管理后台
```

### 公网环境

```bash
# 切换到公网配置
./start-public.sh

# 重启服务
./restart-backend.sh    # 重启后端
./restart-admin.sh      # 重启管理后台
```

## 🔧 环境配置详情

### 本地局域网环境 (start-local.sh)

| 组件 | 配置 |
|------|------|
| 后端API | http://192.168.1.118:3000 |
| 管理后台 | http://192.168.1.118:5173 |
| 小程序API | http://192.168.1.118:3000/api |
| 数据库 | 172.17.0.3:3306 (Docker) |
| Redis | 172.17.0.2:6379 (Docker) |

**适用场景：**
- 局域网内开发调试
- 局域网内其他设备访问（如：手机、平板）
- 微信开发者工具编译小程序
- 无需公网访问时

**访问方式：**
- 管理后台：浏览器访问 `http://192.168.1.118:5173`
- API接口：`http://192.168.1.118:3000/api`

### 公网环境 (start-public.sh)

| 组件 | 公网域名 | 本地地址 |
|------|---------|----------|
| 后端API | https://adminapi.jianzhile.vip | http://192.168.1.118:3000 |
| 管理后台 | https://admin.jianzhile.vip | http://192.168.1.118:5173 |
| 小程序API | https://adminapi.jianzhile.vip/api | - |
| 数据库 | 172.17.0.3:3306 (Docker) | - |
| Redis | 172.17.0.2:6379 (Docker) | - |

**适用场景：**
- 需要公网访问时
- 远程开发调试
- 跨地域协作
- 微信小程序真机调试（需要 HTTPS）

**访问方式：**
- 管理后台：浏览器访问 `https://admin.jianzhile.vip`
- API接口：`https://adminapi.jianzhile.vip/api`

**前置条件：**
- Cloudflare Tunnel 服务必须正在运行
- 域名解析配置正确
- SSL 证书配置正确

## 📝 配置文件说明

脚本会自动修改以下配置文件：

### 1. 后端配置 (backend/.env)

```bash
# 修改前端允许访问的域名列表
FRONTEND_URL=...
```

### 2. 管理后台配置 (admin/.env.local)

```bash
# 修改API基础地址
VITE_API_BASE_URL=...
```

### 3. Vite 配置 (admin/vite.config.ts)

- 开发服务器配置
- 代理配置
- HMR 配置（仅公网）
- 允许的主机名（仅公网）

### 4. 小程序配置 (miniprogram/config/index.js)

```javascript
// 修改后端API地址
const devApiAddress = '...'
```

## 🔐 配置备份

每次运行切换脚本时，都会自动备份当前配置到 `.config-backups/` 目录：

```bash
.config-backups/
├── backend.env.backup.20241015_213000
├── admin.env.local.backup.20241015_213000
├── vite.config.ts.backup.20241015_213000
└── miniprogram.config.backup.20241015_213000
```

如需恢复配置，可以从备份目录手动复制。

## ⚠️ 注意事项

### 公网环境注意事项

1. **Cloudflare Tunnel 必须运行**
   ```bash
   # 检查服务状态
   ps aux | grep cloudflared
   
   # 启动 Tunnel
   cloudflared tunnel run
   ```

2. **域名解析配置**
   - 确保域名已正确解析
   - Cloudflare Tunnel 配置文件已正确设置

3. **SSL 证书**
   - Cloudflare 会自动处理 SSL
   - 确保使用 HTTPS 协议

### 本地环境注意事项

1. **防火墙设置**
   - 确保端口 3000 和 5173 已开放
   - 局域网设备可以访问本机

2. **局域网IP**
   - 确认本机 IP 是 192.168.1.118
   - 如有变化，需修改脚本中的 IP 地址

3. **Docker 服务**
   - 确保数据库和 Redis 容器正在运行
   - 容器 IP 不变

## 🔄 切换流程

### 完整切换流程：

```bash
# 1. 切换环境配置
./start-local.sh    # 或 ./start-public.sh

# 2. 重启后端服务
./restart-backend.sh

# 3. 重启管理后台
./restart-admin.sh

# 4. （可选）重新编译小程序
# 在微信开发者工具中点击"编译"
```

## 🐛 故障排查

### 切换后无法访问

1. **检查服务状态**
   ```bash
   # 检查后端
   curl http://192.168.1.118:3000/api/health
   
   # 检查管理后台
   curl http://192.168.1.118:5173
   ```

2. **查看服务日志**
   ```bash
   # 后端日志
   cd backend && npm run dev
   
   # 管理后台日志
   cd admin && npm run dev
   ```

3. **检查配置文件**
   ```bash
   # 验证配置是否正确修改
   cat backend/.env
   cat admin/.env.local
   cat miniprogram/config/index.js
   ```

### 公网环境特定问题

1. **Cloudflare Tunnel 未运行**
   ```bash
   # 启动 Tunnel
   cloudflared tunnel run
   ```

2. **域名无法访问**
   - 检查 DNS 解析
   - 检查 Tunnel 配置文件
   - 检查 Cloudflare Dashboard

3. **CORS 错误**
   - 检查 backend/.env 中的 FRONTEND_URL
   - 确保域名已添加到白名单

### 本地环境特定问题

1. **局域网设备无法访问**
   - 检查防火墙设置
   - 确认本机 IP 地址
   - 测试端口连通性

2. **小程序无法连接**
   - 确认 miniprogram/config/index.js 配置正确
   - 在微信开发者工具中重新编译
   - 检查网络连接

## 📊 环境对比表

| 特性 | 本地局域网 | 公网环境 |
|------|-----------|---------|
| 访问范围 | 局域网内 | 全球可访问 |
| 协议 | HTTP | HTTPS |
| Tunnel 需求 | 不需要 | 必须 |
| SSL 证书 | 不需要 | 自动处理 |
| 适用场景 | 本地开发 | 远程调试 |
| 微信小程序真机 | 需配置合法域名 | 支持 |

## 🎯 最佳实践

1. **日常开发**: 使用本地局域网环境，速度快，无延迟
2. **真机测试**: 切换到公网环境，使用 HTTPS
3. **远程协作**: 使用公网环境，团队成员可远程访问
4. **提交代码前**: 确保在本地环境测试通过

## 📞 技术支持

如遇问题，请检查：
1. 配置备份文件
2. 服务日志
3. 网络连接状态
4. Cloudflare Tunnel 状态（公网环境）

---

**脚本版本**: 1.0.0  
**最后更新**: 2024-10-15
