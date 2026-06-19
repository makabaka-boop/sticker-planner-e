<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useStickerStore } from '../composables/useStickerStore'
import DetailPanel from '../components/DetailPanel.vue'
import ActivityPreview from '../components/ActivityPreview.vue'
import type { StickerTheme, Status, PageType, Difficulty } from '../types'

const storeRaw = useStickerStore()
const store = reactive({
  themes: storeRaw.themes,
  filters: storeRaw.filters,
  selectedIds: storeRaw.selectedIds,
  activeThemeId: storeRaw.activeThemeId,
  activeTheme: storeRaw.activeTheme,
  isPreviewMode: storeRaw.isPreviewMode,
  filteredThemes: storeRaw.filteredThemes,
  colorSchemes: storeRaw.colorSchemes,
  pageTypes: storeRaw.pageTypes,
  difficulties: storeRaw.difficulties,
  statuses: storeRaw.statuses,
  owners: storeRaw.owners,
  alerts: storeRaw.alerts,
  addTheme: storeRaw.addTheme,
  updateTheme: storeRaw.updateTheme,
  deleteTheme: storeRaw.deleteTheme,
  duplicateTheme: storeRaw.duplicateTheme,
  toggleSelect: storeRaw.toggleSelect,
  selectAll: storeRaw.selectAll,
  clearSelection: storeRaw.clearSelection,
  batchUpdateStatus: storeRaw.batchUpdateStatus,
  batchDelete: storeRaw.batchDelete,
  reorderThemes: storeRaw.reorderThemes,
  addTodo: storeRaw.addTodo,
  toggleTodo: storeRaw.toggleTodo,
  deleteTodo: storeRaw.deleteTodo,
  resetFilters: storeRaw.resetFilters,
  getActivityGroups: storeRaw.getActivityGroups
})

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const showBatchStatus = ref(false)
const showAlertPanel = ref(true)

const errorAlerts = computed(() => store.alerts.filter(a => a.level === 'error'))
const warningAlerts = computed(() => store.alerts.filter(a => a.level === 'warning'))

const previewGroups = computed(() => store.getActivityGroups())
const previewTotalThemes = computed(() => 
  previewGroups.value.reduce((sum, g) => sum + g.themes.length, 0)
)
const previewTotalStickers = computed(() => 
  previewGroups.value.reduce((sum, g) => sum + g.totalStickers, 0)
)

function getStatusBadgeClass(status: Status) {
  const map: Record<Status, string> = {
    '待整理': 'badge-muted',
    '可使用': 'badge-success',
    '需补充': 'badge-danger',
    '仅展示': 'badge-info',
    '暂缓': 'badge-warning'
  }
  return map[status]
}

function getDifficultyBadgeClass(diff: Difficulty) {
  const map: Record<Difficulty, string> = {
    '简单': 'badge-success',
    '中等': 'badge-warning',
    '困难': 'badge-danger'
  }
  return map[diff]
}

function getColorDot(colorScheme: string): string {
  const colorMap: Record<string, string> = {
    '粉色系': '#ffb6c1',
    '蓝色系': '#87ceeb',
    '橙色系': '#ffb347',
    '绿色系': '#90ee90',
    '紫色系': '#dda0dd',
    '黄色系': '#ffeaa7',
    '红色系': '#f08080',
    '棕色系': '#deb887',
    '灰色系': '#c0c0c0'
  }
  return colorMap[colorScheme] || '#d4a5a5'
}

function hasThemeAlerts(themeId: string) {
  return store.alerts.some(a => a.themeId === themeId)
}

function selectTheme(theme: StickerTheme) {
  store.activeThemeId = theme.id
}

function handleRowClick(theme: StickerTheme, event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') return
  if (target.closest('.row-actions')) return
  selectTheme(theme)
}

function onDragStart(e: DragEvent, index: number) {
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  dragOverIndex.value = index
}

function onDragLeave() {
  dragOverIndex.value = null
}

