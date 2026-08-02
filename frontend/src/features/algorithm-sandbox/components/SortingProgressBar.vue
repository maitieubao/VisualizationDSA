<template>
  <div class="progress-track absolute bottom-0 left-0 right-0 h-[3px]">
    <div
      class="progress-bar h-full rounded-r-sm transition-[width] duration-150 ease-out"
      :style="{ width: progressPercent + '%' }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progressPercent: number;
}>();
</script>

<style scoped>
.progress-track {
  background-color: color-mix(in srgb, var(--color-bg-surface) 60%, transparent);
}

.progress-bar {
  background: linear-gradient(to right, var(--color-accent-cyan), var(--color-accent-blue));
  box-shadow: 0 0 8px var(--color-accent-cyan-glow);
}
</style>
