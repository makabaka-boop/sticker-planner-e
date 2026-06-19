import { ref, computed, watch } from 'vue'
import type { StickerTheme, FilterState, Status, SystemAlert, PageType, TodoItem, Difficulty } from '../types'

const STORAGE_KEY = 'sticker-planner-data-v2'

const defaultThemes: StickerTheme[] = [
  {
    id: '1',
    name: '春日樱花',
    colorScheme: '粉色系',
    stickerCount: 45,
    pageTypes: ['满版', '边角'],
    example: '粉色樱花飘落，搭配小兔子图案',
    difficulty: '简单',
    estimatedTime: 30,
    owner: '小明',
    status: '可使用',
    notes: '适合春季主题活动',
    todos: [
      { id: 't1', text: '确认贴纸数量', done: true },
      { id: 't2', text: '准备示例页', done: false }
    ],
    order: 0
  },
  {
    id: '2',
    name: '夏日海洋',
    colorScheme: '蓝色系',
    stickerCount: 8,
    pageTypes: ['半版', '边框'],
    example: '海浪、贝壳、海星元素',
    difficulty: '中等',
    estimatedTime: 45,
    owner: '小红',
    status: '需补充',
    notes: '',
    todos: [],
    order: 1
  },
  {
    id: '3',
    name: '秋日枫叶',
    colorScheme: '橙色系',
    stickerCount: 32,
    pageTypes: ['满版', '插页'],
    example: '枫叶、银杏、松鼠图案',
    difficulty: '中等',
    estimatedTime: 60,
    owner: '小明',
    status: '可使用',
    notes: '已准备好展示样品',
    todos: [],
    order: 2
  },
  {
    id: '4',
    name: '冬日雪国',
    colorScheme: '蓝色系',
    stickerCount: 28,
    pageTypes: ['边角', '边框'],
    example: '雪花、企鹅、暖炉元素',
    difficulty: '困难',
    estimatedTime: 95,
    owner: '小李',
    status: '待整理',
    notes: '',
    todos: [
      { id: 't3', text: '补充企鹅贴纸', done: false }
    ],
    order: 3
  },
  {
    id: '5',
    name: '春日樱花',
    colorScheme: '粉色系',
    stickerCount: 20,
    pageTypes: ['半版'],
    example: '樱花和果子主题',
    difficulty: '简单',
    estimatedTime: 25,
    owner: '小红',
    status: '仅展示',
    notes: '这是重复名称的示例',
    todos: [],
    order: 4
  }
]

function loadFromStorage(): StickerTheme[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
  return defaultThemes
}

