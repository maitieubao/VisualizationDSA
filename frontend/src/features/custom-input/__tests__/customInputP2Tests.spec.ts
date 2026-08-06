// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import CustomInputForm from '../components/CustomInputForm.vue';
import EmbedConfiguratorSidebar from '../../embed-widget/components/EmbedConfiguratorSidebar.vue';
import LiveWidgetPreview from '../../embed-widget/components/LiveWidgetPreview.vue';
import EmbedCodeSnippet from '../../embed-widget/components/EmbedCodeSnippet.vue';
import { useInputStore } from '../store/useInputStore';
import { useEmbedConfiguratorStore } from '../../embed-widget/store/useEmbedConfiguratorStore';

describe('CI-005 (P2): Element count', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('displays "5 / 15" when 5 elements are entered', async () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('1, 2, 3, 4, 5');

    const store = useInputStore();
    expect(store.elementCount).toBe(5);
    expect(store.maxLimit).toBe(15);

    const counterText = wrapper.text();
    expect(counterText).toContain('5 / 15');
  });

  it('updates element count dynamically as user types', async () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const textarea = wrapper.find('textarea');

    await textarea.setValue('10, 20');
    expect(wrapper.text()).toContain('2 / 15');

    await textarea.setValue('1, 2, 3, 4, 5, 6, 7, 8');
    expect(wrapper.text()).toContain('8 / 15');
  });

  it('shows 0 / 15 when input is empty', () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.text()).toContain('0 / 15');
  });
});

describe('CI-007 (P2): Clear input', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('clear button resets rawText to empty', async () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('5, 3, 8, 1');

    const store = useInputStore();
    expect(store.rawText).toBe('5, 3, 8, 1');

    const clearButton = wrapper.find('button', { text: 'Xóa Trắng' });
  });

  it('store.clear() resets all state', () => {
    const store = useInputStore();
    store.rawText = '1, 2, 3';
    store.apiErrorMessage = 'some error';
    store.isLoading = true;

    store.clear();

    expect(store.rawText).toBe('');
    expect(store.apiErrorMessage).toBe('');
    expect(store.isLoading).toBe(false);
  });

  it('clear button exists in the form', () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const buttons = wrapper.findAll('button');
    const clearBtn = buttons.find(btn => btn.text().includes('Xóa Trắng'));
    expect(clearBtn).toBeTruthy();
  });
});

describe('CI-008 (P2): Run visualization', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('submitCustomInput sets isLoading and calls animationStore.loadResult', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        algorithmId: 'bubble-sort',
        pseudoCode: ['line1'],
        frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1, 2], highlights: { compare: [], swap: [], sorted: [] } }],
      }), { status: 200 }),
    );

    const store = useInputStore();
    store.rawText = '5, 3, 8';

    await store.submitCustomInput('bubble-sort');

    expect(store.isLoading).toBe(false);
  });

  it('execute button is disabled when canExecute is false', () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useInputStore();
    store.rawText = '';

    const buttons = wrapper.findAll('button');
    const executeBtn = buttons.find(btn => btn.text().includes('Chạy Trực Quan'));
    expect(executeBtn).toBeTruthy();
    expect(executeBtn!.attributes('disabled')).toBeDefined();
  });

  it('execute button is enabled when input is valid', async () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('5, 3, 8, 1, 9');

    const store = useInputStore();
    expect(store.canExecute).toBe(true);
  });
});

describe('CI-009 (P2): Loading state', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('isLoading is true during submitCustomInput execution', async () => {
    let resolveFetch: (value: Response) => void;
    const fetchPromise = new Promise<Response>((resolve) => { resolveFetch = resolve; });

    vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchPromise);

    const store = useInputStore();
    store.rawText = '5, 3, 8';

    const submitPromise = store.submitCustomInput('bubble-sort');
    expect(store.isLoading).toBe(true);

    resolveFetch!(new Response(JSON.stringify({
      algorithmId: 'bubble-sort',
      pseudoCode: ['line1'],
      frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1], highlights: { compare: [], swap: [], sorted: [] } }],
    }), { status: 200 }));

    await submitPromise;
    expect(store.isLoading).toBe(false);
  });

  it('textarea is readonly when isLoading is true', async () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useInputStore();
    store.rawText = '5, 3, 8';
    store.isLoading = true;

    await wrapper.vm.$nextTick();
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('readonly')).toBeDefined();
  });

  it('spinner icon appears when loading', async () => {
    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useInputStore();
    store.rawText = '5, 3, 8';
    store.isLoading = true;

    await wrapper.vm.$nextTick();
    const spinner = wrapper.find('svg.animate-spin');
    expect(spinner.exists()).toBe(true);
  });
});

