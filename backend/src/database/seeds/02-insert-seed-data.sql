-- AI音乐创作助手 - 种子数据脚本
-- 版本: v1.0

-- 1. 点数套餐种子数据
INSERT IGNORE INTO `t_credit_packages` (`name`, `credits`, `price`, `bonus_credits`, `is_active`, `sort_order`) VALUES
('基础套餐', 100, 9.90, 0, 1, 1),
('进阶套餐', 500, 49.00, 50, 1, 2),
('专业套餐', 1000, 99.00, 200, 1, 3),
('豪华套餐', 5000, 399.00, 1000, 1, 4);

-- 2. 推荐分类种子数据
INSERT IGNORE INTO `t_recommendation_categories` (`code`, `name`, `icon`, `sort_order`, `is_active`) VALUES
('pop', '流行音乐', '🎵', 1, 1),
('rock', '摇滚音乐', '🎸', 2, 1),
('classical', '古典音乐', '🎻', 3, 1),
('electronic', '电子音乐', '🎹', 4, 1),
('folk', '民谣音乐', '🪕', 5, 1),
('hiphop', '说唱音乐', '🎤', 6, 1);

-- 3. 提示词模板种子数据 - 风格类
INSERT IGNORE INTO `t_prompt_templates` (`category`, `title`, `content`, `tags`, `is_active`, `sort_order`) VALUES
('风格', '流行风格', '创作一首流行风格的歌词，旋律朗朗上口，易于传唱，歌词简单明了，贴近生活。', 'pop,流行,主流', 1, 1),
('风格', '摇滚风格', '创作一首摇滚风格的歌词，充满力量感和节奏感，表达强烈的情感和态度。', 'rock,摇滚,激情', 1, 2),
('风格', '民谣风格', '创作一首民谣风格的歌词，朴实真挚，充满生活气息，讲述温暖的故事。', 'folk,民谣,温暖', 1, 3),
('风格', '说唱风格', '创作一首说唱风格的歌词，节奏感强，押韵工整，表达态度和观点。', 'rap,说唱,节奏', 1, 4),
('风格', '电子风格', '创作一首电子音乐风格的歌词，富有科技感和未来感，简洁有力。', 'electronic,电子,科技', 1, 5),
('风格', '古风风格', '创作一首古风歌词，运用古典意象和诗词手法，意境优美，韵味悠长。', 'ancient,古风,诗意', 1, 6);

-- 4. 提示词模板种子数据 - 情绪类
INSERT INTO `t_prompt_templates` (`category`, `title`, `content`, `tags`, `is_active`, `sort_order`) VALUES
('情绪', '欢快愉悦', '创作一首欢快愉悦的歌词，充满正能量，让人心情舒畅。', 'happy,欢快,正能量', 1, 1),
('情绪', '忧伤感性', '创作一首忧伤感性的歌词，细腻地描绘内心的伤感和思念。', 'sad,忧伤,感性', 1, 2),
('情绪', '励志向上', '创作一首励志向上的歌词，鼓舞人心，给人力量和勇气。', 'inspiring,励志,向上', 1, 3),
('情绪', '浪漫温馨', '创作一首浪漫温馨的歌词，表达爱意和温柔，充满浪漫氛围。', 'romantic,浪漫,温馨', 1, 4),
('情绪', '平静治愈', '创作一首平静治愈的歌词，舒缓心灵，带来宁静和安慰。', 'calm,治愈,平静', 1, 5),
('情绪', '激昂热血', '创作一首激昂热血的歌词，充满激情和力量，令人振奋。', 'passionate,激昂,热血', 1, 6);

-- 5. 提示词模板种子数据 - 主题类
INSERT INTO `t_prompt_templates` (`category`, `title`, `content`, `tags`, `is_active`, `sort_order`) VALUES
('主题', '青春校园', '创作一首关于青春校园的歌词，回忆学生时代的美好时光和青涩情感。', 'youth,校园,青春', 1, 1),
('主题', '夏日海滩', '创作一首关于夏日海滩的歌词，描绘阳光、沙滩、海浪的美好场景。', 'summer,海滩,夏日', 1, 2),
('主题', '城市夜晚', '创作一首关于城市夜晚的歌词，描绘都市霓虹和夜色中的情感。', 'city,夜晚,都市', 1, 3),
('主题', '追梦之路', '创作一首关于追梦之路的歌词，讲述为梦想奋斗的历程和坚持。', 'dream,追梦,奋斗', 1, 4),
('主题', '故乡思念', '创作一首关于故乡思念的歌词，表达对家乡和亲人的思念之情。', 'hometown,思念,乡愁', 1, 5),
('主题', '爱情物语', '创作一首关于爱情的歌词，诉说爱情的甜蜜、伤感或坚守。', 'love,爱情,情感', 1, 6),
('主题', '友谊长存', '创作一首关于友谊的歌词，颂扬友情的珍贵和长久。', 'friendship,友谊,珍贵', 1, 7),
('主题', '自然风光', '创作一首关于自然风光的歌词，描绘山川河流、四季变换的美景。', 'nature,自然,风光', 1, 8);

-- 6. 系统配置种子数据
INSERT IGNORE INTO `t_system_configs` (`config_key`, `config_value`, `config_type`, `description`, `is_public`) VALUES
('site_name', 'AI音乐创作助手', 'string', '网站名称', 1),
('site_description', '基于AI技术的智能音乐创作平台', 'string', '网站描述', 1),
('initial_credits', '100', 'number', '新用户初始点数', 0),
('lyrics_generation_cost', '10', 'number', '歌词生成消耗点数', 0),
('music_generation_cost', '20', 'number', '音乐生成消耗点数', 0),
('daily_signin_credits', '5', 'number', '每日签到奖励点数', 0),
('share_reward_credits', '1', 'number', '分享奖励点数', 0),
('max_lyrics_versions', '3', 'number', '歌词生成最多版本数', 0),
('max_file_size_mb', '10', 'number', '文件上传最大大小(MB)', 0);
