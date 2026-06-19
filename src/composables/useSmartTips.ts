import type { SmartTip, StickerTheme } from '@/types'

export function detectSmartTips(themes: StickerTheme[]): SmartTip[] {
  const tips: SmartTip[] = []

  const lowCount = themes.filter((t) => t.stickerCount < 10)
  if (lowCount.length) {
    tips.push({
      id: 'lowCount',
      type: 'lowCount',
      level: 'warning',
      themeIds: lowCount.map((t) => t.id),
      message: `${lowCount.length} 个主题贴纸数量不足 10 张，建议在活动前补印`,
    })
  }

  const nameMap = new Map<string, string[]>()
  themes.forEach((t) => {
    const key = t.name.trim()
    if (!key) return
    if (!nameMap.has(key)) nameMap.set(key, [])
    nameMap.get(key)!.push(t.id)
  })
  const dupIds: string[] = []
  nameMap.forEach((ids) => {
    if (ids.length > 1) dupIds.push(...ids)
  })
  if (dupIds.length) {
    tips.push({
      id: 'duplicateName',
      type: 'duplicateName',
      level: 'warning',
      themeIds: dupIds,
      message: `检测到主题名重复（共 ${dupIds.length} 条），可能造成分发混乱`,
    })
  }

  const colorMap = new Map<string, string[]>()
  themes.forEach((t) => {
    if (!colorMap.has(t.colorFamily)) colorMap.set(t.colorFamily, [])
    colorMap.get(t.colorFamily)!.push(t.id)
  })
  const clusteredIds: string[] = []
  let clusterMessage = ''
  colorMap.forEach((ids, color) => {
    if (ids.length > 3) {
      clusteredIds.push(...ids)
      clusterMessage += `${color} ${ids.length} 个 · `
    }
  })
  if (clusteredIds.length) {
    tips.push({
      id: 'colorClustered',
      type: 'colorClustered',
      level: 'info',
      themeIds: clusteredIds,
      message: `同色系集中：${clusterMessage.slice(0, -2)}建议增加色彩多样性`,
    })
  }

  const longIds = themes.filter((t) => t.estimatedMinutes > 120).map((t) => t.id)
  if (longIds.length) {
    tips.push({
      id: 'longDuration',
      type: 'longDuration',
      level: 'info',
      themeIds: longIds,
      message: `${longIds.length} 个主题预计用时超过 120 分钟，建议拆分或预排时间`,
    })
  }

  const missingNoteIds = themes
    .filter((t) => t.status === 'ready' && !t.note.trim())
    .map((t) => t.id)
  if (missingNoteIds.length) {
    tips.push({
      id: 'missingNote',
      type: 'missingNote',
      level: 'info',
      themeIds: missingNoteIds,
      message: `${missingNoteIds.length} 个"可使用"主题缺备注，建议补充使用说明`,
    })
  }

  return tips
}

export const SMART_TIP_LABEL: Record<SmartTip['type'], string> = {
  lowCount: '贴纸数量不足',
  duplicateName: '主题名重复',
  colorClustered: '同色系集中',
  longDuration: '预计用时过长',
  missingNote: '备注缺失',
}
