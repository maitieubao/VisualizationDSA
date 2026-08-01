<template>
  <div class="r-banner">
    <div class="r-row r-row--between">
      <div class="r-row" style="gap:6px">
        <span class="r-lbl">TRẠNG THÁI:</span>
        <span class="r-title">{{ currentStepDescription }}</span>
      </div>
      <span class="r-phase" :class="isDistributePhase ? 'r-phase--dist' : 'r-phase--coll'">
        {{ isDistributePhase ? '⬇ Phân Phối' : '⬆ Thu Hoạch' }}
      </span>
    </div>

    <div class="r-row r-row--between banner-middle-row" style="padding-top:6px;margin-top:2px">
      <div class="r-row" style="gap:5px;flex-wrap:wrap">
        <span class="r-lbl">Chữ số:</span>
        <span class="r-chip" :class="activeDigitPlace === 1 ? 'r-chip--on' : ''">Đơn vị (1s)</span>
        <span class="r-arrow">➔</span>
        <span class="r-chip" :class="activeDigitPlace === 10 ? 'r-chip--on' : ''">Chục (10s)</span>
        <span class="r-arrow">➔</span>
        <span class="r-chip" :class="activeDigitPlace === 100 ? 'r-chip--on' : ''">Trăm (100s)</span>
      </div>
      <div class="r-row" style="gap:5px;flex-wrap:wrap">
        <span class="r-dot r-dot--y"></span><span class="r-ltxt">Chữ số quét</span>
        <span class="r-dot r-dot--c"></span><span class="r-ltxt">Mảng</span>
        <span class="r-dot r-dot--g"></span><span class="r-ltxt">Thu thập</span>
      </div>
    </div>

    <div class="r-explain">{{ miniStepExplanation }}</div>
  </div>
</template>

<script setup lang="ts">
import { useRadixSortVisualizer } from '@/features/core-learning/algorithm-sandbox/composables/useRadixSortVisualizer';
import type { SortFrame } from '@/features/core-learning/algorithm-sandbox/types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  isDistributePhase,
  activeDigitPlace,
  currentStepDescription,
  miniStepExplanation
} = useRadixSortVisualizer(() => props.frame);
</script>

<style scoped>
.r-row         { display: flex; align-items: center; gap: 8px; }
.r-row--between{ justify-content: space-between; flex-wrap: wrap; }
.r-lbl         { font-size: 11px; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--color-text-secondary); white-space: nowrap; }

.r-banner {
  flex-shrink: 0;
  margin-bottom: 8px;
  background: color-mix(in srgb, var(--color-bg-secondary) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 15%, transparent);
  border-radius: 14px;
  padding: 9px 13px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  backdrop-filter: blur(8px);
}
.r-title    { font-size: 14.5px; font-weight: 700; color: var(--color-text-primary); }
.r-phase    { font-size: 11.5px; font-family: var(--font-mono); font-weight: 700; padding: 3px 9px; border-radius: 999px; border: 1px solid; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
.r-phase--dist { background: var(--color-accent-yellow-dim); color: var(--color-accent-yellow); border-color: color-mix(in srgb, var(--color-accent-yellow) 30%, transparent); }
.r-phase--coll { background: var(--color-accent-green-dim);  color: var(--color-accent-green); border-color: color-mix(in srgb, var(--color-accent-green) 30%, transparent); }

.r-chip  { font-size: 11px; font-family: var(--font-mono); font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-border-subtle); background: color-mix(in srgb, var(--color-bg-primary) 50%, transparent); color: var(--color-text-muted); transition: all .3s; }
.r-chip--on { background: var(--color-accent-cyan-dim); color: var(--color-accent-cyan); border-color: color-mix(in srgb, var(--color-accent-cyan) 35%, transparent); box-shadow: 0 0 6px var(--color-accent-cyan-glow); }

.r-arrow {
  color: var(--color-text-muted);
  font-size: 9px;
  opacity: 0.5;
}

.r-dot   { width: 9px; height: 9px; border-radius: 50%; border: 1px solid; display: inline-block; flex-shrink: 0; }
.r-dot--y{ background: var(--color-accent-yellow-dim); border-color: var(--color-accent-yellow); }
.r-dot--c{ background: var(--color-accent-cyan-dim); border-color: var(--color-accent-cyan); }
.r-dot--g{ background: var(--color-accent-green-dim); border-color: var(--color-accent-green); }
.r-ltxt  { font-size: 11px; font-family: var(--font-mono); color: var(--color-text-secondary); white-space: nowrap; }

.r-explain { font-size: 12px; color: var(--color-text-primary); line-height: 1.5; border-top: 1px solid var(--color-border-subtle); padding-top: 5px; opacity: 0.9; }

.banner-middle-row {
  border-top: 1px solid var(--color-border-subtle);
}
</style>
