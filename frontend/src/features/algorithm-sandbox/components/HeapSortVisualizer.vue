<template>
  <div class="h-full w-full flex flex-col px-2 pt-1 pb-2 gap-2 overflow-hidden relative">
    <div class="flex items-center gap-2 shrink-0">
      <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono" :class="phaseBadgeClass">{{ currentPhase }}</span>
      <span class="text-[10px] font-mono text-text-muted flex-1 truncate">{{ currentStepDescription }}</span>
    </div>
    <HeapTree :frame="frame" class="flex-1 min-h-0" />
    <HeapArray :frame="frame" class="shrink-0" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SortFrame } from '../types/sorting.types';
import { useHeapSortVisualizer } from '../composables/useHeapSortVisualizer';
import HeapTree from './heap-sort/HeapTree.vue';
import HeapArray from './heap-sort/HeapArray.vue';

const props = defineProps<{ frame: SortFrame | null }>();
const { currentPhase, currentStepDescription } = useHeapSortVisualizer(() => props.frame);

const phaseBadgeClass = computed(() => {
  return currentPhase.value === 'BUILD'
    ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
    : 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30';
});
</script>