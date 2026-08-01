import { defineStore } from 'pinia';
import { shallowRef, ref, computed } from 'vue';
import type {
  FrameDTO,
  AlgorithmResult,
  PlaybackState,
} from '@/features/core-learning/animation-engine/types/animation.types';





export const useAnimationStore = defineStore('animation', () => {
  
  
  

  const frames = shallowRef<FrameDTO[]>([]);
  const pseudoCode = ref<string[]>([]);
  const algorithmId = ref<string>('');

  const currentIndex = ref<number>(0);
  const isPlaying = ref<boolean>(false);
  const playbackSpeed = ref<number>(1.0);
  let timerId: number | null = null;
  
  const timeline = shallowRef<any | null>(null);
  const currentTime = ref(0);
  const speed = ref(1);

  
  const interactionLocked = ref<boolean>(false);














  function loadTimeline(tl: any) {
    timeline.value = tl;
    currentTime.value = 0;
    
    frames.value = [];
    currentIndex.value = 0;
  }

  let playUntilTarget: number | null = null;
  let playUntilResolver: (() => void) | null = null;

  
  
  

  const currentFrame = computed<FrameDTO | null>(() => {
    if (frames.value.length === 0) return null;
    return frames.value[currentIndex.value] ?? null;
  });

  const activeFrame = currentFrame;

  const isFinished = computed<boolean>(() => {
    if (frames.value.length === 0) return false;
    return currentIndex.value === frames.value.length - 1;
  });

  const totalSteps = computed<number>(() => frames.value.length);

  const progressPercent = computed<number>(() => {
    if (frames.value.length <= 1) return 0;
    return (currentIndex.value / (frames.value.length - 1)) * 100;
  });

  const playbackState = computed<PlaybackState>(() => {
    if (frames.value.length === 0) return 'UNINITIALIZED';
    if (isFinished.value && !isPlaying.value) return 'FINISHED';
    if (isPlaying.value) return 'PLAYING';
    return currentIndex.value === 0 ? 'LOADED' : 'PAUSED';
  });

  
  
  

  function loadResult(result: AlgorithmResult): void {
    stop();
    algorithmId.value = result.algorithmId;
    pseudoCode.value = result.pseudoCode;
    frames.value = result.frames;
    currentIndex.value = 0;
  }

  function play(): void {
    if (isPlaying.value || isFinished.value) return;
    isPlaying.value = true;
    tick();
  }

  function tick(): void {
    if (!isPlaying.value) return;
    if (isFinished.value) {
      pause();
      resolvePlayUntil();
      return;
    }

    currentIndex.value++;

    if (playUntilTarget !== null && currentIndex.value >= playUntilTarget) {
      pause();
      resolvePlayUntil();
      return;
    }

    const baseDelay = 1000;
    const currentDelay = baseDelay / playbackSpeed.value;

    timerId = setTimeout(() => {
      tick();
    }, currentDelay) as unknown as number;
  }

  function pause(): void {
    isPlaying.value = false;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function stop(): void {
    pause();
    currentIndex.value = 0;
  }

  function clear(): void {
    stop();
    algorithmId.value = '';
    pseudoCode.value = [];
    frames.value = [];
  }

  function stepForward(): void {
    pause();
    if (currentIndex.value < frames.value.length - 1) {
      currentIndex.value++;
    }
  }

  function stepBackward(): void {
    pause();
    if (currentIndex.value > 0) {
      currentIndex.value--;
    }
  }

  function scrubTo(index: number): void {
    pause();
    if (index >= 0 && index < frames.value.length) {
      currentIndex.value = index;
    }
  }

  function setSpeed(speed: number): void {
    playbackSpeed.value = speed;
    if (isPlaying.value) {
      pause();
      play();
    }
  }

  function goToFrame(frameIndex: number): void {
    if (frameIndex >= 0 && frameIndex < frames.value.length) {
      pause();
      currentIndex.value = frameIndex;
    }
  }

  function playUntilFrame(targetFrame: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (frames.value.length === 0 || targetFrame >= frames.value.length) {
        resolve();
        return;
      }

      if (currentIndex.value >= targetFrame) {
        goToFrame(targetFrame);
        resolve();
        return;
      }

      playUntilTarget = targetFrame;
      playUntilResolver = resolve;

      isPlaying.value = true;
      tick();
    });
  }

  function cancelPlayUntil(): void {
    if (playUntilTarget !== null) {
      pause();
      if (playUntilTarget < frames.value.length) {
        currentIndex.value = playUntilTarget;
      }
      resolvePlayUntil();
    }
  }

  function resolvePlayUntil(): void {
    playUntilTarget = null;
    if (playUntilResolver) {
      const resolver = playUntilResolver;
      playUntilResolver = null;
      resolver();
    }
  }

  function togglePlay(): void {
    if (isPlaying.value) {
      pause();
    } else {
      play();
    }
  }

  function setInteractionLocked(locked: boolean): void {
    interactionLocked.value = locked;
  }

  return {
    frames,
    pseudoCode,
    algorithmId,
    currentIndex,
    isPlaying,
    playbackSpeed,
    interactionLocked,
    currentFrame,
    activeFrame,
    isFinished,
    totalSteps,
    progressPercent,
    playbackState,
    loadResult,
    play,
    pause,
    stop,
    clear,
    stepForward,
    stepBackward,
    scrubTo,
    setSpeed,
    goToFrame,
    togglePlay,
    playUntilFrame,
    cancelPlayUntil,
    setInteractionLocked,
  };
});