function onDrop(e: DragEvent, index: number) {
  e.preventDefault()
  if (dragIndex.value !== null && dragIndex.value !== index) {
    store.reorderThemes(dragIndex.value, index)
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

function handleDelete(id: string) {
  if (confirm('确定要删除这个主题吗？')) {
    store.deleteTheme(id)
  }
}

function handleBatchDelete() {
  if (confirm(`确定要删除选中的 ${store.selectedIds.size} 个主题吗？`)) {
    store.batchDelete()
    showBatchStatus.value = false
  }
}

function openPreview() {
  store.isPreviewMode = true
}

function closePreview() {
  store.isPreviewMode = false
}

function togglePageTypeFilter(pt: PageType) {
  store.filters.pageType = store.filters.pageType === pt ? '' : pt
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-left">
        <h1>✨ 手账贴纸主题整理</h1>
        <span class="header-subtitle">活动前规划 · 贴纸包管理</span>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary" @click="openPreview">
          🎁 活动包预览
        </button>
        <button class="btn btn-primary" @click="store.addTheme()">
          ➕ 新增主题
        </button>
      </div>
    </header>

    <div class="alerts-banner" v-if="showAlertPanel && store.alerts.length > 0">
      <div class="alerts-header">
        <span>📋 系统提示 ({{ store.alerts.length }})</span>
        <button class="alerts-close" @click="showAlertPanel = false">✕</button>
      </div>
      <div class="alerts-content">
        <div v-if="errorAlerts.length > 0" class="alert-group">
          <span class="alert-group-label">❌ 需处理</span>
          <span v-for="a in errorAlerts.slice(0, 3)" :key="a.id" class="alert-text">
            {{ a.themeName }}: {{ a.message }}
          </span>
          <span v-if="errorAlerts.length > 3" class="alert-more">+{{ errorAlerts.length - 3 }} 更多</span>
        </div>
        <div v-if="warningAlerts.length > 0" class="alert-group">
          <span class="alert-group-label">⚠️ 警告</span>
          <span v-for="a in warningAlerts.slice(0, 2)" :key="a.id" class="alert-text">
            {{ a.themeName }}: {{ a.message }}
          </span>
          <span v-if="warningAlerts.length > 2" class="alert-more">+{{ warningAlerts.length - 2 }} 更多</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="content-area" :class="{ 'with-panel': store.activeThemeId }">
        <div class="filter-bar">
          <div class="filter-row">
            <div class="filter-item">
              <label>色系</label>
              <select v-model="store.filters.colorScheme">
                <option value="">全部</option>
                <option v-for="c in store.colorSchemes" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="filter-item">
              <label>难度</label>
              <select v-model="store.filters.difficulty">
                <option value="">全部</option>
                <option v-for="d in store.difficulties" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="filter-item">
              <label>状态</label>
              <select v-model="store.filters.status">
                <option value="">全部</option>
                <option v-for="s in store.statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="filter-item">
              <label>责任人</label>
              <select v-model="store.filters.owner">
                <option value="">全部</option>
                <option v-for="o in store.owners" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
            <button class="btn btn-sm btn-outline" @click="store.resetFilters()">重置筛选</button>
          </div>
          <div class="page-type-filter">
            <label>页型:</label>
            <button 
              v-for="pt in store.pageTypes" 
              :key="pt"
              :class="['page-type-chip', { active: store.filters.pageType === pt }]"
              @click="togglePageTypeFilter(pt)"
            >
              {{ pt }}
            </button>
          </div>
        </div>

        <div class="batch-bar" v-if="store.selectedIds.size > 0">
          <div class="batch-info">
            已选择 <strong>{{ store.selectedIds.size }}</strong> 项
          </div>
          <div class="batch-actions">
            <div class="batch-status-dropdown">
              <button class="btn btn-sm btn-secondary" @click="showBatchStatus = !showBatchStatus">
                批量改状态 ▾
              </button>
              <div v-if="showBatchStatus" class="dropdown-menu">
                <button 
                  v-for="s in store.statuses" 
                  :key="s" 
                  class="dropdown-item"
                  @click="store.batchUpdateStatus(s); showBatchStatus = false"
                >
                  {{ s }}
                </button>
              </div>
            </div>
            <button class="btn btn-sm btn-danger" @click="handleBatchDelete">批量删除</button>
            <button class="btn btn-sm btn-outline" @click="store.clearSelection()">取消选择</button>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="col-checkbox">
                  <input 
                    type="checkbox"
                    :checked="store.selectedIds.size === store.filteredThemes.length && store.filteredThemes.length > 0"
                    @change="store.selectedIds.size === store.filteredThemes.length ? store.clearSelection() : store.selectAll()"
                  />
                </th>
                <th class="col-drag"></th>
                <th class="col-name">主题名</th>
                <th class="col-color">色系</th>
                <th class="col-count">数量</th>
                <th class="col-pages">页型</th>
                <th class="col-diff">难度</th>
                <th class="col-time">用时</th>
                <th class="col-owner">责任人</th>
                <th class="col-status">状态</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(theme, index) in store.filteredThemes" 
                :key="theme.id"
                :class="{ 
                  selected: store.selectedIds.has(theme.id),
                  dragging: dragIndex === index,
                  'drag-over': dragOverIndex === index && dragIndex !== index
                }"
                draggable="true"
                @dragstart="onDragStart($event, index)"
                @dragover="onDragOver($event, index)"
                @dragleave="onDragLeave"
                @drop="onDrop($event, index)"
                @dragend="onDragEnd"
                @click="handleRowClick(theme, $event)"
              >
                <td class="col-checkbox">
                  <input 
                    type="checkbox"
                    :checked="store.selectedIds.has(theme.id)"
                    @change="store.toggleSelect(theme.id)"
                  />
                </td>
                <td class="col-drag">
                  <span class="drag-handle" title="拖拽排序">⋮⋮</span>
                </td>
                <td class="col-name">
                  <div class="name-cell">
                    <span class="name-text">{{ theme.name }}</span>
                    <span v-if="hasThemeAlerts(theme.id)" class="alert-dot" title="有提示">!</span>
                  </div>
                </td>
                <td class="col-color">
                  <div class="color-cell">
                    <span class="color-dot" :style="{ background: getColorDot(theme.colorScheme) }"></span>
                    {{ theme.colorScheme || '-' }}
                  </div>
                </td>
                <td class="col-count" :class="{ 'low-stock': theme.stickerCount < 10 }">
                  {{ theme.stickerCount }}
                </td>
                <td class="col-pages">
                  <div class="pages-cell">
                    <span v-for="pt in theme.pageTypes" :key="pt" class="page-tag">{{ pt }}</span>
                    <span v-if="theme.pageTypes.length === 0" class="text-muted">-</span>
                  </div>
                </td>
                <td class="col-diff">
                  <span :class="['badge', getDifficultyBadgeClass(theme.difficulty)]">
                    {{ theme.difficulty }}
                  </span>
                </td>
                <td class="col-time" :class="{ 'long-time': theme.estimatedTime > 90 }">
                  {{ theme.estimatedTime }}分
                </td>
                <td class="col-owner">{{ theme.owner || '-' }}</td>
                <td class="col-status">
                  <span :class="['badge', getStatusBadgeClass(theme.status)]">
                    {{ theme.status }}
                  </span>
                </td>
                <td class="col-actions">
                  <div class="row-actions">
                    <button class="action-btn" title="复制" @click.stop="store.duplicateTheme(theme.id)">📋</button>
                    <button class="action-btn delete" title="删除" @click.stop="handleDelete(theme.id)">🗑</button>
                  </div>
                </td>
              </tr>
              <tr v-if="store.filteredThemes.length === 0">
                <td colspan="11" class="empty-table">
                  <div class="empty-table-inner">
                    <div class="empty-icon">📭</div>
                    <p>暂无数据</p>
                    <button class="btn btn-primary btn-sm" @click="store.addTheme()">新增第一个主题</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span class="footer-text">共 {{ store.filteredThemes.length }} 条记录</span>
          <span class="footer-tip">💡 拖拽行可调整顺序 · 点击行查看详情</span>
        </div>
      </div>

      <DetailPanel 
        v-if="store.activeThemeId"
        :theme="store.activeTheme"
        :color-schemes="store.colorSchemes"
        :page-types="store.pageTypes"
        :difficulties="store.difficulties"
        :statuses="store.statuses"
        :alerts="store.alerts"
        @update="store.updateTheme"
        @close="store.activeThemeId = null"
        @duplicate="store.duplicateTheme"
        @delete="handleDelete"
        @add-todo="store.addTodo"
        @toggle-todo="store.toggleTodo"
        @delete-todo="store.deleteTodo"
      />
    </div>

    <ActivityPreview 
      v-if="store.isPreviewMode"
      :groups="previewGroups"
      :total-themes="previewTotalThemes"
      :total-stickers="previewTotalStickers"
      @close="closePreview"
    />
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: var(--bg-card);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.header-left h1 {
  font-size: 20px;
  font-weight: 700;
}

.header-subtitle {
  font-size: 12px;
  color: var(--text-light);
  margin-left: 12px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.alerts-banner {
  background: var(--bg-card);
  margin: 12px 24px 0;
  border-radius: var(--radius);
  padding: 12px 16px;
  box-shadow: var(--shadow);
}

.alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 13px;
}

.alerts-close {
  color: var(--text-light);
  font-size: 14px;
  padding: 4px;
}

.alerts-close:hover {
  color: var(--text);
}

.alerts-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alert-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}

.alert-group-label {
  font-weight: 500;
  white-space: nowrap;
}

.alert-text {
  color: var(--text-light);
  background: var(--bg-sidebar);
  padding: 2px 8px;
  border-radius: 4px;
}

.alert-more {
  color: var(--primary);
  font-size: 11px;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 16px 24px;
  gap: 0;
  overflow: hidden;
}

.content-area {
  flex: 1;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-bar {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-item label {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 500;
}

.filter-item select {
  min-width: 100px;
}

.page-type-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.page-type-filter label {
  font-size: 12px;
  color: var(--text-light);
  font-weight: 500;
}

.page-type-chip {
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  background: var(--bg-sidebar);
  color: var(--text-light);
  border: 1px solid transparent;
}

.page-type-chip:hover {
  background: var(--border-light);
}

.page-type-chip.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
}

.batch-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--primary-light);
  border-bottom: 1px solid var(--primary);
}

