<script setup lang="ts">
import { computed } from 'vue'
import { Printer, Package, AlertCircle } from 'lucide-vue-next'
import { usePlannerStore } from '@/store/planner'
import { COLOR_HEX, STATUS_LABEL } from '@/types'
import type { StickerTheme } from '@/types'

const store = usePlannerStore()

interface Group {
  owner: string
  themes: StickerTheme[]
  totalStickers: number
  shortageCount: number
  missingNoteCount: number
}

const groups = computed<Group[]>(() => {
  const map = new Map<string, StickerTheme[]>()
  store.filteredThemes.forEach((t) => {
    if (!map.has(t.owner)) map.set(t.owner, [])
    map.get(t.owner)!.push(t)
  })
  const list: Group[] = []
  map.forEach((themes, owner) => {
    list.push({
      owner,
      themes,
      totalStickers: themes.reduce((s, t) => s + t.stickerCount, 0),
      shortageCount: themes.filter((t) => t.stickerCount < 10 || t.status === 'shortage').length,
      missingNoteCount: themes.filter((t) => !t.note.trim()).length,
    })
  })
  return list.sort((a, b) => a.owner.localeCompare(b.owner, 'zh-Hans-CN'))
})

const totalGroups = computed(() => groups.value.length)
const totalThemes = computed(() => store.filteredThemes.length)
const totalStickers = computed(() => groups.value.reduce((s, g) => s + g.totalStickers, 0))

function isShort(t: StickerTheme) {
  return t.stickerCount < 10 || t.status === 'shortage'
}

function handlePrint() {
  window.print()
}
</script>

<template>
  <section class="package-preview">
    <header class="preview-head no-print">
      <div>
        <h2 class="preview-title">活动包预览</h2>
        <p class="preview-sub">基于当前筛选结果，按责任人分组生成贴纸包清单</p>
      </div>
      <div class="preview-summary">
        <div class="sum-item">
          <span class="label">小组</span>
          <span class="num">{{ totalGroups }}</span>
        </div>
        <div class="sum-item">
          <span class="label">主题</span>
          <span class="num">{{ totalThemes }}</span>
        </div>
        <div class="sum-item">
          <span class="label">贴纸</span>
          <span class="num">{{ totalStickers }}</span>
        </div>
        <button class="btn btn--primary btn--sm" @click="handlePrint">
          <Printer :size="14" />打印 / 导出 PDF
        </button>
      </div>
    </header>

    <div v-if="!groups.length" class="empty">
      当前筛选条件下没有可分发的主题。请调整筛选或在整理视图中新增内容。
    </div>

    <div v-else class="groups">
      <article v-for="g in groups" :key="g.owner" class="group">
        <header class="group-head">
          <div class="group-title">
            <Package :size="16" />
            <h3>{{ g.owner }}的贴纸包</h3>
          </div>
          <div class="group-stats">
            <span><b>{{ g.themes.length }}</b> 主题</span>
            <span><b>{{ g.totalStickers }}</b> 贴纸</span>
            <span v-if="g.shortageCount" class="warn">
              <AlertCircle :size="13" />{{ g.shortageCount }} 缺口
            </span>
          </div>
        </header>

        <table class="pkg-table">
          <thead>
            <tr>
              <th class="col-name">主题</th>
              <th class="col-color">色系</th>
              <th class="col-num">贴纸</th>
              <th class="col-page">页型</th>
              <th class="col-status">状态</th>
              <th class="col-note">备注 / 缺口</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in g.themes"
              :key="t.id"
              :class="{ 'row-short': isShort(t) }"
            >
              <td class="col-name">
                <span class="strip" :style="{ background: COLOR_HEX[t.colorFamily] || '#8B8175' }" />
                {{ t.name }}
              </td>
              <td class="col-color">{{ t.colorFamily }}</td>
              <td class="col-num">
                {{ t.stickerCount }}
                <span v-if="isShort(t)" class="badge-warn">缺</span>
              </td>
              <td class="col-page">{{ t.pageTypes.join('、') || '—' }}</td>
              <td class="col-status">{{ STATUS_LABEL[t.status] }}</td>
              <td class="col-note">
                <span v-if="t.note">{{ t.note }}</span>
                <span v-else class="missing-note">⚠ 备注缺失</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" class="foot-cell">合计</td>
              <td class="col-num"><b>{{ g.totalStickers }}</b></td>
              <td colspan="3" class="foot-meta">
                <span v-if="g.missingNoteCount">备注缺失 {{ g.missingNoteCount }} 条</span>
                <span v-else class="ok">✓ 全部备注齐全</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </article>
    </div>
  </section>
</template>

<style scoped>
.package-preview {
  padding: 28px 32px 80px;
}
.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 22px;
}
.preview-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  font-style: italic;
}
.preview-sub { margin: 4px 0 0; color: var(--ink-mute); font-size: 12px; }
.preview-summary { display: flex; align-items: flex-end; gap: 18px; }
.sum-item { display: flex; flex-direction: column; gap: 2px; align-items: flex-start; }
.sum-item .num {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
}

.empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--ink-mute);
  border: 1px dashed var(--line-soft);
  border-radius: var(--radius-md);
}

.groups {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.group {
  background: #FFFDF7;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 18px 22px 14px;
}
.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line-soft);
  margin-bottom: 10px;
}
.group-title { display: flex; align-items: center; gap: 8px; }
.group-title h3 {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
}
.group-stats { display: flex; gap: 14px; font-size: 12px; color: var(--ink-soft); }
.group-stats b { font-family: var(--font-display); font-size: 16px; }
.warn { color: var(--orange); display: inline-flex; align-items: center; gap: 4px; }

.pkg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.pkg-table th, .pkg-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px dashed var(--line-soft);
}
.pkg-table th {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-mute);
}
.col-num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.row-short {
  background: rgba(217, 83, 44, 0.07);
}
.row-short td { border-bottom-color: rgba(217, 83, 44, 0.2); }
.strip {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.badge-warn {
  display: inline-block;
  padding: 1px 6px;
  background: var(--orange);
  color: var(--paper);
  border-radius: 2px;
  font-size: 10px;
  margin-left: 4px;
}
.missing-note { color: var(--orange); }

.foot-cell {
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 11px;
  color: var(--ink-mute);
}
.foot-meta { font-size: 12px; color: var(--ink-soft); }
.ok { color: var(--moss); }

@media print {
  .package-preview { padding: 16px; }
  .group { page-break-inside: avoid; box-shadow: none; }
}
@media (max-width: 600px) {
  .package-preview { padding: 20px; }
  .preview-head { flex-direction: column; }
  .preview-summary { width: 100%; flex-wrap: wrap; }
  .pkg-table { font-size: 12px; }
}
</style>
