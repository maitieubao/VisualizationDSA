<template>
  <div class="r-buckets">
    <div class="r-buckets-grid" :style="{ gridTemplateColumns: `repeat(${10},1fr)` }">
      <div v-for="d in 10" :key="d" class="r-bucket-col">
        <div class="r-bucket-hdr" :class="isBucketActive(d - 1) ? 'r-bucket-hdr--active' : ''">
          <span class="r-bucket-lbl">{{ d - 1 }}</span>
          <span class="r-bucket-count">{{ bucketItems(d - 1).length }}</span>
        </div>
        <div class="r-bucket-body">
          <div
            v-for="(item, i) in bucketItems(d - 1)"
            :key="item.id"
            class="r-bitem"
            :class="bucketItemClass(d - 1, item)"
          >
            {{ item.value }}
          </div>
          <div v-if="bucketItems(d - 1).length === 0" class="r-bitem r-bitem--empty">—</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRadixSortVisualizer } from '../../composables/useRadixSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  bucketItems,
  isBucketActive,
  bucketItemClass
} = useRadixSortVisualizer(() => props.frame);
</script>

<style scoped>
.r-buckets {
  flex-shrink: 0;
  width: 100%;
  margin-top: 10px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 10px 12px;
}
.r-buckets-grid {
  display: grid;
  gap: 4px;
  width: 100%;
}
.r-bucket-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.r-bucket-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-subtle);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: all .3s;
}
.r-bucket-hdr--active {
  background: var(--color-accent-cyan-dim);
  border-color: var(--color-accent-cyan);
  color: var(--color-accent-cyan);
  box-shadow: 0 0 8px var(--color-accent-cyan-glow);
}
.r-bucket-lbl { opacity: .7; }
.r-bucket-count { font-size: 10px; opacity: .6; }

.r-bucket-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 20px;
}
.r-bitem {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  text-align: center;
  transition: all .35s cubic-bezier(.25,.8,.25,1);
  border: 1px solid transparent;
}
.r-bitem--idle {
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  border-color: var(--color-border-subtle);
}
.r-bitem--active {
  background: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
  border-color: rgba(61, 153, 112, 0.3);
}
.r-bitem--coll {
  background: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 0 8px var(--color-accent-green-glow);
  animation: collectPop .4s ease;
}
.r-bitem--empty {
  background: transparent;
  border: 1px dashed var(--color-border-subtle);
  color: var(--color-text-muted);
  opacity: .4;
}

@keyframes collectPop {
  0%   { transform: scale(.85); opacity: .5; }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
</style>