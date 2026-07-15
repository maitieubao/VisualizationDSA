<template>
  <div class="tree-container w-full min-h-[320px] flex-1 relative rounded-2xl border overflow-hidden shrink-0 select-none">
    
    <!-- Color Legend Overlay inside Tree View -->
    <div class="legend-overlay absolute top-3 left-3 border rounded-xl p-2.5 text-[8.5px] font-mono flex flex-col gap-1.5 z-10 backdrop-blur-md shadow-lg">
      <div class="flex items-center gap-1.5">
        <span class="legend-dot legend-yellow"></span>
        <span class="legend-text">🟡 Node đang xét</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="legend-dot legend-cyan"></span>
        <span class="legend-text">🔵 Node trong Heap</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="legend-dot legend-rose animate-pulse"></span>
        <span class="rose-text font-bold">🔴 Vi phạm Max-Heap</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="legend-dot legend-emerald"></span>
        <span class="legend-text">🟢 Đã sắp xếp chốt</span>
      </div>
    </div>

    <!-- SVG Lines (use percentage coords so they always fit the box) -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none">
      <!-- Lines for real nodes -->
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
      <!-- Placeholder lines for missing complete-tree nodes -->
      <line
        v-for="idx in placeholderIndices"
        :key="'p-line-' + idx"
        :x1="`${getXPct(getParentIndex(idx))}%`"
        :y1="`${getYPct(getParentIndex(idx))}%`"
        :x2="`${getXPct(idx)}%`"
        :y2="`${getYPct(idx)}%`"
        stroke="var(--placeholder-line)"
        stroke-width="1"
        stroke-dasharray="3,3"
      />
    </svg>

    <!-- Real Nodes -->
    <div
      v-for="(item, idx) in frame?.arrayStateWithIds || []"
      :key="item.id"
      class="tree-node absolute -translate-x-1/2 -translate-y-1/2 rounded-full border
             flex flex-col items-center justify-center font-mono font-bold select-none
             transition-all duration-300 shadow-md group cursor-pointer"
      :style="{
        left:     `${getXPct(idx)}%`,
        top:      `${getYPct(idx)}%`,
        width:    nodeSize,
        height:   nodeSize,
        fontSize: nodeFontSize,
      }"
      :class="getNodeClass(idx)"
      @mouseenter="hoveredNodeIdx = idx"
      @mouseleave="hoveredNodeIdx = null"
    >
      <span>{{ item.value }}</span>
      <!-- Show index small on the node center bottom -->
      <span v-if="(frame?.arrayStateWithIds?.length ?? 0) <= 12" class="node-idx-label text-[7.5px] font-normal -mt-0.5 select-none">[i={{ idx }}]</span>

      <!-- Hover Debug Tooltip -->
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
          <div>Con trái: <span class="text-muted">{{ getLeftChildLabel(idx) }}</span></div>
          <div>Con phải: <span class="text-muted">{{ getRightChildLabel(idx) }}</span></div>
        </div>
      </div>
    </div>

    <!-- Placeholder Nodes (dotted grey circles) to make it complete tree -->
    <div
      v-for="idx in placeholderIndices"
      :key="'p-node-' + idx"
      class="placeholder-node absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed
             bg-transparent flex items-center justify-center font-mono text-[9px] select-none pointer-events-none"
      :style="{
        left:     `${getXPct(idx)}%`,
        top:      `${getYPct(idx)}%`,
        width:    nodeSize,
        height:   nodeSize,
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
  background-color: color-mix(in srgb, var(--color-bg-primary) 10%, transparent);
  border-color: var(--color-border-subtle);
  --placeholder-line: color-mix(in srgb, var(--color-text-muted) 15%, transparent);
}

.legend-overlay {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 85%, transparent);
  border-color: var(--color-border-subtle);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
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

.legend-text {
  color: var(--color-text-secondary);
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

/* node classes from composables */
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
  border-color: color-mix(in srgb, var(--color-accent-green) 60%, transparent) !important;
  background-color: var(--color-accent-green-dim) !important;
  color: var(--color-accent-green) !important;
}

.node-violation {
  border-color: var(--color-accent-red) !important;
  background-color: var(--color-accent-red-dim) !important;
  color: var(--color-accent-red) !important;
  box-shadow: 0 0 15px var(--color-accent-red-glow) !important;
}

/* tooltip box styles */
.tooltip-box {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 95%, transparent);
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
  border-color: color-mix(in srgb, var(--color-accent-cyan) 20%, transparent);
}

.badge-sorted {
  background-color: var(--color-accent-green-dim);
  color: var(--color-accent-green);
  border-color: color-mix(in srgb, var(--color-accent-green) 20%, transparent);
}

.tooltip-value {
  color: var(--color-accent-yellow);
}

.tooltip-children {
  border-color: var(--color-border-subtle);
  color: var(--color-text-secondary);
}

.text-muted {
  color: var(--color-text-muted);
}

.placeholder-node {
  border-color: var(--color-border-subtle);
  color: var(--color-text-muted);
}
</style>
