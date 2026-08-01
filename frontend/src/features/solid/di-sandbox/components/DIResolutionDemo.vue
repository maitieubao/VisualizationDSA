<template>
  <div class="resolution-demo-panel border border-border-subtle rounded-xl p-4">
    <div class="flex items-center justify-between mb-4">
      <div class="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
        <svg class="w-4 h-4 text-accent-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v20M2 12h20"/>
        </svg>
        Resolution Demo
      </div>
      <div class="flex gap-2">
        <select 
          :value="serviceToResolve"
          @change="$emit('update:serviceToResolve', ($event.target as HTMLSelectElement).value)"
          class="di-select px-3 py-1.5 border border-border-default rounded-lg text-xs text-text-secondary outline-none"
        >
          <option value="">Chọn service...</option>
          <option v-for="reg in registrations" :key="reg.interfaceName" :value="reg.interfaceName">
            {{ reg.interfaceName }}
          </option>
        </select>
        <button 
          @click="$emit('resolve')"
          :disabled="!serviceToResolve"
          class="px-3 py-1.5 bg-accent-yellow/40 border border-accent-yellow/40 text-accent-yellow text-[10px] font-bold rounded-lg hover:bg-accent-yellow/40 transition-all disabled:opacity-50"
        >
          Resolve
        </button>
      </div>
    </div>

    <div v-if="resolutionResult" class="space-y-3">
      <div class="p-3 rounded-lg border" :class="resolutionResult.success ? 'bg-accent-green/30 border-accent-green/40' : 'bg-accent-red/30 border-accent-red/40'">
        <div class="flex items-center gap-2">
          <span class="text-lg">{{ resolutionResult.success ? '✅' : '❌' }}</span>
          <span class="text-sm font-bold" :class="resolutionResult.success ? 'text-accent-green' : 'text-accent-red'">
            {{ resolutionResult.success ? 'Resolution Successful' : 'Resolution Failed' }}
          </span>
        </div>
        <div v-if="resolutionResult.error" class="text-xs text-accent-red mt-2">{{ resolutionResult.error }}</div>
      </div>

      <div v-if="resolutionResult.instance" class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg">
        <div class="text-[10px] font-bold uppercase text-text-muted mb-2">Created Instance</div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div><span class="text-text-muted">ID:</span> <span class="text-accent font-mono ml-1">{{ resolutionResult.instance.instanceId }}</span></div>
          <div><span class="text-text-muted">Lifetime:</span>
            <span class="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold" :class="resolutionResult.instance.lifetime === 'SINGLETON' ? 'bg-accent-yellow/50 text-accent-yellow' : 'bg-accent-blue/50 text-accent-blue'">
              {{ resolutionResult.instance.lifetime }}
            </span>
          </div>
          <div><span class="text-text-muted">Implementation:</span> <span class="text-text-secondary ml-1">{{ resolutionResult.instance.implementationName }}</span></div>
          <div><span class="text-text-muted">Time:</span> <span class="text-accent-green ml-1">{{ resolutionResult.resolutionTimeMs.toFixed(2) }}ms</span></div>
        </div>
      </div>

      <div v-if="resolutionResult.resolutionPath.length > 0" class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg">
        <div class="text-[10px] font-bold uppercase text-text-muted mb-2">Resolution Path</div>
        <div class="flex items-center gap-1 flex-wrap">
          <span v-for="(step, idx) in resolutionResult.resolutionPath" :key="idx" class="text-xs px-2 py-1 rounded" :class="idx === resolutionResult.resolutionPath.length - 1 ? 'bg-accent-cyan/50 text-accent border border-accent-cyan/30' : 'bg-bg-surface text-text-secondary'">
            {{ step }}<span v-if="idx < resolutionResult.resolutionPath.length - 1" class="ml-1 text-text-muted">→</span>
          </span>
        </div>
      </div>
    </div>

    <div v-if="singletons.length > 0" class="mt-4 p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg">
      <div class="text-[10px] font-bold uppercase text-text-muted mb-2 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-accent-yellow"/>
        Active Singleton Instances
      </div>
      <div class="flex flex-wrap gap-2">
        <div v-for="instance in singletons" :key="instance.instanceId" class="px-2 py-1 bg-accent-yellow/30 border border-accent-yellow/30 rounded text-[10px]">
          <span class="text-accent-yellow">{{ instance.interfaceName }}</span>
          <span class="text-text-muted ml-1">({{ instance.instanceId.slice(-6) }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceRegistration, ServiceInstance, ResolutionResult } from '../DIContainerEngine';

defineProps<{
  registrations: ServiceRegistration[];
  singletons: ServiceInstance[];
  resolutionResult: ResolutionResult | null;
  serviceToResolve: string;
}>();

defineEmits<{
  (e: 'resolve'): void;
  (e: 'update:serviceToResolve', value: string): void;
}>();
</script>

<style scoped>
.resolution-demo-panel {
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
}

.di-select {
  background-color: var(--color-bg-secondary, #1e293b);
  color: var(--color-text-secondary, #94a3b8);
}

.di-select option {
  background-color: var(--color-bg-secondary, #1e293b);
  color: var(--color-text-primary, #e2e8f0);
}
</style>

