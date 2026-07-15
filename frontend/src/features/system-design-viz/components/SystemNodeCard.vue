<script setup lang="ts">
import type { SystemNode } from '../types/system-design-viz.types';
import { NODE_TYPE_LABELS } from '../types/system-design-viz.types';

const props = defineProps<{
  node: SystemNode;
}>();

const emit = defineEmits<{
  (e: 'toggleStatus', nodeId: string): void;
}>();

function statusColor(status: string): string {
  switch (status) {
    case 'HEALTHY': return '#10B981';
    case 'OVERLOADED': return '#F59E0B';
    case 'FAILED': return '#EF4444';
    default: return '#64748B';
  }
}
</script>

<template>
  <div
    class="absolute min-w-[140px] p-4 rounded-2xl bg-bg-secondary/60 border border-white/8 backdrop-blur-md shadow-2xl transition-all duration-250"
    :class="{
      'border-accent-red shadow-[0_0_20px_rgba(239,68,68,0.5),_inset_0_0_10px_rgba(239,68,68,0.2)] brightness-80': node.status === 'FAILED',
      'border-accent-yellow shadow-[0_0_16px_rgba(245,158,11,0.4)]': node.status === 'OVERLOADED',
    }"
    :style="{ left: node.posX + 'px', top: node.posY + 'px' }"
  >
    <div class="flex justify-between items-center mb-2">
      <span class="text-[10px] uppercase tracking-wider text-text-muted bg-white/5 px-1.5 py-0.5 rounded">{{ NODE_TYPE_LABELS[node.nodeType] }}</span>
      <span
        class="w-2 h-2 rounded-full"
        :style="{ backgroundColor: statusColor(node.status), boxShadow: `0 0 6px ${statusColor(node.status)}` }"
      ></span>
    </div>
    <div class="text-base font-semibold text-text-primary mb-2">{{ node.label }}</div>
    <div class="flex justify-between text-[11px] text-text-muted mb-2">
      <span>{{ node.requestCount }} req</span>
      <span
        class="font-semibold uppercase text-[10px]"
        :style="{ color: statusColor(node.status) }"
      >
        {{ node.status }}
      </span>
    </div>
    <button
      v-if="node.nodeType === 'WEB_SERVER'"
      class="w-full py-1.5 border border-white/10 rounded-lg bg-white/5 text-text-muted text-[11px] cursor-pointer transition-all duration-200 hover:bg-white/10"
      :class="{ 'text-accent-red border-accent-red/30': node.status !== 'FAILED' }"
      @click.stop="emit('toggleStatus', node.nodeId)"
    >
      {{ node.status === 'FAILED' ? 'Khôi phục' : 'Sập nguồn' }}
    </button>
  </div>
</template>
