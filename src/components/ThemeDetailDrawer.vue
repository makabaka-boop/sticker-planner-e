<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, Plus, Trash2, Pencil, Sparkles } from 'lucide-vue-next'
import { usePlannerStore } from '@/store/planner'
import { COLOR_HEX, STATUS_LABEL } from '@/types'
import { detectSmartTips, SMART_TIP_LABEL } from '@/composables/useSmartTips'
import StatusBadge from './StatusBadge.vue'
import DifficultyStars from './DifficultyStars.vue'

const store = usePlannerStore()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', id: string): void
}>()

const theme = computed(() =>
  store.activeThemeId ? store.themes.find((t) => t.id === store.activeThemeId) ?? null : null,
)

const noteDraft = ref('')
const newTodoText = ref('')

watch(
  () => theme.value?.id,
  () => {
    noteDraft.value = theme.value?.note ?? ''
  },
  { immediate: true },
)

let saveTimer: number | null = null
function onNoteInput() {
  if (saveTimer) window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    if (theme.value) store.updateNote(theme.value.id, noteDraft.value)
  }, 350)
}

function addTodo() {
  if (theme.value) {
    store.addTodo(theme.value.id, newTodoText.value)
    newTodoText.value = ''
  }
}

const stripeColor = computed(() => (theme.value ? COLOR_HEX[theme.value.colorFamily] || '#8B8175' : '#8B8175'))

const themeTips = computed(() => {
  if (!theme.value) return []
  const all = detectSmartTips(store.themes)
  return all.filter((tip) => tip.themeIds.includes(theme.value!.id))
})

function close() { emit('close') }
</script>

<template>
  <transition name="drawer">
    <aside v-if="theme" class="drawer no-print" :style="{ '--stripe': stripeColor }">
      <header class="drawer__head">
        <div class="head-meta">
          <span class="color-pill" :style="{ background: stripeColor }" />
          <span class="label">{{ theme.colorFamily }}</span>
          <StatusBadge :status="theme.status" size="sm" />
        </div>
        <button class="icon-close" @click="close"><X :size="18" /></button>
      </header>

      <h2 class="drawer__title">{{ theme.name }}</h2>
      <p v-if="theme.example" class="drawer__example">{{ theme.example }}</p>

      <section class="info-grid">
        <div class="info">
          <span class="label">贴纸数量</span>
          <span class="info__val">{{ theme.stickerCount }}</span>
        </div>
        <div class="info">
          <span class="label">预计用时</span>
          <span class="info__val">{{ theme.estimatedMinutes }} <span class="unit">min</span></span>
        </div>
        <div class="info">
          <span class="label">难度</span>
          <DifficultyStars :value="theme.difficulty" />
        </div>
        <div class="info">
          <span class="label">责任人</span>
          <span class="info__val info__val--sm">{{ theme.owner }}</span>
        </div>
        <div class="info info--full">
          <span class="label">适合页型</span>
          <div class="tags">
            <span v-for="p in theme.pageTypes" :key="p" class="tag">{{ p }}</span>
            <span v-if="!theme.pageTypes.length" class="empty">未指定</span>
          </div>
        </div>
      </section>

      <section class="block">
        <div class="block__head">
          <span class="label">临时备注</span>
          <span class="hint">自动保存</span>
        </div>
        <textarea
          v-model="noteDraft"
          @input="onNoteInput"
          placeholder="记录使用提醒、缺口、搭配建议..."
        />
      </section>

      <section class="block">
        <div class="block__head">
          <span class="label">待办摘要</span>
          <span class="hint">{{ theme.todos.filter((t) => t.done).length }}/{{ theme.todos.length }} 已完成</span>
        </div>
        <ul class="todos">
          <li v-for="td in theme.todos" :key="td.id" class="todo">
            <label class="todo__check">
              <input
                type="checkbox"
                :checked="td.done"
                @change="store.toggleTodo(theme!.id, td.id)"
              />
              <span :class="{ done: td.done }">{{ td.content }}</span>
            </label>
            <button class="icon-mini" @click="store.removeTodo(theme!.id, td.id)">
              <Trash2 :size="13" />
            </button>
          </li>
        </ul>
        <div class="todo-add">
          <input
            type="text"
            v-model="newTodoText"
            placeholder="新增待办，回车添加"
            @keyup.enter="addTodo"
          />
          <button class="btn btn--sm" @click="addTodo"><Plus :size="13" />添加</button>
        </div>
      </section>

      <section v-if="themeTips.length" class="block tips-block">
        <div class="block__head">
          <span class="label"><Sparkles :size="12" /> 智能提示</span>
        </div>
        <article v-for="t in themeTips" :key="t.id" class="mini-tip">
          <span class="mini-tip__type">{{ SMART_TIP_LABEL[t.type] }}</span>
          <span class="mini-tip__msg">{{ t.message }}</span>
        </article>
      </section>

      <footer class="drawer__foot">
        <span class="time">最近更新 · {{ new Date(theme.updatedAt).toLocaleString() }}</span>
        <button class="btn btn--sm" @click="emit('edit', theme.id)">
          <Pencil :size="13" />编辑全部字段
        </button>
      </footer>
    </aside>
  </transition>
