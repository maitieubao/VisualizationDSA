<template>
  <section class="count-section">
    <div class="count-section__heading"><span>03 / MẢNG OUTPUT</span><small>Duyệt phải <BaseIcon name="arrow-right" class="inline-arr" /> trái để giữ stable</small></div>
    <div class="count-output" :style="{ gridTemplateColumns: `repeat(${Math.max(outputItems.length, 1)}, minmax(0, 1fr))` }">
      <div v-for="(_, index) in outputItems" :key="index" class="output-item">
        <div v-if="outputItems[index]" class="output-value" :class="{ 'output-value--active': isOutputActive(index) }" :style="outputStyle(outputItems[index]!, index)">
          <span>{{ outputItems[index]!.value }}</span>
          <small>#{{ outputItems[index]!.id }}</small>
        </div>
        <div v-else class="output-placeholder">·</div>
        <span class="count-index">[{{ index }}]</span>
      </div>
      <div v-if="outputItems.length === 0" class="count-empty">Output sẽ xuất hiện ở pha 03</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCountingSortVisualizer, type CountingItem } from '../../composables/useCountingSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const { outputItems, stableColor, isOutputActive } = useCountingSortVisualizer(() => props.frame);

function outputStyle(item: CountingItem, index: number) {
  const color = stableColor(item.id);
  return { borderColor: color.border, background: color.background, color: color.text, boxShadow: isOutputActive(index) ? `0 0 16px ${color.glow}` : `0 0 8px ${color.glow}` };
}
</script>

<style scoped>
.count-section { min-width: 0; padding: 11px 12px 12px; background: var(--color-bg-secondary); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); }
.count-section__heading { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 9px; color: var(--color-text-secondary); font: 700 10px var(--font-mono); letter-spacing: .08em; }
.count-section__heading small { color: var(--color-text-muted); font: 400 10px var(--font-mono); letter-spacing: 0; }
.count-output { display: grid; align-items: end; gap: clamp(4px, 1vw, 10px); min-height: 145px; }
.output-item { display: flex; min-width: 0; height: 145px; flex-direction: column; align-items: center; justify-content: flex-end; }
.output-value, .output-placeholder { display: flex; width: 100%; max-width: 70px; min-height: 40px; align-items: center; justify-content: center; border: 1px solid; border-radius: var(--radius-md); font: 800 clamp(11px, 1.8vw, 14px) var(--font-mono); transition: .3s ease; }
.output-value { flex-direction: column; }
.output-value small { margin-top: 3px; opacity: .55; font-size: 9px; }
.output-value--active { transform: translateY(-4px) scale(1.05); }
.output-placeholder { border-color: var(--color-border-subtle); border-style: dashed; color: var(--color-text-muted); opacity: .45; }
.count-index { margin-top: 5px; color: var(--color-text-muted); font: 10px var(--font-mono); }
.count-empty { grid-column: 1 / -1; align-self: center; color: var(--color-text-muted); text-align: center; font: 12px var(--font-mono); }
@media (max-width: 560px) { .count-section__heading { align-items: flex-start; flex-direction: column; } .count-output { overflow-x: auto; grid-template-columns: repeat(var(--count-items, 8), minmax(45px, 1fr)) !important; } }
</style>
