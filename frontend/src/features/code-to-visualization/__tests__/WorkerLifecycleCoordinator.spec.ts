import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  executeInSandbox,
  terminateActiveSession,
  toFriendlyWorkerError,
} from '../engine/WorkerLifecycleCoordinator';
import { compileAndInstrument } from '../engine/ASTInstrumentationEngine';
import type { LiveFrameDTO } from '../types/compiler.types';

interface MockWorkerInstance {
  onmessage: ((e: MessageEvent) => void) | null;
  onerror: ((e: ErrorEvent) => void) | null;
  onmessageerror: ((e: MessageEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
}

interface SandboxWorkerSelf {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage: (message: unknown) => void;
}

describe('WorkerLifecycleCoordinator', () => {
  let mockWorkerInstances: MockWorkerInstance[];
  let mockBlobScripts: string[];

  beforeEach(() => {
    mockWorkerInstances = [];
    mockBlobScripts = [];

    class MockWorker {
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: ((e: ErrorEvent) => void) | null = null;
      onmessageerror: ((e: MessageEvent) => void) | null = null;
      postMessage = vi.fn();
      terminate = vi.fn();

      constructor() {
        mockWorkerInstances.push(this as unknown as MockWorkerInstance);
      }
    }

    class MockBlob {
      constructor(parts: BlobPart[], _options?: BlobPropertyBag) {
        mockBlobScripts.push(String(parts[0]));
      }
    }

    vi.stubGlobal('Worker', MockWorker);
    vi.stubGlobal('Blob', MockBlob);
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    terminateActiveSession();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should create a Worker and send postMessage with code and array', async () => {
    const promise = executeInSandbox('console.log("test")', [1, 2, 3]);

    expect(mockWorkerInstances.length).toBe(1);
    expect(mockWorkerInstances[0].postMessage).toHaveBeenCalledWith({
      code: 'console.log("test")',
      initialArray: [1, 2, 3],
    });

    const frames = [
      { frameIndex: 0, type: 'COMPARE' as const, indices: [0, 1], arrayState: [1, 2, 3], variables: {} },
    ];
    mockWorkerInstances[0].onmessage!({ data: { success: true, frames } } as MessageEvent);

    const result = await promise;
    expect(result).toEqual(frames);
  });

  it('should reject on worker error response', async () => {
    const promise = executeInSandbox('broken code', [1, 2]);

    mockWorkerInstances[0].onmessage!({
      data: { success: false, error: 'Runtime error occurred' },
    } as MessageEvent);

    await expect(promise).rejects.toThrow('Runtime error occurred');
  });

  it('should reject on worker onerror event', async () => {
    const promise = executeInSandbox('code', [1]);

    mockWorkerInstances[0].onerror!({ message: 'Worker crash' } as ErrorEvent);

    await expect(promise).rejects.toThrow('Lỗi luồng Worker: Worker crash');
  });

  it('should reject clearly on worker onmessageerror (CV-128)', async () => {
    const promise = executeInSandbox('code', [1]);

    mockWorkerInstances[0].onmessageerror!({ data: {} } as MessageEvent);

    await expect(promise).rejects.toThrow('Không thể nhận kết quả từ Worker Sandbox');
  });

  it('should reject on timeout', async () => {
    vi.useFakeTimers();
    try {
      const promise = executeInSandbox('infinite loop code', [1, 2, 3], 100);

      vi.advanceTimersByTime(150);

      await expect(promise).rejects.toThrow('Timeout');
    } finally {
      vi.useRealTimers();
    }
  });

  it('should terminate previous worker when starting new execution', async () => {
    const promise1 = executeInSandbox('code1', [1]);
    expect(mockWorkerInstances.length).toBe(1);

    const promise2 = executeInSandbox('code2', [2]);
    expect(mockWorkerInstances.length).toBe(2);
    expect(mockWorkerInstances[0].terminate).toHaveBeenCalled();

    await expect(promise1).rejects.toThrow('Đã hủy biên dịch.');

    mockWorkerInstances[1].onmessage!({
      data: { success: true, frames: [] },
    } as MessageEvent);

    const result = await promise2;
    expect(result).toEqual([]);
  });

  it('should call URL.revokeObjectURL after worker completes', async () => {
    const promise = executeInSandbox('code', [1]);

    mockWorkerInstances[0].onmessage!({
      data: { success: true, frames: [] },
    } as MessageEvent);

    await promise;
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should terminate worker on terminateActiveSession call', async () => {
    const promise = executeInSandbox('code', [1]);

    expect(mockWorkerInstances.length).toBe(1);
    terminateActiveSession();
    expect(mockWorkerInstances[0].terminate).toHaveBeenCalled();
    await expect(promise).rejects.toThrow('Đã hủy biên dịch.');
  });

  it('should map stack overflow errors to a friendly recursion hint', () => {
    expect(toFriendlyWorkerError('Maximum call stack size exceeded')).toContain('Đệ quy');
    expect(toFriendlyWorkerError('RangeError: Maximum call stack')).toContain('base case');
    expect(toFriendlyWorkerError('ReferenceError: x is not defined')).toBe('ReferenceError: x is not defined');
  });

  it('should emit ASSIGN frames with the real variable name, not hardcoded i (CV-143)', async () => {
    const compileResult = compileAndInstrument(
      `function assignDemo(arr) { var k = 1; arr[k] = 42; }`,
    );
    expect(compileResult.success).toBe(true);

    const promise = executeInSandbox(compileResult.instrumentedCode!, [1, 2, 3]);
    expect(mockBlobScripts).toHaveLength(1);

    const posted: unknown[] = [];
    const sandboxSelf: SandboxWorkerSelf = {
      onmessage: null,
      postMessage: (message: unknown) => { posted.push(message); },
    };

    const runWorkerScript = new Function('self', mockBlobScripts[0]);
    runWorkerScript(sandboxSelf);
    expect(sandboxSelf.onmessage).not.toBeNull();

    sandboxSelf.onmessage!({
      data: { code: compileResult.instrumentedCode, initialArray: [1, 2, 3] },
    } as MessageEvent);

    expect(posted).toHaveLength(1);
    const response = posted[0] as { success: boolean; frames?: LiveFrameDTO[] };
    expect(response.success).toBe(true);
    expect(response.frames).toHaveLength(2); // 1 ASSIGN + 1 ACCESS cuối

    const assignFrame = response.frames!.find((f) => f.type === 'ASSIGN');
    expect(assignFrame).toBeDefined();
    expect(assignFrame!.indices).toEqual([1]);
    expect(assignFrame!.variables).toEqual({ k: 1, value: 42 });
    expect(Object.keys(assignFrame!.variables)).not.toContain('i');

    // Khép promise của executeInSandbox (worker thật đã được mô phỏng ở trên)
    // để tránh unhandled rejection / chờ timeout 1.5s thật.
    mockWorkerInstances[0].onmessage!({
      data: { success: true, frames: [] },
    } as MessageEvent);
    await expect(promise).resolves.toEqual([]);
  });
});
