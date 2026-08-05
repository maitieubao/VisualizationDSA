<template>
  <div class="counting-root">
    <CountingBanner :frame="frame" />
    <div class="counting-legend">
      <span><i class="legend-dot legend-dot--source"></i>Phần tử nguồn</span>
      <span><i class="legend-dot legend-dot--count"></i>Đang đếm</span>
      <span><i class="legend-dot legend-dot--output"></i>Đã đặt ổn định</span>
    </div>
    <div class="counting-flow">
      <CountingArray :frame="frame" />
      <CountingConnector :frame="frame" />
      <CountingGrid :frame="frame" />
      <CountingConnector :frame="frame" />
      <CountingOutput :frame="frame" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortFrame } from '../types/sorting.types';
import CountingArray from './counting-sort/CountingArray.vue';
import CountingBanner from './counting-sort/CountingBanner.vue';
import CountingConnector from './counting-sort/CountingConnector.vue';
import CountingGrid from './counting-sort/CountingGrid.vue';
import CountingOutput from './counting-sort/CountingOutput.vue';

defineProps<{ frame: SortFrame | null }>();
</script>

<style scoped>
.counting-root { display: flex; width: 100%; height: 100%; min-height: 0; flex-direction: column; gap: 8px; padding: 10px 14px 12px; overflow-y: auto; box-sizing: border-box; background: var(--color-bg-primary); }
.counting-legend { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 12px; color: var(--color-text-muted); font: 10px var(--font-mono); }
.counting-legend span { display: inline-flex; align-items: center; gap: 5px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot--source { background: var(--color-accent-primary); box-shadow: 0 0 7px var(--color-accent-primary-glow); }
.legend-dot--count { background: var(--color-accent-yellow); box-shadow: 0 0 7px var(--color-accent-yellow-glow); }
.legend-dot--output { background: var(--color-accent-green); box-shadow: 0 0 7px var(--color-accent-green-glow); }
.counting-flow { display: flex; min-height: 0; flex-direction: column; gap: 2px; }
@media (max-width: 560px) { .counting-root { padding: 8px; } .counting-legend { justify-content: flex-start; } }
</style>
