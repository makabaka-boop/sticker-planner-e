<script setup lang="ts">
import { Layers, Clock, Sticker, CheckCircle2, AlertCircle, Package, Eye } from 'lucide-vue-next'
import { STATUS_MAP } from '@/types'
import type { ThemeStatus } from '@/types'

defineProps<{
  stats: {
    total: number
    byStatus: Record<ThemeStatus, number>
    totalStickers: number
    totalTime: number
  }
  viewMode: 'list' | 'preview'
}>()

const emit = defineEmits<{
  togglePreview: []
  addNew: []
}>()

const statusOrder: ThemeStatus[] = ['ready', 'pending', 'needSupplement', 'displayOnly', 'shelved']
</script>

<template>
  <header class="bg-gradient-to-r from-peach-100 via-lemon-50 to-mint-100 rounded-3xl p-6 mb-6 shadow-card">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
          <span>🎀</span>
          手账贴纸主题整理
        </h1>
        <p class="text-sm text-gray-500">活动前规划贴纸包、主题卡和完成进度</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="emit('togglePreview')"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          :class="viewMode === 'preview' 
            ? 'bg-peach-400 text-white shadow-md' 
            : 'bg-white text-gray-700 hover:bg-peach-50 shadow-sm'"
        >
          <component :is="viewMode === 'preview' ? Layers : Package" :size="18" />
          {{ viewMode === 'preview' ? '返回列表' : '活动包预览' }}
        </button>
        <button
          v-if="viewMode === 'list'"
          @click="emit('addNew')"
          class="flex items-center gap-2 px-4 py-2 bg-peach-400 text-white rounded-xl text-sm font-medium shadow-md hover:bg-peach-500 transition-all hover:shadow-lg"
        >
          <span>+</span>
          新增主题
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-5">
      <div class="bg-white/80 backdrop-blur rounded-2xl p-3 text-center">
        <div class="flex justify-center mb-1"><Layers :size="20" class="text-peach-400" /></div>
        <div class="text-2xl font-bold text-gray-800">{{ stats.total }}</div>
        <div class="text-xs text-gray-500">主题总数</div>
      </div>
      <div class="bg-white/80 backdrop-blur rounded-2xl p-3 text-center">
        <div class="flex justify-center mb-1"><Sticker :size="20" class="text-mint-400" /></div>
        <div class="text-2xl font-bold text-gray-800">{{ stats.totalStickers }}</div>
        <div class="text-xs text-gray-500">贴纸总数</div>
      </div>
      <div class="bg-white/80 backdrop-blur rounded-2xl p-3 text-center">
        <div class="flex justify-center mb-1"><Clock :size="20" class="text-lavender-400" /></div>
        <div class="text-2xl font-bold text-gray-800">{{ stats.totalTime }}</div>
        <div class="text-xs text-gray-500">预计总用时(分)</div>
      </div>
      <div 
        v-for="status in statusOrder" 
        :key="status"
        class="bg-white/80 backdrop-blur rounded-2xl p-3 text-center"
      >
        <div class="flex justify-center mb-1">
          <component 
            :is="status === 'needSupplement' ? AlertCircle : CheckCircle2" 
            :size="20" 
            :style="{ color: STATUS_MAP[status].color }" 
          />
        </div>
        <div class="text-2xl font-bold text-gray-800">{{ stats.byStatus[status] }}</div>
        <div class="text-xs text-gray-500">{{ STATUS_MAP[status].label }}</div>
      </div>
    </div>
  </header>
</template>
