# AI音乐平台测试指南

本文档说明如何使用自动化测试工具对系统进行全面测试。

---

## 📋 测试脚本说明

### 1. 快速测试 (推荐日常使用)

**脚本路径**: `backend/quick-test.sh`

**特点**:
- ✅ 15项核心测试
- ✅ 执行时间 < 1分钟
- ✅ 覆盖所有关键功能
- ✅ 自动生成测试报告

**使用方法**:
```bash
cd backend
chmod +x quick-test.sh
./quick-test.sh
```

**测试内容**:
1. 数据库层 (2项)
   - MySQL连接
   - Redis连接

2. 认证模块 (2项)
   - 用户注册
   - 用户登录

3. 用户API (3项)
   - 获取用户信息
   - 查询用户积分
   - 查询文件列表

4. 公开API (3项)
   - 热门推荐
   - Prompt模板
   - Banner列表

5. 系统健康 (3项)
   - 前端服务
   - 后端服务
   - Docker容器

6. 数据完整性 (2项)
   - 数据库表数量
   - 用户数据

---

### 2. 完整测试 (深度测试)

**脚本路径**: `backend/automated-test.sh`

**特点**:
- ✅ 40+项详细测试
- ✅ 包含边界条件和异常场景
- ✅ 详细的错误日志
- ✅ 完整的性能指标

**使用方法**:
```bash
cd backend
chmod +x automated-test.sh
./automated-test.sh
```

**额外测试内容**:
- 数据库表结构验证
- Redis基础操作测试
- 重复注册验证
- 错误凭证登录
- AI功能端点
- 音乐任务管理
- 管理后台权限控制
- 前端API配置兼容性

---

## 📊 测试报告

### 报告位置
测试报告自动生成在 `docs/` 目录下：
```
docs/AUTOMATED_TEST_REPORT_YYYYMMDD_HHMMSS.md
```

### 报告内容
1. **测试摘要**
   - 总测试数
   - 通过/失败数量
   - 通过率

2. **详细结果**
   - 每个测试用例的状态
   - 执行时间
   - 错误信息（如果有）

3. **环境信息**
   - 操作系统
   - 数据库版本
   - 服务端口
   - Docker状态

4. **改进建议**
   - 发现的问题
   - 优化方向

### 查看最新报告
```bash
# 查看最新的测试报告
ls -lt docs/AUTOMATED_TEST_REPORT_*.md | head -1 | awk '{print $NF}' | xargs cat
```

---

## 🔧 测试前准备

### 1. 确保服务运行
```bash
# 检查Docker容器
docker ps | grep ai_music

# 检查后端服务
ps aux | grep "nest start"

# 检查前端服务
curl -s http://localhost:5173 > /dev/null && echo "前端正常" || echo "前端异常"
```

### 2. 检查网络连通性
```bash
# 测试后端API
curl -s http://localhost:3000/api/public/banner

# 测试数据库
docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 -e "SELECT 1"

# 测试Redis
docker exec ai_music_redis redis-cli ping
```

---

## 📈 测试结果解读

### 通过率标准
- **90-100%**: ✅ 优秀 - 系统运行良好
- **80-89%**: 🟡 良好 - 有小问题需要修复
- **70-79%**: 🟠 一般 - 需要关注和改进
- **< 70%**: 🔴 差 - 需要立即处理

### 常见失败原因

#### 1. 数据库连接失败
**现象**: MySQL或Redis连接测试失败  
**排查**:
```bash
# 检查容器状态
docker ps | grep ai_music

# 检查容器日志
docker logs ai_music_mysql_simple
docker logs ai_music_redis

# 重启容器
docker restart ai_music_mysql_simple ai_music_redis
```

#### 2. API测试失败
**现象**: HTTP请求返回4xx或5xx错误  
**排查**:
```bash
# 查看后端日志
cd backend
npm run start:dev  # 查看实时日志

# 检查环境变量
cat .env | grep -E "DB_|REDIS_"

# 手动测试API
curl -v http://localhost:3000/api/public/banner
```

