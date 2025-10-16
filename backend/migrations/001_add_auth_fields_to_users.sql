-- 添加用户名密码认证字段到 t_users 表
-- 迁移时间: 2025-10-16

-- 1. 修改 openid 为可空
ALTER TABLE `t_users` MODIFY COLUMN `openid` VARCHAR(100) NULL;

-- 2. 添加 username 字段（唯一索引）
ALTER TABLE `t_users` ADD COLUMN `username` VARCHAR(50) NULL UNIQUE COMMENT '用户名' AFTER `unionid`;

-- 3. 添加 email 字段（唯一索引）
ALTER TABLE `t_users` ADD COLUMN `email` VARCHAR(100) NULL UNIQUE COMMENT '邮箱' AFTER `username`;

-- 4. 添加 password 字段
ALTER TABLE `t_users` ADD COLUMN `password` VARCHAR(255) NULL COMMENT '密码（bcrypt加密）' AFTER `email`;

-- 5. 添加索引
CREATE INDEX `idx_username` ON `t_users`(`username`);
CREATE INDEX `idx_email` ON `t_users`(`email`);

-- 查看修改后的表结构
SHOW COLUMNS FROM `t_users`;
