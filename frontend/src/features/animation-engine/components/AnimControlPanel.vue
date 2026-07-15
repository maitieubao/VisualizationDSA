<template>
  <div class="control-panel-container" :class="{ 'disabled-panel': store.interactionLocked }">
    <!-- VCR Controls Row -->
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
        @hover="onSliderHover"
        @leave="sliderTooltip.hideTooltip()"
        @scrub-start="scrubEngine.startScrub()"
        @scrub-input="onScrubInput"
        @scrub-end="scrubEngine.endScrub()"
        ref="timelineRef"
      />

      <!-- Speed Dropdown -->
      <div class="speed-controls-right">
        <select v-model.number="playbackSpeedModel" class="speed-select-dropdown" :disabled="store.interactionLocked">
          <option v-for="speed in SPEED_PRESETS" :key="speed" :value="speed">
            {{ speed }}x{{ speed === 1.0 ? ' (Mặc định)' : '' }}
          </option>
        </select>
      </div>
    </div>

    <!-- State indicator row -->
    <div class="state-indicator-row">
      <span class="state-dot" :class="{
        'state-dot--idle':     store.playbackState === 'UNINITIALIZED',
        'state-dot--loaded':   store.playbackState === 'LOADED',
        'state-dot--playing animate-pulse': store.playbackState === 'PLAYING',
        'state-dot--paused':   store.playbackState === 'PAUSED',
        'state-dot--finished': store.playbackState === 'FINISHED',
      }" />
      <span class="state-label">{{ store.playbackState }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useAnimationStore } from '../store/useAnimationStore';
import { SPEED_PRESETS, useSpeedPreferences } from '../composables/useSpeedPreferences';
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

const playbackSpeedModel = computed({
  get: () => store.playbackSpeed,
  set: (val: number) => { store.setSpeed(val); speedPrefs.saveSpeed(val); },
});

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
onBeforeUnmount(() => { if (cleanupHotkeys) cleanupHotkeys(); });
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

.speed-select-dropdown {
  padding: 6px 10px;
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: var(--transition-fast);
}
.speed-select-dropdown:hover    { border-color: var(--color-accent-green); color: var(--color-accent-green); }
.speed-select-dropdown:focus    { border-color: var(--color-accent-green); box-shadow: 0 0 8px var(--color-accent-green-glow); }
.speed-select-dropdown:disabled { opacity: 0.4; cursor: not-allowed; }

/* State indicator */
.state-indicator-row { display: flex; align-items: center; gap: 8px; }
.state-dot  { width: 8px; height: 8px; border-radius: 50%; }
.state-label { font-size: var(--text-xs); color: var(--color-text-muted); }

/* State-specific dot colors — semantic, không phụ thuộc theme */
.state-dot--idle     { background: var(--color-text-disabled); }
.state-dot--loaded   { background: var(--color-accent-cyan); }
.state-dot--playing  { background: var(--color-accent-green); }
.state-dot--paused   { background: var(--color-accent-yellow); }
.state-dot--finished { background: var(--color-accent-green); }
</style>
