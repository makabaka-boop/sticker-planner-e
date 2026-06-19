import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { FilterState, PlannerSettings, StickerTheme, ThemeStatus, TodoItem } from '@/types'
import { defaultColorFamilies, defaultOwners, defaultPageTypes, seedThemes } from '@/data/seed'

const uid = (prefix = 'id'): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

const emptyFilter = (): FilterState => ({
  colorFamilies: [],
  pageTypes: [],
  difficulties: [],
  statuses: [],
  owners: [],
  keyword: '',
})

export const usePlannerStore = defineStore('planner', () => {
  const themes = ref<StickerTheme[]>([...seedThemes])
  const settings = ref<PlannerSettings>({
    colorFamilies: [...defaultColorFamilies],
    pageTypes: [...defaultPageTypes],
    owners: [...defaultOwners],
    viewMode: 'organize',
  })
  const filter = ref<FilterState>(emptyFilter())
  const selectedIds = ref<Set<string>>(new Set())
  const activeThemeId = ref<string | null>(null)
  const lastSavedAt = ref<number>(Date.now())

  const sortedThemes = computed(() =>
    [...themes.value].sort((a, b) => a.order - b.order),
  )

  const filteredThemes = computed(() => {
    const f = filter.value
    const kw = f.keyword.trim().toLowerCase()
    return sortedThemes.value.filter((t) => {
      if (f.colorFamilies.length && !f.colorFamilies.includes(t.colorFamily)) return false
      if (f.pageTypes.length && !t.pageTypes.some((p) => f.pageTypes.includes(p))) return false
      if (f.difficulties.length && !f.difficulties.includes(t.difficulty)) return false
      if (f.statuses.length && !f.statuses.includes(t.status)) return false
      if (f.owners.length && !f.owners.includes(t.owner)) return false
      if (kw) {
        const blob = `${t.name} ${t.example} ${t.note} ${t.owner}`.toLowerCase()
        if (!blob.includes(kw)) return false
      }
      return true
    })
  })

  const stats = computed(() => {
    const total = themes.value.length
    const totalStickers = themes.value.reduce((s, t) => s + t.stickerCount, 0)
    const avgMinutes = total
      ? Math.round(themes.value.reduce((s, t) => s + t.estimatedMinutes, 0) / total)
      : 0
    const statusCount: Record<ThemeStatus, number> = {
      pending: 0,
      ready: 0,
      shortage: 0,
      displayOnly: 0,
      paused: 0,
    }
    themes.value.forEach((t) => {
      statusCount[t.status] += 1
    })
    return { total, totalStickers, avgMinutes, statusCount }
  })

  const touch = () => {
    lastSavedAt.value = Date.now()
  }

  function addTheme(payload: Omit<StickerTheme, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'todos'> & { todos?: TodoItem[] }) {
    const order = themes.value.length
      ? Math.max(...themes.value.map((t) => t.order)) + 1
      : 0
    const now = Date.now()
    const theme: StickerTheme = {
      ...payload,
      id: uid('t'),
      todos: payload.todos ?? [],
      order,
      createdAt: now,
      updatedAt: now,
    }
    themes.value.push(theme)
    touch()
    return theme
  }

  function updateTheme(id: string, patch: Partial<StickerTheme>) {
    const idx = themes.value.findIndex((t) => t.id === id)
    if (idx >= 0) {
      themes.value[idx] = { ...themes.value[idx], ...patch, updatedAt: Date.now() }
      touch()
    }
  }

  function removeTheme(id: string) {
    themes.value = themes.value.filter((t) => t.id !== id)
    selectedIds.value.delete(id)
    if (activeThemeId.value === id) activeThemeId.value = null
    touch()
  }

  function duplicateTheme(id: string) {
    const src = themes.value.find((t) => t.id === id)
    if (!src) return null
    const copy = addTheme({
      name: `${src.name} · 副本`,
      colorFamily: src.colorFamily,
      stickerCount: src.stickerCount,
      pageTypes: [...src.pageTypes],
      example: src.example,
      difficulty: src.difficulty,
      estimatedMinutes: src.estimatedMinutes,
      owner: src.owner,
      status: 'pending',
      note: src.note,
      todos: src.todos.map((td) => ({ ...td, id: uid('td') })),
    })
    return copy
  }

  function reorderThemes(orderedIds: string[]) {
    const map = new Map(themes.value.map((t) => [t.id, t]))
    orderedIds.forEach((id, idx) => {
      const t = map.get(id)
      if (t) t.order = idx
    })
    touch()
  }

  function bulkUpdateStatus(ids: string[], status: ThemeStatus) {
    const now = Date.now()
    themes.value.forEach((t) => {
      if (ids.includes(t.id)) {
        t.status = status
        t.updatedAt = now
      }
    })
    touch()
  }

  function bulkDuplicate(ids: string[]) {
    ids.forEach((id) => duplicateTheme(id))
  }

  function bulkRemove(ids: string[]) {
    themes.value = themes.value.filter((t) => !ids.includes(t.id))
    selectedIds.value.clear()
    touch()
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedIds.value = next
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  function setActiveTheme(id: string | null) {
    activeThemeId.value = id
  }

  function addTodo(themeId: string, content: string) {
    const t = themes.value.find((x) => x.id === themeId)
    if (!t || !content.trim()) return
    t.todos.push({ id: uid('td'), content: content.trim(), done: false, createdAt: Date.now() })
    t.updatedAt = Date.now()
    touch()
  }

  function toggleTodo(themeId: string, todoId: string) {
    const t = themes.value.find((x) => x.id === themeId)
    const td = t?.todos.find((x) => x.id === todoId)
    if (td) {
      td.done = !td.done
      t!.updatedAt = Date.now()
      touch()
    }
  }

  function removeTodo(themeId: string, todoId: string) {
    const t = themes.value.find((x) => x.id === themeId)
    if (!t) return
    t.todos = t.todos.filter((td) => td.id !== todoId)
    t.updatedAt = Date.now()
    touch()
  }

  function updateNote(themeId: string, note: string) {
    const t = themes.value.find((x) => x.id === themeId)
    if (!t) return
    t.note = note
    t.updatedAt = Date.now()
    touch()
  }

  function setFilter(patch: Partial<FilterState>) {
    filter.value = { ...filter.value, ...patch }
  }

  function clearFilter() {
    filter.value = emptyFilter()
  }

  function setViewMode(mode: PlannerSettings['viewMode']) {
    settings.value.viewMode = mode
  }

  function exportData() {
    return JSON.stringify(
      { themes: themes.value, settings: settings.value, version: '1.0' },
      null,
      2,
    )
  }

  function importData(json: string) {
    try {
      const obj = JSON.parse(json)
      if (Array.isArray(obj.themes)) {
        themes.value = obj.themes
      }
      if (obj.settings) {
        settings.value = { ...settings.value, ...obj.settings }
      }
      touch()
      return true
    } catch (_e) {
      return false
    }
  }

  function resetToSeed() {
    themes.value = [...seedThemes]
    selectedIds.value = new Set()
    activeThemeId.value = null
    filter.value = emptyFilter()
    touch()
  }

  return {
    themes,
    settings,
    filter,
    selectedIds,
    activeThemeId,
    lastSavedAt,
    sortedThemes,
    filteredThemes,
    stats,
    addTheme,
    updateTheme,
    removeTheme,
    duplicateTheme,
    reorderThemes,
    bulkUpdateStatus,
    bulkDuplicate,
    bulkRemove,
    toggleSelect,
    clearSelection,
    setActiveTheme,
    addTodo,
    toggleTodo,
    removeTodo,
    updateNote,
    setFilter,
    clearFilter,
    setViewMode,
    exportData,
    importData,
    resetToSeed,
  }
}, {
  persist: {
    key: 'sticker-planner:v1',
    paths: ['themes', 'settings', 'lastSavedAt'],
  } as any,
})
