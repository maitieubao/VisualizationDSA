<template>
  <div class="vtable-panel">
    <div class="flex items-center justify-between mb-4">
      <div class="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
        <svg class="w-4 h-4 text-accent-purple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
        </svg>
        VTable Dispatch Map
      </div>
      <button 
        @click="store.instantiateObject"
        class="instantiate-btn"
      >
        + new Circle()
      </button>
    </div>

    <!-- VTable Display -->
    <div class="space-y-2">
      <div 
        v-for="(entry, methodName) in vTableDisplay" 
        :key="methodName"
        class="vtable-entry text-xs"
        :class="store.selectedMethod && store.selectedMethod.endsWith(methodName as string) ? 'active' : 'inactive'"
      >
        <div class="flex items-center gap-2">
          <span class="text-text-secondary font-mono">{{ methodName }}()</span>
          <span class="text-[10px] text-text-muted">→</span>
          <span class="font-bold" :class="entry.resolvedClass === 'Circle' ? 'text-accent-purple' : entry.resolvedClass === 'Rectangle' ? 'text-accent-primary' : 'text-accent-green'">
            {{ entry.resolvedClass }}
          </span>
        </div>
        <span class="badge" :class="entry.isOverridden ? 'overridden' : 'inherited'">
          {{ entry.isOverridden ? 'overridden' : 'inherited' }}
        </span>
      </div>
    </div>

    <!-- Dispatch Animation -->
    <div v-if="store.dispatchResult" class="dispatch-result">
      <div class="text-[10px] font-bold uppercase text-text-muted mb-2">Dynamic Dispatch Result</div>
      <div class="flex items-center gap-2 text-xs">
        <span class="text-text-secondary">Call:</span>
        <span class="text-accent-primary font-mono">shape.{{ store.dispatchResult.methodName }}()</span>
      </div>
      <div class="flex items-center gap-2 mt-1 text-xs">
        <span class="text-text-secondary">Resolved to:</span>
        <span class="text-accent-purple font-bold">{{ store.dispatchResult.actualImplementation }}</span>
      </div>
      <div class="flex items-center gap-1 mt-2">
        <span class="text-[10px] text-text-muted">Path:</span>
        <span 
          v-for="(cls, idx) in store.dispatchResult.dispatchPath" 
          :key="idx"
          class="path-badge"
          :class="cls === 'Shape' ? 'shape' : cls === 'Circle' ? 'circle' : 'other'"
        >
          {{ cls }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useOOPStore } from '../store/useOOPStore';
import { OOPReflectionEngine } from '../engine/OOPReflectionEngine';

const store = useOOPStore();

const vTableDisplay = computed(() => {
  const display: Record<string, { resolvedClass: string; isOverridden: boolean }> = {};
  const circleDef = OOPReflectionEngine.getClass('Circle');
  if (circleDef) {
    const shapeDef = OOPReflectionEngine.getClass('Shape');
    if (shapeDef) {
      shapeDef.members
        .filter(m => m.type === 'METHOD')
        .forEach(m => {
          display[m.name] = { resolvedClass: 'Shape', isOverridden: false };
        });
    }
    circleDef.members
      .filter(m => m.type === 'METHOD')
      .forEach(m => {
        const inherited = display[m.name];
        display[m.name] = { resolvedClass: 'Circle', isOverridden: inherited !== undefined };
      });
  }
  return display;
});
</script>

<style scoped>
.vtable-panel {
  background-color: color-mix(in srgb, var(--vis-panel-bg-deep) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: 16px;
}

.instantiate-btn {
  padding: 6px 12px;
  background-color: var(--color-accent-purple-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-purple) 40%, transparent);
  color: var(--color-accent-purple);
  font-size: 10px;
  font-weight: var(--font-bold);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.instantiate-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent-purple) 40%, transparent);
}

.vtable-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.vtable-entry.active {
  background-color: var(--color-accent-purple-dim);
  border-color: color-mix(in srgb, var(--color-accent-purple) 40%, transparent);
}

.vtable-entry.inactive {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  border-color: var(--color-border-subtle);
}

.badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.badge.overridden {
  background-color: color-mix(in srgb, var(--color-accent-purple) 50%, transparent);
  color: var(--color-accent-purple-light);
}

.badge.inherited {
  background-color: var(--color-bg-surface);
  color: var(--color-text-muted);
}

.dispatch-result {
  margin-top: 16px;
  padding: 12px;
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
}

.path-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.path-badge.shape {
  background-color: color-mix(in srgb, var(--color-accent-green) 50%, transparent);
  color: var(--color-accent-green);
}

.path-badge.circle {
  background-color: color-mix(in srgb, var(--color-accent-purple) 50%, transparent);
  color: var(--color-accent-purple);
}

.path-badge.other {
  background-color: color-mix(in srgb, var(--color-accent-cyan) 50%, transparent);
  color: var(--color-accent-cyan);
}

.text-accent-purple { color: var(--color-accent-purple); }
.text-accent-primary { color: var(--color-accent-primary); }
.text-accent-green { color: var(--color-accent-green); }
</style>
