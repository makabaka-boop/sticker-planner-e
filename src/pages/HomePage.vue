<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Plus, Sparkles } from 'lucide-vue-next'
import { VueDraggable } from 'vue-draggable-plus'
import { usePlannerStore } from '@/store/planner'
import StatsHeader from '@/components/StatsHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import SmartTipCenter from '@/components/SmartTipCenter.vue'
import ThemeCard from '@/components/ThemeCard.vue'
import BulkActionBar from '@/components/BulkActionBar.vue'
import ThemeFormDialog from '@/components/ThemeFormDialog.vue'
import ThemeDetailDrawer from '@/components/ThemeDetailDrawer.vue'
import PackagePreview from '@/components/PackagePreview.vue'

const store = usePlannerStore()

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)

const filteredList = computed({
  get: () => store.filteredThemes,
  set: (list) => {
    // Apply order based on the new sequence (only re-orders items in current filter)
    const filteredIds = list.map((t) => t.id)
    const remaining = store.sortedThemes.filter((t) => !filteredIds.includes(t.id))
    const merged = [...list, ...remaining].map((t) => t.id)
    store.reorderThemes(merged)
  },
})

function openNew() {
  editingId.value = null
  dialogOpen.value = true
}
function openEdit(id: string) {
  editingId.value = id
  dialogOpen.value = true
}
function closeDialog() {
  dialogOpen.value = false
  editingId.value = null
}
function openDetail(id: string) {
  store.setActiveTheme(id)
}
function closeDetail() {
  store.setActiveTheme(null)
}
function deleteTheme(id: string) {
  if (confirm('确认删除该主题？')) store.removeTheme(id)
}

function focusThemes(ids: string[]) {
  if (!ids.length) return
  // open the first matched
  store.setActiveTheme(ids[0])
  nextTick(() => {
    const el = document.querySelector(`[data-theme-id="${ids[0]}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
</script>

<template>
  <main class="home">
    <StatsHeader />

    <FilterBar />

    <SmartTipCenter @focus="focusThemes" />

    <div v-if="store.settings.viewMode === 'organize'" class="organize">
      <div class="list-head no-print">
        <div>
          <h2 class="list-title">主题卡片</h2>
          <p class="list-sub">拖拽卡片可调整展示顺序 · 点击进入侧边详情</p>
        </div>
        <button class="btn btn--primary" @click="openNew">
          <Plus :size="14" />新增主题
        </button>
      </div>

      <div v-if="!filteredList.length" class="empty-state">
        <Sparkles :size="22" />
        <p>当前没有符合筛选的主题。试试清空筛选或<button class="link" @click="openNew">新增一个</button>。</p>
      </div>

      <VueDraggable
        v-else
        v-model="filteredList"
        :animation="180"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
        drag-class="drag-active"
        handle=".theme-card"
        class="card-grid"
      >
        <ThemeCard
          v-for="t in filteredList"
          :key="t.id"
          :theme="t"
          :selected="store.selectedIds.has(t.id)"
          :active="store.activeThemeId === t.id"
          :data-theme-id="t.id"
          @open="openDetail"
          @edit="openEdit"
          @duplicate="(id: string) => store.duplicateTheme(id)"
          @delete="deleteTheme"
          @toggle-select="(id: string) => store.toggleSelect(id)"
        />
      </VueDraggable>
    </div>

    <PackagePreview v-else />

    <BulkActionBar />

    <ThemeFormDialog :open="dialogOpen" :theme-id="editingId" @close="closeDialog" />

    <ThemeDetailDrawer @close="closeDetail" @edit="openEdit" />
  </main>
</template>

<style scoped>
.home {
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.organize {
  padding: 22px 32px 100px;
}
.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
}
.list-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
}
.list-sub {
  margin: 2px 0 0;
  color: var(--ink-mute);
  font-size: 12px;
}

.empty-state {
  padding: 60px 32px;
  text-align: center;
  color: var(--ink-mute);
  border: 1px dashed var(--line-soft);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.empty-state .link {
  background: transparent;
  border: 0;
  text-decoration: underline;
  color: var(--ink);
  padding: 0 4px;
  cursor: pointer;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

:deep(.drag-ghost) {
  opacity: 0.35;
  background: var(--paper-deep);
}
:deep(.drag-chosen) {
  cursor: grabbing;
}
:deep(.drag-active) {
  transform: rotate(1.2deg);
  box-shadow: 8px 12px 24px rgba(31, 27, 22, 0.18);
}

@media (max-width: 600px) {
  .organize { padding: 18px 20px 100px; }
  .card-grid { grid-template-columns: 1fr; }
}
</style>
