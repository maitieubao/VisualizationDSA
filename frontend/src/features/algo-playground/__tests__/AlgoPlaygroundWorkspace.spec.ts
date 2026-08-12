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
    const counter = w.find('.text-accent');
    expect(counter.exists()).toBe(true);
    expect(counter.text()).toMatch(/^Bước 1\/\d+$/);
  });

  it('shows the selected demo description as select tooltip (space-optimized)', async () => {
    const w = await mountWorkspace();
    // mặc định bubble-sort — description gộp vào title của select (không còn dòng riêng)
    const select = w.find('select.algo-demo-select');
    expect(select.attributes('title')).toContain('Sắp xếp nổi bọt');
  });

  it('shows complexity chips and live input validation hint inline', async () => {
    const w = await mountWorkspace();
    expect(w.text()).toContain('O(n²)'); // bubble-sort
    expect(w.text()).toContain('5 phần tử'); // default input 5, 3, 8, 4, 2 (inline trong ô input)
    expect(w.find('svg.base-icon').exists()).toBe(true);
  });

  it('renders scrubber markers for swap steps', async () => {
    const w = await mountWorkspace();
    // bubble-sort trên 5 phần tử có nhiều lần swap → marker được vẽ
    expect(w.findAll('.scrubber-marker').length).toBeGreaterThan(0);
  });

  it('shows fullscreen button and overflow menu with share', async () => {
    const w = await mountWorkspace();
    const buttons = w.findAll('button');
    expect(buttons.some(b => b.attributes('aria-label') === 'Toàn màn hình')).toBe(true);
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

  it('collapses the editor to give the canvas full width', async () => {
    const w = await mountWorkspace();
    const splitpanes = w.find('.custom-splitpanes');
    expect(splitpanes.classes()).not.toContain('hide-splitter');
    const toggle = w.findAll('button').find(b => b.attributes('title')?.includes('Ẩn editor'))!;
    await toggle.trigger('click');
    await nextTick();
    expect(w.find('.custom-splitpanes').classes()).toContain('hide-splitter');
    // Editor bị v-show ẩn (div con đầu tiên của pane editor có display:none)
    const editorPane = w.findAll('.pane-stub')[0].element as HTMLElement;
    expect((editorPane.firstElementChild as HTMLElement).style.display).toBe('none');
    // Mở lại
    const showBtn = w.findAll('button').find(b => b.attributes('title')?.includes('Hiện editor'))!;
    await showBtn.trigger('click');
    await nextTick();
    expect(w.find('.custom-splitpanes').classes()).not.toContain('hide-splitter');
  });

  it('random input button generates and runs new input', async () => {
    const w = await mountWorkspace();
    const input = w.find('input.algo-input');
    const before = (input.element as HTMLInputElement).value;
    const randomBtn = w.findAll('button').find(b => b.attributes('aria-label') === 'Sinh dữ liệu ngẫu nhiên');
    expect(randomBtn).toBeTruthy();
    await randomBtn!.trigger('click');
    await flushPromises();
    await nextTick();
    const after = (w.find('input.algo-input').element as HTMLInputElement).value;
    expect(after).not.toBe(before);
    expect(after.length).toBeGreaterThan(0);
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

    const playBtn = w.findAll('button').find(b => b.attributes('aria-label') === 'Phát hoặc tạm dừng');
    expect(playBtn).toBeTruthy();
  });

  it('ArrowRight hotkey advances one step', async () => {
    const w = await mountWorkspace();
    const counterBefore = w.find('.text-accent').text();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' }));
    await nextTick();
    const counterAfter = w.find('.text-accent').text();
    expect(counterAfter).not.toBe(counterBefore);
  });

  it('trace history panel lists real events and filters junk frames', async () => {
    const w = await mountWorkspace();
    const traceBtn = w.findAll('button').find(b => b.text().includes('Lịch sử'));
    expect(traceBtn).toBeTruthy();
    await traceBtn!.trigger('click');
    await nextTick();
    const logItems = w.findAll('div.overflow-auto p');
    expect(logItems.length).toBeGreaterThan(0);
    for (const item of logItems) {
      expect(item.text()).not.toMatch(/^L\d+: Đang chạy dòng \d+$/);
    }
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

  // ── AL-026 (P2): gutter click — simulate Monaco onMouseDown handler thật ──

  it('AL-026: click gutter line → jumpToFrame đúng frame khớp lineNumber', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    const editor = monacoEditorInstances[monacoEditorInstances.length - 1];
    expect(editor.onMouseDown).toHaveBeenCalled();
    const handler = editor.onMouseDown.mock.calls[0][0] as (e: { target: { type: number; position?: { lineNumber: number } } }) => void;

    // Chọn frame có lineNumber duy nhất so với các frame trước → findIndex khớp chính xác
    let targetIdx = 0;
    for (let i = 0; i < store.totalFrames; i++) {
      const line = store.frames[i].lineNumber;
      const seenBefore = store.frames.slice(0, i).some(f => f.lineNumber === line);
      if (!seenBefore) { targetIdx = i; break; }
    }
    const targetLine = store.frames[targetIdx].lineNumber;

    handler({ target: { type: monacoMouseTargetType.GUTTER_LINE_NUMBERS, position: { lineNumber: targetLine } } });
    await nextTick();
    expect(store.currentIndex).toBe(targetIdx);

    // Click sai vùng (CONTENT_TEXT) → không nhảy frame
    const before = store.currentIndex;
    handler({ target: { type: monacoMouseTargetType.CONTENT_TEXT, position: { lineNumber: 1 } } });
    await nextTick();
    expect(store.currentIndex).toBe(before);
  });

  // ── AL-027 (P2): US-AP-020 — description node DOM thật (không tự dựng chuỗi) ──

  it('AL-027: US-AP-020 — description hiển thị qua DOM node từ store.currentDescription', async () => {
    const w = await mountWorkspace();
    const store = useAlgoPlaygroundStore();
    const descNode = w.find('.text-cyan-300\\/90');
    expect(descNode.exists()).toBe(true);

    const desc = store.currentDescription;
    expect(desc.length).toBeGreaterThan(0);
    expect(descNode.text()).toContain(desc.slice(0, 20));

    // Đổi frame → DOM cập nhật theo description frame mới (frame có lineNumber duy nhất)
    let targetIdx = 1;
    for (let i = 1; i < store.totalFrames; i++) {
      const line = store.frames[i].lineNumber;
      if (!store.frames.slice(0, i).some(f => f.lineNumber === line)) { targetIdx = i; break; }
    }
    const targetDesc = store.frames[targetIdx].description;
    store.jumpToFrame(targetIdx);
    await nextTick();
    expect(store.currentIndex).toBe(targetIdx);
    expect(w.find('.text-cyan-300\\/90').text()).toContain(targetDesc.slice(0, 20));
  });
});
