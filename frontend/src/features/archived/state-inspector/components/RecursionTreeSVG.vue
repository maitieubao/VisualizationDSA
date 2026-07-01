<template>
  <div class="recursion-tree-container">
    <div class="px-3 py-2 border-b border-border-default/50">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-semibold text-accent-green uppercase tracking-wider">
          Cây Đệ Quy
        </h3>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-text-muted">
            {{ coordinates.length }} nodes
          </span>
          <span
            v-if="coordinates.length > 0"
            class="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/20"
          >
            Depth {{ maxDepth }}
          </span>
        </div>
      </div>
    </div>

    <div class="p-3 overflow-auto">
      <svg v-if="coordinates.length > 0" :width="svgWidth" :height="svgHeight" class="mx-auto">
        <!-- Edges: parent → child lines -->
        <line
          v-for="coord in childCoordinates"
          :key="`edge-${coord.nodeId}`"
          :x1="getParentX(coord.parentId)"
          :y1="getParentY(coord.parentId)"
          :x2="coord.x"
          :y2="coord.y"
          class="tree-edge"
          :class="getEdgeClass(coord.status)"
        />

        <!-- Nodes -->
        <g v-for="coord in coordinates" :key="coord.nodeId">
          <circle
            :cx="coord.x"
            :cy="coord.y"
            r="22"
            class="tree-node"
            :class="getNodeClass(coord.status)"
          />
          <text
            :x="coord.x"
            :y="coord.y - 2"
            class="tree-label"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ coord.label }}
          </text>

          <!-- Return value badge -->
          <g v-if="coord.returnValue !== undefined">
            <rect
              :x="coord.x - 12"
              :y="coord.y + 16"
              width="24"
              height="14"
              rx="4"
              class="return-badge-bg"
            />
            <text
              :x="coord.x"
              :y="coord.y + 23"
              class="return-value-text"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              = {{ coord.returnValue }}
            </text>
          </g>
        </g>
      </svg>

      <div v-else class="text-center text-text-disabled text-sm italic py-6">
        Chưa có cây đệ quy — Bấm "Demo Fibonacci" để bắt đầu
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RecursionNodeCoordinate } from '../types/state-inspector.types';

const props = defineProps<{
  coordinates: RecursionNodeCoordinate[];
  maxDepth: number;
}>();

const svgWidth = 600;

const svgHeight = computed(() => {
  if (props.coordinates.length === 0) return 100;
  const maxY = Math.max(...props.coordinates.map((c) => c.y));
  return maxY + 60;
});

const childCoordinates = computed(() =>
  props.coordinates.filter((c) => c.parentId !== null)
);

function getParentX(parentId: string | null): number {
  if (!parentId) return 0;
  const parent = props.coordinates.find((c) => c.nodeId === parentId);
  return parent ? parent.x : 0;
}

function getParentY(parentId: string | null): number {
  if (!parentId) return 0;
  const parent = props.coordinates.find((c) => c.nodeId === parentId);
  return parent ? parent.y : 0;
}

function getNodeClass(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'node-active';
    case 'RESOLVED':
      return 'node-resolved';
    case 'PENDING':
      return 'node-pending';
    default:
      return 'node-pending';
  }
}

function getEdgeClass(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'edge-active';
    case 'RESOLVED':
      return 'edge-resolved';
    default:
      return 'edge-pending';
  }
}
</script>

<style scoped>
.recursion-tree-container {
  background: rgba(10, 15, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.tree-edge {
  stroke-width: 2;
  transition: stroke 0.3s ease;
}

.edge-active {
  stroke: #10B981;
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.5));
}

.edge-resolved {
  stroke: #06B6D4;
  filter: drop-shadow(0 0 3px rgba(6, 182, 212, 0.4));
}

.edge-pending {
  stroke: #475569;
  stroke-dasharray: 4 4;
}

.tree-node {
  transition: fill 0.3s ease, stroke 0.3s ease;
}

.node-active {
  fill: rgba(16, 185, 129, 0.2);
  stroke: #10B981;
  stroke-width: 2;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
}

.node-resolved {
  fill: rgba(6, 182, 212, 0.2);
  stroke: #06B6D4;
  stroke-width: 2;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.4));
}

.node-pending {
  fill: rgba(71, 85, 105, 0.3);
  stroke: #475569;
  stroke-width: 1.5;
}

.tree-label {
  fill: #E2E8F0;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}

.return-badge-bg {
  fill: rgba(6, 182, 212, 0.15);
  stroke: rgba(6, 182, 212, 0.3);
  stroke-width: 1;
}

.return-value-text {
  fill: #06B6D4;
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
}
</style>
