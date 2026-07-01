import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVCRTimelineStore } from '../store/useVCRTimelineStore';
import type { PlaybackFrame } from '../types/timeline-playback.types';

describe('useVCRTimelineStore', () => {
  let store: ReturnType<typeof useVCRTimelineStore>;
  let rafId = 0;
  const rafCallbacks = new Map<number, FrameRequestCallback>();

  const mockFrames: PlaybackFrame[] = [
    { stepIndex: 0, canvasStateSnapshot: { array: [64, 34, 25] }, lineNumber: 1, description: 'Khởi tạo mảng' },
    { stepIndex: 1, canvasStateSnapshot: { array: [34, 64, 25] }, lineNumber: 3, description: 'So sánh arr[0] với arr[1]' },
    { stepIndex: 2, canvasStateSnapshot: { array: [34, 25, 64] }, lineNumber: 4, description: 'Hoán vị 64 ↔ 25' },
    { stepIndex: 3, canvasStateSnapshot: { array: [25, 34, 64] }, lineNumber: 5, description: 'Hoàn thành' },
  ];

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
    vi.stubGlobal('performance', { now: vi.fn(() => 0) });
    vi.stubGlobal('CustomEvent', class MockCustomEvent {
      type: string;
      detail: Record<string, unknown>;
      constructor(type: string, options?: { detail?: Record<string, unknown> }) {
        this.type = type;
        this.detail = options?.detail ?? {};
      }
    });
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });

    setActivePinia(createPinia());
    store = useVCRTimelineStore();
  });

  afterEach(() => {
    store.clearTimeline();
    vi.restoreAllMocks();
  });

  // === Initial State ===
  it('should have correct initial state', () => {
    expect(store.currentStep).toBe(0);
    expect(store.totalSteps).toBe(0);
    expect(store.playbackSpeed).toBe(1.0);
    expect(store.status).toBe('PAUSED');
    expect(store.isInitialized).toBe(false);
    expect(store.currentDescription).toBe('Chờ nạp giải thuật');
  });

  it('should report isAtEnd when not initialized', () => {
    expect(store.isAtEnd).toBe(true);
  });

  it('should report isAtStart initially', () => {
    expect(store.isAtStart).toBe(true);
  });

  it('should show 0/0 step label initially', () => {
    expect(store.stepLabel).toBe('0 / 0');
  });

  // === initializeFrames ===
  it('should initialize frames correctly', () => {
    store.initializeFrames(mockFrames);
    expect(store.totalSteps).toBe(4);
    expect(store.currentStep).toBe(0);
    expect(store.status).toBe('PAUSED');
    expect(store.isInitialized).toBe(true);
  });

  it('should set currentDescription after initialize', () => {
    store.initializeFrames(mockFrames);
    expect(store.currentDescription).toBe('Khởi tạo mảng');
  });

  it('should set currentLineNumber after initialize', () => {
    store.initializeFrames(mockFrames);
    expect(store.currentLineNumber).toBe(1);
  });

  it('should set currentSnapshot after initialize', () => {
    store.initializeFrames(mockFrames);
    expect(store.currentSnapshot).toEqual({ array: [64, 34, 25] });
  });

  it('should dispatch CustomEvent on initialize', () => {
    store.initializeFrames(mockFrames);
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('should show correct step label after initialize', () => {
    store.initializeFrames(mockFrames);
    expect(store.stepLabel).toBe('1 / 4');
  });

  it('should re-initialize destroying previous engine', () => {
    store.initializeFrames(mockFrames);
    const newFrames: PlaybackFrame[] = [
      { stepIndex: 0, canvasStateSnapshot: { array: [1] }, lineNumber: 1, description: 'New' },
    ];
    store.initializeFrames(newFrames);
    expect(store.totalSteps).toBe(1);
    expect(store.currentStep).toBe(0);
  });

  // === play / pause ===
  it('should set status to PLAYING on play', () => {
    store.initializeFrames(mockFrames);
    store.play();
    expect(store.status).toBe('PLAYING');
    expect(store.isPlaying).toBe(true);
  });

  it('should set status to PAUSED on pause', () => {
    store.initializeFrames(mockFrames);
    store.play();
    store.pause();
    expect(store.status).toBe('PAUSED');
    expect(store.isPlaying).toBe(false);
  });

  // === togglePlayPause ===
  it('should toggle from PAUSED to PLAYING', () => {
    store.initializeFrames(mockFrames);
    store.togglePlayPause();
    expect(store.status).toBe('PLAYING');
  });

  it('should toggle from PLAYING to PAUSED', () => {
    store.initializeFrames(mockFrames);
    store.play();
    store.togglePlayPause();
    expect(store.status).toBe('PAUSED');
  });

  // === stepForward ===
  it('should step forward updating currentStep', () => {
    store.initializeFrames(mockFrames);
    store.stepForward();
    expect(store.currentStep).toBe(1);
    expect(store.currentDescription).toBe('So sánh arr[0] với arr[1]');
  });

  it('should update lineNumber on step forward', () => {
    store.initializeFrames(mockFrames);
    store.stepForward();
    expect(store.currentLineNumber).toBe(3);
  });

  it('should update snapshot on step forward', () => {
    store.initializeFrames(mockFrames);
    store.stepForward();
    expect(store.currentSnapshot?.array).toEqual([34, 64, 25]);
  });

  // === stepBack ===
  it('should step back updating currentStep', () => {
    store.initializeFrames(mockFrames);
    store.stepForward();
    store.stepForward();
    store.stepBack();
    expect(store.currentStep).toBe(1);
  });

  // === rewind ===
  it('should rewind to step 0', () => {
    store.initializeFrames(mockFrames);
    store.stepForward();
    store.stepForward();
    store.rewind();
    expect(store.currentStep).toBe(0);
    expect(store.isAtStart).toBe(true);
  });

  // === fastForward ===
  it('should fast forward to last step', () => {
    store.initializeFrames(mockFrames);
    store.fastForward();
    expect(store.currentStep).toBe(3);
    expect(store.isAtEnd).toBe(true);
  });

  // === seekTo ===
  it('should seek to specific step', () => {
    store.initializeFrames(mockFrames);
    store.seekTo(2);
    expect(store.currentStep).toBe(2);
    expect(store.currentDescription).toBe('Hoán vị 64 ↔ 25');
  });

  // === changeSpeed ===
  it('should change playback speed', () => {
    store.initializeFrames(mockFrames);
    store.changeSpeed(2.0);
    expect(store.playbackSpeed).toBe(2.0);
  });

  it('should update speed even without engine', () => {
    store.changeSpeed(0.5);
    expect(store.playbackSpeed).toBe(0.5);
  });

  // === progressPercent ===
  it('should compute 0% at step 0', () => {
    store.initializeFrames(mockFrames);
    expect(store.progressPercent).toBe(0);
  });

  it('should compute 100% at last step', () => {
    store.initializeFrames(mockFrames);
    store.fastForward();
    expect(store.progressPercent).toBe(100);
  });

  it('should compute ~33% at step 1 of 4', () => {
    store.initializeFrames(mockFrames);
    store.stepForward();
    expect(store.progressPercent).toBeCloseTo(33.33, 0);
  });

  // === clearTimeline ===
  it('should clear all state on clearTimeline', () => {
    store.initializeFrames(mockFrames);
    store.stepForward();
    store.changeSpeed(2.0);
    store.clearTimeline();

    expect(store.currentStep).toBe(0);
    expect(store.totalSteps).toBe(0);
    expect(store.playbackSpeed).toBe(1.0);
    expect(store.status).toBe('PAUSED');
    expect(store.isInitialized).toBe(false);
    expect(store.currentLineNumber).toBe(0);
    expect(store.currentSnapshot).toBeNull();
  });

  // === loadDemoBubbleSort ===
  it('should load demo Bubble Sort with 12 frames', () => {
    store.loadDemoBubbleSort();
    expect(store.totalSteps).toBe(12);
    expect(store.isInitialized).toBe(true);
    expect(store.currentStep).toBe(0);
  });

  it('should have valid demo data after load', () => {
    store.loadDemoBubbleSort();
    expect(store.currentDescription).toBe('Khởi tạo mảng [64, 34, 25, 12, 22, 11, 90]');
    expect(store.currentSnapshot?.array).toEqual([64, 34, 25, 12, 22, 11, 90]);
  });

  it('should be able to step through demo frames', () => {
    store.loadDemoBubbleSort();
    store.stepForward();
    expect(store.currentStep).toBe(1);
    expect(store.currentDescription).toContain('So sánh');
  });

  // === isAtStart / isAtEnd computed ===
  it('should report isAtStart=true, isAtEnd=false at step 0', () => {
    store.initializeFrames(mockFrames);
    expect(store.isAtStart).toBe(true);
    expect(store.isAtEnd).toBe(false);
  });

  it('should report isAtStart=false, isAtEnd=true at last step', () => {
    store.initializeFrames(mockFrames);
    store.fastForward();
    expect(store.isAtStart).toBe(false);
    expect(store.isAtEnd).toBe(true);
  });

  // === Monaco sync events ===
  it('should dispatch MONACO_REVEAL_LINE_INSIGHT on step', () => {
    store.initializeFrames(mockFrames);
    (window.dispatchEvent as ReturnType<typeof vi.fn>).mockClear();
    store.stepForward();
    const calls = (window.dispatchEvent as ReturnType<typeof vi.fn>).mock.calls;
    const monacoEvent = calls.find(
      (c: any) => c[0].type === 'MONACO_REVEAL_LINE_INSIGHT'
    );
    expect(monacoEvent).toBeDefined();
  });

  it('should dispatch CANVAS_REDRAW_STATE_SNAPSHOT on step', () => {
    store.initializeFrames(mockFrames);
    (window.dispatchEvent as ReturnType<typeof vi.fn>).mockClear();
    store.stepForward();
    const calls = (window.dispatchEvent as ReturnType<typeof vi.fn>).mock.calls;
    const canvasEvent = calls.find(
      (c: any) => c[0].type === 'CANVAS_REDRAW_STATE_SNAPSHOT'
    );
    expect(canvasEvent).toBeDefined();
  });
});
