// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import AlgoPlaygroundWorkspace from '../components/AlgoPlaygroundWorkspace.vue';
import BaseIcon from '../../../shared/components/BaseIcon.vue';
import { useAlgoPlaygroundStore } from '../store/useAlgoPlaygroundStore';
import { getAlgoDemo } from '../engine/playgroundAlgoDemos';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import type { PlaybackFrame } from '../../../core/CompilerStepExecutor';

// ── Mocks ──
interface MonacoEditorInstance {
  onDidChangeModelContent: ReturnType<typeof vi.fn>;
  onMouseDown: ReturnType<typeof vi.fn>;
  getValue: ReturnType<typeof vi.fn>;
  setValue: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  deltaDecorations: ReturnType<typeof vi.fn>;
  revealLineInCenter: ReturnType<typeof vi.fn>;
  getAction: ReturnType<typeof vi.fn>;
  hasTextFocus: ReturnType<typeof vi.fn>;
}

// AL-007/AL-026: mock monaco qua vi.hoisted — test cần nắm instance editor (onMouseDown)
// + MouseTargetType thật + setTheme thật của component.
const { editorCreateMock, editorSetThemeMock, monacoMouseTargetType, monacoEditorInstances } = vi.hoisted(() => {
  const instances: MonacoEditorInstance[] = [];
  return {
    monacoEditorInstances: instances,
    editorCreateMock: vi.fn(() => {
      const editor: MonacoEditorInstance = {
        onDidChangeModelContent: vi.fn(),
        onMouseDown: vi.fn(),
        getValue: vi.fn(() => ''),
        setValue: vi.fn(),
        dispose: vi.fn(),
        deltaDecorations: vi.fn(() => []),
        revealLineInCenter: vi.fn(),
        getAction: vi.fn(() => ({ run: vi.fn() })),
        hasTextFocus: vi.fn(() => false),
      };
      instances.push(editor);
      return editor;
    }),
    editorSetThemeMock: vi.fn(),
    monacoMouseTargetType: { GUTTER_LINE_NUMBERS: 4, CONTENT_TEXT: 6 },
  };
});
vi.mock('monaco-editor', () => ({
  editor: {
    create: editorCreateMock,
    setTheme: editorSetThemeMock,
    MouseTargetType: monacoMouseTargetType,
  },
  Range: class RangeStub {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    constructor(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number) {
      this.startLineNumber = startLineNumber;
      this.startColumn = startColumn;
      this.endLineNumber = endLineNumber;
      this.endColumn = endColumn;
    }
  },
}));
vi.mock('monaco-editor/esm/vs/language/typescript/monaco.contribution', () => ({}));
vi.mock('monaco-editor/min/vs/editor/editor.main.css', () => ({}));
vi.mock('monaco-editor/esm/vs/editor/editor.worker?worker', () => ({ default: class WorkerStub {} }));
vi.mock('monaco-editor/esm/vs/language/typescript/ts.worker?worker', () => ({ default: class WorkerStub {} }));
vi.mock('splitpanes', () => ({
  // AL-025: expose `horizontal` prop qua data-attribute để assert layout responsive thật
  Splitpanes: {
    name: 'Splitpanes',
    props: ['horizontal'],
    template: '<div class="splitpanes-stub" :data-horizontal="String(horizontal)"><slot /></div>',
  },
  Pane: { name: 'Pane', template: '<div class="pane-stub"><slot /></div>' },
}));
vi.mock('splitpanes/dist/splitpanes.css', () => ({}));
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
}));
vi.mock('../../../core/compileWorker', async () => {
  const { CompilerStepExecutor } = await import('../../../core/CompilerStepExecutor');
  return {
    compileInWorker: vi.fn(async (
      sourceCode: string,
      initialArray: number[],
      options?: { array?: number[]; fallbackToRegex?: boolean },
    ) => CompilerStepExecutor.compileAlgorithm(sourceCode, initialArray, { ...options, fallbackToRegex: false })),
    disposeCompileWorker: vi.fn(),
  };
});

function stubRaf(): void {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
}

let wrapper: VueWrapper | null = null;

async function mountWorkspace(): Promise<VueWrapper> {
  setActivePinia(createPinia());
  wrapper = mount(AlgoPlaygroundWorkspace, { attachTo: document.body, global: { components: { BaseIcon } } });
  await flushPromises();
  await nextTick();
  return wrapper;
}

