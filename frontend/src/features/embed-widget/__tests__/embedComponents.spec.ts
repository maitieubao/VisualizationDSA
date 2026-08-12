// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { useEmbedConfiguratorStore } from '../store/useEmbedConfiguratorStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { AuthUserDto } from '../../auth/services/authApi';
import EmbedWidgetWorkspace from '../components/EmbedWidgetWorkspace.vue';
import LiveWidgetPreview from '../components/LiveWidgetPreview.vue';
import EmbedCodeSnippet from '../components/EmbedCodeSnippet.vue';
import EmbedConfiguratorSidebar from '../components/EmbedConfiguratorSidebar.vue';
import EmbedWidgetView from '../../../views/embed/EmbedWidgetView.vue';

const routeState: { query: Record<string, unknown> } = { query: {} };

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../../../views/sorting/SortingView.vue', () => ({
  default: { name: 'SortingView', template: '<div class="sorting-view-stub" />' },
}));

vi.mock('../../../views/graph/GraphView.vue', () => ({
  default: { name: 'GraphView', template: '<div class="graph-view-stub" />' },
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

const baseIconStub = { template: '<span class="base-icon-stub" />' };

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

describe('Embed Widget — Component Tests (EW-010)', () => {
  let pinia: Pinia;
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    routeState.query = {};
    globalThis.ResizeObserver =
      MockResizeObserverStub as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  describe('EmbedWidgetWorkspace — config render', () => {
    it('render badge theme + algo từ store (config)', () => {
      const store = useEmbedConfiguratorStore();
      wrapper = mount(EmbedWidgetWorkspace, {
        global: {
          plugins: [pinia],
          stubs: {
            BaseIcon: baseIconStub,
            EmbedConfiguratorSidebar: {
              name: 'EmbedConfiguratorSidebar',
              template: '<div class="sidebar-stub" />',
            },
            LiveWidgetPreview: {
              name: 'LiveWidgetPreview',
              template: '<div class="preview-stub" />',
            },
            EmbedCodeSnippet: {
              name: 'EmbedCodeSnippet',
              template: '<div class="snippet-stub" />',
            },
          },
        },
      });

      expect(wrapper.find('.badge-theme').text()).toBe(store.themeLabel);
      expect(wrapper.find('.badge-algo').text()).toBe(store.algorithmLabel);
      expect(wrapper.find('.sidebar-stub').exists()).toBe(true);
      expect(wrapper.find('.preview-stub').exists()).toBe(true);
      expect(wrapper.find('.snippet-stub').exists()).toBe(true);
    });

    it('badges cập nhật theo store khi đổi theme/algo', async () => {
      const store = useEmbedConfiguratorStore();
      wrapper = mount(EmbedWidgetWorkspace, {
        global: {
          plugins: [pinia],
          stubs: {
            BaseIcon: baseIconStub,
            EmbedConfiguratorSidebar: {
              name: 'EmbedConfiguratorSidebar',
              template: '<div class="sidebar-stub" />',
            },
            LiveWidgetPreview: {
              name: 'LiveWidgetPreview',
              template: '<div class="preview-stub" />',
            },
            EmbedCodeSnippet: {
              name: 'EmbedCodeSnippet',
              template: '<div class="snippet-stub" />',
            },
          },
        },
      });

      store.setTheme('dark');
      store.setAlgorithm('heap-sort');
      await flushPromises();

      expect(wrapper.find('.badge-theme').text()).toBe('Dark');
      expect(wrapper.find('.badge-algo').text()).toBe('Heap Sort');
    });
  });

  describe('LiveWidgetPreview — iframe thật (EW-004)', () => {
    async function mountPreview(): Promise<VueWrapper> {
      return mount(LiveWidgetPreview, {
        global: { plugins: [pinia], stubs: { BaseIcon: baseIconStub } },
      });
    }

    it('render iframe preview với src = URL embed (rewrite localhost khi dev)', async () => {
      const store = useEmbedConfiguratorStore();
      wrapper = await mountPreview();

      const iframe = wrapper.find('iframe.preview-iframe');
      expect(iframe.exists()).toBe(true);

      const base = new URL(store.iframeSrcUrl);
      const expectedSrc = `${window.location.origin}${base.pathname}${base.search}`;
      expect(iframe.attributes('src')).toBe(expectedSrc);
      expect(iframe.attributes('title')).toContain(store.algorithmLabel);
      expect(iframe.attributes('sandbox')).toContain('allow-scripts');
    });

    it('loading overlay hiển thị trước khi iframe load, biến mất sau load', async () => {
      wrapper = await mountPreview();

      expect(wrapper.find('.preview-overlay').exists()).toBe(true);

      await wrapper.find('iframe.preview-iframe').trigger('load');
      expect(wrapper.find('.preview-overlay').exists()).toBe(false);
    });

    it('EW-015: error state sau timeout 8s khi iframe không load', async () => {
      vi.useFakeTimers();
      try {
        wrapper = await mountPreview();

        vi.advanceTimersByTime(8000);
        await flushPromises();

        expect(wrapper.find('.preview-error-state').exists()).toBe(true);
        expect(wrapper.find('.preview-error-state').text()).toContain('Không thể tải widget');
        expect(wrapper.find('.preview-retry-btn').exists()).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });

    it('Interactive off → iframe pointer-events none', async () => {
      const store = useEmbedConfiguratorStore();
      wrapper = await mountPreview();

      expect(wrapper.find('iframe.preview-iframe').attributes('style')).toContain('pointer-events: auto');

      store.toggleInteractive();
      await flushPromises();

      expect(wrapper.find('iframe.preview-iframe').attributes('style')).toContain('pointer-events: none');
    });

    it('EW-028: badge "(hiển thị thu nhỏ)" khi frame bị scale xuống, ẩn khi vừa khung', async () => {
      const store = useEmbedConfiguratorStore();
      wrapper = await mountPreview();

      expect(wrapper.find('.preview-scale-badge').exists()).toBe(true);

      store.setDimensions(500, 300);
      await flushPromises();

      expect(wrapper.find('.preview-scale-badge').exists()).toBe(false);
    });

    it('EW-015: nút VCR gửi STEP_FORWARD qua postMessage tới widget', async () => {
      wrapper = await mountPreview();

      const iframeEl = wrapper.find('iframe.preview-iframe').element as HTMLIFrameElement;
      const postSpy = vi.fn();
      Object.defineProperty(iframeEl, 'contentWindow', {
        configurable: true,
        value: { postMessage: postSpy },
      });

      const stepBtn = wrapper.find('button[aria-label="Bước tiếp theo"]');
      expect((stepBtn.element as HTMLButtonElement).disabled).toBe(true);

      await wrapper.find('iframe.preview-iframe').trigger('load');
      expect((stepBtn.element as HTMLButtonElement).disabled).toBe(false);

      await stepBtn.trigger('click');
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'VISUALIZATION_DSA_HOST',
          action: 'STEP_FORWARD',
        }),
        wrapper.find('iframe.preview-iframe').attributes('src'),
      );
    });
  });

  describe('EmbedCodeSnippet — copy + host script (EW-009/EW-017)', () => {
    async function mountSnippet(): Promise<VueWrapper> {
      return mount(EmbedCodeSnippet, {
        global: { plugins: [pinia], stubs: { BaseIcon: baseIconStub } },
      });
    }

    it('snippet code chứa mã iframe kèm selector data-embed-widget (EW-017)', async () => {
      wrapper = await mountSnippet();
      const code = wrapper.find('.snippet-code code').text();
      expect(code).toContain('<iframe');
      expect(code).toContain('data-embed-widget');
      expect(code).toContain(useEmbedConfiguratorStore().iframeSrcUrl);
    });

    it('copy thành công → writeText nhận mã có data-embed-widget + trạng thái ĐÃ SAO CHÉP!', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', { clipboard: { writeText } });
      try {
        wrapper = await mountSnippet();

        await wrapper.find('.copy-btn').trigger('click');
        await flushPromises();

        const displayCode = wrapper.find('.snippet-code code').text();
        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText).toHaveBeenCalledWith(displayCode);
        expect(wrapper.find('.copy-btn').text()).toContain('ĐÃ SAO CHÉP!');
        expect(wrapper.find('[role="status"]').text()).toBe('Đã sao chép mã nhúng');
        expect(wrapper.find('.copy-error').exists()).toBe(false);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('copy thất bại → hiện copyError role=alert; tự ẩn sau 4s (EW-027)', async () => {
      vi.useFakeTimers();
      try {
        vi.stubGlobal('navigator', {
          clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
        });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        wrapper = await mountSnippet();

        await wrapper.find('.copy-btn').trigger('click');
        await flushPromises();

        expect(wrapper.find('.copy-error[role="alert"]').exists()).toBe(true);
        expect(wrapper.find('[role="status"]').text()).toBe('Sao chép thất bại');

        vi.advanceTimersByTime(4000);
        await flushPromises();
        expect(wrapper.find('.copy-error').exists()).toBe(false);
        errorSpy.mockRestore();
      } finally {
        vi.useRealTimers();
        vi.unstubAllGlobals();
      }
    });

    it('EW-027: reset cấu hình (generatedIframeCode đổi) xóa copyError ngay lập tức', async () => {
      const store = useEmbedConfiguratorStore();
      store.setTheme('dark');
      vi.stubGlobal('navigator', {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      });
      try {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        wrapper = await mountSnippet();

        await wrapper.find('.copy-btn').trigger('click');
        await flushPromises();
        expect(wrapper.find('.copy-error').exists()).toBe(true);

        store.resetConfigurator();
        await flushPromises();
        expect(wrapper.find('.copy-error').exists()).toBe(false);
        errorSpy.mockRestore();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('host integration script dùng selector [data-embed-widget] + check event.source (EW-017)', async () => {
      wrapper = await mountSnippet();
      const hostScript = wrapper.findAll('.snippet-code code')[1].text();
      expect(hostScript).toContain("document.querySelector('[data-embed-widget]')");
      expect(hostScript).toContain('event.source !== iframe.contentWindow');
      expect(hostScript).toContain("event.origin !== ");
    });
  });

  describe('EmbedConfiguratorSidebar — radiogroup + premium (EW-016/EW-029)', () => {
    async function mountSidebar(): Promise<VueWrapper> {
      return mount(EmbedConfiguratorSidebar, {
        global: { plugins: [pinia], stubs: { BaseIcon: baseIconStub } },
      });
    }

    it('EW-029: theme buttons nằm trong fieldset role=radiogroup với role=radio + aria-checked', async () => {
      wrapper = await mountSidebar();

      const fieldset = wrapper.find('.theme-fieldset');
      expect(fieldset.attributes('role')).toBe('radiogroup');

      const buttons = wrapper.findAll('.theme-btn');
      expect(buttons).toHaveLength(3);
      buttons.forEach((btn) => {
        expect(btn.attributes('role')).toBe('radio');
        expect(btn.attributes('aria-checked')).toBeDefined();
      });

      const active = buttons.find((b) => b.attributes('aria-checked') === 'true');
      expect(active?.text()).toBe('Glass');
    });

    it('click theme button cập nhật store + aria-checked', async () => {
      const store = useEmbedConfiguratorStore();
      wrapper = await mountSidebar();

      await wrapper.find('.theme-btn[aria-label="Theme Dark"]').trigger('click');
      expect(store.selectedTheme).toBe('dark');
      const active = wrapper.find('.theme-btn[aria-checked="true"]');
      expect(active.attributes('aria-label')).toBe('Theme Dark');
    });

    it('EW-016: user thường — dijkstra option disabled + premium hint hiển thị', async () => {
      wrapper = await mountSidebar();

      const dijkstraOption = wrapper.find('select option[value="dijkstra"]');
      expect(dijkstraOption.exists()).toBe(true);
      expect(dijkstraOption.attributes('disabled')).toBeDefined();
      expect(wrapper.find('.embed-premium-hint').exists()).toBe(true);
      expect(wrapper.find('.embed-premium-hint').text()).toContain('Premium');

      const store = useEmbedConfiguratorStore();
      await wrapper.find('#embed-algo-select').setValue('dijkstra');
      expect(store.selectedAlgorithm).not.toBe('dijkstra');
    });

    it('EW-016: user premium — dijkstra chọn được, hint ẩn', async () => {
      const auth = useAuthStore();
      auth.accessToken = 'token';
      auth.currentUser = makeAuthUser(true);

      const store = useEmbedConfiguratorStore();
      wrapper = await mountSidebar();

      expect(wrapper.find('.embed-premium-hint').exists()).toBe(false);

      const dijkstraOption = wrapper.find('select option[value="dijkstra"]');
      expect(dijkstraOption.attributes('disabled')).toBeUndefined();

      await wrapper.find('#embed-algo-select').setValue('dijkstra');
      expect(store.selectedAlgorithm).toBe('dijkstra');
    });

    it('EW-030: quick-sort tồn tại trong danh sách algorithm options', async () => {
      wrapper = await mountSidebar();
      expect(wrapper.find('select option[value="quick-sort"]').exists()).toBe(true);
    });
  });

  describe('EmbedWidgetView — overlays (EW-010)', () => {
    async function mountView(query: Record<string, unknown>): Promise<VueWrapper> {
      routeState.query = query;
      return mount(EmbedWidgetView, {
        global: { plugins: [pinia], stubs: { BaseIcon: baseIconStub } },
      });
    }

    it('isMinimalMode: ?algo=... → render visualizer thay vì workspace', async () => {
      wrapper = await mountView({ algo: 'bubble-sort' });

      expect(wrapper.find('.sorting-view-stub').exists()).toBe(true);
      expect(wrapper.find('.embed-widget-workspace').exists()).toBe(false);
    });

    it('không có query → render workspace configurator', async () => {
      wrapper = await mountView({});

      expect(wrapper.find('.embed-widget-workspace').exists()).toBe(true);
    });

    it('isInvalidAlgo: ?algo=oop → error overlay với hint hợp lệ (EW-011)', async () => {
      wrapper = await mountView({ algo: 'oop' });

      expect(wrapper.find('.embed-error-overlay').exists()).toBe(true);
      expect(wrapper.find('.embed-error-card h2').text()).toBe('Thuật toán không hợp lệ');
      const hint = wrapper.find('.embed-error-hint').text();
      expect(hint).toContain('heap-sort');
      expect(hint).toContain('dijkstra');
      expect(hint).toContain('quick-sort');
    });

    it('EW-005: ?algo= rỗng → error overlay, không crash, không trắng màn hình', async () => {
      wrapper = await mountView({ algo: '' });
      expect(wrapper.find('.embed-error-overlay').exists()).toBe(true);
    });

    it('EW-005: ?algo=a&algo=b (array) → không crash, lấy phần tử đầu', async () => {
      wrapper = await mountView({ algo: ['a', 'b'] });
      expect(wrapper.find('.embed-error-overlay').exists()).toBe(true);
    });

    it('isPremiumBlocked: ?algo=dijkstra + user thường → premium overlay', async () => {
      wrapper = await mountView({ algo: 'dijkstra' });

      expect(wrapper.find('.embed-premium-overlay').exists()).toBe(true);
      expect(wrapper.find('.embed-premium-card h2').text()).toBe('Nội dung Premium');
      expect(wrapper.find('.graph-view-stub').exists()).toBe(false);
    });
  });
});
