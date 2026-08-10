import { defineStore } from 'pinia';
import { shallowRef, ref, computed } from 'vue';
import type {
  FrameDTO,
  AlgorithmResult,
  PlaybackState,
} from '../types/animation.types';

const STEP_DEBOUNCE_MS = 100;
const BASE_FRAME_MS = 1000;

// ─── Counted registration cho listener `visibilitychange` (EC-017) ───
// Store là singleton được Pinia cache theo id: `destroy()` gỡ listener một chiều
// sẽ phá VĨNH VIỄN tính năng auto-pause khi ẩn tab (rời view 1 lần là mất hẳn).
// Giải pháp: gom mọi handler instance về 1 listener document duy nhất đếm tham
// chiếu — chỉ gỡ hẳn khi set rỗng; đồng thời `play()` tự đăng ký lại nếu
// `destroy()` đã gỡ trước đó → listener tự phục hồi khi store được dùng lại.
type VisibilityHandler = (event: Event) => void;

const visibilityHandlers = new Set<VisibilityHandler>();
let boundVisibilityListener: ((event: Event) => void) | null = null;

function attachVisibilityHandler(handler: VisibilityHandler): void {
  if (typeof document === 'undefined') return;
  visibilityHandlers.add(handler);
  if (boundVisibilityListener === null) {
    boundVisibilityListener = (event: Event) => {
      if (!document.hidden) return;
      for (const h of visibilityHandlers) h(event);
    };
    document.addEventListener('visibilitychange', boundVisibilityListener);
  }
}

function detachVisibilityHandler(handler: VisibilityHandler): void {
  if (typeof document === 'undefined') return;
  visibilityHandlers.delete(handler);
  if (visibilityHandlers.size === 0 && boundVisibilityListener !== null) {
    document.removeEventListener('visibilitychange', boundVisibilityListener);
    boundVisibilityListener = null;
  }
}

