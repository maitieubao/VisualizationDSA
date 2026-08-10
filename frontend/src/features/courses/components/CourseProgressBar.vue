<template>
  <div class="course-progress-bar flex flex-col gap-1.5">
    <div v-if="showLabel" class="flex items-center justify-between text-xs">
      <span class="text-text-muted font-medium">{{ label }}</span>
      <span class="text-text-primary font-bold tabular-nums">{{ percent }}%</span>
    </div>
    <div class="w-full h-2 rounded-full overflow-hidden" :class="trackClass">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="percent === 100 ? 'bg-accent-green' : 'bg-accent'"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  percent: number;
  label?: string;
  showLabel?: boolean;
  trackClass?: string;
}>(), {
  label: 'Tiến trình khóa học',
  showLabel: true,
  trackClass: 'bg-bg-surface',
});
</script>
