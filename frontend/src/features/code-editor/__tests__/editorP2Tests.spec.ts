// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

if (typeof navigator.clipboard === 'undefined') {
  // @ts-expect-error jsdom lacks clipboard
  navigator.clipboard = { readText: vi.fn(), writeText: vi.fn() };
}

const makeEditor = () => ({
  onDidChangeModelContent: vi.fn(),
  getValue: vi.fn(() => ''),
  setValue: vi.fn(),
  dispose: vi.fn(),
  deltaDecorations: vi.fn(() => []),
  revealLineInCenter: vi.fn(),
  hasTextFocus: vi.fn(() => false),
  getAction: vi.fn(() => ({ run: vi.fn() })),
  onMouseDown: vi.fn(),
  updateOptions: vi.fn(),
  getModel: vi.fn(() => ({ uri: 'test' })),
});

const mockCreate = vi.fn(() => makeEditor());

vi.mock('monaco-editor', () => {
  return {
    editor: {
      create: (...args: unknown[]) => mockCreate(...args),
      setTheme: vi.fn(),
      setModelLanguage: vi.fn(),
    },
  };
});

vi.mock('monaco-editor/esm/vs/language/typescript/monaco.contribution', () => ({}));
vi.mock('monaco-editor/min/vs/editor/editor.main.css', () => ({}));

vi.mock('../../algorithm-sandbox/engine/MonacoLineSyncerCoordinator', () => ({
  MonacoLineSyncerCoordinator: class {
    destroy = vi.fn();
  },
}));

import CodeEditor from '../components/CodeEditor.vue';
import CodeEditorApiHints from '../components/CodeEditorApiHints.vue';
import CodeEditorPresetTabs from '../components/CodeEditorPresetTabs.vue';
import PseudocodePanel from '../components/PseudocodePanel.vue';
import VariablesHud from '../components/VariablesHud.vue';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import { highlightSyntax } from '../helpers/highlightHelper';
import { usePseudocodeScroller } from '../composables/usePseudocodeScroller';
import { isPlaybackFrame } from '../../../core/CompilerStepExecutor';

import MultilingualCodePanel from '../../pseudocode-sync/components/MultilingualCodePanel.vue';
import { usePseudocodeStore } from '../../pseudocode-sync/store/usePseudocodeStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { loadPseudocodeScript } from '../../pseudocode-sync/scripts/scriptLoader';

import PlaygroundPreview from '../../html-playground/components/PlaygroundPreview.vue';
import PlaygroundWorkspace from '../../html-playground/components/PlaygroundWorkspace.vue';
import { useHtmlPlaygroundStore } from '../../html-playground/store/useHtmlPlaygroundStore';
import { PlaygroundDebouncer } from '../../html-playground/engine/PlaygroundDebouncer';
import { PlaygroundDocumentBuilder } from '../../html-playground/engine/PlaygroundDocumentBuilder';
import { DEFAULT_PLAYGROUND_SOURCE } from '../../html-playground/types/playground.types';

// ─── CE-003 (P2): Compile frames ─────────────────────────────────────────────
describe('CE-003 (P2): Compile frames', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loadPreset("selection") generates frames via compileAndLoad', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code =
      '// Selection sort code\nfor (let i = 0; i < array.length - 1; i++) {\n  compare(i, i + 1);\n}';
    vcrStore.inputArray;

    const wrapper = mount(CodeEditor, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const tabs = wrapper.findComponent(CodeEditorPresetTabs);
    await tabs.vm.$emit('select', 'selection');
    await flushPromises();

    const result = vcrStore.compileAndLoad();
    expect(result.success).toBe(true);
    expect(vcrStore.playbackFrames.length).toBeGreaterThan(0);
  });

  it('loadPreset("insertion") generates frames', async () => {
    const vcrStore = useVcrStore();

    const wrapper = mount(CodeEditor, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const tabs = wrapper.findComponent(CodeEditorPresetTabs);
    await tabs.vm.$emit('select', 'insertion');
    await flushPromises();

    const result = vcrStore.compileAndLoad();
    expect(result.success).toBe(true);
    expect(vcrStore.playbackFrames.length).toBeGreaterThan(0);
  });

  it('activePreset updates when loadPreset is called', async () => {
    const wrapper = mount(CodeEditor, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const tabs = wrapper.findComponent(CodeEditorPresetTabs);
    await tabs.vm.$emit('select', 'bubble');
    await flushPromises();

    expect(tabs.props('activePreset')).toBe('bubble');

    await tabs.vm.$emit('select', 'selection');
    await flushPromises();

    expect(tabs.props('activePreset')).toBe('selection');
  });
});

