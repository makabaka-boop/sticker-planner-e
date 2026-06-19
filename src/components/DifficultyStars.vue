<script setup lang="ts">
import { Star } from 'lucide-vue-next'

defineProps<{ value: number; interactive?: boolean }>()
const emit = defineEmits<{ (e: 'update', n: number): void }>()

function pick(n: number) {
  emit('update', n)
}
</script>

<template>
  <div class="rating" :class="{ 'rating--interactive': interactive }">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      class="rating__star"
      :class="{ active: n <= value }"
      :disabled="!interactive"
      @click="pick(n)"
      :aria-label="`难度 ${n}`"
    >
      <Star :size="14" :stroke-width="1.5" :fill="n <= value ? 'currentColor' : 'none'" />
    </button>
  </div>
</template>

<style scoped>
.rating { display: inline-flex; gap: 2px; color: var(--ink); }
.rating__star {
  background: transparent;
  border: 0;
  padding: 0;
  color: var(--line-soft);
  display: inline-flex;
}
.rating__star.active { color: var(--orange); }
.rating--interactive .rating__star { cursor: pointer; }
.rating--interactive .rating__star:hover { color: var(--ink); }
</style>
