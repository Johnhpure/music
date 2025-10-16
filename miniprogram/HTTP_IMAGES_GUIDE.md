# 小程序HTTP图片处理指南

## 问题描述

小程序环境不再支持HTTP协议的图片，只支持HTTPS协议。当后台API返回HTTP协议的图片URL时，会出现以下错误：
```
图片链接 http://192.168.1.118:3000/uploads/xxx.png 不再支持 HTTP 协议，请升级到 HTTPS
```

## 解决方案

### 1. 生产环境（推荐）
配置后端服务器支持HTTPS：
```bash
# 使用Let's Encrypt免费SSL证书
sudo certbot --nginx -d yourdomain.com

# 或配置反向代理
# nginx配置示例：
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /uploads/ {
        proxy_pass http://localhost:3000;
    }
}
```

### 2. 开发环境临时方案
在HBuilderX中配置允许HTTP图片（仅限开发调试）：

1. 打开 `manifest.json`
2. 找到 "mp-weixin" 配置
3. 添加或修改 `setting` 配置：
```json
{
  "mp-weixin": {
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true
    }
  }
}
```

### 3. 当前采用的策略
应用中已实现以下处理机制：

#### Banner图片
- ✅ 显示API配置的真实Banner图片
- ✅ 自动将HTTP协议转换为HTTPS
- ✅ 图片加载失败时使用本地备用图片
- ✅ 提供详细的错误日志

#### 音乐封面
- ✅ 使用本地静态图片池（避免HTTP问题）
- ✅ 保证小程序环境下的稳定性

## 配置检查

检查以下文件确保配置正确：

### 1. manifest.json
```json
{
  "mp-weixin": {
    "setting": {
      "urlCheck": false  // 开发环境允许HTTP
    }
  }
}
```

### 2. 后端CORS配置
确保后端支持小程序域名：
```javascript
app.use(cors({
  origin: ['https://servicewechat.com'],
  credentials: true
}));
```

## 测试验证

1. **开发环境测试**：
   ```bash
   # 启动后端服务
   npm run dev
   
   # 在HBuilderX中编译小程序
   # 检查控制台是否有HTTP警告
   ```

2. **生产环境部署**：
   ```bash
   # 确保所有图片URL都是HTTPS
   curl -I https://yourdomain.com/uploads/test.jpg
   ```

## 常见问题

### Q: 为什么Banner要显示API图片而不是本地图片？
A: Banner是管理员动态配置的营销内容，需要实时反映后台的配置。

### Q: 音乐封面为什么使用本地图片？
A: 音乐封面数量多，使用本地图片池可以避免HTTP协议问题并提升加载速度。

### Q: 如何在生产环境解决HTTP问题？
A: 配置HTTPS服务器或使用CDN服务（如阿里云OSS、腾讯云COS）。

## 推荐架构

```
小程序 <-- HTTPS --> CDN/OSS <-- 后端API
                      ↑
                   上传图片存储
```

这样可以确保所有图片都通过HTTPS访问，完全兼容小程序环境。