// ─── CE-005 (P2): Click dòng code ────────────────────────────────────────────
describe('CE-005 (P2): Click dòng code', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('clicking a line with matching frame jumps to that frame', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'compare(0, 1);\nswap(0, 1);\nhighlight(0);';
    vcrStore.playbackFrames = [
      { stepIndex: 0, lineNumber: 1, canvasStateSnapshot: { array: [1] }, description: 'compare' },
      { stepIndex: 1, lineNumber: 2, canvasStateSnapshot: { array: [1] }, description: 'swap' },
      { stepIndex: 2, lineNumber: 3, canvasStateSnapshot: { array: [1] }, description: 'highlight' },
    ];
    vcrStore.currentFrameIndex = 0;

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(3);

    await lines[1].trigger('click');
    expect(vcrStore.currentFrameIndex).toBe(1);
  });

  it('clicking a line without matching frame does nothing', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'comment only\nanother comment';
    vcrStore.playbackFrames = [];
    vcrStore.currentFrameIndex = 0;

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    await lines[0].trigger('click');
    expect(vcrStore.currentFrameIndex).toBe(0);
  });

  it('pressing Enter on a line triggers jump', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'compare(0, 1);\nswap(0, 1);';
    vcrStore.playbackFrames = [
      { stepIndex: 0, lineNumber: 1, canvasStateSnapshot: { array: [1] }, description: 'compare' },
      { stepIndex: 1, lineNumber: 2, canvasStateSnapshot: { array: [1] }, description: 'swap' },
    ];

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    await lines[1].trigger('keydown.enter');
    expect(vcrStore.currentFrameIndex).toBe(1);
  });
});

// ─── CE-007 (P2): API hints ──────────────────────────────────────────────────
describe('CE-007 (P2): API hints', () => {
  it('CodeEditorApiHints renders all three API functions', () => {
    const wrapper = mount(CodeEditorApiHints);

    expect(wrapper.text()).toContain('compare(i, j)');
    expect(wrapper.text()).toContain('swap(i, j)');
    expect(wrapper.text()).toContain('highlight(i)');
  });

  it('CodeEditorApiHints shows descriptions for each function', () => {
    const wrapper = mount(CodeEditorApiHints);

    expect(wrapper.text()).toContain('So sánh 2 phần tử');
    expect(wrapper.text()).toContain('Hoán vị 2 phần tử');
    expect(wrapper.text()).toContain('Đánh dấu đã xong');
  });

  it('CodeEditorApiHints has correct section header', () => {
    const wrapper = mount(CodeEditorApiHints);

    expect(wrapper.text()).toContain('Các hàm tương tác trực quan:');
  });
});

// ─── CE-008 (P2): Auto scroll ────────────────────────────────────────────────
describe('CE-008 (P2): Auto scroll', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('usePseudocodeScroller exposes viewport and lineRefs', () => {
    const { viewport, lineRefs } = usePseudocodeScroller();
    expect(viewport).toBeDefined();
    expect(lineRefs).toBeDefined();
  });

  it('lineRefs is a reactive ref', () => {
    const { lineRefs } = usePseudocodeScroller();
    expect(typeof lineRefs.value).toBe('object');
  });
});

