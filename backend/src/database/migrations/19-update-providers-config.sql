-- =====================================================
-- 更新AI Providers的配置信息（添加LOGO和详细配置）
-- 执行此脚本为现有的Providers添加configJson数据
-- =====================================================

-- 更新OpenAI配置
UPDATE `t_ai_providers` 
SET `config_json` = JSON_OBJECT(
  'logoUrl', 'https://cdn.simpleicons.org/openai/412991',
  'apiDocs', 'https://platform.openai.com/docs/api-reference',
  'authHeader', 'Authorization: Bearer',
  'defaultParams', JSON_OBJECT(
    'temperature', 0.7,
    'top_p', 1.0,
    'max_tokens', 2048,
    'stream', false
  ),
  'rateLimit', JSON_OBJECT(
    'rpm', 3500,
    'tpm', 350000,
    'rpd', 10000
  ),
  'supportedFeatures', JSON_ARRAY('streaming', 'function_calling', 'vision', 'json_mode')
)
WHERE `provider_code` = 'openai';

-- 更新Claude配置
UPDATE `t_ai_providers` 
SET `config_json` = JSON_OBJECT(
  'logoUrl', 'https://cdn.simpleicons.org/anthropic/191919',
  'apiDocs', 'https://docs.anthropic.com/',
  'authHeader', 'x-api-key',
  'defaultParams', JSON_OBJECT(
    'temperature', 1.0,
    'top_p', 1.0,
    'top_k', 40,
    'max_tokens', 4096
  ),
  'rateLimit', JSON_OBJECT(
    'rpm', 4000,
    'tpm', 400000,
    'rpd', 10000
  ),
  'supportedFeatures', JSON_ARRAY('streaming', 'function_calling', 'vision', 'thinking', 'web_search')
)
WHERE `provider_code` = 'anthropic' OR `provider_code` = 'claude';

-- 更新DeepSeek配置
UPDATE `t_ai_providers` 
SET `config_json` = JSON_OBJECT(
  'logoUrl', 'https://api.iconify.design/simple-icons:deepseek.svg?color=%23000000',
  'apiDocs', 'https://api-docs.deepseek.com/',
  'authHeader', 'Authorization: Bearer',
  'defaultParams', JSON_OBJECT(
    'temperature', 1.0,
    'top_p', 1.0,
    'max_tokens', 4096,
    'frequency_penalty', 0,
    'presence_penalty', 0
  ),
  'rateLimit', JSON_OBJECT(
    'rpm', 10000,
    'tpm', 1000000,
    'rpd', 50000
  ),
  'supportedFeatures', JSON_ARRAY('streaming', 'function_calling', 'json_mode', 'reasoning')
)
WHERE `provider_code` = 'deepseek';

-- 更新Gemini配置
UPDATE `t_ai_providers` 
SET `config_json` = JSON_OBJECT(
  'logoUrl', 'https://cdn.simpleicons.org/googlegemini/8E75B2',
  'apiDocs', 'https://ai.google.dev/gemini-api/docs',
  'authHeader', 'x-goog-api-key',
  'defaultParams', JSON_OBJECT(
    'temperature', 0.9,
    'top_p', 0.95,
    'top_k', 40,
    'max_output_tokens', 8192
  ),
  'rateLimit', JSON_OBJECT(
    'rpm', 15,
    'tpm', 1000000,
    'rpd', 1500
  ),
  'supportedFeatures', JSON_ARRAY('streaming', 'function_calling', 'vision', 'google_search', 'code_execution')
)
WHERE `provider_code` = 'gemini';

-- 验证更新结果
SELECT 
  id,
  provider_code,
  provider_name,
  config_json
FROM t_ai_providers
ORDER BY sort_order DESC;
