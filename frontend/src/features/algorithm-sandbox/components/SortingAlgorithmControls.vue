<template>
  <!-- Inline algorithm selector — no longer absolute positioned -->
  <div class="sorting-algo-controls algorithm-controls flex items-center gap-2 backdrop-blur py-1.5 px-2.5 rounded-xl shrink-0">
    <div class="flex gap-1 flex-wrap">
      <button
        v-for="algo in ALGORITHMS"
        :key="algo.key"
        class="px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-all duration-150"
        :class="selectedAlgo === algo.key ? 'btn-active' : 'btn-inactive'"
        @click="$emit('select', algo.key)"
      >
        {{ algo.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortAlgorithm } from '../types/sorting.types';

const ALGORITHMS: { key: SortAlgorithm; label: string }[] = [
  { key: "bubble",   label: "Bubble"   },
  { key: "quick",    label: "Quick"    },
  { key: "merge",    label: "Merge"    },
  { key: "heap",     label: "Heap"     },
  { key: "radix",    label: "Radix"    },
  { key: "counting", label: "Counting" },
  { key: "bucket",   label: "Bucket"   },
];

defineProps<{
  selectedAlgo: SortAlgorithm;
}>();

defineEmits<{
  (e: 'select', algo: SortAlgorithm): void;
}>();
</script>

<style scoped>
.algorithm-controls {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border-default) 70%, transparent);
}

.btn-active {
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 45%, transparent);
  box-shadow: 0 0 8px var(--color-accent-cyan-glow);
}

.btn-inactive {
  border-color: color-mix(in srgb, var(--color-border-default) 60%, transparent);
  background-color: var(--color-bg-primary);
  color: var(--color-text-muted);
}

.btn-inactive:hover {
  color: var(--color-text-secondary);
  border-color: var(--color-border-default);
}
</style>
