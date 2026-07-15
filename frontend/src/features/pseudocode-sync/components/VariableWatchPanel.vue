<template>
  <div class="watch-panel-card" v-if="watchVariables.length > 0">
    <div class="watch-title">WATCH VARIABLES</div>
    <div class="watch-variables-grid">
      <TransitionGroup name="var-fade">
        <div
          v-for="variable in watchVariables"
          :key="variable.name"
          class="watch-variable-badge"
        >
          <span class="var-name">{{ variable.name }}</span>
          <span class="var-value">{{ variable.value }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePseudocodeStore } from '../store/usePseudocodeStore';

const pseudocodeStore = usePseudocodeStore();

const watchVariables = computed(() => pseudocodeStore.watchVariablesList);
</script>

<style scoped>
.watch-panel-card {
  margin: 0;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--color-bg-secondary) 40%, transparent);
  border-top: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.watch-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: 8px;
  font-weight: 600;
}

.watch-variables-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.watch-variable-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  background: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  border-radius: 8px;
  border: 1px solid var(--color-border-subtle);
  min-width: 48px;
}

.var-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--color-text-secondary);
}

.var-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: bold;
  color: var(--color-accent-cyan);
  text-shadow: 0 0 6px var(--color-accent-cyan-glow);
}

.var-fade-enter-active {
  transition: all 0.3s ease-out;
}

.var-fade-leave-active {
  transition: all 0.2s ease-in;
}

.var-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.var-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
