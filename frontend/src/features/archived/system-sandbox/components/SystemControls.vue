<template>
  <div class="grid grid-cols-2 gap-4">
    <!-- Load Balancer Controls -->
    <div class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg">
      <div class="text-[10px] font-bold uppercase text-text-muted mb-2">Load Balancer</div>
      <div class="flex gap-2">
        <button 
          @click="store.simulateRequest"
          class="flex-1 px-3 py-2 bg-sky-950/40 border border-sky-700/40 text-sky-400 text-[10px] font-bold rounded-lg hover:bg-sky-900/40 transition-all"
        >
          Send Request
        </button>
        <button 
          @click="store.simulateBurst"
          class="flex-1 px-3 py-2 bg-accent-blue/40 border border-accent-blue/40 text-accent-blue text-[10px] font-bold rounded-lg hover:bg-accent-blue/40 transition-all"
        >
          Burst (10 req)
        </button>
      </div>
      <div class="mt-2 text-[9px] text-text-muted">
        Round-robin: {{ roundRobinInfo }}
      </div>
    </div>

    <!-- DB Replication -->
    <div class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg">
      <div class="text-[10px] font-bold uppercase text-text-muted mb-2">DB Replication Lag</div>
      <div class="flex items-center gap-2">
        <input 
          v-model="replicationDelay"
          type="range"
          min="100"
          max="5000"
          step="100"
          class="flex-1 h-1 bg-bg-active rounded-lg appearance-none cursor-pointer"
        />
        <span class="text-[10px] text-accent-yellow w-14">{{ replicationDelay }}ms</span>
      </div>
      <button 
        @click="store.triggerReplication"
        class="w-full mt-2 px-3 py-2 bg-accent-yellow/40 border border-accent-yellow/40 text-accent-yellow text-[10px] font-bold rounded-lg hover:bg-accent-yellow/40 transition-all"
      >
        Sync Primary → Replica
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSystemSandboxStore } from '../store/useSystemSandboxStore';

const store = useSystemSandboxStore();
const { replicationDelay } = storeToRefs(store);

const webServers = computed(() => store.allServers.filter((s) => s.type === 'WEB'));

const roundRobinInfo = computed(() => {
  const healthy = webServers.value.filter((s) => s.status !== 'FAILED');
  if (healthy.length === 0) return 'No healthy servers!';
  return `${healthy.length} healthy servers`;
});
</script>
