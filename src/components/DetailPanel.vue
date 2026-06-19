<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { StickerTheme, PageType, Difficulty, Status } from '../types'

const props = defineProps<{
  theme: StickerTheme | null
  colorSchemes: string[]
  pageTypes: PageType[]
  difficulties: Difficulty[]
  statuses: Status[]
  alerts: { themeId: string; type: string; message: string; level: string }[]
}>()

const emit = defineEmits<{
  (e: 'update', id: string, updates: Partial<StickerTheme>): void
  (e: 'close'): void
  (e: 'duplicate', id: string): void
  (e: 'delete', id: string): void
  (e: 'addTodo', themeId: string, text: string): void
  (e: 'toggleTodo', themeId: string, todoId: string): void
  (e: 'deleteTodo', themeId: string, todoId: string): void
}>()

const newTodoText = ref('')

const themeAlerts = computed(() => {
  if (!props.theme) return []
  return props.alerts.filter(a => a.themeId === props.theme!.id)
})

const incompleteTodos = computed(() => {
  if (!props.theme) return []
  return props.theme.todos.filter(t => !t.done)
})

const completedTodos = computed(() => {
  if (!props.theme) return []
  return props.theme.todos.filter(t => t.done)
})

function updateField<K extends keyof StickerTheme>(field: K, value: StickerTheme[K]) {
  if (props.theme) {
    emit('update', props.theme.id, { [field]: value })
  }
}

function togglePageType(pt: PageType) {
  if (!props.theme) return
  const current = props.theme.pageTypes
  if (current.includes(pt)) {
    updateField('pageTypes', current.filter(p => p !== pt) as PageType[])
  } else {
    updateField('pageTypes', [...current, pt])
  }
}

function handleAddTodo() {
  if (!props.theme || !newTodoText.value.trim()) return
  emit('addTodo', props.theme.id, newTodoText.value.trim())
  newTodoText.value = ''
}

function getStatusBadgeClass(status: Status) {
  const map: Record<Status, string> = {
    '待整理': 'badge-muted',
    '可使用': 'badge-success',
    '需补充': 'badge-danger',
    '仅展示': 'badge-info',
    '暂缓': 'badge-warning'
  }
  return map[status]
}

function getDifficultyBadgeClass(diff: Difficulty) {
  const map: Record<Difficulty, string> = {
    '简单': 'badge-success',
    '中等': 'badge-warning',
    '困难': 'badge-danger'
  }
  return map[diff]
}
</script>

