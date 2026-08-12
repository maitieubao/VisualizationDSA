// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia, type Pinia } from 'pinia';
import { nextTick } from 'vue';
import ArrayInputBar from '../components/ArrayInputBar.vue';
import CompilerConsole from '../components/CompilerConsole.vue';
import CodeWorkspace from '../components/CodeWorkspace.vue';
import MonacoEditorPanel from '../components/MonacoEditorPanel.vue';
import { useLiveCompilerStore } from '../store/useLiveCompilerStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { DEFAULT_INPUT_ARRAY } from '../store/liveCompilerDefaults';

interface FakeMonacoEditorApi {
  getValue: () => string;
  onDidChangeModelContent: (cb: () => void) => void;
  getModel: () => { dispose: () => void };
  dispose: () => void;
}

const { setModelMarkers, defineTheme, createEditor } = vi.hoisted(() => ({
  setModelMarkers: vi.fn<(model: unknown, owner: string, markers: Array<{ startLineNumber: number }>) => void>(),
  defineTheme: vi.fn<(name: string, theme: unknown) => void>(),
  createEditor: vi.fn<(container: HTMLElement, options: unknown) => FakeMonacoEditorApi>(),
}));

vi.mock('@monaco-editor/loader', () => ({
  default: {
    init: vi.fn().mockResolvedValue({
      MarkerSeverity: { Error: 8 },
      editor: {
        defineTheme,
        create: createEditor,
        setModelMarkers,
      },
    }),
  },
}));

const fakeEditorInstance: FakeMonacoEditorApi = {
  getValue: () => '',
  onDidChangeModelContent: vi.fn(),
  getModel: () => ({ dispose: vi.fn() }),
  dispose: vi.fn(),
};

