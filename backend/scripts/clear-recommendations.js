#!/usr/bin/env node

/**
 * 清理推荐管理数据脚本
 * 
 * 功能：清空t_hot_recommendations表中的所有数据
 * 
 * 使用方法：
 * node backend/scripts/clear-recommendations.js
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'music_platform',
  multipleStatements: true,
};

async function clearRecommendations() {
  let connection;
  
  try {
    console.log('🚀 开始清理推荐管理数据...\n');
    console.log('📝 数据库配置:');
    console.log(`   Host: ${DB_CONFIG.host}`);
    console.log(`   Port: ${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_CONFIG.database}`);
    console.log(`   User: ${DB_CONFIG.user}\n`);
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功\n');

    // 查询清理前的数据量
    console.log('📊 查询清理前的数据量...');
    const [beforeRows] = await connection.query('SELECT COUNT(*) as count FROM t_hot_recommendations');
    console.log(`   当前推荐数据数量: ${beforeRows[0].count}\n`);

    if (beforeRows[0].count === 0) {
      console.log('ℹ️  推荐管理表中没有数据，无需清理');
      return;
    }

    // 清空数据
    console.log('🗑️  开始清理推荐数据...');
    await connection.query('DELETE FROM t_hot_recommendations');
    await connection.query('ALTER TABLE t_hot_recommendations AUTO_INCREMENT = 1');
    
    // 验证清理结果
    const [afterRows] = await connection.query('SELECT COUNT(*) as count FROM t_hot_recommendations');
    console.log(`✅ 清理完成！剩余数据量: ${afterRows[0].count}\n`);

    console.log('🎉 推荐管理数据清理成功！');
    
  } catch (error) {
    console.error('\n❌ 清理失败:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

clearRecommendations();
