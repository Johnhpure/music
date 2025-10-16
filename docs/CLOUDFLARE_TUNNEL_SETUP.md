# Cloudflare Tunnel 公网调试配置指南

## 📊 当前端口信息

| 服务 | 端口 | 状态 | 说明 |
|------|------|------|------|
| 管理后台前端 | 5173 | ✅ 运行中 | Vite开发服务器 |
| 后端API | 3000 | ✅ 运行中 | NestJS应用 |
| MySQL | 3308 | ✅ 运行中 | Docker容器映射 |
| Redis | 6379 | ✅ 运行中 | Docker容器 |

---

## 🎯 推荐配置方案

### 方案一：映射前端+API（推荐）⭐

**需要映射的端口：**
1. **5173** -> `admin.jianzhile.vip` (管理后台前端)
2. **3000** -> `api.jianzhile.vip` (后端API)

**优点：**
- ✅ 前后端完全分离
- ✅ API可独立访问和测试
- ✅ 符合生产环境架构
- ✅ 便于后续扩展

**配置步骤：** 见下文详细步骤

---

### 方案二：仅映射前端（备选）

**需要映射的端口：**
1. **5173** -> `admin.jianzhile.vip` (管理后台前端)

**注意：**
- ⚠️ 前端需要直接访问本地API（可能存在跨域问题）
- ⚠️ 需要本地网络保持稳定
- ⚠️ 不推荐用于正式调试

---

## 🔧 方案一详细配置步骤

### 第一步：配置 Cloudflare Tunnel

#### 1. 创建两条隧道规则

```yaml
# cloudflared 配置示例
tunnel: <your-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  # 管理后台前端
  - hostname: admin.jianzhile.vip
    service: http://localhost:5173
  
  # 后端API
  - hostname: api.jianzhile.vip
    service: http://localhost:3000
  
  # 默认规则（必需）
  - service: http_status:404
```

#### 2. DNS配置

在Cloudflare DNS中添加两条CNAME记录：
- `admin.jianzhile.vip` -> `<tunnel-id>.cfargotunnel.com`
- `api.jianzhile.vip` -> `<tunnel-id>.cfargotunnel.com`

---

### 第二步：配置后端CORS

#### 1. 修改 `.env` 文件

```bash
cd /home/chenbang/app/music/music_platform-master/backend
```

编辑 `.env` 文件，修改 `FRONTEND_URL`：

**修改前：**
```env
FRONTEND_URL=http://localhost:8080
```

**修改后：**
```env
FRONTEND_URL=https://admin.jianzhile.vip,http://localhost:5173,http://localhost:8080
```

#### 2. 重启后端服务

```bash
# 找到正在运行的NestJS进程
ps aux | grep "nest start" | grep -v grep

# 停止进程（替换<PID>为实际进程ID）
kill <PID>

# 重新启动
npm run start:dev
```

---

### 第三步：配置管理后台API地址

#### 选项A：使用环境变量（推荐）

创建 `admin/.env.production` 文件：

```bash
cd /home/chenbang/app/music/music_platform-master/admin
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://api.jianzhile.vip/api
EOF
```

#### 选项B：修改源代码

编辑 `admin/src/api/index.ts`：

**修改前：**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.118:3000/api'
```

**修改后：**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'admin.jianzhile.vip' 
    ? 'https://api.jianzhile.vip/api' 
    : 'http://localhost:3000/api')
```

#### 重启前端服务

```bash
# 找到正在运行的Vite进程
ps aux | grep "vite" | grep 5173

# 停止进程
kill <PID>

# 重新启动（使用生产模式）
npm run dev -- --mode production
```

---

### 第四步：启动 Cloudflare Tunnel

```bash
# 启动隧道
cloudflared tunnel run <your-tunnel-name>

# 或使用配置文件
cloudflared tunnel --config /path/to/config.yml run
```

---

### 第五步：验证配置

#### 1. 检查DNS解析
```bash
nslookup admin.jianzhile.vip
nslookup api.jianzhile.vip
```

#### 2. 测试后端API
```bash
curl -I https://api.jianzhile.vip/api/public/banner
```

应该返回 HTTP 200 响应。

#### 3. 访问管理后台
在浏览器打开：`https://admin.jianzhile.vip`

#### 4. 测试登录功能
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 尝试登录
4. 检查API请求是否正确发送到 `https://api.jianzhile.vip`

---

## 🔒 安全建议

### 1. API访问控制

在 `.env` 中添加：
```env
# 限制只允许特定域名访问
FRONTEND_URL=https://admin.jianzhile.vip

# 生产环境关闭调试模式
NODE_ENV=production
LOG_LEVEL=warn
```

