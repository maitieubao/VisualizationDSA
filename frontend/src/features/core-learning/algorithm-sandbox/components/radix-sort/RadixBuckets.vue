<template>
  <div class="r-buckets">
    <div
      v-for="d in 10"
      :key="d"
      class="r-bucket"
      :class="isBucketActive(d-1) ? 'r-bucket--active' : ''"
    >
      <!-- Active indicator arrow above bucket label -->
      <div class="r-barrow" :class="isBucketActive(d-1) ? 'r-barrow--on' : ''">▼</div>
      <span class="r-blbl" :class="isBucketActive(d-1) ? 'r-blbl--on' : ''">[{{ d-1 }}]</span>
      <div class="r-bitems">
        <div
          v-for="item in bucketItems(d-1)"
          :key="item.id"
          class="r-bitem"
          :class="bucketItemClass(d-1, item)"
        >{{ item.value }}</div>
        <div v-if="bucketItems(d-1).length === 0" class="r-bghost"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRadixSortVisualizer } from '@/features/core-learning/algorithm-sandbox/composables/useRadixSortVisualizer';
import type { SortFrame } from '@/features/core-learning/algorithm-sandbox/types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  isBucketActive,
  bucketItems,
  bucketItemClass
} = useRadixSortVisualizer(() => props.frame);
</script>

<style scoped>
.r-buckets {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  width: 100%;
  align-items: flex-start;
  margin-bottom: 8px;
}
.r-bucket {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: color-mix(in srgb, var(--color-bg-terminal) 40%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: 11px;
  padding: 5px 3px 4px;
  min-height: 72px;
  transition: all .3s ease;
  backdrop-filter: blur(5px);
}
.r-bucket--active {
  border-color: var(--color-accent-yellow);
  background: var(--color-accent-yellow-dim);
  box-shadow: 0 0 14px var(--color-accent-yellow-glow), inset 0 0 8px rgba(245,158,11,.04);
  transform: scaleY(1.02);
}

.r-barrow       { font-size: 11px; color: transparent; line-height: 1; transition: color .2s; }
.r-barrow--on   { color: var(--color-accent-yellow); filter: drop-shadow(0 0 4px var(--color-accent-yellow-glow)); animation: bounce-arr .6s ease-in-out infinite alternate; }
@keyframes bounce-arr { from { transform: translateY(0); } to { transform: translateY(-2px); } }

.r-blbl         { font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--color-text-muted); flex-shrink: 0; }
.r-blbl--on     { color: var(--color-accent-yellow); }

.r-bitems {
  display: flex; flex-direction: column-reverse; gap: 2px;
  width: 100%; align-items: center; overflow: hidden;
  flex: 1;
}
.r-bitem {
  width: 100%; text-align: center; padding: 2px 0;
  border-radius: 4px; border: 1px solid;
  font-family: var(--font-mono); font-weight: 700; font-size: 11.5px;
  transition: all .3s ease;
}
.r-bitem--idle   { border-color: color-mix(in srgb, var(--color-accent-cyan) 18%, transparent); background: var(--color-accent-cyan-dim); color: color-mix(in srgb, var(--color-accent-cyan) 55%, transparent); opacity: .6; }
.r-bitem--active { border-color: color-mix(in srgb, var(--color-accent-yellow) 50%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent-yellow-glow) 60%, transparent), var(--color-accent-yellow-dim)); color: var(--color-accent-yellow-light); }
.r-bitem--coll   {
  border-color: var(--color-accent-green); background: linear-gradient(135deg, color-mix(in srgb, var(--color-accent-green-glow) 70%, transparent), var(--color-accent-green-dim)); color: var(--color-accent-green-light);
  box-shadow: 0 0 8px var(--color-accent-green-glow);
  animation: pulse-c .7s ease-in-out infinite alternate;
}
@keyframes pulse-c { from { box-shadow: 0 0 4px rgba(16,185,129,.2); } to { box-shadow: 0 0 12px var(--color-accent-green-glow); } }
.r-bghost { height: 16px; width: 100%; }
</style>
