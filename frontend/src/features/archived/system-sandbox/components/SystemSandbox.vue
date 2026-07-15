<template>
  <div class="system-sandbox-panel">
    <!-- Header -->
    <div class="sandbox-header">
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icon-info">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">System Design: Load Balancer & Failover</span>
      </div>
      <div class="flex gap-1.5">
        <span class="sprint-badge">Sprint 11</span>
      </div>
    </div>

    <!-- Topology Canvas -->
    <TopologyCanvas />

    <!-- System Controls -->
    <SystemControls />

    <!-- Server Stats -->
    <div class="grid grid-cols-3 gap-2">
      <div 
        v-for="server in webServers" 
        :key="`stat-${server.id}`"
        class="p-2 rounded-lg border text-center"
        :class="server.status === 'FAILED' ? 'bg-failed border-failed' : 'bg-normal border-normal'"
      >
        <div class="text-[10px] font-bold" :class="server.status === 'FAILED' ? 'text-failed' : 'text-text-secondary'">
          {{ server.name }}
        </div>
        <div class="text-xs mt-1">
          <span :class="server.status === 'FAILED' ? 'text-failed' : 'text-success'">
            {{ server.requestCount }}
          </span>
          <span class="text-text-muted"> requests</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useSystemSandboxStore } from '../store/useSystemSandboxStore';
import TopologyCanvas from './TopologyCanvas.vue';
import SystemControls from './SystemControls.vue';

const store = useSystemSandboxStore();
let animationFrameId = 0;

const webServers = computed(() => store.allServers.filter((s) => s.type === 'WEB'));

function animate(): void {
  store.updateEngine(16);
  animationFrameId = requestAnimationFrame(animate);
}

onMounted(() => {
  store.initializeInfrastructure();
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
  store.resetEngine();
});
</script>

<style scoped>
.system-sandbox-panel {
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

.bg-failed {
  background-color: color-mix(in srgb, var(--color-accent-red) 30%, transparent);
}

.border-failed {
  border-color: color-mix(in srgb, var(--color-accent-red) 40%, transparent);
}

.bg-normal {
  background-color: color-mix(in srgb, var(--color-bg-secondary) 50%, transparent);
}

.border-normal {
  border-color: var(--color-border-subtle);
}

.text-failed {
  color: var(--color-accent-red);
}

.text-success {
  color: var(--color-accent-green);
}
</style>