### 2. 启用HTTPS（Cloudflare自动处理）

Cloudflare Tunnel 会自动提供SSL证书，但确保：
- ✅ 使用 `https://` 而不是 `http://`
- ✅ 在后端CORS中配置正确的HTTPS域名

### 3. 限制访问IP（可选）

可以在Cloudflare Dashboard中配置访问规则：
- 限制只允许特定IP访问
- 添加防火墙规则
- 启用Bot保护

---

## 🐛 常见问题排查

### 问题1：CORS错误

**现象：** 浏览器控制台显示 `Access-Control-Allow-Origin` 错误

**解决：**
1. 检查后端 `.env` 中的 `FRONTEND_URL` 是否包含 `https://admin.jianzhile.vip`
2. 确保后端已重启
3. 检查浏览器请求头中的 Origin

### 问题2：API请求404

**现象：** 所有API请求返回404

**解决：**
1. 检查API地址是否包含 `/api` 前缀
2. 正确格式：`https://api.jianzhile.vip/api/xxx`
3. 检查 Cloudflare Tunnel 是否正确映射3000端口

### 问题3：无法访问管理后台

**现象：** `https://admin.jianzhile.vip` 打不开

**解决：**
1. 检查 Cloudflare Tunnel 是否运行
2. 检查DNS是否正确解析
3. 检查本地5173端口是否在监听
4. 查看 cloudflared 日志

### 问题4：Token验证失败

**现象：** 登录后立即被踢出

**解决：**
1. 检查JWT配置是否正确
2. 确保前后端时间同步
3. 检查浏览器是否允许跨域Cookie

---

## 📝 快速配置命令

```bash
# 一键配置后端CORS
cd /home/chenbang/app/music/music_platform-master/backend
sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://admin.jianzhile.vip,http://localhost:5173|' .env

# 创建前端环境变量
cd /home/chenbang/app/music/music_platform-master/admin
echo "VITE_API_BASE_URL=https://api.jianzhile.vip/api" > .env.production

# 重启服务（需要先停止现有进程）
# 后端
cd /home/chenbang/app/music/music_platform-master/backend
npm run start:dev &

# 前端
cd /home/chenbang/app/music/music_platform-master/admin
npm run dev -- --mode production &
```

---

## 📊 数据库访问说明

### 是否需要映射数据库端口？

**答案：❌ 不需要**

**原因：**
1. 后端API运行在本地服务器
2. 数据库也在本地Docker容器
3. 后端可以直接通过Docker内部网络访问数据库
4. 配置：`DB_HOST=172.17.0.3`（Docker内部IP）

**数据库连接流程：**
```
公网用户
  ↓ HTTPS
admin.jianzhile.vip (5173端口)
  ↓ HTTPS
api.jianzhile.vip (3000端口)
  ↓ 本地网络
MySQL容器 (172.17.0.3:3306)
```

### 如果需要远程管理数据库

如果你需要从其他地方直接连接数据库（如使用Navicat），可以考虑：

**选项1：SSH隧道（推荐）**
```bash
ssh -L 3308:localhost:3308 user@your-server-ip
```

**选项2：Cloudflare Tunnel（可选）**
- 映射端口3308
- 域名：`db.jianzhile.vip`
- ⚠️ 注意：需要额外的安全措施（IP白名单、防火墙规则）

---

## ✅ 配置检查清单

部署前检查：
- [ ] Cloudflare Tunnel 已配置两条规则
- [ ] DNS记录已添加（admin、api）
- [ ] 后端 `.env` 已更新 `FRONTEND_URL`
- [ ] 管理后台API地址已配置
- [ ] 后端服务已重启
- [ ] 前端服务已重启
- [ ] Cloudflare Tunnel 已启动

部署后验证：
- [ ] `https://admin.jianzhile.vip` 可以访问
- [ ] `https://api.jianzhile.vip/api/public/banner` 返回数据
- [ ] 浏览器控制台无CORS错误
- [ ] 可以正常登录
- [ ] 可以调用受保护的API
- [ ] 文件上传功能正常

---

## 🎉 完成！

配置完成后，你应该能够：
- ✅ 通过 `https://admin.jianzhile.vip` 访问管理后台
- ✅ 管理后台可以正常调用API
- ✅ 所有功能正常工作（登录、数据管理等）
- ✅ 其他人也可以通过公网访问（如果需要）

**下一步：**
- 开始调试和测试
- 监控日志和错误
- 根据需要调整配置

---

**文档版本**: v1.0  
**创建时间**: 2025-10-15  
**适用环境**: 开发/测试环境
