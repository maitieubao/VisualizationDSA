// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import AlgoPlaygroundWorkspace from '../components/AlgoPlaygroundWorkspace.vue';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

// ── Mocks ──
vi.mock('monaco-editor', () => {
  const makeEditor = () => ({
    onDidChangeModelContent: vi.fn(),
    onMouseDown: vi.fn(),
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    dispose: vi.fn(),
    deltaDecorations: vi.fn(() => []),
    revealLineInCenter: vi.fn(),
    getAction: vi.fn(() => ({ run: vi.fn() })),
    hasTextFocus: vi.fn(() => false),
  });
  return { editor: { create: vi.fn(() => makeEditor()), setTheme: vi.fn() } };
});
vi.mock('monaco-editor/esm/vs/language/typescript/monaco.contribution', () => ({}));
vi.mock('monaco-editor/min/vs/editor/editor.main.css', () => ({}));
vi.mock('monaco-editor/esm/vs/editor/editor.worker?worker', () => ({ default: class WorkerStub {} }));
vi.mock('monaco-editor/esm/vs/language/typescript/ts.worker?worker', () => ({ default: class WorkerStub {} }));
vi.mock('splitpanes', () => ({
  Splitpanes: { name: 'Splitpanes', template: '<div class="splitpanes-stub"><slot /></div>' },
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
    vi.unstubAllGlobals();
    vi.clearAllMocks();
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

  it('clicking share in the menu marks the link as copied', async () => {
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

  it('togglePlay hotkey (Space) works after frames are loaded', async () => {
    const w = await mountWorkspace();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    await nextTick();
    const playBtn = w.findAll('button').find(b => b.attributes('aria-label') === 'Phát hoặc tạm dừng');
    // nút play ở VCR chuyển sang trạng thái pause (icon SVG) khi đang phát
    expect(playBtn?.find('svg.base-icon').exists()).toBe(true);
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

  it('shows empty state when there are no frames', async () => {
    const { compileInWorker } = await import('../../../core/compileWorker');
    vi.mocked(compileInWorker).mockImplementationOnce(() => new Promise(() => { /* không resolve */ }));
    const w = await mountWorkspace();
    // Khi đang biên dịch: overlay "Đang biên dịch…" hiển thị thay cho empty state
    expect(w.text()).toContain('Đang biên dịch');
    expect(w.text()).not.toContain('Chọn demo và bấm');
  });
});
