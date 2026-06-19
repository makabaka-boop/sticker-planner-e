import { ref, computed, watch } from 'vue'
import type { ThemeRecord, FilterState, ThemeStatus, ColorScheme, PageType, TodoItem } from '@/types'
import { generateId } from '@/utils/id'
import { loadFromStorage, saveToStorage } from '@/utils/storage'

const themes = ref<ThemeRecord[]>([])
const selectedIds = ref<Set<string>>(new Set())
const filter = ref<FilterState>({
  colorScheme: '',
  pageType: '',
  difficulty: '',
  status: '',
  assignee: '',
  keyword: ''
})
const activeThemeId = ref<string | null>(null)
const viewMode = ref<'list' | 'preview'>('list')
const isFormOpen = ref(false)
const editingTheme = ref<ThemeRecord | null>(null)

function getSampleData(): ThemeRecord[] {
  const now = new Date().toISOString()
  return [
    {
      id: generateId(),
      themeName: '春日樱花',
      colorScheme: 'peachPink',
      stickerCount: 12,
      pageTypes: ['cover', 'collage', 'decoration'],
      exampleDesc: '粉色樱花花瓣、和风图案，适合春季主题封面',
      difficulty: 3,
      estimatedTime: 30,
      assignee: '小明',
      status: 'ready',
      notes: '已准备好20份，足够活动使用',
      todos: [
        { id: generateId(), text: '裁剪贴纸', done: true },
        { id: generateId(), text: '分装成小包', done: false }
      ],
      order: 0,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      themeName: '森林午后',
      colorScheme: 'mintGreen',
      stickerCount: 3,
      pageTypes: ['daily', 'decoration'],
      exampleDesc: '绿色植物、小动物图案，自然清新',
      difficulty: 2,
      estimatedTime: 20,
      assignee: '小红',
      status: 'needSupplement',
      notes: '',
      todos: [],
      order: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      themeName: '阳光柠檬',
      colorScheme: 'lemonYellow',
      stickerCount: 8,
      pageTypes: ['monthly', 'weekly'],
      exampleDesc: '明亮黄色系，柠檬、太阳图案，充满活力',
      difficulty: 2,
      estimatedTime: 75,
      assignee: '小明',
      status: 'pending',
      notes: '',
      todos: [],
      order: 2,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      themeName: '薰衣草梦境',
      colorScheme: 'lavenderPurple',
      stickerCount: 15,
      pageTypes: ['titlePage', 'collage'],
      exampleDesc: '紫色梦幻风格，星空、薰衣草元素',
      difficulty: 4,
      estimatedTime: 45,
      assignee: '小华',
      status: 'ready',
      notes: '超美的紫色系，大家都很喜欢',
      todos: [],
      order: 3,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      themeName: '夏日海洋',
      colorScheme: 'skyBlue',
      stickerCount: 6,
      pageTypes: ['cover', 'weekly', 'decoration'],
      exampleDesc: '蓝色海洋风，海浪、贝壳、小鱼图案',
      difficulty: 3,
      estimatedTime: 35,
      assignee: '',
      status: 'displayOnly',
      notes: '仅作为展示样品，不参与分配',
      todos: [],
      order: 4,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      themeName: '蜜桃粉恋',
      colorScheme: 'peachPink',
      stickerCount: 9,
      pageTypes: ['daily', 'collage'],
      exampleDesc: '另一个粉色系主题，水蜜桃、爱心元素',
      difficulty: 2,
      estimatedTime: 25,
      assignee: '小红',
      status: 'ready',
      notes: '',
      todos: [],
      order: 5,
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      themeName: '草莓甜心',
      colorScheme: 'peachPink',
      stickerCount: 11,
      pageTypes: ['decoration'],
      exampleDesc: '草莓、蛋糕、甜点图案',
      difficulty: 1,
      estimatedTime: 15,
      assignee: '小华',
      status: 'pending',
      notes: '',
      todos: [],
      order: 6,
      createdAt: now,
      updatedAt: now
    }
  ]
}

function initStore() {
  const stored = loadFromStorage()
  if (stored && stored.length > 0) {
    themes.value = stored
  } else {
    themes.value = getSampleData()
  }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null
function triggerSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveToStorage(themes.value)
  }, 300)
}

watch(themes, triggerSave, { deep: true })

const filteredThemes = computed(() => {
  let result = [...themes.value].sort((a, b) => a.order - b.order)
  
  if (filter.value.keyword) {
    const kw = filter.value.keyword.toLowerCase()
    result = result.filter(t => 
      t.themeName.toLowerCase().includes(kw) ||
      t.exampleDesc.toLowerCase().includes(kw) ||
      t.assignee.toLowerCase().includes(kw)
    )
  }
  if (filter.value.colorScheme) {
    result = result.filter(t => t.colorScheme === filter.value.colorScheme)
  }
  if (filter.value.pageType) {
    result = result.filter(t => t.pageTypes.includes(filter.value.pageType as PageType))
  }
  if (filter.value.difficulty !== '') {
    result = result.filter(t => t.difficulty === filter.value.difficulty)
  }
  if (filter.value.status) {
    result = result.filter(t => t.status === filter.value.status)
  }
  if (filter.value.assignee) {
    result = result.filter(t => t.assignee.includes(filter.value.assignee))
  }
  
  return result
})

