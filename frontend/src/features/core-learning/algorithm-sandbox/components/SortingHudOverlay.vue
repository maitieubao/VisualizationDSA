<template>
  <div class="flex flex-col justify-center pointer-events-none flex-1 min-w-0 font-sans">
    <span class="step-desc text-xs font-semibold leading-normal line-clamp-1">
      {{ stepDescription }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stepDescription: string;
}>();
</script>

<style scoped>
.viewport-label {
  color: var(--color-accent-cyan);
}

.step-desc {
  color: var(--color-text-primary);
}
</style>
