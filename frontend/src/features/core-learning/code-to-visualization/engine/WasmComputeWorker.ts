/**
 * WasmComputeWorker — Web Worker container for WASM-accelerated computation.
 *
 * Offloads heavy iterative/recursive operations (AST parsing, sorting loops)
 * into a dedicated thread with optional WASM module execution.
 *
 * Communication protocol:
 *   Main → Worker: WasmWorkerRequest (with transferable ArrayBuffers)
 *   Worker → Main: WasmWorkerResponse (with transferable ArrayBuffers)
 */

// ── Message Types ────────────────────────────────────────────────────────────

export interface WasmWorkerRequest {
  type: 'init' | 'compute' | 'abort';
  taskId: string;
  /** Raw input data as transferable ArrayBuffer for zero-copy throughput */
  payload?: ArrayBuffer;
  /** WASM module bytes for dynamic instantiation */
  wasmBytes?: ArrayBuffer;
  /** Configuration parameters for the compute task */
  config?: ComputeConfig;
}

export interface ComputeConfig {
  maxIterations: number;
  algorithm: 'sort' | 'graph-force' | 'ast-walk' | 'custom';
  precision: 'f32' | 'f64';
}

export interface WasmWorkerResponse {
  type: 'ready' | 'result' | 'progress' | 'error';
  taskId: string;
  /** Computed output as transferable ArrayBuffer */
  payload?: ArrayBuffer;
  /** Progress percentage (0–100) for long-running tasks */
  progress?: number;
  /** Execution time in milliseconds */
  elapsedMs?: number;
  /** Error message if type === 'error' */
  error?: string;
}

// ── Worker Context (runs inside Web Worker thread) ───────────────────────────

let wasmInstance: WebAssembly.Instance | null = null;
let wasmMemory: WebAssembly.Memory | null = null;

/**
 * Initialize WASM module from raw bytes.
 * Sets up shared linear memory for data exchange.
 */
async function initWasmModule(wasmBytes: ArrayBuffer): Promise<void> {
  wasmMemory = new WebAssembly.Memory({ initial: 256, maximum: 4096 });

  const importObject: WebAssembly.Imports = {
    env: {
      memory: wasmMemory,
      abort: () => { throw new Error('WASM abort called'); },
    },
  };

  const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
  wasmInstance = instance;
}

/**
 * Execute a compute task using either WASM or JS fallback.
 * Uses transferable ArrayBuffers for zero-copy data exchange.
 */
function executeCompute(
  taskId: string,
  inputBuffer: ArrayBuffer,
  config: ComputeConfig,
): WasmWorkerResponse {
  const startTime = performance.now();

  try {
    let resultBuffer: ArrayBuffer;

    if (wasmInstance && wasmInstance.exports['compute']) {
      // WASM path: copy input → WASM linear memory → execute → copy output
      const inputView = new Float32Array(inputBuffer);
      const wasmMem = new Float32Array(
        (wasmMemory as WebAssembly.Memory).buffer,
        0,
        inputView.length,
      );
      wasmMem.set(inputView);

      const computeFn = wasmInstance.exports['compute'] as (
        len: number,
        maxIter: number,
      ) => number;
      const resultLen = computeFn(inputView.length, config.maxIterations);

      const resultView = new Float32Array(
        (wasmMemory as WebAssembly.Memory).buffer,
        0,
        resultLen,
      );
      resultBuffer = resultView.buffer.slice(
        resultView.byteOffset,
        resultView.byteOffset + resultView.byteLength,
      );
    } else {
      // JS fallback: process in-worker without WASM
      resultBuffer = jsFallbackCompute(inputBuffer, config);
    }

    const elapsedMs = performance.now() - startTime;

    return {
      type: 'result',
      taskId,
      payload: resultBuffer,
      elapsedMs,
    };
  } catch (err) {
    return {
      type: 'error',
      taskId,
      error: err instanceof Error ? err.message : 'Lỗi compute không xác định',
      elapsedMs: performance.now() - startTime,
    };
  }
}

/**
 * JS fallback compute — runs sorting/graph operations in pure JS
 * when no WASM module is loaded.
 */
function jsFallbackCompute(inputBuffer: ArrayBuffer, config: ComputeConfig): ArrayBuffer {
  const view = config.precision === 'f64'
    ? new Float64Array(inputBuffer.slice(0))
    : new Float32Array(inputBuffer.slice(0));

  let iterations = 0;
  const maxIter = config.maxIterations;

  if (config.algorithm === 'sort') {
    // In-place insertion sort with iteration guard
    for (let i = 1; i < view.length && iterations < maxIter; i++) {
      const key = view[i];
      let j = i - 1;
      while (j >= 0 && view[j] > key && iterations < maxIter) {
        view[j + 1] = view[j];
        j--;
        iterations++;
      }
      view[j + 1] = key;
    }
  } else if (config.algorithm === 'graph-force') {
    // Simplified force-directed step: repulsion pass
    const nodeCount = view.length / 4; // x, y, vx, vy per node
    const repulsion = 100.0;
    const damping = 0.95;
    for (let i = 0; i < nodeCount && iterations < maxIter; i++) {
      let fx = 0, fy = 0;
      const ix = i * 4, iy = i * 4 + 1;
      for (let j = 0; j < nodeCount; j++) {
        if (i === j) continue;
        const dx = view[ix] - view[j * 4];
        const dy = view[iy] - view[j * 4 + 1];
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
        fx += (dx / dist) * (repulsion / (dist * dist));
        fy += (dy / dist) * (repulsion / (dist * dist));
        iterations++;
      }
      view[i * 4 + 2] = (view[i * 4 + 2] + fx * 0.016) * damping; // vx
      view[i * 4 + 3] = (view[i * 4 + 3] + fy * 0.016) * damping; // vy
      view[ix] += view[i * 4 + 2] * 0.016; // x
      view[iy] += view[i * 4 + 3] * 0.016; // y
    }
  }

  return view.buffer;
}