.batch-info {
  font-size: 13px;
}

.batch-info strong {
  color: var(--primary);
}

.batch-actions {
  display: flex;
  gap: 8px;
  position: relative;
}

.batch-status-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-hover);
  border: 1px solid var(--border);
  z-index: 100;
  min-width: 120px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
}

.dropdown-item:hover {
  background: var(--bg-sidebar);
}

.table-container {
  flex: 1;
  overflow: auto;
}

table {
  table-layout: fixed;
}

th, td {
  font-size: 13px;
}

.col-checkbox {
  width: 40px;
  text-align: center;
}

.col-drag {
  width: 30px;
}

.col-name {
  width: 160px;
}

.col-color {
  width: 100px;
}

.col-count {
  width: 60px;
}

.col-pages {
  width: 180px;
}

.col-diff {
  width: 70px;
}

.col-time {
  width: 70px;
}

.col-owner {
  width: 80px;
}

.col-status {
  width: 80px;
}

.col-actions {
  width: 80px;
}

.drag-handle {
  color: var(--text-muted);
  cursor: grab;
  font-size: 14px;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.name-text {
  font-weight: 500;
  cursor: pointer;
}

.alert-dot {
  width: 16px;
  height: 16px;
  background: var(--danger);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.color-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.low-stock {
  color: var(--danger);
  font-weight: 600;
}

.pages-cell {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.page-tag {
  font-size: 11px;
  padding: 1px 6px;
  background: var(--bg-sidebar);
  border-radius: 4px;
  color: var(--text-light);
}

.text-muted {
  color: var(--text-muted);
}

.long-time {
  color: var(--warning);
  font-weight: 500;
}

.row-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

tr:hover .action-btn {
  opacity: 1;
}

.action-btn:hover {
  background: var(--bg-sidebar);
}

.action-btn.delete:hover {
  background: #fde8e8;
}

.empty-table {
  padding: 60px 20px;
}

.empty-table-inner {
  text-align: center;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.table-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-light);
}

.footer-tip {
  color: var(--text-muted);
}
</style>
