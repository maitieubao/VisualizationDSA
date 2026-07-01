import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UnifiedRenderScheduler } from '../engine/UnifiedRenderScheduler';

describe('UnifiedRenderScheduler', () => {
  let rafCallback: ((timestamp: number) => void) | null = null;
  let originalRAF: typeof globalThis.requestAnimationFrame;
  let originalCAF: typeof globalThis.cancelAnimationFrame;

  beforeEach(() => {
    UnifiedRenderScheduler.cleanup();
    rafCallback = null;

    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;

    globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      rafCallback = cb;
      return 1;
    });
    globalThis.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    UnifiedRenderScheduler.cleanup();
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
  });

  it('should register left and right callbacks and invoke them on tick', () => {
    const leftCb = vi.fn();
    const rightCb = vi.fn();

    UnifiedRenderScheduler.registerCallbacks(leftCb, rightCb);
    UnifiedRenderScheduler.startSchedulerLoop();

    expect(globalThis.requestAnimationFrame).toHaveBeenCalled();

    if (rafCallback) rafCallback(0);

    expect(leftCb).toHaveBeenCalledTimes(1);
    expect(rightCb).toHaveBeenCalledTimes(1);
  });

  it('should not start loop if already running', () => {
    UnifiedRenderScheduler.registerCallbacks(vi.fn(), vi.fn());
    UnifiedRenderScheduler.startSchedulerLoop();

    const callCount = (globalThis.requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length;
    UnifiedRenderScheduler.startSchedulerLoop();

    expect(
      (globalThis.requestAnimationFrame as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(callCount);
  });

  it('should stop scheduler loop and cancel animation frame', () => {
    UnifiedRenderScheduler.registerCallbacks(vi.fn(), vi.fn());
    UnifiedRenderScheduler.startSchedulerLoop();

    UnifiedRenderScheduler.stopSchedulerLoop();

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should cleanup: stop loop and nullify callbacks', () => {
    const leftCb = vi.fn();
    const rightCb = vi.fn();

    UnifiedRenderScheduler.registerCallbacks(leftCb, rightCb);
    UnifiedRenderScheduler.startSchedulerLoop();
    UnifiedRenderScheduler.cleanup();

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });
});
