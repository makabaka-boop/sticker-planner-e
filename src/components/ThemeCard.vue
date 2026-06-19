<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Hash, Copy, Pencil, Trash2, CheckSquare, Square, ListChecks } from 'lucide-vue-next'
import type { StickerTheme } from '@/types'
import { COLOR_HEX } from '@/types'
import StatusBadge from './StatusBadge.vue'
import DifficultyStars from './DifficultyStars.vue'

const props = defineProps<{
  theme: StickerTheme
  selected: boolean
  active: boolean
}>()

const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'edit', id: string): void
  (e: 'duplicate', id: string): void
  (e: 'delete', id: string): void
  (e: 'toggle-select', id: string): void
}>()

const stripeColor = computed(() => COLOR_HEX[props.theme.colorFamily] || '#8B8175')
const todoSummary = computed(() => {
  const all = props.theme.todos.length
  const done = props.theme.todos.filter((t) => t.done).length
  return { all, done }
})

function open() { emit('open', props.theme.id) }
function edit(e: Event) { e.stopPropagation(); emit('edit', props.theme.id) }
function dup(e: Event) { e.stopPropagation(); emit('duplicate', props.theme.id) }
function del(e: Event) { e.stopPropagation(); emit('delete', props.theme.id) }
function toggleSel(e: Event) { e.stopPropagation(); emit('toggle-select', props.theme.id) }
</script>

<template>
  <article
    class="theme-card"
    :class="{ 'theme-card--active': active, 'theme-card--selected': selected }"
    :style="{ '--stripe': stripeColor }"
    @click="open"
  >
    <button class="card-check" :aria-label="selected ? '取消选中' : '选中'" @click="toggleSel">
      <CheckSquare v-if="selected" :size="16" />
      <Square v-else :size="16" />
    </button>

    <div class="card-head">
      <h3 class="card-title">{{ theme.name }}</h3>
      <StatusBadge :status="theme.status" size="sm" />
    </div>

    <div class="card-meta">
      <span class="meta">
        <span class="color-pill" :style="{ background: stripeColor }" />
        {{ theme.colorFamily }}
      </span>
      <span class="meta"><Hash :size="13" />{{ theme.stickerCount }} 张</span>
      <span class="meta"><Clock :size="13" />{{ theme.estimatedMinutes }} min</span>
      <span class="meta"><DifficultyStars :value="theme.difficulty" /></span>
    </div>

    <p v-if="theme.example" class="example">{{ theme.example }}</p>

    <div class="tags">
      <span v-for="p in theme.pageTypes" :key="p" class="tag">{{ p }}</span>
    </div>

    <p v-if="theme.note" class="note">备注 · {{ theme.note }}</p>

    <div class="card-foot">
      <span class="owner">
        <span class="avatar">{{ theme.owner.slice(0, 1) }}</span>
        {{ theme.owner }}
      </span>
      <span v-if="todoSummary.all" class="todo-summary">
        <ListChecks :size="13" />
        待办 {{ todoSummary.done }}/{{ todoSummary.all }}
      </span>
      <div class="card-actions">
        <button class="icon-btn" :aria-label="'编辑'" @click="edit"><Pencil :size="14" /></button>
        <button class="icon-btn" :aria-label="'复制'" @click="dup"><Copy :size="14" /></button>
        <button class="icon-btn icon-btn--danger" :aria-label="'删除'" @click="del"><Trash2 :size="14" /></button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.theme-card {
  position: relative;
  background: #FFFDF7;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-md);
  padding: 18px 20px 14px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.theme-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--stripe);
}
.theme-card:hover { border-color: var(--ink); }
.theme-card--active { border-color: var(--ink); box-shadow: 4px 4px 0 var(--paper-deep); }
.theme-card--selected { background: var(--paper-deep); }

.card-check {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: 0;
  color: var(--ink-mute);
  display: inline-flex;
  padding: 2px;
}
.card-check:hover { color: var(--ink); }
.theme-card--selected .card-check { color: var(--ink); }

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-right: 28px;
}
.card-title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  align-items: center;
  color: var(--ink-soft);
  font-size: 12px;
}
.meta { display: inline-flex; align-items: center; gap: 4px; }
.color-pill {
  display: inline-block;
  width: 10px; height: 10px; border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  margin-right: 2px;
}

.example {
  margin: 0;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.5;
}

.tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tag {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px dashed var(--line-soft);
  border-radius: 2px;
  color: var(--ink-mute);
}

.note {
  margin: 0;
  padding: 6px 10px;
  background: var(--paper);
  border-left: 2px solid var(--orange);
  font-size: 12px;
  color: var(--ink-soft);
  font-style: italic;
}

.card-foot {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px dashed var(--line-soft);
  font-size: 12px;
  color: var(--ink-mute);
}
.owner { display: inline-flex; align-items: center; gap: 6px; color: var(--ink-soft); }
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px; height: 20px;
  border: 1px solid var(--ink);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
}
.todo-summary { display: inline-flex; align-items: center; gap: 4px; }
.card-actions { margin-left: auto; display: flex; gap: 2px; }
.icon-btn {
  background: transparent;
  border: 0;
  color: var(--ink-mute);
  padding: 4px;
  display: inline-flex;
  border-radius: 2px;
  transition: all 0.12s ease;
}
.icon-btn:hover { background: var(--ink); color: var(--paper); }
.icon-btn--danger:hover { background: var(--orange); color: var(--paper); }

.dragging { opacity: 0.5; }
</style>
