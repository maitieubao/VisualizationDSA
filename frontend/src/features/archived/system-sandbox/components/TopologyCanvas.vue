<template>
  <div class="relative h-[250px] bg-bg-secondary/50 rounded-xl overflow-hidden border border-border-subtle">
    <!-- Connection Lines -->
    <svg class="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <marker id="arrow-sky" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#38bdf8"/>
        </marker>
      </defs>
      <path v-for="server in webServers" :key="`conn-${server.id}`" :d="`M ${getServer('lb-1')?.position.x! + 30} ${getServer('lb-1')?.position.y!} L ${server.position.x - 30} ${server.position.y}`" stroke="#38bdf8" stroke-width="1" fill="none" stroke-dasharray="4,2" opacity="0.5" marker-end="url(#arrow-sky)" />
      <path v-for="db in dbServers" :key="`db-conn-${db.id}`" :d="`M 380 ${db.position.y < 150 ? 100 : 200} L ${db.position.x - 30} ${db.position.y}`" stroke="#64748b" stroke-width="1" fill="none" opacity="0.3" />
    </svg>

    <div
      v-for="req in store.activeRequests"
      :key="req.id"
      class="absolute w-3 h-3 rounded-full"
      :style="{
        left: getRequestPosition(req, getServer).x + 'px',
        top: getRequestPosition(req, getServer).y + 'px',
        backgroundColor: req.color,
        boxShadow: `0 0 8px ${req.color}`
      }"
    />

    <!-- Smoke Particles -->
    <div
      v-for="smoke in store.smokeParticles"
      :key="smoke.id"
      class="absolute rounded-full pointer-events-none"
      :style="{
        left: smoke.x + 'px',
        top: smoke.y + 'px',
        width: smoke.size + 'px',
        height: smoke.size + 'px',
        backgroundColor: `rgba(100, 100, 100, ${smoke.opacity})`,
        transform: 'translate(-50%, -50%)'
      }"
    />

    <!-- Server Nodes -->
    <div
      v-for="server in store.allServers"
      :key="server.id"
      class="absolute flex flex-col items-center cursor-pointer transition-all"
      :class="server.status === 'FAILED' ? 'opacity-50' : ''"
      :style="{ left: server.position.x - 30 + 'px', top: server.position.y - 25 + 'px' }"
      @click="store.toggleServerStatus(server.id)"
    >
      <div 
        class="w-14 h-14 rounded-lg border-2 flex items-center justify-center"
        :class="getServerClass(server)"
      >
        <ServerIcon :type="server.type" />
      </div>
      <div class="text-[9px] mt-1 text-text-secondary font-bold">{{ server.name }}</div>
      <div v-if="server.status === 'FAILED'" class="text-[8px] text-accent-red font-bold">OFFLINE</div>
      <div v-else class="text-[8px] font-semibold" :class="server.load > 80 ? 'text-accent-red' : 'text-accent-green'">
        {{ server.load }}%
      </div>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-2 left-2 flex gap-3 text-[9px]">
      <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-accent-green"/><span class="text-text-secondary">Healthy</span></div>
      <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-accent-red"/><span class="text-text-secondary">Failed</span></div>
      <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-sky-400"/><span class="text-text-secondary">Request</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSystemSandboxStore } from '../store/useSystemSandboxStore';
import type { ServerNode } from '../types/system-sandbox.types';
import ServerIcon from './ServerIcon.vue';
import { getServerClass, getRequestPosition } from '../helpers/systemHelpers';

const store = useSystemSandboxStore();

const webServers = computed(() => store.allServers.filter((s) => s.type === 'WEB'));
const dbServers = computed(() => store.allServers.filter((s) => s.type.includes('DB')));

function getServer(id: string): ServerNode | undefined {
  return store.allServers.find((s) => s.id === id);
}
</script>
