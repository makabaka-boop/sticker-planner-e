import { ref, computed, watch } from 'vue'
import type {
  StickerTheme,
  Filters,
  SystemAlert,
  ThemeStatus,
  ColorScheme,
  PageType,
  DifficultyLevel,
  ActivityPackage
} from '../types'

const STORAGE_KEY = 'sticker-planner-themes'
const GROUP_COUNT_KEY = 'sticker-planner-groups'

const generateId = () => Math.random().toString(36).substring(2, 11)

const defaultThemes: StickerTheme[] = [
  {
    id: generateId(),
    name: '春日樱花',
    colorScheme: '粉色系',
    stickerCount: 45,
    suitablePages: ['封面', '内页'],
    example: '樱花花瓣、蝴蝶结、少女心边框',
    difficulty: '简单',
    estimatedTime: 30,
    responsible: '小美',
    status: '可使用',
    notes: '已完成裁剪，可直接使用',
    todos: ['拍照存档', '分装到小袋子'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    name: '森林物语',
    colorScheme: '绿色系',
    stickerCount: 28,
    suitablePages: ['内页', '分隔页'],
    example: '小鹿、蘑菇、树叶、藤蔓装饰',
    difficulty: '中等',
    estimatedTime: 60,
    responsible: '阿绿',
    status: '待整理',
    notes: '',
    todos: ['裁剪边缘', '分类收纳'],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    name: '星空梦境',
    colorScheme: '紫色系',
    stickerCount: 8,
    suitablePages: ['封面', '装饰页'],
    example: '星星、月亮、云朵、银河',
    difficulty: '困难',
    estimatedTime: 120,
    responsible: '小星',
    status: '需补充',
    notes: '亮片贴纸不够了',
    todos: ['采购闪粉贴纸', '测试粘贴效果'],
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    name: '复古邮局',
    colorScheme: '复古色',
    stickerCount: 52,
    suitablePages: ['口袋页', '内页'],
    example: '邮票、邮戳、信封、火漆印章',
    difficulty: '中等',
    estimatedTime: 45,
    responsible: '阿绿',
    status: '可使用',
    notes: '',
    todos: [],
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: generateId(),
    name: '马卡龙甜点',
    colorScheme: '马卡龙',
    stickerCount: 35,
    suitablePages: ['内页', '折叠页'],
    example: '蛋糕、冰淇淋、甜甜圈、糖果',
    difficulty: '简单',
    estimatedTime: 25,
    responsible: '小美',
    status: '仅展示',
    notes: '样品展示用，不参与分发',
    todos: [],
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const themes = ref<StickerTheme[]>([])
const filters = ref<Filters>({
  colorScheme: '',
  pageType: '',
  difficulty: '',
  status: '',
  responsible: ''
})
const selectedIds = ref<string[]>([])
const activeThemeId = ref<string | null>(null)
const isPreviewMode = ref(false)
const groupCount = ref(3)

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      themes.value = JSON.parse(stored)
    } else {
      themes.value = defaultThemes
    }
    const storedGroups = localStorage.getItem(GROUP_COUNT_KEY)
    if (storedGroups) {
      groupCount.value = parseInt(storedGroups, 10)
    }
  } catch {
    themes.value = defaultThemes
  }
}

const saveToStorage = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(themes.value))
}

watch(themes, saveToStorage, { deep: true })
watch(groupCount, (v) => {
  localStorage.setItem(GROUP_COUNT_KEY, String(v))
})

const sortedThemes = computed(() => {
  return [...themes.value].sort((a, b) => a.order - b.order)
})

const filteredThemes = computed(() => {
  return sortedThemes.value.filter((theme) => {
    if (filters.value.colorScheme && theme.colorScheme !== filters.value.colorScheme) return false
    if (filters.value.pageType && !theme.suitablePages.includes(filters.value.pageType)) return false
    if (filters.value.difficulty && theme.difficulty !== filters.value.difficulty) return false
    if (filters.value.status && theme.status !== filters.value.status) return false
    if (filters.value.responsible && !theme.responsible.includes(filters.value.responsible)) return false
    return true
  })
})

const activeTheme = computed(() => {
  if (!activeThemeId.value) return null
  return themes.value.find((t) => t.id === activeThemeId.value) || null
})

const allResponsibles = computed(() => {
  const set = new Set<string>()
  themes.value.forEach((t) => {
    if (t.responsible) set.add(t.responsible)
  })
  return Array.from(set)
})

