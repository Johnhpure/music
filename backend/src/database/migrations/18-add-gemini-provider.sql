-- =====================================================
-- 添加 Gemini Provider 和模型
-- 如果Gemini Provider已存在则跳过
-- =====================================================

-- 插入Gemini Provider (如果不存在)
INSERT INTO `t_ai_providers` (`provider_code`, `provider_name`, `base_url`, `is_active`, `sort_order`, `description`, `config_json`) 
SELECT 'gemini', 'Google Gemini', 'https://generativelanguage.googleapis.com', 1, 70, 'Google Gemini系列模型，强大的多模态AI',
'{"logoUrl": "https://cdn.simpleicons.org/googlegemini/8E75B2", "apiDocs": "https://ai.google.dev/gemini-api/docs", "authHeader": "x-goog-api-key", "defaultParams": {"temperature": 0.9, "top_p": 0.95, "top_k": 40, "max_output_tokens": 8192}, "rateLimit": {"rpm": 15, "tpm": 1000000, "rpd": 1500}, "supportedFeatures": ["streaming", "function_calling", "vision", "google_search", "code_execution"]}'
WHERE NOT EXISTS (
  SELECT 1 FROM `t_ai_providers` WHERE `provider_code` = 'gemini'
);

-- 插入Gemini模型
INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'gemini-2.0-flash-exp',
  'Gemini 2.0 Flash',
  'chat',
  1000000,
  8192,
  1,
  1,
  1,
  0.000000,
  0.000000,
  1,
  1,
  100,
  'Gemini 2.0 Flash实验版，多模态AI模型'
FROM `t_ai_providers` p 
WHERE p.provider_code = 'gemini'
AND NOT EXISTS (
  SELECT 1 FROM `t_ai_models` 
  WHERE `provider_id` = p.id AND `model_code` = 'gemini-2.0-flash-exp'
);

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'gemini-1.5-pro',
  'Gemini 1.5 Pro',
  'chat',
  2000000,
  8192,
  1,
  1,
  1,
  0.001250,
  0.005000,
  1,
  0,
  90,
  'Gemini 1.5 Pro，超长上下文窗口'
FROM `t_ai_providers` p 
WHERE p.provider_code = 'gemini'
AND NOT EXISTS (
  SELECT 1 FROM `t_ai_models` 
  WHERE `provider_id` = p.id AND `model_code` = 'gemini-1.5-pro'
);

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'gemini-1.5-flash',
  'Gemini 1.5 Flash',
  'chat',
  1000000,
  8192,
  1,
  1,
  1,
  0.000075,
  0.000300,
  1,
  0,
  80,
  'Gemini 1.5 Flash，快速且经济'
FROM `t_ai_providers` p 
WHERE p.provider_code = 'gemini'
AND NOT EXISTS (
  SELECT 1 FROM `t_ai_models` 
  WHERE `provider_id` = p.id AND `model_code` = 'gemini-1.5-flash'
);

-- 验证结果
SELECT 
  p.provider_name,
  COUNT(m.id) as model_count
FROM t_ai_providers p
LEFT JOIN t_ai_models m ON p.id = m.provider_id
GROUP BY p.id, p.provider_name
ORDER BY p.sort_order DESC;
