<script setup lang="ts">
import type { NetworkPacket, SystemNode } from '../types/system-design-viz.types';

const props = defineProps<{
  packet: NetworkPacket;
  sourceNode: SystemNode;
  targetNode: SystemNode;
}>();

function interpolatedX(): number {
  const sx = props.sourceNode.posX + 70;
  const tx = props.targetNode.posX + 70;
  return sx + (tx - sx) * props.packet.progress;
}

function interpolatedY(): number {
  const sy = props.sourceNode.posY + 40;
  const ty = props.targetNode.posY + 40;
  return sy + (ty - sy) * props.packet.progress;
}
</script>

<template>
  <div
    class="neon-packet-dot"
    :style="{
      left: interpolatedX() + 'px',
      top: interpolatedY() + 'px',
      backgroundColor: packet.packetColor,
      '--neon-color': packet.packetColor,
    }"
  ></div>
</template>

<style scoped>
.neon-packet-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 8px var(--neon-color));
  z-index: 10;
  transition: left 0.016s linear, top 0.016s linear;
}
</style>
