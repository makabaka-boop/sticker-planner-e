<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-vue-next'
import type { SmartTip, TipType } from '@/types'

const props = withDefaults(defineProps<{
  tips?: SmartTip[]
}>(), {
  tips: () => []
})

const emit = defineEmits<{
  selectTheme: [id: string]
}>()

const dismissed = ref<Set<string>>(new Set())

const visibleTips = computed(() => props.tips.filter(t => !dismissed.value.has(t.id)))

const iconMap: Record<TipType, any> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colorMap: Record<TipType, { bg: string; border: string; text: string }> = {
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' }
}

function dismiss(id: string) {
  dismissed.value.add(id)
}
</script>

<template>
  <div v-if="visibleTips.length > 0" class="mb-4 space-y-2">
    <div
      v-for="tip in visibleTips"
      :key="tip.id"
      class="flex items-start gap-3 p-3 rounded-xl border transition-all"
      :class="[colorMap[tip.type].bg, colorMap[tip.type].border]"
    >
      <component 
        :is="iconMap[tip.type]" 
        :size="18" 
        :class="colorMap[tip.type].text"
        class="flex-shrink-0 mt-0.5"
      />
      <div class="flex-1 min-w-0">
        <p 
          class="text-sm leading-relaxed" 
          :class="colorMap[tip.type].text"
        >
          {{ tip.message }}
        </p>
        <button
          v-if="tip.themeId"
          @click="emit('selectTheme', tip.themeId!)"
          class="text-xs mt-1 underline opacity-70 hover:opacity-100"
          :class="colorMap[tip.type].text"
        >
          查看详情
        </button>
      </div>
      <button
        @click="dismiss(tip.id)"
        class="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors opacity-60 hover:opacity-100"
      >
        <X :size="16" :class="colorMap[tip.type].text" />
      </button>
    </div>
  </div>
</template>
