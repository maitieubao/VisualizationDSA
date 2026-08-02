<template>
  <div class="sorting-detail-panel flex flex-col font-sans w-full flex-1 min-h-0" data-tour-id="trace-watcher-panel">

    <!-- Visualgo-like mini tabs -->
    <div class="shrink-0 flex items-end gap-1 px-2 pt-1.5 border-b" style="border-color: var(--vis-panel-border)">
      <button
        class="mini-tab"
        :class="activeTab === 'detail' ? 'mini-tab-active' : 'mini-tab-inactive'"
        @click="activeTab = 'detail'"
      >Chi tiết</button>
      <button
        class="mini-tab"
        :class="activeTab === 'vars' ? 'mini-tab-active' : 'mini-tab-inactive'"
        @click="activeTab = 'vars'"
      >Bảng biến<span v-if="sortFrames.length" class="mini-tab-count"> · {{ sortFrames.length }}</span></button>
    </div>

    <!-- Tab: Chi tiết -->
    <div v-if="activeTab === 'detail'" class="flex-1 min-h-0 flex flex-col gap-1.5 px-3 py-2 overflow-auto">
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

    <!-- Tab: Bảng biến -->
    <SortingTraceTable
      v-else
      class="flex-1 min-h-0"
      :frames="sortFrames"
      :current-index="vcrStore.currentFrameIndex"
      @jump="vcrStore.jumpToFrame"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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

const activeTab = ref<'detail' | 'vars'>('vars');

watch(
  selectedAlgo,
  (algo) => {
    activeTab.value = algo === 'quick' || algo === 'merge' ? 'detail' : 'vars';
  },
  { immediate: true },
);
</script>

<style scoped>
.sorting-detail-panel {
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

.mini-tab {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  border: 1px solid transparent;
  border-bottom: none;
  position: relative;
  top: 1px;
  transition: color 0.15s, background 0.15s;
}

.mini-tab-active {
  color: var(--color-accent-primary-text);
  background: var(--color-accent-primary-dim);
  border-color: var(--color-border-accent);
}

.mini-tab-inactive {
  color: var(--color-text-muted);
}

.mini-tab-inactive:hover {
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
}

.mini-tab-count {
  opacity: 0.6;
}
</style>