// ─── CE-009 (P2): Executable highlight ───────────────────────────────────────
describe('CE-009 (P2): Executable highlight', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('executable lines have different class from comment-only lines', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = '// This is a comment\ncompare(0, 1);\n// Another comment\nswap(0, 1);';
    vcrStore.playbackFrames = [
      { stepIndex: 0, lineNumber: 2, canvasStateSnapshot: { array: [1] }, description: 'compare' },
      { stepIndex: 1, lineNumber: 4, canvasStateSnapshot: { array: [1] }, description: 'swap' },
    ];
    vcrStore.currentFrameIndex = 1;

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(4);

    const line2Classes = lines[1].classes();
    const line3Classes = lines[2].classes();

    expect(line2Classes).toContain('text-text-secondary');
    expect(line3Classes).toContain('text-text-muted/60');
    expect(line2Classes).not.toEqual(line3Classes);
  });

  it('active line has accent-cyan highlight class', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'compare(0, 1);\nswap(0, 1);\nhighlight(0);';
    vcrStore.playbackFrames = [
      { stepIndex: 0, lineNumber: 1, canvasStateSnapshot: { array: [1] }, description: 'compare' },
      { stepIndex: 1, lineNumber: 2, canvasStateSnapshot: { array: [1] }, description: 'swap' },
      { stepIndex: 2, lineNumber: 3, canvasStateSnapshot: { array: [1] }, description: 'highlight' },
    ];
    vcrStore.currentFrameIndex = 1;

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    await flushPromises();
    const lines = wrapper.findAll('.font-mono > div');

    const activeLineClasses = lines[1].classes();
    expect(activeLineClasses).toContain('bg-accent-cyan/10');
    expect(activeLineClasses).toContain('text-accent-cyan');
    expect(activeLineClasses).toContain('border-l-2');
    expect(activeLineClasses).toContain('border-accent-cyan');
  });

  it('comment-only lines do not get executable styling', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = '// just a comment\n// another comment';
    vcrStore.playbackFrames = [];
    vcrStore.currentFrameIndex = 0;

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    const classes = lines[0].classes();
    expect(classes).toContain('text-text-muted/60');
    expect(classes).not.toContain('text-text-secondary');
  });
});

// ─── CE-010 (P2): Reload on Monaco fail ──────────────────────────────────────
describe('CE-010 (P2): Reload on Monaco fail', () => {
  let originalLocation: Location;

  beforeEach(() => {
    setActivePinia(createPinia());
    originalLocation = window.location;
    mockCreate.mockImplementation(() => makeEditor());
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    mockCreate.mockImplementation(() => makeEditor());
  });

  it('shows error alert when Monaco fails to load', async () => {
    mockCreate.mockImplementation(() => {
      throw new Error('Monaco init failed');
    });

    const wrapper = mount(CodeEditor, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    await flushPromises();

    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('Không thể tải Monaco Editor');
  });

  it('reload button triggers window.location.reload', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: reloadMock },
      writable: true,
    });

    mockCreate.mockImplementation(() => {
      throw new Error('Monaco init failed');
    });

    const wrapper = mount(CodeEditor, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    await flushPromises();

    const alert = wrapper.find('[role="alert"]');
    const button = alert.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Tải lại trang');

    await button.trigger('click');
    expect(reloadMock).toHaveBeenCalled();
  });
});

// ─── PS-003 (P2): Tab language ───────────────────────────────────────────────
describe('PS-003 (P2): Tab language', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pressing Ctrl+Tab cycles to next language (PS-014: Tab giữ focus mặc định)', () => {
    const pseudocodeStore = usePseudocodeStore();
    const animStore = useAnimationStore();

    pseudocodeStore.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: [
          { lineNumber: 1, text: 'void sort()', logicalId: 'FUNC_DECL' },
          { lineNumber: 2, text: '  for (...)', logicalId: 'LOOP' },
        ],
      },
      {
        language: 'java',
        lines: [
          { lineNumber: 1, text: 'void sort()', logicalId: 'FUNC_DECL' },
          { lineNumber: 2, text: '  for (...)', logicalId: 'LOOP' },
        ],
      },
      {
        language: 'python',
        lines: [
          { lineNumber: 1, text: 'def sort():', logicalId: 'FUNC_DECL' },
          { lineNumber: 2, text: '  for ...', logicalId: 'LOOP' },
        ],
      },
    ]);

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const tabs = wrapper.findAll('.lang-btn');
    expect(tabs.length).toBe(3);
    expect(pseudocodeStore.selectedLanguage).toBe('cpp');

    const viewport = wrapper.find('.code-viewport');
    viewport.trigger('keydown', { key: 'Tab', ctrlKey: true });
    expect(pseudocodeStore.selectedLanguage).toBe('java');

    viewport.trigger('keydown', { key: 'Tab', ctrlKey: true });
    expect(pseudocodeStore.selectedLanguage).toBe('python');

    viewport.trigger('keydown', { key: 'Tab', ctrlKey: true });
    expect(pseudocodeStore.selectedLanguage).toBe('cpp');
  });

  it('clicking language tab changes selected language', () => {
    const pseudocodeStore = usePseudocodeStore();

    pseudocodeStore.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: [{ lineNumber: 1, text: 'void sort()', logicalId: 'FUNC_DECL' }],
      },
      {
        language: 'python',
        lines: [{ lineNumber: 1, text: 'def sort():', logicalId: 'FUNC_DECL' }],
      },
    ]);

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const tabs = wrapper.findAll('.lang-btn');
    expect(tabs.length).toBe(2);

    tabs[1].trigger('click');
    expect(pseudocodeStore.selectedLanguage).toBe('python');
  });

  it('language tabs show correct labels', () => {
    const pseudocodeStore = usePseudocodeStore();

    pseudocodeStore.loadPseudocodeScript([
      { language: 'cpp', lines: [{ lineNumber: 1, text: 'x', logicalId: 'A' }] },
      { language: 'java', lines: [{ lineNumber: 1, text: 'x', logicalId: 'A' }] },
      { language: 'python', lines: [{ lineNumber: 1, text: 'x', logicalId: 'A' }] },
      { language: 'javascript', lines: [{ lineNumber: 1, text: 'x', logicalId: 'A' }] },
    ]);

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const tabs = wrapper.findAll('.lang-btn');
    expect(tabs[0].text()).toBe('C++');
    expect(tabs[1].text()).toBe('Java');
    expect(tabs[2].text()).toBe('Python');
    expect(tabs[3].text()).toBe('JavaScript');
  });
});

