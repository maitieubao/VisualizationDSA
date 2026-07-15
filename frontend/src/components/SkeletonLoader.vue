<template>
  <div class="skeleton" :class="[`skeleton--${variant}`, { 'skeleton--rounded': rounded }]" :style="computedStyle">
    <div class="skeleton__shimmer" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'text' | 'card' | 'circle' | 'rect';
  width?: string;
  height?: string;
  rounded?: boolean;
}>(), {
  variant: 'rect',
  rounded: false,
});

const computedStyle = computed(() => ({
  width: props.width ?? (props.variant === 'circle' ? '40px' : '100%'),
  height: props.height ?? variantHeight(props.variant),
}));

function variantHeight(v: string): string {
  switch (v) {
    case 'text':   return '14px';
    case 'card':   return '120px';
    case 'circle': return '40px';
    default:       return '20px';
  }
}
</script>

<style scoped>
.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
}

.skeleton--circle { border-radius: 50%; }
.skeleton--rounded { border-radius: 12px; }
.skeleton--card { border-radius: 12px; }
.skeleton--text { border-radius: 4px; }

.skeleton__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 40%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.06) 60%,
    transparent 100%
  );
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
