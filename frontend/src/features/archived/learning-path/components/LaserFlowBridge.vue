<template>
  <svg
    class="absolute inset-0 w-full h-full pointer-events-none"
    style="z-index: 5"
  >
    <defs>
      <filter :id="`glow-${bridgeId}`">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <path
      v-for="bridge in bridges"
      :key="`${bridge.fromNodeId}-${bridge.toNodeId}`"
      :d="bridge.svgPath"
      class="laser-flow-bridge-path"
      :class="{ 'laser-active': bridge.isActive, 'laser-inactive': !bridge.isActive }"
      :filter="bridge.isActive ? `url(#glow-${bridgeId})` : undefined"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LaserBridge } from '../types/learning-path.types';

const props = defineProps<{
  bridges: LaserBridge[];
}>();

const bridgeId = computed(() => 'laser-bridge-' + Math.random().toString(36).slice(2, 8));
</script>

<style scoped>
.laser-flow-bridge-path {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 10, 15;
}

.laser-active {
  stroke: #06b6d4;
  animation: laser-flow-pulse 1.5s infinite linear;
  opacity: 1;
}

.laser-inactive {
  stroke: #334155;
  opacity: 0.3;
  stroke-dasharray: 5, 20;
}

@keyframes laser-flow-pulse {
  to {
    stroke-dashoffset: -40;
  }
}
</style>
