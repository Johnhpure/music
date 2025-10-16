# Image Migration Scripts - Quick Reference

## Overview

This directory contains scripts for analyzing and migrating image URLs in the music platform database.

## Scripts

### 1. analyze-image-urls.js

**Purpose**: Analyze current image URLs in database and generate migration report

**Usage**:
```bash
cd backend
node scripts/analyze-image-urls.js
```

**Output**:
- Database connection status
- Banner image analysis (total, HTTP, HTTPS, local counts)
- Hot recommendation image analysis
- Migration recommendations

**Example Output**:
```
=====================================
Image URL Analysis Report
=====================================

📋 BANNER ANALYSIS:
Total Banners: 3
  ✅ Local paths: 3
  ❌ HTTP URLs: 0

📋 HOT RECOMMENDATION ANALYSIS:
Total Recommendations: 8
  ✅ Local paths: 8
  ❌ HTTP URLs: 0

✅ All images are already using local paths or HTTPS URLs
✅ No migration needed!
```

---

### 2. migrate-images-to-local.js

**Purpose**: Migrate HTTP image URLs to local paths with backup and rollback capability

**Usage**:

**Migration (default)**:
```bash
cd backend
node scripts/migrate-images-to-local.js
```

**Rollback**:
```bash
cd backend
node scripts/migrate-images-to-local.js rollback
```

**Features**:
- ✅ Automatic backup table creation
- ✅ Rollback capability
- ✅ Detailed logging
- ✅ Safe: Only migrates HTTP URLs
- ✅ Verification: Checks current state first

**What It Does**:
1. Connects to database
2. Analyzes current state (HTTP vs local paths)
3. Creates backup tables if migration needed
4. Migrates HTTP URLs to local paths
5. Generates migration report

**Backup Tables Created**:
- `t_banners_backup` - Backup of original banner data
- `t_hot_recommendations_backup` - Backup of original recommendation data

**Rollback Process**:
```bash
# If you need to rollback:
node scripts/migrate-images-to-local.js rollback

# This will:
# 1. Restore t_banners from t_banners_backup
# 2. Restore t_hot_recommendations from t_hot_recommendations_backup
```

---

## Migration Strategy

### Phase 2A: Local Image Preloading (COMPLETED)

**Current Status**: ✅ All images already using local paths

**Image Locations**:
```
miniprogram/static/img/banner/
  - banner1.jpg (41KB)
  - banner2.jpg (31KB)
  - banner3.jpg (40KB)

miniprogram/static/img/covers/
  - cover1.jpg (9.7KB)
  - cover2.jpg (4.6KB)
  - cover3.jpg (8.4KB)
  - cover4.jpg (7.3KB)
  - cover5.jpg (13KB)
  - cover6.jpg (9.6KB)
  - cover7.jpg (9.8KB)
  - default.jpg (9.7KB) - Fallback image
```

**Database Format**:
```sql
-- Banners
imageUrl = '/static/img/banner/banner1.jpg'

-- Hot Recommendations
coverUrl = '/static/img/covers/cover1.jpg'
```

### Phase 2B: CDN Migration (OPTIONAL - NOT IMPLEMENTED)

**Status**: Not required for current scale

**Future CDN Migration Path**:
1. Upload local images to CDN service
2. Obtain HTTPS URLs from CDN
3. Update database: local paths → CDN HTTPS URLs
4. Maintain local path fallback in miniprogram

**Recommended CDN Services**:
- 七牛云 (Qiniu Cloud): Cost-effective, ~¥10-20/month
- 阿里云OSS (Alibaba Cloud): Enterprise-grade
- 腾讯云COS (Tencent Cloud): WeChat ecosystem integration

---

## Database Schema

### t_banners Table
```sql
id INT PRIMARY KEY
title VARCHAR(100)
image_url VARCHAR(500)  -- ✅ Should be local path: /static/img/banner/*.jpg
link_url VARCHAR(500)
link_type ENUM('none', 'internal', 'external', 'miniprogram')
sort_order INT
is_active TINYINT
start_time TIMESTAMP
end_time TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
deleted_at TIMESTAMP
```

### t_hot_recommendations Table
```sql
id INT PRIMARY KEY
category VARCHAR(50)
title VARCHAR(200)
cover_url VARCHAR(500)  -- ✅ Should be local path: /static/img/covers/*.jpg
audio_url VARCHAR(500)
artist VARCHAR(100)
duration VARCHAR(20)
description TEXT
play_count INT UNSIGNED
like_count INT UNSIGNED
is_active TINYINT
sort_order INT
created_at TIMESTAMP
updated_at TIMESTAMP
deleted_at TIMESTAMP
```

---

## Verification Checklist

Before running migration:
- [ ] Backup database manually (recommended)
- [ ] Verify all local images exist in static directory
- [ ] Check database connection credentials in `.env`
- [ ] Review current state with `analyze-image-urls.js`

After migration:
- [ ] Verify all records updated with `analyze-image-urls.js`
- [ ] Test miniprogram image display
- [ ] Test error fallback mechanisms
- [ ] Measure package size
- [ ] Keep backup tables for rollback safety

---

## Troubleshooting

### Migration fails with connection error
```bash
# Check database connection in .env
DB_HOST=your_host
DB_PORT=3306
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_DATABASE=ai_music_platform
```

### Rollback needed
```bash
# Rollback to original state
node scripts/migrate-images-to-local.js rollback

# Verify rollback successful
node scripts/analyze-image-urls.js
```

### Images not displaying in miniprogram
1. Check image paths in database: `node scripts/analyze-image-urls.js`
2. Verify local files exist: `ls miniprogram/static/img/banner/ miniprogram/static/img/covers/`
3. Check miniprogram error handlers: `miniprogram/pages/index/index.vue`

---

## Related Documentation

- **Task JSON**: `.workflow/WFS-miniprogram-api-integration/.task/IMPL-002.json`
- **Implementation Summary**: `.workflow/WFS-miniprogram-api-integration/.summaries/IMPL-002-summary.md`
- **Verification Report**: `.workflow/WFS-miniprogram-api-integration/.summaries/IMPL-002-verification-report.md`
- **TODO List**: `.workflow/WFS-miniprogram-api-integration/TODO_LIST.md`

---

**Last Updated**: 2025-10-15
**Status**: ✅ Migration scripts ready, no migration needed (all images already local)
