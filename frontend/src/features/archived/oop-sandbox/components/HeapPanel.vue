<template>
  <div class="heap-panel">
    <div class="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2 mb-4">
      <svg class="w-4 h-4 text-accent-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
      Heap Memory Allocator
    </div>

    <div v-if="store.heapInstances.length === 0" class="text-center py-8 text-text-muted text-xs">
      Chưa có object nào trên Heap. Click "+ new Circle()" để khởi tạo.
    </div>

    <div v-else class="space-y-2">
      <div 
        v-for="instance in store.heapInstances" 
        :key="instance.address"
        class="heap-instance-item"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono text-accent-yellow">{{ instance.address }}</span>
            <span 
              class="text-xs font-bold"
              :class="instance.className === 'Circle' ? 'text-accent-purple' : instance.className === 'Rectangle' ? 'text-accent-primary' : 'text-accent-green'"
            >
              {{ instance.className }}
            </span>
          </div>
          <button 
            @click="store.removeInstance(instance.address)"
            class="remove-instance-btn"
          >
            ×
          </button>
        </div>
        <div class="mt-2 flex flex-wrap gap-1">
          <span 
            v-for="[fieldName] in instance.fieldsData" 
            :key="fieldName"
            class="field-badge"
          >
            {{ fieldName }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOOPStore } from '../store/useOOPStore';

const store = useOOPStore();
</script>

<style scoped>
.heap-panel {
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 16px;
}

.heap-instance-item {
  padding: 12px;
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.remove-instance-btn {
  font-size: 10px;
  color: var(--color-accent-red);
  background: transparent;
  border: none;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.remove-instance-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent-red) 30%, transparent);
}

.field-badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-surface);
  color: var(--color-text-secondary);
}

.text-accent-yellow { color: var(--color-accent-yellow); }
.text-accent-purple { color: var(--color-accent-purple); }
.text-accent-primary { color: var(--color-accent-primary); }
.text-accent-green { color: var(--color-accent-green); }
</style>
