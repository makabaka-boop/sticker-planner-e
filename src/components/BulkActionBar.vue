<script setup lang="ts">
import { computed, ref } from 'vue'
import { Copy, Trash2, Tag, X } from 'lucide-vue-next'
import { usePlannerStore } from '@/store/planner'
import { STATUS_LABEL, STATUS_ORDER } from '@/types'
import type { ThemeStatus } from '@/types'

const store = usePlannerStore()
const ids = computed(() => Array.from(store.selectedIds))
const showStatusMenu = ref(false)

function bulkStatus(s: ThemeStatus) {
  store.bulkUpdateStatus(ids.value, s)
  showStatusMenu.value = false
}
function bulkDup() {
  store.bulkDuplicate(ids.value)
  store.clearSelection()
}
function bulkDel() {
  if (confirm(`确认删除选中的 ${ids.value.length} 条主题？`)) {
    store.bulkRemove(ids.value)
  }
}
</script>

<template>
  <transition name="bulk">
    <div v-if="ids.length" class="bulk-bar no-print">
      <div class="bulk-bar__inner">
        <div class="bulk-info">
          <span class="num">{{ ids.length }}</span>
          <span>条已选中</span>
        </div>
        <div class="bulk-actions">
          <div class="status-menu">
            <button class="btn btn--sm" @click="showStatusMenu = !showStatusMenu">
              <Tag :size="13" />批量改状态
            </button>
            <transition name="fade">
              <div v-if="showStatusMenu" class="menu">
                <button
                  v-for="s in STATUS_ORDER"
                  :key="s"
                  class="menu-item"
                  @click="bulkStatus(s)"
                >{{ STATUS_LABEL[s] }}</button>
              </div>
            </transition>
          </div>
          <button class="btn btn--sm" @click="bulkDup">
            <Copy :size="13" />批量复制
          </button>
          <button class="btn btn--sm btn--danger" @click="bulkDel">
            <Trash2 :size="13" />批量删除
          </button>
          <button class="btn btn--sm btn--ghost" @click="store.clearSelection()">
            <X :size="13" />取消选择
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.bulk-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: var(--ink);
  color: var(--paper);
  border-radius: var(--radius-md);
  padding: 10px 16px;
  box-shadow: 0 12px 30px rgba(31, 27, 22, 0.25);
  max-width: calc(100% - 40px);
}
.bulk-bar__inner {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bulk-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  letter-spacing: 0.04em;
  border-right: 1px solid rgba(255,255,255,0.18);
  padding-right: 14px;
}
.num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
}
.bulk-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.bulk-actions :deep(.btn) {
  border-color: rgba(255,255,255,0.28);
  color: var(--paper);
}
.bulk-actions :deep(.btn:hover) { background: var(--paper); color: var(--ink); }
.bulk-actions :deep(.btn--ghost) { border-color: transparent; }
.bulk-actions :deep(.btn--danger:hover) { background: var(--orange); border-color: var(--orange); }

.status-menu { position: relative; }
.menu {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  background: var(--paper);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  min-width: 140px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.menu-item {
  padding: 8px 12px;
  background: transparent;
  border: 0;
  text-align: left;
  font-size: 13px;
  color: var(--ink);
  border-bottom: 1px solid var(--line-soft);
}
.menu-item:last-child { border-bottom: 0; }
.menu-item:hover { background: var(--paper-deep); }

.bulk-enter-active, .bulk-leave-active { transition: all 0.22s ease; }
.bulk-enter-from, .bulk-leave-to {
  transform: translate(-50%, 60px);
  opacity: 0;
}
</style>
