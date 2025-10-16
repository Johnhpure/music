-- 清空推荐管理的数据
-- 执行前已确认：这是清理推荐管理列表中的数据

-- 清空热门推荐表
DELETE FROM t_hot_recommendations;
ALTER TABLE t_hot_recommendations AUTO_INCREMENT = 1;

-- 查看清空结果
SELECT 't_hot_recommendations' as table_name, COUNT(*) as remaining_count FROM t_hot_recommendations;
