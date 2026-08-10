<template>
  <div class="control-panel-container" :class="{ 'disabled-panel': store.interactionLocked }">
    
    <div class="vcr-row">
      <VcrButtonsRow
        :is-first-frame="isFirstFrame"
        :is-last-frame="isLastFrame"
        :is-uninitialized="store.playbackState === 'UNINITIALIZED'"
        :is-playing="store.isPlaying"
        :is-finished="store.isFinished"
        @step-backward="store.stepBackward()"
        @step-forward="store.stepForward()"
        @toggle-play="handleTogglePlay"
      />

      <AnimTimelineSlider
        :current-index="store.currentIndex"
        :total-steps="store.totalSteps"
        :disabled="store.interactionLocked"
        :progress-style="sliderProgressStyle"
        :tooltip-visible="sliderTooltip.tooltip.value.visible"
        :tooltip-x="sliderTooltip.tooltip.value.x"
        :tooltip-step="sliderTooltip.tooltip.value.step"
        :tooltip-text="truncateText(sliderTooltip.tooltip.value.text, 55)"
        :tooltip-html="sliderTooltip.tooltip.value.html"
        @hover="onSliderHover"
        @leave="sliderTooltip.hideTooltip()"
        @scrub-start="scrubEngine.startScrub()"
        @scrub-input="onScrubInput"
        @scrub-end="scrubEngine.endScrub()"
        ref="timelineRef"
      />

      
      <div class="speed-controls-right">
        <div class="speed-input-group" :class="{ 'disabled-group': store.interactionLocked }">
          <input
            type="number"
            :value="store.playbackSpeed"
            @change="onCustomSpeedChange"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
            min="0.1"
            max="10"
            step="0.1"
            class="speed-number-input"
            :disabled="store.interactionLocked"
            aria-label="Tốc độ phát tùy chỉnh"
          />
          <span class="speed-unit">x</span>
        </div>
      </div>
    </div>

    
    <div class="state-indicator-row">
      <span class="state-dot" :class="{
        'state-dot--idle':     store.playbackState === 'UNINITIALIZED',
        'state-dot--loaded':   store.playbackState === 'LOADED',
        'state-dot--playing animate-pulse': store.playbackState === 'PLAYING',
        'state-dot--paused':   store.playbackState === 'PAUSED',
        'state-dot--finished': store.playbackState === 'FINISHED',
      }" />
      <span class="state-label">{{ playbackStateLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';
import { useSpeedPreferences } from '../composables/useSpeedPreferences';
import { useThrottledScrub } from '../composables/useThrottledScrub';
import { usePlaybackHotkeys } from '../composables/usePlaybackHotkeys';
import { useSliderTooltip, truncateText } from '../composables/useSliderTooltip';
import VcrButtonsRow from './VcrButtonsRow.vue';
import AnimTimelineSlider from './AnimTimelineSlider.vue';

const store         = useAnimationStore();
const speedPrefs    = useSpeedPreferences();
const scrubEngine   = useThrottledScrub();
const sliderTooltip = useSliderTooltip();
const { registerHotkeys } = usePlaybackHotkeys();

const timelineRef  = ref<InstanceType<typeof AnimTimelineSlider> | null>(null);
const isFirstFrame = computed(() => store.currentIndex === 0);
const isLastFrame  = computed(() => store.isFinished);

const playbackStateLabel = computed(() => {
  const labels: Record<string, string> = {
    UNINITIALIZED: 'Chưa khởi tạo',
    LOADED: 'Sẵn sàng',
    PLAYING: 'Đang phát',
    PAUSED: 'Tạm dừng',
    FINISHED: 'Hoàn tất',
  };
  return labels[store.playbackState] ?? store.playbackState;
});

function onCustomSpeedChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const raw = parseFloat(input.value);
  if (isNaN(raw) || raw <= 0) {
    input.value = String(store.playbackSpeed);
    return;
  }
  const clamped = Math.max(0.1, Math.min(10, Math.round(raw * 10) / 10));
  store.setSpeed(clamped);
  speedPrefs.saveSpeed(clamped);
  input.value = String(clamped);
}

const sliderProgressStyle = computed(() => {
  const percent = store.totalSteps <= 1 ? 0 : (store.currentIndex / (store.totalSteps - 1)) * 100;
  return { '--progress-percent': `${percent}%` };
});

function handleTogglePlay(): void {
  if (store.isFinished) { store.goToFrame(0); store.play(); } else { store.togglePlay(); }
}

function onScrubInput(event: Event): void {
  scrubEngine.updateScrubPosition(parseInt((event.target as HTMLInputElement).value, 10));
}

function onSliderHover(event: MouseEvent): void {
  sliderTooltip.handleSliderHover(event, timelineRef.value?.containerRef ?? null);
}

let cleanupHotkeys: (() => void) | null = null;
onMounted(() => { speedPrefs.initSpeedFromStorage(); cleanupHotkeys = registerHotkeys(); });
onBeforeUnmount(() => {
  if (cleanupHotkeys) cleanupHotkeys();
  // Hủy rAF tooltip/scrub đang chờ — tránh tick orphan thao tác store sau unmount
  sliderTooltip.dispose();
});
</script>

<style scoped>
.control-panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-bg-secondary);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  transition: opacity 0.2s ease;
}
.disabled-panel        { opacity: 0.5; pointer-events: none; }
.vcr-row               { display: flex; align-items: center; gap: 16px; flex: 1; min-height: 0; }
.speed-controls-right  { flex-shrink: 0; }

.speed-input-group {
  display: flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  padding: 4px 8px;
  transition: var(--transition-fast);
}
.speed-input-group:hover    { border-color: var(--color-accent-green); }
.speed-input-group:focus-within { border-color: var(--color-accent-green); box-shadow: 0 0 8px var(--color-accent-green-glow); }
.speed-input-group.disabled-group { opacity: 0.4; pointer-events: none; }

.speed-number-input {
  width: 42px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-size: 12px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  text-align: right;
  -moz-appearance: textfield;
}
.speed-number-input::-webkit-outer-spin-button,
.speed-number-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.speed-unit {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 500;
}


.state-indicator-row { display: flex; align-items: center; gap: 8px; }
.state-dot  { width: 8px; height: 8px; border-radius: 50%; }
.state-label { font-size: var(--text-xs); color: var(--color-text-muted); }


.state-dot--idle     { background: var(--color-text-disabled); }
.state-dot--loaded   { background: var(--color-accent-cyan); }
.state-dot--playing  { background: var(--color-accent-green); }
.state-dot--paused   { background: var(--color-accent-yellow); }
.state-dot--finished { background: var(--color-accent-green); }
</style>
