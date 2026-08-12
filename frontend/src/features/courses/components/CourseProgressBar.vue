<template>
  <div class="course-progress-bar flex flex-col gap-1.5">
    <div v-if="showLabel" class="flex items-center justify-between text-xs">
      <span class="text-text-muted font-medium">{{ label }}</span>
      <span class="text-text-primary font-bold tabular-nums">{{ clampedPercent }}%</span>
    </div>
    <div class="w-full h-2 rounded-full overflow-hidden" :class="trackClass" role="progressbar" :aria-label="label" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="clampedPercent" aria-valuetext="`${clampedPercent} phần trăm`">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="clampedPercent === 100 ? 'bg-accent-green' : 'bg-accent'"
        :style="{ width: clampedPercent + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  percent: number;
  label?: string;
  showLabel?: boolean;
  trackClass?: string;
}>(), {
  label: 'Tiến trình khóa học',
  showLabel: true,
  trackClass: 'bg-bg-surface',
});

// Kẹp phần trăm trong 0..100 để aria-valuenow luôn hợp lệ.
const clampedPercent = computed(() => Math.max(0, Math.min(100, Math.round(props.percent))));
</script>
