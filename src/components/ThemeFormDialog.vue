<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { usePlannerStore } from '@/store/planner'
import { STATUS_LABEL, STATUS_ORDER } from '@/types'
import type { StickerTheme, ThemeStatus } from '@/types'
import ColorDot from './ColorDot.vue'
import DifficultyStars from './DifficultyStars.vue'

const props = defineProps<{
  open: boolean
  themeId: string | null
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const store = usePlannerStore()

const initial = (): Omit<StickerTheme, 'id' | 'order' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  colorFamily: store.settings.colorFamilies[0] ?? '枫叶橙',
  stickerCount: 12,
  pageTypes: [],
  example: '',
  difficulty: 2,
  estimatedMinutes: 30,
  owner: store.settings.owners[0] ?? '',
  status: 'pending',
  note: '',
  todos: [],
})

const form = reactive(initial())

const isEdit = computed(() => !!props.themeId)
const dialogTitle = computed(() => (isEdit.value ? '编辑主题' : '新增主题'))

watch(
  () => [props.open, props.themeId],
  () => {
    if (!props.open) return
    if (props.themeId) {
      const t = store.themes.find((x) => x.id === props.themeId)
      if (t) {
        Object.assign(form, {
          name: t.name,
          colorFamily: t.colorFamily,
          stickerCount: t.stickerCount,
          pageTypes: [...t.pageTypes],
          example: t.example,
          difficulty: t.difficulty,
          estimatedMinutes: t.estimatedMinutes,
          owner: t.owner,
          status: t.status,
          note: t.note,
          todos: t.todos.map((td) => ({ ...td })),
        })
      }
    } else {
      Object.assign(form, initial())
    }
  },
  { immediate: true },
)

function togglePageType(p: string) {
  form.pageTypes = form.pageTypes.includes(p)
    ? form.pageTypes.filter((x) => x !== p)
    : [...form.pageTypes, p]
}

function submit() {
  if (!form.name.trim()) {
    alert('主题名不能为空')
    return
  }
  if (props.themeId) {
    store.updateTheme(props.themeId, { ...form })
  } else {
    store.addTheme({ ...form })
  }
  emit('close')
}

function dupAndClose() {
  if (!props.themeId) return
  store.duplicateTheme(props.themeId)
  emit('close')
}
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="modal-mask" @click.self="emit('close')">
      <div class="modal-card">
        <header class="modal-head">
          <h2>{{ dialogTitle }}</h2>
          <button class="icon-close" @click="emit('close')"><X :size="18" /></button>
        </header>

        <div class="modal-body">
          <div class="row">
            <label class="field">
              <span class="label">主题名 *</span>
              <input type="text" v-model="form.name" placeholder="例如：秋日落叶" />
            </label>
            <label class="field">
              <span class="label">色系</span>
              <div class="color-grid">
                <button
                  v-for="c in store.settings.colorFamilies"
                  :key="c"
                  type="button"
                  class="color-cell"
                  :class="{ active: form.colorFamily === c }"
                  @click="form.colorFamily = c"
                >
                  <ColorDot :name="c" :size="14" />
                  {{ c }}
                </button>
              </div>
            </label>
          </div>

          <div class="row">
            <label class="field">
              <span class="label">贴纸数量</span>
              <input type="number" min="0" v-model.number="form.stickerCount" />
            </label>
            <label class="field">
              <span class="label">预计用时（分钟）</span>
              <input type="number" min="0" v-model.number="form.estimatedMinutes" />
            </label>
            <label class="field">
              <span class="label">难度</span>
              <DifficultyStars
                :value="form.difficulty"
                interactive
                @update="(n: number) => (form.difficulty = n as 1 | 2 | 3 | 4 | 5)"
              />
            </label>
          </div>

          <div class="field">
            <span class="label">适合页型（多选）</span>
            <div class="chips">
              <button
                v-for="p in store.settings.pageTypes"
                :key="p"
                type="button"
                class="chip"
                :class="{ 'chip--active': form.pageTypes.includes(p) }"
                @click="togglePageType(p)"
              >{{ p }}</button>
            </div>
          </div>

          <div class="field">
            <span class="label">示例说明</span>
            <textarea v-model="form.example" placeholder="如：银杏、枫叶剪影、咖啡杯..." />
          </div>

          <div class="row">
            <label class="field">
              <span class="label">责任人</span>
              <select v-model="form.owner">
                <option v-for="o in store.settings.owners" :key="o" :value="o">{{ o }}</option>
              </select>
            </label>
            <label class="field">
              <span class="label">状态</span>
              <select v-model="form.status">
                <option v-for="s in STATUS_ORDER" :key="s" :value="s">{{ STATUS_LABEL[s as ThemeStatus] }}</option>
              </select>
            </label>
          </div>

          <div class="field">
            <span class="label">临时备注</span>
            <textarea v-model="form.note" placeholder="使用建议、缺口、风格提醒..." />
          </div>
        </div>

        <footer class="modal-foot">
          <button v-if="isEdit" class="btn btn--sm btn--ghost" @click="dupAndClose">按主题复制</button>
          <div class="foot-right">
            <button class="btn btn--sm" @click="emit('close')">取消</button>
            <button class="btn btn--sm btn--primary" @click="submit">{{ isEdit ? '保存' : '创建' }}</button>
          </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(31, 27, 22, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
  backdrop-filter: blur(2px);
}
.modal-card {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 580px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.22s ease;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid var(--line-soft);
}
.modal-head h2 { font-family: var(--font-display); font-size: 22px; font-weight: 600; }
.icon-close {
  background: transparent;
  border: 0;
  color: var(--ink-mute);
  padding: 4px;
  display: inline-flex;
}
.icon-close:hover { color: var(--ink); }

.modal-body {
  padding: 18px 22px 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field .label { display: block; }

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 4px;
}
.color-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid var(--line-soft);
  background: transparent;
  font-size: 12px;
  color: var(--ink-soft);
  border-radius: var(--radius-sm);
}
.color-cell.active { border-color: var(--ink); background: var(--paper-deep); color: var(--ink); }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }

.modal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid var(--line-soft);
  background: var(--paper);
}
.foot-right { display: flex; gap: 8px; margin-left: auto; }
</style>
