import { computed } from 'vue'
import type { ThemeRecord, SmartTip, TipType, ColorScheme } from '@/types'
import { generateId } from '@/utils/id'

export function useSmartTips(themesRef: { value: ThemeRecord[] }) {
  const tips = computed<SmartTip[]>(() => {
    const result: SmartTip[] = []
    const list = themesRef.value
    
    if (!list || list.length === 0) return result
    
    const nameCount: Record<string, string[]> = {}
    const colorCount: Record<ColorScheme, number> = {
      peachPink: 0,
      mintGreen: 0,
      lemonYellow: 0,
      lavenderPurple: 0,
      skyBlue: 0,
      creamWhite: 0,
      other: 0
    }
    
    list.forEach(t => {
      const nameKey = t.themeName.toLowerCase().trim()
      if (!nameCount[nameKey]) nameCount[nameKey] = []
      nameCount[nameKey].push(t.id)
      colorCount[t.colorScheme]++
    })
    
    Object.entries(nameCount).forEach(([name, ids]) => {
      if (ids.length > 1 && name) {
        result.push({
          id: generateId(),
          type: 'warning',
          message: `发现 ${ids.length} 个重复主题名「${list.find(t => t.id === ids[0])?.themeName}」，建议区分`,
          themeId: ids[0]
        })
      }
    })
    
    const colorNames: Record<string, string> = {
      peachPink: '蜜桃粉',
      mintGreen: '薄荷绿',
      lemonYellow: '鹅黄',
      lavenderPurple: '薰衣草紫',
      skyBlue: '天空蓝',
      creamWhite: '奶油白',
      other: '其他'
    }
    
    Object.entries(colorCount).forEach(([color, count]) => {
      if (count > 3) {
        result.push({
          id: generateId(),
          type: 'info',
          message: `${colorNames[color]}色系主题较多 (${count}个)，建议平衡色系分布`
        })
      }
    })
    
    list.forEach(t => {
      if (t.stickerCount < 5) {
        result.push({
          id: generateId(),
          type: 'error',
          message: `「${t.themeName}」贴纸数量不足 (${t.stickerCount}张)`,
          themeId: t.id
        })
      }
    })
    
    list.forEach(t => {
      if (t.estimatedTime > 60) {
        result.push({
          id: generateId(),
          type: 'warning',
          message: `「${t.themeName}」预计用时过长 (${t.estimatedTime}分钟)`,
          themeId: t.id
        })
      }
    })
    
    list.forEach(t => {
      if (!t.notes.trim() && t.status !== 'shelved') {
        result.push({
          id: generateId(),
          type: 'info',
          message: `「${t.themeName}」缺少备注信息`,
          themeId: t.id
        })
      }
    })
    
    return result
  })
  
  return { tips }
}