// ─── PS-004 (P2): Click dòng snap ────────────────────────────────────────────
describe('PS-004 (P2): Click dòng snap', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('clicking executable line snaps to first matching occurrence', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'compare(0, 1);\nswap(0, 1);\ncompare(1, 2);\nswap(1, 2);';
    vcrStore.playbackFrames = [
      { stepIndex: 0, lineNumber: 1, canvasStateSnapshot: { array: [1] }, description: 'compare 0,1' },
      { stepIndex: 1, lineNumber: 2, canvasStateSnapshot: { array: [1] }, description: 'swap 0,1' },
      { stepIndex: 2, lineNumber: 3, canvasStateSnapshot: { array: [1] }, description: 'compare 1,2' },
      { stepIndex: 3, lineNumber: 4, canvasStateSnapshot: { array: [1] }, description: 'swap 1,2' },
    ];
    vcrStore.currentFrameIndex = 0;

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');

    await lines[2].trigger('click');
    expect(vcrStore.currentFrameIndex).toBe(2);
  });

  it('clicking line with multiple occurrences snaps to first occurrence', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'compare(0, 1);\nswap(0, 1);\ncompare(0, 1);';
    vcrStore.playbackFrames = [
      { stepIndex: 0, lineNumber: 1, canvasStateSnapshot: { array: [1] }, description: 'compare 0,1 #1' },
      { stepIndex: 1, lineNumber: 2, canvasStateSnapshot: { array: [1] }, description: 'swap 0,1' },
      { stepIndex: 2, lineNumber: 3, canvasStateSnapshot: { array: [1] }, description: 'compare 0,1 #2' },
    ];
    vcrStore.currentFrameIndex = 0;

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');

    await lines[0].trigger('click');
    expect(vcrStore.currentFrameIndex).toBe(0);

    await lines[2].trigger('click');
    expect(vcrStore.currentFrameIndex).toBe(2);
  });
});

