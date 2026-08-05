<template>
  <section class="bucket-section">
    <div class="bucket-heading"><span>01 / INPUT ARRAY</span><small>Phần tử đang xét sẽ nhấp sáng</small></div>
    <div class="bucket-array" :style="{ gridTemplateColumns: `repeat(${Math.max(inputItems.length, 1)}, minmax(0, 1fr))` }">
      <div v-for="(item, index) in inputItems" :key="item.id" class="bucket-item">
        <div class="bucket-bar" :class="{ 'bucket-bar--active': isInputActive(index) }" :style="barStyle(item, index)">
          <span>{{ item.value }}</span><small>#{{ item.id }}</small>
        </div>
        <span class="bucket-index">A[{{ index }}]</span>
      </div>
      <div v-if="inputItems.length === 0" class="bucket-empty">Chưa có dữ liệu</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useBucketSortVisualizer, type BucketItem } from '../../composables/useBucketSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';
const props = defineProps<{ frame: SortFrame | null }>();
const { inputItems, stableColor, barHeightPct, isInputActive } = useBucketSortVisualizer(() => props.frame);
function barStyle(item: BucketItem, index: number) { const c = stableColor(item.id); return { height: `${barHeightPct(item.value)}%`, borderColor: isInputActive(index) ? 'var(--color-accent-primary)' : c.border, background: isInputActive(index) ? 'var(--color-accent-primary-dim)' : c.background, color: isInputActive(index) ? 'var(--color-accent-primary-light)' : c.text, boxShadow: isInputActive(index) ? '0 0 16px var(--color-accent-primary-glow)' : `0 0 8px ${c.glow}` }; }
</script>

<style scoped>
.bucket-section { min-width: 0; padding: 11px 12px 12px; background: var(--color-bg-secondary); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); }
.bucket-heading { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 9px; color: var(--color-text-secondary); font: 700 10px var(--font-mono); letter-spacing: .08em; }
.bucket-heading small { color: var(--color-text-muted); font: 400 10px var(--font-mono); letter-spacing: 0; }
.bucket-array { display: grid; align-items: end; gap: clamp(4px, 1vw, 10px); min-height: 145px; }
.bucket-item { display: flex; min-width: 0; height: 145px; flex-direction: column; align-items: center; justify-content: flex-end; }
.bucket-bar { display: flex; width: 100%; max-width: 70px; min-height: 32px; flex-direction: column; align-items: center; justify-content: center; border: 1px solid; border-radius: var(--radius-md); font: 800 clamp(11px, 1.8vw, 14px) var(--font-mono); transition: .3s ease; }
.bucket-bar small { margin-top: 3px; opacity: .55; font-size: 9px; }
.bucket-bar--active { transform: translateY(-4px) scale(1.05); }
.bucket-index { margin-top: 5px; color: var(--color-text-muted); font: 10px var(--font-mono); }
.bucket-empty { grid-column: 1 / -1; align-self: center; color: var(--color-text-muted); text-align: center; font: 12px var(--font-mono); }
@media (max-width: 560px) { .bucket-heading { align-items: flex-start; flex-direction: column; } }
</style>
