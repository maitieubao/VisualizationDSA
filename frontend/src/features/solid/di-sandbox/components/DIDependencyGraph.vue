<template>
  <div class="dependency-graph-panel border border-border-subtle rounded-xl p-4" data-tour-id="dependency-graph-panel">
    <div class="flex items-center justify-between mb-4">
      <div class="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
        <svg class="w-4 h-4 text-accent-purple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="8" y2="14"/><circle cx="6" cy="19" r="3"/><line x1="6" x2="6" y1="16" y2="13"/>
          <circle cx="18" cy="19" r="3"/><line x1="18" x2="18" y1="16" y2="13"/><line x1="6.5" x2="11.5" y1="16.5" y2="13.5"/><line x1="17.5" x2="12.5" y1="16.5" y2="13.5"/>
        </svg>
        Dependency Graph
      </div>
      <button @click="$emit('checkCycles')" class="px-3 py-1.5 bg-accent-purple/40 border border-accent-purple/40 text-accent-purple text-[10px] font-bold rounded-lg hover:bg-accent-purple/40 transition-all">Check Cycles</button>
    </div>
    <div class="relative h-[200px] bg-bg-secondary/50 rounded-lg overflow-hidden">
      <svg class="absolute inset-0 w-full h-full pointer-events-none">
        <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/></marker></defs>
        <path v-for="(edge, idx) in graphEdges" :key="idx" :d="getBezierPath(edge)" stroke="#64748b" stroke-width="1.5" fill="none" marker-end="url(#arrowhead)" class="opacity-60" />
      </svg>
      <div v-for="node in graphNodes" :key="node.name" class="absolute w-16 h-10 rounded-lg border flex flex-col items-center justify-center text-[9px] font-bold cursor-pointer transition-all" :class="getNodeClass(node.name)" :style="{ left: node.x + 'px', top: node.y + 'px' }" @click="$emit('select', node.name)">
        <span class="truncate w-full text-center px-1">{{ node.name }}</span>
      </div>
    </div>
    <div v-if="cycleResult" class="mt-3 p-2 rounded-lg text-xs" :class="cycleResult.hasCycle ? 'bg-accent-red/30 border border-accent-red/40 text-accent-red' : 'bg-accent-green/30 border border-accent-green/40 text-accent-green'">{{ cycleResult.message }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ServiceRegistration, CycleDetectionResult } from '../DIContainerEngine';

const props = defineProps<{
  registrations: ServiceRegistration[];
  selectedService: string;
  cycleResult: CycleDetectionResult | null;
}>();

defineEmits<{
  (e: 'select', name: string): void;
  (e: 'checkCycles'): void;
}>();

const graphNodes = computed(() => props.registrations.map((reg, idx) => {
  const angle = (idx * 2 * Math.PI) / props.registrations.length - Math.PI / 2;
  return { name: reg.interfaceName, x: 150 + Math.cos(angle) * 70 - 32, y: 100 + Math.sin(angle) * 70 - 20, lifetime: reg.lifetime };
}));

const graphEdges = computed(() => {
  const edges: Array<{ from: string; to: string }> = [];
  props.registrations.forEach((reg) => reg.dependencies.forEach((dep) => edges.push({ from: reg.interfaceName, to: dep })));
  return edges;
});

function getNodeClass(name: string) {
  const reg = props.registrations.find((r) => r.interfaceName === name);
  const isSelected = props.selectedService === name;
  const base = isSelected ? 'ring-2 ring-accent-cyan/50 ' : '';
  return reg?.lifetime === 'SINGLETON' ? base + 'bg-accent-yellow/30 border-accent-yellow/40 text-accent-yellow' : base + 'bg-accent-blue/30 border-accent-blue/40 text-accent-blue';
}

function getBezierPath(edge: { from: string; to: string }): string {
  const fromNode = graphNodes.value.find((n) => n.name === edge.from);
  const toNode = graphNodes.value.find((n) => n.name === edge.to);
  if (!fromNode || !toNode) return '';
  const x1 = fromNode.x + 32, y1 = fromNode.y + 10;
  const x2 = toNode.x + 32, y2 = toNode.y + 10;
  return `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 20} ${x2} ${y2}`;
}
</script>

<style scoped>
.dependency-graph-panel {
  background-color: color-mix(in srgb, var(--color-bg-primary) 60%, transparent);
}
</style>

