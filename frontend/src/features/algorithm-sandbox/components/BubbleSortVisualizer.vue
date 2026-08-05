<template>
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
        <div
          class="w-full flex items-center justify-center rounded-xl border font-bold select-none transition-all duration-300"
          :class="getItemClass(idx)"
          :style="{
            height:   barHeightPct(item.value) + '%',
            minHeight: '32px',
            fontSize:  itemFontSize,
          }"
        >
          {{ item.value }}
        </div>
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

const minVal = computed(() => {
  if (!props.frame?.arrayState?.length) return 0;
  return Math.min(...props.frame.arrayState, 0);
});

function barHeightPct(value: number): number {
  const span = Math.max(maxVal.value, Math.abs(minVal.value), 1);
  const ratio = Math.max(0, value / span);
  return Math.round(8 + ratio * 80);
}

const containerStyle = computed(() => {
  const barW = parseInt(barWidth.value);
  const gapW = parseInt(itemGap.value);
  const minW = itemCount.value * barW + (itemCount.value - 1) * gapW + 32;
  return { minWidth: `${minW}px` };
});

function getItemClass(idx: number) {
  if (!props.frame) return 'vis-bar-default';
  const { comparingIndices, swappedIndices, sortedIndices } = props.frame;

  if (sortedIndices.includes(idx))
    return 'vis-bar-sorted';
  if (swappedIndices?.includes(idx))
    return 'vis-bar-swapped';
  if (comparingIndices?.includes(idx))
    return 'vis-bar-comparing';
  return 'vis-bar-default';
}

function getIndexClass(idx: number) {
  if (!props.frame) return 'vis-index-default';
  const { comparingIndices, swappedIndices, sortedIndices } = props.frame;
  if (sortedIndices.includes(idx))     return 'vis-index-sorted';
  if (swappedIndices?.includes(idx))   return 'vis-index-swapped';
  if (comparingIndices?.includes(idx)) return 'vis-index-comparing';
  return 'vis-index-default';
}
</script>

<style scoped>
.sort-list-move {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
</style>

<style>

.vis-bar-default {
  border-color: var(--vis-color-default);
  background: linear-gradient(to top, color-mix(in srgb, var(--vis-color-default) 15%, transparent), color-mix(in srgb, var(--vis-color-default) 5%, transparent));
  color: var(--color-text-secondary);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--vis-color-default) 10%, transparent);
}
.vis-bar-sorted {
  border-color: var(--vis-color-sorted);
  background: linear-gradient(to top, color-mix(in srgb, var(--vis-color-sorted) 20%, transparent), color-mix(in srgb, var(--vis-color-sorted) 5%, transparent));
  color: var(--vis-color-sorted);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--vis-color-sorted) 20%, transparent);
}
.vis-bar-swapped {
  border-color: var(--vis-color-swap);
  background: linear-gradient(to top, color-mix(in srgb, var(--vis-color-swap) 25%, transparent), color-mix(in srgb, var(--vis-color-swap) 8%, transparent));
  color: var(--vis-color-swap);
  box-shadow: 0 4px 20px color-mix(in srgb, var(--vis-color-swap) 30%, transparent);
  animation: bar-pulse 0.6s ease-in-out;
}
.vis-bar-comparing {
  border-color: var(--vis-color-compare);
  background: linear-gradient(to top, color-mix(in srgb, var(--vis-color-compare) 20%, transparent), color-mix(in srgb, var(--vis-color-compare) 5%, transparent));
  color: var(--vis-color-compare);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--vis-color-compare) 20%, transparent);
}

.vis-index-default { color: var(--color-text-muted); }
.vis-index-sorted   { color: var(--vis-color-sorted); }
.vis-index-swapped  { color: var(--vis-color-swap); }
.vis-index-comparing { color: var(--vis-color-compare); }

@keyframes bar-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
</style>
