// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { useAnimationStore } from '../../../features/animation-engine/store/useAnimationStore';
import { useVcrStore } from '../../../features/vcr-player/store/useVcrStore';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import type { AuthUserDto } from '../../../features/auth/services/authApi';
import EmbedWidgetView from '../EmbedWidgetView.vue';

const routeState: { query: Record<string, unknown> } = { query: {} };

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../../graph/GraphView.vue', () => ({
  default: { name: 'GraphView', template: '<div class="graph-view-stub" />' },
}));

vi.mock('../../../features/algorithm-sandbox', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../features/algorithm-sandbox')>();
  return {
    ...actual,
    ArrayBarVisualizer: {
      name: 'ArrayBarVisualizer',
      template: '<div class="array-bar-stub" />',
    },
  };
});

vi.mock('../../../features/algorithm-sandbox/components/SortingDrawerTrace.vue', () => ({
  default: { name: 'SortingDrawerTrace', template: '<div class="trace-stub" />' },
}));

vi.mock('../../../features/vcr-player', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../features/vcr-player')>();
  return {
    ...actual,
    VcrDockBar: { name: 'VcrDockBar', template: '<div class="vcr-dock-stub" />' },
  };
});

vi.mock('../../../features/dsa-modules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../features/dsa-modules')>();
  return {
    ...actual,
    DSAPlayer: { name: 'DSAPlayer', template: '<div class="dsa-player-stub" />' },
  };
});

vi.mock('../../../features/pseudocode-sync', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../features/pseudocode-sync')>();
  return {
    ...actual,
    MultilingualCodePanel: {
      name: 'MultilingualCodePanel',
      template: '<div class="code-panel-stub" />',
    },
  };
});

vi.mock('../../../features/pseudocode-sync/scripts/scriptLoader', () => ({
  loadPseudocodeScript: vi.fn(() => null),
}));

vi.mock('../../../shared/components/BaseIcon.vue', () => ({
  default: { name: 'BaseIcon', template: '<span class="base-icon-stub" />' },
}));

