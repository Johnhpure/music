#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 
 * 功能：
 * 1. 创建数据库表结构
 * 2. 填充基础种子数据
 * 3. 填充首页数据
 * 
 * 使用方法：
 * node backend/scripts/init-database.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ai_music_platform',
  multipleStatements: true,
};

async function executeSqlFile(connection, filePath) {
  console.log(`\n📄 执行SQL文件: ${filePath}`);
  
  try {
    const sql = await fs.readFile(filePath, 'utf8');
    await connection.query(sql);
    console.log(`✅ SQL文件执行成功: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ SQL文件执行失败: ${path.basename(filePath)}`);
    console.error(`   错误信息: ${error.message}`);
    throw error;
  }
}

async function initDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始初始化数据库...\n');
    console.log('📝 数据库配置:');
    console.log(`   Host: ${DB_CONFIG.host}`);
    console.log(`   Port: ${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_CONFIG.database}`);
    console.log(`   User: ${DB_CONFIG.user}\n`);
    
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功\n');

    const migrationsDir = path.join(__dirname, '../src/database/migrations');
    const seedsDir = path.join(__dirname, '../src/database/seeds');

    console.log('📦 步骤 1: 创建数据表结构...');
    await executeSqlFile(connection, path.join(migrationsDir, '01-create-tables.sql'));

    console.log('\n📦 步骤 2: 填充基础种子数据...');
    await executeSqlFile(connection, path.join(seedsDir, '02-insert-seed-data.sql'));

    console.log('\n📦 步骤 3: 填充首页数据...');
    await executeSqlFile(connection, path.join(seedsDir, '03-insert-homepage-data.sql'));

    console.log('\n\n🎉 数据库初始化完成！');
    console.log('\n📊 已创建的数据:');
    console.log('   ✓ 数据表结构');
    console.log('   ✓ 点数套餐数据');
    console.log('   ✓ 推荐分类数据');
    console.log('   ✓ 提示词模板数据');
    console.log('   ✓ Banner轮播图数据');
    console.log('   ✓ 热门推荐音乐数据');
    console.log('   ✓ 系统配置数据');
    
  } catch (error) {
    console.error('\n❌ 数据库初始化失败:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

initDatabase();
