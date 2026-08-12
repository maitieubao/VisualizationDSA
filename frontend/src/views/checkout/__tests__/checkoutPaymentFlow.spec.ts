// @vitest-environment jsdom
// PM-012: luồng THẬT của PremiumCheckoutView — KHÔNG mock payment store,
// chỉ mock API + stub component con; drive qua sự kiện người dùng:
// idle --click "Bắt đầu"--> paying --click "Mô phỏng"--> success.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ query: {} }),
}));

// ─── Auth API mocks (store auth THẬT) ─────────────────────────────────────────

vi.mock('../../../features/auth/services/authApi', () => ({
  login: vi.fn(async () => ({
    accessToken: 'fake-token', refreshToken: 'fake-refresh', expiresIn: 3600,
    user: {
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 0, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
    },
  })),
  logout: vi.fn(async () => undefined),
  register: vi.fn(async () => ({
    accessToken: 'fake-token', refreshToken: 'fake-refresh', expiresIn: 3600,
    user: {
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 0, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
    },
  })),
  refreshAccessToken: vi.fn(async () => ({
    accessToken: 'new-token', refreshToken: 'new-refresh', expiresIn: 3600,
    user: {
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 0, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
    },
  })),
  getMe: vi.fn(async () => ({
    id: '1', email: 'test@dsa.com', username: 'test',
    totalXP: 0, currentLevel: 1, streakDays: 0,
    createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
  })),
  changePassword: vi.fn(async () => true),
  updateProfile: vi.fn(async () => true),
  getAccessToken: vi.fn(() => 'fake'),
}));

vi.mock('../../../features/auth/services/statelessAuthApi', () => ({
  statelessAuthApi: {
    login: vi.fn(async () => ({
      accessToken: 'fake-token', refreshToken: 'fake-refresh', expiresIn: 3600,
      user: {
        id: '1', email: 'test@dsa.com', username: 'test',
        totalXP: 0, currentLevel: 1, streakDays: 0,
        createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
      },
    })),
    register: vi.fn(async () => ({
      accessToken: 'fake-token', refreshToken: 'fake-refresh', expiresIn: 3600,
      user: {
        id: '1', email: 'test@dsa.com', username: 'test',
        totalXP: 0, currentLevel: 1, streakDays: 0,
        createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
      },
    })),
    refresh: vi.fn(async () => ({
      accessToken: 'new-token', refreshToken: 'new-refresh', expiresIn: 3600,
      user: {
        id: '1', email: 'test@dsa.com', username: 'test',
        totalXP: 0, currentLevel: 1, streakDays: 0,
        createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
      },
    })),
    logout: vi.fn(async () => undefined),
    getMe: vi.fn(async () => ({
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 0, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
    })),
    updateProfile: vi.fn(async () => ({
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 0, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', badges: [], isPremium: false,
      role: 'Student', nickname: 'Nick', bio: 'Hi', university: 'FPT',
    })),
    impersonateUser: vi.fn(async () => ({
      accessToken: 'imp-token', refreshToken: 'imp-refresh', expiresIn: 3600,
      user: {
        id: 'student-456', email: 'student@dsa.com', username: 'student_user',
        totalXP: 200, currentLevel: 3, streakDays: 1,
        createdAt: '2024-02-02', badges: [], isPremium: false,
        role: 'Student', nickname: 'StudentNick', bio: 'Hi', university: 'FPT',
      },
    })),
    changePassword: vi.fn(async () => ({ message: 'Password changed successfully' })),
  },
}));

// ─── Payment API mocks (store payment THẬT) ───────────────────────────────────

vi.mock('../../../features/payment/services/paymentApi', () => ({
  createOrder: vi.fn(async () => ({
    id: 'order-123', userId: '1', paymentCode: 'PAY123',
    amount: 199000, status: 'Pending', createdAt: '2026-08-11T10:00:00.000Z',
    completedAt: null, bankId: 'NCB', bankAccount: '1234567890',
    accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
  })),
  getOrderStatus: vi.fn(async () => ({
    id: 'order-123', userId: '1', paymentCode: 'PAY123',
    amount: 199000, status: 'Pending', createdAt: '2026-08-11T10:00:00.000Z',
    completedAt: null, bankId: 'NCB', bankAccount: '1234567890',
    accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
  })),
}));

