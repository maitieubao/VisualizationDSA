<template>
  <div class="flex items-center gap-2">
    <button
      v-for="step in steps"
      :key="step.number"
      @click="handleTabClick(step.number)"
      :disabled="!canAccessStep(step.number)"
      class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
      :class="[
        activeStep === step.number
          ? 'bg-accent text-white shadow-md shadow-accent/30 cursor-default'
          : canAccessStep(step.number) 
            ? 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border-subtle cursor-pointer hover:bg-bg-surface'
            : 'bg-bg-secondary/40 text-text-disabled border border-transparent cursor-not-allowed opacity-50'
      ]"
    >
      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" 
            :class="activeStep === step.number ? 'bg-bg-hover text-white' : (canAccessStep(step.number) ? 'bg-bg-surface text-text-muted' : 'bg-bg-secondary text-text-disabled')">
        <template v-if="isStepCompleted(step.number)">✓</template>
        <template v-else>{{ step.number }}</template>
      </span>
      <span>{{ step.label }}</span>
      <span v-if="!canAccessStep(step.number)" class="ml-1">🔒</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  activeStep: number;
  hasWatchedVisualizer: boolean;
  quizPassed: boolean;
  codelabCompleted: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', stepNumber: number): void;
}>();

const steps = [
  { number: 1, label: 'Lý Thuyết' },
  { number: 2, label: 'Trực Quan Hóa' },
  { number: 3, label: 'Quiz' },
  { number: 4, label: 'Code Lab' }
];

function canAccessStep(stepNum: number): boolean {
  if (stepNum === 1 || stepNum === 2) return true;
  if (stepNum === 3) return props.hasWatchedVisualizer;
  if (stepNum === 4) return props.quizPassed;
  return false;
}

function isStepCompleted(stepNum: number): boolean {
  if (stepNum === 1) return props.activeStep > 1;
  if (stepNum === 2) return props.hasWatchedVisualizer;
  if (stepNum === 3) return props.quizPassed;
  if (stepNum === 4) return props.codelabCompleted;
  return false;
}

function handleTabClick(stepNum: number) {
  if (canAccessStep(stepNum) && props.activeStep !== stepNum) {
    emit('change', stepNum);
  }
}
</script>
