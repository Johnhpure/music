-- AI音乐创作助手 - 首页数据种子脚本
-- 版本: v1.0
-- 用途: 为首页功能填充Banner、提示词模板和热门推荐数据

-- 1. Banner轮播图数据
INSERT IGNORE INTO `t_banners` (`title`, `image_url`, `link_url`, `link_type`, `sort_order`, `is_active`) VALUES
('欢迎使用AI音乐创作', '/static/img/banner/banner1.jpg', '', 'none', 1, 1),
('AI辅助音乐创作', '/static/img/banner/banner2.jpg', '/pages/creation/ai', 'internal', 2, 1),
('分享你的创作', '/static/img/banner/banner3.jpg', '/pages/user/works', 'internal', 3, 1);

-- 2. 提示词模板数据（首页展示）
-- 分类：季节
INSERT INTO `t_prompt_templates` (`category`, `title`, `content`, `tags`, `is_active`, `sort_order`) VALUES
('季节', '夏日海滩', '创作一首关于夏日海边的轻快歌曲，描绘阳光、沙滩和欢乐时光', '欢快,夏日', 1, 1);

-- 分类：情感
INSERT IGNORE INTO `t_prompt_templates` (`category`, `title`, `content`, `tags`, `is_active`, `sort_order`) VALUES
('情感', '甜蜜爱情', '创作一首关于初次相遇的爱情歌曲，描述心动和美好的感觉', '浪漫,甜蜜', 1, 2);

-- 分类：生活
INSERT IGNORE INTO `t_prompt_templates` (`category`, `title`, `content`, `tags`, `is_active`, `sort_order`) VALUES
('生活', '城市夜景', '创作一首关于都市夜生活的歌曲，描绘城市的霓虹和节奏', '都市,流行', 1, 3);

-- 分类：自然
INSERT IGNORE INTO `t_prompt_templates` (`category`, `title`, `content`, `tags`, `is_active`, `sort_order`) VALUES
('自然', '自然风光', '创作一首描绘自然风光的民谣，表达对大自然的热爱', '民谣,舒缓', 1, 4);

-- 分类：幻想
INSERT IGNORE INTO `t_prompt_templates` (`category`, `title`, `content`, `tags`, `is_active`, `sort_order`) VALUES
('幻想', '梦境漫游', '创作一首梦幻风格的歌曲，描绘奇妙的梦境和幻想', '梦幻,电子', 1, 5);

-- 3. 热门推荐音乐数据
INSERT IGNORE INTO `t_hot_recommendations` (
  `category`, `title`, `cover_url`, `audio_url`, `artist`, `duration`, 
  `description`, `play_count`, `like_count`, `is_active`, `sort_order`
) VALUES
(
  '电子', '夏日海滩', '/static/img/covers/cover1.jpg', 
  '/static/audio/sample1.mp3', 'AI音乐创作师', '3:45',
  '轻快的电子音乐，带你感受夏日海滩的欢乐氛围', 2500, 320, 1, 1
),
(
  '电子', '电子节拍', '/static/img/covers/cover2.jpg', 
  '/static/audio/sample2.mp3', 'AI音乐创作师', '4:12',
  '充满节奏感的电子音乐，让你随节拍律动', 1800, 245, 1, 2
),
(
  '流行', '城市夜景', '/static/img/covers/cover3.jpg', 
  '/static/audio/sample3.mp3', 'AI音乐创作师', '3:28',
  '描绘都市夜晚的流行歌曲，充满现代感', 1600, 198, 1, 3
),
(
  '民谣', '秋日回忆', '/static/img/covers/cover4.jpg', 
  '/static/audio/sample4.mp3', 'AI音乐创作师', '3:55',
  '温暖的民谣音乐，讲述秋天的故事', 1500, 176, 1, 4
),
(
  '轻音乐', '山间小路', '/static/img/covers/cover5.jpg', 
  '/static/audio/sample5.mp3', 'AI音乐创作师', '4:30',
  '舒缓的轻音乐，带你漫步山间小路', 1300, 152, 1, 5
),
(
  '流行', '追梦旅程', '/static/img/covers/cover1.jpg', 
  '/static/audio/sample6.mp3', 'AI音乐创作师', '3:35',
  '励志的流行歌曲，激励你勇敢追梦', 1200, 143, 1, 6
),
(
  '摇滚', '自由之声', '/static/img/covers/cover2.jpg', 
  '/static/audio/sample7.mp3', 'AI音乐创作师', '4:05',
  '充满力量的摇滚音乐，释放内心的自由', 1100, 135, 1, 7
),
(
  '电子', '星空漫步', '/static/img/covers/cover3.jpg', 
  '/static/audio/sample8.mp3', 'AI音乐创作师', '5:12',
  '梦幻的电子音乐，带你遨游星空', 1000, 128, 1, 8
);

-- 4. 推荐分类数据（如果不存在）
INSERT IGNORE INTO `t_recommendation_categories` (`code`, `name`, `icon`, `sort_order`, `is_active`) VALUES
('all', '全部', '🎵', 0, 1),
('pop', '流行', '🎤', 1, 1),
('electronic', '电子', '🎹', 2, 1),
('folk', '民谣', '🪕', 3, 1),
('rock', '摇滚', '🎸', 4, 1),
('classical', '古典', '🎻', 5, 1),
('jazz', '爵士', '🎺', 6, 1);
