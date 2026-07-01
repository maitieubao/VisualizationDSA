<template>
  <div class="grid grid-cols-4 gap-3 comparative-dashboard">
    <CompareStatCard label="So sánh"
      :left-value="store.leftStats.comparisons" :right-value="store.rightStats.comparisons"
      show-bars :left-width="leftCompareBarWidth" :right-width="rightCompareBarWidth" />

    <CompareStatCard label="Hoán vị"
      :left-value="store.leftStats.swaps" :right-value="store.rightStats.swaps"
      show-bars :left-width="leftSwapBarWidth" :right-width="rightSwapBarWidth" />

    <CompareStatCard label="Tổng bước"
      :left-value="store.leftTotalFrames" :right-value="store.rightTotalFrames">
      <div class="mt-2 text-center">
        <span class="text-[10px] font-medium text-text-muted">
          Tỷ lệ: <span class="text-text-primary font-bold">{{ store.efficiencyRatio }}x</span>
        </span>
      </div>
    </CompareStatCard>

    <CompareStatCard label="Tiến trình"
      :left-value="leftProgressDisplay + '%'" :right-value="rightProgressDisplay + '%'"
      show-bars :left-width="store.leftProgressPercent" :right-width="store.rightProgressPercent" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCompareAlgorithmsStore } from '../store/useCompareAlgorithmsStore';
import CompareStatCard from './CompareStatCard.vue';

const store = useCompareAlgorithmsStore();

const maxComparisons = computed(() => Math.max(store.leftStats.comparisons, store.rightStats.comparisons, 1));
const maxSwaps       = computed(() => Math.max(store.leftStats.swaps, store.rightStats.swaps, 1));

const leftCompareBarWidth  = computed(() => (store.leftStats.comparisons  / maxComparisons.value) * 100);
const rightCompareBarWidth = computed(() => (store.rightStats.comparisons / maxComparisons.value) * 100);
const leftSwapBarWidth     = computed(() => (store.leftStats.swaps  / maxSwaps.value) * 100);
const rightSwapBarWidth    = computed(() => (store.rightStats.swaps  / maxSwaps.value) * 100);

const leftProgressDisplay  = computed(() => Math.round(store.leftProgressPercent));
const rightProgressDisplay = computed(() => Math.round(store.rightProgressPercent));
</script>
