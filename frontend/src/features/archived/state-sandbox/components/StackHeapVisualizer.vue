<template>
  <div class="space-y-4">
    <div class="flex gap-2 mb-2">
      <button v-for="sc in scenarios" :key="sc" @click="store.runScenario(sc)" class="px-3 py-1.5 bg-accent-blue/40 border border-accent-blue/40 text-accent-blue text-[10px] font-bold rounded-lg hover:bg-accent-blue/40 transition-all">{{ sc }}</button>
      <button @click="store.resetVisualization" class="px-3 py-1.5 bg-bg-surface border border-border-default text-text-secondary text-[10px] font-bold rounded-lg hover:bg-bg-active transition-all">Reset</button>
    </div>
    <div class="relative h-[300px] bg-bg-secondary/50 rounded-xl overflow-hidden border border-border-subtle">
      <svg class="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs><marker id="arrowhead-indigo" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#6366f1"/></marker></defs>
        <path v-for="(ptr, idx) in store.pointerPaths" :key="idx" :d="ptr.path" stroke="#6366f1" stroke-width="2" fill="none" stroke-dasharray="5,3" marker-end="url(#arrowhead-indigo)" class="opacity-70" />
      </svg>
      <div class="absolute left-4 top-4 flex flex-col gap-2">
        <div class="text-[10px] font-bold uppercase text-text-muted mb-1">Call Stack</div>
        <div v-for="(fr, idx) in store.stackFrames" :key="fr.id" class="w-40 p-3 rounded-lg border transition-all" :class="idx === store.stackFrames.length - 1 ? 'bg-accent-blue/40 border-accent-blue/50' : 'bg-bg-surface/50 border-border-default/30'" :style="{ transform: `translateZ(${fr.position.z}px)` }">
          <div class="text-xs font-bold text-accent-blue">{{ fr.functionName }}</div>
          <div class="text-[9px] text-text-muted">Frame #{{ fr.depth }}</div>
          <div v-if="fr.localVars.length > 0" class="mt-2 space-y-1">
            <div v-for="v in fr.localVars" :key="v.name" class="text-[9px] flex items-center gap-1">
              <span class="text-text-secondary">{{ v.name }}:</span>
              <span :class="v.isPointer ? 'text-accent-blue' : 'text-accent-green'">{{ v.value }}</span>
              <span v-if="v.isPointer" class="text-[8px] text-accent-blue">(ptr)</span>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute right-4 top-4 flex flex-col gap-2">
        <div class="text-[10px] font-bold uppercase text-text-muted mb-1">Heap Memory</div>
        <div v-for="node in store.heapNodes" :key="node.id" class="w-36 p-2 rounded-lg border bg-accent-yellow/30 border-accent-yellow/40">
          <div class="text-xs font-bold text-accent-yellow">{{ node.type }}</div>
          <div class="text-[9px] text-text-muted">{{ node.size }} bytes</div>
          <div v-if="node.references > 0" class="text-[9px] text-accent-yellow">{{ node.references }} reference(s)</div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg text-center">
        <div class="text-lg font-bold text-accent-blue">{{ store.stackFrames.length }}</div>
        <div class="text-[9px] text-text-muted uppercase">Stack Frames</div>
      </div>
      <div class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg text-center">
        <div class="text-lg font-bold text-accent-yellow">{{ store.heapNodes.length }}</div>
        <div class="text-[9px] text-text-muted uppercase">Heap Objects</div>
      </div>
      <div class="p-3 bg-bg-secondary/50 border border-border-subtle rounded-lg text-center">
        <div class="text-lg font-bold text-accent-green">{{ store.pointerPaths.length }}</div>
        <div class="text-[9px] text-text-muted uppercase">Active Pointers</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useStateSandboxStore } from '../store/useStateSandboxStore';

const store = useStateSandboxStore();
const scenarios = ['Simple Call', 'Linked List', 'Complex'];

onMounted(() => {
  if (store.stackFrames.length === 0) {
    store.runScenario('Simple Call');
  }
});
</script>

