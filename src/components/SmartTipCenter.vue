<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, ChevronDown, ChevronUp, Sparkles } from 'lucide-vue-next'
import { usePlannerStore } from '@/store/planner'
import { detectSmartTips, SMART_TIP_LABEL } from '@/composables/useSmartTips'

const store = usePlannerStore()
const tips = computed(() => detectSmartTips(store.themes))
const open = ref(true)

const emit = defineEmits<{ (e: 'focus', ids: string[]): void }>()

function levelColor(level: 'info' | 'warning') {
  return level === 'warning' ? 'var(--orange)' : 'var(--mist)'
}
</script>

<template>
  <section v-if="tips.length" class="smart-tips no-print">
    <button class="tips-head" @click="open = !open">
      <span class="head-left">
        <Sparkles :size="14" />
        <span class="head-title">智能提示中心</span>
        <span class="count">{{ tips.length }}</span>
      </span>
      <component :is="open ? ChevronUp : ChevronDown" :size="16" />
    </button>
    <transition name="fade">
      <div v-show="open" class="tips-body">
        <article
          v-for="t in tips"
          :key="t.id"
          class="tip"
          :style="{ '--c': levelColor(t.level) }"
        >
          <header class="tip__head">
            <AlertTriangle :size="13" />
            <span class="tip__type">{{ SMART_TIP_LABEL[t.type] }}</span>
            <span class="tip__count">涉及 {{ t.themeIds.length }} 条</span>
          </header>
          <p class="tip__msg">{{ t.message }}</p>
          <button class="btn btn--sm btn--ghost" @click="emit('focus', t.themeIds)">
            定位
          </button>
        </article>
      </div>
    </transition>
  </section>
</template>

<style scoped>
.smart-tips {
  margin: 0 32px 16px;
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-md);
  background: rgba(255, 253, 247, 0.7);
}
.tips-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line-soft);
  font-size: 13px;
}
.tips-head:last-child { border-bottom: 0; }
.head-left { display: inline-flex; align-items: center; gap: 8px; }
.head-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
}
.count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  padding: 0 6px;
  height: 18px;
  background: var(--ink);
  color: var(--paper);
  border-radius: 999px;
  font-size: 11px;
}

.tips-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0;
}
.tip {
  padding: 12px 16px 14px;
  border-right: 1px solid var(--line-soft);
  border-bottom: 1px solid var(--line-soft);
  border-left: 3px solid var(--c);
  background: var(--paper);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tip__head {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--c);
  font-size: 12px;
  font-weight: 600;
}
.tip__type { letter-spacing: 0.04em; }
.tip__count { margin-left: auto; color: var(--ink-mute); font-weight: 400; }
.tip__msg {
  margin: 0;
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.5;
}
.tip .btn { align-self: flex-start; }

@media (max-width: 600px) {
  .smart-tips { margin: 0 20px 16px; }
}
</style>
