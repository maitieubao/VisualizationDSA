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

  // ── B1: breakpoint (dòng dừng tự động khi play) ──
  const breakpoints = ref<Set<number>>(new Set());

  function toggleBreakpoint(line: number): void {
    if (line <= 0) return;
    const next = new Set(breakpoints.value);
    if (next.has(line)) next.delete(line);
    else next.add(line);
    breakpoints.value = next;
  }

  function clearBreakpoints(): void {
    if (breakpoints.value.size > 0) breakpoints.value = new Set();
  }

  // ── B2: watch list (tên biến theo dõi, persist) ──
  const WATCH_KEY = 'algo-playground:watch';
  const watchList = ref<string[]>(loadWatchList());

  function loadWatchList(): string[] {
    try {
      const raw = localStorage.getItem(WATCH_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
    } catch {
      // localStorage hỏng — bỏ qua
    }
    return [];
  }

  function toggleWatchVariable(name: string): void {
    const next = watchList.value.includes(name)
      ? watchList.value.filter((n) => n !== name)
      : [...watchList.value, name];
    watchList.value = next;
    try {
      localStorage.setItem(WATCH_KEY, JSON.stringify(next));
    } catch {
      // localStorage không khả dụng — bỏ qua
    }
  }

  function clearWatchList(): void {
    watchList.value = [];
    try {
      localStorage.removeItem(WATCH_KEY);
    } catch {
      // localStorage không khả dụng — bỏ qua
    }
  }

  const currentFrame = computed<PlaybackFrame | null>(() => frames.value[currentIndex.value] ?? null);
  const currentDescription = computed<string>(() => currentFrame.value?.description ?? '');
  const currentLineNumber = computed<number>(() => currentFrame.value?.lineNumber ?? 0);
  const totalFrames = computed<number>(() => frames.value.length);

  /** B2: biến primitive của frame hiện tại (từ executor `variables` — fallback loopVariables). */
  const currentVariables = computed<Record<string, number | string | boolean>>(() => {
    const frame = currentFrame.value;
    if (frame?.canvasStateSnapshot.variables) return frame.canvasStateSnapshot.variables;
    if (frame?.canvasStateSnapshot.loopVariables) return { ...frame.canvasStateSnapshot.loopVariables };
    return {};
  });

  /** B2: biến có giá trị THAY ĐỔI so với frame trước (đánh dấu trên Watch Panel). */
  const changedVariables = computed<Set<string>>(() => {
    const idx = currentIndex.value;
    const current = frames.value[idx]?.canvasStateSnapshot.variables;
    const prev = frames.value[idx - 1]?.canvasStateSnapshot.variables;
    if (!current) return new Set();
    if (!prev) return new Set(Object.keys(current));
    const changed = new Set<string>();
    const allKeys = new Set([...Object.keys(current), ...Object.keys(prev)]);
    for (const key of allKeys) {
      if (current[key] !== prev[key]) changed.add(key);
    }
    return changed;
  });

  /** B2: giá trị các biến đang watch (chỉ các biến tồn tại trong frame). */
  const watchedValues = computed<Array<{ name: string; value: number | string | boolean; changed: boolean }>>(() => {
    const vars = currentVariables.value;
    const changed = changedVariables.value;
    return watchList.value
      .filter((name) => name in vars)
      .map((name) => ({ name, value: vars[name], changed: changed.has(name) }));
  });

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
    // AL-002: hủy compile đang chạy — nếu không, request cũ hoàn tất với seq cũ
    // sẽ bị discard mà finally không clear isCompiling → nút Chạy kẹt "Đang chạy…".
    compileEpoch++;
    isCompiling.value = false;
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
    // AL-002: báo compile đang chạy là "đã hủy" — request cũ hoàn tất sẽ không
    // clear isCompiling nữa, ta tự clear ngay để nút Chạy không kẹt vĩnh viễn.
    compileEpoch++;
    isCompiling.value = false;
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
  // AL-002: epoch của lần compile hiện tại — chỉ lần compile mới nhất được phép
  // clear isCompiling; invalidate/loadDemo bump epoch để hủy compile cũ.
  let compileEpoch = 0;

  /** Chữ ký trạng thái (demo + code + input) — tránh auto-run trùng lặp khi remount (AL-045). */
  const autoRunSignature = ref<string>('');

  function currentSignature(): string {
    return `${demoId.value ?? ''}|${code.value}|${inputRaw.value}`;
  }

  async function runAsync(): Promise<void> {
    const seq = ++runSeq;
    const epoch = ++compileEpoch;
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
      // AL-002: chỉ compile mới nhất được clear spinner — compile bị invalidate/loadDemo
      // hủy giữa chừng không được phép (invalidate đã tự clear isCompiling).
      if (epoch === compileEpoch) isCompiling.value = false;
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

  /** B1: kiểm tra dòng của frame tới có nằm trong breakpoints không — nếu có thì dừng play. */
  function shouldStopAtBreakpoint(nextIndex: number): boolean {
    if (breakpoints.value.size === 0) return false;
    const frame = frames.value[nextIndex];
    if (!frame) return false;
    return breakpoints.value.has(frame.lineNumber);
  }

  const stepNext = (): void => {
    if (frames.value.length === 0) return;
    if (currentIndex.value < frames.value.length - 1) {
      currentIndex.value++;
      // B1: dừng play khi gặp breakpoint (chỉ khi đang play tự động — bấm tay vẫn nhảy qua được).
      if (isPlaying.value && shouldStopAtBreakpoint(currentIndex.value)) {
        isPlaying.value = false;
      }
    } else isPlaying.value = false;
  };
  const stepPrev = (): void => {
    if (currentIndex.value > 0) currentIndex.value--;
  };
  const reset = (): void => {
    currentIndex.value = 0;
    isPlaying.value = false;
  };
  const jumpToFrame = (index: number): void => {
    if (index >= 0 && index < frames.value.length) {
      currentIndex.value = index;
      // B1: nhảy tới frame breakpoint khi đang play (scrub) → dừng để người dùng quan sát.
      if (isPlaying.value && shouldStopAtBreakpoint(index)) {
        isPlaying.value = false;
      }
    }
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
    currentVariables,
    changedVariables,
    watchedValues,
    breakpoints,
    watchList,
    toggleBreakpoint,
    clearBreakpoints,
    toggleWatchVariable,
    clearWatchList,
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
