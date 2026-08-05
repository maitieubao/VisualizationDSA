<template>
  <div class="bucket-root">
    <BucketBanner :frame="frame" />
    <div class="bucket-legend">
      <span><i class="legend-dot legend-dot--source"></i>Phần tử nguồn</span>
      <span><i class="legend-dot legend-dot--active"></i>Bucket đang hoạt động</span>
      <span><i class="legend-dot legend-dot--output"></i>Đã thu gom</span>
    </div>
    <div class="bucket-flow">
      <BucketArray :frame="frame" />
      <BucketConnector :frame="frame" />
      <BucketGrid :frame="frame" />
      <BucketConnector :frame="frame" />
      <BucketOutput :frame="frame" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortFrame } from '../types/sorting.types';
import BucketArray from './bucket-sort/BucketArray.vue';
import BucketBanner from './bucket-sort/BucketBanner.vue';
import BucketConnector from './bucket-sort/BucketConnector.vue';
import BucketGrid from './bucket-sort/BucketGrid.vue';
import BucketOutput from './bucket-sort/BucketOutput.vue';

defineProps<{ frame: SortFrame | null }>();
</script>

<style scoped>
.bucket-root { display: flex; width: 100%; height: 100%; min-height: 0; flex-direction: column; gap: 8px; padding: 10px 14px 12px; overflow-y: auto; box-sizing: border-box; background: var(--color-bg-primary); }
.bucket-legend { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 12px; color: var(--color-text-muted); font: 10px var(--font-mono); }
.bucket-legend span { display: inline-flex; align-items: center; gap: 5px; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
.legend-dot--source { background: var(--color-accent-primary); box-shadow: 0 0 7px var(--color-accent-primary-glow); }
.legend-dot--active { background: var(--color-accent-yellow); box-shadow: 0 0 7px var(--color-accent-yellow-glow); }
.legend-dot--output { background: var(--color-accent-green); box-shadow: 0 0 7px var(--color-accent-green-glow); }
.bucket-flow { display: flex; min-height: 0; flex-direction: column; gap: 2px; }
@media (max-width: 560px) { .bucket-root { padding: 8px; } .bucket-legend { justify-content: flex-start; } }
</style>
