<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, Package as PackageIcon, AlertTriangle, Printer, RefreshCw } from 'lucide-vue-next'
import type { ThemeRecord, ColorScheme } from '@/types'
import { COLOR_MAP } from '@/types'
import ColorDot from './ColorDot.vue'

const props = defineProps<{
  themes: ThemeRecord[]
}>()

const groupCount = ref(4)
const stickersPerGroup = ref(10)

const availableThemes = computed(() => {
  return props.themes.filter(t => t.status === 'ready' || t.status === 'needSupplement')
})

const groups = computed(() => {
  const result: { index: number; items: { theme: ThemeRecord; shortage: boolean }[]; totalStickers: number }[] = []
  
  for (let i = 0; i < groupCount.value; i++) {
    result.push({
      index: i + 1,
      items: [],
      totalStickers: 0
    })
  }
  
  const sorted = [...availableThemes.value].sort((a, b) => a.order - b.order)
  
  sorted.forEach((theme, themeIdx) => {
    const colorsByGroup: ColorScheme[][] = result.map(g => g.items.map(i => i.theme.colorScheme))
    
    let bestGroupIdx = 0
    let bestScore = Infinity
    
    for (let g = 0; g < groupCount.value; g++) {
      const sameColorCount = colorsByGroup[g].filter(c => c === theme.colorScheme).length
      const stickerCount = result[g].totalStickers
      const score = sameColorCount * 100 + stickerCount
      if (score < bestScore) {
        bestScore = score
        bestGroupIdx = g
      }
    }
    
    const perGroupCount = Math.floor(theme.stickerCount / groupCount.value)
    const shortage = theme.stickerCount < groupCount.value
    
    result[bestGroupIdx].items.push({
      theme,
      shortage
    })
    result[bestGroupIdx].totalStickers += Math.max(1, perGroupCount)
  })
  
  return result
})

const globalShortages = computed(() => {
  return availableThemes.value.filter(t => t.stickerCount < groupCount.value)
})
</script>

<template>
  <div>
    <div class="bg-white rounded-2xl p-4 mb-6 shadow-card">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <Users :size="20" class="text-peach-400" />
          <label class="text-sm font-medium text-gray-700">小组数量:</label>
          <input
            v-model.number="groupCount"
            type="number"
            min="1"
            max="20"
            class="w-16 px-2 py-1 rounded-lg bg-gray-50 border-0 text-center focus:ring-2 focus:ring-peach-300 outline-none"
          />
        </div>
        <div class="flex items-center gap-2">
          <PackageIcon :size="20" class="text-mint-400" />
          <label class="text-sm font-medium text-gray-700">每组目标贴纸数:</label>
          <input
            v-model.number="stickersPerGroup"
            type="number"
            min="1"
            class="w-16 px-2 py-1 rounded-lg bg-gray-50 border-0 text-center focus:ring-2 focus:ring-peach-300 outline-none"
          />
        </div>
        <button
          @click="window.print()"
          class="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Printer :size="16" />
          打印清单
        </button>
      </div>
    </div>
    
    <div v-if="globalShortages.length > 0" class="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
      <div class="flex items-center gap-2 text-red-700 font-medium mb-2">
        <AlertTriangle :size="20" />
        贴纸缺口提醒
      </div>
      <p class="text-sm text-red-600 mb-2">以下主题贴纸数量不足，无法保证每组都能分到：</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="theme in globalShortages"
          :key="theme.id"
          class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white text-red-700 text-sm"
        >
          <ColorDot :color="theme.colorScheme" size="sm" />
          {{ theme.themeName }} ({{ theme.stickerCount }}张)
        </span>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="group in groups"
        :key="group.index"
        class="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
      >
        <div class="flex items-center justify-between mb-3 pb-3 border-b">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-gradient-to-br from-peach-300 to-lavender-300 text-white flex items-center justify-center text-sm">
              {{ group.index }}
            </span>
            第 {{ group.index }} 组
          </h3>
          <span class="text-sm font-medium" :class="group.totalStickers >= stickersPerGroup ? 'text-mint-600' : 'text-amber-600'">
            {{ group.totalStickers }} 张
          </span>
        </div>
        
        <div class="space-y-2">
          <div
            v-for="item in group.items"
            :key="item.theme.id"
            class="flex items-center gap-2 p-2 rounded-lg"
            :class="item.shortage ? 'bg-red-50' : 'bg-gray-50'"
          >
            <ColorDot :color="item.theme.colorScheme" size="sm" />
            <span class="flex-1 text-sm truncate" :class="item.shortage ? 'text-red-700' : 'text-gray-700'">
              {{ item.theme.themeName }}
            </span>
            <AlertTriangle v-if="item.shortage" :size="14" class="text-red-500 flex-shrink-0" />
          </div>
          <div v-if="group.items.length === 0" class="text-center text-gray-400 text-sm py-4">
            暂无分配
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-6 bg-lemon-50 rounded-2xl p-4">
      <h4 class="font-medium text-gray-700 mb-2">📊 分配说明</h4>
      <ul class="text-sm text-gray-600 space-y-1">
        <li>• 系统按色系均衡分配，尽量让每组拿到不同颜色的贴纸</li>
        <li>• 状态为「可使用」和「需补充」的主题参与分配</li>
        <li>• 红色标记表示该主题贴纸数量少于小组数，存在缺口</li>
        <li>• 可调整小组数量后自动重新分配</li>
      </ul>
    </div>
  </div>
</template>
