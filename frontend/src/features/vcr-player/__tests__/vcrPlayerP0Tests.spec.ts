// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { useVcrStore } from '../store/useVcrStore';
import VcrDockBar from '../components/VcrDockBar.vue';

const mockCompile = vi.fn();

vi.mock('../../../core/CompilerStepExecutor', () => ({
  CompilerStepExecutor: {
    compileAlgorithm: (...args: unknown[]) => mockCompile(...args),
  },
}));

function makeFrames(count: number): Array<{ stepIndex: number; lineNumber: number; description: string }> {
  return Array.from({ length: count }, (_, i) => ({
    stepIndex: i,
    lineNumber: i + 1,
    description: `Step ${i + 1}`,
  }));
}

describe('VCR-001 (P0): Speed select — playbackSpeed thay đổi', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCompile.mockReset();
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
    mockCompile.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('togglePlay bật play khi đang pause', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(2));

    expect(store.isPlaying).toBe(false);

    store.togglePlay();
    await nextTick();

    expect(store.isPlaying).toBe(true);
  });

  it('togglePlay tắt play khi đang playing', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(1));

    store.play();
    await nextTick();
    expect(store.isPlaying).toBe(true);

    store.togglePlay();
    expect(store.isPlaying).toBe(false);
  });

  it('play tự động compileAndLoad nếu chưa có frames', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(2));

    expect(store.totalFrames).toBe(0);

    store.play();
    await nextTick();

    expect(store.totalFrames).toBe(2);
    expect(store.isPlaying).toBe(true);
  });

  it('pause dừng playback', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(1));

    store.play();
    await nextTick();
    expect(store.isPlaying).toBe(true);

    store.pause();
    expect(store.isPlaying).toBe(false);
  });

  it('play ở frame cuối replay từ frame 0 (EC-003)', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(3));

    store.play();
    await nextTick();
    store.pause();
    store.jumpToFrame(2);
    expect(store.isAtEnd).toBe(true);

    store.play();
    await nextTick();

    expect(store.currentFrameIndex).toBe(0);
    expect(store.isPlaying).toBe(true);
  });
});

describe('VCR-005 (P0): Step Next disabled — disabled ở frame cuối', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCompile.mockReset();
  });

  it('isAtEnd = true ở frame cuối cùng', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(3));

    store.compileAndLoad();
    store.jumpToFrame(2);

    expect(store.isAtEnd).toBe(true);
    expect(store.currentFrameIndex).toBe(2);
  });

  it('isAtEnd = false ở frame đầu tiên', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(2));

    store.compileAndLoad();

    expect(store.isAtEnd).toBe(false);
    expect(store.currentFrameIndex).toBe(0);
  });

  it('stepNext không vượt quá frame cuối', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(2));

    store.compileAndLoad();
    store.jumpToFrame(1);

    expect(store.isAtEnd).toBe(true);

    store.stepNext();
    expect(store.currentFrameIndex).toBe(1);
  });
});

describe('EC-012 (P0): VcrDockBar boundary disabled states (mount)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCompile.mockReset();
  });

  function mountDockBar() {
    return mount(VcrDockBar, {
      global: {
        stubs: {
          BaseIcon: { template: '<svg><g></g></svg>', props: ['name'] },
        },
      },
    });
  }

  it('Next/Prev/Play đều disabled khi chưa có frames', () => {
    const wrapper = mountDockBar();

    expect(wrapper.find('button[aria-label="Bước tiếp theo"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('button[aria-label="Bước trước"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('button[aria-label="Phát"]').attributes('disabled')).toBeDefined();
  });

  it('Prev disabled ở frame 0, Next enabled', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(3));
    store.compileAndLoad();

    const wrapper = mountDockBar();

    expect(wrapper.find('button[aria-label="Bước trước"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('button[aria-label="Bước tiếp theo"]').attributes('disabled')).toBeUndefined();
  });

  it('Next disabled ở frame cuối khi không loop', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(3));
    store.compileAndLoad();
    store.jumpToFrame(2);

    const wrapper = mountDockBar();

    expect(wrapper.find('button[aria-label="Bước tiếp theo"]').attributes('disabled')).toBeDefined();
  });

  it('Next enabled ở frame cuối khi isLooping = true', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(3));
    store.compileAndLoad();
    store.isLooping = true;
    store.jumpToFrame(2);

    const wrapper = mountDockBar();

    expect(wrapper.find('button[aria-label="Bước tiếp theo"]').attributes('disabled')).toBeUndefined();
  });
});

describe('VCR-011 (P1): Looping — isLooping toggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCompile.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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
    mockCompile.mockReturnValue(makeFrames(2));

    store.compileAndLoad();
    store.jumpToFrame(1);
    store.isLooping = true;

    expect(store.isAtEnd).toBe(true);

    store.stepNext();
    expect(store.currentFrameIndex).toBe(0);
  });

  it('khi isLooping = false, stepNext ở frame cuối giữ nguyên và ép pause', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(2));

    store.compileAndLoad();
    store.jumpToFrame(1);
    store.isLooping = false;

    store.stepNext();
    expect(store.currentFrameIndex).toBe(1);
    expect(store.isPlaying).toBe(false);
  });
});

