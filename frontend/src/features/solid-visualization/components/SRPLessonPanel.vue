<template>
  <div class="srp-panel flex flex-col gap-4" data-tour-id="srp-lcom4-graph">
    <!-- SRP Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="hasOverheated ? 'bg-accent-red animate-pulse' : 'bg-accent-green'" />
        <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">
          SRP — Single Responsibility Principle
        </span>
      </div>
      <span
        class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
        :class="hasOverheated
          ? 'bg-accent-red/50 text-accent-red border border-accent-red/40'
          : 'bg-accent-green/50 text-accent-green border border-accent-green/40'"
      >
        {{ hasOverheated ? 'GOD OBJECT DETECTED' : 'COHESIVE DESIGN' }}
      </span>
    </div>

    <!-- Class Cards Grid -->
    <div class="flex flex-wrap gap-4 justify-center">
      <ThermalClassCard
        v-for="node in classNodes"
        :key="node.nodeId"
        :class-node="node"
        :is-overheated="node.isViolatingSRP"
        :is-cool="!node.isViolatingSRP && isSplit"
        :show-split-button="node.isViolatingSRP"
        @split="onSplit"
      />
    </div>

    <!-- Diagnostic result -->
    <div
      v-if="diagnosticResult"
      class="text-xs font-bold px-4 py-2.5 rounded-xl backdrop-blur-md border"
      :class="hasOverheated
        ? 'bg-accent-red/40 text-accent-red border-accent-red/40'
        : 'bg-accent-green/40 text-accent-green border-accent-green/40'"
    >
      {{ diagnosticResult }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SOLIDClassNode } from '../types/solid-visualization.types';
import ThermalClassCard from './ThermalClassCard.vue';

defineProps<{
  classNodes: SOLIDClassNode[];
  hasOverheated: boolean;
  isSplit: boolean;
  diagnosticResult: string | null;
}>();

const emit = defineEmits<{
  split: [nodeId: string];
}>();

function onSplit(nodeId: string): void {
  emit('split', nodeId);
}
</script>
