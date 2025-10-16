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

async function fixAllUserColumns() {
  let connection;
  
  try {
    console.log('🚀 连接数据库...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功\n');
    
    // 添加所有可能缺失的列
    const columnsToAdd = [
      { name: 'email', type: 'VARCHAR(100) NULL' },
      { name: 'password', type: 'VARCHAR(255) NULL' },
      { name: 'is_active', type: 'TINYINT(1) DEFAULT 1' }
    ];
    
    for (const col of columnsToAdd) {
      const [existing] = await connection.query(
        `SHOW COLUMNS FROM t_users LIKE '${col.name}'`
      );
      
      if (existing.length === 0) {
        console.log(`📝 添加${col.name}列...`);
        await connection.query(
          `ALTER TABLE t_users ADD COLUMN ${col.name} ${col.type}`
        );
        console.log(`✅ ${col.name}列添加成功`);
      } else {
        console.log(`✅ ${col.name}列已存在`);
      }
    }
    
    // 显示最终的表结构
    console.log('\n📝 最终t_users表结构:');
    const [columns] = await connection.query('SHOW COLUMNS FROM t_users');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
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
fixAllUserColumns();
