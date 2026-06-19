<script setup lang="ts">
import { STATUS_MAP, type ThemeStatus } from '@/types'

defineProps<{
  status: ThemeStatus
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :style="{
      backgroundColor: STATUS_MAP[status].bg,
      color: STATUS_MAP[status].color
    }"
  >
    {{ STATUS_MAP[status].label }}
  </span>
</template>
