<script setup lang="ts">
import type { ActivityGroup, StickerTheme } from '../types'

defineProps<{
  groups: ActivityGroup[]
  totalThemes: number
  totalStickers: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function getStatusBadgeClass(status: string) {
  const map: Record<string, string> = {
    '待整理': 'badge-muted',
    '可使用': 'badge-success',
    '需补充': 'badge-danger',
    '仅展示': 'badge-info',
    '暂缓': 'badge-warning'
  }
  return map[status] || 'badge-muted'
}
</script>

<template>
  <div class="preview-overlay">
    <div class="preview-modal">
      <div class="preview-header">
        <div>
          <h2>🎁 活动包预览</h2>
          <p class="preview-subtitle">基于当前筛选结果生成贴纸包清单</p>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="preview-summary">
        <div class="summary-card">
          <div class="summary-num">{{ groups.length }}</div>
          <div class="summary-label">参与小组</div>
        </div>
        <div class="summary-card">
          <div class="summary-num">{{ totalThemes }}</div>
          <div class="summary-label">可用主题</div>
        </div>
        <div class="summary-card">
          <div class="summary-num">{{ totalStickers }}</div>
          <div class="summary-label">贴纸总数</div>
        </div>
        <div class="summary-card warning" v-if="groups.some(g => g.gaps.length > 0)">
          <div class="summary-num">⚠️</div>
          <div class="summary-label">存在缺口</div>
        </div>
      </div>

      <div class="preview-content">
        <div v-if="groups.length === 0" class="empty-preview">
          <div class="empty-icon">📦</div>
          <p>没有可用的主题</p>
          <p class="empty-hint">请确保有「可使用」或「需补充」状态的主题</p>
        </div>

        <div v-for="group in groups" :key="group.name" class="group-card">
          <div class="group-header">
            <div class="group-title">
              <span class="group-icon">👥</span>
              <h3>{{ group.name }}</h3>
              <span class="badge badge-secondary">{{ group.themes.length }} 个主题</span>
            </div>
            <div class="group-stats">
              <span class="stat">贴纸合计: <strong>{{ group.totalStickers }}</strong> 张</span>
            </div>
          </div>

          <div v-if="group.gaps.length > 0" class="gaps-section">
            <div class="gaps-title">⚠️ 缺口提醒</div>
            <div v-for="(gap, idx) in group.gaps" :key="idx" class="gap-item">
              {{ gap }}
            </div>
          </div>

          <div class="theme-list">
            <div v-for="theme in group.themes" :key="theme.id" class="theme-item">
              <div class="theme-color-dot" :style="{ background: getColorDot(theme.colorScheme) }"></div>
              <div class="theme-info">
                <div class="theme-name-row">
                  <span class="theme-name">{{ theme.name }}</span>
                  <span :class="['badge', getStatusBadgeClass(theme.status)]">{{ theme.status }}</span>
                </div>
                <div class="theme-meta">
                  <span>{{ theme.colorScheme }}</span>
                  <span class="dot">·</span>
                  <span>{{ theme.stickerCount }} 张</span>
                  <span class="dot">·</span>
                  <span>{{ theme.pageTypes.join('、') }}</span>
                </div>
                <div v-if="theme.example" class="theme-example">{{ theme.example }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="preview-footer">
        <button class="btn btn-primary" @click="emit('close')">返回整理</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
function getColorDot(colorScheme: string): string {
  const colorMap: Record<string, string> = {
    '粉色系': '#ffb6c1',
    '蓝色系': '#87ceeb',
    '橙色系': '#ffb347',
    '绿色系': '#90ee90',
    '紫色系': '#dda0dd',
    '黄色系': '#ffeaa7',
    '红色系': '#f08080',
    '棕色系': '#deb887',
    '灰色系': '#c0c0c0',
    '白色系': '#f5f5f5',
    '黑色系': '#808080'
  }
  return colorMap[colorScheme] || '#d4a5a5'
}
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.preview-modal {
  background: var(--bg);
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.preview-header {
  padding: 24px 28px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.preview-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.preview-subtitle {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 4px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-size: 16px;
}

.close-btn:hover {
  background: var(--border-light);
  color: var(--text);
}

.preview-summary {
  display: flex;
  gap: 16px;
  padding: 20px 28px;
  border-bottom: 1px solid var(--border);
}

.summary-card {
  flex: 1;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow);
}

.summary-card.warning {
  background: #fff4e0;
}

.summary-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
}

.summary-card.warning .summary-num {
  color: var(--warning);
}

.summary-label {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px;
}

.empty-preview {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.empty-hint {
  font-size: 12px;
  margin-top: 8px;
}

.group-card {
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: var(--shadow);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.group-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-icon {
  font-size: 24px;
}

.group-title h3 {
  font-size: 16px;
  font-weight: 600;
}

.group-stats .stat {
  font-size: 13px;
  color: var(--text-light);
}

.group-stats strong {
  color: var(--primary);
  font-size: 16px;
}

.gaps-section {
  background: #fff4e0;
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-bottom: 16px;
}

.gaps-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--warning);
  margin-bottom: 8px;
}

.gap-item {
  font-size: 12px;
  color: #b87d2f;
  padding: 2px 0;
}

.theme-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-sidebar);
  border-radius: var(--radius-sm);
}

.theme-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.theme-info {
  flex: 1;
}

.theme-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.theme-name {
  font-weight: 600;
  font-size: 14px;
}

.theme-meta {
  font-size: 12px;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 6px;
}

.theme-meta .dot {
  opacity: 0.5;
}

.theme-example {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  font-style: italic;
}

.preview-footer {
  padding: 16px 28px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
}
</style>
