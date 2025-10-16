#!/usr/bin/env node

/**
 * Image URL Analysis Script
 * Analyzes current image URLs in database and prepares migration report
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function analyzeImageUrls() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  console.log('✅ Connected to database');
  console.log('=====================================');
  console.log('Image URL Analysis Report');
  console.log('=====================================\n');

  try {
    // Analyze Banners
    console.log('📋 BANNER ANALYSIS:');
    console.log('-----------------------------------');
    const [banners] = await connection.execute(
      'SELECT id, title, image_url, is_active FROM t_banners WHERE deleted_at IS NULL ORDER BY sort_order ASC'
    );

    if (banners.length === 0) {
      console.log('⚠️  No banners found in database\n');
    } else {
      console.log(`Total Banners: ${banners.length}`);
      banners.forEach((banner, index) => {
        const isLocal = banner.image_url.startsWith('/static/');
        const isHttp = banner.image_url.startsWith('http://');
        const isHttps = banner.image_url.startsWith('https://');
        const status = isLocal ? '✅ LOCAL' : isHttp ? '❌ HTTP' : isHttps ? '✅ HTTPS' : '⚠️  UNKNOWN';

        console.log(`  ${index + 1}. [ID:${banner.id}] ${banner.title}`);
        console.log(`     URL: ${banner.image_url}`);
        console.log(`     Status: ${status} | Active: ${banner.is_active ? 'Yes' : 'No'}`);
      });

      const httpCount = banners.filter(b => b.image_url.startsWith('http://')).length;
      const localCount = banners.filter(b => b.image_url.startsWith('/static/')).length;
      const httpsCount = banners.filter(b => b.image_url.startsWith('https://')).length;

      console.log('\n  Summary:');
      console.log(`    ✅ Local paths: ${localCount}`);
      console.log(`    ✅ HTTPS URLs: ${httpsCount}`);
      console.log(`    ❌ HTTP URLs (needs migration): ${httpCount}`);
    }

    // Analyze Hot Recommendations
    console.log('\n📋 HOT RECOMMENDATION ANALYSIS:');
    console.log('-----------------------------------');
    const [recommendations] = await connection.execute(
      'SELECT id, title, cover_url, audio_url, is_active FROM t_hot_recommendations WHERE deleted_at IS NULL ORDER BY sort_order ASC'
    );

    if (recommendations.length === 0) {
      console.log('⚠️  No hot recommendations found in database\n');
    } else {
      console.log(`Total Recommendations: ${recommendations.length}`);
      recommendations.forEach((rec, index) => {
        const isLocal = rec.cover_url.startsWith('/static/');
        const isHttp = rec.cover_url.startsWith('http://');
        const isHttps = rec.cover_url.startsWith('https://');
        const status = isLocal ? '✅ LOCAL' : isHttp ? '❌ HTTP' : isHttps ? '✅ HTTPS' : '⚠️  UNKNOWN';

        console.log(`  ${index + 1}. [ID:${rec.id}] ${rec.title}`);
        console.log(`     Cover URL: ${rec.cover_url}`);
        console.log(`     Audio URL: ${rec.audio_url}`);
        console.log(`     Cover Status: ${status} | Active: ${rec.is_active ? 'Yes' : 'No'}`);
      });

      const httpCount = recommendations.filter(r => r.cover_url.startsWith('http://')).length;
      const localCount = recommendations.filter(r => r.cover_url.startsWith('/static/')).length;
      const httpsCount = recommendations.filter(r => r.cover_url.startsWith('https://')).length;

      console.log('\n  Summary:');
      console.log(`    ✅ Local paths: ${localCount}`);
      console.log(`    ✅ HTTPS URLs: ${httpsCount}`);
      console.log(`    ❌ HTTP URLs (needs migration): ${httpCount}`);
    }

    console.log('\n=====================================');
    console.log('MIGRATION RECOMMENDATIONS:');
    console.log('=====================================');

    const totalHttpImages =
      banners.filter(b => b.image_url.startsWith('http://')).length +
      recommendations.filter(r => r.cover_url.startsWith('http://')).length;

    if (totalHttpImages === 0) {
      console.log('✅ All images are already using local paths or HTTPS URLs');
      console.log('✅ No migration needed!');
    } else {
      console.log(`⚠️  Found ${totalHttpImages} HTTP images that need migration`);
      console.log('📝 Recommended actions:');
      console.log('   1. Download HTTP images to local static directory');
      console.log('   2. Update database records to use /static/ paths');
      console.log('   3. Verify miniprogram can display all images');
    }

  } catch (error) {
    console.error('❌ Error analyzing image URLs:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('\n✅ Database connection closed');
  }
}

// Execute analysis
analyzeImageUrls()
  .then(() => {
    console.log('\n✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });
