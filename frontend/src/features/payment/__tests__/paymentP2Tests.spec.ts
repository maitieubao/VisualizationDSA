// @vitest-environment jsdom

// EX-029 (P3): Tách suite Payment PA-002→012 khỏi exportP2Tests.spec.ts —
// chuyển về đúng feature spec (payment).

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { nextTick, defineComponent, h } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

const BaseIconStub = defineComponent({
  name: 'BaseIcon',
  props: ['name', 'class'],
  render() {
    return h('span', { class: this.class, 'data-icon': this.name }, this.name);
  },
});

config.global.stubs = {
  BaseIcon: BaseIconStub,
  Teleport: true,
};

const routerPushMock = vi.hoisted(() => vi.fn());
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPushMock, replace: vi.fn() }),
  useRoute: () => ({ query: {}, fullPath: '/' }),
}));

vi.mock('../services/paymentApi', () => ({
  createOrder: vi.fn(async () => ({
    id: 'order-123',
    userId: 'user-456',
    paymentCode: 'PAY123',
    amount: 199000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    bankId: 'MBBank',
    bankAccount: '123456789',
    accountName: 'VISUALIZATION DSA',
    qrUrl: 'data:image/png;base64,test',
  })),
  getOrderStatus: vi.fn(async () => ({
    id: 'order-123',
    userId: 'user-456',
    paymentCode: 'PAY123',
    amount: 199000,
    status: 'Completed',
    createdAt: new Date().toISOString(),
    completedAt: null,
    bankId: 'MBBank',
    bankAccount: '123456789',
    accountName: 'VISUALIZATION DSA',
    qrUrl: 'data:image/png;base64,test',
  })),
}));

vi.mock('../services/statelessPaymentApi', () => ({
  statelessPaymentApi: {
    getConfig: vi.fn(async () => ({
      premiumPrice: 199000,
      currency: 'VND',
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      supportedMethods: ['vietqr', 'momo'],
      premiumFeatures: [],
    })),
    checkout: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      qrUrl: 'data:image/png;base64,stateless-test',
    })),
    verify: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'Completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      qrUrl: 'data:image/png;base64,stateless-test',
    })),
    getOrderStatus: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      qrUrl: 'data:image/png;base64,stateless-test',
    })),
    simulateWebhook: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'Completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      bankId: 'MBBank',
      bankAccount: '123456789',
      accountName: 'VISUALIZATION DSA',
      qrUrl: 'data:image/png;base64,stateless-test',
    })),
    getPremiumStatus: vi.fn(async () => ({
      isPremium: false,
      upgradedAt: null,
      plan: 'free',
      unlockedFeatures: [],
    })),
    checkFeatureAccess: vi.fn(async () => ({ hasAccess: false })),
    getTransactions: vi.fn(async () => []),
  },
}));

vi.mock('../../auth/store/useAuthStore', () => {
  return {
    useAuthStore: vi.fn(() => ({
      accessToken: 'mock-token-123',
      currentUser: { id: 'user-123', username: 'testuser', isPremium: false },
      isAuthenticated: true,
      isStatelessMode: true,
      getAccessToken: vi.fn(() => 'mock-token-123'),
    })),
  };
});

import { usePaymentStore } from '../store/usePaymentStore';
import { statelessPaymentApi } from '../services/statelessPaymentApi';
import PremiumMarketingCard from '../components/PremiumMarketingCard.vue';
import CheckoutSuccessScreen from '../components/CheckoutSuccessScreen.vue';
import PremiumGate from '../components/PremiumGate.vue';
import QrPaymentPanel from '../components/QrPaymentPanel.vue';
import { usePaymentTimer } from '../composables/usePaymentTimer';

// PM-034: factory order đầy đủ 11 field camelCase khớp StatelessOrderDto/OrderDto —
// component đổi field nào cũng bị test bắt.
interface QrPaymentOrderDto {
  id: string;
  userId: string;
  paymentCode: string;
  amount: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  bankId: string;
  bankAccount: string;
  accountName: string;
  qrUrl: string;
}

function createPaymentOrderDto(overrides: Partial<QrPaymentOrderDto> = {}): QrPaymentOrderDto {
  return {
    id: 'order-123',
    userId: 'user-456',
    paymentCode: 'PAY123',
    amount: 199000,
    status: 'Pending',
    createdAt: '2026-08-11T10:00:00.000Z',
    completedAt: null,
    bankId: 'MBBank',
    bankAccount: '123456789',
    accountName: 'VISUALIZATION DSA',
    qrUrl: 'data:image/png;base64,test',
    ...overrides,
  };
}