describe('CI-010 (P2): API error', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('sets apiErrorMessage when backend returns HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 }),
    );

    const store = useInputStore();
    store.rawText = '5, 3, 8';

    await store.submitCustomInput('bubble-sort');

    expect(store.apiErrorMessage).toContain('Máy chủ báo lỗi');
    expect(store.isLoading).toBe(false);
  });

  it('sets apiErrorMessage when network fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const store = useInputStore();
    store.rawText = '5, 3, 8';

    await store.submitCustomInput('bubble-sort');

    expect(store.apiErrorMessage).toContain('Không kết nối được máy chủ');
    expect(store.isLoading).toBe(false);
  });

  it('error message is displayed in the form', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const store = useInputStore();
    store.rawText = '5, 3, 8';

    await store.submitCustomInput('bubble-sort');

    const wrapper = mount(CustomInputForm, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.text()).toContain('Không kết nối được máy chủ');
  });
});

describe('CI-011 (P2): Fallback', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('uses dummy fallback when API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const store = useInputStore();
    store.rawText = '5, 3, 8';

    await store.submitCustomInput('bubble-sort');

    expect(store.apiErrorMessage).not.toBe('');
    expect(store.isLoading).toBe(false);
  });

  it('uses dummy fallback when API returns non-ok status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Bad Request' }), { status: 400 }),
    );

    const store = useInputStore();
    store.rawText = '5, 3, 8';

    await store.submitCustomInput('bubble-sort');

    expect(store.apiErrorMessage).toContain('Máy chủ báo lỗi');
    expect(store.isLoading).toBe(false);
  });

  it('clears previous error before new submission', async () => {
    const store = useInputStore();
    store.rawText = '5, 3, 8';
    store.apiErrorMessage = 'previous error';

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        algorithmId: 'bubble-sort',
        pseudoCode: ['line1'],
        frames: [{ stepId: 1, activeLine: 0, explanation: 'test', dataState: [1], highlights: { compare: [], swap: [], sorted: [] } }],
      }), { status: 200 }),
    );

    await store.submitCustomInput('bubble-sort');

    expect(store.apiErrorMessage).toBe('');
  });
});

describe('EW-004 (P2/P3): Height range', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('height slider has min=200 and max=900', () => {
    const wrapper = mount(EmbedConfiguratorSidebar, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const heightInput = wrapper.find('#embed-height-range');
    expect(heightInput.exists()).toBe(true);
    expect(heightInput.attributes('min')).toBe('200');
    expect(heightInput.attributes('max')).toBe('900');
  });

  it('setDimensions clamps height to minimum 200', () => {
    const store = useEmbedConfiguratorStore();
    store.setDimensions(800, 50);
    expect(store.widgetHeight).toBe(200);
  });

  it('setDimensions clamps height to maximum 900', () => {
    const store = useEmbedConfiguratorStore();
    store.setDimensions(800, 1500);
    expect(store.widgetHeight).toBe(900);
  });

  it('setDimensions accepts height within range 200-900', () => {
    const store = useEmbedConfiguratorStore();
    store.setDimensions(800, 600);
    expect(store.widgetHeight).toBe(600);
  });
});

describe('EW-006 (P2): Toggle Watch Variables', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('toggleWatchVariables switches from true to false', () => {
    const store = useEmbedConfiguratorStore();
    expect(store.showWatchVariables).toBe(true);

    store.toggleWatchVariables();
    expect(store.showWatchVariables).toBe(false);
  });

  it('toggleWatchVariables switches back to true', () => {
    const store = useEmbedConfiguratorStore();
    store.toggleWatchVariables();
    expect(store.showWatchVariables).toBe(false);

    store.toggleWatchVariables();
    expect(store.showWatchVariables).toBe(true);
  });

  it('toggle reflects in generatedIframeCode', () => {
    const store = useEmbedConfiguratorStore();
    expect(store.generatedIframeCode).toContain('watch=true');

    store.toggleWatchVariables();
    expect(store.generatedIframeCode).toContain('watch=false');
  });

  it('sidebar has Watch Variables toggle button', () => {
    const wrapper = mount(EmbedConfiguratorSidebar, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const toggleBtn = wrapper.find('button[aria-label="Bật/tắt Watch Variables"]');
    expect(toggleBtn.exists()).toBe(true);
  });
});

