<template>
  <section class="bucket-section">
    <div class="bucket-heading"><span>02 / BUCKET GRID</span><small>Range động theo min/max của input</small></div>
    <div class="bucket-grid">
      <article v-for="(bucket, bucketIndex) in buckets" :key="bucketIndex" class="bucket-card" :class="{ 'bucket-card--active': isBucketActive(bucketIndex) }">
        <header><div><strong>BUCKET {{ bucketIndex }}</strong><small>{{ rangeLabels[bucketIndex] }}</small></div><span class="bucket-status">{{ bucketStatus(bucketIndex) }}</span></header>
        <div class="bucket-elements">
          <transition-group name="bucket-list">
            <span v-for="(item, itemIndex) in bucket" :key="item.id" class="bucket-element" :class="{ 'bucket-element--active': isBucketItemActive(bucketIndex, itemIndex) }" :style="elementStyle(item)">{{ item.value }}</span>
          </transition-group>
          <em v-if="bucket.length === 0">trống</em>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useBucketSortVisualizer, type BucketItem } from '../../composables/useBucketSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';
const props = defineProps<{ frame: SortFrame | null }>();
const { buckets, rangeLabels, isBucketActive, isBucketItemActive, bucketStatus, stableColor } = useBucketSortVisualizer(() => props.frame);
function elementStyle(item: BucketItem) { const c = stableColor(item.id); return { borderColor: c.border, background: c.background, color: c.text }; }
</script>

<style scoped>
.bucket-section { min-width: 0; padding: 11px 12px 12px; background: var(--color-bg-secondary); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); }
.bucket-heading { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 9px; color: var(--color-text-secondary); font: 700 10px var(--font-mono); letter-spacing: .08em; }
.bucket-heading small { color: var(--color-text-muted); font: 400 10px var(--font-mono); letter-spacing: 0; }
.bucket-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(6px, 1vw, 12px); }
.bucket-card { min-height: 115px; padding: 9px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); background: var(--color-bg-primary); transition: .25s ease; }
.bucket-card--active { border-color: var(--color-accent-primary); background: var(--color-accent-primary-dim); box-shadow: 0 0 14px var(--color-accent-primary-glow); transform: translateY(-2px); }
header { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; padding-bottom: 7px; border-bottom: 1px solid var(--color-border-subtle); }
header strong { display: block; color: var(--color-text-secondary); font: 700 10px var(--font-mono); }
header small { display: block; margin-top: 3px; color: var(--color-text-muted); font: 9px var(--font-mono); }
.bucket-status { padding: 2px 4px; border: 1px solid currentColor; border-radius: 4px; color: var(--color-text-muted); font: 700 8px var(--font-mono); }
.bucket-card--active .bucket-status { color: var(--color-accent-primary-light); }
.bucket-elements { display: flex; min-height: 58px; align-items: center; justify-content: center; align-content: center; flex-wrap: wrap; gap: 5px; padding-top: 8px; }
.bucket-element { padding: 4px 6px; border: 1px solid; border-radius: var(--radius-sm); font: 700 11px var(--font-mono); box-shadow: var(--shadow-sm); transition: .25s ease; }
.bucket-element--active { transform: scale(1.13); box-shadow: 0 0 13px var(--color-accent-yellow-glow); }
.bucket-elements em { color: var(--color-text-muted); font: italic 10px var(--font-mono); opacity: .7; }
.bucket-list-move, .bucket-list-enter-active, .bucket-list-leave-active { transition: all .25s ease; }
.bucket-list-enter-from, .bucket-list-leave-to { opacity: 0; transform: translateY(6px) scale(.9); }
@media (max-width: 700px) { .bucket-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 380px) { .bucket-grid { grid-template-columns: 1fr; } }
</style>
