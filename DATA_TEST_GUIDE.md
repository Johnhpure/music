# 数据功能测试指南

## ✅ 数据清空完成

已成功清空以下数据：

### 📊 数据库表
- ✅ `t_prompt_templates` - 0条记录
- ✅ `t_banners` - 0条记录  
- ✅ `t_hot_recommendations` - 0条记录
- ✅ `t_files` - 0条记录
- ℹ️ `t_recommendation_categories` - 8条记录（保留，这是分类基础数据）

### 📁 文件系统
- ✅ `backend/uploads/` - 已清空所有上传文件
- ✅ 目录结构已重建：`images/`, `audios/`, `videos/`

---

## 🧪 测试计划

### 1️⃣ 提示词管理测试

**测试步骤：**
1. 登录管理后台：`http://localhost:5173`
2. 进入「内容管理」→「提示词管理」
3. 点击「新增提示词」
4. 填写表单：
   - 分类：风格/情绪/主题
   - 标题：例如"流行风格"
   - 内容：例如"创作一首现代流行音乐..."
   - 标签：例如"流行,轻快,年轻"
   - 图标：选择一个图标
   - 排序：1
5. 保存并验证

**预期结果：**
- ✅ 数据成功写入 `t_prompt_templates` 表
- ✅ 列表显示新创建的提示词
- ✅ 可以编辑、删除、启用/禁用

**验证SQL：**
```sql
docker exec ai_music_mysql mysql -u root -proot123456 music_platform -e "SELECT * FROM t_prompt_templates;"
```

---

### 2️⃣ Banner管理测试

**测试步骤：**
1. 准备一张测试图片（建议尺寸：750x300px）
2. 进入「内容管理」→「Banner管理」
3. 点击「新增Banner」
4. 上传图片：
   - 点击上传区域
   - 选择图片文件
   - 等待上传完成（会自动填充image_url）
5. 填写表单：
   - 标题：例如"欢迎使用AI音乐平台"
   - 链接类型：内部/外部/小程序/无
   - 跳转链接：（可选）
   - 排序：1
   - 启用状态：开启
6. 保存并验证

**预期结果：**
- ✅ 图片成功上传到 `backend/uploads/images/2025/10/`
- ✅ 数据写入 `t_banners` 表（包含image_url）
- ✅ 文件记录写入 `t_files` 表
- ✅ 前端可以正常显示Banner图片

**验证命令：**
```bash
# 查看数据库
docker exec ai_music_mysql mysql -u root -proot123456 music_platform -e "SELECT id, title, image_url FROM t_banners;"

# 查看上传的文件
ls -lh /Users/bang/Documents/dev/miniprogram1/music/backend/uploads/images/

# 验证文件记录
docker exec ai_music_mysql mysql -u root -proot123456 music_platform -e "SELECT id, file_name, file_url, file_type FROM t_files;"
```

---

### 3️⃣ 推荐管理测试

**测试步骤：**
1. 准备测试素材：
   - 封面图片（建议：300x300px）
   - 音频文件（MP3格式，建议<10MB）
2. 进入「内容管理」→「推荐管理」
3. 点击「新增推荐」
4. 上传封面图片：
   - 点击封面上传区域
   - 选择图片文件
   - 等待上传完成
5. 上传音频文件：
   - 点击音频上传区域
   - 选择音频文件
   - 等待上传完成
6. 填写表单：
   - 分类：选择一个分类（流行/摇滚/民谣等）
   - 标题：例如"夜空中最亮的星"
   - 艺术家：例如"逃跑计划"
   - 时长：例如"04:32"
   - 描述：（可选）
   - 排序：1
7. 保存并验证

**预期结果：**
- ✅ 封面图片上传到 `backend/uploads/images/2025/10/`
- ✅ 音频文件上传到 `backend/uploads/audios/2025/10/`
- ✅ 数据写入 `t_hot_recommendations` 表（包含coverUrl和audioUrl）
- ✅ 两个文件记录写入 `t_files` 表
- ✅ 前端可以播放音频并显示封面

**验证命令：**
```bash
# 查看数据库
docker exec ai_music_mysql mysql -u root -proot123456 music_platform -e "SELECT id, title, cover_url, audio_url, artist FROM t_hot_recommendations;"

# 查看上传的文件
ls -lh /Users/bang/Documents/dev/miniprogram1/music/backend/uploads/images/
ls -lh /Users/bang/Documents/dev/miniprogram1/music/backend/uploads/audios/

# 验证文件记录
docker exec ai_music_mysql mysql -u root -proot123456 music_platform -e "SELECT id, file_name, file_url, file_type FROM t_files ORDER BY id DESC LIMIT 10;"
```

---

## 🔍 完整性验证

### 测试完成后的验证清单

**数据库验证：**
```bash
docker exec ai_music_mysql mysql -u root -proot123456 music_platform -e "
SELECT 
  't_prompt_templates' as table_name, COUNT(*) as count FROM t_prompt_templates
UNION ALL
SELECT 't_banners', COUNT(*) FROM t_banners
UNION ALL  
SELECT 't_hot_recommendations', COUNT(*) FROM t_hot_recommendations
UNION ALL
SELECT 't_files', COUNT(*) FROM t_files;
"
```

**文件系统验证：**
```bash
echo "=== 图片文件 ==="
find /Users/bang/Documents/dev/miniprogram1/music/backend/uploads/images -type f

echo "=== 音频文件 ==="  
find /Users/bang/Documents/dev/miniprogram1/music/backend/uploads/audios -type f

echo "=== 文件总数 ==="
find /Users/bang/Documents/dev/miniprogram1/music/backend/uploads -type f | wc -l
```

**URL访问验证：**
```bash
# 测试静态文件访问（替换为实际的文件路径）
curl -I http://localhost:3000/uploads/images/2025/10/image_xxx.jpg
curl -I http://localhost:3000/uploads/audios/2025/10/audio_xxx.mp3
```

---

## 📝 测试记录表

| 功能 | 测试时间 | 数据写入 | 文件上传 | 显示正常 | 备注 |
|------|---------|---------|---------|---------|------|
| 提示词管理 | | ⬜ | N/A | ⬜ | |
| Banner管理 | | ⬜ | ⬜ | ⬜ | |
| 推荐管理 | | ⬜ | ⬜ | ⬜ | |

---

## 🚨 常见问题排查

### 问题1：文件上传失败
**原因：** uploads目录权限不足  
**解决：**
```bash
chmod -R 755 /Users/bang/Documents/dev/miniprogram1/music/backend/uploads
```

### 问题2：图片/音频无法访问
**原因：** 静态文件服务未正确配置  
**检查：**
```bash
# 确认后端服务运行中
curl http://localhost:3000/api/health

# 检查静态文件路径
ls -la /Users/bang/Documents/dev/miniprogram1/music/backend/uploads/
```

### 问题3：数据库写入失败
**原因：** 数据库连接问题  
**检查：**
```bash
# 确认MySQL容器运行中
docker ps | grep mysql

# 测试数据库连接
docker exec ai_music_mysql mysql -u root -proot123456 -e "SELECT 1;"
```

---

## ✨ 测试成功标准

- ✅ 提示词可以正常创建、编辑、删除
- ✅ Banner图片成功上传并在前端显示
- ✅ 推荐音乐的封面和音频都能正常上传
- ✅ 前端可以正常播放推荐音乐
- ✅ 所有上传的文件都有对应的数据库记录
- ✅ 文件URL可以通过浏览器直接访问

完成以上测试后，数据存储功能验证完成！🎉
