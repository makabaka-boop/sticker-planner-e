<script setup lang="ts">
import { CheckSquare, Copy, Trash2, X } from 'lucide-vue-next'
import { STATUS_MAP } from '@/types'
import type { ThemeStatus } from '@/types'

defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  bulkStatus: [status: ThemeStatus]
  bulkDuplicate: []
  bulkDelete: []
  clearSelection: []
}>()

const statusList = (Object.keys(STATUS_MAP) as ThemeStatus[]).map(key => ({
  key,
  ...STATUS_MAP[key]
}))
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 z-40 border border-peach-100">
    <span class="text-sm font-medium text-gray-700 flex items-center gap-2">
      <CheckSquare :size="18" class="text-peach-400" />
      已选 {{ selectedCount }} 项
    </span>
    
    <div class="h-6 w-px bg-gray-200" />
    
    <div class="flex items-center gap-1">
      <span class="text-xs text-gray-500 mr-1">批量改状态:</span>
      <button
        v-for="item in statusList"
        :key="item.key"
        @click="emit('bulkStatus', item.key)"
        class="px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
        :style="{ backgroundColor: item.bg, color: item.color }"
      >
        {{ item.label }}
      </button>
    </div>
    
    <div class="h-6 w-px bg-gray-200" />
    
    <button
      @click="emit('bulkDuplicate')"
      class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-mint-600 hover:bg-mint-50 transition-colors"
    >
      <Copy :size="16" />
      复制
    </button>
    <button
      @click="emit('bulkDelete')"
      class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
    >
      <Trash2 :size="16" />
      删除
    </button>
    
    <button
      @click="emit('clearSelection')"
      class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
    >
      <X :size="18" />
    </button>
  </div>
</template>
