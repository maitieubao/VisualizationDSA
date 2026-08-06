<template>
  <div v-if="showLegend" class="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] z-10">
    <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:color-mix(in srgb,var(--color-bg-surface) 80%,transparent);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-full" style="background:var(--color-accent-yellow)"></span> Active
    </span>
    <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:color-mix(in srgb,var(--color-bg-surface) 80%,transparent);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-full" style="background:var(--color-accent-emerald)"></span> Visited/Processed
    </span>
    <span class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:color-mix(in srgb,var(--color-bg-surface) 80%,transparent);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-full" style="background:var(--color-accent-cyan)"></span> Frontier/Queue
    </span>
    <span v-if="showWeights" class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:color-mix(in srgb,var(--color-bg-surface) 80%,transparent);backdrop-filter:blur(8px)">
      <span class="text-accent-cyan font-mono">w</span> Edge Weight
    </span>
    <span v-if="showMST" class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:color-mix(in srgb,var(--color-bg-surface) 80%,transparent);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-sm" style="background:var(--color-accent-purple)"></span> MST Edge
    </span>
    <span v-if="showPath" class="flex items-center gap-1 px-2 py-1 rounded-md" style="background:color-mix(in srgb,var(--color-bg-surface) 80%,transparent);backdrop-filter:blur(8px)">
      <span class="w-2.5 h-2.5 rounded-sm" style="background:var(--color-accent-yellow)"></span> Shortest Path
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