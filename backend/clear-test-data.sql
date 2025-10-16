-- 清空提示词管理、Banner管理、推荐管理的测试数据
-- 执行前已确认：这是测试环境数据清理

-- 1. 清空提示词表
DELETE FROM t_prompt_templates;
ALTER TABLE t_prompt_templates AUTO_INCREMENT = 1;

-- 2. 清空Banner表
DELETE FROM t_banners;
ALTER TABLE t_banners AUTO_INCREMENT = 1;

-- 3. 清空热门推荐表
DELETE FROM t_hot_recommendations;
ALTER TABLE t_hot_recommendations AUTO_INCREMENT = 1;

-- 4. 清空文件记录表
DELETE FROM t_files;
ALTER TABLE t_files AUTO_INCREMENT = 1;

-- 5. 清空推荐分类表（如果需要重新定义分类）
-- DELETE FROM t_recommendation_categories;
-- ALTER TABLE t_recommendation_categories AUTO_INCREMENT = 1;

-- 查看清空结果
SELECT 't_prompt_templates' as table_name, COUNT(*) as remaining_count FROM t_prompt_templates
UNION ALL
SELECT 't_banners', COUNT(*) FROM t_banners
UNION ALL
SELECT 't_hot_recommendations', COUNT(*) FROM t_hot_recommendations
UNION ALL
SELECT 't_files', COUNT(*) FROM t_files;
