<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import { useStickerStore, colorSchemes, pageTypes, difficulties, statuses, colorMap, statusColorMap } from '../composables/useStickerStore'
import DetailPanel from '../components/DetailPanel.vue'
import ActivityPreview from '../components/ActivityPreview.vue'

const store = useStickerStore()
const showBatchStatus = ref(false)

const allSelected = computed(() =>
  store.filteredThemes.value.length > 0 &&
  store.selectedIds.value.length === store.filteredThemes.value.length
)

const hasSelection = computed(() => store.selectedIds.value.length > 0)

const alertIcon = (type: string) => {
  if (type === 'error') return '🔴'
  if (type === 'warning') return '🟡'
  return '🔵'
}

const handleRowClick = (id: string) => {
  store.activeThemeId.value = store.activeThemeId.value === id ? null : id
}

const handleDragEnd = () => {
  store.reorderThemes(store.filteredThemes.value)
}

const confirmDelete = (id: string) => {
  if (window.confirm('确定删除?')) {
    store.deleteTheme(id)
  }
}

const goToAlert = (themeId?: string) => {
  if (themeId) {
    store.activeThemeId.value = themeId
  }
}

const getDifficultyDots = (diff: string) => {
  if (diff === '简单') return '●○○'
  if (diff === '中等') return '●●○'
  return '●●●'
}

const getColorDot = (scheme: string) => {
  return (colorMap as Record<string, string>)[scheme] || '#ccc'
}

const getStatusColor = (status: string) => {
  return (statusColorMap as Record<string, string>)[status] || '#6b7280'
}
</script>

