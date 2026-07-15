<template>
  <div class="vcr-scrubber-container">
    <!-- Tooltip preview -->
    <div
      v-if="showTooltip"
      class="vcr-scrubber-tooltip"
      :style="{ left: tooltipX + 'px' }"
    >
      {{ tooltipText }}
    </div>

    <!-- Track -->
    <div
      ref="trackRef"
      class="vcr-scrubber-track"
      @mousedown="onTrackMouseDown"
      @mousemove="onTrackHover"
      @mouseleave="showTooltip = false"
    >
      <!-- Filled progress -->
      <div
        class="vcr-scrubber-filled"
        :style="{ width: store.progressPercent + '%' }"
      />

      <!-- Knob indicator -->
      <div
        class="vcr-scrubber-knob"
        :style="{ left: store.progressPercent + '%' }"
        @mousedown.stop="onKnobMouseDown"
      />
    </div>

    <!-- Description -->
    <div class="vcr-description">
      <span class="vcr-description-text">{{ store.currentDescription }}</span>
      <span class="vcr-line-badge" v-if="store.currentLineNumber > 0">
        Dòng {{ store.currentLineNumber }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useVCRTimelineStore } from '../store/useVCRTimelineStore';
import { ScrubberMathCalculator } from '../engine/ScrubberMathCalculator';

const store = useVCRTimelineStore();
const trackRef = ref<HTMLElement | null>(null);
const showTooltip = ref(false);
const tooltipX = ref(0);
const tooltipText = ref('');
let isDragging = false;

function getTrackRect(): { left: number; width: number } {
  if (!trackRef.value) return { left: 0, width: 1 };
  const rect = trackRef.value.getBoundingClientRect();
  return { left: rect.left, width: rect.width };
}

function onTrackMouseDown(event: MouseEvent): void {
  if (store.totalSteps === 0) return;
  const rect = getTrackRect();
  const pos = ScrubberMathCalculator.calculateStepFromMouse(event.clientX, rect, store.totalSteps);
  store.seekTo(pos.stepIndex);
  startDrag();
}

function onKnobMouseDown(_event: MouseEvent): void {
  if (store.totalSteps === 0) return;
  startDrag();
}

function startDrag(): void {
  isDragging = true;
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
}

function onDragMove(event: MouseEvent): void {
  if (!isDragging) return;
  const rect = getTrackRect();
  const pos = ScrubberMathCalculator.calculateStepFromMouse(event.clientX, rect, store.totalSteps);
  store.seekTo(pos.stepIndex);
}

function onDragEnd(): void {
  isDragging = false;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
}

function onTrackHover(event: MouseEvent): void {
  if (store.totalSteps === 0 || isDragging) return;
  const rect = getTrackRect();
  const pos = ScrubberMathCalculator.calculateStepFromMouse(event.clientX, rect, store.totalSteps);
  tooltipX.value = event.clientX - rect.left;
  tooltipText.value = `Bước ${pos.stepIndex + 1}`;
  showTooltip.value = true;
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
});
</script>

<style scoped>
.vcr-scrubber-container {
  width: 100%;
  padding: 8px 0;
  position: relative;
}

.vcr-scrubber-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  transition: height 0.2s ease;
}

.vcr-scrubber-track:hover {
  height: 8px;
}

.vcr-scrubber-filled {
  height: 100%;
  background: linear-gradient(90deg, #0891B2, #06B6D4);
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
  transition: width 0.05s linear;
}

.vcr-scrubber-knob {
  width: 16px;
  height: 16px;
  background: #FFFFFF;
  border: 3px solid #06B6D4;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.8);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  z-index: 2;
}

.vcr-scrubber-knob:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.3);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.95);
}

.vcr-scrubber-tooltip {
  position: absolute;
  top: -28px;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  color: #06B6D4;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  font-family: 'JetBrains Mono', monospace;
}

.vcr-description {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
}

.vcr-description-text {
  font-size: 12px;
  color: #CBD5E1;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vcr-line-badge {
  font-size: 10px;
  font-weight: 600;
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
}
</style>
