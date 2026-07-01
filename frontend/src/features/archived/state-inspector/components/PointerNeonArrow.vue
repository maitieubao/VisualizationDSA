<template>
  <svg class="pointer-arrow-svg" :width="svgWidth" :height="svgHeight">
    <defs>
      <marker
        id="arrowhead-cyan"
        markerWidth="8"
        markerHeight="6"
        refX="8"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#06B6D4" />
      </marker>
    </defs>

    <path
      v-for="(link, index) in pointerLinks"
      :key="index"
      class="pointer-neon-arrow"
      :d="computePath(link)"
      marker-end="url(#arrowhead-cyan)"
    />
  </svg>
</template>

<script setup lang="ts">
import type { PointerLink } from '../types/state-inspector.types';

defineProps<{
  pointerLinks: PointerLink[];
  svgWidth: number;
  svgHeight: number;
}>();

function computePath(link: PointerLink): string {
  const sourceEl = document.getElementById(link.sourceId);
  const targetEl = document.getElementById(link.targetId);

  if (!sourceEl || !targetEl) {
    return '';
  }

  const rectA = sourceEl.getBoundingClientRect();
  const rectB = targetEl.getBoundingClientRect();

  const p0x = rectA.right;
  const p0y = rectA.top + rectA.height / 2;
  const p3x = rectB.left;
  const p3y = rectB.top + rectB.height / 2;

  const dx = Math.max(Math.abs(p3x - p0x), 40);
  const p1x = p0x + dx * 0.4;
  const p1y = p0y;
  const p2x = p3x - dx * 0.4;
  const p2y = p3y;

  return `M ${p0x} ${p0y} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${p3x} ${p3y}`;
}
</script>

<style scoped>
.pointer-arrow-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

.pointer-neon-arrow {
  fill: none;
  stroke: #06B6D4;
  stroke-width: 2.5;
  stroke-dasharray: 8, 12;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.7));
  animation: pointer-flow-dash 1.2s infinite linear;
}

@keyframes pointer-flow-dash {
  to {
    stroke-dashoffset: -20;
  }
}
</style>