<template>
  <div class="home-container">
    <div v-if="store.isPreviewMode.value" class="main-content preview-mode">
      <ActivityPreview />
    </div>

    <template v-else>
      <div class="main-content">
        <header class="page-header">
          <div class="header-title">
            <h1>🎀 手账贴纸主题整理</h1>
            <p class="subtitle">规划贴纸包 · 管理主题卡 · 追踪完成进度</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" @click="store.addTheme()">
              <span>+</span> 新增主题
            </button>
            <button class="btn btn-preview" @click="store.isPreviewMode.value = true">
              🎁 活动包预览
            </button>
          </div>
        </header>

        <div v-if="store.alerts.value.length > 0" class="alerts-bar">
          <div class="alerts-scroll">
            <div
              v-for="alert in store.alerts.value"
              :key="alert.id"
              :class="['alert-item', alert.type]"
              @click="goToAlert(alert.themeId)"
            >
              <span class="alert-icon">{{ alertIcon(alert.type) }}</span>
              <span class="alert-text">{{ alert.message }}</span>
            </div>
          </div>
        </div>

        <div class="status-summary">
          <div
            v-for="s in statuses"
            :key="s"
            :class="['status-chip', { active: store.filters.value.status === s }]"
            @click="store.filters.value.status = store.filters.value.status === s ? '' : s"
          >
            <span class="chip-dot" :style="{ background: statusColorMap[s] }"></span>
            {{ s }}
            <span class="chip-count">{{ store.statusCounts.value[s] || 0 }}</span>
          </div>
        </div>

        <div class="filter-bar">
          <div class="filter-group">
            <label>色系</label>
            <select v-model="store.filters.value.colorScheme" class="filter-select">
              <option value="">全部</option>
              <option v-for="c in colorSchemes" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>页型</label>
            <select v-model="store.filters.value.pageType" class="filter-select">
              <option value="">全部</option>
              <option v-for="p in pageTypes" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>难度</label>
            <select v-model="store.filters.value.difficulty" class="filter-select">
              <option value="">全部</option>
              <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>责任人</label>
            <input
              v-model="store.filters.value.responsible"
              class="filter-input"
              placeholder="搜索责任人..."
            />
          </div>
          <button class="btn-reset" @click="store.resetFilters()">重置筛选</button>
        </div>

        <div v-if="hasSelection" class="batch-bar">
          <span class="batch-info">已选择 {{ store.selectedIds.value.length }} 项</span>
          <div class="batch-actions">
            <div class="batch-dropdown">
              <button class="btn btn-sm" @click="showBatchStatus = !showBatchStatus">
                批量改状态 ▾
              </button>
              <div v-if="showBatchStatus" class="dropdown-menu">
                <button
                  v-for="s in statuses"
                  :key="s"
                  class="dropdown-item"
                  @click="store.batchUpdateStatus(s); showBatchStatus = false"
                >
                  <span class="chip-dot" :style="{ background: statusColorMap[s] }"></span>
                  {{ s }}
                </button>
              </div>
            </div>
            <button class="btn btn-sm btn-danger" @click="store.batchDelete()">批量删除</button>
            <button class="btn btn-sm" @click="store.selectedIds.value = []">取消选择</button>
          </div>
        </div>

        <div class="table-container">
          <div class="table-header">
            <div class="th th-check">
              <input type="checkbox" :checked="allSelected" @change="store.toggleSelectAll()" />
            </div>
            <div class="th th-drag"></div>
            <div class="th th-name">主题名</div>
            <div class="th th-color">色系</div>
            <div class="th th-count">数量</div>
            <div class="th th-pages">适合页型</div>
            <div class="th th-diff">难度</div>
            <div class="th th-time">用时</div>
            <div class="th th-person">责任人</div>
            <div class="th th-status">状态</div>
            <div class="th th-action">操作</div>
          </div>

          <draggable
            :list="store.filteredThemes.value"
            item-key="id"
            class="table-body"
            ghost-class="drag-ghost"
            chosen-class="drag-chosen"
            @end="handleDragEnd"
            handle=".drag-handle"
          >
            <template #item="{ element }">
              <div
                :class="[
                  'table-row',
                  { active: store.activeThemeId.value === element.id, selected: store.selectedIds.value.includes(element.id) }
                ]"
                @click="handleRowClick(element.id)"
              >
                <div class="td td-check" @click.stop>
                  <input
                    type="checkbox"
                    :checked="store.selectedIds.value.includes(element.id)"
                    @change="store.toggleSelect(element.id)"
                  />
                </div>
                <div class="td td-drag" @click.stop>
                  <span class="drag-handle">⋮⋮</span>
                </div>
                <div class="td td-name">
                  <span class="theme-name">{{ element.name }}</span>
                  <span v-if="!element.notes && element.status !== '暂缓' && element.status !== '仅展示'" class="hint-dot" title="缺少备注">!</span>
                </div>
                <div class="td td-color">
                  <span class="color-dot" :style="{ background: getColorDot(element.colorScheme) }"></span>
                  {{ element.colorScheme }}
                </div>
                <div class="td td-count">
                  <span :class="{ 'count-low': element.stickerCount < 10 }">{{ element.stickerCount }}</span>
                  张
                </div>
                <div class="td td-pages">
                  <span v-for="p in element.suitablePages" :key="p" class="page-mini">{{ p }}</span>
                </div>
                <div class="td td-diff">
                  <span class="diff-dots">{{ getDifficultyDots(element.difficulty) }}</span>
                  <span class="diff-label">{{ element.difficulty }}</span>
                </div>
                <div class="td td-time">
                  <span :class="{ 'time-long': element.estimatedTime > 90 }">{{ element.estimatedTime }}</span>
                  分
                </div>
                <div class="td td-person">{{ element.responsible || '-' }}</div>
                <div class="td td-status" @click.stop>
                  <select
                    :value="element.status"
                    @change="(e) => store.updateTheme(element.id, { status: (e.target as HTMLSelectElement).value as any })"
                    class="status-select"
                    :style="{ color: getStatusColor(element.status) }"
                  >
                    <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div class="td td-action" @click.stop>
                  <button class="row-btn" title="复制" @click="store.duplicateTheme(element.id)">📋</button>
                  <button class="row-btn" title="删除" @click="confirmDelete(element.id)">🗑</button>
                </div>
              </div>
            </template>
          </draggable>

          <div v-if="store.filteredThemes.value.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无匹配的贴纸主题</p>
            <button class="btn btn-primary" @click="store.addTheme()">添加第一个主题</button>
          </div>
        </div>

        <div class="footer-stats">
          <span>共 {{ store.themes.value.length }} 个主题</span>
          <span>筛选结果: {{ store.filteredThemes.value.length }} 个</span>
          <span>待整理: {{ store.statusCounts.value['待整理'] || 0 }}</span>
          <span>可使用: {{ store.statusCounts.value['可使用'] || 0 }}</span>
          <span>需补充: {{ store.statusCounts.value['需补充'] || 0 }}</span>
        </div>
      </div>

      <DetailPanel v-if="store.activeTheme.value" />
    </template>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  height: 100vh;
  background: #fafafa;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.main-content.preview-mode {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-title h1 {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 9px 18px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);
}

.btn-preview {
  background: #fff;
  color: #ec4899;
  border: 1px solid #fce7f3;
}

