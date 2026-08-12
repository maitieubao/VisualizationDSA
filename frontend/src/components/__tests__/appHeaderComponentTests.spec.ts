// @vitest-environment jsdom
// CU-024 (P2): AppHeader component tests — logout/openLogin emit, avatar AU-052 regex,
// user-badge push /profile, icon theme đổi, responsive hidden lg:flex, aria-label,
// assert setAttribute('data-theme', ...) được gọi.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, type VueWrapper } from '@vue/test-utils';
import AppHeader from '../AppHeader.vue';
import { useThemeStore } from '../../shared/store/useThemeStore';
import BaseIcon from '../../shared/components/BaseIcon.vue';

const mocks = vi.hoisted(() => ({
  authMock: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock('../../features/notifications/components/NotificationBell.vue', () => ({
  default: { template: '<div class="notification-bell-stub" />' },
}));

vi.mock('../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => mocks.authMock(),
}));

interface MockAuthState {
  isAuthenticated: boolean;
  userName: string;
  userLevel: number;
  userXP: number;
  isPremium: boolean;
  userRole: string;
}

const DEFAULT_AUTH: MockAuthState = {
  isAuthenticated: false,
  userName: 'Khách',
  userLevel: 1,
  userXP: 0,
  isPremium: false,
  userRole: 'Student',
};

function setAuth(partial: Partial<MockAuthState>): void {
  mocks.authMock.mockReturnValue({ ...DEFAULT_AUTH, ...partial });
}

let wrapper: VueWrapper | null = null;

function mountHeader(): VueWrapper {
  wrapper = mount(AppHeader, {
    attachTo: document.body,
    global: {
      mocks: { $router: { push: mocks.routerPush } },
      components: { BaseIcon },
      stubs: {
        RouterLink: { template: '<a class="router-link-stub"><slot /></a>' },
      },
    },
  });
  return wrapper;
}

describe('AppHeader — CU-024 (P2)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    setAuth({});
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
  });

  it('chưa login → nút Đăng nhập emit openLogin', async () => {
    const w = mountHeader();

    const loginBtn = w.find('button.btn-primary');
    expect(loginBtn.text()).toContain('Đăng nhập');

    await loginBtn.trigger('click');
    expect(w.emitted('openLogin')).toHaveLength(1);
  });

  it('đã login → nút Đăng xuất emit logout', async () => {
    setAuth({ isAuthenticated: true, userName: 'mai' });
    const w = mountHeader();

    const logoutBtn = w.find('button[aria-label="Đăng xuất"]');
    expect(logoutBtn.exists()).toBe(true);

    await logoutBtn.trigger('click');
    expect(w.emitted('logout')).toHaveLength(1);
  });

  it('AU-052: avatar lấy ký tự chữ cái đầu tiên (hỗ trợ tiếng Việt)', () => {
    setAuth({ isAuthenticated: true, userName: 'nguyễn văn an' });
    const w = mountHeader();

    expect(w.find('.user-badge__avatar').text()).toContain('N');
  });

  it('AU-052: username chỉ số/ký tự đặc biệt → fallback icon user, không chữ', () => {
    setAuth({ isAuthenticated: true, userName: '123456' });
    const w = mountHeader();

    expect(w.find('.user-badge__avatar svg').exists()).toBe(true);
    expect(w.find('.user-badge__avatar').text().trim()).toBe('');
  });

  it('AU-052: chữ đứng sau số → vẫn lấy chữ cái đầu tiên', () => {
    setAuth({ isAuthenticated: true, userName: '123abc' });
    const w = mountHeader();

    expect(w.find('.user-badge__avatar').text()).toContain('A');
  });

  it('click user-badge → $router.push /profile', async () => {
    setAuth({ isAuthenticated: true, userName: 'mai' });
    const w = mountHeader();

    await w.find('.user-badge').trigger('click');
    expect(mocks.routerPush).toHaveBeenCalledWith('/profile');
  });

  it('responsive: nav.header-nav có hidden + lg:flex (ẩn mobile, hiện desktop)', () => {
    const w = mountHeader();
    const nav = w.find('nav.header-nav');

    expect(nav.exists()).toBe(true);
    expect(nav.classes()).toContain('hidden');
    expect(nav.classes()).toContain('lg:flex');
  });

  it('aria-label đầy đủ cho các nút icon', () => {
    const w = mountHeader();

    expect(w.find('button[aria-label="Đổi giao diện"]').exists()).toBe(true);
    expect(w.find('button[aria-label="Xem hướng dẫn nhanh"]').exists()).toBe(true);
    expect(w.find('a[aria-label="GitHub Repository"]').exists()).toBe(true);
  });

  it('icon theme đổi theo currentTheme (mặt trời khi dark, mặt trăng khi light)', async () => {
    const themeStore = useThemeStore();
    const w = mountHeader();
    const themeBtn = w.find('button[aria-label="Đổi giao diện"]');

    expect(themeStore.currentTheme).toBe('terminal-dark');
    expect(themeBtn.find('svg').html()).toContain('x1="4.22"');

    await themeBtn.trigger('click');

    expect(themeStore.currentTheme).toBe('light');
    expect(themeBtn.find('svg').html()).toContain('M21 12.79');
  });

  it('toggle theme → document.documentElement.setAttribute(data-theme, ...) được gọi', async () => {
    const setAttrSpy = vi.spyOn(document.documentElement, 'setAttribute');
    const w = mountHeader();

    await w.find('button[aria-label="Đổi giao diện"]').trigger('click');

    expect(setAttrSpy).toHaveBeenCalledWith('data-theme', 'light');
    setAttrSpy.mockRestore();
  });
});
