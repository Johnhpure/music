#!/usr/bin/env node

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'music_platform',
};

async function addNicknameColumn() {
  let connection;
  
  try {
    console.log('🚀 连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功\n');
    
    // 检查nickname列是否已存在
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM t_users LIKE 'nickname'"
    );
    
    if (columns.length > 0) {
      console.log('✅ nickname列已存在');
    } else {
      // 添加nickname列作为nick_name的别名
      console.log('📝 添加nickname列...');
      await connection.query(
        'ALTER TABLE t_users ADD COLUMN nickname VARCHAR(100) GENERATED ALWAYS AS (nick_name) VIRTUAL'
      );
      console.log('✅ nickname虚拟列添加成功');
    }
    
    // 检查avatar列
    const [avatarColumns] = await connection.query(
      "SHOW COLUMNS FROM t_users LIKE 'avatar'"
    );
    
    if (avatarColumns.length > 0) {
      console.log('✅ avatar列已存在');
    } else {
      console.log('📝 添加avatar列...');
      await connection.query(
        'ALTER TABLE t_users ADD COLUMN avatar VARCHAR(500) GENERATED ALWAYS AS (avatar_url) VIRTUAL'
      );
      console.log('✅ avatar虚拟列添加成功');
    }
    
    // 检查credit列
    const [creditColumns] = await connection.query(
      "SHOW COLUMNS FROM t_users LIKE 'credit'"
    );
    
    if (creditColumns.length > 0) {
      console.log('✅ credit列已存在');
    } else {
      console.log('📝 添加credit列...');
      await connection.query(
        'ALTER TABLE t_users ADD COLUMN credit INT UNSIGNED GENERATED ALWAYS AS (credit_balance) VIRTUAL'
      );
      console.log('✅ credit虚拟列添加成功');
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    // 如果虚拟列不支持，尝试创建普通列
    if (error.message.includes('GENERATED') || error.message.includes('syntax')) {
      console.log('📝 虚拟列不支持，创建普通列...');
      
      try {
        // nickname列
        const [nickColumns] = await connection.query(
          "SHOW COLUMNS FROM t_users LIKE 'nickname'"
        );
        if (nickColumns.length === 0) {
          await connection.query(
            'ALTER TABLE t_users ADD COLUMN nickname VARCHAR(100) DEFAULT NULL'
          );
          await connection.query(
            'UPDATE t_users SET nickname = nick_name WHERE nickname IS NULL'
          );
          console.log('✅ nickname列添加成功');
        }
        
        // avatar列
        const [avatarCols] = await connection.query(
          "SHOW COLUMNS FROM t_users LIKE 'avatar'"
        );
        if (avatarCols.length === 0) {
          await connection.query(
            'ALTER TABLE t_users ADD COLUMN avatar VARCHAR(500) DEFAULT NULL'
          );
          await connection.query(
            'UPDATE t_users SET avatar = avatar_url WHERE avatar IS NULL'
          );
          console.log('✅ avatar列添加成功');
        }
        
        // credit列
        const [creditCols] = await connection.query(
          "SHOW COLUMNS FROM t_users LIKE 'credit'"
        );
        if (creditCols.length === 0) {
          await connection.query(
            'ALTER TABLE t_users ADD COLUMN credit INT UNSIGNED DEFAULT 100'
          );
          await connection.query(
            'UPDATE t_users SET credit = credit_balance WHERE credit IS NULL'
          );
          console.log('✅ credit列添加成功');
        }
        
      } catch (err) {
        console.error('❌ 创建普通列失败:', err.message);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✨ 数据库连接已关闭');
    }
  }
}

// 执行
addNicknameColumn();
