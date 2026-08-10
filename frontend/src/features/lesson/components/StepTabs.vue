<template>
  <div class="step-tabs flex items-center gap-1 p-1 rounded-xl bg-bg-surface border border-border-subtle">
    <button
      v-for="step in steps"
      :key="step.number"
      @click="$emit('navigate', step.number)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
      :class="activeStep === step.number
        ? 'bg-accent text-white shadow-md shadow-accent/20'
        : step.number < activeStep
        ? 'bg-accent-green/15 text-accent-green hover:bg-accent-green/25'
        : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'"
    >
      <BaseIcon
        v-if="step.number < activeStep"
        name="check"
        class="w-3 h-3"
      />
      <span v-else class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
        :class="activeStep === step.number ? 'bg-white/20' : 'bg-bg-hover text-text-muted'"
      >
        {{ step.number }}
      </span>
      <span class="hidden sm:inline">{{ step.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  steps: Array<{ number: number; label: string }>;
  activeStep: number;
}>();

defineEmits<{
  (e: 'navigate', stepNumber: number): void;
}>();
</script>
