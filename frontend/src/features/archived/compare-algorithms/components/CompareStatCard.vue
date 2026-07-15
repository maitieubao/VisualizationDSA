<template>
  <div class="compare-stat-card">
    <div class="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2">{{ label }}</div>
    <div class="flex items-center justify-around">
      <span class="text-lg font-extrabold" :style="{ color: '#06B6D4', textShadow: '0 0 8px rgba(6,182,212,0.2)' }">{{ leftValue }}</span>
      <span class="text-xs font-semibold text-text-disabled">vs</span>
      <span class="text-lg font-extrabold" :style="{ color: '#10B981', textShadow: '0 0 8px rgba(16,185,129,0.2)' }">{{ rightValue }}</span>
    </div>

    <!-- Progress bars mode -->
    <div v-if="showBars" class="mt-2 space-y-1">
      <div class="h-1.5 rounded-full" style="background: rgba(6,182,212,0.1);">
        <div class="h-full rounded-full transition-[width] duration-150" style="background:#06B6D4;box-shadow:0 0 6px rgba(6,182,212,0.4);" :style="{ width: leftWidth + '%' }" />
      </div>
      <div class="h-1.5 rounded-full" style="background: rgba(16,185,129,0.1);">
        <div class="h-full rounded-full transition-[width] duration-150" style="background:#10B981;box-shadow:0 0 6px rgba(16,185,129,0.4);" :style="{ width: rightWidth + '%' }" />
      </div>
    </div>

    <!-- Footer slot (ratio text, etc.) -->
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string;
  leftValue: number | string;
  rightValue: number | string;
  showBars?: boolean;
  leftWidth?: number;
  rightWidth?: number;
}>(), { showBars: false, leftWidth: 0, rightWidth: 0 });
</script>

<style scoped>
.compare-stat-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 12px 16px; }
</style>
