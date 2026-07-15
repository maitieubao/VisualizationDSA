<template>
  <div class="hud-panel flex flex-col gap-3 border p-3 rounded-xl">
    <div class="flex justify-between items-center">
      <div class="text-[11px] font-mono flex gap-3 text-text-secondary">
        <span>Đỉnh (Vertices): <strong class="text-text-primary">{{ verticesCount }}</strong></span>
        <span>Cạnh (Edges): <strong class="text-text-primary">{{ edgesCount }}</strong></span>
      </div>
      <button
        @click="$emit('toggleAutoLayout')"
        class="toggle-layout-btn text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
        :class="isAutoLayout ? 'btn-layout-on' : 'btn-layout-off'"
      >
        <span class="pulse-dot w-1.5 h-1.5 rounded-full" :class="isAutoLayout ? 'bg-layout-on animate-pulse' : 'bg-layout-off'"></span>
        {{ isAutoLayout ? "Auto Layout: ON" : "Auto Layout: OFF" }}
      </button>
    </div>

    <div v-if="selectedVertexId && !isDraggingVertex" class="yellow-pulse-indicator text-[11px] font-bold flex items-center gap-1">
      <span class="yellow-dot w-1.5 h-1.5 rounded-full"></span>
      <span>Đang chọn đỉnh: {{ selectedVertexId }} (Click đỉnh khác để nối cạnh, hoặc kéo để di chuyển)</span>
    </div>
    <div v-else-if="isDraggingVertex" class="cyan-pulse-indicator text-[11px] font-bold flex items-center gap-1">
      <span class="cyan-dot w-1.5 h-1.5 rounded-full animate-pulse"></span>
      <span>Đang kéo đỉnh: {{ draggedVertexId }}</span>
    </div>
    <div v-else class="text-[10px] text-text-muted font-medium">
      Double-click: Tạo đỉnh | Click: Chọn/Nối | Kéo: Di chuyển
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  verticesCount: number;
  edgesCount: number;
  isAutoLayout: boolean;
  selectedVertexId: string | null;
  isDraggingVertex: boolean;
  draggedVertexId: string | null;
}>();

defineEmits<{
  (e: 'toggleAutoLayout'): void;
}>();
</script>

<style scoped>
.hud-panel {
  background-color: color-mix(in srgb, var(--color-bg-primary) 55%, transparent);
  border-color: color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
}

.toggle-layout-btn {
  border: 1px solid transparent;
}

.btn-layout-on {
  color: var(--color-accent-green);
  background-color: var(--color-accent-green-dim);
  border-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent);
}

.btn-layout-off {
  color: var(--color-accent-cyan);
  background-color: var(--color-accent-cyan-dim);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 30%, transparent);
}

.btn-layout-off:hover {
  background-color: color-mix(in srgb, var(--color-accent-cyan) 40%, transparent);
}

.bg-layout-on {
  background-color: var(--color-accent-green);
}

.bg-layout-off {
  background-color: var(--color-accent-cyan);
}

.yellow-pulse-indicator {
  color: var(--color-accent-yellow);
  animation: pulse 2s infinite;
}

.yellow-dot {
  background-color: var(--color-accent-yellow);
  box-shadow: 0 0 8px var(--color-accent-yellow);
}

.cyan-pulse-indicator {
  color: var(--color-accent-cyan);
}

.cyan-dot {
  background-color: var(--color-accent-cyan);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
