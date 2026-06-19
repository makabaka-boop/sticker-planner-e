<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useThemeStore } from '@/composables/useThemeStore'
import { useSmartTips } from '@/composables/useSmartTips'
import type { ThemeRecord, FilterState } from '@/types'
import StatsHeader from '@/components/StatsHeader.vue'
import SmartTipCenter from '@/components/SmartTipCenter.vue'
import FilterBar from '@/components/FilterBar.vue'
import ThemeCard from '@/components/ThemeCard.vue'
import BulkActionBar from '@/components/BulkActionBar.vue'
import ThemeDetailDrawer from '@/components/ThemeDetailDrawer.vue'
import ThemeFormDialog from '@/components/ThemeFormDialog.vue'
import PackagePreview from '@/components/PackagePreview.vue'
import { Layers } from 'lucide-vue-next'

const store = useThemeStore()
const { tips } = useSmartTips(store.themes)

const dragList = ref<ThemeRecord[]>([])

watch(() => store.filteredThemes.value, (val) => {
  dragList.value = [...val]
}, { immediate: true, deep: true })

const selectedCount = computed(() => store.selectedIds.value.size)
const allSelected = computed(() => {
  return store.filteredThemes.value.length > 0 && 
    store.filteredThemes.value.every(t => store.selectedIds.value.has(t.id))
})

function handleDragEnd() {
  store.reorderThemes(dragList.value)
}

function handleSelectTipTheme(id: string) {
  store.openDetail(id)
}

function handleSaveForm(data: any) {
  if (store.editingTheme.value) {
    store.updateTheme(store.editingTheme.value.id, data)
  } else {
    store.addTheme(data)
  }
  store.closeForm()
}

function handleEditFromDrawer() {
  store.openEditForm()
}

function handleDelete(id: string) {
  if (confirm('确定要删除这个主题吗？')) {
    store.deleteTheme(id)
  }
}

function handleBulkDelete() {
  if (confirm(`确定要删除选中的 ${store.selectedIds.value.size} 个主题吗？`)) {
    store.bulkDelete()
  }
}

function handleFilterUpdate(newFilter: FilterState) {
  Object.assign(store.filter.value, newFilter)
}
</script>

<template>
  <div class="min-h-screen bg-cream">
    <div class="max-w-7xl mx-auto px-4 py-6 pb-24">
      <StatsHeader
        :stats="store.stats.value"
        :view-mode="store.viewMode.value"
        @toggle-preview="store.togglePreviewMode"
        @add-new="store.openAddForm"
      />
      
      <template v-if="store.viewMode.value === 'list'">
        <SmartTipCenter :tips="tips.value" @select-theme="handleSelectTipTheme" />
        
        <FilterBar
          :filter="store.filter.value"
          :assignees="store.assignees.value"
          @update:filter="handleFilterUpdate"
          @reset="store.resetFilters"
        />
        
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="allSelected"
              @change="allSelected ? store.clearSelection() : store.selectAll()"
              class="w-4 h-4 rounded text-peach-400 focus:ring-peach-300 cursor-pointer"
            />
            <span class="text-sm text-gray-500">
              全选 ({{ store.filteredThemes.value.length }} 个主题)
            </span>
          </div>
          <p class="text-sm text-gray-400 flex items-center gap-1">
            <Layers :size="14" />
            拖拽卡片左侧手柄调整顺序
          </p>
        </div>
        
        <draggable
          v-model="dragList"
          item-key="id"
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          ghost-class="opacity-40"
          drag-class="rotate-1"
          handle=".drag-handle"
          animation="200"
          @end="handleDragEnd"
        >
          <template #item="{ element }">
            <ThemeCard
              :theme="element"
              :selected="store.selectedIds.value.has(element.id)"
              @click="store.openDetail(element.id)"
              @select="store.toggleSelect(element.id)"
              @edit="store.openEditForm(element)"
              @duplicate="store.duplicateTheme(element.id)"
              @delete="handleDelete(element.id)"
            />
          </template>
        </draggable>
        
        <div v-if="store.filteredThemes.value.length === 0" class="text-center py-16">
          <div class="text-5xl mb-4">🎀</div>
          <p class="text-gray-500 mb-4">没有找到匹配的主题</p>
          <button
            @click="store.resetFilters"
            class="text-peach-500 hover:text-peach-600 text-sm underline"
          >
            清除筛选条件
          </button>
        </div>
      </template>
      
      <template v-else>
        <PackagePreview :themes="store.themes.value" />
      </template>
    </div>
    
    <BulkActionBar
      v-if="selectedCount > 0 && store.viewMode.value === 'list'"
      :selected-count="selectedCount"
      @bulk-status="store.bulkUpdateStatus"
      @bulk-duplicate="store.bulkDuplicate"
      @bulk-delete="handleBulkDelete"
      @clear-selection="store.clearSelection"
    />
    
    <ThemeDetailDrawer
      :theme="store.activeTheme.value"
      @close="store.closeDetail"
      @edit="handleEditFromDrawer"
      @update-notes="(notes) => store.activeThemeId.value && store.updateNotes(store.activeThemeId.value, notes)"
      @add-todo="(text) => store.activeThemeId.value && store.addTodo(store.activeThemeId.value, text)"
      @toggle-todo="(todoId) => store.activeThemeId.value && store.toggleTodo(store.activeThemeId.value, todoId)"
      @delete-todo="(todoId) => store.activeThemeId.value && store.deleteTodo(store.activeThemeId.value, todoId)"
    />
    
    <ThemeFormDialog
      :open="store.isFormOpen.value"
      :editing-theme="store.editingTheme.value"
      @close="store.closeForm"
      @save="handleSaveForm"
    />
  </div>
</template>