const activeTheme = computed(() => {
  if (!activeThemeId.value) return null
  return themes.value.find(t => t.id === activeThemeId.value) || null
})

const assignees = computed(() => {
  const set = new Set<string>()
  themes.value.forEach(t => {
    if (t.assignee) set.add(t.assignee)
  })
  return Array.from(set)
})

const stats = computed(() => {
  const total = themes.value.length
  const byStatus: Record<ThemeStatus, number> = {
    pending: 0,
    ready: 0,
    needSupplement: 0,
    displayOnly: 0,
    shelved: 0
  }
  let totalStickers = 0
  let totalTime = 0
  themes.value.forEach(t => {
    byStatus[t.status]++
    totalStickers += t.stickerCount
    totalTime += t.estimatedTime
  })
  return { total, byStatus, totalStickers, totalTime }
})

function addTheme(data: Omit<ThemeRecord, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'todos'> & { todos?: TodoItem[] }) {
  const now = new Date().toISOString()
  const maxOrder = themes.value.reduce((max, t) => Math.max(max, t.order), -1)
  const newTheme: ThemeRecord = {
    ...data,
    id: generateId(),
    todos: data.todos || [],
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now
  }
  themes.value.push(newTheme)
  return newTheme
}

function updateTheme(id: string, updates: Partial<ThemeRecord>) {
  const idx = themes.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    themes.value[idx] = {
      ...themes.value[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }
}

function deleteTheme(id: string) {
  const idx = themes.value.findIndex(t => t.id === id)
  if (idx !== -1) {
    themes.value.splice(idx, 1)
  }
  if (activeThemeId.value === id) {
    activeThemeId.value = null
  }
  selectedIds.value.delete(id)
}

function duplicateTheme(id: string) {
  const source = themes.value.find(t => t.id === id)
  if (source) {
    const now = new Date().toISOString()
    const maxOrder = themes.value.reduce((max, t) => Math.max(max, t.order), -1)
    const copy: ThemeRecord = {
      ...JSON.parse(JSON.stringify(source)),
      id: generateId(),
      themeName: source.themeName + ' (副本)',
      todos: source.todos.map(todo => ({ ...todo, id: generateId() })),
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now
    }
    themes.value.push(copy)
    return copy
  }
}

function reorderThemes(newOrder: ThemeRecord[]) {
  newOrder.forEach((theme, idx) => {
    const t = themes.value.find(item => item.id === theme.id)
    if (t) t.order = idx
  })
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

function bulkUpdateStatus(status: ThemeStatus) {
  selectedIds.value.forEach(id => {
    updateTheme(id, { status })
  })
  clearSelection()
}

function bulkDelete() {
  selectedIds.value.forEach(id => deleteTheme(id))
  clearSelection()
}

function bulkDuplicate() {
  const ids = Array.from(selectedIds.value)
  ids.forEach(id => duplicateTheme(id))
  clearSelection()
}

function openAddForm() {
  editingTheme.value = null
  isFormOpen.value = true
}

function openEditForm(theme?: ThemeRecord) {
  editingTheme.value = theme || activeTheme.value
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editingTheme.value = null
}

function openDetail(id: string) {
  activeThemeId.value = id
}

function closeDetail() {
  activeThemeId.value = null
}

function addTodo(themeId: string, text: string) {
  const theme = themes.value.find(t => t.id === themeId)
  if (theme) {
    theme.todos.push({ id: generateId(), text, done: false })
  }
}

function toggleTodo(themeId: string, todoId: string) {
  const theme = themes.value.find(t => t.id === themeId)
  if (theme) {
    const todo = theme.todos.find(t => t.id === todoId)
    if (todo) todo.done = !todo.done
  }
}

function deleteTodo(themeId: string, todoId: string) {
  const theme = themes.value.find(t => t.id === themeId)
  if (theme) {
    const idx = theme.todos.findIndex(t => t.id === todoId)
    if (idx !== -1) theme.todos.splice(idx, 1)
  }
}

function updateNotes(themeId: string, notes: string) {
  updateTheme(themeId, { notes })
}

function resetFilters() {
  filter.value = {
    colorScheme: '',
    pageType: '',
    difficulty: '',
    status: '',
    assignee: '',
    keyword: ''
  }
}

function togglePreviewMode() {
  viewMode.value = viewMode.value === 'list' ? 'preview' : 'list'
}

export function useThemeStore() {
  if (themes.value.length === 0) {
    initStore()
  }
  
  return {
    themes,
    filteredThemes,
    selectedIds,
    filter,
    activeThemeId,
    activeTheme,
    viewMode,
    isFormOpen,
    editingTheme,
    assignees,
    stats,
    addTheme,
    updateTheme,
    deleteTheme,
    duplicateTheme,
    reorderThemes,
    toggleSelect,
    selectAll,
    clearSelection,
    bulkUpdateStatus,
    bulkDelete,
    bulkDuplicate,
    openAddForm,
    openEditForm,
    closeForm,
    openDetail,
    closeDetail,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateNotes,
    resetFilters,
    togglePreviewMode
  }
}
