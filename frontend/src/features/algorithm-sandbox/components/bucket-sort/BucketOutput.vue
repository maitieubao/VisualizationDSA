<template>
  <section class="bucket-section">
    <div class="bucket-heading"><span>03 / OUTPUT ARRAY</span><small>Thu gom theo thứ tự Bucket 0 <BaseIcon name="arrow-right" class="inline-arr" /> 3</small></div>
    <div class="bucket-output" :style="{ gridTemplateColumns: `repeat(${Math.max(outputItems.length, 1)}, minmax(0, 1fr))` }">
      <div v-for="(item, index) in outputItems" :key="index" class="output-item">
        <div v-if="item" class="output-value" :class="{ 'output-value--active': isOutputActive(index) }" :style="outputStyle(item, index)"><span>{{ item.value }}</span><small>#{{ item.id }}</small></div>
        <div v-else class="output-placeholder">·</div>
        <span class="bucket-index">O[{{ index }}]</span>
      </div>
      <div v-if="outputItems.length === 0" class="bucket-empty">Output sẽ xuất hiện ở pha 03</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useBucketSortVisualizer, type BucketItem } from '../../composables/useBucketSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';
const props = defineProps<{ frame: SortFrame | null }>();
const { outputItems, stableColor, isOutputActive } = useBucketSortVisualizer(() => props.frame);
function outputStyle(item: BucketItem, index: number) { const c = stableColor(item.id); return { borderColor: c.border, background: c.background, color: c.text, boxShadow: isOutputActive(index) ? `0 0 16px ${c.glow}` : `0 0 8px ${c.glow}` }; }
</script>

<style scoped>
.bucket-section { min-width: 0; padding: 11px 12px 12px; background: var(--color-bg-secondary); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); }
.bucket-heading { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 9px; color: var(--color-text-secondary); font: 700 10px var(--font-mono); letter-spacing: .08em; }
.bucket-heading small { color: var(--color-text-muted); font: 400 10px var(--font-mono); letter-spacing: 0; }
.bucket-output { display: grid; align-items: end; gap: clamp(4px, 1vw, 10px); min-height: 86px; }
.output-item { display: flex; min-width: 0; flex-direction: column; align-items: center; }
.output-value, .output-placeholder { display: flex; width: 100%; max-width: 70px; min-height: 40px; align-items: center; justify-content: center; border: 1px solid; border-radius: var(--radius-md); font: 800 clamp(11px, 1.8vw, 14px) var(--font-mono); transition: .3s ease; }
.output-value { flex-direction: column; }
.output-value small { margin-top: 3px; opacity: .55; font-size: 9px; }
.output-value--active { transform: translateY(-4px) scale(1.05); }
.output-placeholder { border-color: var(--color-border-subtle); border-style: dashed; color: var(--color-text-muted); opacity: .45; }
.bucket-index { margin-top: 5px; color: var(--color-text-muted); font: 10px var(--font-mono); }
.bucket-empty { grid-column: 1 / -1; align-self: center; color: var(--color-text-muted); text-align: center; font: 12px var(--font-mono); }
</style>
