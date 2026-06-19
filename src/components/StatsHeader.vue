<script setup lang="ts">
import { computed } from 'vue'
import { Download, Upload, RotateCcw } from 'lucide-vue-next'
import { usePlannerStore } from '@/store/planner'
import { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER } from '@/types'

const store = usePlannerStore()

const stats = computed(() => store.stats)

const lastSavedText = computed(() => {
  const d = new Date(store.lastSavedAt)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

function handleExport() {
  const data = store.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sticker-planner-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json,application/json'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const ok = store.importData(String(reader.result))
      if (!ok) alert('导入失败：JSON 格式不正确')
    }
    reader.readAsText(file)
  }
  input.click()
}

function handleReset() {
  if (confirm('确认恢复为示例数据？当前数据将被替换')) {
    store.resetToSeed()
  }
}
</script>

<template>
  <header class="stats-header">
    <div class="head-row">
      <div class="brand">
        <div class="brand__mark">
          <span class="dot dot--orange" />
          <span class="dot dot--moss" />
          <span class="dot dot--mist" />
          <span class="dot dot--sakura" />
        </div>
        <div>
          <h1 class="brand__title">Sticker Atelier</h1>
          <p class="brand__sub">手账贴纸主题整理 · 活动包预览</p>
        </div>
      </div>
      <div class="head-actions no-print">
        <span class="saved">本地已保存 · {{ lastSavedText }}</span>
        <button class="btn btn--sm" @click="handleImport"><Upload :size="14" />导入</button>
        <button class="btn btn--sm" @click="handleExport"><Download :size="14" />导出</button>
        <button class="btn btn--sm btn--ghost" @click="handleReset"><RotateCcw :size="14" />示例</button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat">
        <div class="label">主题总数</div>
        <div class="stat__num">{{ stats.total }}</div>
      </div>
      <div class="stat">
        <div class="label">贴纸总量</div>
        <div class="stat__num">{{ stats.totalStickers }}</div>
      </div>
      <div class="stat">
        <div class="label">平均预计用时</div>
        <div class="stat__num">{{ stats.avgMinutes }}<span class="unit">min</span></div>
      </div>
      <div class="stat stat--bars">
        <div class="label">状态分布</div>
        <div class="bars">
          <div
            v-for="s in STATUS_ORDER"
            :key="s"
            class="bar"
            :style="{
              flex: stats.statusCount[s] || 0.05,
              background: STATUS_COLOR[s],
            }"
            :title="`${STATUS_LABEL[s]}：${stats.statusCount[s]}`"
          />
        </div>
        <div class="legend">
          <span v-for="s in STATUS_ORDER" :key="s">
            <i class="legend-dot" :style="{ background: STATUS_COLOR[s] }" />
            {{ STATUS_LABEL[s] }} {{ stats.statusCount[s] }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.stats-header {
  position: relative;
  padding: 28px 32px 22px;
  border-bottom: 1px solid var(--line);
  background: var(--paper);
}
.head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}
.brand__mark {
  display: flex;
  gap: 4px;
  padding-top: 6px;
}
.brand__mark .dot {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
}
.dot--orange { background: var(--orange); }
.dot--moss { background: var(--moss); }
.dot--mist { background: var(--mist); }
.dot--sakura { background: var(--sakura); }
.brand__title {
  font-family: var(--font-display);
  font-size: 32px;
  font-style: italic;
  font-weight: 500;
  letter-spacing: -0.02em;
}
.brand__sub {
  margin: 4px 0 0;
  color: var(--ink-mute);
  font-size: 12px;
  letter-spacing: 0.05em;
}
.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.saved {
  font-size: 11px;
  color: var(--ink-mute);
  letter-spacing: 0.06em;
  margin-right: 6px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 200px)) 1fr;
  gap: 32px;
  align-items: end;
}
.stat .label { display: block; margin-bottom: 6px; }
.stat__num {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
}
.unit { font-size: 14px; margin-left: 4px; color: var(--ink-mute); font-family: var(--font-body); }

.stat--bars { display: flex; flex-direction: column; gap: 8px; }
.bars {
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--line-soft);
}
.bar { transition: flex 0.25s ease; }
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: var(--ink-soft);
}
.legend span { display: inline-flex; align-items: center; gap: 4px; }
.legend-dot {
  width: 6px; height: 6px; border-radius: 50%;
  display: inline-block;
}

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .stat--bars { grid-column: span 2; }
}
@media (max-width: 600px) {
  .stats-header { padding: 20px; }
  .head-row { flex-direction: column; }
  .stat__num { font-size: 28px; }
}
</style>
