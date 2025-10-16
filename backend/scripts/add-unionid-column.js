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

async function addUnionidColumn() {
  let connection;
  
  try {
    console.log('🚀 连接数据库...');
    console.log(`   Host: ${DB_CONFIG.host}`);
    console.log(`   Database: ${DB_CONFIG.database}`);
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功\n');
    
    console.log('📝 添加unionid列到t_users表...');
    
    // 检查列是否已存在
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM t_users LIKE 'unionid'"
    );
    
    if (columns.length > 0) {
      console.log('✅ unionid列已存在，跳过创建');
    } else {
      await connection.query(
        'ALTER TABLE t_users ADD COLUMN unionid VARCHAR(255) NULL AFTER openid'
      );
      console.log('✅ unionid列添加成功');
    }
    
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
addUnionidColumn();
