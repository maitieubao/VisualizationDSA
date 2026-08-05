<template>
  <div class="tree-container w-full h-full flex-1 relative rounded-md border overflow-hidden shrink-0 select-none">
    <div class="legend-overlay absolute top-2.5 left-2.5 rounded-md px-2.5 py-1.5 text-[10px] font-mono flex items-center gap-3.5 z-10 backdrop-blur-md shadow-md flex-wrap">
      <div class="flex items-center gap-1.5">
        <span class="legend-dot legend-yellow"></span>
        <span class="text-text-secondary">Đang xét</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="legend-dot legend-cyan"></span>
        <span class="text-text-secondary">Trong Heap</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="legend-dot legend-rose animate-pulse"></span>
        <span class="rose-text font-bold">Vi phạm Max-Heap</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="legend-dot legend-emerald"></span>
        <span class="text-text-secondary">Đã chốt</span>
      </div>
    </div>

    <svg class="absolute inset-0 w-full h-full pointer-events-none">
      <line
        v-for="idx in childIndices"
        :key="idx"
        :x1="`${getXPct(getParentIndex(idx))}%`"
        :y1="`${getYPct(getParentIndex(idx))}%`"
        :x2="`${getXPct(idx)}%`"
        :y2="`${getYPct(idx)}%`"
        :stroke="getLineStroke(idx)"
        :stroke-width="getLineWidth(idx)"
        class="transition-all duration-300"
      />
      <line
        v-for="idx in placeholderIndices"
        :key="'p-line-' + idx"
        :x1="`${getXPct(getParentIndex(idx))}%`"
        :y1="`${getYPct(getParentIndex(idx))}%`"
        :x2="`${getXPct(idx)}%`"
        :y2="`${getYPct(idx)}%`"
        stroke="rgba(148, 163, 184, 0.12)"
        stroke-width="1"
        stroke-dasharray="3,3"
      />
    </svg>

    <div
      v-for="(item, idx) in frame?.arrayStateWithIds || []"
      :key="item.id"
      class="tree-node absolute -translate-x-1/2 -translate-y-1/2 rounded-full border flex flex-col items-center justify-center font-mono font-bold select-none transition-all duration-300 shadow-md group cursor-pointer"
      :style="{
        left: `${getXPct(idx)}%`,
        top: `${getYPct(idx)}%`,
        width: nodeSize,
        height: nodeSize,
        fontSize: nodeFontSize,
      }"
      :class="getNodeClass(idx)"
      @mouseenter="hoveredNodeIdx = idx"
      @mouseleave="hoveredNodeIdx = null"
    >
      <span>{{ item.value }}</span>
      <span v-if="(frame?.arrayStateWithIds?.length ?? 0) <= 12" class="node-idx-label text-[7.5px] font-normal -mt-0.5 select-none">[i={{ idx }}]</span>

      <div
        v-if="hoveredNodeIdx === idx"
        class="tooltip-box absolute bottom-full mb-2 z-50 border p-2.5 rounded-xl text-left backdrop-blur-md shadow-2xl text-[9px] font-mono flex flex-col gap-1 w-44 pointer-events-none"
      >
        <div class="tooltip-header font-bold border-b pb-1 flex justify-between">
          <span>Phần tử [{{ idx }}]</span>
          <span class="tooltip-badge text-[8px] px-1 rounded border" :class="isNodeInHeap(idx) ? 'badge-heap' : 'badge-sorted'">
            {{ isNodeInHeap(idx) ? 'Trong Heap' : 'Đã Chốt' }}
          </span>
        </div>
        <div>Giá trị: <span class="tooltip-value font-bold">{{ item.value }}</span></div>
        <div class="tooltip-children border-t pt-1 mt-1 flex flex-col gap-0.5">
          <div>Con trái: <span class="text-text-muted">{{ getLeftChildLabel(idx) }}</span></div>
          <div>Con phải: <span class="text-text-muted">{{ getRightChildLabel(idx) }}</span></div>
        </div>
      </div>
    </div>

    <div
      v-for="idx in placeholderIndices"
      :key="'p-node-' + idx"
      class="placeholder-node absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed bg-transparent flex items-center justify-center font-mono text-[9px] select-none pointer-events-none"
      :style="{
        left: `${getXPct(idx)}%`,
        top: `${getYPct(idx)}%`,
        width: nodeSize,
        height: nodeSize,
      }"
    >
      ∅
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHeapSortVisualizer } from '../../composables/useHeapSortVisualizer';
import type { SortFrame } from '../../types/sorting.types';

