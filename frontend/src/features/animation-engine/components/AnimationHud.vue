<template>
  <div class="absolute top-3 left-4 max-w-[420px] pointer-events-none">
    <span class="hud-step-label">
      Step {{ stepId }} / {{ totalSteps }}
    </span>
    <p class="hud-explanation">
      {{ explanation }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stepId: number;
  totalSteps: number;
  explanation: string;
}>();
</script>

<style scoped>
.hud-step-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent-cyan);
}
.hud-explanation {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
  margin-top: 4px;
  drop-shadow: 0 1px 8px rgba(0, 0, 0, 0.7);
}
</style>
