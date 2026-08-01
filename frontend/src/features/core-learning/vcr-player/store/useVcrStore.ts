import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';
import { CompilerStepExecutor, type PlaybackFrame } from '@/core/CompilerStepExecutor';
import { DEFAULT_BUBBLE_SORT_CODE } from './vcrDefaults';


export interface VcrBaseFrame {
  stepIndex: number;
  lineNumber?: number;
  description?: string;
}









export const useVcrStore = defineStore('vcr-player', () => {
  
  const sourceCode = ref<string>(DEFAULT_BUBBLE_SORT_CODE);
  
  const code = sourceCode;

  
  const rawInputArray = ref<string>('45, 12, 85, 32, 9, 60');
  const inputArray = computed<number[]>(() =>
    rawInputArray.value.split(',').map(num => parseInt(num.trim(), 10)).filter(num => !isNaN(num))
  );

  
  const playbackFrames     = shallowRef<VcrBaseFrame[]>([]);
  const currentFrameIndex  = ref<number>(0);
  const isPlaying          = ref<boolean>(false);
  const playbackSpeed      = ref<number>(1); 
  const isLooping          = ref<boolean>(false);
  const compilationError   = ref<string | null>(null);

  
  const currentFrame = computed<VcrBaseFrame | null>(() => {
    if (playbackFrames.value.length === 0) return null;
    const idx = currentFrameIndex.value;
    if (idx < 0 || idx >= playbackFrames.value.length) return null;
    return playbackFrames.value[idx];
  });

  const currentLineNumber  = computed<number>(() => currentFrame.value?.lineNumber ?? 0);
  const totalFrames        = computed(() => playbackFrames.value.length);
  const isAtStart          = computed(() => currentFrameIndex.value === 0);
  const isAtEnd            = computed(() => currentFrameIndex.value >= totalFrames.value - 1);

  
  const customCompileFn = ref<(() => void) | null>(null);

  
  const compileAndLoad = () => {
    compilationError.value = null;
    try {
      if (customCompileFn.value) {
        customCompileFn.value();
        return { success: true, frameCount: playbackFrames.value.length };
      }
      const arr = inputArray.value.length > 0 ? inputArray.value : [45, 12, 85, 32, 9, 60];
      const frames = CompilerStepExecutor.compileAlgorithm(sourceCode.value, arr);
      playbackFrames.value     = frames;
      currentFrameIndex.value  = 0;
      isPlaying.value          = false;
      return { success: true, frameCount: frames.length };
    } catch (err: unknown) {
      console.error('[VcrStore] Lỗi biên dịch mã giả:', err);
      const message = err instanceof Error ? err.message : String(err);
      compilationError.value = message;
      return { success: false, error: message };
    }
  };

  const play   = () => { 
    if (playbackFrames.value.length === 0) compileAndLoad(); 
    if (playbackFrames.value.length > 0) isPlaying.value = true; 
    else if (compilationError.value) {
      alert("LỖI BIÊN DỊCH CODE:\n\n" + compilationError.value);
    }
  };
  const pause  = () => { isPlaying.value = false; };
  const togglePlay = () => { isPlaying.value ? pause() : play(); };

  const stepNext = () => {
    if (playbackFrames.value.length === 0) return;
    if (currentFrameIndex.value < playbackFrames.value.length - 1) currentFrameIndex.value++;
    else if (isLooping.value) currentFrameIndex.value = 0;
    else isPlaying.value = false;
  };

  const stepPrev     = () => { if (playbackFrames.value.length > 0 && currentFrameIndex.value > 0) currentFrameIndex.value--; };
  const reset        = () => { currentFrameIndex.value = 0; isPlaying.value = false; };
  const jumpToFrame  = (index: number) => { if (index >= 0 && index < playbackFrames.value.length) currentFrameIndex.value = index; };

  
  let timerId: ReturnType<typeof setInterval> | null = null;
  const stopTimer  = () => { if (timerId !== null) { clearInterval(timerId); timerId = null; } };
  const startTimer = () => { stopTimer(); timerId = setInterval(stepNext, 1000 / playbackSpeed.value); };

  watch([isPlaying, playbackSpeed], ([newPlaying]) => { newPlaying ? startTimer() : stopTimer(); });

  
  return {
    sourceCode, code, rawInputArray, inputArray, playbackFrames, currentFrameIndex,
    isPlaying, playbackSpeed, isLooping, compilationError,
    currentFrame, currentLineNumber, totalFrames, isAtStart, isAtEnd,
    customCompileFn, compileAndLoad, play, pause, togglePlay,
    stepNext, stepPrev, reset, jumpToFrame,
  };
});