const props = defineProps<{ frame: SortFrame | null }>();
const {
  hoveredNodeIdx,
  childIndices,
  placeholderIndices,
  getXPct,
  getYPct,
  getParentIndex,
  getLineStroke,
  getLineWidth,
  getNodeClass,
  isNodeInHeap,
  getLeftChildLabel,
  getRightChildLabel,
  nodeSize,
  nodeFontSize
} = useHeapSortVisualizer(() => props.frame);
</script>

<style scoped>
.tree-container {
  background-color: rgba(19, 22, 20, 0.1);
  border-color: var(--color-border-subtle);
}

.legend-overlay {
  background-color: rgba(24, 28, 25, 0.85);
  border-color: var(--color-border-subtle);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  border: 1px solid transparent;
}

.legend-yellow {
  border-color: var(--color-accent-yellow);
  background-color: var(--color-accent-yellow-dim);
  box-shadow: 0 0 6px var(--color-accent-yellow-glow);
}

.legend-cyan {
  border-color: var(--color-accent-cyan);
  background-color: var(--color-accent-cyan-dim);
  box-shadow: 0 0 6px var(--color-accent-cyan-glow);
}

.legend-rose {
  border-color: var(--color-accent-red);
  background-color: var(--color-accent-red-dim);
  box-shadow: 0 0 8px var(--color-accent-red-glow);
}

.legend-emerald {
  border-color: var(--color-accent-green);
  background-color: var(--color-accent-green-dim);
  box-shadow: 0 0 6px var(--color-accent-green-glow);
}

.rose-text {
  color: var(--color-accent-red);
}

.tree-node {
  background-color: var(--color-bg-surface);
}

.node-idx-label {
  color: var(--color-text-muted);
}

.node-active {
  border-color: var(--color-accent-cyan);
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
  box-shadow: 0 0 8px var(--color-accent-cyan-glow);
}

.node-comparing {
  border-color: var(--color-accent-yellow) !important;
  background-color: var(--color-accent-yellow-dim) !important;
  color: var(--color-accent-yellow) !important;
  box-shadow: 0 0 12px var(--color-accent-yellow-glow) !important;
}

.node-swapped {
  border-color: var(--color-accent-red) !important;
  background-color: var(--color-accent-red-dim) !important;
  color: var(--color-accent-red) !important;
  box-shadow: 0 0 12px var(--color-accent-red-glow) !important;
}

.node-sorted {
  border-color: rgba(61, 153, 112, 0.6) !important;
  background-color: var(--color-accent-green-dim) !important;
  color: var(--color-accent-green) !important;
}

.node-violation {
  border-color: var(--color-accent-red) !important;
  background-color: var(--color-accent-red-dim) !important;
  color: var(--color-accent-red) !important;
  box-shadow: 0 0 15px var(--color-accent-red-glow) !important;
}

.tooltip-box {
  background-color: rgba(24, 28, 25, 0.95);
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

.tooltip-header {
  color: var(--color-accent-cyan);
  border-color: var(--color-border-subtle);
}

.tooltip-badge {
  border-color: transparent;
}

.badge-heap {
  background-color: var(--color-accent-cyan-dim);
  color: var(--color-accent-cyan);
  border-color: rgba(61, 153, 112, 0.2);
}

.badge-sorted {
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  border-color: rgba(16, 185, 129, 0.2);
}

.tooltip-value {
  color: var(--color-accent-yellow);
}

.tooltip-children {
  border-color: var(--color-border-subtle);
  color: var(--color-text-secondary);
}

.placeholder-node {
  border-color: var(--color-border-subtle);
  color: var(--color-text-muted);
}
</style>