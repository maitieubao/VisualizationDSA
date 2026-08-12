<template>
  <section class="count-section">
    <div class="count-section__heading"><span>01 / MẢNG ĐẦU VÀO</span><small>Chữ số đang xét được nhấn sáng</small></div>
    <div class="count-array" :style="{ gridTemplateColumns: `repeat(${Math.max(inputItems.length, 1)}, minmax(0, 1fr))`, '--count-items': Math.max(inputItems.length, 1) }">
      <div v-for="(item, index) in inputItems" :key="item.id" class="count-item" :class="{ 'count-item--active': isInputActive(index) }">
        <div class="count-value" :style="barStyle(item, index)">
          <span class="count-number">{{ item.value }}</span>
          <span class="count-digit">digit {{ digitParts(item.value).digit }}</span>
        </div>
        <span class="count-index">[{{ index }}]</span>
      </div>
      <div v-if="inputItems.length === 0" class="count-empty">Chưa có mảng dữ liệu</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useCountingSortVisualizer, type CountingItem } from '../../composables/useCountingSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const { inputItems, digitParts, barHeightPct, stableColor, isInputActive } = useCountingSortVisualizer(() => props.frame);

function barStyle(item: CountingItem, index: number) {
  const color = stableColor(item.id);
  return {
    height: `${barHeightPct(item.value)}%`,
    minHeight: '32px',
    borderColor: isInputActive(index) ? 'var(--color-accent-primary)' : color.border,
    background: isInputActive(index) ? 'var(--color-accent-primary-dim)' : color.background,
    color: isInputActive(index) ? 'var(--color-accent-primary-light)' : color.text,
    boxShadow: isInputActive(index) ? '0 0 15px var(--color-accent-primary-glow)' : `0 0 10px ${color.glow}`,
  };
}
</script>

<style scoped>
.count-section { min-width: 0; padding: 11px 12px 12px; background: var(--color-bg-secondary); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); }
.count-section__heading { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 9px; color: var(--color-text-secondary); font: 700 10px var(--font-mono); letter-spacing: .08em; }
.count-section__heading small { color: var(--color-text-muted); font: 400 10px var(--font-mono); letter-spacing: 0; }
.count-array { display: grid; align-items: end; gap: clamp(4px, 1vw, 10px); min-height: 145px; }
.count-item { display: flex; min-width: 0; height: 145px; flex-direction: column; align-items: center; justify-content: flex-end; }
.count-value { display: flex; width: 100%; max-width: 70px; flex-direction: column; align-items: center; justify-content: center; border: 1px solid; border-radius: var(--radius-md); transition: .3s ease; }
.count-item--active .count-value { transform: translateY(-4px) scale(1.04); }
.count-number { font: 800 clamp(11px, 1.8vw, 14px) var(--font-mono); }
.count-digit { margin-top: 3px; color: currentColor; opacity: .65; font: 700 9px var(--font-mono); }
.count-index { margin-top: 5px; color: var(--color-text-muted); font: 10px var(--font-mono); }
.count-empty { grid-column: 1 / -1; align-self: center; color: var(--color-text-muted); text-align: center; font: 12px var(--font-mono); }
@media (max-width: 560px) { .count-section__heading { align-items: flex-start; flex-direction: column; } .count-array { overflow-x: auto; grid-template-columns: repeat(var(--count-items, 8), minmax(45px, 1fr)) !important; } }
</style>
