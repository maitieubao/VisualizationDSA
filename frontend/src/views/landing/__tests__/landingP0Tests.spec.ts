// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';

const mockAuthStore = reactive({
  accessToken: null as string | null,
  currentUser: null as Record<string, unknown> | null,
  isAuthenticated: false,
  userName: 'Khách',
  userLevel: 1,
  userXP: 0,
  isPremium: false,
  userRole: 'Student',
  isTeacher: false,
  isAdmin: false,
  getAccessToken: () => null,
  statelessUser: null,
  isStatelessMode: false,
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  loadStatelessProfile: vi.fn(async () => {}),
});

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => mockAuthStore),
}));

const pushMock = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
  })),
}));

vi.mock('../../../shared/components/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    props: ['name', 'class'],
    template: '<svg class="base-icon-mock"><title>{{ name }}</title></svg>',
  },
}));

import LandingView from '../LandingView.vue';

describe('LandingView — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockAuthStore.accessToken = null;
    mockAuthStore.currentUser = null;
    mockAuthStore.isAuthenticated = false;
    mockAuthStore.userName = 'Khách';
    mockAuthStore.userLevel = 1;
    mockAuthStore.userXP = 0;
    pushMock.mockClear();
  });

  it('LD-001 (P0): Hero section — title + description render đúng', () => {
    const wrapper = mount(LandingView);
    expect(wrapper.find('.hero__title').text()).toContain('VisualizationDSA');
    expect(wrapper.find('.hero__tagline').text()).toContain('Cấu trúc Dữ liệu & Giải thuật');
    expect(wrapper.find('.hero__sub').exists()).toBe(true);
  });

  it('LD-002 (P0): 8 modules — liệt kê modules học', () => {
    const wrapper = mount(LandingView);
    const featureCards = wrapper.findAll('.feature-card');
    expect(featureCards.length).toBe(8);
    expect(wrapper.find('.feature-card__title').text()).toBe('Thuật toán Sắp xếp');
  });

  it('LD-003 (P0): Stats — hiển thị 7+ algorithms, 27+ questions', () => {
    const wrapper = mount(LandingView);
    const statValues = wrapper.findAll('.stat-item__value');
    const statLabels = wrapper.findAll('.stat-item__label');
    expect(statValues.length).toBeGreaterThanOrEqual(4);
    const allText = wrapper.find('.stats-bar').text();
    expect(allText).toContain('7+');
    expect(allText).toContain('27+');
    expect(statLabels.length).toBeGreaterThanOrEqual(4);
  });

  it('LD-004 (P0): CTA button (chưa login) — hiển thị "Bắt đầu ngay" và emit openLogin', async () => {
    mockAuthStore.isAuthenticated = false;
    const wrapper = mount(LandingView);
    const ctaButton = wrapper.find('.hero__cta--primary');
    expect(ctaButton.exists()).toBe(true);
    expect(ctaButton.text()).toContain('Bắt đầu ngay');
    await ctaButton.trigger('click');
    expect(wrapper.emitted('openLogin')).toBeTruthy();
  });

  it('LD-005 (P0): CTA (đã login) — hiển thị "Vào bảng điều khiển" và push router', async () => {
    mockAuthStore.isAuthenticated = true;
    const wrapper = mount(LandingView);
    const ctaButton = wrapper.find('.hero__cta--primary');
    expect(ctaButton.text()).toContain('Vào bảng điều khiển');
    await ctaButton.trigger('click');
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});
