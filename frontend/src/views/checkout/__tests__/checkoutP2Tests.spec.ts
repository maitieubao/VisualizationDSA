// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';

// ─── Global localStorage mock ───────────────────────────────────────────────────

class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
}

const localStorageMock = new LocalStorageMock();
global.localStorage = localStorageMock as unknown as Storage;

// ─── Auth API mocks ─────────────────────────────────────────────────────────────

vi.mock('../../../features/auth/services/authApi', () => ({
  login: vi.fn(async () => ({
    accessToken: 'fake-token',
    refreshToken: 'fake-refresh',
    expiresIn: 3600,
    user: {
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 0, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
    },
  })),
  logout: vi.fn(async () => undefined),
  register: vi.fn(async () => ({
    accessToken: 'fake-token',
    refreshToken: 'fake-refresh',
    expiresIn: 3600,
    user: {
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 0, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
    },
  })),
  refreshAccessToken: vi.fn(async () => ({
    accessToken: 'new-fake-token',
    refreshToken: 'new-fake-refresh',
    expiresIn: 3600,
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
      accessToken: 'fake-token',
      refreshToken: 'fake-refresh',
      expiresIn: 3600,
      user: {
        id: '1', email: 'test@dsa.com', username: 'test',
        totalXP: 100, currentLevel: 2, streakDays: 5,
        createdAt: '2024-01-01', badges: [], isPremium: false,
        role: 'Student', nickname: 'TestNick', bio: 'Hello', university: 'FPT',
      },
    })),
    register: vi.fn(async () => ({
      accessToken: 'fake-token',
      refreshToken: 'fake-refresh',
      expiresIn: 3600,
      user: {
        id: '1', email: 'test@dsa.com', username: 'test',
        totalXP: 0, currentLevel: 1, streakDays: 0,
        createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
      },
    })),
    refresh: vi.fn(async () => ({
      accessToken: 'new-fake-token',
      refreshToken: 'new-fake-refresh',
      expiresIn: 3600,
      user: {
        id: '1', email: 'test@dsa.com', username: 'test',
        totalXP: 100, currentLevel: 2, streakDays: 5,
        createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
      },
    })),
    logout: vi.fn(async () => undefined),
    getMe: vi.fn(async () => ({
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 100, currentLevel: 2, streakDays: 5,
      createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student',
    })),
    updateProfile: vi.fn(async () => ({
      id: '1', email: 'test@dsa.com', username: 'test',
      totalXP: 100, currentLevel: 2, streakDays: 5,
      createdAt: '2024-01-01', badges: [], isPremium: false,
      role: 'Student', nickname: 'TestNick', bio: 'Hello', university: 'FPT',
    })),
    impersonateUser: vi.fn(async () => ({
      accessToken: 'impersonated-token',
      refreshToken: 'impersonated-refresh',
      expiresIn: 3600,
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

// ─── Payment API mocks ──────────────────────────────────────────────────────────

vi.mock('../../../features/payment/services/paymentApi', () => ({
  createOrder: vi.fn(async () => ({
    id: 'order-123', userId: '1', paymentCode: 'PAY123',
    amount: 199000, status: 'pending', createdAt: '2024-01-01',
    completedAt: null, bankId: 'NCB', bankAccount: '1234567890',
    accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
  })),
  getOrderStatus: vi.fn(async () => ({
    id: 'order-123', userId: '1', paymentCode: 'PAY123',
    amount: 199000, status: 'paid', createdAt: '2024-01-01',
    completedAt: '2024-01-01', bankId: 'NCB', bankAccount: '1234567890',
    accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
  })),
}));

vi.mock('../../../features/payment/services/statelessPaymentApi', () => ({
  statelessPaymentApi: {
    checkout: vi.fn(async () => ({
      id: 'order-123', userId: '1', paymentCode: 'PAY123',
      amount: 199000, status: 'pending', createdAt: '2024-01-01',
      completedAt: null, bankId: 'NCB', bankAccount: '1234567890',
      accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
    })),
    verify: vi.fn(async () => ({
      id: 'order-123', userId: '1', paymentCode: 'PAY123',
      amount: 199000, status: 'Completed', createdAt: '2024-01-01',
      completedAt: '2024-01-01', bankId: 'NCB', bankAccount: '1234567890',
      accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
    })),
    simulateWebhook: vi.fn(async () => ({
      id: 'order-123', userId: '1', paymentCode: 'PAY123',
      amount: 199000, status: 'Completed', createdAt: '2024-01-01',
      completedAt: '2024-01-01', bankId: 'NCB', bankAccount: '1234567890',
      accountName: 'TEST', qrUrl: 'data:image/png;base64,test',
    })),
    getConfig: vi.fn(async () => ({ premiumPrice: 199000, currency: 'VND' })),
    getPremiumStatus: vi.fn(async () => ({ isPremium: false })),
    checkFeatureAccess: vi.fn(async () => ({ hasAccess: false })),
  },
}));

// ─── Payment store mock (PremiumCheckoutView depends on it) ─────────────────────

vi.mock('../../../features/payment/store/usePaymentStore', () => {
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

// ─── Component stubs ────────────────────────────────────────────────────────────

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
    template: '<div class="idle-screen"><button id="start-checkout">Bắt đầu</button></div>',
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

vi.mock('../../../features/e-lecture/components/NotificationBell.vue', () => ({
  default: { template: '<div class="notification-bell" />' },
}));



// ─── Real imports after mocks ───────────────────────────────────────────────────

import PremiumCheckoutView from '../PremiumCheckoutView.vue';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import LoginModal from '../../../features/auth/components/LoginModal.vue';
import AppHeader from '../../../components/AppHeader.vue';
import VisualizationPlayer from '../../../features/animation-engine/components/VisualizationPlayer.vue';
import VisualizationCanvas from '../../../features/animation-engine/components/VisualizationCanvas.vue';
import ExplanationPanel from '../../../features/animation-engine/components/ExplanationPanel.vue';
import { useHtmlPlaygroundStore } from '../../../features/html-playground/store/useHtmlPlaygroundStore';
import { PlaygroundUrlCodec } from '../../../features/html-playground/engine/PlaygroundUrlCodec';
import { PlaygroundDocumentBuilder } from '../../../features/html-playground/engine/PlaygroundDocumentBuilder';

// ═══════════════════════════════════════════════════════════════════════════════════
// SUITE 1 — CHECKOUT P2
// ═══════════════════════════════════════════════════════════════════════════════════

describe('Checkout P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('Checkout-001 (P2): Login required — chưa login → hiện thông báo', async () => {
    const wrapper = mount(PremiumCheckoutView, {
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    expect(wrapper.text()).toContain('Yêu cầu Đăng nhập');
    expect(wrapper.text()).toContain('Đăng nhập / Đăng ký');
  });

  it('Checkout-002 (P2: P3): Checkout container renders correctly', async () => {
    const wrapper = mount(PremiumCheckoutView, {
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    expect(wrapper.find('.checkout-container').exists()).toBe(true);
    expect(wrapper.find('.glass-panel').exists()).toBe(true);
    expect(wrapper.find('.main-card').exists()).toBe(true);
  });

  it('Checkout-003 (P2): Simulate hidden — dev simulate button not visible in idle', async () => {
    const wrapper = mount(PremiumCheckoutView, {
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    expect(wrapper.find('.success-screen').exists()).toBe(false);
    expect(wrapper.text()).toContain('VisualizationDSA');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
// SUITE 2 — ANIMATION P2
// ═══════════════════════════════════════════════════════════════════════════════════

describe('Animation P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('Anim-001 (P2): VisualizationPlayer composition renders', async () => {
    const wrapper = mount(VisualizationPlayer, {
      global: {
        stubs: {
          BaseIcon: { template: '<span />' },
          VisualizationCanvas: { template: '<div class="viz-canvas" />' },
          ExplanationPanel: { template: '<div class="explanation" />' },
          AnimControlPanel: { template: '<div class="controls" />' },
          MultilingualCodePanel: { template: '<div class="code-panel" />' },
          CustomInputForm: { template: '<div class="input-form" />' },
        },
      },
    });
    await flushPromises();

    expect(wrapper.find('.viz-canvas').exists()).toBe(true);
    expect(wrapper.find('.explanation').exists()).toBe(true);
    expect(wrapper.find('.controls').exists()).toBe(true);
    expect(wrapper.find('.code-panel').exists()).toBe(true);
    expect(wrapper.find('.input-form').exists()).toBe(true);
  });

  it('Anim-002 (P2): AnimationCanvas canvas mount', async () => {
    const wrapper = mount(VisualizationCanvas, {
      props: {
        isLoading: false,
        showQuizSummary: false,
        sessionCorrect: 0,
        sessionTotal: 0,
        showLectureBtn: false,
      },
      global: {
        stubs: {
          CanvasLayer: { template: '<div class="canvas-layer"><canvas /></div>' },
          LectureOverlay: { template: '<div />' },
          QuizCardOverlay: { template: '<div />' },
          QuizSummaryCard: { template: '<div />' },
        },
      },
    });
    await flushPromises();

    expect(wrapper.find('.canvas-layer').exists()).toBe(true);
    expect(wrapper.find('canvas').exists()).toBe(true);
  });

  it('Anim-003 (P2): ExplanationPanel empty state', async () => {
    const wrapper = mount(ExplanationPanel, {
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    expect(wrapper.text()).toContain('Chưa có dữ liệu hoạt ảnh');
    expect(wrapper.find('.explanation-panel__empty').exists()).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
// SUITE 3 — AUTH DETAIL P2
// ═══════════════════════════════════════════════════════════════════════════════════

describe('Auth Detail P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('AU-001 (P2): LoginModal opens from AppHeader', async () => {
    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          BaseIcon: { template: '<span />' },
          NotificationBell: { template: '<div />' },
          LoginModal: {
            template: '<div class="login-modal">Login</div>',
            props: ['visible'],
            emits: ['close'],
          },
          RouterLink: { template: '<a><slot /></a>' },
          RouterView: { template: '<div />' },
        },
        mocks: {
          $router: { push: vi.fn() },
        },
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain('Đăng nhập');
  });

  it('AU-002 (P2): Login success — token saved after login', async () => {
    const store = useAuthStore();
    expect(store.getAccessToken()).toBeNull();

    await store.statelessLogin('test@dsa.com', 'password123');

    expect(store.getAccessToken()).toBe('fake-token');
    expect(store.isAuthenticated).toBe(true);
    expect(store.currentUser).not.toBeNull();
    expect(store.currentUser?.username).toBe('test');
  });

  it('AU-003 (P2): Register toggle — switches to register mode', async () => {
    mount(LoginModal, {
      props: { visible: true },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    const bodyText = document.body.textContent || '';
    expect(bodyText).toContain('Đăng nhập');
  });

  it('AU-004 (P2): Error message — authError renders', async () => {
    setActivePinia(createPinia());
    const store = useAuthStore();
    store.authError = 'Email hoặc mật khẩu không đúng';

    mount(LoginModal, {
      props: { visible: true },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    const bodyText = document.body.textContent || '';
    expect(bodyText).toContain('Email hoặc mật khẩu không đúng');
  });

  it('AU-005 (P2): Close modal — Escape key closes', async () => {
    mount(LoginModal, {
      props: { visible: true },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    const bodyText = document.body.textContent || '';
    expect(bodyText).toContain('Đăng nhập');

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event);
    await flushPromises();
  });

  it('AU-006 (P2): Demo account — demo credentials displayed', async () => {
    mount(LoginModal, {
      props: { visible: true },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    const bodyText = document.body.textContent || '';
    expect(bodyText).toContain('demo@visualizationdsa.dev');
    expect(bodyText).toContain('Demo@2024');
  });

  it('AU-007 (P2): Refresh token — auto refresh before expiry', async () => {
    const store = useAuthStore();
    await store.statelessLogin('test@dsa.com', 'password123');

    expect(store.getAccessToken()).toBe('fake-token');

    const { statelessAuthApi } = await import('../../../features/auth/services/statelessAuthApi');
    vi.mocked(statelessAuthApi.refresh).mockResolvedValueOnce({
      accessToken: 'refreshed-token',
      refreshToken: 'refreshed-refresh',
      expiresIn: 3600,
      user: {
        id: '1', email: 'test@dsa.com', username: 'test',
        totalXP: 100, currentLevel: 2, streakDays: 5,
        createdAt: '2024-01-01', badges: [], isPremium: false,
        role: 'Student', nickname: 'TestNick', bio: 'Hello', university: 'FPT',
      },
    });

    await store.refreshAccessToken();

    expect(store.getAccessToken()).toBe('refreshed-token');
    expect(statelessAuthApi.refresh).toHaveBeenCalled();
  });

  it('AU-008 (P2): Logout — clears token and user', async () => {
    const store = useAuthStore();
    await store.statelessLogin('test@dsa.com', 'password123');
    expect(store.isAuthenticated).toBe(true);

    await store.statelessLogout();

    expect(store.getAccessToken()).toBeNull();
    expect(store.currentUser).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });

  it('AU-009 (P2: P3): Personal info — header displays name/level/xp', async () => {
    setActivePinia(createPinia());
    const store = useAuthStore();
    await store.statelessLogin('test@dsa.com', 'password123');

    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          BaseIcon: { template: '<span />' },
          NotificationBell: { template: '<div />' },
          RouterLink: { template: '<a><slot /></a>' },
          RouterView: { template: '<div />' },
        },
        mocks: {
          $router: { push: vi.fn() },
        },
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain('test');
    expect(wrapper.text()).toContain('Cấp 2');
    expect(wrapper.text()).toContain('100 XP');
  });

  it('AU-010 (P2): Click avatar — navigates to profile', async () => {
    setActivePinia(createPinia());
    const store = useAuthStore();
    await store.statelessLogin('test@dsa.com', 'password123');

    const mockPush = vi.fn();
    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          BaseIcon: { template: '<span />' },
          NotificationBell: { template: '<div />' },
          RouterLink: { template: '<a><slot /></a>' },
          RouterView: { template: '<div />' },
        },
        mocks: {
          $router: { push: mockPush },
        },
      },
    });
    await flushPromises();

    const userBadge = wrapper.find('.user-badge');
    expect(userBadge.exists()).toBe(true);

    await userBadge.trigger('click');
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('AU-011 (P2): Impersonate — admin impersonates user', () => {
    setActivePinia(createPinia());
    const store = useAuthStore();

    store.accessToken = 'admin_token';
    store.currentUser = {
      id: 'admin-123', email: 'admin@dsa.com', username: 'admin_user',
      totalXP: 5000, currentLevel: 10, streakDays: 5,
      createdAt: '2024-01-01', badges: [], isPremium: true, role: 'Admin',
    };
    localStorage.setItem('vdsa_stateless_user_id', 'admin-123');
    localStorage.setItem('vdsa_refresh_token', 'admin_refresh');

    expect(store.isImpersonating).toBe(false);

    store.impersonate({
      accessToken: 'impersonated-token',
      refreshToken: 'impersonated-refresh',
      expiresIn: 3600,
      user: {
        id: 'student-456', email: 'student@dsa.com', username: 'student_user',
        totalXP: 200, currentLevel: 3, streakDays: 1,
        createdAt: '2024-02-02', badges: [], isPremium: false, role: 'Student',
      },
    });

    expect(store.isImpersonating).toBe(true);
    expect(store.currentUser?.id).toBe('student-456');
    expect(store.currentUser?.username).toBe('student_user');
  });

  it('AU-012 (P2): Banner — impersonate banner renders', () => {
    setActivePinia(createPinia());
    const store = useAuthStore();

    store.accessToken = 'admin_token';
    store.currentUser = {
      id: 'admin-123', email: 'admin@dsa.com', username: 'admin_user',
      totalXP: 5000, currentLevel: 10, streakDays: 5,
      createdAt: '2024-01-01', badges: [], isPremium: true, role: 'Admin',
    };
    localStorage.setItem('vdsa_stateless_user_id', 'admin-123');
    localStorage.setItem('vdsa_refresh_token', 'admin_refresh');

    store.impersonate({
      accessToken: 'impersonated-token',
      refreshToken: 'impersonated-refresh',
      expiresIn: 3600,
      user: {
        id: 'student-456', email: 'student@dsa.com', username: 'student_user',
        totalXP: 200, currentLevel: 3, streakDays: 1,
        createdAt: '2024-02-02', badges: [], isPremium: false, role: 'Student',
      },
    });

    expect(store.isImpersonating).toBe(true);
    expect(store.userName).toBe('student_user');
    expect(localStorage.getItem('vdsa_admin_access_token')).toBe('admin_token');
  });

  it('AU-013 (P2): Update profile — updateProfile() works', async () => {
    setActivePinia(createPinia());
    const store = useAuthStore();

    await store.updateProfile('newname', 'NewNick', 'New bio', 'MIT');

    const { statelessAuthApi } = await import('../../../features/auth/services/statelessAuthApi');
    expect(statelessAuthApi.updateProfile).toHaveBeenCalledWith('newname', 'NewNick', 'New bio', 'MIT');
    expect(store.authError).toBeNull();
  });

  it('AU-014 (P2): Change password — changePassword() works', async () => {
    setActivePinia(createPinia());
    const store = useAuthStore();

    await store.changePassword('oldPass123', 'newPass456');

    const { statelessAuthApi } = await import('../../../features/auth/services/statelessAuthApi');
    expect(statelessAuthApi.changePassword).toHaveBeenCalledWith('oldPass123', 'newPass456');
    expect(store.authError).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════════
// SUITE 4 — HTML PLAYGROUND P2
// ═══════════════════════════════════════════════════════════════════════════════════

describe('HTML Playground P2 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('HP-001 (P2): Write HTML — store.htmlCode updates', () => {
    const store = useHtmlPlaygroundStore();

    expect(store.html).toBeTruthy();

    store.setSourceFile('html', '<h1>Custom HTML</h1>');
    expect(store.html).toBe('<h1>Custom HTML</h1>');
  });

  it('HP-002 (P2): Preview — iframe sandbox renders', () => {
    const source = { html: '<p>Hello</p>', css: 'body { color: red; }', js: 'console.log(1);' };
    const doc = PlaygroundDocumentBuilder.buildDocument(source);

    expect(doc).toContain('<p>Hello</p>');
    expect(doc).toContain('body { color: red; }');
    expect(doc).toContain('console.log(1);');
    expect(doc).toContain('<!DOCTYPE html>');
  });

  it('HP-004 (P2): Run — runCode() updates preview', () => {
    const store = useHtmlPlaygroundStore();

    store.setSourceFile('html', '<button id="btn">Click</button>');
    store.setSourceFile('css', 'button { background: blue; }');
    store.setSourceFile('js', 'document.getElementById("btn").textContent = "Clicked";');

    expect(store.documentHtml).toContain('<button id="btn">Click</button>');
    expect(store.documentHtml).toContain('button { background: blue; }');
    expect(store.documentHtml).toContain('document.getElementById("btn").textContent = "Clicked";');
  });

  it('HP-005 (P2): Toggle preview — show/hide', () => {
    const store = useHtmlPlaygroundStore();

    expect(store.isPreviewVisible).toBe(true);

    store.togglePreview();
    expect(store.isPreviewVisible).toBe(false);

    store.togglePreview();
    expect(store.isPreviewVisible).toBe(true);
  });

  it('HP-007 (P2): Reset — resetCode() returns to default', () => {
    const store = useHtmlPlaygroundStore();

    store.setSourceFile('html', '<h1>Custom</h1>');
    store.setSourceFile('css', 'h1 { font-size: 50px; }');
    store.setSourceFile('js', 'alert("test");');

    store.resetToDefault();

    expect(store.activeTab).toBe('html');
    expect(store.revision).toBe(1);
    expect(store.html).toBeTruthy();
    expect(store.css).toBeTruthy();
    expect(store.js).toBeTruthy();
  });

  it('HP-008 (P2): Share link — URL encode/decode', () => {
    const source = { html: '<h1>Shared</h1>', css: 'h1 { color: green; }', js: '' };
    const encoded = PlaygroundUrlCodec.encode(source);

    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');

    const decoded = PlaygroundUrlCodec.decode(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.html).toBe('<h1>Shared</h1>');
    expect(decoded?.css).toBe('h1 { color: green; }');
    expect(decoded?.js).toBe('');
  });

  it('HP-013 (P2): Sandbox security — JS content is escaped', () => {
    const source = { html: '<p>Safe</p>', css: '', js: '</script><script>alert("xss")</script>' };
    const doc = PlaygroundDocumentBuilder.buildDocument(source);

    expect(doc).toContain('<!DOCTYPE html>');
    expect(doc).toContain('<html lang="vi">');
    expect(doc).toContain('<meta charset="UTF-8">');

    // JS should be escaped to prevent breaking out of script context
    expect(doc).not.toContain('</script><script>alert("xss")</script>');
  });
});