const statusCounts = computed(() => {
  const counts: Record<string, number> = {}
  themes.value.forEach((t) => {
    counts[t.status] = (counts[t.status] || 0) + 1
  })
  return counts
})

const alerts = computed<SystemAlert[]>(() => {
  const result: SystemAlert[] = []

  const nameCounts: Record<string, string[]> = {}
  themes.value.forEach((t) => {
    if (!nameCounts[t.name]) nameCounts[t.name] = []
    nameCounts[t.name].push(t.id)
  })
  Object.entries(nameCounts).forEach(([name, ids]) => {
    if (ids.length > 1) {
      result.push({
        id: `dup-${name}`,
        type: 'warning',
        message: `主题名「${name}」重复了 ${ids.length} 次`,
        themeId: ids[0]
      })
    }
  })

  const colorCounts: Record<string, number> = {}
  themes.value.forEach((t) => {
    colorCounts[t.colorScheme] = (colorCounts[t.colorScheme] || 0) + 1
  })
  Object.entries(colorCounts).forEach(([color, count]) => {
    if (count >= 3) {
      result.push({
        id: `color-${color}`,
        type: 'info',
        message: `${color}主题较多（${count}个），建议平衡色系分布`
      })
    }
  })

  themes.value.forEach((t) => {
    if (t.stickerCount < 10) {
      result.push({
        id: `low-${t.id}`,
        type: 'error',
        message: `「${t.name}」贴纸数量不足（仅${t.stickerCount}张）`,
        themeId: t.id
      })
    }
  })

  themes.value.forEach((t) => {
    if (t.estimatedTime > 90) {
      result.push({
        id: `time-${t.id}`,
        type: 'warning',
        message: `「${t.name}」预计用时过长（${t.estimatedTime}分钟）`,
        themeId: t.id
      })
    }
  })

  themes.value.forEach((t) => {
    if (t.status !== '暂缓' && t.status !== '仅展示' && !t.notes.trim()) {
      result.push({
        id: `note-${t.id}`,
        type: 'info',
        message: `「${t.name}」缺少备注说明`,
        themeId: t.id
      })
    }
  })

  return result
})

const activityPackages = computed<ActivityPackage[]>(() => {
  const usableThemes = filteredThemes.value.filter(
    (t) => t.status === '可使用' || t.status === '需补充'
  )
  const packages: ActivityPackage[] = []
  const themesPerGroup = Math.ceil(usableThemes.length / groupCount.value)

  for (let i = 0; i < groupCount.value; i++) {
    const start = i * themesPerGroup
    const groupThemes = usableThemes.slice(start, start + themesPerGroup)
    const gaps: string[] = []

    groupThemes.forEach((t) => {
      if (t.status === '需补充') {
        gaps.push(`${t.name}：需要补充贴纸`)
      }
      if (t.stickerCount < groupCount.value * 5) {
        gaps.push(`${t.name}：贴纸数量可能不够每组分配`)
      }
    })

    const hasCover = groupThemes.some((t) => t.suitablePages.includes('封面'))
    const hasInner = groupThemes.some((t) => t.suitablePages.includes('内页'))
    if (!hasCover) gaps.push('缺少封面页适用主题')
    if (!hasInner) gaps.push('缺少内页适用主题')

    packages.push({
      groupName: `第${i + 1}组`,
      themes: groupThemes,
      totalStickers: groupThemes.reduce((sum, t) => sum + t.stickerCount, 0),
      gaps
    })
  }

  return packages
})

const addTheme = (theme?: Partial<StickerTheme>) => {
  const now = new Date().toISOString()
  const newTheme: StickerTheme = {
    id: generateId(),
    name: theme?.name || '新主题',
    colorScheme: theme?.colorScheme || '粉色系',
    stickerCount: theme?.stickerCount ?? 20,
    suitablePages: theme?.suitablePages || ['内页'],
    example: theme?.example || '',
    difficulty: theme?.difficulty || '简单',
    estimatedTime: theme?.estimatedTime ?? 30,
    responsible: theme?.responsible || '',
    status: theme?.status || '待整理',
    notes: theme?.notes || '',
    todos: theme?.todos || [],
    order: themes.value.length,
    createdAt: now,
    updatedAt: now
  }
  themes.value.push(newTheme)
  activeThemeId.value = newTheme.id
  return newTheme
}

