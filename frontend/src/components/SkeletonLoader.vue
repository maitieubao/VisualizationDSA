<template>
  <div
    class="skeleton"
    :class="[`skeleton--${variant}`, { 'skeleton--rounded': rounded, 'skeleton--reduced-motion': reducedMotion }]"
    :style="computedStyle"
  >
    <!-- CU-020: shimmer là trang trí — aria-hidden + tắt animation khi prefers-reduced-motion -->
    <div class="skeleton__shimmer" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';

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

// CU-020: prefers-reduced-motion — tắt shimmer (phối hợp class JS + CSS media query).
// Đọc matchMedia ngay trong setup để class sẵn sàng ngay lần render đầu (các test đọc DOM đồng bộ).
const reducedMotion = ref(false);
let motionQuery: MediaQueryList | null = null;

function onMotionPreferenceChange(e: MediaQueryListEvent): void {
  reducedMotion.value = e.matches;
}

try {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.value = motionQuery.matches;
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', onMotionPreferenceChange);
  }
} catch {
  // jsdom hoặc trình duyệt không hỗ trợ matchMedia → mặc định giữ animation.
  reducedMotion.value = false;
}

onBeforeUnmount(() => {
  if (motionQuery && typeof motionQuery.removeEventListener === 'function') {
    motionQuery.removeEventListener('change', onMotionPreferenceChange);
  }
  motionQuery = null;
});
</script>

<style scoped>
.skeleton {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-hover);
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
    color-mix(in srgb, var(--color-text-muted) 20%, transparent) 40%,
    color-mix(in srgb, var(--color-text-muted) 35%, transparent) 50%,
    color-mix(in srgb, var(--color-text-muted) 20%, transparent) 60%,
    transparent 100%
  );
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* CU-020: tắt shimmer khi user yêu cầu giảm chuyển động (class JS + CSS media query) */
.skeleton--reduced-motion .skeleton__shimmer {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton__shimmer {
    animation: none;
  }
}
</style>
