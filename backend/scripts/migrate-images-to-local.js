#!/usr/bin/env node

/**
 * Image Migration Script (Already Completed)
 *
 * This script is provided as a reference for the migration that was already completed.
 * All images in the database are already using local paths (/static/...).
 *
 * MIGRATION STATUS: ✅ COMPLETED
 * - All banners are using local paths: /static/img/banner/banner*.jpg
 * - All covers are using local paths: /static/img/covers/cover*.jpg
 * - No HTTP URLs found in database
 * - No migration actions needed
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function migrateImages() {
  console.log('=====================================');
  console.log('Image Migration Script');
  console.log('=====================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  console.log('✅ Connected to database\n');

  try {
    // Check current state
    const [banners] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(CASE WHEN image_url LIKE "http://%" THEN 1 ELSE 0 END) as http_count FROM t_banners WHERE deleted_at IS NULL'
    );

    const [recommendations] = await connection.execute(
      'SELECT COUNT(*) as total, SUM(CASE WHEN cover_url LIKE "http://%" THEN 1 ELSE 0 END) as http_count FROM t_hot_recommendations WHERE deleted_at IS NULL'
    );

    console.log('📊 Current State:');
    console.log(`  Banners: ${banners[0].total} total, ${banners[0].http_count} HTTP URLs`);
    console.log(`  Recommendations: ${recommendations[0].total} total, ${recommendations[0].http_count} HTTP URLs\n`);

    if (banners[0].http_count === 0 && recommendations[0].http_count === 0) {
      console.log('✅ Migration Status: ALREADY COMPLETED');
      console.log('✅ All images are using local paths or HTTPS URLs');
      console.log('✅ No migration needed!\n');
      return;
    }

    // If HTTP URLs exist, perform migration (this code won't execute since all are already local)
    console.log('⚠️  HTTP URLs found, starting migration...\n');

    // Backup tables
    console.log('📋 Creating backup tables...');
    await connection.execute('CREATE TABLE IF NOT EXISTS t_banners_backup LIKE t_banners');
    await connection.execute('INSERT INTO t_banners_backup SELECT * FROM t_banners');
    await connection.execute('CREATE TABLE IF NOT EXISTS t_hot_recommendations_backup LIKE t_hot_recommendations');
    await connection.execute('INSERT INTO t_hot_recommendations_backup SELECT * FROM t_hot_recommendations');
    console.log('✅ Backup tables created\n');

    // Migrate banners
    console.log('📋 Migrating banner images...');
    const [bannersToMigrate] = await connection.execute(
      'SELECT id, image_url FROM t_banners WHERE image_url LIKE "http://%" AND deleted_at IS NULL'
    );

    for (const banner of bannersToMigrate) {
      // Extract filename and create local path
      const filename = banner.image_url.split('/').pop();
      const localPath = `/static/img/banner/${filename}`;

      await connection.execute(
        'UPDATE t_banners SET image_url = ? WHERE id = ?',
        [localPath, banner.id]
      );
      console.log(`  ✅ Banner ${banner.id}: ${banner.image_url} → ${localPath}`);
    }

    // Migrate hot recommendations
    console.log('\n📋 Migrating recommendation cover images...');
    const [recsToMigrate] = await connection.execute(
      'SELECT id, cover_url FROM t_hot_recommendations WHERE cover_url LIKE "http://%" AND deleted_at IS NULL'
    );

    for (const rec of recsToMigrate) {
      const filename = rec.cover_url.split('/').pop();
      const localPath = `/static/img/covers/${filename}`;

      await connection.execute(
        'UPDATE t_hot_recommendations SET cover_url = ? WHERE id = ?',
        [localPath, rec.id]
      );
      console.log(`  ✅ Recommendation ${rec.id}: ${rec.cover_url} → ${localPath}`);
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n⚠️  You can restore from backup tables:');
    console.error('   - t_banners_backup');
    console.error('   - t_hot_recommendations_backup');
    throw error;
  } finally {
    await connection.end();
    console.log('\n✅ Database connection closed');
  }
}

// Rollback function
async function rollback() {
  console.log('=====================================');
  console.log('Image Migration Rollback');
  console.log('=====================================\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  console.log('✅ Connected to database\n');

  try {
    // Check if backup tables exist
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 't_banners_backup'"
    );

    if (tables.length === 0) {
      console.log('⚠️  No backup tables found. Nothing to rollback.');
      return;
    }

    console.log('📋 Restoring from backup tables...');
    await connection.execute('TRUNCATE TABLE t_banners');
    await connection.execute('INSERT INTO t_banners SELECT * FROM t_banners_backup');
    await connection.execute('TRUNCATE TABLE t_hot_recommendations');
    await connection.execute('INSERT INTO t_hot_recommendations SELECT * FROM t_hot_recommendations_backup');

    console.log('✅ Rollback completed successfully!');
    console.log('✅ Original data restored from backup');

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('\n✅ Database connection closed');
  }
}

// Main execution
const command = process.argv[2];

if (command === 'rollback') {
  rollback()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  migrateImages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
