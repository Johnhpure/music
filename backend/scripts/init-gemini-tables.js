/**
 * Gemini API管理系统 - 数据库初始化脚本
 * 用于创建Gemini相关的数据库表
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initGeminiTables() {
  let connection;

  try {
    // 从环境变量读取数据库配置
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'music_platform',
      multipleStatements: true,
    };

    console.log('正在连接数据库...');
    console.log(`数据库: ${config.user}@${config.host}:${config.port}/${config.database}`);

    connection = await mysql.createConnection(config);
    console.log('数据库连接成功！');

    // 读取SQL文件
    const sqlFilePath = path.join(
      __dirname,
      '../src/database/migrations/05-create-gemini-tables.sql',
    );

    console.log(`正在读取SQL文件: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // 执行SQL
    console.log('正在执行SQL语句...');
    await connection.query(sql);
    console.log('✅ Gemini数据库表创建成功！');

    // 检查并显示创建的表
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 't_gemini%'
    `);

    console.log('\n已创建的Gemini相关表:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });

    // 检查模型数据
    const [models] = await connection.query(`
      SELECT model_name, display_name, is_active 
      FROM t_gemini_models 
      ORDER BY sort_order DESC
    `);

    console.log('\n已配置的Gemini模型:');
    models.forEach((model, index) => {
      const status = model.is_active ? '✓' : '✗';
      console.log(`  ${index + 1}. [${status}] ${model.model_name} - ${model.display_name}`);
    });

    console.log('\n初始化完成！');
    console.log('\n下一步操作:');
    console.log('1. 在管理后台添加Gemini API密钥: POST /api/admin/gemini/keys');
    console.log('2. 测试API密钥是否可用');
    console.log('3. 开始使用Gemini API进行歌词生成');
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    if (error.sql) {
      console.error('错误的SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行初始化
initGeminiTables();
