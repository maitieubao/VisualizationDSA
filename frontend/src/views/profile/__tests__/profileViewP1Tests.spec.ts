// @vitest-environment jsdom
// PR-007 (P1): ProfileView — modal profile: 6 nav tab, click chuyển tab,
// Escape đóng modal (router.back / router.push theo history.length),
// loadStatelessProfile gọi khi mount, badge pill hiển thị số badges.
// (Phạm vi component-only: auth store 100% mock — xem ghi chú PR-022.)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises, config, type VueWrapper } from '@vue/test-utils';
import { reactive } from 'vue';

const routerMocks = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
}));

const toastStoreMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}));

const loadStatelessProfileMock = vi.fn(async () => {});

const authStoreMock = reactive({
  accessToken: 'fake-token',
  currentUser: {
    id: 'user-1',
    email: 'test@example.com',
    username: 'nguyenvana',
    nickname: 'VanA',
    bio: 'Yêu thích DSA',
    university: 'ĐH Bách Khoa',
    badges: [
      { id: 'b1', name: 'First Steps', description: 'Hoàn thành bài đầu tiên', icon: '📝', color: '#6366f1', earnedAt: '2025-01-15T00:00:00Z' },
      { id: 'b2', name: 'Sorting Wizard', description: 'Master sorting', icon: '📊', color: '#3d9970', earnedAt: '2025-02-01T00:00:00Z' },
    ],
    role: 'Student',
    isPremium: false,
    currentLevel: 3,
    totalXP: 450,
    streakDays: 7,
    createdAt: '2025-01-01T00:00:00Z',
  },
  isAuthenticated: true,
  userName: 'nguyenvana',
  userLevel: 3,
  userXP: 450,
  isPremium: false,
  userRole: 'Student',
  isTeacher: false,
  isAdmin: false,
  getAccessToken: () => 'fake-token',
  statelessUser: null,
  isStatelessMode: true,
  updateProfile: vi.fn(async () => null),
  changePassword: vi.fn(async () => {}),
  loadStatelessProfile: loadStatelessProfileMock,
});

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => authStoreMock),
}));

vi.mock('../../../composables/useToast', () => ({
  useToastStore: vi.fn(() => toastStoreMock),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => routerMocks),
}));

// BaseIcon là component GLOBAL (main.ts app.component) — component con không import,
// nên vi.mock(module) là MOCK CHẾT (PR-022): dùng config.global.stubs khi mount.
const BaseIconStub = {
  name: 'BaseIcon',
  props: ['name', 'class'],
  template: '<svg class="base-icon-mock"><title>{{ name }}</title></svg>',
};

config.global.stubs = {
  BaseIcon: BaseIconStub,
  RouterLink: { name: 'RouterLinkStub', template: '<a class="router-link-stub"><slot /></a>' },
};

import ProfileView from '../ProfileView.vue';

describe('ProfileView (PR-007)', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    routerMocks.back.mockClear();
    routerMocks.push.mockClear();
    loadStatelessProfileMock.mockClear();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [] })));
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
  });

  it('mount → gọi loadStatelessProfile đúng 1 lần', async () => {
    wrapper = mount(ProfileView);
    await flushPromises();
    expect(loadStatelessProfileMock).toHaveBeenCalledTimes(1);
  });

  it('render đủ 6 nav-item + default tab General', async () => {
    wrapper = mount(ProfileView);
    await flushPromises();
    expect(wrapper.findAll('.nav-item').length).toBe(6);
    expect(wrapper.text()).toContain('Quản lý danh tính cá nhân');
    expect(wrapper.find('#username').exists()).toBe(true);
  });

  it('click từng nav-item → hiển thị đúng tab tương ứng', async () => {
    wrapper = mount(ProfileView);
    await flushPromises();
    const markers: { selector: string; text?: string }[] = [
      { selector: '#username' },
      { selector: '.group-title-row', text: 'Huy hiệu đã mở khóa' },
      { selector: '.panel-title', text: 'Quiz History' },
      { selector: '#currentPassword' },
      { selector: '.pm-form', text: 'Tốc độ VCR mặc định' },
      { selector: '.about-spec-grid' },
    ];
    const navItems = wrapper.findAll('.nav-item');
    expect(navItems.length).toBe(6);
    for (let i = 0; i < navItems.length; i++) {
      await navItems[i].trigger('click');
      await flushPromises();
      const marker = markers[i];
      const el = wrapper.find(marker.selector);
      expect(el.exists()).toBe(true);
      if (marker.text) expect(el.text()).toContain(marker.text);
    }
  });

  it('badge pill hiển thị số badges của currentUser', async () => {
    wrapper = mount(ProfileView);
    await flushPromises();
    const pill = wrapper.find('.nav-badge-pill');
    expect(pill.exists()).toBe(true);
    expect(pill.text()).toBe('2');
  });

  it('Escape (history.length = 1) → đóng modal bằng router.push /dashboard', async () => {
    wrapper = mount(ProfileView);
    await flushPromises();
    // useModalA11y (PR-003) lắng nghe keydown trên document — dispatch tại document.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await flushPromises();
    expect(routerMocks.push).toHaveBeenCalledWith('/dashboard');
    expect(routerMocks.back).not.toHaveBeenCalled();
  });

  it('Escape (history.length > 1) → đóng modal bằng router.back', async () => {
    window.history.pushState({}, '', '/profile');
    wrapper = mount(ProfileView);
    await flushPromises();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await flushPromises();
    expect(routerMocks.back).toHaveBeenCalled();
    expect(routerMocks.push).not.toHaveBeenCalled();
  });

  it('unmount → keydown listener đã gỡ, Escape không còn đóng modal', async () => {
    wrapper = mount(ProfileView);
    await flushPromises();
    wrapper.unmount();
    wrapper = null;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(routerMocks.back).not.toHaveBeenCalled();
    expect(routerMocks.push).not.toHaveBeenCalled();
  });
});