describe('ArrayInputBar (mount) — CV-119, CV-137', () => {
  let pinia: Pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  function mountBar(
    props: Partial<{ modelValue: string; isValid: boolean; isCompiling: boolean; errorMessage: string }> = {},
  ) {
    return mount(ArrayInputBar, {
      props: {
        modelValue: '5, 3, 8, 1, 9',
        isValid: true,
        isCompiling: false,
        errorMessage: '',
        ...props,
      },
      global: { plugins: [pinia], stubs: { BaseIcon: true } },
    });
  }

  it('label "Mảng đầu vào" có for/id khớp input (CV-137)', () => {
    const wrapper = mountBar();
    const label = wrapper.find('label');
    const input = wrapper.find('input');
    expect(label.text()).toContain('Mảng đầu vào');
    expect(label.attributes('for')).toBe('array-input');
    expect(input.attributes('id')).toBe('array-input');
    wrapper.unmount();
  });

  it('isValid=false + errorMessage → role=alert hiện + RUN disabled (CV-119)', () => {
    const wrapper = mountBar({
      isValid: false,
      errorMessage: 'Giá trị "x" không hợp lệ — chỉ chấp nhận số nguyên/thập phân, ngăn cách bằng dấu phẩy.',
    });
    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('không hợp lệ');
    expect(wrapper.find('[data-tour-id="code-ide-run-btn"]').attributes('disabled')).toBeDefined();
    wrapper.unmount();
  });

  it('isValid=true → không alert, RUN enabled, không có nút Cancel', () => {
    const wrapper = mountBar();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    const runBtn = wrapper.find('[data-tour-id="code-ide-run-btn"]');
    expect(runBtn.exists()).toBe(true);
    expect(runBtn.attributes('disabled')).toBeUndefined();
    expect(wrapper.find('[data-tour-id="code-ide-cancel-btn"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('gõ input → emit update:modelValue với giá trị mới (v-model thay blur)', async () => {
    const wrapper = mountBar();
    await wrapper.find('input').setValue('9, 8, 7');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['9, 8, 7']);
    wrapper.unmount();
  });

  it('click RUN → emit run; isCompiling → Cancel hiện và emit cancel', async () => {
    const wrapper = mountBar();
    await wrapper.find('[data-tour-id="code-ide-run-btn"]').trigger('click');
    expect(wrapper.emitted('run')).toHaveLength(1);

    const cancelBar = mountBar({ isCompiling: true });
    expect(cancelBar.find('[data-tour-id="code-ide-run-btn"]').exists()).toBe(false);
    await cancelBar.find('[data-tour-id="code-ide-cancel-btn"]').trigger('click');
    expect(cancelBar.emitted('cancel')).toHaveLength(1);
    cancelBar.unmount();
    wrapper.unmount();
  });
});

describe('CompilerConsole (mount) — CV-004, CV-117, CV-136', () => {
  let pinia: Pinia;
  let store: ReturnType<typeof useLiveCompilerStore>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useLiveCompilerStore();
  });

  function mountConsole() {
    return mount(CompilerConsole, {
      global: { plugins: [pinia], stubs: { BaseIcon: true } },
    });
  }

  it('chưa có log → hướng dẫn RUN, không có nút Xóa', () => {
    const wrapper = mountConsole();
    expect(wrapper.text()).toContain('Compiler Console');
    expect(wrapper.text()).toContain('Nhấn RUN để bắt đầu');
    expect(wrapper.find('button').exists()).toBe(false);
    wrapper.unmount();
  });

  it('render log theo type: badge text + class + đếm dòng (CV-004)', () => {
    store.addConsoleLog('Biên dịch xong', 'success');
    store.addConsoleLog('Lỗi cú pháp', 'error');
    store.addConsoleLog('Cảnh báo biến', 'warn');
    const wrapper = mountConsole();
    const lines = wrapper.findAll('.console-log-line');
    expect(lines).toHaveLength(3);
    expect(lines[0].classes()).toContain('status-success');
    expect(lines[0].text()).toContain('[SUCCESS]');
    expect(lines[1].classes()).toContain('status-error');
    expect(lines[1].text()).toContain('[LỖI]');
    expect(lines[2].classes()).toContain('status-warn');
    expect(lines[2].text()).toContain('[CẢNH BÁO]');
    expect(wrapper.text()).toContain('3 dòng');
    wrapper.unmount();
  });

  it('click Xóa → clearLogs, log biến mất', async () => {
    store.addConsoleLog('tạm thời', 'info');
    const wrapper = mountConsole();
    await wrapper.find('button').trigger('click');
    expect(store.compilerConsoleLogs).toEqual([]);
    expect(wrapper.find('.console-log-line').exists()).toBe(false);
    wrapper.unmount();
  });

  it('log dài giữ nguyên nội dung trong container class wrap (CV-136)', () => {
    const longText = 'a'.repeat(500);
    store.addConsoleLog(longText, 'info');
    const wrapper = mountConsole();
    const line = wrapper.find('.console-log-line');
    expect(line.exists()).toBe(true);
    expect(line.text()).toContain(longText);
    wrapper.unmount();
  });

  it('auto-scroll chỉ khi user ở đáy, không khi đang cuộn lên (CV-117)', async () => {
    const wrapper = mountConsole();
    const el = wrapper.find('.overflow-y-auto').element as HTMLElement;
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 100 });
    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 100 });
    el.scrollTop = 0;

    store.addConsoleLog('log 1', 'info');
    await nextTick();
    await flushPromises();
    expect(el.scrollTop).toBe(100);

    Object.defineProperty(el, 'scrollHeight', { configurable: true, value: 500 });
    el.scrollTop = 50;
    store.addConsoleLog('log 2', 'info');
    await nextTick();
    await flushPromises();
    expect(el.scrollTop).toBe(50);

    el.scrollTop = 400;
    store.addConsoleLog('log 3', 'info');
    await nextTick();
    await flushPromises();
    expect(el.scrollTop).toBe(500);
    wrapper.unmount();
  });
});

describe('MonacoEditorPanel (mount) — CV-006, CV-118', () => {
  let pinia: Pinia;
  let store: ReturnType<typeof useLiveCompilerStore>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useLiveCompilerStore();
    vi.clearAllMocks();
    createEditor.mockImplementation(() => fakeEditorInstance);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  function mountMonaco() {
    return mount(MonacoEditorPanel, {
      global: { plugins: [pinia], stubs: { BaseIcon: true } },
    });
  }

  it('mount với compileErrorLine → setModelMarkers vẽ marker đúng dòng (CV-118)', async () => {
    store.compileErrorLine = 3;
    const wrapper = mountMonaco();
    await flushPromises();

    expect(setModelMarkers).toHaveBeenCalledTimes(1);
    const [model, owner, markers] = setModelMarkers.mock.calls[0];
    expect(model).toBeDefined();
    expect(owner).toBe('liveCompiler');
    expect(markers).toHaveLength(1);
    expect(markers[0].startLineNumber).toBe(3);
    wrapper.unmount();
  });

  it('đổi compileErrorLine → marker cập nhật; null → xóa marker', async () => {
    const wrapper = mountMonaco();
    await flushPromises();

    store.compileErrorLine = 7;
    await nextTick();
    const [, , markers] = setModelMarkers.mock.calls[setModelMarkers.mock.calls.length - 1];
    expect(markers[0].startLineNumber).toBe(7);

    store.compileErrorLine = null;
    await nextTick();
    const [, , cleared] = setModelMarkers.mock.calls[setModelMarkers.mock.calls.length - 1];
    expect(cleared).toEqual([]);
    wrapper.unmount();
  });

  it('lastCompileSucceeded=true → glow xanh trong 2s rồi tắt (CV-006)', async () => {
    const wrapper = mountMonaco();
    await flushPromises();
    const root = wrapper.find('[data-tour-id="code-ide-editor"]');
    expect(root.exists()).toBe(true);

    vi.useFakeTimers();
    try {
      store.lastCompileSucceeded = true;
      await nextTick();
      expect(root.classes()).toContain('compile-success-glow');

      vi.advanceTimersByTime(2000);
      await nextTick();
      expect(root.classes()).not.toContain('compile-success-glow');
    } finally {
      vi.useRealTimers();
    }
    wrapper.unmount();
  });

  it('hasCompileError=true → compile-failed-glow (CV-006)', async () => {
    const wrapper = mountMonaco();
    await flushPromises();
    const root = wrapper.find('[data-tour-id="code-ide-editor"]');

    store.hasCompileError = true;
    await nextTick();
    expect(root.classes()).toContain('compile-failed-glow');
    wrapper.unmount();
  });
});