function saveToStorage(themes: StickerTheme[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

export function useStickerStore() {
  const themes = ref<StickerTheme[]>(loadFromStorage())
  const selectedIds = ref<Set<string>>(new Set())
  const activeThemeId = ref<string | null>(null)
  const isPreviewMode = ref(false)

  const filters = ref<FilterState>({
    colorScheme: '',
    pageType: '',
    difficulty: '',
    status: '',
    owner: ''
  })

  watch(themes, (newThemes) => {
    saveToStorage(newThemes)
  }, { deep: true })

  const colorSchemes = computed(() => {
    const set = new Set(themes.value.map(t => t.colorScheme).filter(Boolean))
    return Array.from(set)
  })

  const pageTypes: PageType[] = ['满版', '半版', '边角', '边框', '插页']
  const difficulties: Difficulty[] = ['简单', '中等', '困难']
  const statuses: Status[] = ['待整理', '可使用', '需补充', '仅展示', '暂缓']

  const owners = computed(() => {
    const set = new Set(themes.value.map(t => t.owner).filter(Boolean))
    return Array.from(set)
  })

  const filteredThemes = computed(() => {
    return themes.value
      .filter(t => {
        if (filters.value.colorScheme && t.colorScheme !== filters.value.colorScheme) return false
        if (filters.value.pageType && !t.pageTypes.includes(filters.value.pageType as PageType)) return false
        if (filters.value.difficulty && t.difficulty !== filters.value.difficulty) return false
        if (filters.value.status && t.status !== filters.value.status) return false
        if (filters.value.owner && t.owner !== filters.value.owner) return false
        return true
      })
      .sort((a, b) => a.order - b.order)
  })

  const activeTheme = computed(() => {
    if (!activeThemeId.value) return null
    return themes.value.find(t => t.id === activeThemeId.value) || null
  })

  const alerts = computed<SystemAlert[]>(() => {
    const result: SystemAlert[] = []
    const nameCount = new Map<string, number>()
    const colorCount = new Map<string, number>()

    themes.value.forEach(t => {
      nameCount.set(t.name, (nameCount.get(t.name) || 0) + 1)
      colorCount.set(t.colorScheme, (colorCount.get(t.colorScheme) || 0) + 1)
    })

    themes.value.forEach(t => {
      if (t.stickerCount < 10) {
        result.push({
          id: `alert-${t.id}-low`,
          themeId: t.id,
          themeName: t.name,
          type: 'low_stock',
          message: `贴纸数量不足（${t.stickerCount}张），建议补充到10张以上`,
          level: 'error'
        })
      }

      if (nameCount.get(t.name)! > 1) {
        result.push({
          id: `alert-${t.id}-dup`,
          themeId: t.id,
          themeName: t.name,
          type: 'duplicate_name',
          message: `主题名「${t.name}」存在重复（共${nameCount.get(t.name)}个）`,
          level: 'warning'
        })
      }

      if (t.estimatedTime > 90) {
        result.push({
          id: `alert-${t.id}-time`,
          themeId: t.id,
          themeName: t.name,
          type: 'long_time',
          message: `预计用时过长（${t.estimatedTime}分钟），建议拆分任务`,
          level: 'warning'
        })
      }

      if (!t.notes || t.notes.trim() === '') {
        result.push({
          id: `alert-${t.id}-notes`,
          themeId: t.id,
          themeName: t.name,
          type: 'missing_notes',
          message: '缺少备注说明',
          level: 'info'
        })
      }
    })

    colorCount.forEach((count, color) => {
      if (count >= 3) {
        themes.value.filter(t => t.colorScheme === color).forEach(t => {
          result.push({
            id: `alert-${t.id}-color`,
            themeId: t.id,
            themeName: t.name,
            type: 'color_concentration',
            message: `「${color}」主题过于集中（共${count}个），建议增加其他色系`,
            level: 'info'
          })
        })
      }
    })

    return result
  })

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function addTheme() {
    const maxOrder = themes.value.reduce((max, t) => Math.max(max, t.order), -1)
    const newTheme: StickerTheme = {
      id: generateId(),
      name: '新主题',
      colorScheme: '',
      stickerCount: 0,
      pageTypes: [],
      example: '',
      difficulty: '简单',
      estimatedTime: 30,
      owner: '',
      status: '待整理',
      notes: '',
      todos: [],
      order: maxOrder + 1
    }
    themes.value.push(newTheme)
    activeThemeId.value = newTheme.id
    return newTheme
  }

  function updateTheme(id: string, updates: Partial<StickerTheme>) {
    const idx = themes.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      themes.value[idx] = { ...themes.value[idx], ...updates }
    }
  }

  function deleteTheme(id: string) {
    const idx = themes.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      themes.value.splice(idx, 1)
      if (activeThemeId.value === id) {
        activeThemeId.value = null
      }
      selectedIds.value.delete(id)
    }
  }

  function duplicateTheme(id: string) {
    const source = themes.value.find(t => t.id === id)
    if (source) {
      const maxOrder = themes.value.reduce((max, t) => Math.max(max, t.order), -1)
      const newTheme: StickerTheme = {
        ...JSON.parse(JSON.stringify(source)),
        id: generateId(),
        name: source.name + ' (副本)',
        order: maxOrder + 1,
        todos: source.todos.map(todo => ({ ...todo, id: generateId() }))
      }
      themes.value.push(newTheme)
      activeThemeId.value = newTheme.id
      return newTheme
    }
  }

  function toggleSelect(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
    selectedIds.value = new Set(selectedIds.value)
  }

  function selectAll() {
    filteredThemes.value.forEach(t => selectedIds.value.add(t.id))
    selectedIds.value = new Set(selectedIds.value)
  }

  function clearSelection() {
    selectedIds.value.clear()
    selectedIds.value = new Set(selectedIds.value)
  }

  function batchUpdateStatus(status: Status) {
    selectedIds.value.forEach(id => {
      updateTheme(id, { status })
    })
    clearSelection()
  }

  function batchDelete() {
    selectedIds.value.forEach(id => deleteTheme(id))
    clearSelection()
  }

  function reorderThemes(fromIndex: number, toIndex: number) {
    const list = filteredThemes.value
    const fromId = list[fromIndex].id
    const toId = list[toIndex].id
    
    const fromTheme = themes.value.find(t => t.id === fromId)!
    const toTheme = themes.value.find(t => t.id === toId)!
    
    const tempOrder = fromTheme.order
    fromTheme.order = toTheme.order
    toTheme.order = tempOrder
  }

  function addTodo(themeId: string, text: string) {
    const theme = themes.value.find(t => t.id === themeId)
    if (theme) {
      theme.todos.push({
        id: generateId(),
        text,
        done: false
      })
    }
  }

  function toggleTodo(themeId: string, todoId: string) {
    const theme = themes.value.find(t => t.id === themeId)
    if (theme) {
      const todo = theme.todos.find(t => t.id === todoId)
      if (todo) {
        todo.done = !todo.done
      }
    }
  }

  function deleteTodo(themeId: string, todoId: string) {
    const theme = themes.value.find(t => t.id === themeId)
    if (theme) {
      const idx = theme.todos.findIndex(t => t.id === todoId)
      if (idx !== -1) {
        theme.todos.splice(idx, 1)
      }
    }
  }

  function resetFilters() {
    filters.value = {
      colorScheme: '',
      pageType: '',
      difficulty: '',
      status: '',
      owner: ''
    }
  }

  function getActivityGroups() {
    const availableThemes = filteredThemes.value.filter(
      t => t.status === '可使用' || t.status === '需补充'
    )
    
    const owners = Array.from(new Set(availableThemes.map(t => t.owner).filter(Boolean)))
    const unassigned = availableThemes.filter(t => !t.owner)
    
    const groups = owners.map(owner => {
      const ownerThemes = availableThemes.filter(t => t.owner === owner)
      const totalStickers = ownerThemes.reduce((sum, t) => sum + t.stickerCount, 0)
      const gaps: string[] = []
      
      const missingPageTypes = pageTypes.filter(pt => 
        !ownerThemes.some(t => t.pageTypes.includes(pt))
      )
      if (missingPageTypes.length > 0) {
        gaps.push(`缺少页型: ${missingPageTypes.join(', ')}`)
      }
      
      ownerThemes.forEach(t => {
        if (t.stickerCount < 10) {
          gaps.push(`「${t.name}」贴纸不足（${t.stickerCount}张）`)
        }
        if (t.status === '需补充') {
          gaps.push(`「${t.name}」状态为需补充`)
        }
      })

      const colors = new Set(ownerThemes.map(t => t.colorScheme))
      if (colors.size < 2) {
        gaps.push('色系单一，建议增加其他色系')
      }
      
      return {
        name: owner,
        themes: ownerThemes,
        totalStickers,
        gaps
      }
    })

    if (unassigned.length > 0) {
      groups.push({
        name: '未分配',
        themes: unassigned,
        totalStickers: unassigned.reduce((sum, t) => sum + t.stickerCount, 0),
        gaps: ['尚未分配责任人']
      })
    }
    
    return groups
  }

  return {
    themes,
    filters,
    selectedIds,
    activeThemeId,
    activeTheme,
    isPreviewMode,
    filteredThemes,
    colorSchemes,
    pageTypes,
    difficulties,
    statuses,
    owners,
    alerts,
    addTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,
    toggleSelect,
    selectAll,
    clearSelection,
    batchUpdateStatus,
    batchDelete,
    reorderThemes,
    addTodo,
    toggleTodo,
    deleteTodo,
    resetFilters,
    getActivityGroups
  }
}
