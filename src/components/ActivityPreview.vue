<script setup lang="ts">
import { computed } from 'vue'
import { useStickerStore, colorMap, statusColorMap } from '../composables/useStickerStore'

const store = useStickerStore()

const packages = computed(() => store.activityPackages.value)
const filteredCount = computed(() => store.filteredThemes.value.length)
const usableCount = computed(() =>
  store.filteredThemes.value.filter((t) => t.status === '可使用' || t.status === '需补充').length
)
</script>

<template>
  <div class="preview-container">
    <div class="preview-header">
      <div class="header-left">
        <h2>🎁 活动包预览</h2>
        <span class="header-sub">共 {{ packages.length }} 组 · {{ usableCount }} 个可用主题 · {{ filteredCount }} 个筛选结果</span>
      </div>
      <div class="header-right">
        <label class="group-setting">
          分组数量：
          <input
            type="number"
            :value="store.groupCount.value"
            @input="(e) => store.groupCount.value = parseInt((e.target as HTMLInputElement).value) || 1"
            min="1"
            max="20"
            class="group-input"
          />
        </label>
        <button class="btn-close" @click="store.isPreviewMode.value = false">退出预览</button>
      </div>
    </div>

    <div class="packages-grid">
      <div v-for="pkg in packages" :key="pkg.groupName" class="package-card">
        <div class="package-header">
          <h3>{{ pkg.groupName }}</h3>
          <span class="sticker-count">共 {{ pkg.totalStickers }} 张贴纸</span>
        </div>

        <div v-if="pkg.gaps.length > 0" class="gaps-section">
          <div class="gaps-title">⚠️ 缺口提醒</div>
          <ul class="gaps-list">
            <li v-for="(gap, idx) in pkg.gaps" :key="idx">{{ gap }}</li>
          </ul>
        </div>

        <div class="themes-list">
          <div v-for="theme in pkg.themes" :key="theme.id" class="theme-item">
            <div class="theme-color" :style="{ background: colorMap[theme.colorScheme] }"></div>
            <div class="theme-info">
              <div class="theme-name-row">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="status-tag" :style="{ background: statusColorMap[theme.status] }">{{ theme.status }}</span>
              </div>
              <div class="theme-meta">
                <span>{{ theme.colorScheme }}</span>
                <span>·</span>
                <span>{{ theme.stickerCount }}张</span>
                <span>·</span>
                <span>{{ theme.suitablePages.join('、') }}</span>
              </div>
              <div v-if="theme.example" class="theme-example">{{ theme.example }}</div>
            </div>
          </div>
          <div v-if="pkg.themes.length === 0" class="empty-pkg">
            该组暂无分配主题
          </div>
        </div>
      </div>
    </div>

    <div class="preview-tips">
      <strong>💡 使用说明：</strong>
      活动包预览基于当前筛选结果，将状态为「可使用」或「需补充」的主题平均分配到各组。「仅展示」和「暂缓」状态的主题不参与分发。调整分组数量后会自动重新分配。
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #fce7f3;
}

.header-left h2 {
  margin: 0 0 4px 0;
  font-size: 22px;
  color: #1f2937;
}

.header-sub {
  font-size: 13px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.group-setting {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.group-input {
  width: 60px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.group-input:focus {
  outline: none;
  border-color: #ec4899;
}

.btn-close {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #ec4899;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #db2777;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.package-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  border: 1px solid #f3f4f6;
}

.package-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.package-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.sticker-count {
  font-size: 12px;
  color: #ec4899;
  background: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.gaps-section {
  margin: 12px 16px;
  padding: 12px;
  background: #fef3c7;
  border-radius: 10px;
  border-left: 3px solid #f59e0b;
}

.gaps-title {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 6px;
}

.gaps-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #78350f;
}

.gaps-list li {
  margin-bottom: 2px;
}

.themes-list {
  padding: 8px 16px 16px;
}

.theme-item {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.theme-item:last-child {
  border-bottom: none;
}

.theme-color {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.theme-info {
  flex: 1;
  min-width: 0;
}

.theme-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.theme-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.status-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  color: #fff;
}

.theme-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.theme-example {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
  font-style: italic;
}

.empty-pkg {
  padding: 32px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.preview-tips {
  margin-top: 24px;
  padding: 16px;
  background: #eff6ff;
  border-radius: 12px;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.6;
}
</style>
