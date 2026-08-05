<template>
  <section class="count-section count-grid-section">
    <div class="count-section__heading"><span>02 / COUNTING GRID</span><small>Count[0..9] cho hàng {{ placeLabel }}</small></div>
    <div class="count-grid">
      <div v-for="(value, index) in countValues" :key="index" class="grid-cell" :class="cellClass(index)">
        <span class="grid-digit">{{ index }}</span>
        <strong>{{ value }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCountingSortVisualizer } from '../../composables/useCountingSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const { countValues, placeLabel, phase, isCountHighlighted } = useCountingSortVisualizer(() => props.frame);

function cellClass(index: number) {
  if (!isCountHighlighted(index)) return 'grid-cell--idle';
  if (phase.value === 'count') return 'grid-cell--count';
  if (phase.value === 'accumulate') return 'grid-cell--accumulate';
  return 'grid-cell--output';
}
</script>

<style scoped>
.count-section { min-width: 0; padding: 11px 12px 12px; background: var(--color-bg-secondary); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); }
.count-section__heading { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 9px; color: var(--color-text-secondary); font: 700 10px var(--font-mono); letter-spacing: .08em; }
.count-section__heading small { color: var(--color-text-muted); font: 400 10px var(--font-mono); letter-spacing: 0; }
.count-grid { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: clamp(3px, .8vw, 8px); }
.grid-cell { display: flex; min-height: 58px; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); background: var(--color-bg-primary); color: var(--color-text-secondary); transition: .25s ease; }
.grid-digit { color: var(--color-text-muted); font: 700 10px var(--font-mono); }
.grid-cell strong { font: 800 15px var(--font-mono); }
.grid-cell--count { border-color: var(--color-accent-primary); background: var(--color-accent-primary-dim); color: var(--color-accent-primary-light); box-shadow: 0 0 14px var(--color-accent-primary-glow); transform: translateY(-2px); }
.grid-cell--accumulate { border-color: var(--color-accent-yellow); background: var(--color-accent-yellow-dim); color: var(--color-accent-yellow-light); box-shadow: 0 0 14px var(--color-accent-yellow-glow); transform: translateY(-2px); }
.grid-cell--output { border-color: var(--color-accent-green); background: var(--color-accent-green-dim); color: var(--color-accent-green-light); box-shadow: 0 0 14px var(--color-accent-green-glow); transform: translateY(-2px); }
@media (max-width: 560px) { .count-section__heading { align-items: flex-start; flex-direction: column; } .count-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
</style>
