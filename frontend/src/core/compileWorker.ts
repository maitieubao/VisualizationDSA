import type { CompileOptions, PlaybackFrame } from './CompilerStepExecutor';

interface CompileWorkerRequest {
  requestId: number;
  sourceCode: string;
  initialArray: number[];
  options?: CompileOptions;
}

interface CompileWorkerResponse {
  requestId: number;
  ok: boolean;
  frames?: PlaybackFrame[];
  error?: string;
}

interface PendingRequest {
  resolve: (frames: PlaybackFrame[]) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/** Thời gian tối đa cho một lần biên dịch trong worker (ms). */
export const COMPILE_TIMEOUT_MS = 15000;

let worker: Worker | null = null;
let requestCounter = 0;
const pendingRequests = new Map<number, PendingRequest>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' });

  // Handler cố định gán 1 lần: response được định tuyến theo requestId,
  // nhiều request song song (algo-playground + vcr-player) không giẫm lên nhau.
  worker.onmessage = (event: MessageEvent<CompileWorkerResponse>) => {
    const pending = pendingRequests.get(event.data.requestId);
    if (!pending) return;
    pendingRequests.delete(event.data.requestId);
    clearTimeout(pending.timer);
    if (event.data.ok && event.data.frames) {
      pending.resolve(event.data.frames);
    } else {
      pending.reject(new Error(event.data.error ?? 'Lỗi không xác định khi biên dịch.'));
    }
  };

  worker.onerror = (event: ErrorEvent) => {
    const message = event.message || 'Lỗi không xác định khi biên dịch.';
    for (const pending of pendingRequests.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error(message));
    }
    pendingRequests.clear();
  };

  return worker;
}

/**
 * Biên dịch code thuật toán trong Web Worker (không chặn UI).
 * Nếu vượt quá timeout, worker được terminate và mọi request đang chờ bị reject
 * — đây là "kill switch" cuối cùng chống code treo vô hạn.
 */
export function compileInWorker(
  sourceCode: string,
  initialArray: number[],
  options?: CompileOptions,
  timeoutMs: number = COMPILE_TIMEOUT_MS,
): Promise<PlaybackFrame[]> {
  return new Promise<PlaybackFrame[]>((resolve, reject) => {
    const requestId = ++requestCounter;
    const target = getWorker();

    const timer = setTimeout(() => {
      const message = `Hết thời gian biên dịch (${timeoutMs / 1000}s). Code quá nặng hoặc có vòng lặp vô hạn!`;
      for (const pending of pendingRequests.values()) {
        clearTimeout(pending.timer);
        pending.reject(new Error(message));
      }
      pendingRequests.clear();
      target.terminate();
      worker = null;
    }, timeoutMs);

    pendingRequests.set(requestId, { resolve, reject, timer });

    target.postMessage({ requestId, sourceCode, initialArray, options });
  });
}

/** Hủy worker đang chạy (gọi khi component unmount để giải phóng tài nguyên). */
export function disposeCompileWorker(): void {
  if (worker) {
    for (const pending of pendingRequests.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Đã hủy biên dịch.'));
    }
    pendingRequests.clear();
    worker.terminate();
    worker = null;
  }
}
