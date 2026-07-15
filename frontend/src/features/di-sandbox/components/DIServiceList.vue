<template>
  <div class="service-list-panel border border-border-subtle rounded-xl p-4" data-tour-id="di-container-visualizer">
    <div class="flex items-center justify-between mb-4">
      <div class="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
        <svg class="w-4 h-4 text-accent-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 7V4h3M4 17v3h3M20 7V4h-3M20 17v3h-3M9 9h6v6H9z"/>
        </svg>
        Registered Services
      </div>
      <button 
        @click="$emit('loadSample')"
        class="px-3 py-1.5 bg-accent-green/40 border border-accent-green/40 text-accent-green text-[10px] font-bold rounded-lg hover:bg-accent-green/40 transition-all"
      >
        Load Sample
      </button>
    </div>

    <div class="space-y-2 max-h-[200px] overflow-y-auto">
      <div 
        v-for="reg in registrations" 
        :key="reg.interfaceName"
        class="p-3 bg-bg-secondary/50 border rounded-lg transition-all cursor-pointer"
        :class="selectedService === reg.interfaceName ? 'border-accent-cyan/50 bg-accent-cyan/20' : 'border-border-subtle hover:border-border-default'"
        @click="$emit('select', reg.interfaceName)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span 
              class="w-2 h-2 rounded-full"
              :class="reg.lifetime === 'SINGLETON' ? 'bg-accent-yellow' : 'bg-accent-blue'"
            />
            <span class="text-xs font-mono text-accent">{{ reg.interfaceName }}</span>
          </div>
          <span 
            class="text-[9px] px-1.5 py-0.5 rounded font-bold"
            :class="reg.lifetime === 'SINGLETON' ? 'bg-accent-yellow/50 text-accent-yellow' : 'bg-accent-blue/50 text-accent-blue'"
          >
            {{ reg.lifetime }}
          </span>
        </div>
        <div class="text-[10px] text-text-muted mt-1">
          → {{ reg.implementationName }}
        </div>
        <div v-if="reg.dependencies.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span 
            v-for="dep in reg.dependencies" 
            :key="dep"
            class="text-[9px] px-1.5 py-0.5 rounded bg-bg-surface text-text-secondary"
          >
            {{ dep }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ServiceRegistration } from '../DIContainerEngine';

defineProps<{
  registrations: ServiceRegistration[];
  selectedService: string;
}>();

defineEmits<{
  (e: 'select', name: string): void;
  (e: 'loadSample'): void;
}>();
</script>

<style scoped>
.service-list-panel {
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
}
</style>

