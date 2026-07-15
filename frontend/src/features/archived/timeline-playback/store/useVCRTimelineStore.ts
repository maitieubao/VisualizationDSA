import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import { VCRPlaybackEngine } from '../engine/VCRPlaybackEngine';
import type { PlaybackFrame, PlaybackStatus, CanvasStateSnapshot } from '../types/timeline-playback.types';
import { demoBubbleSortFrames } from './demoBubbleSortData';
import { triggerMonacoLineSync, triggerCanvasStateUpdate } from './timelineEventDispatcher';

export const useVCRTimelineStore = defineStore('vcrTimeline', () => {
  const currentStep = ref<number>(0);
  const totalSteps = ref<number>(0);
  const playbackSpeed = ref<number>(1.0);
  const status = ref<PlaybackStatus>('PAUSED');
  const currentDescription = ref<string>('Chờ nạp giải thuật');
  const currentLineNumber = ref<number>(0);
  const currentSnapshot = shallowRef<CanvasStateSnapshot | null>(null);
  const isInitialized = ref<boolean>(false);

  let engine: VCRPlaybackEngine | null = null;

  const progressPercent = computed<number>(() => {
    if (totalSteps.value <= 1) return 0;
    return (currentStep.value / (totalSteps.value - 1)) * 100;
  });

  const isPlaying = computed<boolean>(() => status.value === 'PLAYING');
  const isAtStart = computed<boolean>(() => currentStep.value === 0);
  const isAtEnd = computed<boolean>(() => totalSteps.value === 0 || currentStep.value >= totalSteps.value - 1);
  const stepLabel = computed<string>(() => totalSteps.value === 0 ? '0 / 0' : `${currentStep.value + 1} / ${totalSteps.value}`);

  function onFrameChange(frame: PlaybackFrame): void {
    currentStep.value = frame.stepIndex;
    currentDescription.value = frame.description;
    currentLineNumber.value = frame.lineNumber;
    currentSnapshot.value = frame.canvasStateSnapshot;
    triggerMonacoLineSync(frame.lineNumber);
    triggerCanvasStateUpdate(frame.canvasStateSnapshot);
    if (engine && engine.getCurrentStep() >= engine.getFrameCount() - 1) status.value = 'PAUSED';
  }

  function initializeFrames(frames: PlaybackFrame[]): void {
    if (engine) engine.destroy();
    totalSteps.value = frames.length;
    currentStep.value = 0;
    status.value = 'PAUSED';
    playbackSpeed.value = 1.0;
    isInitialized.value = true;
    engine = new VCRPlaybackEngine(onFrameChange);
    engine.setFrames(frames);
    if (frames.length > 0) engine.seekToStep(0);
  }

  function play(): void { if (engine) { engine.play(); status.value = engine.getStatus(); } }
  function pause(): void { if (engine) { engine.pause(); status.value = engine.getStatus(); } }
  function togglePlayPause(): void { if (status.value === 'PLAYING') pause(); else play(); }
  function stepForward(): void { if (engine && engine.stepForward()) status.value = engine.getStatus(); }
  function stepBack(): void { if (engine && engine.stepBack()) status.value = engine.getStatus(); }
  function rewind(): void { if (engine) { engine.rewind(); status.value = engine.getStatus(); } }
  function fastForward(): void { if (engine) { engine.fastForward(); status.value = engine.getStatus(); } }
  function seekTo(stepIndex: number): void { if (engine) engine.seekToStep(stepIndex); }
  function changeSpeed(speed: number): void { playbackSpeed.value = speed; if (engine) engine.setSpeed(speed); }

  function clearTimeline(): void {
    if (engine) { engine.destroy(); engine = null; }
    currentStep.value = 0;
    totalSteps.value = 0;
    playbackSpeed.value = 1.0;
    status.value = 'PAUSED';
    currentDescription.value = 'Giải phóng tài nguyên';
    currentLineNumber.value = 0;
    currentSnapshot.value = null;
    isInitialized.value = false;
  }

  function loadDemoBubbleSort(): void { initializeFrames(demoBubbleSortFrames); }

  return {
    currentStep, totalSteps, playbackSpeed, status, currentDescription, currentLineNumber, currentSnapshot, isInitialized,
    progressPercent, isPlaying, isAtStart, isAtEnd, stepLabel,
    initializeFrames, play, pause, togglePlayPause, stepForward, stepBack, rewind, fastForward, seekTo, changeSpeed, clearTimeline, loadDemoBubbleSort,
  };
});
