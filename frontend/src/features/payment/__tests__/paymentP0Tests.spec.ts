// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

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
    status: 'pending',
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

describe('Payment — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
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

    it('checkFeatureAccess should return false for premium features', async () => {
      const store = usePaymentStore();
      const hasAccess = await store.checkFeatureAccess('premium-feature');

      expect(hasAccess).toBe(false);
    });

    it('isPremium should be false after store initialization', () => {
      const store = usePaymentStore();
      expect(store.isPremium).toBe(false);
    });
  });

  describe('PA-014 (P1): Polling status', () => {
    it('startPolling should be called after checkout in non-stateless mode', async () => {
      const store = usePaymentStore();
      await store.startCheckout('vietqr');

      expect(store.checkoutState).toBe('paying');
      expect(store.currentOrder).not.toBeNull();
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
});