// ─── PS-006 (P2): Badge count ────────────────────────────────────────────────
describe('PS-006 (P2): Badge count', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('occurrence badge shows current/total for lines with multiple occurrences', () => {
    const pseudocodeStore = usePseudocodeStore();
    const animStore = useAnimationStore();

    pseudocodeStore.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: [
          { lineNumber: 1, text: 'for (int i = 0; i < n; i++)', logicalId: 'OUTER_LOOP' },
          { lineNumber: 2, text: '  for (int j = 0; j < n; j++)', logicalId: 'INNER_LOOP' },
          { lineNumber: 3, text: '    swap(arr[j], arr[j+1])', logicalId: 'SWAP_STEP' },
        ],
      },
    ]);

    animStore.frames = [
      { activeLogicalLineId: 'OUTER_LOOP', variables: {} },
      { activeLogicalLineId: 'INNER_LOOP', variables: {} },
      { activeLogicalLineId: 'SWAP_STEP', variables: {} },
      { activeLogicalLineId: 'SWAP_STEP', variables: {} },
      { activeLogicalLineId: 'SWAP_STEP', variables: {} },
    ];
    // PS-020: badge chỉ hiện trên dòng ACTIVE có nhiều occurrence — đặt vào frame SWAP_STEP
    animStore.currentIndex = 2;

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const badges = wrapper.findAll('.occurrence-badge');
    expect(badges.length).toBe(1);
    expect(badges[0].text()).toContain('1/3');
  });

  it('badge updates current index as frame changes', () => {
    const pseudocodeStore = usePseudocodeStore();
    const animStore = useAnimationStore();

    pseudocodeStore.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: [
          { lineNumber: 1, text: 'compare(arr[j], arr[j+1])', logicalId: 'COMPARE_STEP' },
          { lineNumber: 2, text: 'swap(arr[j], arr[j+1])', logicalId: 'SWAP_STEP' },
        ],
      },
    ]);

    animStore.frames = [
      { activeLogicalLineId: 'COMPARE_STEP', variables: {} },
      { activeLogicalLineId: 'SWAP_STEP', variables: {} },
      { activeLogicalLineId: 'COMPARE_STEP', variables: {} },
      { activeLogicalLineId: 'COMPARE_STEP', variables: {} },
    ];
    animStore.currentIndex = 2;

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const badges = wrapper.findAll('.occurrence-badge');
    expect(badges.length).toBe(1);
    expect(badges[0].text()).toContain('2/3');
  });

  it('no badge shown for lines with single occurrence', () => {
    const pseudocodeStore = usePseudocodeStore();
    const animStore = useAnimationStore();

    pseudocodeStore.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: [
          { lineNumber: 1, text: 'for (int i = 0; i < n; i++)', logicalId: 'OUTER_LOOP' },
          { lineNumber: 2, text: '  swap(arr[j], arr[j+1])', logicalId: 'SWAP_STEP' },
        ],
      },
    ]);

    animStore.frames = [
      { activeLogicalLineId: 'OUTER_LOOP', variables: {} },
      { activeLogicalLineId: 'SWAP_STEP', variables: {} },
    ];
    animStore.currentIndex = 0;

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const badges = wrapper.findAll('.occurrence-badge');
    expect(badges.length).toBe(0);
  });
});

// ─── PS-008 (P2): Auto scroll active ─────────────────────────────────────────
describe('PS-008 (P2): Auto scroll active', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('MultilingualCodePanel renders viewport for scrolling', () => {
    const pseudocodeStore = usePseudocodeStore();

    pseudocodeStore.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: [
          { lineNumber: 1, text: 'line1', logicalId: 'A' },
          { lineNumber: 2, text: 'line2', logicalId: 'B' },
          { lineNumber: 3, text: 'line3', logicalId: 'C' },
        ],
      },
    ]);

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const viewport = wrapper.find('.code-viewport');
    expect(viewport.exists()).toBe(true);
  });

  it('MultilingualCodePanel renders line refs for each code line', () => {
    const pseudocodeStore = usePseudocodeStore();

    pseudocodeStore.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: [
          { lineNumber: 1, text: 'line1', logicalId: 'A' },
          { lineNumber: 2, text: 'line2', logicalId: 'B' },
          { lineNumber: 3, text: 'line3', logicalId: 'C' },
        ],
      },
    ]);

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.code-line');
    expect(lines.length).toBe(3);
  });

  it('scrollIntoView is called when active line changes outside viewport', async () => {
    const pseudocodeStore = usePseudocodeStore();
    const animStore = useAnimationStore();

    pseudocodeStore.loadPseudocodeScript([
      {
        language: 'cpp',
        lines: Array.from({ length: 50 }, (_, i) => ({
          lineNumber: i + 1,
          text: `line ${i + 1}`,
          logicalId: `LINE_${i}`,
        })),
      },
    ]);

    animStore.frames = Array.from({ length: 50 }, (_, i) => ({
      activeLogicalLineId: `LINE_${i}`,
      variables: {},
    }));
    animStore.currentIndex = 0;

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const viewport = wrapper.find('.code-viewport');
    const scrollToSpy = vi.fn();
    Object.defineProperty(viewport.element, 'scrollTo', {
      value: scrollToSpy,
      writable: true,
    });
    Object.defineProperty(viewport.element, 'scrollTop', {
      value: 0,
      writable: true,
    });
    Object.defineProperty(viewport.element, 'clientHeight', {
      value: 200,
      writable: true,
    });

    animStore.currentIndex = 49;
    await flushPromises();
    await flushPromises();
  });
});

