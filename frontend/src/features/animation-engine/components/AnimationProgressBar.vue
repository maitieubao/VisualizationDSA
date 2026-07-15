<template>
  <!-- Progress bar: nền track + thanh filled dùng CSS variables -->
  <div class="progress-track">
    <div
      class="progress-fill"
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
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--color-border-subtle);
}
.progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--color-accent-cyan), var(--color-accent-blue));
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  transition: width 100ms ease-out;
  box-shadow: 0 0 8px var(--color-accent-cyan-glow);
}
</style>
