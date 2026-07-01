<template>
  <div class="learning-path-map-container">
    <!-- SVG Laser Bridges -->
    <LaserFlowBridge :bridges="store.laserBridges" />

    <!-- Node Circles -->
    <PathNodeCircle
      v-for="pos in store.nodePositions"
      :key="pos.nodeId"
      :node="getResolvedNode(pos.nodeId)"
      :x="pos.x"
      :y="pos.y"
      :is-recommended="store.aiRecommendedNode.recommendedNodeId === pos.nodeId"
      @node-click="handleNodeClick"
    />

    <!-- Completion Progress Bar -->
    <div class="absolute bottom-4 left-4 right-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] text-text-muted uppercase tracking-wider font-medium">
          Tiến trình
        </span>
        <span class="text-xs text-accent font-bold">
          {{ store.completionPercentage }}%
        </span>
      </div>
      <div class="h-2 bg-bg-surface rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-700 ease-out"
          :style="{ width: `${store.completionPercentage}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLearningPathStore } from '../store/useLearningPathStore';
import PathNodeCircle from './PathNodeCircle.vue';
import LaserFlowBridge from './LaserFlowBridge.vue';
import type { PathNode } from '../types/learning-path.types';

const store = useLearningPathStore();

const emit = defineEmits<{
  (e: 'node-selected', nodeId: string): void;
}>();

function getResolvedNode(nodeId: string): PathNode {
  return (
    store.resolvedNodes.find((n) => n.id === nodeId) ?? {
      id: nodeId,
      title: '',
      prerequisites: [],
      status: 'LOCKED' as const,
    }
  );
}

function handleNodeClick(nodeId: string) {
  store.setActiveNode(nodeId);
  emit('node-selected', nodeId);
}
</script>

<style scoped>
.learning-path-map-container {
  width: 100%;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(16, 24, 48, 1) 0%,
    rgba(8, 12, 24, 1) 100%
  );
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(51, 65, 85, 0.3);
}
</style>