<template>
  <div class="detail-panel" v-if="theme">
    <div class="panel-header">
      <div class="header-top">
        <h3>主题详情</h3>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>
      <div class="quick-actions">
        <button class="btn btn-sm btn-outline" @click="emit('duplicate', theme.id)">📋 复制</button>
        <button class="btn btn-sm btn-danger" @click="emit('delete', theme.id)">🗑 删除</button>
      </div>
    </div>

    <div class="panel-content">
      <div v-if="themeAlerts.length > 0" class="alerts-section">
        <div v-for="alert in themeAlerts" :key="alert.type" 
             :class="['alert', `alert-${alert.level}`]">
          <span>{{ alert.message }}</span>
        </div>
      </div>

      <div class="form-section">
        <label class="field-label">主题名</label>
        <input 
          type="text" 
          :value="theme.name" 
          @input="updateField('name', ($event.target as HTMLInputElement).value)"
          class="field-input"
        />
      </div>

      <div class="form-row">
        <div class="form-section">
          <label class="field-label">色系</label>
          <input 
            type="text" 
            list="color-schemes"
            :value="theme.colorScheme" 
            @input="updateField('colorScheme', ($event.target as HTMLInputElement).value)"
            class="field-input"
            placeholder="如：粉色系"
          />
          <datalist id="color-schemes">
            <option v-for="c in colorSchemes" :key="c" :value="c" />
          </datalist>
        </div>

        <div class="form-section">
          <label class="field-label">贴纸数量</label>
          <input 
            type="number" 
            :value="theme.stickerCount" 
            @input="updateField('stickerCount', parseInt(($event.target as HTMLInputElement).value) || 0)"
            class="field-input"
            min="0"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-section">
          <label class="field-label">难度</label>
          <select 
            :value="theme.difficulty" 
            @change="updateField('difficulty', ($event.target as HTMLSelectElement).value as Difficulty)"
            class="field-input"
          >
            <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>

        <div class="form-section">
          <label class="field-label">预计用时(分钟)</label>
          <input 
            type="number" 
            :value="theme.estimatedTime" 
            @input="updateField('estimatedTime', parseInt(($event.target as HTMLInputElement).value) || 0)"
            class="field-input"
            min="0"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-section">
          <label class="field-label">责任人</label>
          <input 
            type="text" 
            :value="theme.owner" 
            @input="updateField('owner', ($event.target as HTMLInputElement).value)"
            class="field-input"
            placeholder="负责人姓名"
          />
        </div>

        <div class="form-section">
          <label class="field-label">状态</label>
          <select 
            :value="theme.status" 
            @change="updateField('status', ($event.target as HTMLSelectElement).value as Status)"
            class="field-input"
          >
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <label class="field-label">适合页型</label>
        <div class="page-type-tags">
          <button 
            v-for="pt in pageTypes" 
            :key="pt"
            :class="['tag-btn', { active: theme.pageTypes.includes(pt) }]"
            @click="togglePageType(pt)"
          >
            {{ pt }}
          </button>
        </div>
      </div>

      <div class="form-section">
        <label class="field-label">示例说明</label>
        <textarea 
          :value="theme.example" 
          @input="updateField('example', ($event.target as HTMLTextAreaElement).value)"
          class="field-textarea"
          rows="2"
          placeholder="描述贴纸风格和使用场景..."
        />
      </div>

      <div class="form-section">
        <label class="field-label">临时备注</label>
        <textarea 
          :value="theme.notes" 
          @input="updateField('notes', ($event.target as HTMLTextAreaElement).value)"
          class="field-textarea"
          rows="3"
          placeholder="添加备注说明..."
        />
      </div>

      <div class="form-section">
        <label class="field-label">待办事项</label>
        <div class="todo-list">
          <div v-for="todo in incompleteTodos" :key="todo.id" class="todo-item">
            <input 
              type="checkbox" 
              :checked="todo.done"
              @change="emit('toggleTodo', theme.id, todo.id)"
            />
            <span class="todo-text">{{ todo.text }}</span>
            <button class="todo-delete" @click="emit('deleteTodo', theme.id, todo.id)">✕</button>
          </div>
          <div v-for="todo in completedTodos" :key="todo.id" class="todo-item completed">
            <input 
              type="checkbox" 
              :checked="todo.done"
              @change="emit('toggleTodo', theme.id, todo.id)"
            />
            <span class="todo-text">{{ todo.text }}</span>
            <button class="todo-delete" @click="emit('deleteTodo', theme.id, todo.id)">✕</button>
          </div>
          <div v-if="theme.todos.length === 0" class="todo-empty">暂无待办</div>
        </div>
        <div class="todo-input-row">
          <input 
            type="text" 
            v-model="newTodoText"
            @keyup.enter="handleAddTodo"
            placeholder="添加新待办..."
            class="todo-input"
          />
          <button class="btn btn-sm btn-primary" @click="handleAddTodo">添加</button>
        </div>
      </div>

      <div class="summary-section">
        <h4>待办摘要</h4>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-num">{{ incompleteTodos.length }}</span>
            <span class="stat-label">待完成</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ completedTodos.length }}</span>
            <span class="stat-label">已完成</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ theme.pageTypes.length }}</span>
            <span class="stat-label">适用页型</span>
          </div>
        </div>
        <div class="summary-tags">
          <span :class="['badge', getStatusBadgeClass(theme.status)]">{{ theme.status }}</span>
          <span :class="['badge', getDifficultyBadgeClass(theme.difficulty)]">{{ theme.difficulty }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="detail-panel empty" v-else>
    <div class="empty-state">
      <div class="empty-icon">📔</div>
      <p>选择一个主题查看详情</p>
      <p class="empty-hint">点击表格中的任意行即可编辑</p>
    </div>
  </div>
</template>

<style scoped>
.detail-panel {
  width: 380px;
  background: var(--bg-card);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.detail-panel.empty {
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-hint {
  font-size: 12px;
  margin-top: 8px;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-sidebar);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-top h3 {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-size: 14px;
}

.close-btn:hover {
  background: var(--border-light);
  color: var(--text);
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.alerts-section {
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-light);
  margin-bottom: 6px;
}

.field-input,
.field-textarea {
  width: 100%;
}

.field-textarea {
  resize: vertical;
}

.page-type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-btn {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  background: var(--bg-sidebar);
  color: var(--text-light);
  border: 1px solid transparent;
}

.tag-btn:hover {
  background: var(--border-light);
}

.tag-btn.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
}

.todo-list {
  background: var(--bg-sidebar);
  border-radius: var(--radius-sm);
  padding: 8px;
  margin-bottom: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: var(--text-muted);
}

.todo-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
}

.todo-text {
  flex: 1;
  font-size: 13px;
}

.todo-delete {
  color: var(--text-muted);
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.todo-delete:hover {
  color: var(--danger);
  background: #fde8e8;
}

.todo-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  padding: 12px;
}

.todo-input-row {
  display: flex;
  gap: 8px;
}

.todo-input {
  flex: 1;
}

.summary-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.summary-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.summary-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 11px;
  color: var(--text-light);
}

.summary-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
