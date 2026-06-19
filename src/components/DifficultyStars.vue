<script setup lang="ts">
import { Star } from 'lucide-vue-next'

defineProps<{
  level: number
  size?: number
}>()
</script>

<template>
  <div class="flex items-center gap-0.5">
    <Star
      v-for="i in 5"
      :key="i"
      :size="size || 14"
      :class="i <= level ? 'text-amber-400 fill-amber-400' : 'text-gray-200'"
    />
  </div>
</template>
