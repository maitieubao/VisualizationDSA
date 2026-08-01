import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  executeInSandbox,
  terminateActiveSession,
} from '../engine/WorkerLifecycleCoordinator';

interface MockWorkerInstance {
  onmessage: ((e: MessageEvent) => void) | null;
  onerror: ((e: ErrorEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
}

describe('WorkerLifecycleCoordinator', () => {
  let mockWorkerInstances: MockWorkerInstance[];

  beforeEach(() => {
    mockWorkerInstances = [];

    class MockWorker {
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: ((e: ErrorEvent) => void) | null = null;
      postMessage = vi.fn();
      terminate = vi.fn();

      constructor() {
        mockWorkerInstances.push(this as unknown as MockWorkerInstance);
      }
    }

    class MockBlob {
      constructor(_parts: BlobPart[], _options?: BlobPropertyBag) {
        // no-op
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

  it('should reject on timeout', async () => {
    vi.useFakeTimers();

    const promise = executeInSandbox('infinite loop code', [1, 2, 3], 100);

    vi.advanceTimersByTime(150);

    await expect(promise).rejects.toThrow('Timeout');

    vi.useRealTimers();
  });

  it('should terminate previous worker when starting new execution', async () => {
    const promise1 = executeInSandbox('code1', [1]);
    expect(mockWorkerInstances.length).toBe(1);

    const promise2 = executeInSandbox('code2', [2]);
    expect(mockWorkerInstances.length).toBe(2);
    expect(mockWorkerInstances[0].terminate).toHaveBeenCalled();

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

  it('should terminate worker on terminateActiveSession call', () => {
    executeInSandbox('code', [1]);

    expect(mockWorkerInstances.length).toBe(1);
    terminateActiveSession();
    expect(mockWorkerInstances[0].terminate).toHaveBeenCalled();
  });
});
