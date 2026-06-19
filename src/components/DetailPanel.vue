<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PageType } from '../types'
import { useStickerStore, colorMap, statusColorMap, colorSchemes, pageTypes, difficulties, statuses } from '../composables/useStickerStore'

const store = useStickerStore()
const newTodo = ref('')

const theme = computed(() => store.activeTheme.value)

const localName = ref('')
const localColorScheme = ref(colorSchemes[0])
const localStickerCount = ref(20)
const localSuitablePages = ref<PageType[]>([])
const localExample = ref('')
const localDifficulty = ref(difficulties[0])
const localEstimatedTime = ref(30)
const localResponsible = ref('')
const localStatus = ref(statuses[0])
const localNotes = ref('')

watch(theme, (t) => {
  if (t) {
    localName.value = t.name
    localColorScheme.value = t.colorScheme
    localStickerCount.value = t.stickerCount
    localSuitablePages.value = [...t.suitablePages]
    localExample.value = t.example
    localDifficulty.value = t.difficulty
    localEstimatedTime.value = t.estimatedTime
    localResponsible.value = t.responsible
    localStatus.value = t.status
    localNotes.value = t.notes
  }
}, { immediate: true })

const saveChanges = () => {
  if (!theme.value) return
  store.updateTheme(theme.value.id, {
    name: localName.value,
    colorScheme: localColorScheme.value,
    stickerCount: localStickerCount.value,
    suitablePages: [...localSuitablePages.value],
    example: localExample.value,
    difficulty: localDifficulty.value,
    estimatedTime: localEstimatedTime.value,
    responsible: localResponsible.value,
    status: localStatus.value,
    notes: localNotes.value
  })
}

const togglePage = (page: PageType) => {
  const idx = localSuitablePages.value.indexOf(page)
  if (idx === -1) {
    localSuitablePages.value.push(page)
  } else {
    localSuitablePages.value.splice(idx, 1)
  }
}

const handleAddTodo = () => {
  if (!theme.value || !newTodo.value.trim()) return
  store.addTodo(theme.value.id, newTodo.value.trim())
  newTodo.value = ''
}

const close = () => {
  saveChanges()
  store.activeThemeId.value = null
}

const handleDelete = () => {
  if (!theme.value) return
  if (confirm('确定要删除这个主题吗？')) {
    store.deleteTheme(theme.value.id)
  }
}

const handleDuplicate = () => {
  if (!theme.value) return
  store.duplicateTheme(theme.value.id)
}
</script>

<template>
  <div v-if="theme" class="detail-panel">
    <div class="panel-header">
      <h3>主题详情</h3>
      <button class="close-btn" @click="close">×</button>
    </div>

    <div class="panel-content">
      <div class="form-section">
        <label>主题名</label>
        <input v-model="localName" @blur="saveChanges" class="input" />
      </div>

      <div class="form-row">
        <div class="form-section half">
          <label>色系</label>
          <select v-model="localColorScheme" @change="saveChanges" class="select">
            <option v-for="c in colorSchemes" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="form-section half">
          <label>贴纸数量</label>
          <input type="number" v-model.number="localStickerCount" @blur="saveChanges" class="input" min="0" />
        </div>
      </div>

      <div class="form-section">
        <label>适合页型</label>
        <div class="page-tags">
          <button
            v-for="p in pageTypes"
            :key="p"
            :class="['page-tag', { active: localSuitablePages.includes(p) }]"
            @click="togglePage(p); saveChanges()"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <div class="form-section">
        <label>示例说明</label>
        <input v-model="localExample" @blur="saveChanges" class="input" placeholder="描述贴纸内容..." />
      </div>

      <div class="form-row">
        <div class="form-section half">
          <label>难度</label>
          <select v-model="localDifficulty" @change="saveChanges" class="select">
            <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div class="form-section half">
          <label>预计用时(分钟)</label>
          <input type="number" v-model.number="localEstimatedTime" @blur="saveChanges" class="input" min="0" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-section half">
          <label>责任人</label>
          <input v-model="localResponsible" @blur="saveChanges" class="input" placeholder="负责人姓名" />
        </div>
        <div class="form-section half">
          <label>状态</label>
          <select v-model="localStatus" @change="saveChanges" class="select">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div class="preview-card">
        <div class="color-preview" :style="{ background: colorMap[theme.colorScheme] }"></div>
        <div class="preview-info">
          <span class="status-badge" :style="{ background: statusColorMap[theme.status] }">{{ theme.status }}</span>
          <span class="meta">难度: {{ theme.difficulty }}</span>
          <span class="meta">预计: {{ theme.estimatedTime }}分钟</span>
        </div>
      </div>

      <div class="form-section">
        <label>临时备注</label>
        <textarea v-model="localNotes" @blur="saveChanges" class="textarea" rows="3" placeholder="记录临时备注信息..."></textarea>
      </div>

      <div class="form-section">
        <label>待办事项 ({{ theme.todos.filter(t => !t.startsWith('✓ ')).length }}项待办)</label>
        <div class="todo-list">
          <div v-for="(todo, idx) in theme.todos" :key="idx" class="todo-item">
            <input
              type="checkbox"
              :checked="todo.startsWith('✓ ')"
              @change="store.toggleTodo(theme.id, idx)"
            />
            <span :class="{ done: todo.startsWith('✓ ') }">{{ todo.replace('✓ ', '') }}</span>
            <button class="todo-del" @click="store.removeTodo(theme.id, idx)">×</button>
          </div>
        </div>
        <div class="todo-input-row">
          <input v-model="newTodo" @keyup.enter="handleAddTodo" class="input" placeholder="添加待办..." />
          <button class="btn btn-sm" @click="handleAddTodo">添加</button>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-secondary" @click="handleDuplicate">复制主题</button>
        <button class="btn btn-danger" @click="handleDelete">删除</button>
      </div>

      <div class="meta-info">
        <small>创建于: {{ new Date(theme.createdAt).toLocaleString() }}</small>
        <small>更新于: {{ new Date(theme.updatedAt).toLocaleString() }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-panel {
  width: 380px;
  height: 100vh;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -4px 0 20px rgba(0,0,0,0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(0,0,0,0.05);
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0,0,0,0.1);
  color: #1f2937;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.form-section {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-section.half {
  flex: 1;
}

.form-section label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
}

.input, .select, .textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.input:focus, .select:focus, .textarea:focus {
  outline: none;
  border-color: #ec4899;
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1);
}

.textarea {
  resize: vertical;
}

.page-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.page-tag {
  padding: 4px 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-tag:hover {
  border-color: #ec4899;
}

.page-tag.active {
  background: #ec4899;
  border-color: #ec4899;
  color: #fff;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 16px;
}

.color-preview {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.preview-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: #fff;
  font-weight: 500;
  width: fit-content;
}

.meta {
  font-size: 12px;
  color: #6b7280;
}

.todo-list {
  margin-bottom: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
}

.todo-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #ec4899;
}

.todo-item span {
  flex: 1;
}

.todo-item span.done {
  text-decoration: line-through;
  color: #9ca3af;
}

.todo-del {
  width: 20px;
  height: 20px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-input-row {
  display: flex;
  gap: 8px;
}

.todo-input-row .input {
  flex: 1;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  background: #ec4899;
  color: #fff;
}

.btn-sm:hover {
  background: #db2777;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #fee2e2;
  color: #ef4444;
}

.btn-danger:hover {
  background: #fecaca;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.action-buttons .btn {
  flex: 1;
}

.meta-info {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-info small {
  color: #9ca3af;
}
</style>
