<template>
  <div class="oop-sandbox-panel">
    
    <!-- Header -->
    <div class="sandbox-header">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-accent">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/>
          <polyline points="2 12 12 17 22 12"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">OOP Sandbox & VTable Visualizer</span>
      </div>
      <div class="flex gap-1.5">
        <span class="sprint-badge">Sprint 6</span>
      </div>
    </div>

    <!-- Class UML Cards -->
    <ClassHierarchyCards />

    <!-- VTable & Heap Visualization -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <VTablePanel />
      <HeapPanel />
    </div>

    <!-- Access Violation Alert -->
    <div 
      v-if="store.accessViolation"
      class="violation-alert animate-pulse"
    >
      <div class="flex items-center gap-2 text-accent-red">
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
        <span class="text-sm font-bold">VI PHẠM ĐÓNG GÓI!</span>
      </div>
      <p class="text-xs text-accent-red mt-1">{{ store.accessViolation.message }}</p>
      <button 
        @click="store.accessViolation = null"
        class="close-alert-btn"
      >
        Đóng cảnh báo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useOOPStore } from '../store/useOOPStore';
import { registerDefaultOOPClasses } from '../engine/OOPClassRegistry';
import ClassHierarchyCards from './ClassHierarchyCards.vue';
import VTablePanel from './VTablePanel.vue';
import HeapPanel from './HeapPanel.vue';

const store = useOOPStore();

onMounted(() => {
  registerDefaultOOPClasses();

  if (store.heapInstances.length === 0) {
    store.instantiateObject();
  }
});

onUnmounted(() => {
  store.clearSandbox();
});
</script>

<style scoped>
.oop-sandbox-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
}

.sandbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 16px;
}

.icon-accent {
  color: var(--color-accent-purple);
}

.sprint-badge {
  font-size: 10px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-accent-purple-dim);
  color: var(--color-accent-purple);
  border: 1px solid color-mix(in srgb, var(--color-accent-purple) 40%, transparent);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.violation-alert {
  padding: 16px;
  background-color: var(--color-accent-red-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-red) 40%, transparent);
  border-radius: var(--radius-xl);
}

.close-alert-btn {
  margin-top: 8px;
  padding: 4px 12px;
  background-color: color-mix(in srgb, var(--color-accent-red) 50%, transparent);
  color: var(--color-accent-red);
  font-size: 10px;
  font-weight: var(--font-bold);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.close-alert-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent-red) 60%, transparent);
}

.text-accent-red {
  color: var(--color-accent-red);
}
</style>
