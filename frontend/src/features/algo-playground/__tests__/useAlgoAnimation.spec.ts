// @vitest-environment jsdom
// AL-008 (P1): rAF stub tick — play→pause giữa transition→resume; advance ở frame
// cuối dừng playback; đổi demoId/setSpeed giữa chừng; watcher isPlaying/frames
// (bắt race AL-003: sau compile frames mới, engine phải play nếu store.isPlaying).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useAlgoAnimation } from '../composables/useAlgoAnimation';
import { useAlgoPlaygroundStore } from '../store/useAlgoPlaygroundStore';
import { compileInWorker } from '../../../core/compileWorker';
import type { PlaybackFrame, CanvasStateSnapshot } from '../../../core/CompilerStepExecutor';

// Mock Web Worker: compile đồng bộ (hết promise treo — AL-048 tinh thần).
vi.mock('../../../core/compileWorker', async () => {
  const { CompilerStepExecutor } = await import('../../../core/CompilerStepExecutor');
  return {
    compileInWorker: vi.fn(async (
      sourceCode: string,
      initialArray: number[],
      options?: { array?: number[]; fallbackToRegex?: boolean },
    ) => {
      return CompilerStepExecutor.compileAlgorithm(sourceCode, initialArray, {
        ...options,
        fallbackToRegex: false,
      });
    }),
  };
});

type CtxMock = Record<string, ReturnType<typeof vi.fn>>;

function makeCtx(): CtxMock {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    setLineDash: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
  };
}

function makeFakeCanvas(): HTMLCanvasElement {
  return {
    width: 0,
    height: 0,
    clientWidth: 400,
    clientHeight: 300,
    getContext: () => makeCtx(),
  } as unknown as HTMLCanvasElement;
}

const TestHost = defineComponent({
  setup() {
    const canvasEl = ref<HTMLCanvasElement | null>(makeFakeCanvas());
    const store = useAlgoPlaygroundStore();
    const anim = useAlgoAnimation(canvasEl, store);
    return { anim, store };
  },
  render() {
    return h('div', { id: 'test-host' });
  },
});

interface HostVm {
  anim: ReturnType<typeof useAlgoAnimation>;
  store: ReturnType<typeof useAlgoPlaygroundStore>;
}

let rafCb: ((ts: number) => void) | null = null;

