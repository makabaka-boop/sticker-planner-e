<script setup lang="ts">
import { computed } from 'vue'
import { COLOR_HEX } from '@/types'

const props = defineProps<{ name: string; size?: number }>()
const color = computed(() => COLOR_HEX[props.name] || '#8B8175')
const size = computed(() => `${props.size ?? 14}px`)
</script>

<template>
  <span class="color-dot" :style="{ '--c': color, '--s': size }" :title="name" />
</template>

<style scoped>
.color-dot {
  display: inline-block;
  width: var(--s);
  height: var(--s);
  border-radius: 50%;
  background: var(--c);
  border: 1px solid rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
}
</style>
