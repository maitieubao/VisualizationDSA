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

/** Thời gian tối đa cho một lần biên dịch trong worker (ms). */
export const COMPILE_TIMEOUT_MS = 15000;

let worker: Worker | null = null;
let requestCounter = 0;

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' });
  return worker;
}

/**
 * Biên dịch code thuật toán trong Web Worker (không chặn UI).
 * Nếu vượt quá timeout, worker bị terminate và promise reject với lỗi rõ ràng
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
      target.terminate();
      worker = null;
      reject(new Error(`Hết thời gian biên dịch (${timeoutMs / 1000}s). Code quá nặng hoặc có vòng lặp vô hạn!`));
    }, timeoutMs);

    target.onmessage = (event: MessageEvent<CompileWorkerResponse>) => {
      if (event.data.requestId !== requestId) return;
      clearTimeout(timer);
      if (event.data.ok && event.data.frames) {
        resolve(event.data.frames);
      } else {
        reject(new Error(event.data.error ?? 'Lỗi không xác định khi biên dịch.'));
      }
    };

    target.onerror = (event: ErrorEvent) => {
      clearTimeout(timer);
      reject(new Error(event.message || 'Lỗi không xác định khi biên dịch.'));
    };

    target.postMessage({ requestId, sourceCode, initialArray, options });
  });
}

/** Hủy worker đang chạy (gọi khi component unmount để giải phóng tài nguyên). */
export function disposeCompileWorker(): void {
  worker?.terminate();
  worker = null;
}