export function createAnimationVcrState() {
  const frames = shallowRef<FrameDTO[]>([]);
  const pseudoCode = ref<string[]>([]);
  const algorithmId = ref<string>('');

  const currentIndex = ref<number>(0);
  const isPlaying = ref<boolean>(false);
  const playbackSpeed = ref<number>(1.0);
  const interactionLocked = ref<boolean>(false);
  const loopEnabled = ref<boolean>(false);
  const stepModeEnabled = ref<boolean>(false);

  let rafId: number | null = null;
  let lastTickTime = 0;
  let accumulatedTime = 0;
  const subFrameProgress = ref<number>(0);

  let playUntilTarget: number | null = null;
  let playUntilResolver: (() => void) | null = null;

  let lastStepTime = -STEP_DEBOUNCE_MS;

  const currentFrame = computed<FrameDTO | null>(() => {
    if (frames.value.length === 0) return null;
    return frames.value[currentIndex.value] ?? null;
  });

  const isFinished = computed<boolean>(() => {
    if (frames.value.length === 0) return false;
    return currentIndex.value === frames.value.length - 1;
  });

  const totalSteps = computed<number>(() => frames.value.length);

  const progressPercent = computed<number>(() => {
    // EC-035: mảng rỗng → 0%; dataset 1 frame → đã "đỗ" ở đúng frame duy nhất
    // (frame cuối) → 100%, không hiển thị sai "không bao giờ hoàn tất".
    if (frames.value.length === 0) return 0;
    if (frames.value.length === 1) return 100;
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
    // EC-033: dataset mới KHÔNG kế thừa trạng thái loop của dataset cũ —
    // nếu dataset trước bật loop, dataset mới cũng bật theo là vô nghĩa (sai).
    loopEnabled.value = false;
  }

  function play(): void {
    if (isPlaying.value || frames.value.length === 0) return;
    if (isFinished.value) {
      // EC-004: replay từ frame 0 khi đang ở frame cuối (PRD §3.1) —
      // trước đây early-return no-op làm nút Play "chết" ở cuối animation.
      currentIndex.value = 0;
      subFrameProgress.value = 0;
      accumulatedTime = 0;
    }
    isPlaying.value = true;
    lastTickTime = performance.now();
    accumulatedTime = 0;
    // EC-017: tự phục hồi listener visibilitychange nếu `destroy()` đã gỡ —
    // Set.add là idempotent nên gọi mọi lúc cũng vô hại.
    attachVisibilityHandler(handleVisibilityChange);
    rafId = requestAnimationFrame(rafLoop);
  }

  function rafLoop(timestamp: number): void {
    if (!isPlaying.value) return;

    const delta = timestamp - lastTickTime;
    lastTickTime = timestamp;

    accumulatedTime += delta * playbackSpeed.value;

    const stepInterval = BASE_FRAME_MS;

    if (accumulatedTime >= stepInterval) {
      accumulatedTime -= stepInterval;
      if (accumulatedTime > stepInterval) accumulatedTime = 0;

      advanceFrame();
    } else {
      subFrameProgress.value = accumulatedTime / stepInterval;
    }

    if (isPlaying.value) {
      rafId = requestAnimationFrame(rafLoop);
    }
  }

  function advanceFrame(): void {
    if (isFinished.value) {
      if (loopEnabled.value && playUntilTarget === null) {
        currentIndex.value = 0;
        subFrameProgress.value = 0;
        accumulatedTime = 0;
        lastTickTime = performance.now();
      } else {
        pause();
        subFrameProgress.value = 1;
        // pause() đã resolve promise playUntil treo (EC-034) nếu có
        return;
      }
    } else {
      currentIndex.value++;
      subFrameProgress.value = 0;
    }

    if (stepModeEnabled.value) {
      pause();
      return;
    }

    if (playUntilTarget !== null && currentIndex.value >= playUntilTarget) {
      pause(); // pause() resolve promise playUntil (EC-034)
      return;
    }
  }

  function pause(): void {
    isPlaying.value = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // EC-034: mọi thao tác ngắt playback (pause/step/scrub/goToFrame) phải giải
    // phóng promise `playUntilFrame` đang treo. Trước đây nếu stepForward/scrub
    // xảy ra giữa lúc playUntil đang chờ, promise không bao giờ resolve → leak.
    if (playUntilTarget !== null) resolvePlayUntil();
  }

  function stop(): void {
    pause(); // pause đã resolve playUntil (EC-034) nếu đang chờ
    currentIndex.value = 0;
    subFrameProgress.value = 0;
  }

  function clear(): void {
    stop();
    algorithmId.value = '';
    pseudoCode.value = [];
    frames.value = [];
  }

  function stepForward(): void {
    const now = performance.now();
    if (now - lastStepTime < STEP_DEBOUNCE_MS) return;
    lastStepTime = now;

    pause();
    if (currentIndex.value < frames.value.length - 1) {
      currentIndex.value++;
      subFrameProgress.value = 0;
    }
  }

  function stepBackward(): void {
    const now = performance.now();
    if (now - lastStepTime < STEP_DEBOUNCE_MS) return;
    lastStepTime = now;

    pause();
    if (currentIndex.value > 0) {
      currentIndex.value--;
      subFrameProgress.value = 0;
    }
  }

  function scrubTo(index: number): void {
    pause();
    if (index >= 0 && index < frames.value.length) {
      currentIndex.value = index;
      subFrameProgress.value = 0;
    }
  }

  function setSpeed(speed: number): void {
    playbackSpeed.value = speed;
    if (isPlaying.value) {
      accumulatedTime = 0;
      lastTickTime = performance.now();
    }
  }

  function goToFrame(frameIndex: number): void {
    if (frameIndex >= 0 && frameIndex < frames.value.length) {
      pause();
      currentIndex.value = frameIndex;
      subFrameProgress.value = 0;
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

      if (isPlaying.value) {
        pause();
      }

      playUntilTarget = targetFrame;
      playUntilResolver = resolve;

      isPlaying.value = true;
      lastTickTime = performance.now();
      accumulatedTime = 0;
      rafId = requestAnimationFrame(rafLoop);
    });
  }

function cancelPlayUntil(): void {
  if (playUntilTarget !== null) {
    // Snapshot target TRƯỚC pause(): kể từ EC-034, pause() resolve promise và
    // gán playUntilTarget = null — đọc sau sẽ mất giá trị cần nhảy tới.
    const target = playUntilTarget;
    pause();
    subFrameProgress.value = 0;
    if (target < frames.value.length) {
      currentIndex.value = target;
    }
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

  function toggleLoop(): void {
    loopEnabled.value = !loopEnabled.value;
  }

  function toggleStepMode(): void {
    stepModeEnabled.value = !stepModeEnabled.value;
  }

  function destroy(): void {
    pause();
    // EC-017: chỉ gỡ handler của instance này; listener document duy nhất chỉ
    // bị gỡ khi KHÔNG còn store nào đăng ký (counted registration). `play()`
    // sẽ tự đăng ký lại nếu store được dùng tiếp sau destroy.
    detachVisibilityHandler(handleVisibilityChange);
  }

  function handleVisibilityChange(): void {
    if (document.hidden && isPlaying.value) {
      pause();
    }
  }

  attachVisibilityHandler(handleVisibilityChange);

  return {
    frames,
    pseudoCode,
    algorithmId,
    currentIndex,
    isPlaying,
    playbackSpeed,
    interactionLocked,
    loopEnabled,
    stepModeEnabled,
    subFrameProgress,
    currentFrame,
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
    toggleLoop,
    toggleStepMode,
    destroy,
  };
}

export const useAnimationStore = defineStore('animation', createAnimationVcrState);

export const usePlaygroundAnimationStore = defineStore('playground-animation', createAnimationVcrState);
