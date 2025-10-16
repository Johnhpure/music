#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'music_platform',
};

async function createAdminUser() {
  let connection;
  
  try {
    console.log('🚀 连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功\n');
    
    // 检查是否已存在admin用户
    const [existing] = await connection.query(
      "SELECT * FROM t_users WHERE phone = 'admin' OR email = 'admin@admin.com'"
    );
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    if (existing.length > 0) {
      // 更新现有用户
      console.log('📝 更新管理员用户...');
      await connection.query(
        `UPDATE t_users SET 
          phone = 'admin',
          email = 'admin@admin.com',
          password = ?,
          nick_name = '管理员',
          is_admin = 1,
          role = 'admin',
          is_banned = 0,
          is_active = 1,
          credit_balance = 999999
        WHERE phone = 'admin' OR email = 'admin@admin.com'`,
        [hashedPassword]
      );
      console.log('✅ 管理员用户更新成功');
    } else {
      // 创建新用户 - 不设置虚拟列(nickname, avatar, credit)
      console.log('📝 创建管理员用户...');
      await connection.query(
        `INSERT INTO t_users (
          openid, phone, email, password, nick_name,
          is_admin, role, is_banned, is_active, credit_balance
        ) VALUES (
          'admin_openid', 'admin', 'admin@admin.com', ?, '管理员',
          1, 'admin', 0, 1, 999999
        )`,
        [hashedPassword]
      );
      console.log('✅ 管理员用户创建成功');
    }
    
    console.log('\n📊 管理员账户信息:');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✨ 数据库连接已关闭');
    }
  }
}

// 执行
createAdminUser();
