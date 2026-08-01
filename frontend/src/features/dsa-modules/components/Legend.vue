<template>
  <div v-if="showLegend" class="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] z-10">
    <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-full" style="background:#FBBF24"></span> Active
    </span>
    <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-full" style="background:#10B981"></span> Visited/Processed
    </span>
    <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-full" style="background:#06B6D4"></span> Frontier/Queue
    </span>
    <span v-if="showWeights" class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
      <span class="text-accent-cyan font-mono">w</span> Edge Weight
    </span>
    <span v-if="showMST" class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-sm" style="background:#A855F7"></span> MST Edge
    </span>
    <span v-if="showPath" class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:rgba(15,23,42,0.8);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-sm" style="background:#F59E0B"></span> Shortest Path
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAlgorithmStore } from '../store/useAlgorithmStore';

const algoStore = useAlgorithmStore();

const showLegend = computed(() => {
  const category = algoStore.currentAlgorithm?.category?.toLowerCase();
  return category === 'graph';
});

const showWeights = computed(() => {
  const id = algoStore.currentAlgorithm?.id;
  return id === 'dijkstra' || id === 'bellman-ford' || id === 'prim' || id === 'kruskal' || id === 'a-star';
});

const showMST = computed(() => {
  const id = algoStore.currentAlgorithm?.id;
  return id === 'kruskal' || id === 'prim';
});

const showPath = computed(() => {
  const id = algoStore.currentAlgorithm?.id;
  return id === 'dijkstra' || id === 'bellman-ford' || id === 'a-star';
});
</script>