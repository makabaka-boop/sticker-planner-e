<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeStatus } from '@/types'
import { STATUS_COLOR, STATUS_LABEL } from '@/types'

const props = defineProps<{ status: ThemeStatus; size?: 'sm' | 'md' }>()

const color = computed(() => STATUS_COLOR[props.status])
const label = computed(() => STATUS_LABEL[props.status])
</script>

<template>
  <span class="status-badge" :class="{ 'status-badge--sm': size === 'sm' }" :style="{ '--c': color }">
    <i class="dot" />
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--c);
  color: var(--c);
  font-size: 12px;
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.4);
}
.status-badge--sm { padding: 2px 8px; font-size: 11px; }
.dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--c);
}
</style>
