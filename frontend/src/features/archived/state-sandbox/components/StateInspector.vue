<template>
  <div class="state-inspector-panel">
    <!-- Header -->
    <div class="sandbox-header">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-info">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">State Inspector: Stack-Heap & DSL</span>
      </div>
      <div class="flex gap-1.5">
        <span class="sprint-badge">Sprint 10</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="store.activeTab = tab.id"
        class="tab-btn"
        :class="{ 'active': store.activeTab === tab.id }"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Tab Panels -->
    <StackHeapVisualizer v-if="store.activeTab === 'visualization'" />
    <DslCompilerPanel v-else-if="store.activeTab === 'dsl'" />
  </div>
</template>

<script setup lang="ts">
import StackHeapVisualizer from './StackHeapVisualizer.vue';
import DslCompilerPanel from './DslCompilerPanel.vue';
import { useStateSandboxStore } from '../store/useStateSandboxStore';

const store = useStateSandboxStore();
const tabs = [
  { id: 'visualization', name: '3D Stack-Heap' },
  { id: 'dsl', name: 'DSL Compiler' },
];
</script>

<style scoped>
.state-inspector-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  transition: var(--transition-smooth);
}

.sandbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 16px;
}

.icon-info {
  color: var(--color-accent-blue);
}

.sprint-badge {
  font-size: 10px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-accent-blue-dim);
  color: var(--color-accent-blue-light);
  border: 1px solid color-mix(in srgb, var(--color-accent-blue) 40%, transparent);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.tabs-container {
  display: flex;
  gap: 8px;
  padding: 4px;
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
  border-radius: var(--radius-lg);
}

.tab-btn {
  flex: 1;
  border: 1px solid transparent;
  background: transparent;
  padding: 8px;
  border-radius: var(--radius-md);
  font-size: 11px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.tab-btn:hover {
  color: var(--color-text-primary);
}

.tab-btn.active {
  background-color: var(--color-accent-blue-glow);
  color: var(--color-accent-blue-light);
  border-color: color-mix(in srgb, var(--color-accent-blue) 40%, transparent);
}
</style>
