<script setup lang="ts">
import { COLOR_MAP, type ColorScheme } from '@/types'

defineProps<{
  color: ColorScheme
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <span
    class="inline-block rounded-full border-2 border-white shadow-sm"
    :class="{
      'w-3 h-3': size === 'sm' || !size,
      'w-4 h-4': size === 'md',
      'w-6 h-6': size === 'lg'
    }"
    :style="{ backgroundColor: COLOR_MAP[color].hex }"
    :title="COLOR_MAP[color].label"
  />
</template>
