<script setup lang="ts">
import { computed } from 'vue';
import type { SystemNode, NetworkLink } from '../types/system-design-viz.types';

// Approximate node card dimensions (min-w-[140px], ~110px tall)
const NODE_W = 160;
const NODE_H = 110;

const props = defineProps<{
  link: NetworkLink;
  sourceNode: SystemNode;
  targetNode: SystemNode;
  isFailed: boolean;
}>();

/** Decide best anchor sides based on relative positions */
const anchors = computed(() => {
  const sx = props.sourceNode.posX;
  const sy = props.sourceNode.posY;
  const tx = props.targetNode.posX;
  const ty = props.targetNode.posY;

  const dx = tx - sx;
  const dy = ty - sy;

  let x1: number, y1: number, x2: number, y2: number;

  if (Math.abs(dx) >= Math.abs(dy)) {
    // Horizontal-dominant: connect right → left or left → right
    if (dx >= 0) {
      // source is left of target
      x1 = sx + NODE_W;  y1 = sy + NODE_H / 2;
      x2 = tx;           y2 = ty + NODE_H / 2;
    } else {
      // source is right of target
      x1 = sx;           y1 = sy + NODE_H / 2;
      x2 = tx + NODE_W;  y2 = ty + NODE_H / 2;
    }
  } else {
    // Vertical-dominant: connect bottom → top or top → bottom
    if (dy >= 0) {
      x1 = sx + NODE_W / 2; y1 = sy + NODE_H;
      x2 = tx + NODE_W / 2; y2 = ty;
    } else {
      x1 = sx + NODE_W / 2; y1 = sy;
      x2 = tx + NODE_W / 2; y2 = ty + NODE_H;
    }
  }

  return { x1, y1, x2, y2 };
});

const strokeColor = computed(() => props.isFailed ? '#EF4444' : '#06B6D4');
const markerId = computed(() => `arrow-${props.isFailed ? 'red' : 'cyan'}`);
</script>

<template>
  <!-- SVG defs must be inside the parent SVG; emit them as <defs> per link using a group trick -->
  <g>
    <defs>
      <marker
        :id="markerId"
        markerWidth="8"
        markerHeight="8"
        refX="6"
        refY="3"
        orient="auto"
      >
        <path
          d="M0,0 L0,6 L8,3 z"
          :fill="strokeColor"
          :fill-opacity="isFailed ? 0.4 : 0.85"
        />
      </marker>
    </defs>
    <line
      :x1="anchors.x1"
      :y1="anchors.y1"
      :x2="anchors.x2"
      :y2="anchors.y2"
      :stroke="strokeColor"
      stroke-width="2"
      :stroke-dasharray="isFailed ? '6,4' : 'none'"
      :opacity="isFailed ? 0.35 : 0.75"
      :marker-end="`url(#${markerId})`"
    />
  </g>
</template>
