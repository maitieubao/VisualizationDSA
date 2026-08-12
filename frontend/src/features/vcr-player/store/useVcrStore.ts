import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';
import { CompilerStepExecutor, type PlaybackFrame, type CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';
import { DEFAULT_BUBBLE_SORT_CODE, DEFAULT_INPUT_RAW, DEFAULT_INPUT_ARRAY } from './vcrDefaults';
import { useToastStore } from '../../../composables/useToast';

const STEP_DEBOUNCE_MS = 100; // EC-005: chống spam step — tham chiếu useAnimationStore.ts:9


export interface VcrBaseFrame {
  stepIndex: number;
  lineNumber?: number;
  description?: string;
  /** Snapshot canvas do CompilerStepExecutor sinh (chỉ frame playback code-to-visualization có). */
  canvasStateSnapshot?: CanvasStateSnapshot;
}









export const useVcrStore = defineStore('vcr-player', () => {
  const toastStore = useToastStore();
  // EC-049: `code` là API public (CodeEditor/PseudocodePanel + 30+ chỗ test dùng),
  // `sourceCode` chỉ là alias nội bộ — đảo thứ tự cho rõ vai trò.
  const code = ref<string>(DEFAULT_BUBBLE_SORT_CODE);

  const sourceCode = code;

  
  const rawInputArray = ref<string>(DEFAULT_INPUT_RAW);
  const inputArray = computed<number[]>(() =>
    rawInputArray.value.split(',').map(num => parseInt(num.trim(), 10)).filter(num => !isNaN(num))
  );

  
  const playbackFrames     = shallowRef<VcrBaseFrame[]>([]);
  const currentFrameIndex  = ref<number>(0);
  const isPlaying          = ref<boolean>(false);
  const playbackSpeed      = ref<number>(1); 
  // EC-037: dead flag tạm thời — chưa có UI toggle để bật/tắt, chỉ test gán trực tiếp.
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
  const isAtEnd            = computed(() => currentFrameIndex.value === totalFrames.value - 1);

  // EC-010: tự heal index khi dataset thay đổi (xóa frames / nạp frames mới mà không reset index)
  watch(playbackFrames, () => {
    if (currentFrameIndex.value >= playbackFrames.value.length || currentFrameIndex.value < 0) {
      currentFrameIndex.value = 0;
    }
  });

  
  const customCompileFn = ref<(() => void) | null>(null);

  // SV-034: action thay cho mutation trực tiếp rawInputArray — mọi chủ thể ghi input đều qua đây
  const setRawInputArray = (value: string) => { rawInputArray.value = value; };

  
  const compileAndLoad = () => {
    compilationError.value = null;
    isPlaying.value = false; // EC-011: ép dừng play TRƯỚC nhánh customCompileFn (nhánh này thoát sớm)
    try {
      if (customCompileFn.value) {
        // EC-050: HỢP ĐỒNG customCompileFn — host phải tự reset currentFrameIndex
        // (mẫu `useSortingAnimation.ts:83` gọi `recompileForAlgo` → index về 0).
        // Nhánh này KHÔNG reset index vì host nắm quyền sinh frames; nếu host
        // quên reset, watch heal (EC-010) chỉ kích hoạt khi frames vượt biên.
        customCompileFn.value();
        return { success: true, frameCount: playbackFrames.value.length };
      }
      const arr = inputArray.value.length > 0 ? inputArray.value : DEFAULT_INPUT_ARRAY;
      const frames = CompilerStepExecutor.compileAlgorithm(sourceCode.value, arr);
      playbackFrames.value     = frames;
      currentFrameIndex.value  = 0;
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
    if (playbackFrames.value.length > 0) {
      // EC-003: ở frame cuối, bấm Play = Replay từ frame 0 (PRD §3.1)
      if (isAtEnd.value && !isPlaying.value) currentFrameIndex.value = 0;
      isPlaying.value = true;
    } else if (compilationError.value) {
      // EC-024: thay alert() native bằng toast (mẫu DSAPlayer.vue — toastStore.error)
      toastStore.error(compilationError.value, 'Lỗi biên dịch code');
    }
  };
  const pause  = () => { isPlaying.value = false; };
  const togglePlay = () => { isPlaying.value ? pause() : play(); };

  // Lõi advance dùng riêng cho ticker (advanceFrame KHÔNG pause — ngược với stepNext của user)
  const advanceFrame = () => {
    if (playbackFrames.value.length === 0) return;
    if (currentFrameIndex.value < playbackFrames.value.length - 1) {
      currentFrameIndex.value++;
    } else if (isLooping.value) {
      currentFrameIndex.value = 0;
    } else {
      isPlaying.value = false;
    }
  };

  let lastStepTime = -STEP_DEBOUNCE_MS; // EC-005: mốc debounce 100ms

  const stepNext = () => {
    if (playbackFrames.value.length === 0) return;
    isPlaying.value = false; // EC-002: ép pause ngay đầu hàm (BEHAVIOR_SPEC §3)
    const now = performance.now();
    if (now - lastStepTime < STEP_DEBOUNCE_MS) return; // EC-005: loại bỏ lượt bấm spam
    lastStepTime = now;
    advanceFrame();
  };

  const stepPrev     = () => {
    if (playbackFrames.value.length === 0) return;
    isPlaying.value = false; // EC-002: ép pause (BEHAVIOR_SPEC §3)
    const now = performance.now();
    if (now - lastStepTime < STEP_DEBOUNCE_MS) return; // EC-005
    lastStepTime = now;
    if (currentFrameIndex.value > 0) currentFrameIndex.value--;
  };
  const reset        = () => { stopTimer(); currentFrameIndex.value = 0; isPlaying.value = false; };
  const jumpToFrame  = (index: number) => {
    // EC-001: dừng ticker trước khi set index — tránh race giữa interval và store mutation
    isPlaying.value = false;
    if (index >= 0 && index < playbackFrames.value.length) currentFrameIndex.value = index;
  };

  
  let timerId: ReturnType<typeof setInterval> | null = null;
  const stopTimer  = () => { if (timerId !== null) { clearInterval(timerId); timerId = null; } };
  const startTimer = () => {
    stopTimer();
    // EC-006: clamp tốc độ 0.1x–5.0x (phase2 §2) — tránh 1000/0=Infinity kẹt interval hoặc NaN quét frames
    const speed = Number.isFinite(playbackSpeed.value) ? Math.min(5, Math.max(0.1, playbackSpeed.value)) : 1;
    // Lõi ticker phải dùng advanceFrame (không pause) — stepNext ép pause nên không dùng cho interval
    timerId = setInterval(advanceFrame, 1000 / speed);
  };

  watch([isPlaying, playbackSpeed], ([newPlaying]) => { newPlaying ? startTimer() : stopTimer(); });

  
  return {
    sourceCode, code, rawInputArray, inputArray, playbackFrames, currentFrameIndex,
    isPlaying, playbackSpeed, isLooping, compilationError,
    currentFrame, currentLineNumber, totalFrames, isAtStart, isAtEnd,
    customCompileFn, compileAndLoad, play, pause, togglePlay,
    stepNext, stepPrev, reset, jumpToFrame, setRawInputArray,
  };
});