// ── Message Handler ──────────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent<WasmWorkerRequest>) => {
  const { type, taskId, payload, wasmBytes, config } = event.data;

  switch (type) {
    case 'init': {
      try {
        if (wasmBytes) {
          await initWasmModule(wasmBytes);
        }
        const response: WasmWorkerResponse = { type: 'ready', taskId };
        self.postMessage(response);
      } catch (err) {
        const response: WasmWorkerResponse = {
          type: 'error',
          taskId,
          error: err instanceof Error ? err.message : 'Khởi tạo WASM thất bại',
        };
        self.postMessage(response);
      }
      break;
    }

    case 'compute': {
      if (!payload || !config) {
        const response: WasmWorkerResponse = {
          type: 'error',
          taskId,
          error: 'Thiếu payload hoặc config cho compute task',
        };
        self.postMessage(response);
        return;
      }

      const result = executeCompute(taskId, payload, config);
      // Transfer the result buffer back to main thread (zero-copy)
      const transferables: Transferable[] = result.payload ? [result.payload] : [];
      self.postMessage(result, { transfer: transferables });
      break;
    }

    case 'abort': {
      // Reset WASM state
      wasmInstance = null;
      wasmMemory = null;
      const response: WasmWorkerResponse = { type: 'ready', taskId };
      self.postMessage(response);
      break;
    }
  }
};

// ── Main-Thread Bridge (import from Vue components) ──────────────────────────

/**
 * Creates a typed bridge to the WasmComputeWorker from the main thread.
 * Uses transferable ArrayBuffers for maximum data throughput.
 *
 * Usage:
 * ```ts
 * const bridge = createWasmBridge();
 * await bridge.init();
 * const result = await bridge.compute(inputArray, { algorithm: 'sort', ... });
 * bridge.terminate();
 * ```
 */
export function createWasmBridge(): WasmBridge {
  const worker = new Worker(new URL('./WasmComputeWorker.ts', import.meta.url), {
    type: 'module',
  });

  let taskCounter = 0;
  const pending = new Map<string, {
    resolve: (res: WasmWorkerResponse) => void;
    reject: (err: Error) => void;
  }>();

  worker.onmessage = (event: MessageEvent<WasmWorkerResponse>) => {
    const { taskId } = event.data;
    const handler = pending.get(taskId);
    if (handler) {
      pending.delete(taskId);
      if (event.data.type === 'error') {
        handler.reject(new Error(event.data.error ?? 'Worker error'));
      } else {
        handler.resolve(event.data);
      }
    }
  };

  function sendRequest(
    request: WasmWorkerRequest,
    transferables: Transferable[] = [],
  ): Promise<WasmWorkerResponse> {
    return new Promise((resolve, reject) => {
      pending.set(request.taskId, { resolve, reject });
      worker.postMessage(request, { transfer: transferables });
    });
  }

  return {
    async init(wasmBytes?: ArrayBuffer): Promise<void> {
      const taskId = `init-${++taskCounter}`;
      const transferables: Transferable[] = wasmBytes ? [wasmBytes] : [];
      await sendRequest(
        { type: 'init', taskId, wasmBytes },
        transferables,
      );
    },

    async compute(
      inputData: Float32Array | Float64Array,
      config: ComputeConfig,
    ): Promise<{ output: ArrayBuffer; elapsedMs: number }> {
      const taskId = `compute-${++taskCounter}`;
      // Transfer the input buffer (zero-copy to worker)
      const buffer = inputData.buffer.slice(
        inputData.byteOffset,
        inputData.byteOffset + inputData.byteLength,
      ) as ArrayBuffer;
      const result = await sendRequest(
        { type: 'compute', taskId, payload: buffer, config },
        [buffer],
      );
      return {
        output: result.payload ?? new ArrayBuffer(0),
        elapsedMs: result.elapsedMs ?? 0,
      };
    },

    abort(): void {
      const taskId = `abort-${++taskCounter}`;
      worker.postMessage({ type: 'abort', taskId } satisfies WasmWorkerRequest);
    },

    terminate(): void {
      pending.clear();
      worker.terminate();
    },
  };
}

export interface WasmBridge {
  init(wasmBytes?: ArrayBuffer): Promise<void>;
  compute(
    inputData: Float32Array | Float64Array,
    config: ComputeConfig,
  ): Promise<{ output: ArrayBuffer; elapsedMs: number }>;
  abort(): void;
  terminate(): void;
}
