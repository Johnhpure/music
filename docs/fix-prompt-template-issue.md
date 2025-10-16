# 提示词添加功能修复文档

## 问题描述

前端添加提示词时返回400错误"参数验证失败"。

## 问题根源

通过深度代码分析发现：
1. **DTO定义中包含`icon`字段**（可选字符串）
2. **数据库表和Entity中缺少`icon`字段**
3. **Service层的create方法**错误地将`icon`字段解构出来但未保存

导致前端提交包含`icon`字段的数据时，虽然通过了DTO验证，但在保存到数据库时可能出现问题。

## 修复内容

### 1. 数据库修改
添加`icon`字段到`t_prompt_templates`表：
```sql
ALTER TABLE `t_prompt_templates` 
ADD COLUMN `icon` VARCHAR(50) NULL COMMENT '图标' AFTER `tags`;
```

### 2. Entity修改
在`PromptTemplate`实体类中添加`icon`字段：
```typescript
@Column({
  type: 'varchar',
  length: 50,
  nullable: true,
  comment: '图标',
})
icon: string;
```

### 3. Service修改
修正`create`方法，允许保存`icon`字段：
```typescript
async create(createDto: CreatePromptTemplateDto): Promise<PromptTemplate> {
  const { tags, ...rest } = createDto;  // 移除对icon的单独解构
  
  const templateData = {
    ...rest,  // 包含icon字段
    tags: tags && tags.length > 0 ? tags.join(',') : null,
  } as Partial<PromptTemplate>;
  
  const template = this.promptTemplateRepository.create(templateData);
  return (await this.promptTemplateRepository.save(template)) as PromptTemplate;
}
```

### 4. ValidationPipe增强
改进错误信息返回，提供更详细的字段级错误信息。

## 执行步骤

### 步骤1: 执行数据库迁移
```bash
cd /home/chenbang/app/music/music_platform-master/backend

# 使用Docker方式（如果数据库在Docker中）
docker exec -i $(docker ps | grep mysql | awk '{print $1}') \
  mysql -uroot -p[ROOT_PASSWORD] ai_music_platform \
  < scripts/add-icon-field.sql

# 或者直接连接数据库
mysql -h172.17.0.3 -uroot -p[ROOT_PASSWORD] ai_music_platform \
  < scripts/add-icon-field.sql
```

### 步骤2: 重启后端服务
```bash
cd /home/chenbang/app/music/music_platform-master

# 方式1: 使用restart脚本
./restart-backend.sh

# 方式2: 使用PM2
pm2 restart music-backend

# 方式3: 如果是开发模式
cd backend && npm run start:dev
```

### 步骤3: 清除前端缓存并测试
1. 在浏览器开发者工具中清除缓存（Ctrl+Shift+Del）
2. 刷新管理后台页面（Ctrl+F5）
3. 尝试添加新的提示词

## 验证修复

### 检查数据库字段
```sql
USE ai_music_platform;
DESCRIBE t_prompt_templates;
```

应该看到`icon`字段已添加。

### 检查后端日志
```bash
# PM2方式
pm2 logs music-backend --lines 50

# 或查看日志文件
tail -f backend/logs/app-*.log
```

添加提示词时应该看到：
- ✅ `🔍 ValidationPipe - 原始数据:` 显示提交的数据
- ✅ 如果成功，不应该有验证错误
- ❌ 如果失败，会显示详细的字段级错误信息

### 功能测试
1. 登录管理后台
2. 进入"提示词管理"页面
3. 点击"添加提示词"
4. 填写表单：
   - 标题: 测试提示词
   - 内容: 这是一个测试内容
   - 分类: 流行音乐
   - 标签: 可选
   - 图标: 🎵（默认）
5. 点击"创建"
6. 应该成功创建并在列表中显示

## 额外说明

### tags字段处理
- **前端**：使用数组 `['标签1', '标签2']`
- **DTO**：接收字符串数组 `tags?: string[]`
- **Service**：转换为逗号分隔字符串 `'标签1,标签2'`
- **数据库**：存储为VARCHAR `'标签1,标签2'`
- **读取**：Entity的`@AfterLoad()`自动转换回`tagsArray`数组

### 环境检查
如果修复后仍有问题，检查：
1. **数据库连接**：确保后端能正常连接到数据库
2. **缓存**：清除Redis缓存
3. **编译**：确保TypeScript代码已重新编译
4. **环境变量**：检查.env配置

## 相关文件

- `backend/src/modules/prompt-template/entities/prompt-template.entity.ts`
- `backend/src/modules/prompt-template/dto/create-prompt-template.dto.ts`
- `backend/src/modules/prompt-template/prompt-template.service.ts`
- `backend/src/common/pipes/validation.pipe.ts`
- `backend/scripts/add-icon-field.sql`

## 日期
2025-10-15
