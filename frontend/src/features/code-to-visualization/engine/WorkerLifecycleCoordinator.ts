/**
 * WorkerLifecycleCoordinator — Điều phối vòng đời Web Worker Sandbox.
 *
 * Quản lý: Blob URL lifecycle, Timeout Guard 1.5s,
 * terminate Worker cũ trước khi tạo Worker mới,
 * giải phóng bộ nhớ Blob URL sau khi Worker kết thúc.
 */

import type { LiveFrameDTO, WorkerPayload, WorkerResponse } from '../types/compiler.types';

const DEFAULT_TIMEOUT_MS = 1500;
const MAX_FRAMES = 2000;

/**
 * Mã nguồn chạy bên trong Web Worker.
 * Định nghĩa traceCompare, traceAssign, và thực thi code đã tiêm.
 */
function buildWorkerScript(): string {
  return `
    self.onmessage = function(e) {
      var data = e.data;
      var code = data.code;
      var initialArray = data.initialArray;
      var frames = [];
      var MAX_FRAMES = ${MAX_FRAMES};

      function traceCompare(arr, i, j, op) {
        if (frames.length < MAX_FRAMES) {
          frames.push({
            frameIndex: frames.length,
            type: 'COMPARE',
            indices: [i, j],
            arrayState: arr.slice(),
            variables: {}
          });
        }
        if (op === '>') return arr[i] > arr[j];
        if (op === '<') return arr[i] < arr[j];
        if (op === '>=') return arr[i] >= arr[j];
        if (op === '<=') return arr[i] <= arr[j];
        return arr[i] > arr[j];
      }

      function traceAssign(arr, i, val) {
        arr[i] = val;
        if (frames.length < MAX_FRAMES) {
          frames.push({
            frameIndex: frames.length,
            type: 'SWAP',
            indices: [i],
            arrayState: arr.slice(),
            variables: {}
          });
        }
        return val;
      }

      try {
        var arrayCopy = initialArray.slice();
        var fn = new Function('arr', 'traceCompare', 'traceAssign', code);
        fn(arrayCopy, traceCompare, traceAssign);

        frames.push({
          frameIndex: frames.length,
          type: 'ACCESS',
          indices: [],
          arrayState: arrayCopy.slice(),
          variables: {}
        });

        self.postMessage({ success: true, frames: frames });
      } catch(err) {
        self.postMessage({ success: false, error: err.message || 'Runtime error' });
      }
    };
  `;
}

let activeWorker: Worker | null = null;
let activeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let activeObjectUrl: string | null = null;

/**
 * Chấm dứt triệt để Worker đang chạy nền và dọn dẹp tài nguyên.
 */
export function terminateActiveSession(): void {
  if (activeWorker) {
    activeWorker.terminate();
    activeWorker = null;
  }
  if (activeTimeoutId) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

/**
 * Khởi chạy Web Worker Sandbox an toàn với Timeout Guard.
 * Tự động terminate Worker cũ trước khi tạo Worker mới.
 */
export function executeInSandbox(
  instrumentedCode: string,
  initialArray: number[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<LiveFrameDTO[]> {
  return new Promise<LiveFrameDTO[]>((resolve, reject) => {
    terminateActiveSession();

    const workerScript = buildWorkerScript();
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const objectUrl = URL.createObjectURL(blob);
    activeObjectUrl = objectUrl;

    try {
      activeWorker = new Worker(objectUrl);
    } catch (err) {
      URL.revokeObjectURL(objectUrl);
      activeObjectUrl = null;
      reject(new Error('Không thể khởi tạo Web Worker Sandbox.'));
      return;
    }

    activeTimeoutId = setTimeout(() => {
      terminateActiveSession();
      reject(
        new Error(
          `Thực thi quá tải thời gian (Timeout ${timeoutMs / 1000}s)! Phát hiện cấu trúc lặp vô hạn (Infinite Loop).`,
        ),
      );
    }, timeoutMs);

    activeWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      clearTimeoutAndRevoke();
      const { success, frames, error } = e.data;

      if (success && frames) {
        resolve(frames);
      } else {
        reject(new Error(error ?? 'Lỗi thực thi không xác định.'));
      }
    };

    activeWorker.onerror = (err: ErrorEvent) => {
      clearTimeoutAndRevoke();
      reject(new Error(`Lỗi luồng Worker: ${err.message}`));
    };

    const payload: WorkerPayload = {
      code: instrumentedCode,
      initialArray,
    };
    activeWorker.postMessage(payload);
  });
}

function clearTimeoutAndRevoke(): void {
  if (activeTimeoutId) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
  if (activeWorker) {
    activeWorker.terminate();
    activeWorker = null;
  }
}
