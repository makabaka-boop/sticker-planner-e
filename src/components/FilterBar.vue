<script setup lang="ts">
import { computed } from 'vue'
import { Search, X, LayoutGrid, Package } from 'lucide-vue-next'
import { usePlannerStore } from '@/store/planner'
import { STATUS_LABEL, STATUS_ORDER } from '@/types'
import type { ThemeStatus } from '@/types'
import ColorDot from './ColorDot.vue'

const store = usePlannerStore()
const filter = computed(() => store.filter)
const filteredCount = computed(() => store.filteredThemes.length)
const totalCount = computed(() => store.themes.length)
const viewMode = computed(() => store.settings.viewMode)

function toggleArr<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

function toggleColor(c: string) {
  store.setFilter({ colorFamilies: toggleArr(filter.value.colorFamilies, c) })
}
function togglePageType(p: string) {
  store.setFilter({ pageTypes: toggleArr(filter.value.pageTypes, p) })
}
function toggleDifficulty(d: number) {
  store.setFilter({ difficulties: toggleArr(filter.value.difficulties, d) })
}
function toggleStatus(s: ThemeStatus) {
  store.setFilter({ statuses: toggleArr(filter.value.statuses, s) })
}
function toggleOwner(o: string) {
  store.setFilter({ owners: toggleArr(filter.value.owners, o) })
}
function onKeyword(e: Event) {
  store.setFilter({ keyword: (e.target as HTMLInputElement).value })
}
function clear() { store.clearFilter() }

const hasActiveFilter = computed(() => {
  const f = filter.value
  return f.colorFamilies.length || f.pageTypes.length || f.difficulties.length ||
    f.statuses.length || f.owners.length || f.keyword.length > 0
})
</script>

<template>
  <section class="filter-bar tape-stripe no-print">
    <div class="filter-bar__top">
      <div class="search">
        <Search :size="14" />
        <input
          type="text"
          placeholder="搜索主题名 / 备注 / 责任人..."
          :value="filter.keyword"
          @input="onKeyword"
        />
      </div>
      <div class="view-switch">
        <button
          class="switch-btn"
          :class="{ active: viewMode === 'organize' }"
          @click="store.setViewMode('organize')"
        >
          <LayoutGrid :size="14" />整理视图
        </button>
        <button
          class="switch-btn"
          :class="{ active: viewMode === 'packagePreview' }"
          @click="store.setViewMode('packagePreview')"
        >
          <Package :size="14" />活动包预览
        </button>
      </div>
    </div>

    <div class="filter-groups">
      <div class="filter-group">
        <span class="label">色系</span>
        <div class="chips">
          <button
            v-for="c in store.settings.colorFamilies"
            :key="c"
            class="chip"
            :class="{ 'chip--active': filter.colorFamilies.includes(c) }"
            @click="toggleColor(c)"
          >
            <ColorDot :name="c" :size="10" />{{ c }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <span class="label">页型</span>
        <div class="chips">
          <button
            v-for="p in store.settings.pageTypes"
            :key="p"
            class="chip"
            :class="{ 'chip--active': filter.pageTypes.includes(p) }"
            @click="togglePageType(p)"
          >{{ p }}</button>
        </div>
      </div>

      <div class="filter-group">
        <span class="label">难度</span>
        <div class="chips">
          <button
            v-for="d in [1, 2, 3, 4, 5]"
            :key="d"
            class="chip"
            :class="{ 'chip--active': filter.difficulties.includes(d) }"
            @click="toggleDifficulty(d)"
          >{{ '★'.repeat(d) }}</button>
        </div>
      </div>

      <div class="filter-group">
        <span class="label">状态</span>
        <div class="chips">
          <button
            v-for="s in STATUS_ORDER"
            :key="s"
            class="chip"
            :class="{ 'chip--active': filter.statuses.includes(s) }"
            @click="toggleStatus(s)"
          >{{ STATUS_LABEL[s] }}</button>
        </div>
      </div>

      <div class="filter-group">
        <span class="label">责任人</span>
        <div class="chips">
          <button
            v-for="o in store.settings.owners"
            :key="o"
            class="chip"
            :class="{ 'chip--active': filter.owners.includes(o) }"
            @click="toggleOwner(o)"
          >{{ o }}</button>
        </div>
      </div>
    </div>

    <div class="filter-bar__foot">
      <span class="hit">命中 {{ filteredCount }} / 共 {{ totalCount }} 条</span>
      <button v-if="hasActiveFilter" class="btn btn--sm btn--ghost" @click="clear">
        <X :size="13" />清空筛选
      </button>
    </div>
  </section>
</template>

<style scoped>
.filter-bar {
  padding: 22px 32px 16px;
  border-bottom: 1px solid var(--line-soft);
  background: var(--paper);
}
.filter-bar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--line);
  padding: 6px 0;
  width: 320px;
  max-width: 50%;
}
.search input {
  border: 0;
  padding: 0;
  font-size: 14px;
  background: transparent;
}
.search input:focus { outline: none; }

.view-switch {
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.switch-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border: 0;
  border-right: 1px solid var(--line);
  font-size: 12px;
  color: var(--ink-soft);
  transition: all 0.15s ease;
}
.switch-btn:last-child { border-right: 0; }
.switch-btn:hover { background: var(--paper-deep); color: var(--ink); }
.switch-btn.active { background: var(--ink); color: var(--paper); }

.filter-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px 24px;
}
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }

.filter-bar__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
  color: var(--ink-mute);
}

@media (max-width: 600px) {
  .filter-bar { padding: 18px 20px; }
  .filter-bar__top { flex-direction: column; align-items: stretch; }
  .search { width: 100%; max-width: none; }
  .view-switch { width: 100%; }
  .switch-btn { flex: 1; justify-content: center; }
}
</style>
