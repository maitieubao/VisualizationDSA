<template>
  <div class="h-full flex flex-col gap-3 overflow-hidden">
    <ConcurrencyScenarioToolbar
      :selected-scenario-id="store.selectedScenarioId"
      :scenario-list="store.scenarioList"
      :scenario-description="store.activeScenario?.description ?? ''"
      :mutex-enabled="store.mutexEnabled"
      @scenario-change="store.initializeScenario"
      @toggle-mutex="store.setMutexEnabled(!store.mutexEnabled)"
    />

    <!-- Main Content: Canvas + Pseudocode -->
    <div class="flex-1 min-h-0 grid grid-cols-3 gap-3">
      <div class="col-span-2 min-h-0" data-tour-id="thread-rails-canvas">
        <ThreadRailsCanvas
          :threads="store.threads"
          :locks="store.locks"
          :shared-counter="store.sharedCounter"
          :is-deadlocked="store.isDeadlocked"
          :deadlocked-thread-ids="store.deadlockedThreadIds"
        />
      </div>
      <div class="col-span-1 min-h-0 bg-bg-secondary rounded-xl border border-border-subtle overflow-hidden flex flex-col" data-tour-id="concurrency-pseudocode">
        <div class="px-3 py-2 border-b border-border-subtle bg-bg-surface/50">
          <span class="text-[10px] text-text-secondary uppercase tracking-wider">Mã giả đa luồng</span>
        </div>
        <div class="flex-1 overflow-auto p-3">
          <pre class="text-[11px] text-text-secondary font-mono leading-relaxed whitespace-pre-wrap">{{ store.activeScenario?.pseudocode ?? '' }}</pre>
        </div>
      </div>
    </div>

    <ConcurrencyPlaybackBar
      data-tour-id="concurrency-playback-bar"
      :step-index="store.currentStepIndex"
      :total-steps="store.totalSteps"
      :progress-percent="store.progressPercent"
      :is-playing="store.isPlaying"
      :is-deadlocked="store.isDeadlocked"
      :playback-mode="store.playbackMode"
      :play-speed="store.playSpeed"
      @stop="store.stopSimulation()"
      @step-backward="store.stepBackward()"
      @step-forward="store.stepForward()"
      @toggle-play="store.togglePlayPause()"
      @scrub="store.scrubToStep"
      @speed-change="store.setSpeed"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useConcurrencyStore } from '../store/useConcurrencyStore';
import ThreadRailsCanvas from './ThreadRailsCanvas.vue';
import ConcurrencyScenarioToolbar from './ConcurrencyScenarioToolbar.vue';
import ConcurrencyPlaybackBar from './ConcurrencyPlaybackBar.vue';

const store = useConcurrencyStore();

function handleKeydown(e: KeyboardEvent): void {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;
  switch (e.code) {
    case 'Space': e.preventDefault(); store.togglePlayPause(); break;
    case 'ArrowRight': e.preventDefault(); store.stepForward(); break;
    case 'ArrowLeft': e.preventDefault(); store.stepBackward(); break;
    case 'KeyR': e.preventDefault(); store.stopSimulation(); break;
  }
}

onMounted(() => { store.initializeScenario('race-condition'); window.addEventListener('keydown', handleKeydown); });
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); store.cleanup(); });
</script>
