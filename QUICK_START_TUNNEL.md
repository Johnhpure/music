# 🚀 Cloudflare Tunnel 快速启动指南

## ✅ 配置已完成

我已经为你完成了所有必要的配置修改，现在可以直接使用！

---

## 📊 端口信息

| 服务 | 端口 | 映射域名 | 状态 | 说明 |
|------|------|----------|------|------|
| **管理后台** | 5173 | **admin.jianzhile.vip** | ✅ 需要映射 | Vite开发服务器 |
| **后端API** | 3000 | **api.jianzhile.vip** | ✅ 需要映射 | NestJS应用 |
| MySQL | 3308 | - | ❌ 不需要映射 | 本地访问即可 |
| Redis | 6379 | - | ❌ 不需要映射 | 本地访问即可 |

---

## 🎯 你需要做的事

### 第一步：配置 Cloudflare Tunnel

#### 方法A：使用Web界面（推荐新手）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择域名 `jianzhile.vip`
3. 进入 **Zero Trust** → **Access** → **Tunnels**
4. 创建或编辑你的Tunnel
5. 添加两条 Public Hostname 规则：

**规则1：管理后台**
```
Subdomain: admin
Domain: jianzhile.vip
Service: HTTP
URL: localhost:5173
```

**规则2：后端API**
```
Subdomain: api  
Domain: jianzhile.vip
Service: HTTP
URL: localhost:3000
```

6. 保存配置

#### 方法B：使用配置文件（推荐高级用户）

我已经为你创建了配置文件：`CLOUDFLARE_TUNNEL_CONFIG.yml`

1. 编辑文件，替换以下内容：
   - `<your-tunnel-id>` → 你的Tunnel ID
   - `<your-credentials-file>` → 你的凭证文件路径

2. 运行Tunnel：
```bash
cloudflared tunnel --config CLOUDFLARE_TUNNEL_CONFIG.yml run
```

---

### 第二步：启动服务

**选项A：使用快速重启脚本（推荐）**

```bash
cd /home/chenbang/app/music/music_platform-master
./restart-services.sh
```

这个脚本会：
- ✅ 停止旧的服务
- ✅ 启动新的后端和前端
- ✅ 自动验证服务状态
- ✅ 显示进程ID和日志路径

**选项B：手动启动**

```bash
# 后端（新终端）
cd /home/chenbang/app/music/music_platform-master/backend
npm run start:dev

# 前端（新终端）
cd /home/chenbang/app/music/music_platform-master/admin
npm run dev -- --host 0.0.0.0
```

---

### 第三步：启动 Cloudflare Tunnel

```bash
# 如果使用配置文件
cloudflared tunnel --config CLOUDFLARE_TUNNEL_CONFIG.yml run

# 或直接运行（如果已通过Web界面配置）
cloudflared tunnel run <your-tunnel-name>
```

---

### 第四步：测试访问

#### 1. 测试后端API
```bash
curl https://api.jianzhile.vip/api/public/banner
```

应该返回JSON数据。

#### 2. 访问管理后台
在浏览器打开：
```
https://admin.jianzhile.vip
```

#### 3. 检查API配置
- 打开浏览器开发者工具（F12）
- 切换到 Network 标签
- 在管理后台操作（如登录）
- 检查API请求是否发送到 `https://api.jianzhile.vip/api/*`

---

## 🎉 完成！

如果一切正常，你应该能看到：
- ✅ 管理后台界面加载成功
- ✅ API请求发送到 `https://api.jianzhile.vip`
- ✅ 无CORS错误
- ✅ 可以正常登录和操作

---

## ❓ 常见问题

### Q1: 需要映射数据库端口吗？

**答：不需要！❌**

数据库在本地Docker容器中，后端API也在本地服务器上，它们通过Docker内部网络直接通信。只有前端需要通过公网访问后端API。

**架构图：**
```
公网用户
  ↓ HTTPS
admin.jianzhile.vip (前端)
  ↓ HTTPS
api.jianzhile.vip (后端)
  ↓ Docker内部网络
MySQL + Redis (本地)
```

### Q2: 如果远程管理数据库？

如果你确实需要从其他电脑连接数据库（如使用Navicat），有两个选择：

**方案1：SSH隧道（推荐）**
```bash
ssh -L 3308:localhost:3308 user@your-server-ip
```

**方案2：再映射一个端口（不推荐，有安全风险）**
- 映射端口3308到公网
- 域名：`db.jianzhile.vip`
- ⚠️ 务必添加IP白名单和防火墙规则

### Q3: CORS错误怎么办？

**已解决！** 我已经配置了CORS允许以下域名：
- `https://admin.jianzhile.vip`
- `http://localhost:5173`
- `http://localhost:8080`

如果还有问题，检查：
1. 后端服务是否重启
2. `.env` 文件中的 `FRONTEND_URL` 是否正确
3. 浏览器控制台的具体错误信息

### Q4: API请求404？

确保：
- ✅ API地址包含 `/api` 前缀
- ✅ 正确格式：`https://api.jianzhile.vip/api/xxx`
- ✅ Cloudflare Tunnel正确映射了3000端口

---

## 📝 配置更改摘要

我为你做了以下配置修改：

### 1. 后端CORS配置
**文件**: `backend/.env`
```env
FRONTEND_URL=https://admin.jianzhile.vip,http://localhost:5173,http://localhost:8080
```

### 2. 管理后台API配置
**文件**: `admin/src/api/index.ts`
- ✅ 自动根据域名切换API地址
- ✅ 本地开发：`http://localhost:3000/api`
- ✅ 公网访问：`https://api.jianzhile.vip/api`

### 3. 环境变量文件
**创建**: `admin/.env.production`
```env
VITE_API_BASE_URL=https://api.jianzhile.vip/api
```

**创建**: `admin/.env.local`
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Cloudflare配置文件
**创建**: `CLOUDFLARE_TUNNEL_CONFIG.yml`
- ✅ 管理后台映射配置
- ✅ 后端API映射配置
- ✅ 日志和连接优化

### 5. 服务管理脚本
**创建**: `restart-services.sh`
- ✅ 一键重启前后端服务
- ✅ 自动验证服务状态
- ✅ 显示日志路径

---

## 🛠️ 实用命令

```bash
# 查看服务状态
ps aux | grep "nest start"
ps aux | grep "vite"

# 查看端口占用
netstat -tlnp | grep -E ":(3000|5173)"

# 重启服务
./restart-services.sh

# 查看后端日志
tail -f /tmp/backend.log

# 查看前端日志  
tail -f /tmp/frontend.log

# 测试API
curl https://api.jianzhile.vip/api/public/banner

# 测试管理后台
curl -I https://admin.jianzhile.vip
```

---

## 🔒 安全提示

✅ 已配置：
- CORS白名单限制
- HTTPS加密传输（Cloudflare自动提供）
- JWT认证机制

💡 建议：
- 定期更换JWT密钥
- 监控异常访问日志
- 在Cloudflare中配置WAF规则
- 考虑添加访问频率限制

---

## 📞 需要帮助？

如果遇到问题：
1. 检查服务日志：`/tmp/backend.log` 和 `/tmp/frontend.log`
2. 查看Cloudflare Tunnel日志
3. 检查浏览器控制台错误
4. 参考详细文档：`docs/CLOUDFLARE_TUNNEL_SETUP.md`

---

**配置完成时间**: 2025-10-15  
**配置人**: AI Droid  
**环境**: 开发/测试环境  
**域名**: admin.jianzhile.vip, api.jianzhile.vip
