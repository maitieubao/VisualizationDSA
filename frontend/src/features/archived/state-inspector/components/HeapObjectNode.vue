<template>
  <div
    :id="`heap-${heapObject.address}`"
    class="heap-object-node"
    :class="{ 'is-hover-pulsed': isPulsed }"
  >
    <div class="flex items-center justify-between mb-1.5">
      <span class="text-[10px] font-mono text-accent-yellow/80 bg-accent-yellow/10 px-1.5 py-0.5 rounded">
        {{ heapObject.address }}
      </span>
      <span class="text-[10px] font-semibold text-text-muted uppercase">
        {{ heapObject.type }}
      </span>
    </div>

    <div class="text-xs font-semibold text-text-secondary mb-1">
      {{ heapObject.label }}
    </div>

    <div class="space-y-0.5">
      <div
        v-for="(fieldValue, fieldName) in heapObject.fields"
        :key="fieldName"
        class="flex items-center justify-between text-[11px] font-mono px-1 py-0.5 rounded bg-bg-surface/30"
      >
        <span class="text-text-muted">{{ fieldName }}</span>
        <span class="text-accent-green">
          {{ fieldValue === null ? 'null' : fieldValue }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeapObject } from '../types/state-inspector.types';

defineProps<{
  heapObject: HeapObject;
  isPulsed: boolean;
}>();
</script>

<style scoped>
.heap-object-node {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px;
  min-width: 140px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.heap-object-node.is-hover-pulsed {
  animation: amber-glow-pulse 0.8s infinite alternate ease-in-out;
  border-color: #F59E0B !important;
}

@keyframes amber-glow-pulse {
  0% {
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.4), inset 0 0 5px rgba(245, 158, 11, 0.1);
  }
  100% {
    box-shadow: 0 0 25px rgba(245, 158, 11, 0.9), inset 0 0 12px rgba(245, 158, 11, 0.4);
  }
}
</style>
