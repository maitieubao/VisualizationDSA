<template>
  <div
    class="resizable-splitter-handle"
    :class="{ 'is-dragging': isDragging }"
    @mousedown.prevent="onMouseDown"
    title="Kéo để thay đổi kích thước panel"
  >
    <div class="splitter-indicator">
      <div class="splitter-dot"></div>
      <div class="splitter-dot"></div>
      <div class="splitter-dot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { ThrottledDragCoordinator } from '../engine/ThrottledDragCoordinator';

const emit = defineEmits<{
  (e: 'update:percentage', value: number): void;
  (e: 'drag-start'): void;
  (e: 'drag-end'): void;
}>();

const isDragging = ref(false);
let coordinator: ThrottledDragCoordinator | null = null;

function onMouseDown() {
  const container = (document.querySelector('.multiview-workspace-grid') as HTMLElement);
  if (!container) return;

  isDragging.value = true;
  emit('drag-start');

  coordinator = new ThrottledDragCoordinator((percentage: number) => {
    emit('update:percentage', percentage);
  });
  coordinator.startDrag(container);

  window.addEventListener('mouseup', onMouseUp, { once: true });
}

function onMouseUp() {
  isDragging.value = false;
  emit('drag-end');
  if (coordinator) {
    coordinator.destroy();
    coordinator = null;
  }
}

onBeforeUnmount(() => {
  if (coordinator) {
    coordinator.destroy();
    coordinator = null;
  }
});
</script>

<style scoped>
.resizable-splitter-handle {
  width: 8px;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  cursor: col-resize;
  position: relative;
  z-index: 20;
  transition: background 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resizable-splitter-handle:hover,
.resizable-splitter-handle.is-dragging {
  background: #06B6D4;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.4);
}

.splitter-indicator {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.splitter-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.resizable-splitter-handle:hover .splitter-dot,
.resizable-splitter-handle.is-dragging .splitter-dot {
  background: white;
}
</style>
