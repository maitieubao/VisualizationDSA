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

function handleResize(): void {
  engine?.resizeCanvas();
}

async function burstOnce(): Promise<void> {
  await nextTick();
  if (canvasRef.value) {
    engine = new CanvasConfettiEngine(canvasRef.value);
    engine.burst();
  }
  // GM-035: canva phủ toàn màn hình — phải cập nhật kích thước khi cửa sổ đổi kích thước.
  window.addEventListener('resize', handleResize);
}

function destroyEngine(): void {
  window.removeEventListener('resize', handleResize);
  engine?.destroy();
  engine = null;
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      void burstOnce();
    } else {
      destroyEngine();
    }
  },
  // GM-035: mount khi visible=true (component có thể được render sau khi store đã bật cờ).
  { immediate: true },
);

onUnmounted(() => {
  destroyEngine();
});
</script>
