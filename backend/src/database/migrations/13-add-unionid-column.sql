-- Add unionid column to t_users table
ALTER TABLE t_users ADD COLUMN IF NOT EXISTS unionid VARCHAR(255) NULL AFTER openid;
