<template>
  <div class="timeline-slider-center" ref="containerRef"
    @mousemove="$emit('hover', $event)"
    @mouseleave="$emit('leave')">
    <div class="timeline-step-info">
      <span>Step {{ currentIndex + 1 }}</span>
      <span>{{ totalSteps }} total</span>
    </div>
    <input type="range" min="0" :max="Math.max(totalSteps - 1, 0)" :value="currentIndex"
      :disabled="totalSteps === 0 || disabled" class="custom-timeline-slider" :style="progressStyle"
      @mousedown="$emit('scrubStart')" @input="$emit('scrubInput', $event)"
      @mouseup="$emit('scrubEnd')" @touchstart="$emit('scrubStart')" @touchend="$emit('scrubEnd')" />

    <!-- Dynamic Tooltip -->
    <div v-if="tooltipVisible && !disabled" :style="{ left: tooltipX + 'px' }" class="slider-dynamic-tooltip">
      <span class="tooltip-step-label">Bước {{ tooltipStep }}:</span>
      <p class="tooltip-explanation-text">{{ tooltipText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  currentIndex: number; totalSteps: number; disabled?: boolean;
  progressStyle: Record<string, string>;
  tooltipVisible: boolean; tooltipX: number; tooltipStep: number; tooltipText: string;
}>();
defineEmits<{ hover: [MouseEvent]; leave: []; scrubStart: []; scrubInput: [Event]; scrubEnd: [] }>();
const containerRef = ref<HTMLDivElement | null>(null);
defineExpose({ containerRef });
</script>

<style scoped>
.timeline-slider-center { flex: 1; position: relative; min-width: 0; }

.timeline-step-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.custom-timeline-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  transition: height 0.1s ease;
  background: linear-gradient(
    to right,
    var(--color-accent-green) 0%,
    var(--color-accent-green) var(--progress-percent, 0%),
    var(--color-border-subtle) var(--progress-percent, 0%),
    var(--color-border-subtle) 100%
  );
}
.custom-timeline-slider:hover { height: 8px; }
.custom-timeline-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--color-accent-green);
  box-shadow: 0 0 10px var(--color-accent-green-glow);
  cursor: pointer;
  transition: transform 0.1s ease;
}
.custom-timeline-slider::-webkit-slider-thumb:hover { transform: scale(1.3); }
.custom-timeline-slider::-moz-range-thumb {
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--color-accent-green);
  box-shadow: 0 0 10px var(--color-accent-green-glow);
  border: none; cursor: pointer;
}
.custom-timeline-slider:disabled { opacity: 0.4; cursor: not-allowed; }

.slider-dynamic-tooltip {
  position: absolute;
  top: -52px;
  width: 200px;
  padding: 6px 10px;
  background: var(--color-bg-primary);
  backdrop-filter: blur(8px);
  border: 1px solid var(--color-accent-green-dim);
  border-radius: var(--radius-md);
  pointer-events: none;
  z-index: 10;
}
.tooltip-step-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-accent-green);
  text-transform: uppercase;
}
.tooltip-explanation-text {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
  line-height: 1.3;
}
</style>
