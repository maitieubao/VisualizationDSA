<template>
  <div class="heap-array-container w-full flex flex-col gap-1.5 pt-3 shrink-0 select-none">
    <div class="flex items-center justify-between px-2 text-[10px] font-mono font-bold label-row">
      <span>CẤU TRÚC MẢNG VẬT LÝ DƯỚI BỘ NHỚ</span>
      <span class="muted-label">Heap Size: <span class="accent-cyan-label">{{ currentHeapSize }} / {{ n }}</span></span>
    </div>

    <div class="relative w-full flex items-center justify-center py-1">
      <transition-group
        name="sort-list"
        tag="div"
        class="flex justify-center w-full"
        :style="{ gap: itemGap }"
      >
        <div
          v-for="(item, idx) in frame?.arrayStateWithIds || []"
          :key="item.id"
          class="array-cell rounded-xl border flex flex-col items-center justify-center font-bold
                 transition-all duration-300 shadow-md shrink-0 relative"
          :class="getArrayItemClass(idx)"
          :style="{ width: itemSize, height: itemHeight, fontSize: fontSize }"
        >
          <!-- Highlight bar at top of the cell -->
          <div 
            class="highlight-top-bar absolute top-0 left-0 right-0 h-1.5 rounded-t-xl" 
            :class="isNodeInHeap(idx) ? 'bar-in-heap' : 'bar-sorted'"
          ></div>
          <span>{{ item.value }}</span>
          <span class="font-mono cell-idx-label">[{{ idx }}]</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHeapSortVisualizer } from '../../composables/useHeapSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  n,
  currentHeapSize,
  isNodeInHeap,
  getArrayItemClass,
  itemSize,
  itemHeight,
  itemGap,
  fontSize
} = useHeapSortVisualizer(() => props.frame);
</script>

<style scoped>
.heap-array-container {
  border-top: 1px solid var(--color-border-subtle);
}

.label-row {
  color: var(--color-text-secondary);
}

.muted-label {
  color: var(--color-text-muted);
}

.accent-cyan-label {
  color: var(--color-accent-cyan);
}

.array-cell {
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
}

.cell-idx-label {
  font-size: 9px;
  color: var(--color-text-muted);
}

/* top status highlights */
.bar-in-heap {
  background-color: var(--color-accent-cyan-dim);
}

.bar-sorted {
  background-color: var(--color-accent-green-dim);
}

/* node classes from getArrayItemClass */
.item-active {
  border-color: color-mix(in srgb, var(--color-accent-cyan) 35%, transparent);
  color: var(--color-accent-cyan);
  box-shadow: 0 0 10px var(--color-accent-cyan-glow);
}

.item-comparing {
  border-color: var(--color-accent-yellow) !important;
  background-color: var(--color-accent-yellow-dim) !important;
  color: var(--color-accent-yellow) !important;
  box-shadow: 0 0 12px var(--color-accent-yellow-glow) !important;
}

.item-swapped {
  border-color: var(--color-accent-red) !important;
  background-color: var(--color-accent-red-dim) !important;
  color: var(--color-accent-red) !important;
  box-shadow: 0 0 12px var(--color-accent-red-glow) !important;
}

.item-sorted {
  border-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent) !important;
  background-color: var(--color-accent-green-dim) !important;
  color: var(--color-accent-green) !important;
}

/* Transition animations */
.sort-list-move         { transition: transform .4s cubic-bezier(.25,.8,.25,1); }
.sort-list-enter-from   { opacity: 0; transform: translateY(-8px) scale(.92); }
.sort-list-leave-to     { opacity: 0; transform: translateY(8px) scale(.92); }
.sort-list-enter-active,
.sort-list-leave-active { transition: all .3s ease; }
.sort-list-leave-active { position: absolute; }
</style>
