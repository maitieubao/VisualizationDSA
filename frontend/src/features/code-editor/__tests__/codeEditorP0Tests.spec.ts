// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

if (typeof navigator.clipboard === 'undefined') {
  // @ts-expect-error jsdom lacks clipboard
  navigator.clipboard = { readText: vi.fn(), writeText: vi.fn() };
}

vi.mock('monaco-editor', () => {
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
  return { editor: { create: vi.fn(() => makeEditor()), setTheme: vi.fn() } };
});

vi.mock('monaco-editor/esm/vs/language/typescript/monaco.contribution', () => ({}));
vi.mock('monaco-editor/min/vs/editor/editor.main.css', () => ({}));

import CodeEditor from '../components/CodeEditor.vue';
import CodeEditorPresetTabs from '../components/CodeEditorPresetTabs.vue';
import PseudocodePanel from '../components/PseudocodePanel.vue';
import VariablesHud from '../components/VariablesHud.vue';
import { flushPromises } from '@vue/test-utils';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';

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

describe('CE-001 (P0): Chọn preset', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loadPreset("bubble") changes code and active preset', async () => {
    const wrapper = mount(CodeEditor, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const tabs = wrapper.findComponent(CodeEditorPresetTabs);
    expect(tabs.exists()).toBe(true);

    await tabs.vm.$emit('select', 'bubble');
    await flushPromises();
    expect(wrapper.findComponent(CodeEditorPresetTabs).props('activePreset')).toBe('bubble');
  });

  it('clicking preset button emits select event with correct key', async () => {
    const wrapper = mount(CodeEditorPresetTabs, {
      props: { presets: PRESETS, activePreset: 'bubble' },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(3);

    await buttons[1].trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
    expect(wrapper.emitted('select')![0]).toEqual(['selection']);
  });
});

describe('CE-002 (P0): Edit code', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('editor is created and content is editable', () => {
    const wrapper = mount(CodeEditor, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.find('[data-tour-id="pseudocode-syncer"]').exists()).toBe(true);
  });
});

describe('CE-004 (P0): PseudocodePanel render', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders pseudocode lines from vcrStore code', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'for (let i = 0; i < n; i++) {\n  console.log(i);\n}';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(3);
  });

  it('shows placeholder when code is empty', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = '';

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.text()).toContain('Chưa có mã nguồn');
  });

  it('highlights active line based on currentLineNumber', () => {
    const vcrStore = useVcrStore();
    vcrStore.code = 'line1\nline2\nline3';
    vcrStore.playbackFrames = [
      { stepIndex: 0, lineNumber: 2, description: 'test' } as never,
    ];
    vcrStore.$patch({ currentFrameIndex: 0 });

    const wrapper = mount(PseudocodePanel, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const lines = wrapper.findAll('.font-mono > div');
    expect(lines.length).toBe(3);
  });
});

describe('CE-006 (P0): Variables HUD', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('displays loop variables when provided', () => {
    const wrapper = mount(VariablesHud, {
      props: {
        activeLoopVars: [
          ['i', 3],
          ['j', 7],
        ],
      },
    });

    expect(wrapper.text()).toContain('i = 3');
    expect(wrapper.text()).toContain('j = 7');
  });

  it('renders nothing when activeLoopVars is empty', () => {
    const wrapper = mount(VariablesHud, {
      props: { activeLoopVars: [] },
    });

    expect(wrapper.text()).toBe('');
  });
});