const updateTheme = (id: string, updates: Partial<StickerTheme>) => {
  const idx = themes.value.findIndex((t) => t.id === id)
  if (idx !== -1) {
    themes.value[idx] = {
      ...themes.value[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }
}

const deleteTheme = (id: string) => {
  const idx = themes.value.findIndex((t) => t.id === id)
  if (idx !== -1) {
    themes.value.splice(idx, 1)
    if (activeThemeId.value === id) {
      activeThemeId.value = null
    }
    selectedIds.value = selectedIds.value.filter((sid) => sid !== id)
  }
}

const duplicateTheme = (id: string) => {
  const original = themes.value.find((t) => t.id === id)
  if (original) {
    const now = new Date().toISOString()
    const copy: StickerTheme = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId(),
      name: `${original.name} (副本)`,
      order: themes.value.length,
      createdAt: now,
      updatedAt: now
    }
    themes.value.push(copy)
    activeThemeId.value = copy.id
  }
}

const batchUpdateStatus = (status: ThemeStatus) => {
  selectedIds.value.forEach((id) => {
    updateTheme(id, { status })
  })
}

const batchDelete = () => {
  selectedIds.value.forEach((id) => deleteTheme(id))
  selectedIds.value = []
}

const reorderThemes = (newOrder: StickerTheme[]) => {
  newOrder.forEach((theme, idx) => {
    const found = themes.value.find((t) => t.id === theme.id)
    if (found) {
      found.order = idx
    }
  })
}

const toggleSelect = (id: string) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(idx, 1)
  }
}

const toggleSelectAll = () => {
  if (selectedIds.value.length === filteredThemes.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredThemes.value.map((t) => t.id)
  }
}

const addTodo = (themeId: string, text: string) => {
  const theme = themes.value.find((t) => t.id === themeId)
  if (theme) {
    theme.todos.push(text)
    theme.updatedAt = new Date().toISOString()
  }
}

const removeTodo = (themeId: string, index: number) => {
  const theme = themes.value.find((t) => t.id === themeId)
  if (theme) {
    theme.todos.splice(index, 1)
    theme.updatedAt = new Date().toISOString()
  }
}

const toggleTodo = (themeId: string, index: number) => {
  const theme = themes.value.find((t) => t.id === themeId)
  if (theme && theme.todos[index]) {
    const todo = theme.todos[index]
    if (todo.startsWith('✓ ')) {
      theme.todos[index] = todo.substring(2)
    } else {
      theme.todos[index] = '✓ ' + todo
    }
    theme.updatedAt = new Date().toISOString()
  }
}

const resetFilters = () => {
  filters.value = {
    colorScheme: '',
    pageType: '',
    difficulty: '',
    status: '',
    responsible: ''
  }
}

export const useStickerStore = () => {
  if (themes.value.length === 0) {
    loadFromStorage()
  }

  return {
    themes,
    sortedThemes,
    filteredThemes,
    filters,
    selectedIds,
    activeThemeId,
    activeTheme,
    isPreviewMode,
    groupCount,
    allResponsibles,
    statusCounts,
    alerts,
    activityPackages,
    addTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,
    batchUpdateStatus,
    batchDelete,
    reorderThemes,
    toggleSelect,
    toggleSelectAll,
    addTodo,
    removeTodo,
    toggleTodo,
    resetFilters,
    loadFromStorage
  }
}

export const colorSchemes: ColorScheme[] = [
  '粉色系', '蓝色系', '绿色系', '黄色系', '紫色系', '橙色系',
  '红色系', '黑白灰', '莫兰迪', '复古色', '马卡龙', '大地色'
]

export const pageTypes: PageType[] = ['封面', '内页', '分隔页', '口袋页', '折叠页', '装饰页']

export const difficulties: DifficultyLevel[] = ['简单', '中等', '困难']

export const statuses: ThemeStatus[] = ['待整理', '可使用', '需补充', '仅展示', '暂缓']

export const colorMap: Record<ColorScheme, string> = {
  '粉色系': '#ffb6c1',
  '蓝色系': '#87ceeb',
  '绿色系': '#90ee90',
  '黄色系': '#ffe4b5',
  '紫色系': '#dda0dd',
  '橙色系': '#ffb347',
  '红色系': '#f08080',
  '黑白灰': '#d3d3d3',
  '莫兰迪': '#b5a898',
  '复古色': '#c4a77d',
  '马卡龙': '#c9b1ff',
  '大地色': '#c19a6b'
}

export const statusColorMap: Record<ThemeStatus, string> = {
  '待整理': '#fbbf24',
  '可使用': '#22c55e',
  '需补充': '#ef4444',
  '仅展示': '#8b5cf6',
  '暂缓': '#6b7280'
}
