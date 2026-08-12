// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import { createPinia, setActivePinia, type Pinia } from 'pinia';

// ── Mocks: Monaco + workers + splitpanes + compileWorker (AlgoPlaygroundWorkspace
//    được import tĩnh bởi view nhưng chỉ render khi mode === 'algo' → stub). ──
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
    getModel: vi.fn(() => ({ uri: 'test' })),
  });
  return {
    editor: {
      create: vi.fn(() => makeEditor()),
      setTheme: vi.fn(),
      setModelLanguage: vi.fn(),
    },
  };
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
vi.mock('../../../core/compileWorker', () => ({
  compileInWorker: vi.fn(),
  disposeCompileWorker: vi.fn(),
}));

import PlaygroundView from '../PlaygroundView.vue';
import { useHtmlPlaygroundStore } from '../../../features/html-playground/store/useHtmlPlaygroundStore';
import { PlaygroundUrlCodec } from '../../../features/html-playground/engine/PlaygroundUrlCodec';
import { DEFAULT_PLAYGROUND_SOURCE } from '../../../features/html-playground/types/playground.types';
import { useToastStore } from '../../../composables/useToast';

let router: Router;
let pinia: Pinia;
let wrapper: VueWrapper | null = null;

async function mountView(query: Record<string, string> = {}): Promise<void> {
  router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/playground', name: 'playground', component: PlaygroundView }],
  });
  await router.replace({ path: '/playground', query });
  await router.isReady();
  pinia = createPinia();
  setActivePinia(pinia);
  wrapper = mount(PlaygroundView, {
    global: {
      plugins: [pinia, router],
      stubs: {
        BaseIcon: { template: '<span />' },
        AlgoPlaygroundWorkspace: {
          name: 'AlgoPlaygroundWorkspace',
          template: '<div class="algo-workspace-stub" />',
        },
      },
    },
  });
  await flushPromises();
}

describe('HT-004 (P1): PlaygroundView — Share URL → nạp state', () => {
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('mount với query ?code= → store nạp đúng html/css/js từ payload', async () => {
    const source = {
      html: '<h1>Shared 🎉</h1>',
      css: 'h1 { color: indigo; }',
      js: 'console.log("shared");',
    };
    const payload = PlaygroundUrlCodec.encode(source);
    expect(payload).not.toBeNull();
    await mountView({ code: payload as string });

    const store = useHtmlPlaygroundStore();
    expect(store.html).toBe(source.html);
    expect(store.css).toBe(source.css);
    expect(store.js).toBe(source.js);
  });

  it('roundtrip encodeURIComponent → query decode không mất dữ liệu', async () => {
    const source = {
      html: '<p>Round trip</p>',
      css: 'p { font-size: 16px; }',
      js: 'const x = 42;',
    };
    const payload = PlaygroundUrlCodec.encode(source);
    expect(payload).not.toBeNull();
    await mountView({ code: encodeURIComponent(payload as string) });

    const store = useHtmlPlaygroundStore();
    expect(store.html).toBe('<p>Round trip</p>');
    expect(store.css).toBe('p { font-size: 16px; }');
    expect(store.js).toBe('const x = 42;');
  });

  it('watch query đổi (router.replace) → store nạp lại source mới', async () => {
    await mountView({});
    const store = useHtmlPlaygroundStore();
    expect(store.html).toBe(DEFAULT_PLAYGROUND_SOURCE.html);

    const nextPayload = PlaygroundUrlCodec.encode({
      html: '<p>After nav</p>',
      css: '',
      js: '',
    });
    await router.replace({ path: '/playground', query: { code: nextPayload } });
    await flushPromises();

    expect(store.html).toBe('<p>After nav</p>');
    expect(store.css).toBe('');
    expect(store.js).toBe('');
  });

  it('payload hỏng → toast cảnh báo + store giữ code mặc định', async () => {
    await mountView({});
    const store = useHtmlPlaygroundStore();
    const toastStore = useToastStore();

    await router.replace({ path: '/playground', query: { code: 'not-a-valid-payload!!' } });
    await flushPromises();

    expect(store.html).toBe(DEFAULT_PLAYGROUND_SOURCE.html);
    expect(toastStore.activeToasts.length).toBeGreaterThan(0);
  });
});

describe('HT-017 (P2): Đổi mode free↔algo giữ state store', () => {
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('mode switch không reset code user (store giữ html/css/js)', async () => {
    await mountView({});
    const store = useHtmlPlaygroundStore();
    store.setSourceFile('html', '<p>kept across modes</p>');

    const algoButton = wrapper!.findAll('button.mode-toggle-btn')[1];
    await algoButton.trigger('click');
    await flushPromises();

    expect(store.html).toBe('<p>kept across modes</p>');
    expect(wrapper!.find('.algo-workspace-stub').exists()).toBe(true);

    const freeButton = wrapper!.findAll('button.mode-toggle-btn')[0];
    await freeButton.trigger('click');
    await flushPromises();

    expect(store.html).toBe('<p>kept across modes</p>');
    expect(wrapper!.find('.algo-workspace-stub').exists()).toBe(false);
    expect(wrapper!.find('iframe').exists()).toBe(true);
  });
});
