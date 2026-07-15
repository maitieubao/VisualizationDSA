<template>
  <!--
    h-full w-full → fills the visualizer zone completely.
    items-end → bars grow from the bottom of the zone.
    Bar heights are % of zone height so they always use all available space.
  -->
  <div
    class="h-full w-full flex items-end justify-center px-4 pb-6"
    :style="containerStyle"
  >
    <transition-group
      name="sort-list"
      tag="div"
      class="flex items-end h-full w-full justify-center"
      :style="{ gap: itemGap }"
    >
      <div
        v-for="(item, idx) in frame?.arrayStateWithIds || []"
        :key="item.id"
        class="flex flex-col items-center justify-end shrink-0 transition-all duration-300 h-full"
        :style="{ width: barWidth }"
      >
        <!-- Bar — height as % of container so it fills available space -->
        <div
          class="w-full flex items-center justify-center rounded-xl border font-bold
                 select-none transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          :class="getItemClass(idx)"
          :style="{
            height:   barHeightPct(item.value) + '%',
            minHeight: '32px',
            fontSize:  itemFontSize,
          }"
        >
          {{ item.value }}
        </div>
        <!-- Index label below bar -->
        <div
          v-if="itemCount <= 12"
          class="mt-1 font-mono font-bold shrink-0"
          :style="{ fontSize: indexFontSize }"
          :class="getIndexClass(idx)"
        >
          [{{ idx }}]
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SortFrame } from '../types/sorting.types';

const props = defineProps<{
  frame: SortFrame | null;
}>();

const itemCount = computed(() => props.frame?.arrayStateWithIds?.length ?? 6);

// Dynamic bar width — shrinks as more items appear
const barWidth = computed(() => {
  const n = itemCount.value;
  if (n <= 8)  return '88px';
  if (n <= 12) return '72px';
  if (n <= 18) return '52px';
  return '36px';
});

const itemGap = computed(() => {
  const n = itemCount.value;
  if (n <= 8)  return '18px';
  if (n <= 12) return '12px';
  if (n <= 18) return '8px';
  return '6px';
});

const itemFontSize  = computed(() => itemCount.value <= 10 ? '14px' : itemCount.value <= 16 ? '11px' : '10px');
const indexFontSize = computed(() => itemCount.value <= 12 ? '10px' : '9px');

const maxVal = computed(() => {
  if (!props.frame?.arrayState?.length) return 1;
  return Math.max(...props.frame.arrayState, 1);
});

/**
 * Bar height as % of the zone container height.
 * Min 8% so even the smallest bar is visible.
 * Max 88% so the tallest bar doesn't touch the top (leaves room for value text).
 */
function barHeightPct(value: number): number {
  const ratio = value / maxVal.value;
  return Math.round(8 + ratio * 80);
}

// Min width for horizontal scroll
const containerStyle = computed(() => {
  const barW = parseInt(barWidth.value);
  const gapW = parseInt(itemGap.value);
  const minW = itemCount.value * barW + (itemCount.value - 1) * gapW + 32;
  return { minWidth: `${minW}px` };
});

function getItemClass(idx: number) {
  if (!props.frame) return 'border-cyan-500/40 bg-gradient-to-t from-cyan-950/50 to-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:border-cyan-400/80';
  const { comparingIndices, swappedIndices, sortedIndices } = props.frame;

  if (sortedIndices.includes(idx))
    return 'border-emerald-400 bg-gradient-to-t from-emerald-950/50 to-emerald-500/20 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.2)]';
  if (swappedIndices?.includes(idx))
    return 'border-rose-400 bg-gradient-to-t from-rose-950/60 to-rose-500/30 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.35)] scale-[1.04] animate-pulse';
  if (comparingIndices?.includes(idx))
    return 'border-amber-400 bg-gradient-to-t from-amber-950/60 to-amber-500/25 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.25)] scale-[1.03]';
  return 'border-cyan-500/40 bg-gradient-to-t from-cyan-950/50 to-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:border-cyan-400/80';
}

function getIndexClass(idx: number) {
  if (!props.frame) return 'text-slate-500';
  const { comparingIndices, swappedIndices, sortedIndices } = props.frame;
  if (sortedIndices.includes(idx))     return 'text-emerald-400';
  if (swappedIndices?.includes(idx))   return 'text-rose-400 font-bold';
  if (comparingIndices?.includes(idx)) return 'text-amber-400 font-bold';
  return 'vis-index-default';
}
</script>

<style scoped>
.sort-list-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Default index label color — thay text-slate-500 */
.vis-index-default {
  color: var(--color-text-muted);
}
</style>
