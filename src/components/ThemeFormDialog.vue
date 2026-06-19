<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { ThemeRecord, ThemeStatus, ColorScheme, PageType } from '@/types'
import { COLOR_MAP, PAGE_TYPE_MAP, STATUS_MAP } from '@/types'
import ColorDot from './ColorDot.vue'

const props = defineProps<{
  open: boolean
  editingTheme: ThemeRecord | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Omit<ThemeRecord, 'id' | 'order' | 'createdAt' | 'updatedAt' | 'todos'>]
}>()

const form = ref({
  themeName: '',
  colorScheme: 'peachPink' as ColorScheme,
  stickerCount: 10,
  pageTypes: [] as PageType[],
  exampleDesc: '',
  difficulty: 3 as 1 | 2 | 3 | 4 | 5,
  estimatedTime: 30,
  assignee: '',
  status: 'pending' as ThemeStatus,
  notes: ''
})

watch(() => props.open, (val) => {
  if (val) {
    if (props.editingTheme) {
      form.value = {
        themeName: props.editingTheme.themeName,
        colorScheme: props.editingTheme.colorScheme,
        stickerCount: props.editingTheme.stickerCount,
        pageTypes: [...props.editingTheme.pageTypes],
        exampleDesc: props.editingTheme.exampleDesc,
        difficulty: props.editingTheme.difficulty,
        estimatedTime: props.editingTheme.estimatedTime,
        assignee: props.editingTheme.assignee,
        status: props.editingTheme.status,
        notes: props.editingTheme.notes
      }
    } else {
      form.value = {
        themeName: '',
        colorScheme: 'peachPink',
        stickerCount: 10,
        pageTypes: [],
        exampleDesc: '',
        difficulty: 3,
        estimatedTime: 30,
        assignee: '',
        status: 'pending',
        notes: ''
      }
    }
  }
})

function togglePageType(pt: PageType) {
  const idx = form.value.pageTypes.indexOf(pt)
  if (idx === -1) {
    form.value.pageTypes.push(pt)
  } else {
    form.value.pageTypes.splice(idx, 1)
  }
}

function handleSubmit() {
  if (!form.value.themeName.trim()) return
  emit('save', { ...form.value })
}

const colorList = (Object.keys(COLOR_MAP) as ColorScheme[]).map(key => ({
  key,
  ...COLOR_MAP[key]
}))

const pageTypeList = (Object.keys(PAGE_TYPE_MAP) as PageType[]).map(key => ({
  key,
  label: PAGE_TYPE_MAP[key]
}))

const statusList = (Object.keys(STATUS_MAP) as ThemeStatus[]).map(key => ({
  key,
  ...STATUS_MAP[key]
}))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between rounded-t-3xl">
            <h2 class="text-lg font-bold text-gray-800">
              {{ editingTheme ? '编辑主题' : '新增主题' }}
            </h2>
            <button @click="emit('close')" class="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X :size="20" class="text-gray-500" />
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">主题名称 *</label>
              <input
                v-model="form.themeName"
                type="text"
                required
                placeholder="例如：春日樱花"
                class="w-full px-4 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-peach-300 outline-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">色系</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="item in colorList"
                  :key="item.key"
                  type="button"
                  @click="form.colorScheme = item.key"
                  class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
                  :class="form.colorScheme === item.key ? 'bg-peach-100 ring-2 ring-peach-300' : 'bg-gray-50 hover:bg-gray-100'"
                >
                  <ColorDot :color="item.key" size="sm" />
                  {{ item.label }}
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">贴纸数量</label>
                <input
                  v-model.number="form.stickerCount"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-peach-300 outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">预计用时(分钟)</label>
                <input
                  v-model.number="form.estimatedTime"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-peach-300 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">适合页型 (可多选)</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="item in pageTypeList"
                  :key="item.key"
                  type="button"
                  @click="togglePageType(item.key)"
                  class="px-3 py-1.5 rounded-lg text-sm transition-all"
                  :class="form.pageTypes.includes(item.key) ? 'bg-mint-100 text-mint-700 ring-2 ring-mint-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                >
                  {{ item.label }}
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">示例说明</label>
              <textarea
                v-model="form.exampleDesc"
                rows="2"
                placeholder="描述一下这个主题的风格..."
                class="w-full px-4 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-peach-300 outline-none resize-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">难度 ({{ form.difficulty }} 星)</label>
              <div class="flex gap-1">
                <button
                  v-for="i in 5"
                  :key="i"
                  type="button"
                  @click="form.difficulty = i as 1|2|3|4|5"
                  class="text-2xl transition-transform hover:scale-110"
                >
                  {{ i <= form.difficulty ? '⭐' : '☆' }}
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">责任人</label>
                <input
                  v-model="form.assignee"
                  type="text"
                  placeholder="负责人姓名"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-peach-300 outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  v-model="form.status"
                  class="w-full px-4 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-peach-300 outline-none"
                >
                  <option v-for="item in statusList" :key="item.key" :value="item.key">{{ item.label }}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">临时备注</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="备注信息..."
                class="w-full px-4 py-2 rounded-xl bg-gray-50 border-0 focus:ring-2 focus:ring-peach-300 outline-none resize-none"
              />
            </div>
            
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="emit('close')"
                class="flex-1 px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2 rounded-xl text-white bg-peach-400 hover:bg-peach-500 font-medium transition-colors shadow-md hover:shadow-lg"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
