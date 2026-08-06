<template>
  <header class="count-banner">
    <div class="count-banner__top">
      <div>
        <span class="count-kicker">COUNTING SORT / LSD</span>
        <h2>{{ isComplete ? 'Hoàn tất sắp xếp' : 'Theo dõi từng chữ số' }}</h2>
      </div>
      <span class="count-place">Hàng {{ placeLabel }}</span>
    </div>
    <div class="count-phases" aria-label="Các pha của Counting Sort">
      <span class="count-phase" :class="phaseClass('count')">01 ĐẾM</span>
      <BaseIcon name="arrow-right" class="count-arrow" />
      <span class="count-phase" :class="phaseClass('accumulate')">02 CỘNG DỒN</span>
      <BaseIcon name="arrow-right" class="count-arrow" />
      <span class="count-phase" :class="phaseClass('output')">03 DỰNG OUTPUT</span>
    </div>
    <p class="count-description" v-html="parseEmojiToSvg(escapeHtmlText(explanation))"></p>
  </header>
</template>

<script setup lang="ts">
import { useCountingSortVisualizer } from '../../composables/useCountingSortVisualizer';
import { parseEmojiToSvg, escapeHtmlText } from '../../../../utils/emojiParser';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const { placeLabel, explanation, isComplete, phaseClass } = useCountingSortVisualizer(() => props.frame);
</script>

<style scoped>
.count-banner { display: flex; flex-direction: column; gap: 9px; padding: 13px 15px; background: var(--color-bg-secondary); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); }
.count-banner__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.count-kicker { color: var(--color-text-muted); font: 700 10px var(--font-mono); letter-spacing: .14em; }
h2 { margin: 3px 0 0; color: var(--color-text-primary); font-size: 17px; }
.count-place { flex-shrink: 0; padding: 4px 9px; border: 1px solid var(--color-accent-primary); border-radius: 999px; color: var(--color-accent-primary-light); background: var(--color-accent-primary-dim); font: 700 11px var(--font-mono); }
.count-phases { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.count-phase { padding: 4px 8px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); color: var(--color-text-muted); font: 700 10px var(--font-mono); transition: .25s ease; }
.count-phase--count { color: var(--color-accent-primary-light); border-color: var(--color-accent-primary); background: var(--color-accent-primary-dim); box-shadow: 0 0 10px var(--color-accent-primary-glow); }
.count-phase--accumulate { color: var(--color-accent-yellow-light); border-color: var(--color-accent-yellow); background: var(--color-accent-yellow-dim); box-shadow: 0 0 10px var(--color-accent-yellow-glow); }
.count-phase--output { color: var(--color-accent-green-light); border-color: var(--color-accent-green); background: var(--color-accent-green-dim); box-shadow: 0 0 10px var(--color-accent-green-glow); }
.count-phase--complete { color: var(--color-text-secondary); border-color: var(--color-border-subtle); opacity: .7; text-decoration: line-through; }
.count-phase--idle { opacity: .55; }
.count-arrow { color: var(--color-text-muted); width: 11px; height: 11px; }
.count-description { margin: 0; padding-top: 8px; border-top: 1px solid var(--color-border-subtle); color: var(--color-text-primary); font-size: 12px; line-height: 1.5; }
@media (max-width: 560px) { .count-banner__top { align-items: flex-start; flex-direction: column; } }
</style>
