/**
 * 音乐分类Icon映射工具
 * 为不同的音乐分类提供精美的emoji图标
 */

/**
 * 音乐分类与Icon的映射表
 * 支持多种关键词匹配，提高兼容性
 */
const CATEGORY_ICON_MAP: Record<string, string> = {
  // 流行音乐
  '流行': '🎤',
  '流行音乐': '🎤',
  'pop': '🎤',
  'Pop': '🎤',
  'POP': '🎤',
  
  // R&B
  'R&B': '🎵',
  'r&b': '🎵',
  'RnB': '🎵',
  'rnb': '🎵',
  
  // 电子音乐
  '电子': '🎧',
  '电子音乐': '🎧',
  'electronic': '🎧',
  'Electronic': '🎧',
  'EDM': '🎧',
  'edm': '🎧',
  
  // 摇滚
  '摇滚': '🎸',
  'rock': '🎸',
  'Rock': '🎸',
  'ROCK': '🎸',
  
  // 民谣
  '民谣': '🎻',
  'folk': '🎻',
  'Folk': '🎻',
  '民谣音乐': '🎻',
  
  // 古典
  '古典': '🎹',
  '古典音乐': '🎹',
  'classical': '🎹',
  'Classical': '🎹',
  
  // 爵士
  '爵士': '🎷',
  '爵士乐': '🎷',
  'jazz': '🎷',
  'Jazz': '🎷',
  'JAZZ': '🎷',
  
  // 嘻哈/说唱
  '嘻哈': '🎙️',
  '说唱': '🎙️',
  'hip-hop': '🎙️',
  'Hip-Hop': '🎙️',
  'HIP-HOP': '🎙️',
  'rap': '🎙️',
  'Rap': '🎙️',
  'RAP': '🎙️',
  
  // 乡村
  '乡村': '🤠',
  '乡村音乐': '🤠',
  'country': '🤠',
  'Country': '🤠',
  'COUNTRY': '🤠',
  
  // 蓝调
  '蓝调': '🎺',
  '布鲁斯': '🎺',
  'blues': '🎺',
  'Blues': '🎺',
  'BLUES': '🎺'
}

/**
 * 默认Icon（当无法匹配分类时使用）
 */
const DEFAULT_ICON = '🎵'

/**
 * 根据音乐分类获取对应的Icon
 * 
 * @param category - 音乐分类名称
 * @returns Icon emoji字符串
 * 
 * @example
 * getCategoryIcon('流行音乐') // 返回 '🎤'
 * getCategoryIcon('pop') // 返回 '🎤'
 * getCategoryIcon('未知分类') // 返回 '🎵' (默认)
 */
export function getCategoryIcon(category: string | undefined | null): string {
  if (!category) {
    return DEFAULT_ICON
  }
  
  // 直接匹配
  const directMatch = CATEGORY_ICON_MAP[category]
  if (directMatch) {
    return directMatch
  }
  
  // 模糊匹配：检查分类名称是否包含关键词
  const categoryLower = category.toLowerCase()
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (categoryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(categoryLower)) {
      return icon
    }
  }
  
  return DEFAULT_ICON
}

/**
 * 获取所有支持的音乐分类列表
 * 
 * @returns 去重后的音乐分类数组
 */
export function getSupportedCategories(): string[] {
  const categories = [
    '流行音乐',
    'R&B',
    '电子音乐',
    '摇滚',
    '民谣',
    '古典',
    '爵士',
    '嘻哈',
    '乡村',
    '蓝调'
  ]
  return categories
}

/**
 * 获取分类的Icon和背景色配置
 * 
 * @param category - 音乐分类名称
 * @returns Icon和背景色的配置对象
 */
export function getCategoryIconConfig(category: string | undefined | null): {
  icon: string
  bgClass: string
} {
  const icon = getCategoryIcon(category)
  
  // 根据分类返回背景渐变色类
  const bgClassMap: Record<string, string> = {
    '🎤': 'bg-gradient-to-br from-purple-500 to-purple-600',  // 流行
    '🎵': 'bg-gradient-to-br from-pink-500 to-pink-600',      // R&B
    '🎧': 'bg-gradient-to-br from-blue-500 to-blue-600',      // 电子
    '🎸': 'bg-gradient-to-br from-red-500 to-red-600',        // 摇滚
    '🎻': 'bg-gradient-to-br from-green-500 to-green-600',    // 民谣
    '🎹': 'bg-gradient-to-br from-yellow-500 to-yellow-600',  // 古典
    '🎷': 'bg-gradient-to-br from-indigo-500 to-indigo-600',  // 爵士
    '🎙️': 'bg-gradient-to-br from-orange-500 to-orange-600', // 嘻哈/说唱
    '🤠': 'bg-gradient-to-br from-amber-500 to-amber-600',    // 乡村
    '🎺': 'bg-gradient-to-br from-cyan-500 to-cyan-600'       // 蓝调
  }
  
  return {
    icon,
    bgClass: bgClassMap[icon] || 'bg-gradient-to-br from-gray-500 to-gray-600'
  }
}

/**
 * 获取所有分类的Icon映射
 * 用于批量展示或选择
 * 
 * @returns 分类名称到Icon的映射对象
 */
export function getAllCategoryIcons(): Record<string, string> {
  const result: Record<string, string> = {}
  const categories = getSupportedCategories()
  
  categories.forEach(category => {
    result[category] = getCategoryIcon(category)
  })
  
  return result
}

export { DEFAULT_ICON }
