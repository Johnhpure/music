/**
 * AI Models数据库初始化脚本
 * 用于创建表结构和插入初始数据
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  let connection;

  try {
    console.log('🚀 Starting AI Models database initialization...\n');

    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'music_platform',
      multipleStatements: true,
    });

    console.log('✅ Connected to database\n');

    // 1. 创建表结构
    console.log('📝 Creating AI models tables...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../src/database/migrations/07-create-ai-models-system.sql'),
      'utf8'
    );

    await connection.query(migrationSQL);
    console.log('✅ Tables created successfully\n');

    // 2. 插入初始数据
    console.log('📝 Inserting seed data...');
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../src/database/seeds/04-insert-ai-providers.sql'),
      'utf8'
    );

    await connection.query(seedSQL);
    console.log('✅ Seed data inserted successfully\n');

    // 3. 验证数据
    console.log('📊 Verifying data...');

    const [providers] = await connection.query('SELECT * FROM t_ai_providers');
    console.log(`   - AI Providers: ${providers.length}`);

    const [models] = await connection.query('SELECT * FROM t_ai_models');
    console.log(`   - AI Models: ${models.length}`);

    const [keys] = await connection.query('SELECT * FROM t_ai_api_keys');
    console.log(`   - API Keys: ${keys.length}`);

    console.log('\n✨ AI Models database initialization completed!\n');
    console.log('⚠️  Note: You need to add API keys manually through the admin panel or API\n');

  } catch (error) {
    console.error('❌ Error during initialization:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行初始化
initDatabase();
