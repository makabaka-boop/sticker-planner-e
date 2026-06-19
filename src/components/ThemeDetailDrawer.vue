<script setup lang="ts">
import { ref } from 'vue'
import { X, User, Clock, Sticker, Plus, Check, Trash2, Edit3 } from 'lucide-vue-next'
import type { ThemeRecord } from '@/types'
import { PAGE_TYPE_MAP } from '@/types'
import ColorDot from './ColorDot.vue'
import StatusBadge from './StatusBadge.vue'
import DifficultyStars from './DifficultyStars.vue'

const props = defineProps<{
  theme: ThemeRecord | null
}>()

const emit = defineEmits<{
  close: []
  edit: []
  updateNotes: [notes: string]
  addTodo: [text: string]
  toggleTodo: [todoId: string]
  deleteTodo: [todoId: string]
}>()

const newTodoText = ref('')
const notesDraft = ref('')
let isEditingNotes = false

watch(() => props.theme, (val) => {
  if (val) {
    notesDraft.value = val.notes
    isEditingNotes = false
  }
}, { immediate: true })

import { watch } from 'vue'

function handleAddTodo() {
  if (newTodoText.value.trim()) {
    emit('addTodo', newTodoText.value.trim())
    newTodoText.value = ''
  }
}

function saveNotes() {
  emit('updateNotes', notesDraft.value)
  isEditingNotes = false
}
</script>

<template>
  <Transition name="slide">
    <div v-if="theme" class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
      <div class="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-peach-50 to-lemon-50">
        <div class="flex items-center gap-3">
          <ColorDot :color="theme.colorScheme" size="lg" />
          <div>
            <h2 class="text-lg font-bold text-gray-800">{{ theme.themeName }}</h2>
            <StatusBadge :status="theme.status" />
          </div>
        </div>
        <button @click="emit('close')" class="p-2 rounded-xl hover:bg-white/60 transition-colors">
          <X :size="20" class="text-gray-500" />
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 rounded-xl p-3">
            <div class="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Sticker :size="14" />
              贴纸数量
            </div>
            <div class="text-xl font-bold text-gray-800">{{ theme.stickerCount }}</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-3">
            <div class="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Clock :size="14" />
              预计用时
            </div>
            <div class="text-xl font-bold text-gray-800">{{ theme.estimatedTime }} <span class="text-sm font-normal text-gray-500">分钟</span></div>
          </div>
        </div>
        
        <div>
          <div class="text-sm font-medium text-gray-700 mb-2">难度等级</div>
          <DifficultyStars :level="theme.difficulty" :size="20" />
        </div>
        
        <div v-if="theme.assignee">
          <div class="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <User :size="14" />
            责任人
          </div>
          <div class="font-medium text-gray-800">{{ theme.assignee }}</div>
        </div>
        
        <div>
          <div class="text-sm font-medium text-gray-700 mb-2">适合页型</div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="pt in theme.pageTypes"
              :key="pt"
              class="px-2 py-1 rounded-lg bg-lavender-100 text-lavender-700 text-xs font-medium"
            >
              {{ PAGE_TYPE_MAP[pt] }}
            </span>
            <span v-if="theme.pageTypes.length === 0" class="text-gray-400 text-sm">未设置</span>
          </div>
        </div>
        
        <div v-if="theme.exampleDesc">
          <div class="text-sm font-medium text-gray-700 mb-2">示例说明</div>
          <p class="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-3">{{ theme.exampleDesc }}</p>
        </div>
        
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-medium text-gray-700">临时备注</div>
            <button
              v-if="!isEditingNotes"
              @click="isEditingNotes = true"
              class="text-xs text-peach-500 hover:text-peach-600 flex items-center gap-1"
            >
              <Edit3 :size="12" />
              编辑
            </button>
          </div>
          <div v-if="!isEditingNotes" class="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl p-3 min-h-[60px]">
            {{ theme.notes || '暂无备注，点击编辑添加' }}
          </div>
          <div v-else class="space-y-2">
            <textarea
              v-model="notesDraft"
              rows="3"
              class="w-full px-3 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-peach-300 outline-none resize-none text-sm"
              placeholder="添加备注..."
            />
            <div class="flex gap-2">
              <button @click="saveNotes" class="px-3 py-1.5 rounded-lg bg-peach-400 text-white text-sm font-medium hover:bg-peach-500">保存</button>
              <button @click="isEditingNotes = false; notesDraft = theme.notes" class="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm">取消</button>
            </div>
          </div>
        </div>
        
        <div>
          <div class="text-sm font-medium text-gray-700 mb-2">待办摘要</div>
          <div class="space-y-2">
            <div
              v-for="todo in theme.todos"
              :key="todo.id"
              class="flex items-center gap-2 group"
            >
              <button
                @click="emit('toggleTodo', todo.id)"
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                :class="todo.done ? 'bg-mint-400 border-mint-400' : 'border-gray-300 hover:border-peach-400'"
              >
                <Check v-if="todo.done" :size="12" class="text-white" />
              </button>
              <span class="flex-1 text-sm" :class="todo.done ? 'text-gray-400 line-through' : 'text-gray-700'">{{ todo.text }}</span>
              <button
                @click="emit('deleteTodo', todo.id)"
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 :size="14" />
              </button>
            </div>
            
            <div class="flex gap-2 pt-1">
              <input
                v-model="newTodoText"
                type="text"
                @keyup.enter="handleAddTodo"
                placeholder="添加待办事项..."
                class="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-peach-300 outline-none"
              />
              <button
                @click="handleAddTodo"
                class="p-1.5 rounded-lg bg-peach-400 text-white hover:bg-peach-500 transition-colors"
              >
                <Plus :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="px-6 py-4 border-t bg-gray-50">
        <button
          @click="emit('edit')"
          class="w-full px-4 py-2.5 rounded-xl bg-peach-400 text-white font-medium hover:bg-peach-500 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Edit3 :size="18" />
          编辑完整信息
        </button>
      </div>
    </div>
  </Transition>
  <Transition name="fade">
    <div v-if="theme" @click="emit('close')" class="fixed inset-0 bg-black/20 z-40" />
  </Transition>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
