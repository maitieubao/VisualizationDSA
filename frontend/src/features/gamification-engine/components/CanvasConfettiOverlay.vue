<template>
  <Teleport to="body">
    <canvas
      v-if="visible"
      ref="canvasRef"
      class="fixed inset-0 pointer-events-none z-[9999]"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue';
import { CanvasConfettiEngine } from '../engine/CanvasConfettiEngine';

const props = defineProps<{
  visible: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let engine: CanvasConfettiEngine | null = null;

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      await nextTick();
      if (canvasRef.value) {
        engine = new CanvasConfettiEngine(canvasRef.value);
        engine.burst();
      }
    } else {
      engine?.destroy();
      engine = null;
    }
  },
);

onUnmounted(() => {
  engine?.destroy();
  engine = null;
});
</script>
