// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../services/paymentApi', () => ({
  createOrder: vi.fn(async () => ({
    id: 'order-123',
    userId: 'user-456',
    paymentCode: 'PAY123',
    amount: 199000,
    status: 'Pending',
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
    status: 'Pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    bankId: 'MBBank',
    bankAccount: '123456789',
    accountName: 'VISUALIZATION DSA',
    qrUrl: 'data:image/png;base64,test',
  })),
}));

// PM-033: getConfig mock theo đúng contract backend — 6 premium features
// (StatelessPaymentStrategy.PremiumFeatures) + supportedMethods 3 phương thức.
vi.mock('../services/statelessPaymentApi', () => ({
  statelessPaymentApi: {
    getConfig: vi.fn(async () => ({
      premiumPrice: 199000,
      currency: 'VND',
      bankId: 'MBBank',
      bankAccount: '99999999999',
      accountName: 'DSA VISUALIZER ACADEMY',
      supportedMethods: ['vietqr', 'bank_transfer', 'momo'],
      premiumFeatures: [
        { id: 'unlimited-runs', name: 'Biên dịch không giới hạn', description: 'Chạy thuật toán tùy chọn bao nhiêu lần tùy ý', icon: '⚡', requiresPremium: true },
        { id: 'advanced-lessons', name: 'Bài giảng cao cấp', description: 'Truy cập SOLID, Design Patterns, System Design chuyên sâu', icon: '📚', requiresPremium: true },
        { id: 'premium-sandbox', name: 'Sandbox đặc biệt', description: 'Mở khóa sân chơi Premium với dữ liệu lớn', icon: '🎮', requiresPremium: true },
        { id: 'leaderboard-badge', name: 'Huy hiệu Premium', description: 'Hiển thị huy hiệu vàng trên bảng xếp hạng', icon: '👑', requiresPremium: true },
        { id: 'basic-viz', name: 'Trực quan hóa cơ bản', description: 'Sorting, BFS, DFS với dữ liệu mẫu', icon: '📊', requiresPremium: false },
        { id: 'quiz-basic', name: 'Quiz cơ bản', description: 'Trắc nghiệm 6 chủ đề miễn phí', icon: '❓', requiresPremium: false },
      ],
    })),
    checkout: vi.fn(async () => ({
      id: 'order-stateless-123',
      userId: 'user-789',
      paymentCode: 'PAY_STATELSS',
      amount: 199000,
      status: 'Pending',
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
      status: 'Pending',
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

// PM-037: Auth mock reactive (reactive + getter isAuthenticated) — mutation qua
// currentUser.isPremium phải trigger computed isPremium của payment store.
// markPremium: đồng bộ contract mới của useAuthStore (PM-021).
vi.mock('../../auth/store/useAuthStore', () => {
  const { reactive } = require('vue');
  const authState = reactive({
    accessToken: 'mock-token-123' as string | null,
    currentUser: {
      id: 'user-123', username: 'testuser', isPremium: false,
    } as { id: string; username: string; isPremium: boolean } | null,
    isStatelessMode: true,
    get isAuthenticated(): boolean {
      return this.accessToken !== null && this.currentUser !== null;
    },
    getAccessToken: vi.fn(() => authState.accessToken),
    markPremium: vi.fn(() => {
      if (authState.currentUser) {
        authState.currentUser.isPremium = true;
      }
    }),
  });
  return {
    useAuthStore: vi.fn(() => authState),
  };
});

import { usePaymentStore } from '../store/usePaymentStore';
import { useAuthStore } from '../../auth/store/useAuthStore';

function resetAuthMock(): void {
  const auth = useAuthStore();
  auth.accessToken = 'mock-token-123';
  auth.currentUser = { id: 'user-123', email: 'user@test.com', username: 'testuser', totalXP: 0, currentLevel: 1, streakDays: 0, createdAt: '2026-01-01T00:00:00Z', badges: [], isPremium: false };
  auth.isStatelessMode = true;
}

describe('Payment — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    resetAuthMock();
  });

  describe('PA-001 (P0): Xem marketing card', () => {
    it('usePaymentStore should initialize with default state', () => {
      const store = usePaymentStore();
      expect(store.isLoading).toBe(false);
      expect(store.paymentError).toBe(null);
      expect(store.checkoutState).toBe('idle');
    });

    it('premiumPrice should return default 199000 when config not loaded', () => {
      const store = usePaymentStore();
      expect(store.premiumPrice).toBe(199000);
    });

    it('isPremium should be false when user is not premium', () => {
      const store = usePaymentStore();
      expect(store.isPremium).toBe(false);
    });
  });

  describe('PA-003 (P0): Bắt đầu thanh toán', () => {
    it('startCheckout should set checkoutState to paying', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      expect(store.checkoutState).toBe('paying');
      expect(store.currentOrder).not.toBeNull();
      expect(store.isLoading).toBe(false);
    });

    it('startCheckout should create order with correct payment method', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      expect(store.currentOrder).not.toBeNull();
      expect(store.checkoutState).toBe('paying');
    });

    it('startCheckout should succeed in stateless mode', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      expect(store.currentOrder).not.toBeNull();
      expect(store.currentOrder!.qrUrl).toContain('data:image/png;base64,');
      expect(store.checkoutState).toBe('paying');
    });
  });

  describe('PA-004 (P0): Xem QR', () => {
    it('currentOrder should contain qrUrl for QR display', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      expect(store.currentOrder).not.toBeNull();
      expect(store.currentOrder!.qrUrl).toContain('data:image/png;base64,');
    });

    it('currentOrder should contain payment info', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      expect(store.currentOrder).not.toBeNull();
      expect(store.currentOrder!.paymentCode).toBeDefined();
      expect(store.currentOrder!.amount).toBe(199000);
    });

    it('currentOrder qrUrl should be a valid data URL', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      expect(store.currentOrder!.qrUrl).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('PA-010 (P1): PremiumGate lock', () => {
    it('isPremium should be false when user has not upgraded', () => {
      const store = usePaymentStore();
      expect(store.isPremium).toBe(false);
    });

    it('isPremium should be false after store initialization', () => {
      const store = usePaymentStore();
      expect(store.isPremium).toBe(false);
    });
  });

  describe('PA-013 (P2): Config mapping — PM-033', () => {
    it('loadConfig should map premiumPrice, bank info and supportedMethods', async () => {
      const store = usePaymentStore();
      await store.loadConfig();

      expect(store.paymentConfig).not.toBeNull();
      expect(store.paymentConfig?.premiumPrice).toBe(199000);
      expect(store.paymentConfig?.currency).toBe('VND');
      expect(store.paymentConfig?.bankId).toBe('MBBank');
      expect(store.paymentConfig?.bankAccount).toBe('99999999999');
      expect(store.paymentConfig?.accountName).toBe('DSA VISUALIZER ACADEMY');
      expect(store.paymentConfig?.supportedMethods).toEqual(['vietqr', 'bank_transfer', 'momo']);
      expect(store.premiumPrice).toBe(199000);
    });

    it('loadConfig should map all 6 premium features from backend contract', async () => {
      const store = usePaymentStore();
      await store.loadConfig();

      const features = store.paymentConfig?.premiumFeatures ?? [];
      expect(features).toHaveLength(6);
      expect(features.map((f) => f.id)).toEqual([
        'unlimited-runs', 'advanced-lessons', 'premium-sandbox', 'leaderboard-badge', 'basic-viz', 'quiz-basic',
      ]);

      for (const feature of features) {
        expect(typeof feature.name).toBe('string');
        expect(typeof feature.description).toBe('string');
        expect(typeof feature.icon).toBe('string');
        expect(typeof feature.requiresPremium).toBe('boolean');
      }

      const premiumOnly = features.filter((f) => f.requiresPremium);
      expect(premiumOnly).toHaveLength(4);

      const free = features.filter((f) => !f.requiresPremium);
      expect(free.map((f) => f.id)).toEqual(['basic-viz', 'quiz-basic']);
    });
  });

  describe('PA-014 (P1): Polling status — PM-051', () => {
    it('startCheckout in non-stateless mode should start polling (getOrderStatus called)', async () => {
      vi.useFakeTimers();
      try {
        const authStore = useAuthStore();
        authStore.isStatelessMode = false;

        const { getOrderStatus } = await import('../services/paymentApi');
        const getOrderStatusMock = vi.mocked(getOrderStatus);
        getOrderStatusMock.mockResolvedValueOnce({
          id: 'order-123', userId: 'user-456', paymentCode: 'PAY123',
          amount: 199000, status: 'Completed', createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(), bankId: 'MBBank', bankAccount: '123456789',
          accountName: 'VISUALIZATION DSA', qrUrl: 'data:image/png;base64,test',
        });

        const store = usePaymentStore();
        await store.startCheckout('vietqr');

        expect(store.checkoutState).toBe('paying');
        expect(store.currentOrder?.id).toBe('order-123');

        await vi.advanceTimersByTimeAsync(5000);

        expect(getOrderStatusMock).toHaveBeenCalledWith('order-123', 'mock-token-123');
        expect(store.checkoutState).toBe('success');

        store.resetCheckout();
      } finally {
        vi.useRealTimers();
      }
    });

    // PM-052: polling stateless — getOrderStatus 'Completed' → success + premium
    it('stateless polling should reach success when getOrderStatus returns Completed', async () => {
      vi.useFakeTimers();
      try {
        const { statelessPaymentApi } = await import('../services/statelessPaymentApi');
        const getOrderStatusMock = vi.mocked(statelessPaymentApi.getOrderStatus);
        getOrderStatusMock.mockResolvedValueOnce({
          id: 'order-stateless-123', userId: 'user-789', paymentCode: 'PAY_STATELSS',
          amount: 199000, status: 'Completed', createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(), bankId: 'MBBank', bankAccount: '123456789',
          accountName: 'VISUALIZATION DSA', qrUrl: 'data:image/png;base64,stateless-test',
        });

        const store = usePaymentStore();
        await store.startCheckout('vietqr');
        expect(store.checkoutState).toBe('paying');

        await vi.advanceTimersByTimeAsync(5000);

        expect(getOrderStatusMock).toHaveBeenCalledWith('order-stateless-123');
        expect(store.checkoutState).toBe('success');
        expect(store.isPremium).toBe(true);

        store.resetCheckout();
      } finally {
        vi.useRealTimers();
      }
    });

    // PM-050/PM-025: polling fail liên tiếp 3 lần → dừng polling + error state
    it('polling should stop and set error after 3 consecutive failures', async () => {
      vi.useFakeTimers();
      try {
        const { statelessPaymentApi } = await import('../services/statelessPaymentApi');
        const getOrderStatusMock = vi.mocked(statelessPaymentApi.getOrderStatus);
        getOrderStatusMock.mockRejectedValue(new Error('Mất kết nối mạng'));

        const store = usePaymentStore();
        await store.startCheckout('vietqr');
        expect(store.checkoutState).toBe('paying');

        await vi.advanceTimersByTimeAsync(15_000);

        expect(getOrderStatusMock).toHaveBeenCalledTimes(3);
        expect(store.checkoutState).toBe('error');
        expect(store.paymentError).toContain('Không thể kiểm tra trạng thái');

        // Polling đã dừng — tick tiếp theo không còn request /status nữa.
        const callsAfterError = getOrderStatusMock.mock.calls.length;
        await vi.advanceTimersByTimeAsync(5_000);
        expect(getOrderStatusMock.mock.calls.length).toBe(callsAfterError);

        store.resetCheckout();
      } finally {
        vi.useRealTimers();
      }
    });

    it('resetCheckout should clear all payment state', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      store.resetCheckout();

      expect(store.currentOrder).toBeNull();
      expect(store.checkoutState).toBe('idle');
      expect(store.paymentError).toBe(null);
    });

    it('checkoutState should be idle after resetCheckout', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');
      expect(store.checkoutState).toBe('paying');

      store.resetCheckout();
      expect(store.checkoutState).toBe('idle');
    });
  });

  describe('PA-015 (P2): Premium upgrade flow — PM-037', () => {
    it('isPremium should flip false → true after successful stateless verify', async () => {
      const { statelessPaymentApi } = await import('../services/statelessPaymentApi');
      vi.mocked(statelessPaymentApi.getOrderStatus).mockResolvedValueOnce({
        id: 'order-stateless-123', userId: 'user-789', paymentCode: 'PAY_STATELSS',
        amount: 199000, status: 'Completed', createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(), bankId: 'MBBank', bankAccount: '123456789',
        accountName: 'VISUALIZATION DSA', qrUrl: 'data:image/png;base64,stateless-test',
      });

      const store = usePaymentStore();
      expect(store.isPremium).toBe(false);

      await store.startCheckout('vietqr');
      await store.verifyPayment();

      expect(store.checkoutState).toBe('success');
      expect(useAuthStore().currentUser?.isPremium).toBe(true);
      expect(store.isPremium).toBe(true);

      store.resetCheckout();
    });

    it('isPremium should flip true after simulatePaymentSuccess', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      await store.simulatePaymentSuccess();

      expect(store.checkoutState).toBe('success');
      expect(store.isPremium).toBe(true);

      store.resetCheckout();
    });
  });
});