describe('useAlgoAnimation — AL-008 (P1): engine playback lifecycle', () => {
  let wrapper: VueWrapper | null = null;

  function host(): HostVm {
    return wrapper!.vm as unknown as HostVm;
  }

  async function mountHost(): Promise<HostVm> {
    setActivePinia(createPinia());
    wrapper = mount(TestHost);
    await nextTick();
    return host();
  }

  beforeEach(() => {
    rafCb = null;
    vi.stubGlobal('requestAnimationFrame', (cb: (ts: number) => void) => { rafCb = cb; return 1; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('play → engine plays → rAF tick advance một frame (stepNext)', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    store.loadDemo('bubble-sort');
    await store.run();
    await nextTick();
    expect(store.currentIndex).toBe(0);

    store.play();
    await nextTick();
    expect(h0.anim.engine.isPlaying).toBe(true);

    (h0.anim.engine as unknown as { progress: number }).progress = 0.99;
    rafCb?.(performance.now() + 1000);
    expect(store.currentIndex).toBe(1);
  });

  it('pause giữa transition → engine đứng + snap; resume → chạy tiếp từ đầu transition', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    store.loadDemo('bubble-sort');
    await store.run();
    await nextTick();

    store.play();
    await nextTick();
    // Tick một phần: progress vào (0,1) — đang giữa transition
    const now = performance.now();
    rafCb?.(now + 32);
    const midProgress = (h0.anim.engine as unknown as { progress: number }).progress;
    expect(midProgress).toBeGreaterThan(0);
    expect(midProgress).toBeLessThan(1);

    store.pause();
    await nextTick();
    expect(h0.anim.engine.isPlaying).toBe(false);
    expect((h0.anim.engine as unknown as { progress: number }).progress).toBe(1); // snapToCurrent
    expect(vi.mocked(cancelAnimationFrame)).toHaveBeenCalled();

    // Resume: transition mới bắt đầu từ 0 và advance được
    store.play();
    await nextTick();
    // progress ≈ 0 (chỉ sai số epsilon do 2 lần performance.now() lệch nhau)
    expect((h0.anim.engine as unknown as { progress: number }).progress).toBeLessThan(0.001);
    expect(h0.anim.engine.isPlaying).toBe(true);
    const idxBefore = store.currentIndex;
    (h0.anim.engine as unknown as { progress: number }).progress = 0.99;
    rafCb?.(performance.now() + 1000);
    expect(store.currentIndex).toBe(idxBefore + 1);
  });

  it('advance ở frame cuối → store.isPlaying=false + engine dừng', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    store.loadDemo('bubble-sort');
    await store.run();
    await nextTick();
    const lastIdx = store.totalFrames - 1;
    store.jumpToFrame(lastIdx);
    store.isPlaying = true; // engine phải play theo watcher isPlaying
    await nextTick();
    expect(h0.anim.engine.isPlaying).toBe(true);

    (h0.anim.engine as unknown as { progress: number }).progress = 0.99;
    rafCb?.(performance.now() + 1000); // advance vượt frame cuối
    await nextTick();
    expect(store.isPlaying).toBe(false);
    expect(h0.anim.engine.isPlaying).toBe(false);
  });

  it('đổi demoId giữa chừng → engine.setAlgorithm chạy (watcher demoId)', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    store.loadDemo('bubble-sort');
    await store.run();
    await nextTick();
    expect((h0.anim.engine as unknown as { algorithmId: string }).algorithmId).toBe('bubble-sort');

    store.loadDemo('binary-search');
    await nextTick();
    expect((h0.anim.engine as unknown as { algorithmId: string }).algorithmId).toBe('binary-search');
  });

  it('setSpeed giữa chừng → engine nhận tốc độ mới (watcher playbackSpeed)', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    store.loadDemo('bubble-sort');
    await store.run();
    await nextTick();
    expect((h0.anim.engine as unknown as { _speed: number })._speed).toBe(1);

    store.playbackSpeed = 3;
    await nextTick();
    expect((h0.anim.engine as unknown as { _speed: number })._speed).toBe(3);
  });

  it('race AL-003: play trước compile → engine auto-play khi frames mới về', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    expect(store.totalFrames).toBe(0);

    // Khóa compile lại: đảm bảo isPlaying chưa bật khi frames chưa về
    let resolveCompile!: (frames: PlaybackFrame[]) => void;
    vi.mocked(compileInWorker).mockImplementationOnce(
      () => new Promise<PlaybackFrame[]>((res) => { resolveCompile = res; }),
    );

    store.play(); // chưa có frames → run() + pendingPlayAfterCompile
    await nextTick();
    expect(store.isPlaying).toBe(false);
    expect(store.isCompiling).toBe(true);

    // Compile xong với frames thật → store tự play + engine play (hết race)
    const realImpl = vi.mocked(compileInWorker).getMockImplementation();
    const demo = await import('../engine/playgroundAlgoDemos');
    const options = (await import('../engine/AlgoInputParser')).AlgoInputParser.parse(
      demo.getAlgoDemo('bubble-sort')!.defaultInput,
      'array' as never,
    );
    const frames = await realImpl!(demo.getAlgoDemo('bubble-sort')!.code, [], { ...options, fallbackToRegex: false });
    resolveCompile(frames);
    await flushPromises();
    await nextTick();
    expect(store.totalFrames).toBeGreaterThan(0);
    expect(store.isPlaying).toBe(true);
    // Watcher frames chạy (engine.pause) rồi watcher isPlaying (engine.play) → trạng thái cuối = PLAY
    expect(h0.anim.engine.isPlaying).toBe(true);
  });

  it('frames mới về khi KHÔNG play → engine đứng im (không tự phát)', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    store.run();
    await flushPromises();
    await nextTick();
    expect(store.totalFrames).toBeGreaterThan(0);
    expect(store.isPlaying).toBe(false);
    expect(h0.anim.engine.isPlaying).toBe(false);
    expect(rafCb).toBeNull(); // không có vòng lặp rAF nào đang chờ (EC-008)
  });

  it('onStepNext/onStepPrev/onJumpToFrame snap engine về frame tĩnh', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    store.loadDemo('bubble-sort');
    await store.run();
    await nextTick();

    h0.anim.onStepNext();
    expect(store.currentIndex).toBe(1);
    expect((h0.anim.engine as unknown as { progress: number }).progress).toBe(1);

    h0.anim.onStepPrev();
    expect(store.currentIndex).toBe(0);

    h0.anim.onJumpToFrame(3);
    expect(store.currentIndex).toBe(3);
    expect((h0.anim.engine as unknown as { progress: number }).progress).toBe(1);
  });

  it('unmount → engine.destroy() (ngừng rAF, không rò)', async () => {
    const h0 = await mountHost();
    const store = h0.store;
    store.loadDemo('bubble-sort');
    await store.run();
    await nextTick();
    store.play();
    await nextTick();
    expect(rafCb).not.toBeNull();

    wrapper!.unmount();
    wrapper = null;
    expect(vi.mocked(cancelAnimationFrame)).toHaveBeenCalled();
    const engine = h0.anim.engine as unknown as { _running: boolean; canvas: unknown; ctx: unknown };
    expect(engine._running).toBe(false);
    expect(engine.canvas).toBeNull();
    expect(engine.ctx).toBeNull();
  });

  it('unmount khi chưa có canvas → không throw', async () => {
    setActivePinia(createPinia());
    let engine!: ReturnType<typeof useAlgoAnimation>['engine'];
    const HostNoCanvas = defineComponent({
      setup() {
        const canvasEl = ref<HTMLCanvasElement | null>(null);
        const store = useAlgoPlaygroundStore();
        const anim = useAlgoAnimation(canvasEl, store);
        engine = anim.engine;
        return { anim, store };
      },
      render() {
        return h('div');
      },
    });
    const w = mount(HostNoCanvas);
    await nextTick();
    expect(() => w.unmount()).not.toThrow();
  });
});

describe('useAlgoAnimation — syncSnapshots (bước 0: prev = curr)', () => {
  let wrapper: VueWrapper | null = null;

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('ở bước 0 prev=curr → engine.setSnapshots nhận 2 snapshot không null', async () => {
    vi.stubGlobal('requestAnimationFrame', (cb: (ts: number) => void) => { rafCb = cb; return 1; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    setActivePinia(createPinia());
    const store = useAlgoPlaygroundStore();
    store.loadDemo('bubble-sort');
    await store.run();

    const Host = defineComponent({
      setup() {
        const canvasEl = ref<HTMLCanvasElement | null>(makeFakeCanvas());
        const anim = useAlgoAnimation(canvasEl, store);
        return { anim, store };
      },
      render() {
        return h('div');
      },
    });
    wrapper = mount(Host);
    await nextTick();
    const engine = store;
    const anim = (wrapper.vm as unknown as { anim: ReturnType<typeof useAlgoAnimation> }).anim;
    const s = anim.engine as unknown as { prev: CanvasStateSnapshot | null; curr: CanvasStateSnapshot | null };
    expect(engine.totalFrames).toBeGreaterThan(0);
    expect(s.prev).not.toBeNull();
    expect(s.curr).not.toBeNull();
  });
});