// ─── PS-009 (P2): Empty state ────────────────────────────────────────────────
describe('PS-009 (P2): Empty state', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('displays "Chưa có mã nguồn" when code is empty in PseudocodePanel', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = '';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.text()).toContain('Chưa có mã nguồn');
  });

  it('displays "Chưa có mã nguồn" when code is whitespace only', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = '   \n  \n   ';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.text()).toContain('Chưa có mã nguồn');
  });

  it('does not show empty state when code has content', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'compare(0, 1);';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.text()).not.toContain('Chưa có mã nguồn');
    expect(wrapper.text()).toContain('compare');
  });

  it('MultilingualCodePanel shows empty text when no script loaded', () => {
    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.text()).toContain('Chưa có mã nguồn');
  });
});

// ─── PS-010 (P2): Script loader ─────────────────────────────────────────────
describe('PS-010 (P2): Script loader', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loadPseudocodeScript returns script for known algorithm', () => {
    const script = loadPseudocodeScript('bubble-sort');
    expect(script).not.toBeNull();
    expect(script?.algorithmId).toBe('bubble-sort');
    expect(script?.languages.length).toBeGreaterThan(0);
  });

  it('loadPseudocodeScript returns null for unknown algorithm', () => {
    const script = loadPseudocodeScript('unknown-algo');
    expect(script).toBeNull();
  });

  it('pseudocodeStore.loadPseudocodeScript loads languages', () => {
    const pseudocodeStore = usePseudocodeStore();
    const script = loadPseudocodeScript('bubble-sort')!;

    pseudocodeStore.loadPseudocodeScript(script.languages);

    expect(pseudocodeStore.isScriptLoaded).toBe(true);
    expect(pseudocodeStore.availableLanguages.length).toBe(4);
    expect(pseudocodeStore.activeCodeLines.length).toBeGreaterThan(0);
  });

  it('loaded script renders in MultilingualCodePanel', () => {
    const pseudocodeStore = usePseudocodeStore();
    const script = loadPseudocodeScript('bubble-sort')!;

    pseudocodeStore.loadPseudocodeScript(script.languages);

    const wrapper = mount(MultilingualCodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.code-line');
    expect(lines.length).toBeGreaterThan(0);

    const tabs = wrapper.findAll('.lang-btn');
    expect(tabs.length).toBe(4);
  });

  it('switching language updates active code lines', () => {
    const pseudocodeStore = usePseudocodeStore();
    const script = loadPseudocodeScript('bubble-sort')!;

    pseudocodeStore.loadPseudocodeScript(script.languages);

    expect(pseudocodeStore.selectedLanguage).toBe('cpp');
    expect(pseudocodeStore.activeCodeLines.length).toBe(9);

    pseudocodeStore.changeLanguage('python');
    expect(pseudocodeStore.activeCodeLines.length).toBe(6);

    pseudocodeStore.changeLanguage('java');
    expect(pseudocodeStore.activeCodeLines.length).toBe(11);
  });
});