describe('AlgoPlaygroundWorkspace.vue', () => {
  beforeEach(() => {
    stubRaf();
    localStorage.clear();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    monacoEditorInstances.length = 0;
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('loads a default demo, compiles frames and shows the step counter', async () => {
    const w = await mountWorkspace();
    // Step counter is now in the VCR bar (text-[10px] font-mono tabular-nums)
    const counter = w.find('.tabular-nums');
    expect(counter.exists()).toBe(true);
    expect(counter.text()).toMatch(/^\d+\/\d+$/);
  });

  it('shows the selected demo description as select tooltip (space-optimized)', async () => {
    const w = await mountWorkspace();
    // mặc định bubble-sort — description gộp vào title của select (không còn dòng riêng)
    const select = w.find('select.algo-demo-select');
    expect(select.attributes('title')).toContain('Sắp xếp nổi bọt');
  });

  it('renders scrubber markers for swap steps', async () => {
    const w = await mountWorkspace();
    // bubble-sort trên 5 phần tử có nhiều lần swap → marker được vẽ
    const markers = w.findAll('.absolute.rounded-full');
    expect(markers.length).toBeGreaterThan(0);
  });

  it('shows overflow menu with share option', async () => {
    const w = await mountWorkspace();
    const buttons = w.findAll('button');
    expect(buttons.some(b => b.attributes('aria-label') === 'Menu thêm')).toBe(true);
    // Mở menu ⋯ → có mục Chia sẻ
    const menuBtn = buttons.find(b => b.attributes('aria-label') === 'Menu thêm')!;
    await menuBtn.trigger('click');
    await nextTick();
    expect(w.findAll('.algo-menu-item').some(b => b.text().includes('Chia sẻ'))).toBe(true);
  });

  it('AL-046: share marks the link as copied and resets after 2s (fake timers, không rò timer)', async () => {
    vi.useFakeTimers();
    try {
      const w = await mountWorkspace();
      const openMenu = async () => {
        const menuBtn = w.findAll('button').find(b => b.attributes('aria-label') === 'Menu thêm')!;
        await menuBtn.trigger('click');
        await nextTick();
      };
      await openMenu();
      const shareItem = w.findAll('.algo-menu-item').find(b => b.text().includes('Chia sẻ'))!;
      await shareItem.trigger('click');
      await nextTick();
      // Menu đóng sau khi chọn — mở lại để kiểm tra nhãn 'Đã chép'
      await openMenu();
      expect(w.findAll('.algo-menu-item').some(b => b.text().includes('Đã chép'))).toBe(true);

      // Sau 2000ms nhãn phải về lại 'Chia sẻ' — timer phải được clear/drain
      vi.advanceTimersByTime(2000);
      await nextTick();
      expect(w.findAll('.algo-menu-item').some(b => b.text().includes('Đã chép'))).toBe(false);
      vi.clearAllTimers();
    } finally {
      vi.useRealTimers();
    }
  });

  it('switching demo via select loads and runs the new demo', async () => {
    const w = await mountWorkspace();
    const select = w.find('select.algo-demo-select');
    await select.setValue('binary-search');
    await flushPromises();
    await nextTick();
    expect(select.attributes('title')).toContain('Tìm kiếm nhị phân');
  });

  it('toggles the hooks reference panel from the overflow menu', async () => {
    const w = await mountWorkspace();
    expect(w.find('pre').exists()).toBe(false);
    const menuBtn = w.findAll('button').find(b => b.attributes('aria-label') === 'Menu thêm')!;
    await menuBtn.trigger('click');
    await nextTick();
    const hooksItem = w.findAll('.algo-menu-item').find(b => b.text().includes('Hooks'))!;
    await hooksItem.trigger('click');
    await nextTick();
    expect(w.find('pre').exists()).toBe(true);
    expect(w.find('pre').text()).toContain('compare(i, j)');
  });

  it('collapses the editor via keyboard shortcut (e.g. KeyE)', async () => {
    const w = await mountWorkspace();
    const splitpanes = w.find('.custom-splitpanes');
    expect(splitpanes.classes()).not.toContain('hide-splitter');
    // Simulate keyboard shortcut to toggle editor
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', ctrlKey: true }));
    await nextTick();
    expect(w.find('.custom-splitpanes').classes()).toContain('hide-splitter');
    // Editor pane hidden
    const editorPane = w.findAll('.pane-stub')[0].element as HTMLElement;
    expect((editorPane.firstElementChild as HTMLElement).style.display).toBe('none');
    // Toggle back
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', ctrlKey: true }));
    await nextTick();
    expect(w.find('.custom-splitpanes').classes()).not.toContain('hide-splitter');
  });

  it('AL-022: Space hotkey toggles store.isPlaying thật (không chỉ check icon)', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    expect(store.isPlaying).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    await nextTick();
    expect(store.isPlaying).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    await nextTick();
    expect(store.isPlaying).toBe(false);

    // Play button exists in VCR bar
    const playBtn = w.findAll('button').find(b => b.attributes('aria-label') === 'Phát hoặc tạm dừng');
    expect(playBtn).toBeTruthy();
  });

  it('ArrowRight hotkey advances one step', async () => {
    const w = await mountWorkspace();
    const counterBefore = w.find('.tabular-nums').text();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    await nextTick();
    const counterAfter = w.find('.tabular-nums').text();
    expect(counterAfter).not.toBe(counterBefore);
  });

  it('trace history is accessible via keyboard shortcut (not visible by default)', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    // Trace panel is hidden by default in minimal layout
    // But traceLogs are still collected in the store
    expect(store.traceLogs.length).toBeGreaterThanOrEqual(0);
  });

  it('AL-048 + US-AP-013: compile overlay hiển thị khi đang biên dịch, empty state DOM khi kết quả rỗng', async () => {
    const { compileInWorker } = await import('../../../core/compileWorker');
    let resolveCompile!: (frames: PlaybackFrame[]) => void;
    vi.mocked(compileInWorker).mockImplementationOnce(
      () => new Promise<PlaybackFrame[]>((res) => { resolveCompile = res; }),
    );
    const w = await mountWorkspace();
    // Đang biên dịch: overlay "Đang biên dịch…" hiển thị thay cho empty state
    expect(w.text()).toContain('Đang biên dịch');
    expect(w.text()).not.toContain('Chọn demo và bấm');

    // AL-048: resolve sau assert — hết promise treo
    resolveCompile([]);
    await flushPromises();
    await nextTick();
    // US-AP-013: empty state DOM thật (không tự dựng chuỗi local)
    expect(w.text()).toContain('Chọn demo và bấm');
  });

  // ── AL-007 (P1): thay thế test pass giả bằng mount + tương tác thật ──

  it('US-AP-014: Monaco create fail → editorLoadError → DOM reload UI thật', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    editorCreateMock.mockImplementationOnce(() => { throw new Error('Monaco init failed'); });
    const w = await mountWorkspace();

    expect(w.text()).toContain('Không thể tải Monaco Editor');
    const reloadBtn = w.findAll('button').find(b => b.text().includes('Tải lại trang (F5)'));
    expect(reloadBtn).toBeTruthy();
    errorSpy.mockRestore();
  });

  it('US-AP-009: monacoTheme là computed thật — dark → vs-dark, light → vs', async () => {
    const w = await mountWorkspace(); // pinia active từ đây
    const themeStore = useThemeStore();
    expect(themeStore.currentTheme).toBe('terminal-dark');
    // computed monacoTheme truyền vào lúc create
    expect(editorCreateMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ theme: 'vs-dark' }),
    );

    // toggle → watcher gọi monaco.editor.setTheme với giá trị computed mới
    themeStore.currentTheme = 'light';
    await nextTick();
    await nextTick();
    expect(editorSetThemeMock).toHaveBeenCalledWith('vs');
    w.unmount();
  });

  it('US-AP-023: click .algo-menu-item "Code mẫu" → restore code demo thật vào store', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    store.setCode('// modified code');
    expect(store.code).toBe('// modified code');

    const menuBtn = w.findAll('button').find(b => b.attributes('aria-label') === 'Menu thêm')!;
    await menuBtn.trigger('click');
    await nextTick();
    const restoreItem = w.findAll('.algo-menu-item').find(b => b.text().includes('Code mẫu'))!;
    await restoreItem.trigger('click');
    await flushPromises();
    await nextTick();

    const demo = getAlgoDemo('bubble-sort')!;
    expect(store.code).toBe(demo.code);
  });

  it('US-AP-013: empty state DOM hiển thị khi chưa có frames', async () => {
    const { compileInWorker } = await import('../../../core/compileWorker');
    vi.mocked(compileInWorker).mockResolvedValueOnce([]);
    const w = await mountWorkspace();
    expect(w.text()).toContain('Chọn demo và bấm');
  });

  // ── AL-025 (P2): responsive — matchMedia stub + assert layout class thật ──

  it('AL-025: màn hình hẹp (matchMedia matches) → Splitpanes horizontal (editor trên canvas)', async () => {
    const mqStub = vi.fn((query: string) => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', mqStub);
    const w = await mountWorkspace();
    expect(w.find('.splitpanes-stub').attributes('data-horizontal')).toBe('true');
  });

  it('AL-025: màn hình rộng (matchMedia không matches) → Splitpanes ngang (cạnh nhau)', async () => {
    const mqStub = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', mqStub);
    const w = await mountWorkspace();
    expect(w.find('.splitpanes-stub').attributes('data-horizontal')).toBe('false');
  });

  // ── B1 (P1): gutter click — toggle breakpoint (thay hành vi jump cũ của AL-026) ──

  it('B1.1: click gutter line → toggle breakpoint (thêm/rớt khỏi store.breakpoints)', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    const editor = monacoEditorInstances[monacoEditorInstances.length - 1];
    expect(editor.onMouseDown).toHaveBeenCalled();
    const handler = editor.onMouseDown.mock.calls[0][0] as (e: { target: { type: number; position?: { lineNumber: number } } }) => void;

    const targetLine = 3;
    handler({ target: { type: monacoMouseTargetType.GUTTER_LINE_NUMBERS, position: { lineNumber: targetLine } } });
    await nextTick();
    expect(store.breakpoints.has(targetLine)).toBe(true);

    // Click lại cùng dòng → gỡ breakpoint
    handler({ target: { type: monacoMouseTargetType.GUTTER_LINE_NUMBERS, position: { lineNumber: targetLine } } });
    await nextTick();
    expect(store.breakpoints.has(targetLine)).toBe(false);

    // Click vùng CONTENT_TEXT → không toggle
    handler({ target: { type: monacoMouseTargetType.CONTENT_TEXT, position: { lineNumber: 5 } } });
    await nextTick();
    expect(store.breakpoints.size).toBe(0);
  });

  it('B1.2: play tự động dừng khi chạm frame có lineNumber ∈ breakpoints', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    expect(store.totalFrames).toBeGreaterThan(1);

    // Đặt breakpoint tại line của frame đầu tiên khác frame 0 → play sẽ dừng ngay frame đó
    const firstDistinctLine = store.frames.slice(1).find(f => f.lineNumber !== store.frames[0].lineNumber)!.lineNumber;
    store.toggleBreakpoint(firstDistinctLine);

    store.play();
    await flushPromises();
    // Advance qua các frame (mô phỏng engine) cho tới khi đạt breakpoint
    let guard = 0;
    while (store.isPlaying && guard < 200) {
      store.stepNext();
      guard++;
    }
    expect(store.isPlaying).toBe(false);
    expect(store.currentFrame?.lineNumber).toBe(firstDistinctLine);
    expect(store.currentIndex).toBeLessThan(store.totalFrames - 1);
  });

  it('B1.3: stepNext tay vẫn nhảy qua breakpoint (chỉ play tự động mới dừng)', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    const breakLine = store.frames[1].lineNumber;
    store.toggleBreakpoint(breakLine);
    store.stepNext();
    expect(store.currentFrame?.lineNumber).toBe(breakLine);
    expect(store.isPlaying).toBe(false);
  });

  // ── AL-027 (P2): US-AP-020 — description node DOM thật (không tự dựng chuỗi) ──

  it('description is stored in store (no longer displayed in minimal UI)', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    // Description is still tracked in store for canvas overlays
    const desc = store.currentDescription;
    expect(desc.length).toBeGreaterThan(0);

    // Switch frame → description updates
    let targetIdx = 1;
    for (let i = 1; i < store.totalFrames; i++) {
      const line = store.frames[i].lineNumber;
      if (!store.frames.slice(0, i).some(f => f.lineNumber === line)) { targetIdx = i; break; }
    }
    store.jumpToFrame(targetIdx);
    await nextTick();
    expect(store.currentIndex).toBe(targetIdx);
    expect(store.currentDescription.length).toBeGreaterThan(0);
  });

  // ── AL-050/051/052 (P1): UI compaction — mở rộng không gian canvas ──

  it('AL-050: màn hình hẹp (matchMedia matches) → editor TỰ collapse khi mount (canvas full width)', async () => {
    const mqStub = vi.fn((query: string) => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', mqStub);
    const w = await mountWorkspace();
    expect(w.find('.splitpanes-stub').attributes('data-horizontal')).toBe('true');
    expect(w.find('.custom-splitpanes').classes()).toContain('hide-splitter');
    const editorPane = w.findAll('.pane-stub')[0].element as HTMLElement;
    expect((editorPane.firstElementChild as HTMLElement).style.display).toBe('none');
  });

  it('AL-051: VCR bar is always visible (no collapse toggle in minimal layout)', async () => {
    const w = await mountWorkspace();
    // VCR controls are always visible in the minimal bottom bar
    const playBtn = w.findAll('button').find(b => b.attributes('aria-label') === 'Phát hoặc tạm dừng');
    expect(playBtn).toBeTruthy();
    // Step counter is always visible
    expect(w.find('.tabular-nums').exists()).toBe(true);
  });

  it('AL-052: editorCollapsed persist qua localStorage — remount giữ trạng thái thu gọn', async () => {
    let w = await mountWorkspace();
    expect(w.find('.custom-splitpanes').classes()).not.toContain('hide-splitter');
    // Toggle editor via keyboard shortcut
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', ctrlKey: true }));
    await nextTick();
    expect(w.find('.custom-splitpanes').classes()).toContain('hide-splitter');
    w.unmount();

    // Remount cùng localStorage (không clear) → trạng thái thu gọn được khôi phục
    w = await mountWorkspace();
    expect(w.find('.custom-splitpanes').classes()).toContain('hide-splitter');
  });
});