#### 3. 认证测试失败
**现象**: 注册或登录返回错误  
**排查**:
```bash
# 检查JWT配置
grep JWT_SECRET backend/.env

# 查看用户表
docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 ai_music_platform -e "SELECT * FROM t_users LIMIT 5"

# 测试手动注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123456","phone":"13800138000"}'
```

#### 4. 前端测试失败
**现象**: 管理后台不可访问  
**排查**:
```bash
# 检查Vite进程
ps aux | grep vite

# 检查端口占用
netstat -tlnp | grep 5173

# 重启前端
cd admin
npm run dev
```

---

## 🚀 CI/CD集成

### GitHub Actions 示例
```yaml
name: Automated Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Start Docker services
      run: |
        docker-compose up -d
        sleep 10
    
    - name: Install dependencies
      run: |
        cd backend
        npm install
    
    - name: Start backend
      run: |
        cd backend
        npm run start:dev &
        sleep 10
    
    - name: Run tests
      run: |
        cd backend
        ./quick-test.sh
    
    - name: Upload test report
      uses: actions/upload-artifact@v2
      if: always()
      with:
        name: test-report
        path: docs/AUTOMATED_TEST_REPORT_*.md
```

### GitLab CI 示例
```yaml
stages:
  - test

automated-test:
  stage: test
  script:
    - docker-compose up -d
    - sleep 10
    - cd backend && npm install
    - npm run start:dev &
    - sleep 10
    - ./quick-test.sh
  artifacts:
    paths:
      - docs/AUTOMATED_TEST_REPORT_*.md
    when: always
```

---

## 📝 定期测试建议

### 测试频率

| 场景 | 建议频率 | 使用脚本 |
|------|---------|---------|
| 日常开发 | 每天1次 | quick-test.sh |
| 功能开发完成 | 每个功能 | automated-test.sh |
| 代码提交前 | 每次提交 | quick-test.sh |
| 发版前验证 | 每次发版 | automated-test.sh |
| 生产环境验证 | 每周1次 | quick-test.sh |

### 测试检查清单

**开发阶段** ✅
- [ ] 代码修改后运行快速测试
- [ ] 新功能开发完成运行完整测试
- [ ] 提交PR前确保测试通过

**测试阶段** ✅
- [ ] 每日回归测试
- [ ] 集成测试环境全量测试
- [ ] 性能测试（可选）

**发布阶段** ✅
- [ ] 预发布环境完整测试
- [ ] 生产环境冒烟测试
- [ ] 监控告警验证

---

## 🐛 问题反馈

### 测试失败时
1. 复制完整的测试输出
2. 查看生成的测试报告
3. 检查系统日志
4. 提交Issue时附上:
   - 测试报告文件
   - 测试输出日志
   - 环境信息
   - 复现步骤

### 脚本问题
如果测试脚本本身有问题：
```bash
# 启用调试模式
bash -x backend/quick-test.sh

# 查看脚本权限
ls -l backend/*.sh

# 检查脚本格式
file backend/quick-test.sh
```

---

## 🔗 相关文档

- [综合测试总结](./COMPREHENSIVE_TEST_SUMMARY.md) - 详细的测试分析报告
- [最新测试报告](./AUTOMATED_TEST_REPORT_*.md) - 自动生成的测试报告
- [API文档](http://localhost:3000/api-docs) - Swagger API文档
- [开发文档](../README.md) - 项目整体文档

---

## 💡 最佳实践

1. **测试驱动开发**
   - 新功能开发前先写测试用例
   - 确保测试覆盖率 > 80%

2. **持续集成**
   - 将测试集成到CI/CD流程
   - 自动化测试和部署

3. **定期回归**
   - 每日自动运行测试
   - 及时发现和修复问题

4. **文档同步**
   - 测试用例和文档保持同步
   - 更新代码时同步更新测试

5. **性能基准**
   - 记录关键API的响应时间
   - 建立性能基准线
   - 监控性能退化

---

**文档版本**: v1.0  
**最后更新**: 2025-10-15  
**维护者**: 开发团队