describe('CodeWorkspace (mount) — CV-105..122, CV-134, CV-135', () => {
  let pinia: Pinia;
  let store: ReturnType<typeof useLiveCompilerStore>;
  let animStore: ReturnType<typeof useAnimationStore>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useLiveCompilerStore();
    animStore = useAnimationStore();
    vi.clearAllMocks();
    createEditor.mockImplementation(() => fakeEditorInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function mountWorkspace() {
    return mount(CodeWorkspace, {
      global: {
        plugins: [pinia],
        stubs: {
          CanvasLayer: true,
          AnimControlPanel: true,
          BaseIcon: true,
        },
      },
    });
  }

  it('chuỗi data-tour-id tồn tại trên các phần tử chính (CV-134)', async () => {
    const wrapper = mountWorkspace();
    await flushPromises();
    expect(wrapper.find('[data-tour-id="code-ide-editor"]').exists()).toBe(true);
    expect(wrapper.find('[data-tour-id="code-ide-array-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-tour-id="code-ide-run-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-tour-id="code-ide-canvas"]').exists()).toBe(true);
    expect(wrapper.find('[data-tour-id="code-ide-vcr"]').exists()).toBe(true);
    expect(wrapper.find('[data-tour-id="code-ide-console"]').exists()).toBe(true);
    wrapper.unmount();
  });

  it('RUN hiện khi chưa compile và enabled với input hợp lệ (CV-116)', async () => {
    const wrapper = mountWorkspace();
    await flushPromises();
    expect(wrapper.find('[data-tour-id="code-ide-run-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-tour-id="code-ide-run-btn"]').attributes('disabled')).toBeUndefined();
    expect(wrapper.find('[data-tour-id="code-ide-cancel-btn"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('isCompiling → Cancel hiện thay RUN (CV-116)', async () => {
    const wrapper = mountWorkspace();
    await flushPromises();
    store.isCompiling = true;
    await nextTick();
    expect(wrapper.find('[data-tour-id="code-ide-cancel-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-tour-id="code-ide-run-btn"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('validate realtime: 1, 2, x và 1,,2 → alert + RUN disabled; 1, 2, 3 → hết lỗi (CV-119)', async () => {
    const wrapper = mountWorkspace();
    await flushPromises();
    const input = wrapper.find('input#array-input');

    await input.setValue('1, 2, x');
    await nextTick();
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    expect(wrapper.find('[role="alert"]').text()).toContain('không hợp lệ');
    expect(wrapper.find('[data-tour-id="code-ide-run-btn"]').attributes('disabled')).toBeDefined();

    await input.setValue('1,,2');
    await nextTick();
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);

    await input.setValue('1, 2, 3');
    await nextTick();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('[data-tour-id="code-ide-run-btn"]').attributes('disabled')).toBeUndefined();
    wrapper.unmount();
  });

  it('input khởi tạo từ DEFAULT_INPUT_ARRAY (CV-134)', async () => {
    const wrapper = mountWorkspace();
    await flushPromises();
    expect((wrapper.find('input#array-input').element as HTMLInputElement).value).toBe(DEFAULT_INPUT_ARRAY.join(', '));
    wrapper.unmount();
  });

  it('mount gọi animStore.clear() + overlay hướng dẫn khi chưa có frames (CV-135)', async () => {
    const wrapper = mountWorkspace();
    await flushPromises();
    expect(animStore.totalSteps).toBe(0);
    expect(wrapper.text()).toContain('Viết mã sắp xếp bên trái');
    wrapper.unmount();
  });
});
