<template>
  <div class="flex flex-col gap-1 pointer-events-none flex-1 min-w-0">
    <span class="viewport-label text-[10px] font-bold uppercase tracking-[0.08em]">
      Algorithm Viewport
    </span>
    <span class="step-desc text-[13px] font-semibold leading-[1.4] drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)] line-clamp-2">
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
