<script setup lang="ts">
import { Search, RotateCcw } from 'lucide-vue-next'
import { COLOR_MAP, PAGE_TYPE_MAP, STATUS_MAP } from '@/types'
import type { ColorScheme, PageType, ThemeStatus, FilterState } from '@/types'

const props = defineProps<{
  filter: FilterState
  assignees: string[]
}>()

const emit = defineEmits<{
  'update:filter': [FilterState]
  reset: []
}>()

function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
  emit('update:filter', { ...props.filter, [key]: value })
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
  <div class="bg-white rounded-2xl p-4 mb-4 shadow-card">
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          :value="filter.keyword"
          @input="updateFilter('keyword', ($event.target as HTMLInputElement).value)"
          placeholder="搜索主题名、说明或责任人..."
          class="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-peach-300 outline-none transition-all"
        />
      </div>
      
      <select
        :value="filter.colorScheme"
        @change="updateFilter('colorScheme', ($event.target as HTMLSelectElement).value as ColorScheme | '')"
        class="px-3 py-2 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-peach-300 outline-none"
      >
        <option value="">全部色系</option>
        <option v-for="item in colorList" :key="item.key" :value="item.key">{{ item.label }}</option>
      </select>
      
      <select
        :value="filter.pageType"
        @change="updateFilter('pageType', ($event.target as HTMLSelectElement).value as PageType | '')"
        class="px-3 py-2 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-peach-300 outline-none"
      >
        <option value="">全部页型</option>
        <option v-for="item in pageTypeList" :key="item.key" :value="item.key">{{ item.label }}</option>
      </select>
      
      <select
        :value="filter.status"
        @change="updateFilter('status', ($event.target as HTMLSelectElement).value as ThemeStatus | '')"
        class="px-3 py-2 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-peach-300 outline-none"
      >
        <option value="">全部状态</option>
        <option v-for="item in statusList" :key="item.key" :value="item.key">{{ item.label }}</option>
      </select>
      
      <select
        :value="filter.difficulty"
        @change="updateFilter('difficulty', ($event.target as HTMLSelectElement).value === '' ? '' : Number(($event.target as HTMLSelectElement).value))"
        class="px-3 py-2 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-peach-300 outline-none"
      >
        <option value="">全部难度</option>
        <option v-for="i in 5" :key="i" :value="i">{{ i }} 星</option>
      </select>
      
      <select
        :value="filter.assignee"
        @change="updateFilter('assignee', ($event.target as HTMLSelectElement).value)"
        class="px-3 py-2 rounded-xl bg-gray-50 border-0 text-sm focus:ring-2 focus:ring-peach-300 outline-none"
      >
        <option value="">全部责任人</option>
        <option v-for="name in assignees" :key="name" :value="name">{{ name }}</option>
      </select>
      
      <button
        @click="emit('reset')"
        class="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-peach-500 transition-colors"
      >
        <RotateCcw :size="16" />
        重置
      </button>
    </div>
  </div>
</template>