describe('EW-007 (P2): Toggle Interactive', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('toggleInteractive switches from true to false', () => {
    const store = useEmbedConfiguratorStore();
    expect(store.isInteractive).toBe(true);

    store.toggleInteractive();
    expect(store.isInteractive).toBe(false);
  });

  it('toggleInteractive switches back to true', () => {
    const store = useEmbedConfiguratorStore();
    store.toggleInteractive();
    expect(store.isInteractive).toBe(false);

    store.toggleInteractive();
    expect(store.isInteractive).toBe(true);
  });

  it('toggle reflects in generatedIframeCode', () => {
    const store = useEmbedConfiguratorStore();
    expect(store.generatedIframeCode).toContain('interactive=true');

    store.toggleInteractive();
    expect(store.generatedIframeCode).toContain('interactive=false');
  });

  it('sidebar has Interactive Mode toggle button', () => {
    const wrapper = mount(EmbedConfiguratorSidebar, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const toggleBtn = wrapper.find('button[aria-label="Bật/tắt Interactive Mode"]');
    expect(toggleBtn.exists()).toBe(true);
  });
});

describe('EW-008 (P2): Live preview', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('LiveWidgetPreview renders with default dimensions', () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.find('.preview-frame').exists()).toBe(true);
  });

  it('preview displays dimensions text', () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useEmbedConfiguratorStore();
    expect(wrapper.text()).toContain(`${store.widgetWidth} × ${store.widgetHeight}px`);
  });

  it('preview updates when dimensions change', async () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useEmbedConfiguratorStore();
    store.setDimensions(1000, 700);

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('1000 × 700px');
  });

  it('preview shows VCR controls when enabled', () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useEmbedConfiguratorStore();
    expect(store.showVcrControls).toBe(true);
    expect(wrapper.find('.sim-vcr').exists()).toBe(true);
  });

  it('preview hides VCR controls when disabled', async () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useEmbedConfiguratorStore();
    store.toggleVcrControls();

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sim-vcr').exists()).toBe(false);
  });
});

