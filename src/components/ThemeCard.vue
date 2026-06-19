<script setup lang="ts">
import { GripVertical, User, Clock, Copy, Edit3, Trash2 } from 'lucide-vue-next'
import type { ThemeRecord } from '@/types'
import { COLOR_MAP, PAGE_TYPE_MAP } from '@/types'
import ColorDot from './ColorDot.vue'
import StatusBadge from './StatusBadge.vue'
import DifficultyStars from './DifficultyStars.vue'

const props = defineProps<{
  theme: ThemeRecord
  selected: boolean
}>()

const emit = defineEmits<{
  click: []
  select: []
  edit: []
  duplicate: []
  delete: []
}>()
</script>

<template>
  <div
    class="group bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer border-2 relative"
    :class="selected ? 'border-peach-400 bg-peach-50/30' : 'border-transparent hover:border-peach-200'"
    @click="emit('click')"
  >
    <div class="flex items-start gap-3">
      <div class="flex flex-col items-center gap-1">
        <div class="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-400 drag-handle">
          <GripVertical :size="20" />
        </div>
        <input
          type="checkbox"
          :checked="selected"
          @click.stop
          @change="emit('select')"
          class="w-4 h-4 rounded text-peach-400 focus:ring-peach-300 cursor-pointer"
        />
      </div>
      
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex items-center gap-2 min-w-0">
            <ColorDot :color="theme.colorScheme" size="md" />
            <h3 class="font-semibold text-gray-800 truncate">{{ theme.themeName }}</h3>
          </div>
          <StatusBadge :status="theme.status" />
        </div>
        
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
          <span class="flex items-center gap-1">
            <span class="font-medium text-gray-700">{{ theme.stickerCount }}</span> 张贴纸
          </span>
          <span class="flex items-center gap-1">
            <Clock :size="14" />
            {{ theme.estimatedTime }} 分钟
          </span>
          <DifficultyStars :level="theme.difficulty" :size="12" />
        </div>
        
        <div v-if="theme.assignee" class="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <User :size="14" />
          <span>{{ theme.assignee }}</span>
        </div>
        
        <div class="flex flex-wrap gap-1 mb-2" v-if="theme.pageTypes.length > 0">
          <span
            v-for="pt in theme.pageTypes"
            :key="pt"
            class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
          >
            {{ PAGE_TYPE_MAP[pt] }}
          </span>
        </div>
        
        <p v-if="theme.exampleDesc" class="text-sm text-gray-500 line-clamp-2 mb-2">
          {{ theme.exampleDesc }}
        </p>
        
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
          <button
            @click="emit('edit')"
            class="p-1.5 rounded-lg hover:bg-peach-100 text-gray-400 hover:text-peach-500 transition-colors"
            title="编辑"
          >
            <Edit3 :size="16" />
          </button>
          <button
            @click="emit('duplicate')"
            class="p-1.5 rounded-lg hover:bg-mint-100 text-gray-400 hover:text-mint-500 transition-colors"
            title="复制"
          >
            <Copy :size="16" />
          </button>
          <button
            @click="emit('delete')"
            class="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
            title="删除"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>
    
    <div
      v-if="theme.todos.some(t => !t.done)"
      class="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 text-white text-xs flex items-center justify-center font-medium"
    >
      {{ theme.todos.filter(t => !t.done).length }}
    </div>
  </div>
</template>
