<template>
  
  <div class="sorting-algo-controls algorithm-controls flex items-center gap-1.5 backdrop-blur-md py-1 px-2 rounded-md shrink-0">
    <div class="flex gap-1 flex-wrap">
      <button
        v-for="algo in ALGORITHMS"
        :key="algo.key"
        type="button"
        class="px-2.5 py-1 rounded-md text-[11px] font-bold border cursor-pointer transition-all duration-150"
        :class="selectedAlgo === algo.key ? 'btn-active' : 'btn-inactive'"
        :aria-pressed="selectedAlgo === algo.key"
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

const props = defineProps<{
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
  background-color: var(--color-accent-primary-dim);
  color: var(--color-accent-primary-text);
  border-color: var(--color-border-accent);
  box-shadow: 0 0 8px var(--color-accent-primary-glow);
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