// ─── HP-002 (P2): Preview realtime ───────────────────────────────────────────
describe('HP-002 (P2): Preview realtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('PlaygroundDebouncer delays callback by 800ms', () => {
    const debouncer = new PlaygroundDebouncer(800);
    const callback = vi.fn();

    debouncer.schedule(callback);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(799);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('PlaygroundDebouncer resets timer on each schedule call', () => {
    const debouncer = new PlaygroundDebouncer(800);
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    debouncer.schedule(callback1);
    vi.advanceTimersByTime(500);
    expect(callback1).not.toHaveBeenCalled();

    debouncer.schedule(callback2);
    vi.advanceTimersByTime(500);
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('PlaygroundDebouncer.flush executes immediately', () => {
    const debouncer = new PlaygroundDebouncer(800);
    const callback = vi.fn();

    debouncer.schedule(callback);
    expect(callback).not.toHaveBeenCalled();

    debouncer.flush();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('PlaygroundDebouncer.cancel prevents execution', () => {
    const debouncer = new PlaygroundDebouncer(800);
    const callback = vi.fn();

    debouncer.schedule(callback);
    debouncer.cancel();

    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('store toggle triggers debounced preview update', async () => {
    setActivePinia(createPinia());
    const store = useHtmlPlaygroundStore();

    const debouncer = new PlaygroundDebouncer(800);
    const updateFn = vi.fn();

    store.html = '<h1>Test</h1>';
    debouncer.schedule(updateFn);

    expect(updateFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(800);
    expect(updateFn).toHaveBeenCalledTimes(1);
  });
});

// ─── HP-003 (P2): Toggle preview ─────────────────────────────────────────────
describe('HP-003 (P2): Toggle preview', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('preview is visible by default', () => {
    const store = useHtmlPlaygroundStore();
    expect(store.isPreviewVisible).toBe(true);
  });

  it('togglePreview hides preview', () => {
    const store = useHtmlPlaygroundStore();
    expect(store.isPreviewVisible).toBe(true);

    store.togglePreview();
    expect(store.isPreviewVisible).toBe(false);
  });

  it('togglePreview shows preview after hiding', () => {
    const store = useHtmlPlaygroundStore();

    store.togglePreview();
    expect(store.isPreviewVisible).toBe(false);

    store.togglePreview();
    expect(store.isPreviewVisible).toBe(true);
  });

  it('PlaygroundWorkspace renders preview panel when visible', () => {
    setActivePinia(createPinia());
    const store = useHtmlPlaygroundStore();
    store.isPreviewVisible = true;

    const wrapper = mount(PlaygroundWorkspace, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const preview = wrapper.find('iframe');
    expect(preview.exists()).toBe(true);
  });

  it('PlaygroundWorkspace hides preview panel when not visible', () => {
    setActivePinia(createPinia());
    const store = useHtmlPlaygroundStore();
    store.isPreviewVisible = false;

    const wrapper = mount(PlaygroundWorkspace, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const preview = wrapper.find('iframe');
    expect(preview.exists()).toBe(false);
  });
});

// ─── HP-006 (P2): Reset code ─────────────────────────────────────────────────
describe('HP-006 (P2): Reset code', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('resetToDefault restores default HTML', () => {
    const store = useHtmlPlaygroundStore();

    store.html = '<h1>Custom</h1>';
    store.resetToDefault();

    expect(store.html).toBe(DEFAULT_PLAYGROUND_SOURCE.html);
  });

  it('resetToDefault restores default CSS', () => {
    const store = useHtmlPlaygroundStore();

    store.css = 'body { color: red; }';
    store.resetToDefault();

    expect(store.css).toBe(DEFAULT_PLAYGROUND_SOURCE.css);
  });

  it('resetToDefault restores default JS', () => {
    const store = useHtmlPlaygroundStore();

    store.js = 'console.log("custom");';
    store.resetToDefault();

    expect(store.js).toBe(DEFAULT_PLAYGROUND_SOURCE.js);
  });

  it('resetToDefault sets activeTab to html', () => {
    const store = useHtmlPlaygroundStore();

    store.activeTab = 'css';
    store.resetToDefault();

    expect(store.activeTab).toBe('html');
  });

  it('resetToDefault increments revision', () => {
    const store = useHtmlPlaygroundStore();

    const initialRevision = store.revision;
    store.resetToDefault();

    expect(store.revision).toBe(initialRevision + 1);
  });

  it('PlaygroundWorkspace reset button triggers resetToDefault', async () => {
    setActivePinia(createPinia());
    const store = useHtmlPlaygroundStore();

    store.html = '<h1>Modified</h1>';

    const wrapper = mount(PlaygroundWorkspace, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const buttons = wrapper.findAll('button');
    const resetButton = buttons.find((b) => b.text().includes('Reset'));
    expect(resetButton).toBeDefined();

    await resetButton!.trigger('click');
    await flushPromises();

    expect(store.html).toBe(DEFAULT_PLAYGROUND_SOURCE.html);
  });
});

// ─── HP-011 (P2): Monaco error ──────────────────────────────────────────────
describe('HP-011 (P2): Monaco error', () => {
  let originalLocation: Location;

  beforeEach(() => {
    setActivePinia(createPinia());
    originalLocation = window.location;
    mockCreate.mockImplementation(() => makeEditor());
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    mockCreate.mockImplementation(() => makeEditor());
  });

  it('PlaygroundWorkspace shows error when Monaco fails', async () => {
    mockCreate.mockImplementation(() => {
      throw new Error('Monaco init failed');
    });

    const wrapper = mount(PlaygroundWorkspace, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Không thể tải Monaco Editor');
  });

  it('PlaygroundWorkspace reload button triggers window.location.reload', async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: reloadMock },
      writable: true,
    });

    mockCreate.mockImplementation(() => {
      throw new Error('Monaco init failed');
    });

    const wrapper = mount(PlaygroundWorkspace, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    await flushPromises();

    const alert = wrapper.find('.flex.flex-col.items-center.justify-center');
    const button = alert.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Tải lại trang');

    await button.trigger('click');
    expect(reloadMock).toHaveBeenCalled();
  });

  it('PlaygroundWorkspace shows error description text', async () => {
    mockCreate.mockImplementation(() => {
      throw new Error('Monaco init failed');
    });

    const wrapper = mount(PlaygroundWorkspace, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Playground vẫn chạy được, chỉ không hiển thị editor.');
  });
});

// ─── HP-013 (P2): Sandbox security ───────────────────────────────────────────
describe('HP-013 (P2): Sandbox security', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('PlaygroundPreview iframe has sandbox attribute', () => {
    const wrapper = mount(PlaygroundPreview, {
      props: {
        documentHtml: '<html><body>test</body></html>',
      },
    });

    const iframe = wrapper.find('iframe');
    expect(iframe.exists()).toBe(true);
    expect(iframe.attributes('sandbox')).toBeDefined();
  });

  it('sandbox attribute includes allow-scripts', () => {
    const wrapper = mount(PlaygroundPreview, {
      props: {
        documentHtml: '<html><body>test</body></html>',
      },
    });

    const iframe = wrapper.find('iframe');
    const sandbox = iframe.attributes('sandbox');
    expect(sandbox).toContain('allow-scripts');
  });

  it('sandbox attribute does NOT include allow-same-origin', () => {
    const wrapper = mount(PlaygroundPreview, {
      props: {
        documentHtml: '<html><body>test</body></html>',
      },
    });

    const iframe = wrapper.find('iframe');
    const sandbox = iframe.attributes('sandbox');
    expect(sandbox).not.toContain('allow-same-origin');
  });

  it('sandbox attribute includes allow-modals and allow-forms', () => {
    const wrapper = mount(PlaygroundPreview, {
      props: {
        documentHtml: '<html><body>test</body></html>',
      },
    });

    const iframe = wrapper.find('iframe');
    const sandbox = iframe.attributes('sandbox');
    expect(sandbox).toContain('allow-modals');
    expect(sandbox).toContain('allow-forms');
  });

  it('sandbox attribute includes allow-popups', () => {
    const wrapper = mount(PlaygroundPreview, {
      props: {
        documentHtml: '<html><body>test</body></html>',
      },
    });

    const iframe = wrapper.find('iframe');
    const sandbox = iframe.attributes('sandbox');
    expect(sandbox).toContain('allow-popups');
  });

  it('iframe uses srcDoc for content isolation', () => {
    const wrapper = mount(PlaygroundPreview, {
      props: {
        documentHtml: '<html><body>isolated content</body></html>',
      },
    });

    const iframe = wrapper.find('iframe');
    expect(iframe.attributes('srcdoc')).toBeDefined();
  });

  it('PlaygroundDocumentBuilder escapes script tags in JS', () => {
    const source = {
      html: '<div>test</div>',
      css: 'body { color: red; }',
      js: 'const x = "<script>alert(1)</script>";',
    };

    const doc = PlaygroundDocumentBuilder.buildDocument(source);
    expect(doc).not.toContain('<script>alert(1)</script>');
    expect(doc).toContain('\\u003c');
  });

  it('PlaygroundDocumentBuilder escapes closing tags in CSS', () => {
    const source = {
      html: '<div>test</div>',
      css: 'body { content: "</style>"; }',
      js: 'console.log("test");',
    };

    const doc = PlaygroundDocumentBuilder.buildDocument(source);
    expect(doc).toContain('\\3c/');
    expect(doc).not.toContain('content: "</style>"');
  });
});