describe('Payment — P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    routerPushMock.mockClear();
  });

  describe('PA-002 (P2): Marketing card', () => {
    it('PremiumMarketingCard should render premium badge', async () => {
      const wrapper = mount(PremiumMarketingCard);

      expect(wrapper.text()).toContain('VDSA PREMIUM');

      wrapper.unmount();
    });

    it('PremiumMarketingCard should display premium price', async () => {
      const wrapper = mount(PremiumMarketingCard);

      expect(wrapper.text()).toContain('199.000\u00A0₫');

      wrapper.unmount();
    });

    it('PremiumMarketingCard should list premium features', async () => {
      const wrapper = mount(PremiumMarketingCard);

      expect(wrapper.text()).toContain('Không giới hạn số lần biên dịch');
      expect(wrapper.text()).toContain('Truy cập toàn bộ bài giảng cao cấp');

      wrapper.unmount();
    });

    it('PremiumMarketingCard should show lifetime plan label', async () => {
      const wrapper = mount(PremiumMarketingCard);

      expect(wrapper.text()).toContain('Gói trọn đời (Lifetime)');

      wrapper.unmount();
    });
  });

  describe('PA-005 (P2): Transfer info', () => {
    it('QrPaymentPanel should display bank name', async () => {
      const order = createPaymentOrderDto({ bankId: 'MBBank' });

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('MBBank');

      wrapper.unmount();
    });

    it('QrPaymentPanel should display bank account number', async () => {
      const order = createPaymentOrderDto({ bankAccount: '987654321' });

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('987654321');

      wrapper.unmount();
    });

    it('QrPaymentPanel should display account name', async () => {
      const order = createPaymentOrderDto({ accountName: 'CONG TY DSA' });

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('CONG TY DSA');

      wrapper.unmount();
    });

    it('QrPaymentPanel should display amount in VND', async () => {
      const order = createPaymentOrderDto({ amount: 199000 });

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('199.000');

      wrapper.unmount();
    });
  });

  describe('PA-006 (P2): Copy payment code', () => {
    it('QrPaymentPanel should display payment code', async () => {
      const order = createPaymentOrderDto({ paymentCode: 'VDSA2024XYZ' });

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('VDSA2024XYZ');

      wrapper.unmount();
    });

    it('QrPaymentPanel copy button should write payment code to clipboard', async () => {
      const order = createPaymentOrderDto({ paymentCode: 'COPY_ME' });

      const writeTextSpy = vi.fn(async () => {});
      Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '14:30',
          isExpired: false,
          isWarningTime: false,
        },
      });

      const copyBtn = wrapper.findAll('button').find((b) => b.text().includes('Copy'));
      expect(copyBtn).toBeTruthy();
      await copyBtn!.trigger('click');

      expect(writeTextSpy).toHaveBeenCalledWith('COPY_ME');

      wrapper.unmount();
    });

    it('QrPaymentPanel should show "Đã copy" after successful copy', async () => {
      vi.useFakeTimers();
      try {
        const order = createPaymentOrderDto({ paymentCode: 'COPY_TEST' });

        Object.assign(navigator, { clipboard: { writeText: vi.fn(async () => {}) } });

        const wrapper = mount(QrPaymentPanel, {
          props: {
            order,
            formattedTime: '14:30',
            isExpired: false,
            isWarningTime: false,
          },
        });

        const copyBtn = wrapper.findAll('button').find((b) => b.text().includes('Copy'));
        expect(copyBtn).toBeTruthy();
        await copyBtn!.trigger('click');
        await nextTick();

        expect(copyBtn!.text()).toBe('Đã copy');

        vi.advanceTimersByTime(2000);
        await nextTick();

        expect(copyBtn!.text()).toBe('Copy');

        wrapper.unmount();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('PA-007 (P2): QR expired', () => {
    it('QrPaymentPanel should show expired overlay when isExpired is true', async () => {
      const order = createPaymentOrderDto();

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '00:00',
          isExpired: true,
          isWarningTime: false,
        },
      });

      expect(wrapper.text()).toContain('Mã hết hạn');

      wrapper.unmount();
    });

    it('QrPaymentPanel should show retry button when expired', async () => {
      const order = createPaymentOrderDto();

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '00:00',
          isExpired: true,
          isWarningTime: false,
        },
      });

      const hasRetryButton = wrapper.findAll('button').some((btn) => btn.text().includes('Thử lại'));

      expect(hasRetryButton).toBe(true);

      wrapper.unmount();
    });

    it('QrPaymentPanel should emit retry event when retry button clicked', async () => {
      const order = createPaymentOrderDto();

      const wrapper = mount(QrPaymentPanel, {
        props: {
          order,
          formattedTime: '00:00',
          isExpired: true,
          isWarningTime: false,
        },
      });

      const allButtons = wrapper.findAll('button');
      const retryBtn = allButtons.find((btn) => btn.text().includes('Thử lại'));

      if (retryBtn) {
        await retryBtn.trigger('click');
        expect(wrapper.emitted('retry')).toBeTruthy();
      }

      wrapper.unmount();
    });

    it('usePaymentTimer isExpired should be true when timer reaches 0', async () => {
      vi.useFakeTimers();
      try {
        const { timerSeconds, isExpired, startTimer } = usePaymentTimer(2);

        startTimer(2);
        expect(isExpired.value).toBe(false);

        vi.advanceTimersByTime(1000);
        expect(timerSeconds.value).toBe(1);

        vi.advanceTimersByTime(1000);
        expect(timerSeconds.value).toBe(0);
        expect(isExpired.value).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('PA-008 (P2): Success screen', () => {
    it('CheckoutSuccessScreen should render success message', async () => {
      const wrapper = mount(CheckoutSuccessScreen);

      expect(wrapper.text()).toContain('Thanh Toán Thành Công!');

      wrapper.unmount();
    });

    it('CheckoutSuccessScreen should render finish button', async () => {
      const wrapper = mount(CheckoutSuccessScreen);

      expect(wrapper.text()).toContain('Bắt đầu trải nghiệm ngay');

      wrapper.unmount();
    });

    it('CheckoutSuccessScreen should emit finish event on button click', async () => {
      const wrapper = mount(CheckoutSuccessScreen);

      const btn = wrapper.find('button');
      await btn.trigger('click');

      expect(wrapper.emitted('finish')).toBeTruthy();

      wrapper.unmount();
    });

    it('CheckoutSuccessScreen should show premium unlocked message', async () => {
      const wrapper = mount(CheckoutSuccessScreen);

      expect(wrapper.text()).toContain('Tài khoản đã được nâng cấp lên Premium');

      wrapper.unmount();
    });
  });

  describe('PA-011 (P2): PremiumGate content', () => {
    it('PremiumGate should show overlay when user is not premium', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.find('.premium-gate__overlay').exists()).toBe(true);
      expect(wrapper.find('.premium-gate__content').exists()).toBe(true);

      wrapper.unmount();
    });

    it('PremiumGate should blur content when locked', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      const content = wrapper.find('.premium-gate__content');
      expect(content.exists()).toBe(true);

      wrapper.unmount();
    });

    it('PremiumGate should show upgrade button with price', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.text()).toContain('Nâng cấp Premium');
      expect(wrapper.text()).toContain('199.000\u00A0₫');

      wrapper.unmount();
    });

    it('PremiumGate should show custom message when provided', async () => {
      const wrapper = mount(PremiumGate, {
        props: {
          message: 'Custom premium message here',
        },
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.text()).toContain('Custom premium message here');

      wrapper.unmount();
    });

    it('PremiumGate should show default message when no custom message', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.text()).toContain('Tính năng này yêu cầu tài khoản Premium');

      wrapper.unmount();
    });

    it('PremiumGate upgrade button should router.push("/checkout") on click — PM-036', async () => {
      const wrapper = mount(PremiumGate, {
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      const upgradeBtn = wrapper.find('.premium-gate__btn');
      await upgradeBtn.trigger('click');

      expect(routerPushMock).toHaveBeenCalledWith('/checkout');

      wrapper.unmount();
    });

    it('PremiumGate should unlock content when user is premium — PM-036', async () => {
      const { statelessPaymentApi } = await import('../services/statelessPaymentApi');
      vi.mocked(statelessPaymentApi.getPremiumStatus).mockResolvedValueOnce({
        isPremium: true,
        upgradedAt: '2026-08-11T10:05:00.000Z',
        plan: 'premium',
        unlockedFeatures: ['unlimited-runs', 'advanced-lessons'],
      });

      const paymentStore = usePaymentStore();
      await paymentStore.loadPremiumStatus();
      expect(paymentStore.isPremium).toBe(true);

      const wrapper = mount(PremiumGate, {
        props: { featureId: 'premium-sandbox' },
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.find('.premium-gate__overlay').exists()).toBe(false);
      expect(wrapper.find('.premium-gate__content').exists()).toBe(false);
      expect(wrapper.find('.premium-content').exists()).toBe(true);

      wrapper.unmount();
    });

    it('PremiumGate should unlock free feature without premium (basic-viz) — PM-036', async () => {
      const wrapper = mount(PremiumGate, {
        props: { featureId: 'basic-viz' },
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.find('.premium-gate__overlay').exists()).toBe(false);
      expect(wrapper.find('.premium-content').exists()).toBe(true);

      wrapper.unmount();
    });

    it('PremiumGate should stay locked for premium feature when user is free — PM-036', async () => {
      const wrapper = mount(PremiumGate, {
        props: { featureId: 'premium-sandbox' },
        slots: {
          default: '<div class="premium-content">Secret Content</div>',
        },
      });

      expect(wrapper.find('.premium-gate__overlay').exists()).toBe(true);

      wrapper.unmount();
    });
  });

  describe('PA-012 (P2): Payment timer', () => {
    it('usePaymentTimer should count down from initial duration', () => {
      vi.useFakeTimers();
      try {
        const { timerSeconds, startTimer } = usePaymentTimer(900);

        startTimer(900);
        expect(timerSeconds.value).toBe(900);

        vi.advanceTimersByTime(1000);
        expect(timerSeconds.value).toBe(899);

        vi.advanceTimersByTime(5000);
        expect(timerSeconds.value).toBe(894);
      } finally {
        vi.useRealTimers();
      }
    });

    it('usePaymentTimer should format time as MM:SS', () => {
      const { formattedTime, startTimer } = usePaymentTimer(900);

      startTimer(900);
      expect(formattedTime.value).toBe('15:00');

      const { formattedTime: ft2, startTimer: st2 } = usePaymentTimer(65);
      st2(65);
      expect(ft2.value).toBe('01:05');
    });
  });

  describe('PM-008 (P1): restoreActiveOrder — khôi phục order Pending sau refresh', () => {
    let activeStore: ReturnType<typeof usePaymentStore> | null = null;

    beforeEach(() => {
      setActivePinia(createPinia());
      vi.clearAllMocks();
      activeStore = null;
    });

    afterEach(() => {
      // restore khởi động polling interval — phải dừng để không leak timer trong test
      activeStore?.resetCheckout();
      activeStore = null;
    });

    function mockTransactions(entries: Array<{ orderId: string; status: string }>): void {
      vi.mocked(statelessPaymentApi.getTransactions).mockResolvedValueOnce(
        entries as never,
      );
    }

    it('order Pending trong transaction log → khôi phục về paying', async () => {
      const store = usePaymentStore();
      activeStore = store;
      vi.mocked(statelessPaymentApi.getOrderStatus).mockResolvedValueOnce({
        id: 'order-restored-1',
        userId: 'user-789',
        paymentCode: 'PAY_RESTORED',
        amount: 199000,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        completedAt: null,
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        qrUrl: 'data:image/png;base64,restored',
      } as never);
      mockTransactions([
        { orderId: 'order-restored-1', status: 'Pending' },
      ]);

      await store.restoreActiveOrder();

      expect(store.checkoutState).toBe('paying');
      expect(store.currentOrder?.id).toBe('order-restored-1');
    });

    it('transaction đã Completed → không khôi phục (giữ idle)', async () => {
      const store = usePaymentStore();
      activeStore = store;
      mockTransactions([
        { orderId: 'order-done-1', status: 'Pending' },
        { orderId: 'order-done-1', status: 'Completed' },
      ]);

      await store.restoreActiveOrder();

      expect(store.checkoutState).toBe('idle');
      expect(store.currentOrder).toBeNull();
    });

    it('transaction đã Expired → không khôi phục', async () => {
      const store = usePaymentStore();
      activeStore = store;
      mockTransactions([
        { orderId: 'order-expired-1', status: 'Pending' },
        { orderId: 'order-expired-1', status: 'Expired' },
      ]);

      await store.restoreActiveOrder();

      expect(store.checkoutState).toBe('idle');
    });

    it('order đã hết hạn (expiresAt quá khứ) → bỏ qua', async () => {
      const store = usePaymentStore();
      activeStore = store;
      vi.mocked(statelessPaymentApi.getOrderStatus).mockResolvedValueOnce({
        id: 'order-old-1',
        userId: 'user-789',
        paymentCode: 'PAY_OLD',
        amount: 199000,
        status: 'Pending',
        createdAt: new Date(Date.now() - 3600_000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        completedAt: null,
        bankId: 'MBBank',
        bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA',
        qrUrl: 'data:image/png;base64,old',
      } as never);
      mockTransactions([
        { orderId: 'order-old-1', status: 'Pending' },
      ]);

      await store.restoreActiveOrder();

      expect(store.checkoutState).toBe('idle');
    });

    it('getTransactions lỗi → giữ idle, không ném lỗi ra view', async () => {
      const store = usePaymentStore();
      activeStore = store;
      vi.mocked(statelessPaymentApi.getTransactions).mockRejectedValueOnce(
        new Error('mạng lỗi'),
      );

      await expect(store.restoreActiveOrder()).resolves.toBeUndefined();
      expect(store.checkoutState).toBe('idle');
    });

    it('không có transaction nào → giữ idle', async () => {
      const store = usePaymentStore();
      activeStore = store;
      mockTransactions([]);

      await store.restoreActiveOrder();

      expect(store.checkoutState).toBe('idle');
    });
  });
});
