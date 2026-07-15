<template>
  <div class="flex flex-col h-full bg-bg-secondary/50 border border-border-subtle rounded-xl overflow-hidden">
    <div class="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary/80 border-b border-border-subtle">
      <span class="text-sm">📊</span>
      <span class="text-xs font-semibold text-text-primary">Flowchart</span>
      <span class="ml-auto px-2 py-0.5 bg-accent-cyan/15 border border-accent-cyan/30 rounded-md text-[10px] text-accent-cyan font-mono" v-if="activeNodeId">
        {{ activeNodeId }}
      </span>
    </div>
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="flex flex-col items-center gap-3">
        <template v-for="(node, idx) in flowchartNodes" :key="node.id">
          <div
            class="px-5 py-2 border text-[11px] text-center min-w-[140px] transition-all duration-200"
            :class="[
              node.id === activeNodeId 
                ? 'bg-accent-cyan/15 !border-accent-cyan !text-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse' 
                : 'border-white/10 bg-white/[0.03] text-text-secondary',
              node.type === 'start' ? 'rounded-full border-accent-emerald/30' : '',
              node.type === 'end' ? 'rounded-full border-accent-red/30' : '',
              node.type === 'decision' ? 'border-accent-yellow/30' : '',
              node.type === 'process' ? 'rounded-lg' : ''
            ]"
          >
            <div class="font-medium">{{ node.label }}</div>
          </div>
          <div v-if="idx < flowchartNodes.length - 1" :class="node.id === activeNodeId ? 'text-accent-cyan' : 'text-white/10'" class="text-[10px] -my-1 font-mono">
            ↓
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMultiViewStore } from '../store/useMultiViewStore';

const store = useMultiViewStore();
const activeNodeId = computed(() => store.currentStep?.activeFlowchartNodeId ?? '');

interface FlowchartNode {
  id: string;
  label: string;
  type: 'start' | 'end' | 'process' | 'decision';
}

const flowchartNodes: FlowchartNode[] = [
  { id: 'start', label: 'Bắt đầu', type: 'start' },
  { id: 'outer-loop', label: 'Vòng lặp ngoài i', type: 'process' },
  { id: 'compare', label: 'So sánh a[j] > a[j+1]', type: 'decision' },
  { id: 'swap', label: 'Hoán đổi', type: 'process' },
  { id: 'highlight', label: 'Đánh dấu đã sắp', type: 'process' },
  { id: 'end', label: 'Kết thúc', type: 'end' },
];
</script>
