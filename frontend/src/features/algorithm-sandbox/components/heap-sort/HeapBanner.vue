<template>
  <div class="banner-container w-full flex flex-col gap-2 backdrop-blur rounded-2xl p-3 shadow-lg shrink-0 select-none">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="status-label text-[9px] uppercase tracking-widest font-bold font-mono">Trạng Thái:</span>
        <span class="text-xs font-bold font-sans status-desc">{{ currentStepDescription }}</span>
      </div>
      <!-- Phase Badge -->
      <span 
        class="phase-badge text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase border shadow-md flex items-center gap-1 shrink-0"
        :class="currentPhase === 'SORT' ? 'badge-sort' : 'badge-build'"
      >
        {{ currentPhase === 'SORT' ? 'Extract & Heapify Phase ⬇' : 'Build Max-Heap Phase ⬆' }}
      </span>
    </div>
    <!-- Mini step description -->
    <div class="mini-desc text-[10.5px] font-sans pt-1.5 mt-0.5 leading-relaxed">
      {{ miniStepDescription }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHeapSortVisualizer } from '../../composables/useHeapSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  currentStepDescription,
  currentPhase,
  miniStepDescription
} = useHeapSortVisualizer(() => props.frame);
</script>

<style scoped>
.banner-container {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
  box-shadow: 0 0 20px var(--color-accent-cyan-glow);
}

.status-label {
  color: var(--color-text-secondary);
}

.status-desc {
  color: var(--color-text-primary);
}

.phase-badge {
  transition: all var(--transition-smooth);
}

.badge-sort {
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  border-color: color-mix(in srgb, var(--color-accent-green) 25%, transparent);
  box-shadow: 0 0 5px var(--color-accent-green-glow);
}

.badge-build {
  background-color: var(--color-accent-yellow-dim);
  color: var(--color-accent-yellow);
  border-color: color-mix(in srgb, var(--color-accent-yellow) 25%, transparent);
  box-shadow: 0 0 5px var(--color-accent-yellow-glow);
}

.mini-desc {
  color: color-mix(in srgb, var(--color-text-primary) 85%, transparent);
  border-top: 1px solid var(--color-border-subtle);
}
</style>
