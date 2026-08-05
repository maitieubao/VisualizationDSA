import type { TestCase } from '../types/lesson.types';

export interface CodelabCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  isHidden: boolean;
  error?: string;
}

export interface CodelabRunResult {
  ok: boolean;
  timedOut?: boolean;
  error?: string;
  results: CodelabCaseResult[];
}

export interface CodelabWorkerRequest {
  requestId: number;
  code: string;
  testCases: TestCase[];
  entryFunction: string;
}

export interface CodelabWorkerResponse {
  requestId: number;
  ok: boolean;
  error?: string;
  results?: CodelabCaseResult[];
}

/** Chuẩn hóa output: bỏ toàn bộ khoảng trắng để so sánh mảng/chuỗi linh hoạt. */
export function normalizeOutput(raw: string): string {
  return raw.replace(/\s+/g, '');
}

/** Chạy code user qua từng testcase (thuần — dùng chung cho worker và test). */
export function executeCodelab(
  code: string,
  testCases: TestCase[],
  entryFunction: string,
): CodelabRunResult {
  const entry = entryFunction.trim() || 'solution';
  const results: CodelabCaseResult[] = [];

  let fn: ((...args: unknown[]) => unknown) | null = null;
  try {
    // eslint-disable-next-line no-new-func
    fn = new Function('...__args__', `${code}\n;return ${entry}(...__args__);`) as (...args: unknown[]) => unknown;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `Lỗi biên dịch code: ${message}`,
      results: testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        passed: false,
        isHidden: !!tc.isHidden,
        error: message,
      })),
    };
  }

  for (const tc of testCases) {
    try {
      const args = JSON.parse(tc.input) as unknown[];
      const actual = fn(...(Array.isArray(args) ? args : [args]));
      const actualOutput = JSON.stringify(actual);
      const passed = normalizeOutput(actualOutput ?? '') === normalizeOutput(tc.expectedOutput);
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        passed,
        isHidden: !!tc.isHidden,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        passed: false,
        isHidden: !!tc.isHidden,
        error: message,
      });
    }
  }

  return { ok: true, results };
}

/** Thời gian tối đa chạy một lần Run/Submit (ms) — chặn vòng lặp vô hạn treo UI. */
export const CODELAB_TIMEOUT_MS = 1500;

type WorkerFactory = () => Worker;

function defaultWorkerFactory(): Worker {
  return new Worker(new URL('./codelab.worker.ts', import.meta.url), { type: 'module' });
}

/**
 * Chạy code user trong Web Worker với kill-switch timeout.
 * Nếu code treo (vòng lặp vô hạn), worker bị terminate sau timeoutMs → timedOut=true.
 */
export function runCodelabTask(
  code: string,
  testCases: TestCase[],
  entryFunction: string,
  timeoutMs: number = CODELAB_TIMEOUT_MS,
  workerFactory: WorkerFactory = defaultWorkerFactory,
): Promise<CodelabRunResult> {
  return new Promise<CodelabRunResult>((resolve) => {
    let worker: Worker;
    try {
      worker = workerFactory();
    } catch {
      // KHÔNG fallback chạy trên main thread: new Function không có kill-switch,
      // vòng lặp vô hạn sẽ đứng băng toàn bộ trang. Báo lỗi rõ ràng.
      resolve({
        ok: false,
        error: 'Không thể khởi tạo môi trường chạy code an toàn. Vui lòng thử lại.',
        results: testCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          passed: false,
          isHidden: !!tc.isHidden,
          error: 'Worker unavailable',
        })),
      });
      return;
    }

    const requestId = Date.now() + Math.floor(Math.random() * 1e6);
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        ok: false,
        timedOut: true,
        error: `Hết thời gian chạy (${timeoutMs}ms). Code có thể bị vòng lặp vô hạn!`,
        results: [],
      });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<CodelabWorkerResponse>) => {
      if (event.data.requestId !== requestId) return;
      clearTimeout(timer);
      worker.terminate();
      resolve({
        ok: event.data.ok,
        error: event.data.error,
        results: event.data.results ?? [],
      });
    };

    worker.onerror = (event: ErrorEvent) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ ok: false, error: event.message || 'Lỗi không xác định khi chạy code.', results: [] });
    };

    const payload: CodelabWorkerRequest = { requestId, code, testCases, entryFunction };
    worker.postMessage(payload);
  });
}
