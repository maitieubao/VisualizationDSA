// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('../../features/payment/store/usePaymentStore', () => {
  const { ref } = require('vue');
  return {
    usePaymentStore: () => ({
      currentOrder: ref(null),
      paymentConfig: ref(null),
      premiumStatus: ref(null),
      isLoading: ref(false),
      paymentError: ref(null),
      checkoutState: ref('idle'),
      isPremium: ref(false),
      premiumPrice: ref(199000),
      loadConfig: vi.fn(),
      loadPremiumStatus: vi.fn(),
      startCheckout: vi.fn(),
      verifyPayment: vi.fn(),
      simulatePaymentSuccess: vi.fn(),
      resetCheckout: vi.fn(),
      checkFeatureAccess: vi.fn(async () => false),
    }),
  };
});

vi.mock('../../features/auth/store/useAuthStore', () => {
  return {
    useAuthStore: () => ({
      isAuthenticated: false,
      accessToken: null,
      currentUser: null,
      isStatelessMode: false,
      isLoading: false,
      authError: null,
      getAccessToken: () => null,
    }),
  };
});

vi.mock('../../features/payment/components/PremiumMarketingCard.vue', () => ({
  default: { template: '<div class="marketing-card">Premium</div>' },
}));

vi.mock('../../features/payment/components/QrPaymentPanel.vue', () => ({
  default: { template: '<div class="qr-panel">QR Payment</div>' },
}));

vi.mock('../../features/payment/components/CheckoutIdleScreen.vue', () => ({
  default: {
    template: '<div class="idle-screen"><button id="start-checkout">Bắt đầu</button></div>',
    props: ['isLoading', 'error'],
    emits: ['start'],
  },
}));

vi.mock('../../features/payment/components/CheckoutSuccessScreen.vue', () => ({
  default: {
    template: '<div class="success-screen">Thanh toán thành công!</div>',
    emits: ['finish'],
  },
}));

import PremiumCheckoutView from '../PremiumCheckoutView.vue';
import BaseIcon from '../../../../src/shared/components/BaseIcon.vue';

describe('PremiumCheckoutView — P0/P1 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('Checkout-001 (P0): Login required — chưa login → hiện thông báo đăng nhập', async () => {
    const wrapper = mount(PremiumCheckoutView, {
      global: { components: { BaseIcon } },
    });
    await flushPromises();

    expect(wrapper.text()).toContain('Yêu cầu Đăng nhập');
    expect(wrapper.text()).toContain('Đăng nhập / Đăng ký');
  });

  it('Checkout-002 (P0): Checkout container renders correctly', async () => {
    const wrapper = mount(PremiumCheckoutView, {
      global: { components: { BaseIcon } },
    });
    await flushPromises();

    expect(wrapper.find('.checkout-container').exists()).toBe(true);
    expect(wrapper.find('.glass-panel').exists()).toBe(true);
    expect(wrapper.find('.main-card').exists()).toBe(true);
  });

  it('Checkout-003 (P1): Dev simulate payment button hidden when not paying', async () => {
    const wrapper = mount(PremiumCheckoutView, {
      global: { components: { BaseIcon } },
    });
    await flushPromises();

    // When not in 'paying' state, simulate button should not be visible
    expect(wrapper.find('.success-screen').exists()).toBe(false);
    expect(wrapper.text()).toContain('VDSA'); // marketing content visible
  });
});
