-- 修复AI Provider Logo配置
-- 解决logo加载失败和DeepSeek图标404问题

-- 更新DeepSeek logo - 移除失效的iconify API链接，使用fallback图标
UPDATE `t_ai_providers` 
SET `config_json` = JSON_SET(
  `config_json`,
  '$.logoUrl', NULL
)
WHERE `provider_code` = 'deepseek';

-- 确保所有4个providers都存在，如果Gemini缺失则插入
INSERT INTO `t_ai_providers` (`provider_code`, `provider_name`, `base_url`, `is_active`, `sort_order`, `description`, `config_json`) 
SELECT 'gemini', 'Google Gemini', 'https://generativelanguage.googleapis.com', 1, 70, 'Google Gemini系列模型，强大的多模态AI',
'{"logoUrl": "https://cdn.simpleicons.org/googlegemini/8E75B2", "apiDocs": "https://ai.google.dev/gemini-api/docs", "authHeader": "x-goog-api-key", "defaultParams": {"temperature": 0.9, "top_p": 0.95, "top_k": 40, "max_output_tokens": 8192}, "rateLimit": {"rpm": 15, "tpm": 1000000, "rpd": 1500}, "supportedFeatures": ["streaming", "function_calling", "vision", "google_search", "code_execution"]}'
WHERE NOT EXISTS (SELECT 1 FROM `t_ai_providers` WHERE `provider_code` = 'gemini');

-- 验证结果
SELECT 
  id,
  provider_code,
  provider_name,
  is_active,
  JSON_EXTRACT(config_json, '$.logoUrl') as logo_url
FROM `t_ai_providers`
ORDER BY sort_order DESC;
