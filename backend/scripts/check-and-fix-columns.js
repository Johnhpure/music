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

async function checkAndFixColumns() {
  let connection;
  
  try {
    console.log('🚀 连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功\n');
    
    // 检查t_users表的结构
    console.log('📝 检查t_users表结构...');
    const [columns] = await connection.query('SHOW COLUMNS FROM t_users');
    const columnNames = columns.map(col => col.Field);
    console.log('现有列:', columnNames.join(', '));
    
    // 需要的列定义
    const requiredColumns = [
      { name: 'id', type: 'INT PRIMARY KEY AUTO_INCREMENT' },
      { name: 'openid', type: 'VARCHAR(255) UNIQUE' },
      { name: 'unionid', type: 'VARCHAR(255) NULL' },
      { name: 'phone', type: 'VARCHAR(20) NULL' },
      { name: 'nick_name', type: 'VARCHAR(100)' },
      { name: 'avatar_url', type: 'VARCHAR(500) NULL' },
      { name: 'credit_balance', type: 'INT UNSIGNED DEFAULT 100' },
      { name: 'is_banned', type: 'TINYINT(1) DEFAULT 0' },
      { name: 'is_admin', type: 'TINYINT(1) DEFAULT 0' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];
    
    // 检查并添加缺失的列
    for (const col of requiredColumns) {
      if (!columnNames.includes(col.name)) {
        console.log(`⚠️ 列 ${col.name} 不存在，正在添加...`);
        
        // 特殊处理某些列
        let alterQuery = '';
        if (col.name === 'nick_name') {
          alterQuery = `ALTER TABLE t_users ADD COLUMN nick_name VARCHAR(100) DEFAULT '用户'`;
        } else if (col.name === 'avatar_url') {
          alterQuery = `ALTER TABLE t_users ADD COLUMN avatar_url VARCHAR(500) NULL`;
        } else if (col.name === 'credit_balance') {
          alterQuery = `ALTER TABLE t_users ADD COLUMN credit_balance INT UNSIGNED DEFAULT 100`;
        } else if (col.name === 'is_banned') {
          alterQuery = `ALTER TABLE t_users ADD COLUMN is_banned TINYINT(1) DEFAULT 0`;
        } else if (col.name === 'is_admin') {
          alterQuery = `ALTER TABLE t_users ADD COLUMN is_admin TINYINT(1) DEFAULT 0`;
        }
        
        if (alterQuery) {
          try {
            await connection.query(alterQuery);
            console.log(`✅ 列 ${col.name} 添加成功`);
          } catch (error) {
            console.log(`❌ 添加列 ${col.name} 失败: ${error.message}`);
          }
        }
      }
    }
    
    // 再次检查表结构
    console.log('\n📝 最终表结构:');
    const [finalColumns] = await connection.query('SHOW COLUMNS FROM t_users');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
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
checkAndFixColumns();
