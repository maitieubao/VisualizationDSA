import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { VCRPlaybackEngine } from '../engine/VCRPlaybackEngine';
import type { PlaybackFrame } from '../types/timeline-playback.types';

describe('VCRPlaybackEngine', () => {
  let engine: VCRPlaybackEngine;
  let mockCallback: ReturnType<typeof vi.fn>;
  let mockFrames: PlaybackFrame[];

  // Stub rAF/cAF for Node.js test environment
  let rafId = 0;
  const rafCallbacks = new Map<number, FrameRequestCallback>();

  beforeEach(() => {
    rafId = 0;
    rafCallbacks.clear();

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafId++;
      rafCallbacks.set(rafId, cb);
      return rafId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id);
    });
    vi.stubGlobal('performance', {
      now: vi.fn(() => 0),
    });

    mockCallback = vi.fn();
    engine = new VCRPlaybackEngine(mockCallback as any);

    mockFrames = [
      { stepIndex: 0, canvasStateSnapshot: { array: [64, 34, 25] }, lineNumber: 1, description: 'Khởi tạo mảng' },
      { stepIndex: 1, canvasStateSnapshot: { array: [34, 64, 25] }, lineNumber: 3, description: 'So sánh arr[0] với arr[1]' },
      { stepIndex: 2, canvasStateSnapshot: { array: [34, 25, 64] }, lineNumber: 4, description: 'Hoán vị 64 ↔ 25' },
      { stepIndex: 3, canvasStateSnapshot: { array: [25, 34, 64] }, lineNumber: 5, description: 'Hoàn thành sắp xếp' },
    ];

    engine.setFrames(mockFrames);
  });

  afterEach(() => {
    engine.destroy();
    vi.restoreAllMocks();
  });

  // === setFrames ===
  it('should set frames and reset current step to 0', () => {
    expect(engine.getFrameCount()).toBe(4);
    expect(engine.getCurrentStep()).toBe(0);
  });

  it('should reset step index when setting new frames', () => {
    engine.seekToStep(2);
    engine.setFrames(mockFrames);
    expect(engine.getCurrentStep()).toBe(0);
  });

  // === seekToStep ===
  it('should seek to valid step index and trigger callback', () => {
    const frame = engine.seekToStep(2);
    expect(frame?.stepIndex).toBe(2);
    expect(frame?.lineNumber).toBe(4);
    expect(engine.getCurrentStep()).toBe(2);
    expect(mockCallback).toHaveBeenCalledWith(mockFrames[2]);
  });

  it('should return null for out-of-range negative index', () => {
    const frame = engine.seekToStep(-1);
    expect(frame).toBeNull();
    expect(engine.getCurrentStep()).toBe(0);
  });

  it('should return null for out-of-range index beyond frames', () => {
    const frame = engine.seekToStep(10);
    expect(frame).toBeNull();
  });

  it('should return null when seeking with empty frames', () => {
    engine.setFrames([]);
    const frame = engine.seekToStep(0);
    expect(frame).toBeNull();
  });

  // === stepForward ===
  it('should step forward and trigger callback', () => {
    const frame = engine.stepForward();
    expect(frame?.stepIndex).toBe(1);
    expect(engine.getCurrentStep()).toBe(1);
    expect(mockCallback).toHaveBeenCalledWith(mockFrames[1]);
  });

  it('should step forward multiple times', () => {
    engine.stepForward();
    engine.stepForward();
    const frame = engine.stepForward();
    expect(frame?.stepIndex).toBe(3);
    expect(engine.getCurrentStep()).toBe(3);
  });

  it('should return null when stepping forward at last frame', () => {
    engine.seekToStep(3);
    mockCallback.mockClear();
    const frame = engine.stepForward();
    expect(frame).toBeNull();
    expect(engine.getCurrentStep()).toBe(3);
  });

  // === stepBack ===
  it('should step back and trigger callback', () => {
    engine.seekToStep(2);
    mockCallback.mockClear();
    const frame = engine.stepBack();
    expect(frame?.stepIndex).toBe(1);
    expect(engine.getCurrentStep()).toBe(1);
    expect(mockCallback).toHaveBeenCalledWith(mockFrames[1]);
  });

  it('should return null when stepping back at first frame', () => {
    const frame = engine.stepBack();
    expect(frame).toBeNull();
    expect(engine.getCurrentStep()).toBe(0);
  });

  // === rewind ===
  it('should rewind to first frame', () => {
    engine.seekToStep(3);
    mockCallback.mockClear();
    const frame = engine.rewind();
    expect(frame?.stepIndex).toBe(0);
    expect(engine.getCurrentStep()).toBe(0);
  });

  // === fastForward ===
  it('should fast forward to last frame', () => {
    const frame = engine.fastForward();
    expect(frame?.stepIndex).toBe(3);
    expect(engine.getCurrentStep()).toBe(3);
  });

  it('should return null when fast forward with empty frames', () => {
    engine.setFrames([]);
    const frame = engine.fastForward();
    expect(frame).toBeNull();
  });

  // === setSpeed ===
  it('should set playback speed', () => {
    engine.setSpeed(2.0);
    expect(engine.getSpeed()).toBe(2.0);
  });

  it('should clamp speed to minimum 0.1', () => {
    engine.setSpeed(0.01);
    expect(engine.getSpeed()).toBe(0.1);
  });

  it('should clamp speed to maximum 5.0', () => {
    engine.setSpeed(10.0);
    expect(engine.getSpeed()).toBe(5.0);
  });

  // === play / pause ===
  it('should set status to PLAYING on play', () => {
    engine.play();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('should not double-play when already PLAYING', () => {
    engine.play();
    engine.play();
    expect(engine.getStatus()).toBe('PLAYING');
  });

  it('should not play with empty frames', () => {
    engine.setFrames([]);
    engine.play();
    expect(engine.getStatus()).toBe('PAUSED');
  });

  it('should set status to PAUSED on pause', () => {
    engine.play();
    engine.pause();
    expect(engine.getStatus()).toBe('PAUSED');
  });

  it('should cancel animation frame on pause', () => {
    engine.play();
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    engine.pause();
    expect(cancelSpy).toHaveBeenCalled();
  });

  // === getStatus ===
  it('should start with PAUSED status', () => {
    expect(engine.getStatus()).toBe('PAUSED');
  });

  // === loop (play advance) ===
  it('should advance step when elapsed >= stepInterval during play', () => {
    let timeNow = 0;
    (performance.now as ReturnType<typeof vi.fn>).mockImplementation(() => timeNow);

    engine.play();

    // Simulate rAF loop: advance time beyond 1000ms (1x speed)
    timeNow = 1100;
    const cb = rafCallbacks.get(rafId);
    if (cb) cb(timeNow);

    expect(engine.getCurrentStep()).toBe(1);
    expect(mockCallback).toHaveBeenCalledWith(mockFrames[1]);
  });

  it('should auto-pause at last frame during playback', () => {
    let timeNow = 0;
    (performance.now as ReturnType<typeof vi.fn>).mockImplementation(() => timeNow);

    engine.seekToStep(2);
    mockCallback.mockClear();
    engine.play();

    // Advance to step 3 (last frame)
    timeNow = 1100;
    const cb1 = rafCallbacks.get(rafId);
    if (cb1) cb1(timeNow);

    expect(engine.getCurrentStep()).toBe(3);
    expect(engine.getStatus()).toBe('PAUSED');
  });

  // === destroy ===
  it('should destroy and clear all state', () => {
    engine.seekToStep(2);
    engine.destroy();
    expect(engine.getCurrentStep()).toBe(0);
    expect(engine.getFrameCount()).toBe(0);
    expect(engine.getStatus()).toBe('PAUSED');
    expect(engine.getSpeed()).toBe(1.0);
  });

  // === stepForward + stepBack boundary combined ===
  it('should handle forward-backward-forward boundary transitions', () => {
    let frame = engine.stepForward();
    expect(frame?.stepIndex).toBe(1);

    frame = engine.stepForward();
    expect(frame?.stepIndex).toBe(2);

    frame = engine.stepForward();
    expect(frame?.stepIndex).toBe(3);

    frame = engine.stepForward();
    expect(frame).toBeNull();
    expect(engine.getCurrentStep()).toBe(3);

    frame = engine.stepBack();
    expect(frame?.stepIndex).toBe(2);

    frame = engine.stepBack();
    expect(frame?.stepIndex).toBe(1);

    frame = engine.stepBack();
    expect(frame?.stepIndex).toBe(0);

    frame = engine.stepBack();
    expect(frame).toBeNull();
    expect(engine.getCurrentStep()).toBe(0);
  });
});
