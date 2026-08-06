import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVcrStore } from '../store/useVcrStore';

const mockCompile = vi.fn();

vi.mock('../../../core/CompilerStepExecutor', () => ({
  CompilerStepExecutor: {
    compileAlgorithm: (...args: unknown[]) => mockCompile(...args),
  },
}));

describe('VCR-001 (P0): Speed select — playbackSpeed thay đổi', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('playbackSpeed mặc định = 1', () => {
    const store = useVcrStore();
    expect(store.playbackSpeed).toBe(1);
  });

  it('playbackSpeed có thể thay đổi thành 0.5', () => {
    const store = useVcrStore();
    store.playbackSpeed = 0.5;

    expect(store.playbackSpeed).toBe(0.5);
  });

  it('playbackSpeed có thể thay đổi thành 2', () => {
    const store = useVcrStore();
    store.playbackSpeed = 2;

    expect(store.playbackSpeed).toBe(2);
  });
});

describe('VCR-003 (P0): Play/Pause — togglePlay()', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('togglePlay bật play khi đang pause', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
      { stepIndex: 1, lineNumber: 2, description: 'Step 2' },
    ]);

    expect(store.isPlaying).toBe(false);

    store.togglePlay();

    expect(store.isPlaying).toBe(true);
  });

  it('togglePlay tắt play khi đang playing', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
    ]);

    store.play();
    expect(store.isPlaying).toBe(true);

    store.togglePlay();
    expect(store.isPlaying).toBe(false);
  });

  it('play tự động compileAndLoad nếu chưa có frames', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
      { stepIndex: 1, lineNumber: 2, description: 'Step 2' },
    ]);

    expect(store.totalFrames).toBe(0);

    store.play();

    expect(store.totalFrames).toBe(2);
    expect(store.isPlaying).toBe(true);
  });

  it('pause dừng playback', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
    ]);

    store.play();
    expect(store.isPlaying).toBe(true);

    store.pause();
    expect(store.isPlaying).toBe(false);
  });
});

describe('VCR-005 (P0): Step Next disabled — disabled ở frame cuối', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('isAtEnd = true ở frame cuối cùng', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
      { stepIndex: 1, lineNumber: 2, description: 'Step 2' },
      { stepIndex: 2, lineNumber: 3, description: 'Step 3' },
    ]);

    store.compileAndLoad();
    store.jumpToFrame(2);

    expect(store.isAtEnd).toBe(true);
    expect(store.currentFrameIndex).toBe(2);
  });

  it('isAtEnd = false ở frame đầu tiên', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
      { stepIndex: 1, lineNumber: 2, description: 'Step 2' },
    ]);

    store.compileAndLoad();

    expect(store.isAtEnd).toBe(false);
    expect(store.currentFrameIndex).toBe(0);
  });

  it('stepNext không vượt quá frame cuối', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
      { stepIndex: 1, lineNumber: 2, description: 'Step 2' },
    ]);

    store.compileAndLoad();
    store.jumpToFrame(1);

    expect(store.isAtEnd).toBe(true);

    store.stepNext();
    expect(store.currentFrameIndex).toBe(1);
  });

  it('VcrControls Next button disabled ở frame cuối', () => {
    const fs = require('fs');
    const path = require('path');
    const headerSource = fs.readFileSync(
      path.resolve(__dirname, '../../../components/VcrControls.vue'),
      'utf-8'
    );

    expect(headerSource).toContain(':disabled="currentIndex >= totalFrames - 1"');
  });
});

describe('VCR-011 (P1): Looping — isLooping toggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('isLooping mặc định = false', () => {
    const store = useVcrStore();
    expect(store.isLooping).toBe(false);
  });

  it('isLooping có thể toggle thành true', () => {
    const store = useVcrStore();
    store.isLooping = true;

    expect(store.isLooping).toBe(true);
  });

  it('isLooping toggle ngược về false', () => {
    const store = useVcrStore();
    store.isLooping = true;
    expect(store.isLooping).toBe(true);

    store.isLooping = false;
    expect(store.isLooping).toBe(false);
  });

  it('khi isLooping = true, stepNext ở frame cuối quay về frame 0', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
      { stepIndex: 1, lineNumber: 2, description: 'Step 2' },
    ]);

    store.compileAndLoad();
    store.jumpToFrame(1);
    store.isLooping = true;

    expect(store.isAtEnd).toBe(true);

    store.stepNext();
    expect(store.currentFrameIndex).toBe(0);
  });

  it('khi isLooping = false, stepNext ở frame cuối giữ nguyên', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([
      { stepIndex: 0, lineNumber: 1, description: 'Step 1' },
      { stepIndex: 1, lineNumber: 2, description: 'Step 2' },
    ]);

    store.compileAndLoad();
    store.jumpToFrame(1);
    store.isLooping = false;

    store.stepNext();
    expect(store.currentFrameIndex).toBe(1);
    expect(store.isPlaying).toBe(false);
  });
});
