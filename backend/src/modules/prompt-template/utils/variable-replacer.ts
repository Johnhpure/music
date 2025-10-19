/**
 * 提示词变量替换引擎
 * 支持 {{variable}} 语法，动态替换模板中的变量
 */

export interface VariableContext {
  [key: string]: string | number | boolean;
}

/**
 * 从模板内容中提取所有变量
 * @param template 模板字符串
 * @returns 变量名数组
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}

/**
 * 替换模板中的变量
 * @param template 模板字符串
 * @param context 变量上下文
 * @param strict 严格模式：true时未提供的变量会保留原样，false时会替换为空字符串
 * @returns 替换后的字符串
 */
export function replaceVariables(
  template: string,
  context: VariableContext,
  strict = false,
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim();
    
    if (trimmedName in context) {
      return String(context[trimmedName]);
    }
    
    return strict ? match : '';
  });
}

/**
 * 验证上下文是否包含所有必需的变量
 * @param template 模板字符串
 * @param context 变量上下文
 * @returns { valid: boolean, missingVariables: string[] }
 */
export function validateContext(
  template: string,
  context: VariableContext,
): { valid: boolean; missingVariables: string[] } {
  const requiredVariables = extractVariables(template);
  const missingVariables = requiredVariables.filter(
    (variable) => !(variable in context),
  );

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * 生成变量定义的JSON Schema（用于前端表单生成）
 * @param variables 变量名数组
 * @returns JSON Schema对象
 */
export function generateVariableSchema(variables: string[]): object {
  const properties: any = {};
  
  variables.forEach((variable) => {
    properties[variable] = {
      type: 'string',
      title: variable,
      description: `请输入 ${variable}`,
    };
  });

  return {
    type: 'object',
    properties,
    required: variables,
  };
}

/**
 * 示例用法：
 * 
 * const template = "创作一首{{genre}}风格的歌曲，主题是{{topic}}，情绪{{mood}}";
 * const context = { genre: '流行', topic: '爱情', mood: '温柔' };
 * const result = replaceVariables(template, context);
 * // 结果: "创作一首流行风格的歌曲，主题是爱情，情绪温柔"
 */