class MockResizeObserverStub {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = MockResizeObserverStub as unknown as typeof ResizeObserver;

function makeAuthUser(isPremium: boolean): AuthUserDto {
  return {
    id: 'u-1',
    email: 'student@dsa.edu.vn',
    username: 'student',
    totalXP: 100,
    currentLevel: 2,
    streakDays: 1,
    createdAt: '2024-01-01',
    badges: [],
    isPremium,
    role: 'Student',
  };
}

describe('EmbedWidgetView — minimal mode integration (EW-003/EW-002)', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    routeState.query = {};
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  async function mountView(query: Record<string, unknown>): Promise<VueWrapper> {
    routeState.query = query;
    wrapper = mount(EmbedWidgetView, {
      global: { plugins: [pinia] },
    });
    await flushPromises();
    return wrapper;
  }

  it('EW-003t: ?algo=heap-sort&theme=dark&vcr=false&watch=false → renderer + algorithmId + params consume', async () => {
    wrapper = await mountView({ algo: 'heap-sort', theme: 'dark', vcr: 'false', watch: 'false' });

    expect(wrapper.find('.sorting-view-root').exists()).toBe(true);

    const animStore = useAnimationStore();
    expect(animStore.algorithmId).toBe('heap-sort');

    expect(wrapper.find('.vcr-dock-stub').exists()).toBe(false);
    expect(wrapper.find('.trace-stub').exists()).toBe(false);

    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal-dark');
  });

  it('EW-003t: WIDGET_READY được gửi qua bridge (wire EW-002)', async () => {
    const postSpy = vi.spyOn(window.parent, 'postMessage');
    await mountView({ algo: 'heap-sort' });

    expect(postSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'VISUALIZATION_DSA_WIDGET',
        action: 'WIDGET_READY',
        payload: null,
      }),
      expect.any(String),
    );
  });

  it('EW-003: vcr=true mặc định → VcrDockBar hiển thị; watch=true → trace drawer hiển thị', async () => {
    wrapper = await mountView({ algo: 'bubble-sort', vcr: 'true', watch: 'true' });

    expect(wrapper.find('.vcr-dock-stub').exists()).toBe(true);
    expect(wrapper.find('.trace-stub').exists()).toBe(true);
  });

  it('EW-003: theme=light → data-theme light; theme=glass → terminal-dark (map mặc định)', async () => {
    await mountView({ algo: 'bubble-sort', theme: 'light' });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    wrapper?.unmount();
    wrapper = null;

    await mountView({ algo: 'bubble-sort', theme: 'glass' });
    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal-dark');
  });

  it('EW-003: interactive=false → root mang class widget-noninteractive', async () => {
    wrapper = await mountView({ algo: 'bubble-sort', interactive: 'false' });
    expect(wrapper.find('.embed-widget-root').classes()).toContain('widget-noninteractive');
  });

  it('EW-003: interactive mặc định → không có class widget-noninteractive', async () => {
    wrapper = await mountView({ algo: 'bubble-sort' });
    expect(wrapper.find('.embed-widget-root').classes()).not.toContain('widget-noninteractive');
  });

  it('EW-002: host gửi STEP_FORWARD → animStore.stepForward + vcrStore.stepNext được gọi', async () => {
    await mountView({ algo: 'heap-sort' });

    const animStore = useAnimationStore();
    const vcrStore = useVcrStore();
    const stepForwardSpy = vi.spyOn(animStore, 'stepForward');
    const stepNextSpy = vi.spyOn(vcrStore, 'stepNext');

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://moodle.hust.edu.vn',
        data: {
          source: 'VISUALIZATION_DSA_HOST',
          action: 'STEP_FORWARD',
          payload: { stepIndex: 1 },
        },
      }),
    );

    expect(stepForwardSpy).toHaveBeenCalledTimes(1);
    expect(stepNextSpy).toHaveBeenCalledTimes(1);
  });

  it('EW-002: host gửi RESET → animStore.stop + vcrStore.reset', async () => {
    await mountView({ algo: 'heap-sort' });

    const animStore = useAnimationStore();
    const vcrStore = useVcrStore();
    const stopSpy = vi.spyOn(animStore, 'stop');
    const resetSpy = vi.spyOn(vcrStore, 'reset');

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://moodle.hust.edu.vn',
        data: { source: 'VISUALIZATION_DSA_HOST', action: 'RESET', payload: null },
      }),
    );

    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(resetSpy).toHaveBeenCalledTimes(1);
  });

  it('EW-016t: ?algo=dijkstra + user premium → render GraphView, không overlay', async () => {
    const auth = useAuthStore();
    auth.accessToken = 'token';
    auth.currentUser = makeAuthUser(true);

    wrapper = await mountView({ algo: 'dijkstra' });

    expect(wrapper.find('.embed-premium-overlay').exists()).toBe(false);
    expect(wrapper.find('.graph-view-stub').exists()).toBe(true);
  });

  it('EW-030: ?algo=quick-sort → render SortingView (quick-sort có trong VISUALIZER_MAP)', async () => {
    wrapper = await mountView({ algo: 'quick-sort' });

    expect(wrapper.find('.sorting-view-root').exists()).toBe(true);
    expect(useAnimationStore().algorithmId).toBe('quick-sort');
  });

  it('EW-011: hint lỗi liệt kê đúng các renderer tồn tại (không liệt kê oop/solid/di)', async () => {
    wrapper = await mountView({ algo: 'oop' });

    const hint = wrapper.find('.embed-error-hint').text();
    expect(hint).not.toContain('oop');
    expect(hint).not.toContain('solid');
    expect(hint).not.toContain('design-patterns');
    expect(hint).toContain('dijkstra');
    expect(hint).toContain('heap-sort');
  });
});
