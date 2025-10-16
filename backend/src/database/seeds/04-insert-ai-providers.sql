-- AI Providers Seed Data
-- 初始化AI供应商和基础配置

-- 清空现有数据(谨慎使用)
-- TRUNCATE TABLE t_ai_models;
-- TRUNCATE TABLE t_ai_api_keys;
-- TRUNCATE TABLE t_ai_providers;

-- 1. 插入AI供应商
INSERT INTO `t_ai_providers` (`provider_code`, `provider_name`, `base_url`, `is_active`, `sort_order`, `description`) VALUES
('openai', 'OpenAI', 'https://api.openai.com/v1', 1, 100, 'OpenAI GPT系列模型，包括GPT-4o、GPT-4 Turbo等'),
('anthropic', 'Anthropic Claude', 'https://api.anthropic.com', 1, 90, 'Anthropic Claude系列模型，包括Claude 3.5 Sonnet等'),
('deepseek', 'DeepSeek', 'https://api.deepseek.com', 1, 80, 'DeepSeek系列模型，高性价比的中文大模型');

-- 2. 插入OpenAI模型
INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'gpt-4o',
  'GPT-4o',
  'chat',
  128000,
  16384,
  1,
  1,
  1,
  0.005000,
  0.015000,
  1,
  1,
  100,
  'OpenAI最新的旗舰模型，支持多模态输入'
FROM `t_ai_providers` p WHERE p.provider_code = 'openai';

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'gpt-4o-mini',
  'GPT-4o Mini',
  'chat',
  128000,
  16384,
  1,
  1,
  1,
  0.000150,
  0.000600,
  1,
  0,
  90,
  'GPT-4o的轻量级版本，性价比更高'
FROM `t_ai_providers` p WHERE p.provider_code = 'openai';

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'gpt-4-turbo',
  'GPT-4 Turbo',
  'chat',
  128000,
  4096,
  1,
  1,
  1,
  0.010000,
  0.030000,
  1,
  0,
  80,
  'GPT-4的高性能版本，128K上下文窗口'
FROM `t_ai_providers` p WHERE p.provider_code = 'openai';

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'gpt-3.5-turbo',
  'GPT-3.5 Turbo',
  'chat',
  16385,
  4096,
  1,
  1,
  0,
  0.000500,
  0.001500,
  1,
  0,
  70,
  '经典的GPT-3.5模型，快速且经济'
FROM `t_ai_providers` p WHERE p.provider_code = 'openai';

-- 3. 插入Claude模型
INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'claude-3-5-sonnet-latest',
  'Claude 3.5 Sonnet',
  'chat',
  200000,
  8192,
  1,
  1,
  1,
  0.003000,
  0.015000,
  1,
  1,
  100,
  'Claude 3.5 Sonnet，Anthropic最强模型'
FROM `t_ai_providers` p WHERE p.provider_code = 'anthropic';

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'claude-3-5-haiku-latest',
  'Claude 3.5 Haiku',
  'chat',
  200000,
  8192,
  1,
  1,
  1,
  0.000800,
  0.004000,
  1,
  0,
  90,
  'Claude 3.5 Haiku，快速且经济的模型'
FROM `t_ai_providers` p WHERE p.provider_code = 'anthropic';

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'claude-3-opus-latest',
  'Claude 3 Opus',
  'chat',
  200000,
  4096,
  1,
  1,
  1,
  0.015000,
  0.075000,
  1,
  0,
  80,
  'Claude 3 Opus，最强大的推理能力'
FROM `t_ai_providers` p WHERE p.provider_code = 'anthropic';

-- 4. 插入DeepSeek模型
INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'deepseek-chat',
  'DeepSeek Chat',
  'chat',
  128000,
  8192,
  1,
  1,
  0,
  0.000270,
  0.001100,
  1,
  1,
  100,
  'DeepSeek Chat，高性价比的中文大模型'
FROM `t_ai_providers` p WHERE p.provider_code = 'deepseek';

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'deepseek-reasoner',
  'DeepSeek Reasoner',
  'chat',
  128000,
  8192,
  1,
  0,
  0,
  0.000400,
  0.001600,
  1,
  0,
  90,
  'DeepSeek推理模型，具备强大的推理能力'
FROM `t_ai_providers` p WHERE p.provider_code = 'deepseek';

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id,
  'deepseek-coder',
  'DeepSeek Coder',
  'chat',
  128000,
  8192,
  1,
  1,
  0,
  0.000270,
  0.001100,
  1,
  0,
  80,
  'DeepSeek代码模型，专注于代码生成和理解'
FROM `t_ai_providers` p WHERE p.provider_code = 'deepseek';

-- 注意: API Keys需要管理员手动添加，不在seed数据中包含
-- 管理员应该通过管理后台或API添加真实的API密钥
