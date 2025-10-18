-- 增强用户管理功能：添加用户管理所需字段
-- 创建时间: 2025-01-XX

-- 1. 添加最后登录时间字段
ALTER TABLE t_users 
ADD COLUMN last_login_at TIMESTAMP NULL COMMENT '最后登录时间';

-- 2. 添加注册来源字段
ALTER TABLE t_users 
ADD COLUMN registration_source ENUM('wechat', 'web', 'mobile', 'unknown') DEFAULT 'unknown' COMMENT '注册来源';

-- 3. 添加用户类型字段
ALTER TABLE t_users 
ADD COLUMN user_type ENUM('free', 'vip', 'admin') DEFAULT 'free' COMMENT '用户类型';

-- 4. 更新现有管理员用户的user_type
UPDATE t_users SET user_type = 'admin' WHERE is_admin = 1;

-- 5. 更新现有微信用户的注册来源
UPDATE t_users SET registration_source = 'wechat' WHERE openid IS NOT NULL;

-- 6. 为新字段添加索引以优化查询
CREATE INDEX idx_last_login_at ON t_users(last_login_at);
CREATE INDEX idx_registration_source ON t_users(registration_source);
CREATE INDEX idx_user_type ON t_users(user_type);
CREATE INDEX idx_is_banned ON t_users(is_banned);

-- 7. 添加复合索引支持常见查询场景
CREATE INDEX idx_user_type_is_banned ON t_users(user_type, is_banned);
CREATE INDEX idx_created_at_desc ON t_users(created_at DESC);
