<template>
  <header class="bucket-banner">
    <div class="bucket-banner__top">
      <div><span class="bucket-kicker">BUCKET SORT / RANGE PARTITION</span><h2>{{ isComplete ? 'Hoàn tất sắp xếp' : 'Phân phối theo vùng giá trị' }}</h2></div>
      <span class="bucket-mode">4 BUCKETS</span>
    </div>
    <div class="bucket-phases">
      <span class="bucket-phase" :class="phaseClass('distribute')">01 PHÂN PHỐI</span><BaseIcon name="arrow-right" class="bucket-arrow" /><span class="bucket-phase" :class="phaseClass('sort')">02 SẮP XẾP</span><BaseIcon name="arrow-right" class="bucket-arrow" />
      <span class="bucket-phase" :class="phaseClass('collect')">03 THU GOM</span>
    </div>
    <p class="bucket-description" v-html="parseEmojiToSvg(escapeHtmlText(explanation))"></p>
  </header>
</template>

<script setup lang="ts">
import { useBucketSortVisualizer } from '../../composables/useBucketSortVisualizer';
import { parseEmojiToSvg, escapeHtmlText } from '../../../../utils/emojiParser';
import type { SortFrame } from '../../types/sorting.types';
const props = defineProps<{ frame: SortFrame | null }>();
const { phaseClass, explanation, isComplete } = useBucketSortVisualizer(() => props.frame);
</script>

<style scoped>
.bucket-banner { display: flex; flex-direction: column; gap: 9px; padding: 13px 15px; background: var(--color-bg-secondary); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); }
.bucket-banner__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.bucket-kicker { color: var(--color-text-muted); font: 700 10px var(--font-mono); letter-spacing: .14em; }
h2 { margin: 3px 0 0; color: var(--color-text-primary); font-size: 17px; }
.bucket-mode { padding: 4px 9px; border: 1px solid var(--color-accent-primary); border-radius: 999px; color: var(--color-accent-primary-light); background: var(--color-accent-primary-dim); font: 700 11px var(--font-mono); }
.bucket-phases { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.bucket-phase { padding: 4px 8px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); color: var(--color-text-muted); font: 700 10px var(--font-mono); transition: .25s ease; }
.bucket-phase--distribute { color: var(--color-accent-primary-light); border-color: var(--color-accent-primary); background: var(--color-accent-primary-dim); box-shadow: 0 0 10px var(--color-accent-primary-glow); }
.bucket-phase--sort { color: var(--color-accent-yellow-light); border-color: var(--color-accent-yellow); background: var(--color-accent-yellow-dim); box-shadow: 0 0 10px var(--color-accent-yellow-glow); }
.bucket-phase--collect { color: var(--color-accent-green-light); border-color: var(--color-accent-green); background: var(--color-accent-green-dim); box-shadow: 0 0 10px var(--color-accent-green-glow); }
.bucket-phase--complete { color: var(--color-text-secondary); text-decoration: line-through; opacity: .7; }
.bucket-phase--idle { opacity: .55; }
.bucket-arrow { color: var(--color-text-muted); width: 11px; height: 11px; }
.bucket-description { margin: 0; padding-top: 8px; border-top: 1px solid var(--color-border-subtle); color: var(--color-text-primary); font-size: 12px; line-height: 1.5; }
@media (max-width: 560px) { .bucket-banner__top { align-items: flex-start; flex-direction: column; } }
</style>
