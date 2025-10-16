const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_DATABASE || 'music_platform'
  });

  try {
    console.log('Adding unionid column to t_users table...');
    await connection.execute('ALTER TABLE t_users ADD COLUMN IF NOT EXISTS unionid VARCHAR(255) NULL AFTER openid');
    console.log('✅ unionid column added successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ unionid column already exists');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
