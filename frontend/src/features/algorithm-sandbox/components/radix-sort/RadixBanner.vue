<template>
  <div class="r-banner">
    <div class="r-row r-row--between">
      <div class="r-row" style="gap:6px">
        <span class="r-lbl">TRẠNG THÁI:</span>
        <span class="r-title">{{ currentStepDescription }}</span>
      </div>
      <span class="r-phase" :class="isDistributePhase ? 'r-phase--dist' : 'r-phase--coll'">
        <BaseIcon name="arrow-down" v-if="isDistributePhase" class="r-phase-ic" />
        <BaseIcon name="arrow-up" v-else class="r-phase-ic" />
        {{ isDistributePhase ? 'Phân Phối' : 'Thu Hoạch' }}
      </span>
    </div>

    <div class="r-row r-row--between banner-middle-row" style="padding-top:6px;margin-top:2px">
      <div class="r-row" style="gap:5px;flex-wrap:wrap">
        <span class="r-lbl">Chữ số:</span>
        <span class="r-chip" :class="activeDigitPlace === 1 ? 'r-chip--on' : ''">Đơn vị (1s)</span>
        <BaseIcon name="arrow-right" class="r-arrow" />
        <span class="r-chip" :class="activeDigitPlace === 10 ? 'r-chip--on' : ''">Chục (10s)</span>
        <BaseIcon name="arrow-right" class="r-arrow" />
        <span class="r-chip" :class="activeDigitPlace === 100 ? 'r-chip--on' : ''">Trăm (100s)</span>
      </div>
      <div class="r-row" style="gap:5px;flex-wrap:wrap">
        <span class="r-dot r-dot--y"></span><span class="r-ltxt">Chữ số quét</span>
        <span class="r-dot r-dot--c"></span><span class="r-ltxt">Mảng</span>
        <span class="r-dot r-dot--g"></span><span class="r-ltxt">Thu thập</span>
      </div>
    </div>

    <div class="r-explain" v-html="parseEmojiToSvg(escapeHtmlText(miniStepExplanation))"></div>
  </div>
</template>

<script setup lang="ts">
import { useRadixSortVisualizer } from '../../composables/useRadixSortVisualizer';
import { parseEmojiToSvg, escapeHtmlText } from '../../../../utils/emojiParser';
import type { SortFrame } from '../../types/sorting.types';

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
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 9px 13px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.r-title    { font-size: 14.5px; font-weight: 700; color: var(--color-text-primary); }
.r-phase    { font-size: 11.5px; font-family: var(--font-mono); font-weight: 700; padding: 3px 9px; border-radius: 999px; border: 1px solid; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
.r-phase--dist { background: var(--color-accent-yellow-dim); color: var(--color-accent-yellow); border-color: color-mix(in srgb, var(--color-accent-yellow) 30%, transparent); }
.r-phase--coll { background: var(--color-accent-green-dim);  color: var(--color-accent-green); border-color: color-mix(in srgb, var(--color-accent-emerald) 30%, transparent); }

.r-chip  { font-size: 11px; font-family: var(--font-mono); font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--color-border-subtle); background: var(--color-bg-primary); color: var(--color-text-muted); transition: all .3s; }
.r-chip--on { background: var(--color-accent-cyan-dim); color: var(--color-accent-cyan); border-color: color-mix(in srgb, var(--color-accent-green) 35%, transparent); box-shadow: 0 0 6px var(--color-accent-cyan-glow); }

.r-arrow {
  color: var(--color-text-muted);
  width: 11px;
  height: 11px;
  opacity: 0.5;
}

.r-phase-ic {
  width: 11px;
  height: 11px;
  vertical-align: -1.5px;
  margin-right: 3px;
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