.btn-preview:hover {
  background: #fdf2f8;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
}

.btn-sm:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #fee2e2 !important;
  color: #ef4444 !important;
}

.btn-danger:hover {
  background: #fecaca !important;
}

.alerts-bar {
  margin-bottom: 16px;
}

.alerts-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.alert-item:hover {
  transform: scale(1.02);
}

.alert-item.error {
  background: #fee2e2;
  color: #991b1b;
}

.alert-item.warning {
  background: #fef3c7;
  color: #92400e;
}

.alert-item.info {
  background: #dbeafe;
  color: #1e40af;
}

.alert-icon {
  font-size: 12px;
}

.status-summary {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.status-chip:hover {
  border-color: #ec4899;
}

.status-chip.active {
  background: #fdf2f8;
  border-color: #ec4899;
  color: #be185d;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chip-count {
  background: #f3f4f6;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
  color: #6b7280;
}

.status-chip.active .chip-count {
  background: #fce7f3;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: end;
  margin-bottom: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
}

.filter-select, .filter-input {
  padding: 7px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  min-width: 100px;
}

.filter-select:focus, .filter-input:focus {
  outline: none;
  border-color: #ec4899;
}

.filter-input {
  min-width: 120px;
}

.btn-reset {
  padding: 7px 14px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  color: #6b7280;
  margin-left: auto;
}

.btn-reset:hover {
  border-color: #ec4899;
  color: #ec4899;
}

.batch-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-radius: 10px;
  margin-bottom: 12px;
}

.batch-info {
  font-size: 13px;
  font-weight: 500;
  color: #be185d;
}

.batch-actions {
  display: flex;
  gap: 8px;
  position: relative;
}

.batch-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  padding: 4px;
  z-index: 100;
  min-width: 120px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  text-align: left;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.table-container {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  padding: 0;
}

.th {
  padding: 12px 10px;
  display: flex;
  align-items: center;
}

.th-check { width: 44px; justify-content: center; }
.th-drag { width: 36px; }
.th-name { flex: 2; min-width: 140px; }
.th-color { flex: 1; min-width: 90px; }
.th-count { width: 70px; }
.th-pages { flex: 1.5; min-width: 140px; }
.th-diff { width: 90px; }
.th-time { width: 70px; }
.th-person { width: 80px; }
.th-status { width: 100px; }
.th-action { width: 80px; justify-content: flex-end; }

.table-body {
  min-height: 200px;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
  align-items: center;
}

.table-row:hover {
  background: #fafafa;
}

.table-row.active {
  background: #fdf2f8;
}

.table-row.selected {
  background: #fef3c7;
}

.td {
  padding: 12px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.td-check { width: 44px; justify-content: center; }
.td-drag { width: 36px; color: #d1d5db; }
.td-name { flex: 2; min-width: 140px; font-weight: 500; color: #1f2937; }
.td-color { flex: 1; min-width: 90px; }
.td-count { width: 70px; }
.td-pages { flex: 1.5; min-width: 140px; flex-wrap: wrap; gap: 4px; }
.td-diff { width: 90px; flex-direction: column; align-items: flex-start; gap: 2px; }
.td-time { width: 70px; }
.td-person { width: 80px; color: #6b7280; }
.td-status { width: 100px; }
.td-action { width: 80px; justify-content: flex-end; gap: 4px; }

.drag-handle {
  cursor: grab;
  font-size: 14px;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-ghost {
  opacity: 0.5;
  background: #fce7f3 !important;
}

.drag-chosen {
  background: #fdf2f8 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.theme-name {
  position: relative;
}

.hint-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #f59e0b;
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  margin-left: 6px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.count-low {
  color: #ef4444;
  font-weight: 600;
}

.page-mini {
  font-size: 11px;
  padding: 2px 7px;
  background: #f3f4f6;
  border-radius: 10px;
  color: #6b7280;
}

.diff-dots {
  font-size: 10px;
  letter-spacing: 1px;
  color: #f59e0b;
}

.diff-label {
  font-size: 11px;
  color: #9ca3af;
}

.time-long {
  color: #f59e0b;
  font-weight: 600;
}

.status-select {
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}

.status-select:focus {
  outline: none;
  background: #f3f4f6;
}

.row-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.row-btn:hover {
  background: #f3f4f6;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state .btn {
  margin: 0 auto;
}

.footer-stats {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding: 12px 4px;
  font-size: 12px;
  color: #9ca3af;
}
</style>
