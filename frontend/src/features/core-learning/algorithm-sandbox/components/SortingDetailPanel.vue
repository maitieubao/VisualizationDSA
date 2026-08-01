<template>
  <div class="sorting-detail-panel flex flex-col font-sans w-full flex-1 min-h-0" data-tour-id="trace-watcher-panel">

    <!-- Status section -->
    <div class="shrink-0 px-3 py-2 border-b flex flex-col gap-1" style="border-color:var(--vis-panel-border)">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">THUẬT TOÁN</span>
        <span class="text-[11px] font-bold text-accent uppercase font-mono">{{ algoLabel }}</span>
      </div>
      <div class="flex items-start gap-1.5">
        <svg class="w-3 h-3 text-accent-cyan shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-[11px] text-text-primary leading-normal">{{ stepDescription }}</p>
      </div>
      <div class="flex items-center gap-3 text-[10px] text-text-muted font-mono">
        <span>Bước: <strong class="text-accent">{{ vcrStore.currentFrameIndex + 1 }}/{{ vcrStore.totalFrames }}</strong></span>
        <span v-if="frame?.comparingIndices">So sánh: [{{ frame.comparingIndices[0] }}]↔[{{ frame.comparingIndices[1] }}]</span>
        <span v-if="frame?.swappedIndices" class="text-accent-red">Đổi: [{{ frame.swappedIndices[0] }}]↔[{{ frame.swappedIndices[1] }}]</span>
      </div>
    </div>

    <!-- Trace table: mô phỏng biến theo từng bước -->
    <SortingTraceTable
      class="flex-1 min-h-0"
      :frames="sortFrames"
      :current-index="vcrStore.currentFrameIndex"
      @jump="vcrStore.jumpToFrame"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVcrStore } from '../../vcr-player';
import { useSharedSortingAnimation } from '../composables/useSortingAnimation';
import SortingTraceTable from './SortingTraceTable.vue';
import type { SortAlgorithm } from '../types/sorting.types';

const vcrStore = useVcrStore();
const { currentSortFrame, sortFrames, stepDescription, selectedAlgo } = useSharedSortingAnimation();

const frame = computed(() => currentSortFrame.value);

const algoLabels: Record<SortAlgorithm, string> = {
  bubble: "Bubble Sort",
  quick: "Quick Sort",
  merge: "Merge Sort",
  heap: "Heap Sort",
  radix: "Radix Sort",
  counting: "Counting Sort",
  bucket: "Bucket Sort",
};

const algoLabel = computed(() => algoLabels[selectedAlgo.value] ?? "Custom");
</script>

<style scoped>
.sorting-detail-panel {
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}
</style>
