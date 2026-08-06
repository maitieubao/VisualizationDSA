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
});

const mockCreate = vi.fn(() => makeEditor());

vi.mock('monaco-editor', () => {
  return { editor: { create: (...args: unknown[]) => mockCreate(...args), setTheme: vi.fn() } };
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

// ─── CE-003 (P2): Compile frames ─────────────────────────────────────────────
describe('CE-003 (P2): Compile frames', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loadPreset("selection") generates frames via compileAndLoad', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = '// Selection sort code\nfor (let i = 0; i < array.length - 1; i++) {\n  compare(i, i + 1);\n}';
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

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Tải lại trang');

    await button.trigger('click');
    expect(reloadMock).toHaveBeenCalled();
  });
});

// ─── PS-003 (P2): Tab language ───────────────────────────────────────────────
describe('PS-003 (P2): Tab language', () => {
  const PRESETS = {
    bubble: {
      name: 'Sắp xếp nổi bọt (Bubble Sort)',
      shortName: 'Bubble Sort',
      code: '// Bubble sort code',
    },
    selection: {
      name: 'Sắp xếp chọn (Selection Sort)',
      shortName: 'Selection Sort',
      code: '// Selection sort code',
    },
    insertion: {
      name: 'Sắp xếp chèn (Insertion Sort)',
      shortName: 'Insertion Sort',
      code: '// Insertion sort code',
    },
  };

  it('preset tabs cycle through all languages', async () => {
    const wrapper = mount(CodeEditorPresetTabs, {
      props: { presets: PRESETS, activePreset: 'bubble' },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(3);

    await buttons[0].trigger('click');
    expect(wrapper.emitted('select')![0]).toEqual(['bubble']);

    await buttons[1].trigger('click');
    expect(wrapper.emitted('select')![1]).toEqual(['selection']);

    await buttons[2].trigger('click');
    expect(wrapper.emitted('select')![2]).toEqual(['insertion']);
  });

  it('active preset button has correct aria-pressed attribute', () => {
    const wrapper = mount(CodeEditorPresetTabs, {
      props: { presets: PRESETS, activePreset: 'selection' },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons[0].attributes('aria-pressed')).toBe('false');
    expect(buttons[1].attributes('aria-pressed')).toBe('true');
    expect(buttons[2].attributes('aria-pressed')).toBe('false');
  });

  it('each preset button shows shortName', () => {
    const wrapper = mount(CodeEditorPresetTabs, {
      props: { presets: PRESETS, activePreset: 'bubble' },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons[0].text()).toBe('Bubble Sort');
    expect(buttons[1].text()).toBe('Selection Sort');
    expect(buttons[2].text()).toBe('Insertion Sort');
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

  it('VariablesHud shows variable count as badge-style badges', () => {
    const wrapper = mount(VariablesHud, {
      props: {
        activeLoopVars: [
          ['i', 3],
          ['j', 7],
          ['k', 1],
        ],
      },
    });

    const badges = wrapper.findAll('.px-2');
    expect(badges.length).toBe(3);
    expect(badges[0].text()).toContain('i = 3');
    expect(badges[1].text()).toContain('j = 7');
    expect(badges[2].text()).toContain('k = 1');
  });

  it('VariablesHud renders nothing when no variables', () => {
    const wrapper = mount(VariablesHud, {
      props: { activeLoopVars: [] },
    });

    expect(wrapper.text()).toBe('');
  });

  it('VariablesHud displays current loop variable values from current frame', () => {
    const wrapper = mount(VariablesHud, {
      props: {
        activeLoopVars: [['i', 0]],
      },
    });

    expect(wrapper.text()).toContain('Variables:');
    expect(wrapper.text()).toContain('i = 0');
  });
});

// ─── PS-008 (P2): Auto scroll active ─────────────────────────────────────────
describe('PS-008 (P2): Auto scroll active', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('PseudocodePanel renders viewport ref for scrolling', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'line1\nline2\nline3';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const viewport = wrapper.find('[ref="viewport"]');
    const scrollContainer = wrapper.find('.overflow-y-auto');
    expect(scrollContainer.exists()).toBe(true);
  });

  it('PseudocodePanel renders line refs for each code line', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'line1\nline2\nline3';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(3);
  });
});

// ─── PS-009 (P2): Empty state ────────────────────────────────────────────────
describe('PS-009 (P2): Empty state', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('displays "Chưa có mã nguồn" when code is empty', () => {
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
});

// ─── PS-010 (P2): Script loader ─────────────────────────────────────────────
describe('PS-010 (P2): Script loader', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('PseudocodePanel loads pseudocode from vcrStore.code', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'for (let i = 0; i < n; i++) {\n  compare(i, i+1);\n  if (a[i] > a[i+1]) swap(i, i+1);\n}';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(4);
  });

  it('PseudocodePanel updates when vcrStore.code changes', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'line1\nline2';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    let lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(2);

    vcrStore.code = 'line1\nline2\nline3\nline4';
    await flushPromises();

    lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(4);
  });

  it('preset code loads into PseudocodePanel via store', async () => {
    const vcrStore = useVcrStore();
    vcrStore.code = `// Thuật toán Sắp xếp nổi bọt
for (let i = 0; i < array.length - 1; i++) {
  for (let j = 0; j < array.length - i - 1; j++) {
    compare(j, j + 1);
    if (array[j] > array[j + 1]) {
      swap(j, j + 1);
    }
  }
  highlight(array.length - i - 1);
}
highlight(0);`;

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(11);
  });
});
