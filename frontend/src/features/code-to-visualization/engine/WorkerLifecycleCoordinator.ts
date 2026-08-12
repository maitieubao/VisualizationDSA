import type { LiveFrameDTO, WorkerPayload, WorkerResponse } from '../types/compiler.types';

const DEFAULT_TIMEOUT_MS = 1500;
const MAX_FRAMES = 2000;

export function toFriendlyWorkerError(message: string): string {
  if (/call stack|stack size/i.test(message)) {
    return 'Đệ quy quá sâu — kiểm tra điều kiện dừng (base case) của hàm đệ quy.';
  }
  return message;
}

function buildWorkerScript(): string {
  return `
    self.fetch = undefined;
    self.XMLHttpRequest = undefined;
    self.importScripts = undefined;

    self.onmessage = function(e) {
      var data = e.data;
      var code = data.code;
      var initialArray = data.initialArray;
      var frames = [];
      var truncated = false;
      var MAX_FRAMES = ${MAX_FRAMES};

      function traceCompare(arr, leftIdx, rightIdx, vars, op, leftIsValue, rightIsValue, line) {
        var lv = leftIsValue ? leftIdx : arr[leftIdx];
        var rv = rightIsValue ? rightIdx : arr[rightIdx];
        var cmp;
        if (op === '>') cmp = lv > rv;
        else if (op === '<') cmp = lv < rv;
        else if (op === '>=') cmp = lv >= rv;
        else if (op === '<=') cmp = lv <= rv;
        else cmp = lv > rv;

        if (frames.length < MAX_FRAMES) {
          var indices = [];
          if (!leftIsValue) indices.push(leftIdx);
          if (!rightIsValue) indices.push(rightIdx);
          var variables = {};
          if (vars) {
            for (var v = 0; v < vars.length; v++) {
              variables[vars[v][0]] = vars[v][1];
            }
          }
          frames.push({
            frameIndex: frames.length,
            type: 'COMPARE',
            indices: indices,
            arrayState: arr.slice(),
            variables: variables,
            lineNumber: line
          });
        } else {
          truncated = true;
        }
        return cmp;
      }

      function traceAssign(arr, i, val, vars, line) {
        arr[i] = val;
        if (frames.length < MAX_FRAMES) {
          var variables = {};
          if (vars) {
            for (var v = 0; v < vars.length; v++) {
              variables[vars[v][0]] = vars[v][1];
            }
          }
          variables.value = val;
          frames.push({
            frameIndex: frames.length,
            type: 'ASSIGN',
            indices: [i],
            arrayState: arr.slice(),
            variables: variables,
            lineNumber: line
          });
        } else {
          truncated = true;
        }
        return val;
      }

      try {
        var arrayCopy = initialArray.slice();
        ${toFriendlyWorkerError.toString()}
        var fn = new Function('arr', 'traceCompare', 'traceAssign', code);
        fn(arrayCopy, traceCompare, traceAssign);

        if (frames.length < MAX_FRAMES) {
          frames.push({
            frameIndex: frames.length,
            type: 'ACCESS',
            indices: [],
            arrayState: arrayCopy.slice(),
            variables: {}
          });
        } else {
          truncated = true;
        }

        if (truncated) {
          console.warn('Cảnh báo: số frame vượt ngưỡng ' + MAX_FRAMES + ', kết quả bị cắt bớt.');
        }
        self.postMessage({ success: true, frames: frames, truncated: truncated });
      } catch(err) {
        var msg = err.message || 'Runtime error';
        msg = toFriendlyWorkerError(msg);
        self.postMessage({ success: false, error: msg });
      }
    };
  `;
}

let activeWorker: Worker | null = null;
let activeTimeoutId: ReturnType<typeof setTimeout> | null = null;
let activeObjectUrl: string | null = null;
let pendingReject: ((reason: Error) => void) | null = null;

export function terminateActiveSession(): void {
  if (pendingReject) {
    const reject = pendingReject;
    pendingReject = null;
    reject(new Error('Đã hủy biên dịch.'));
  }
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

export function executeInSandbox(
  instrumentedCode: string,
  initialArray: number[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<LiveFrameDTO[]> {
  return new Promise<LiveFrameDTO[]>((resolve, reject) => {
    terminateActiveSession();
    pendingReject = reject;

    const workerScript = buildWorkerScript();
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const objectUrl = URL.createObjectURL(blob);
    activeObjectUrl = objectUrl;

    try {
      activeWorker = new Worker(objectUrl);
    } catch (err) {
      pendingReject = null;
      URL.revokeObjectURL(objectUrl);
      activeObjectUrl = null;
      reject(new Error('Không thể khởi tạo Web Worker Sandbox.'));
      return;
    }

    activeTimeoutId = setTimeout(() => {
      reject(
        new Error(
          `Thực thi quá tải thời gian (Timeout ${timeoutMs / 1000}s)! Thuật toán chạy quá lâu — đã tự động hủy worker để tránh treo máy.`,
        ),
      );
      terminateActiveSession();
    }, timeoutMs);

    activeWorker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      clearTimeoutAndRevoke();
      const { success, frames, error, truncated } = e.data;

      if (success && frames) {
        if (truncated) {
          console.warn(
            `Cảnh báo: số frame vượt ngưỡng ${MAX_FRAMES}, kết quả bị cắt bớt.`,
          );
        }
        resolve(frames);
      } else {
        reject(new Error(error ?? 'Lỗi thực thi không xác định.'));
      }
    };

    activeWorker.onerror = (err: ErrorEvent) => {
      clearTimeoutAndRevoke();
      reject(new Error(`Lỗi luồng Worker: ${err.message}`));
    };

    activeWorker.onmessageerror = () => {
      clearTimeoutAndRevoke();
      reject(new Error('Không thể nhận kết quả từ Worker Sandbox (dữ liệu truyền không hợp lệ).'));
    };

    const payload: WorkerPayload = {
      code: instrumentedCode,
      initialArray,
    };
    activeWorker.postMessage(payload);
  });
}

function clearTimeoutAndRevoke(): void {
  pendingReject = null;
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
