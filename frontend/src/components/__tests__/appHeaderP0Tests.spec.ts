// @vitest-environment jsdom
// CU-007 (P1): AppHeader test mount THẬT (mock router/auth store) — hết filteredTabs copy-paste.
// CU-036 (P3): localStorage.clear() giữa các it() + không override document (restore sạch).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, type VueWrapper } from '@vue/test-utils';
import AppHeader from '../AppHeader.vue';
import { useThemeStore } from '../../shared/store/useThemeStore';
import BaseIcon from '../../shared/components/BaseIcon.vue';
import { APP_TABS } from '../../appTabs';
import type { TabGroup } from '../../appTabs';

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

describe('NA-001 (P0): APP_TABS — dữ liệu tab gốc', () => {
  it('chứa 5 group: Học tập, Giải thuật, Khái niệm, Tương tác, Tài khoản', () => {
    const groups = APP_TABS.filter((tab) => 'groupName' in tab) as TabGroup[];
    const groupNames = groups.map((group) => group.groupName);

    expect(groupNames).toEqual(
      expect.arrayContaining(['Học tập', 'Giải thuật', 'Khái niệm', 'Tương tác', 'Tài khoản']),
    );
  });
});

describe('CU-007 (P1): Nav tabs qua mount thật — hết filteredTabs copy-paste', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    setAuth({});
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
  });

  it('chưa login → 5 group hiển thị, tab requiresAuth ẩn', () => {
    const w = mountHeader();
    const text = w.text();

    expect(text).toContain('Học tập');
    expect(text).toContain('Giải thuật');
    expect(text).toContain('Khái niệm');
    expect(text).toContain('Tương tác');
    expect(text).toContain('Tài khoản');
    expect(text).not.toContain('Lớp học của tôi');
    expect(text).not.toContain('Bảng điều khiển');
    expect(text).not.toContain('Hồ sơ cá nhân');
  });

  it('đã login Student → tab requiresAuth hiển thị, tab teacher/admin ẩn', () => {
    setAuth({ isAuthenticated: true, userName: 'student', userRole: 'Student' });
    const w = mountHeader();
    const text = w.text();

    expect(text).toContain('Lớp học của tôi');
    expect(text).toContain('Bảng điều khiển');
    expect(text).toContain('Hồ sơ cá nhân');
    expect(text).not.toContain('Quản lý Giảng viên');
    expect(text).not.toContain('Quản trị Admin');
  });

  it('Teacher → hiển thị Quản lý Giảng viên, ẩn Quản trị Admin', () => {
    setAuth({ isAuthenticated: true, userName: 'teacher', userRole: 'Teacher' });
    const w = mountHeader();

    expect(w.text()).toContain('Quản lý Giảng viên');
    expect(w.text()).not.toContain('Quản trị Admin');
  });

  it('Admin → hiển thị cả Quản trị Admin lẫn Quản lý Giảng viên', () => {
    setAuth({ isAuthenticated: true, userName: 'admin', userRole: 'Admin' });
    const w = mountHeader();

    expect(w.text()).toContain('Quản trị Admin');
    expect(w.text()).toContain('Quản lý Giảng viên');
  });
});

describe('NA-006 (P0): GitHub link — mount thật thay vì readFileSync', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    setAuth({});
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
  });

  it('render <a href=github> với target=_blank + rel=noopener noreferrer + aria-label', () => {
    const w = mountHeader();
    const link = w.find('a[href="https://github.com/maitieubao/VisualizationDSA"]');

    expect(link.exists()).toBe(true);
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toBe('noopener noreferrer');
    expect(link.attributes('aria-label')).toBe('GitHub Repository');
  });
});

describe('NA-003 (P0): Theme toggle — mount thật + assert setAttribute data-theme', () => {
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

  it('click nút đổi giao diện → currentTheme đổi + setAttribute(data-theme) + lưu localStorage', async () => {
    const setAttrSpy = vi.spyOn(document.documentElement, 'setAttribute');
    const themeStore = useThemeStore();
    const w = mountHeader();

    expect(themeStore.currentTheme).toBe('terminal-dark');

    await w.find('button[aria-label="Đổi giao diện"]').trigger('click');

    expect(themeStore.currentTheme).toBe('light');
    expect(localStorage.getItem('app-theme')).toBe('light');
    expect(setAttrSpy).toHaveBeenCalledWith('data-theme', 'light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    await w.find('button[aria-label="Đổi giao diện"]').trigger('click');

    expect(themeStore.currentTheme).toBe('terminal-dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal-dark');

    setAttrSpy.mockRestore();
  });
});