</template>

<style scoped>
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  max-width: 92vw;
  background: var(--paper);
  border-left: 1px solid var(--line);
  z-index: 80;
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  box-shadow: -16px 0 30px rgba(31, 27, 22, 0.08);
}
.drawer::before {
  content: '';
  position: absolute;
  top: 0; bottom: 0; left: 0;
  width: 4px;
  background: var(--stripe);
}

.drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.head-meta { display: flex; align-items: center; gap: 10px; }
.color-pill {
  display: inline-block;
  width: 14px; height: 14px; border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.icon-close {
  background: transparent;
  border: 0;
  padding: 4px;
  color: var(--ink-mute);
  display: inline-flex;
}
.icon-close:hover { color: var(--ink); }

.drawer__title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.drawer__example {
  margin: 0;
  color: var(--ink-soft);
  font-size: 13px;
  line-height: 1.55;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 16px;
  border-top: 1px solid var(--line-soft);
  border-bottom: 1px solid var(--line-soft);
  padding: 14px 0;
}
.info { display: flex; flex-direction: column; gap: 4px; }
.info--full { grid-column: span 2; }
.info__val {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
}
.info__val--sm {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
}
.unit { font-size: 12px; color: var(--ink-mute); margin-left: 2px; }

.tags { display: flex; flex-wrap: wrap; gap: 4px; }
.tag {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px dashed var(--line-soft);
  border-radius: 2px;
  color: var(--ink-soft);
}
.empty { font-size: 12px; color: var(--ink-mute); }

.block { display: flex; flex-direction: column; gap: 8px; }
.block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hint { font-size: 11px; color: var(--ink-mute); }
.block__head .label { display: inline-flex; align-items: center; gap: 4px; }

.todos {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.todo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.5);
}
.todo__check { display: inline-flex; align-items: center; gap: 8px; flex: 1; cursor: pointer; }
.todo__check input { accent-color: var(--ink); }
.todo__check span.done { text-decoration: line-through; color: var(--ink-mute); }
.icon-mini {
  background: transparent; border: 0; color: var(--ink-mute);
  display: inline-flex; padding: 2px;
}
.icon-mini:hover { color: var(--orange); }

.todo-add { display: flex; gap: 6px; }
.todo-add input { flex: 1; }

.tips-block .mini-tip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border-left: 2px solid var(--orange);
  background: rgba(217, 83, 44, 0.06);
  font-size: 12px;
}
.mini-tip__type { font-weight: 600; color: var(--orange); }
.mini-tip__msg { color: var(--ink-soft); }

.drawer__foot {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--line-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  color: var(--ink-mute);
}

.drawer-enter-active, .drawer-leave-active {
  transition: transform 0.28s cubic-bezier(0.2, 0.7, 0.3, 1);
}
.drawer-enter-from, .drawer-leave-to {
  transform: translateX(100%);
}
</style>
