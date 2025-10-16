# 管理后台环境配置说明

## 环境模式

项目支持三种环境模式：

### 1. 开发环境 (dev)
```bash
pnpm run dev
```
- 端口：5173
- 配置文件：`.env.local`
- 用途：本地开发调试

### 2. 测试环境 (test)
```bash
pnpm run test
```
- 端口：5174
- 配置文件：`.env.test`
- 用途：测试环境调试

### 3. 生产环境 (production)
```bash
pnpm run build
```
- 配置文件：`.env.production`
- 用途：生产环境构建

## 环境变量配置

### .env.local (开发环境)
```bash
VITE_API_BASE_URL=https://adminapi.jianzhile.vip/api
```

### .env.test (测试环境)
```bash
VITE_API_BASE_URL=http://192.168.1.118:3000/api
```

### .env.production (生产环境)
```bash
VITE_API_BASE_URL=https://adminapi.jianzhile.vip/api
```

## 配置优化

### 已修复的问题

✅ **端口冲突问题**
- dev模式使用 5173 端口
- test模式使用 5174 端口
- strictPort 改为 false，允许端口冲突时自动使用其他端口

✅ **代理配置**
- 自动从环境变量读取API地址
- 支持不同环境使用不同的后端地址

✅ **环境变量加载**
- 使用 vite 的 loadEnv 正确加载不同模式的环境变量

## 启动命令

```bash
# 开发环境
pnpm run dev        # http://localhost:5173

# 测试环境  
pnpm run test       # http://localhost:5174

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview
```

## 停止服务

```bash
# 查看端口占用
lsof -i:5173
lsof -i:5174

# 停止指定端口的进程
kill $(lsof -t -i:5173)
kill $(lsof -t -i:5174)

# 或使用项目根目录的停止脚本
cd .. && ./stop-dev-linux.sh
```

## 常见问题

### Q: 端口被占用怎么办？

A: vite会自动尝试使用下一个可用端口，或手动停止占用端口的进程：
```bash
kill $(lsof -t -i:5173)  # 停止dev进程
kill $(lsof -t -i:5174)  # 停止test进程
```

### Q: API请求失败？

A: 检查以下几点：
1. 后端服务是否运行
2. `.env.*` 文件中的API地址是否正确
3. 网络是否可以访问后端地址
4. 查看浏览器控制台的网络请求详情

### Q: 如何切换不同的后端地址？

A: 修改对应的 `.env.*` 文件中的 `VITE_API_BASE_URL`：
```bash
# 本地后端
VITE_API_BASE_URL=http://localhost:3000/api

# 局域网后端
VITE_API_BASE_URL=http://192.168.1.118:3000/api

# 远程后端
VITE_API_BASE_URL=https://adminapi.jianzhile.vip/api
```

### Q: 环境变量不生效？

A: 环境变量修改后需要重启vite服务：
1. 按 `Ctrl+C` 停止当前服务
2. 重新运行 `pnpm run dev` 或 `pnpm run test`

## 技术细节

### vite.config.ts 配置
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = mode === 'test' ? 5174 : 5173
  
  return {
    server: {
      port: port,
      strictPort: false,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL?.replace('/api', ''),
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
```

### 环境变量优先级
1. `.env.[mode].local` (最高优先级)
2. `.env.[mode]`
3. `.env.local`
4. `.env`

## 推荐工作流

### 开发流程
1. 启动后端服务：`cd ../backend && npm run start:dev`
2. 启动前端开发：`pnpm run dev`
3. 浏览器访问：http://localhost:5173

### 测试流程
1. 确保测试环境后端运行
2. 启动前端测试：`pnpm run test`
3. 浏览器访问：http://localhost:5174

### 部署流程
1. 修改 `.env.production` 为生产环境API地址
2. 构建：`pnpm run build`
3. 预览：`pnpm run preview`
4. 部署 `dist/` 目录到服务器

---

*最后更新: 2025-01-16*
