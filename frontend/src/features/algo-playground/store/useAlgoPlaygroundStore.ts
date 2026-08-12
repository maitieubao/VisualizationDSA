import { defineStore } from 'pinia';
import { ref, computed, shallowRef, watch } from 'vue';
import type { PlaybackFrame } from '../../../core/CompilerStepExecutor';
import { compileInWorker } from '../../../core/compileWorker';
import { AlgoInputParser, type AlgoInputKind } from '../engine/AlgoInputParser';
import { getAlgoDemo } from '../engine/playgroundAlgoDemos';
import { translateCompileError } from '../engine/compileErrorTranslator';

export type AlgoRenderMode = 'array' | 'tree' | 'graph';

const STORAGE_KEY = 'algo-playground:state';
const STORAGE_VERSION = 1;

interface PersistedPlaygroundState {
  version: number;
  demoId?: string | null;
  code?: string;
  inputRaw?: string;
}

export interface InputValidationInfo {
  valid: boolean;
  message: string;
}

export const useAlgoPlaygroundStore = defineStore('algo-playground', () => {
  const demoId = ref<string | null>(null);
  const code = ref<string>('');
  const inputKind = ref<AlgoInputKind>('array');
  const inputRaw = ref<string>('');
  const frames = shallowRef<PlaybackFrame[]>([]);
  const currentIndex = ref<number>(0);
  const isPlaying = ref<boolean>(false);
  const isCompiling = ref<boolean>(false);
  const playbackSpeed = ref<number>(1);
  const compileError = ref<string | null>(null);

  const currentFrame = computed<PlaybackFrame | null>(() => frames.value[currentIndex.value] ?? null);
  const currentDescription = computed<string>(() => currentFrame.value?.description ?? '');
  const currentLineNumber = computed<number>(() => currentFrame.value?.lineNumber ?? 0);
  const totalFrames = computed<number>(() => frames.value.length);

  const renderMode = computed<AlgoRenderMode>(() => {
    const snapshot = frames.value[0]?.canvasStateSnapshot;
    if (!snapshot) return 'array';
    if ((snapshot.treeNodes?.length ?? 0) > 0) return 'tree';
    if ((snapshot.graphNodes?.length ?? 0) > 0) return 'graph';
    if (snapshot.heapState) return 'tree'; // Heap Sort: layout cây heap + dải mảng
    return 'array';
  });

  /** Lịch sử trace: description các frame có sự kiện thật (bỏ frame "Đang chạy dòng N" rác). */
  const traceLogs = computed<string[]>(() => {
    const end = Math.min(currentIndex.value + 1, frames.value.length);
    const logs: string[] = [];
    for (let i = 0; i < end; i++) {
      const frame = frames.value[i];
      const desc = frame?.description ?? '';
      if (desc && !/^Đang chạy dòng \d+$/.test(desc)) {
        logs.push(frame.lineNumber > 0 ? `L${frame.lineNumber}: ${desc}` : desc);
      }
    }
    return logs.slice(-200);
  });

  /** Phản hồi live cho input (parse ngay khi gõ, trước khi bấm Chạy). */
  const inputValidation = computed<InputValidationInfo>(() => {
    if (inputRaw.value.trim().length === 0) {
      return { valid: true, message: 'Input trống' };
    }
    try {
      const options = AlgoInputParser.parse(inputRaw.value, inputKind.value);
      const count = options.array?.length ?? options.treeNodes?.length ?? options.graphNodes?.length ?? 0;
      // AL-044: input không rỗng nhưng parse ra 0 phần tử (vd ", ,") → invalid rõ ràng
      if (count === 0) {
        return { valid: false, message: 'Không có phần tử hợp lệ' };
      }
      return { valid: true, message: `${count} phần tử` };
    } catch (err: unknown) {
      return { valid: false, message: err instanceof Error ? err.message : String(err) };
    }
  });

  /** Các bước quan trọng (swap / tìm thấy) để đánh dấu trên scrubber. */
  const notableSteps = computed<Array<{ index: number; label: string }>>(() => {
    const out: Array<{ index: number; label: string }> = [];
    const total = frames.value.length;
    if (total === 0) return out;
    for (let i = 0; i < total; i++) {
      const snap = frames.value[i]?.canvasStateSnapshot;
      if (!snap) continue;
      if (snap.swappingIndices) {
        out.push({ index: i, label: 'swap' });
      } else if (snap.searchFound && snap.foundIndex !== undefined && snap.foundIndex >= 0) {
        out.push({ index: i, label: 'found' });
      }
    }
    // Giới hạn 15 marker, lấy đều trên timeline để tránh dày đặc
    if (out.length > 15) {
      const step = out.length / 15;
      return out.filter((_, i) => i % Math.ceil(step) === 0).slice(0, 15);
    }
    return out;
  });

  // ── Persist code/input qua localStorage ──
  function persistState(): void {
    try {
      const payload: PersistedPlaygroundState = {
        version: STORAGE_VERSION,
        demoId: demoId.value,
        code: code.value,
        inputRaw: inputRaw.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage không khả dụng (private mode...) — bỏ qua
    }
  }
  watch([demoId, code, inputRaw], persistState);

  function restoreState(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedPlaygroundState>;
      // Schema version cũ → bỏ qua, dùng mặc định (tránh migrate dữ liệu lỗi thời)
      if (parsed.version !== STORAGE_VERSION) return;
      if (typeof parsed.code === 'string' && parsed.code.length > 0) {
        code.value = parsed.code;
        if (typeof parsed.inputRaw === 'string') inputRaw.value = parsed.inputRaw;
        if (parsed.demoId) applyExternalDemo(parsed.demoId);
      }
    } catch {
      // Dữ liệu persist hỏng — bỏ qua, dùng mặc định
    }
  }
  restoreState();

  /** Đặt demoId + inputKind tương ứng (không đụng code/input — dùng khi restore trạng thái). */
  function applyExternalDemo(id: string): void {
    const demo = getAlgoDemo(id);
    if (!demo) return;
    demoId.value = demo.id;
    inputKind.value = demo.inputKind;
  }

  function loadDemo(id: string): void {
    const demo = getAlgoDemo(id);
    if (!demo) return;
    // AL-004: đổi demo giữa lúc compile → hủy kết quả cũ + không auto-play bất ngờ
    runSeq++;
    pendingPlayAfterCompile = false;
    demoId.value = demo.id;
    code.value = demo.code;
    inputKind.value = demo.inputKind;
    inputRaw.value = demo.defaultInput;
    frames.value = [];
    currentIndex.value = 0;
    isPlaying.value = false;
    compileError.value = null;
  }

  function setCode(newCode: string): void {
    code.value = newCode;
  }

  function setInput(raw: string): void {
    inputRaw.value = raw;
    // AL-005: sửa input → invalidate (giống setCode) — bấm Play không phát frames cũ
    invalidate();
  }

  function invalidate(): void {
    // AL-004: code/input đã đổi → hủy mọi kết quả compile cũ đang chờ
    runSeq++;
    pendingPlayAfterCompile = false;
    frames.value = [];
    currentIndex.value = 0;
    isPlaying.value = false;
    compileError.value = null;
  }

  function run(): void {
    void runAsync();
  }

  // Chạy biên dịch bất đồng bộ trong Web Worker — không chặn UI.
  // Nếu worker không khả dụng (môi trường test/SSR), fallback về đồng bộ.
  let runSeq = 0;
  let pendingPlayAfterCompile = false;

  /** Chữ ký trạng thái (demo + code + input) — tránh auto-run trùng lặp khi remount (AL-045). */
  const autoRunSignature = ref<string>('');

  function currentSignature(): string {
    return `${demoId.value ?? ''}|${code.value}|${inputRaw.value}`;
  }

  async function runAsync(): Promise<void> {
    const seq = ++runSeq;
    // AL-019: dừng playback NGAY đầu compile — engine không advance frames cũ trong nền
    isPlaying.value = false;
    currentIndex.value = 0;
    autoRunSignature.value = currentSignature();
    compileError.value = null;
    isCompiling.value = true;
    try {
      const options = AlgoInputParser.parse(inputRaw.value, inputKind.value);
      // AL-044: input parse rỗng (input trống / ", ,") → chặn chạy, lỗi rõ ràng
      const parsedCount = options.array?.length ?? options.treeNodes?.length ?? options.graphNodes?.length ?? 0;
      if (parsedCount === 0) {
        pendingPlayAfterCompile = false;
        compileError.value = 'Input trống — hãy nhập dữ liệu (phân cách bằng dấu phẩy) để chạy mô phỏng.';
        frames.value = [];
        return;
      }
      const result = await compileInWorker(code.value, [], { ...options, fallbackToRegex: false });
      if (seq !== runSeq) return; // có lần run() mới hơn — bỏ kết quả cũ
      frames.value = result;
      currentIndex.value = 0;
      isPlaying.value = false;
      if (pendingPlayAfterCompile) {
        pendingPlayAfterCompile = false;
        isPlaying.value = true;
      }
    } catch (err: unknown) {
      if (seq !== runSeq) return;
      pendingPlayAfterCompile = false;
      // AL-012: error path không treo nút pause với timeline rỗng
      isPlaying.value = false;
      const message = err instanceof Error ? err.message : String(err);
      compileError.value = translateCompileError(message);
      frames.value = [];
      currentIndex.value = 0;
    } finally {
      if (seq === runSeq) isCompiling.value = false;
    }
  }

  const play = (): void => {
    if (frames.value.length === 0) {
      pendingPlayAfterCompile = true;
      run();
    }
    if (frames.value.length > 0) {
      if (currentIndex.value >= frames.value.length - 1) {
        currentIndex.value = 0;
      }
      isPlaying.value = true;
    }
  };
  const pause = (): void => {
    isPlaying.value = false;
  };
  const togglePlay = (): void => {
    isPlaying.value ? pause() : play();
  };

  const stepNext = (): void => {
    if (frames.value.length === 0) return;
    if (currentIndex.value < frames.value.length - 1) currentIndex.value++;
    else isPlaying.value = false;
  };
  const stepPrev = (): void => {
    if (currentIndex.value > 0) currentIndex.value--;
  };
  const reset = (): void => {
    currentIndex.value = 0;
    isPlaying.value = false;
  };
  const jumpToFrame = (index: number): void => {
    if (index >= 0 && index < frames.value.length) currentIndex.value = index;
  };

  // AL-040: action thay cho mutation trực tiếp store.playbackSpeed từ component
  function setPlaybackSpeed(speed: number): void {
    playbackSpeed.value = speed;
  }

  return {
    demoId,
    code,
    inputKind,
    inputRaw,
    frames,
    currentIndex,
    isPlaying,
    isCompiling,
    playbackSpeed,
    compileError,
    currentFrame,
    currentDescription,
    currentLineNumber,
    totalFrames,
    renderMode,
    traceLogs,
    inputValidation,
    notableSteps,
    autoRunSignature,
    applyExternalDemo,
    loadDemo,
    setCode,
    setInput,
    invalidate,
    run,
    play,
    pause,
    togglePlay,
    stepNext,
    stepPrev,
    reset,
    jumpToFrame,
    setPlaybackSpeed,
  };
});