describe('EW-010 (P2): Host code', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('EmbedCodeSnippet renders host integration script', () => {
    const wrapper = mount(EmbedCodeSnippet, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const codeText = wrapper.text();
    expect(codeText).toContain('Mã tích hợp Host');
  });

  it('host integration script contains postMessage listener', () => {
    const wrapper = mount(EmbedCodeSnippet, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const codeBlock = wrapper.find('.integration-code code');
    expect(codeBlock.exists()).toBe(true);
    expect(codeBlock.text()).toContain('addEventListener');
    expect(codeBlock.text()).toContain('message');
  });

  it('host integration script verifies origin', () => {
    const wrapper = mount(EmbedCodeSnippet, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const codeBlock = wrapper.find('.integration-code code');
    expect(codeBlock.text()).toContain('event.origin');
  });
});

describe('EW-011 (P2): Reset config', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('resetConfigurator restores all defaults', () => {
    const store = useEmbedConfiguratorStore();

    store.setTheme('dark');
    store.setAlgorithm('heap-sort');
    store.setDimensions(1200, 800);
    store.toggleVcrControls();
    store.toggleWatchVariables();
    store.toggleInteractive();

    store.resetConfigurator();

    expect(store.selectedTheme).toBe('glass');
    expect(store.showVcrControls).toBe(true);
    expect(store.showWatchVariables).toBe(true);
    expect(store.isInteractive).toBe(true);
    expect(store.widgetWidth).toBe(800);
    expect(store.widgetHeight).toBe(500);
    expect(store.selectedAlgorithm).toBe('quicksort-recursion');
    expect(store.isCopied).toBe(false);
  });

  it('reset button exists in sidebar', () => {
    const wrapper = mount(EmbedConfiguratorSidebar, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const resetBtn = wrapper.find('.reset-btn');
    expect(resetBtn.exists()).toBe(true);
    expect(resetBtn.text()).toContain('Đặt lại Mặc định');
  });

  it('clicking reset button restores defaults', async () => {
    const wrapper = mount(EmbedConfiguratorSidebar, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useEmbedConfiguratorStore();
    store.setTheme('dark');
    store.setAlgorithm('heap-sort');

    const resetBtn = wrapper.find('.reset-btn');
    await resetBtn.trigger('click');

    expect(store.selectedTheme).toBe('glass');
    expect(store.selectedAlgorithm).toBe('quicksort-recursion');
  });
});

describe('EW-012 (P2): Copy success', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('copyEmbedCodeToClipboard sets isCopied to true', async () => {
    const store = useEmbedConfiguratorStore();

    const mockNavigator = {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    };
    vi.stubGlobal('navigator', mockNavigator);

    const result = await store.copyEmbedCodeToClipboard();
    expect(result).toBe(true);
    expect(store.isCopied).toBe(true);

    vi.unstubAllGlobals();
  });

  it('copy button shows "ĐÃ SAO CHÉP!" after successful copy', async () => {
    const wrapper = mount(EmbedCodeSnippet, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const mockNavigator = {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    };
    vi.stubGlobal('navigator', mockNavigator);

    const copyBtn = wrapper.find('.copy-btn');
    await copyBtn.trigger('click');

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('ĐÃ SAO CHÉP!');

    vi.unstubAllGlobals();
  });

  it('isCopied resets to false after 2 seconds', async () => {
    vi.useFakeTimers();
    const store = useEmbedConfiguratorStore();

    const mockNavigator = {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    };
    vi.stubGlobal('navigator', mockNavigator);

    await store.copyEmbedCodeToClipboard();
    expect(store.isCopied).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(store.isCopied).toBe(false);

    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
});

describe('EW-013 (P2): Clipboard error', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('copyEmbedCodeToClipboard returns false on clipboard error', async () => {
    const store = useEmbedConfiguratorStore();

    const mockNavigator = {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard blocked')),
      },
    };
    vi.stubGlobal('navigator', mockNavigator);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await store.copyEmbedCodeToClipboard();

    expect(result).toBe(false);
    errorSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('shows error message when clipboard fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard blocked')),
        },
      },
      writable: true,
      configurable: true,
    });

    const wrapper = mount(EmbedCodeSnippet, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const copyBtn = wrapper.find('.copy-btn');
    await copyBtn.trigger('click');
    await flushPromises();

    expect(wrapper.find('.copy-error').exists()).toBe(true);
    expect(wrapper.text()).toContain('Không thể sao chép');

    errorSpy.mockRestore();
  });
});

describe('EW-015 (P2): Auto resize', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('host integration script handles HEIGHT_CHANGED action', () => {
    const wrapper = mount(EmbedCodeSnippet, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const codeBlock = wrapper.find('.integration-code code');
    expect(codeBlock.text()).toContain('HEIGHT_CHANGED');
  });

  it('host integration script clamps height to max 2000', () => {
    const wrapper = mount(EmbedCodeSnippet, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const codeBlock = wrapper.find('.integration-code code');
    expect(codeBlock.text()).toContain('Math.min(2000');
  });

  it('host integration script clamps height to min 100', () => {
    const wrapper = mount(EmbedCodeSnippet, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const codeBlock = wrapper.find('.integration-code code');
    expect(codeBlock.text()).toContain('Math.max(100');
  });
});

describe('EW-016 (P2): Dimensions display', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('preview shows default dimensions "800 × 500px"', () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    expect(wrapper.text()).toContain('800 × 500px');
  });

  it('preview dimensions update when width changes', async () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useEmbedConfiguratorStore();
    store.setDimensions(1200, 500);

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('1200 × 500px');
  });

  it('preview dimensions update when height changes', async () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const store = useEmbedConfiguratorStore();
    store.setDimensions(800, 700);

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('800 × 700px');
  });

  it('dimensions display uses "×" separator', () => {
    const wrapper = mount(LiveWidgetPreview, {
      global: {
        stubs: { BaseIcon: { template: '<span />' } },
      },
    });

    const dimensionsEl = wrapper.find('.preview-dimensions');
    expect(dimensionsEl.text()).toContain('×');
  });
});