vi.mock('../../../features/payment/services/statelessPaymentApi', () => ({
  statelessPaymentApi: {
    getConfig: vi.fn(async () => ({
      premiumPrice: 199000, currency: 'VND', bankId: 'MBBank',
      bankAccount: '123456789', accountName: 'VISUALIZATION DSA',
      supportedMethods: ['vietqr', 'bank_transfer', 'momo'],
      premiumFeatures: [],
    })),
    checkout: vi.fn(async () => ({
      id: 'order-123', userId: '1', paymentCode: 'PAY123',
      amount: 199000, status: 'Pending', createdAt: '2026-08-11T10:00:00.000Z',
      completedAt: null, bankId: 'NCB', bankAccount: '1234567890',
      accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
    })),
    verify: vi.fn(async () => ({
      id: 'order-123', userId: '1', paymentCode: 'PAY123',
      amount: 199000, status: 'Completed', createdAt: '2026-08-11T10:00:00.000Z',
      completedAt: '2026-08-11T10:05:00.000Z', bankId: 'NCB', bankAccount: '1234567890',
      accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
    })),
    getOrderStatus: vi.fn(async () => ({
      id: 'order-123', userId: '1', paymentCode: 'PAY123',
      amount: 199000, status: 'Pending', createdAt: '2026-08-11T10:00:00.000Z',
      completedAt: null, bankId: 'NCB', bankAccount: '1234567890',
      accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
    })),
    simulateWebhook: vi.fn(async () => ({
      id: 'order-123', userId: '1', paymentCode: 'PAY123',
      amount: 199000, status: 'Completed', createdAt: '2026-08-11T10:00:00.000Z',
      completedAt: '2026-08-11T10:05:00.000Z', bankId: 'NCB', bankAccount: '1234567890',
      accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
    })),
    getPremiumStatus: vi.fn(async () => ({
      isPremium: false, upgradedAt: null, plan: 'free', unlockedFeatures: [],
    })),
    checkFeatureAccess: vi.fn(async () => ({ hasAccess: false })),
    getTransactions: vi.fn(async () => []),
  },
}));

// ─── Component stubs ──────────────────────────────────────────────────────────

vi.mock('../../../shared/components/BaseIcon.vue', () => ({
  default: { template: '<span class="base-icon" :name="$attrs.name" />', name: 'BaseIcon' },
}));

vi.mock('../../../features/payment/components/PremiumMarketingCard.vue', () => ({
  default: { template: '<div class="marketing-card">Premium</div>' },
}));

vi.mock('../../../features/payment/components/QrPaymentPanel.vue', () => ({
  default: { template: '<div class="qr-panel">QR Payment</div>' },
}));

vi.mock('../../../features/payment/components/CheckoutIdleScreen.vue', () => ({
  default: {
    template: '<div class="idle-screen"><button id="start-checkout" @click="$emit(\'start\')">Bắt đầu Thanh toán</button></div>',
    props: ['isLoading', 'error'],
    emits: ['start'],
  },
}));

vi.mock('../../../features/payment/components/CheckoutSuccessScreen.vue', () => ({
  default: {
    template: '<div class="success-screen">Thanh toán thành công!</div>',
    emits: ['finish'],
  },
}));

// ─── Imports sau mocks ────────────────────────────────────────────────────────

import PremiumCheckoutView from '../PremiumCheckoutView.vue';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import { usePaymentStore } from '../../../features/payment/store/usePaymentStore';

describe('PremiumCheckoutView — luồng thật (PM-012)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('idle → paying: bấm "Bắt đầu" tạo order qua store thật', async () => {
    const authStore = useAuthStore();
    await authStore.statelessLogin('test@dsa.com', 'password123');
    expect(authStore.isAuthenticated).toBe(true);

    const wrapper = mount(PremiumCheckoutView, {
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    expect(wrapper.find('.idle-screen').exists()).toBe(true);

    await wrapper.find('#start-checkout').trigger('click');
    await flushPromises();

    const paymentStore = usePaymentStore();
    expect(paymentStore.checkoutState).toBe('paying');
    expect(paymentStore.currentOrder).not.toBeNull();
    expect(paymentStore.currentOrder?.paymentCode).toBe('PAY123');
    expect(wrapper.find('.qr-panel').exists()).toBe(true);

    wrapper.unmount();
  });

  it('paying → success: click "Mô phỏng" cấp premium qua store thật', async () => {
    const authStore = useAuthStore();
    await authStore.statelessLogin('test@dsa.com', 'password123');

    const wrapper = mount(PremiumCheckoutView, {
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    await wrapper.find('#start-checkout').trigger('click');
    await flushPromises();
    expect(wrapper.find('.qr-panel').exists()).toBe(true);

    const simBtn = wrapper.findAll('button').find((b) => b.text().includes('Mô phỏng'));
    expect(simBtn).toBeTruthy();
    await simBtn!.trigger('click');
    await flushPromises();

    const paymentStore = usePaymentStore();
    expect(paymentStore.checkoutState).toBe('success');
    expect(authStore.currentUser?.isPremium).toBe(true);
    expect(authStore.isPremium).toBe(true);
    // PM-026: user vừa thành premium → view chuyển sang nhánh "Bạn đã là Premium"
    expect(wrapper.find('.qr-panel').exists()).toBe(false);
    expect(wrapper.text()).toContain('Bạn đã là Premium');

    wrapper.unmount();
  });
});