describe('EC-040 (P0): Ticker — interval advance với fake timers', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCompile.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('play tiến 1 frame sau đúng 1000/speed ms', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(3));

    store.play();
    await nextTick();
    expect(store.currentFrameIndex).toBe(0);

    vi.advanceTimersByTime(999);
    expect(store.currentFrameIndex).toBe(0);

    vi.advanceTimersByTime(1);
    expect(store.currentFrameIndex).toBe(1);
  });

  it('pause giữ nguyên frame — ticker dừng hẳn', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(5));

    store.play();
    await nextTick();
    vi.advanceTimersByTime(1100);
    expect(store.currentFrameIndex).toBe(1);

    store.pause();
    await nextTick();
    vi.advanceTimersByTime(5000);
    expect(store.currentFrameIndex).toBe(1);
    expect(store.isPlaying).toBe(false);
  });

  it('đổi speed giữa lúc play thay đổi chu kỳ ticker', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(5));

    store.play();
    await nextTick();

    store.playbackSpeed = 2;
    await nextTick();

    vi.advanceTimersByTime(499);
    expect(store.currentFrameIndex).toBe(0);

    vi.advanceTimersByTime(1);
    expect(store.currentFrameIndex).toBe(1);
  });

  it('frame cuối không loop → tự dừng (isPlaying = false)', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(3));

    store.play();
    await nextTick();
    vi.advanceTimersByTime(3000);

    expect(store.currentFrameIndex).toBe(2);
    expect(store.isPlaying).toBe(false);

    await nextTick();
    vi.advanceTimersByTime(5000);
    expect(store.currentFrameIndex).toBe(2);
    expect(store.isPlaying).toBe(false);
  });
});

describe('EC-002/EC-005 (P0): Step ép pause + debounce 100ms', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCompile.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stepNext khi đang play ép pause (EC-002)', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(4));

    store.play();
    await nextTick();
    expect(store.isPlaying).toBe(true);

    store.stepNext();
    expect(store.isPlaying).toBe(false);
    expect(store.currentFrameIndex).toBe(1);

    await nextTick();
    vi.advanceTimersByTime(5000);
    expect(store.currentFrameIndex).toBe(1);
  });

  it('stepPrev khi đang play ép pause (EC-002)', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(4));

    store.play();
    await nextTick();
    store.pause();
    store.jumpToFrame(2);
    store.play();
    await nextTick();
    expect(store.isPlaying).toBe(true);

    store.stepPrev();
    expect(store.isPlaying).toBe(false);
    expect(store.currentFrameIndex).toBe(1);
  });

  it('spam stepNext trong <100ms chỉ tiến 1 bước (EC-005)', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(5));

    store.compileAndLoad();
    store.stepNext();
    store.stepNext();
    store.stepNext();
    expect(store.currentFrameIndex).toBe(1);

    vi.advanceTimersByTime(100);
    store.stepNext();
    expect(store.currentFrameIndex).toBe(2);
  });

  it('stepPrev cũng bị debounce 100ms (EC-005)', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(5));

    store.compileAndLoad();
    store.jumpToFrame(3);
    store.stepPrev();
    store.stepPrev();
    expect(store.currentFrameIndex).toBe(2);
  });
});

describe('EC-042/EC-043 (P1): Nhánh lỗi biên dịch + jumpToFrame OOB', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockCompile.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('compile lỗi → compilationError được set, play không bật isPlaying (EC-042)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const store = useVcrStore();
    mockCompile.mockImplementation(() => {
      throw new Error('Lỗi cú pháp JavaScript: unexpected token');
    });

    store.play();
    expect(store.compilationError).toContain('Lỗi cú pháp');
    expect(store.totalFrames).toBe(0);
    expect(store.isPlaying).toBe(false);

    vi.advanceTimersByTime(100);
    expect(store.isPlaying).toBe(false);
    consoleSpy.mockRestore();
  });

  it('frames rỗng → play() no-op, không throw (EC-042)', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue([]);

    expect(() => store.play()).not.toThrow();
    expect(store.isPlaying).toBe(false);
    expect(store.totalFrames).toBe(0);
  });

  it('jumpToFrame chặn index âm / vượt biên (EC-043)', () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(3));
    store.compileAndLoad();

    store.jumpToFrame(-1);
    expect(store.currentFrameIndex).toBe(0);

    store.jumpToFrame(99);
    expect(store.currentFrameIndex).toBe(0);

    store.jumpToFrame(2);
    expect(store.currentFrameIndex).toBe(2);
  });

  it('scrub (jumpToFrame) trong lúc play → pause, ticker dừng (EC-001)', async () => {
    const store = useVcrStore();
    mockCompile.mockReturnValue(makeFrames(5));

    store.play();
    await nextTick();
    expect(store.isPlaying).toBe(true);

    store.jumpToFrame(1);
    expect(store.isPlaying).toBe(false);
    expect(store.currentFrameIndex).toBe(1);

    await nextTick();
    vi.advanceTimersByTime(5000);
    expect(store.currentFrameIndex).toBe(1);
  });
});
