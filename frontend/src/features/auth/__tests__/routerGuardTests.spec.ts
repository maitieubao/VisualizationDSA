import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { createApp } from 'vue';
import type { Router } from 'vue-router';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../store/useAuthStore';
import type { AuthUserDto } from '../services/authApi';

vi.mock('../../../views/landing/LandingView.vue', () => ({ default: { name: 'MockLanding' } }));
vi.mock('../../../views/dashboard/DashboardView.vue', () => ({ default: { name: 'MockDashboard' } }));
vi.mock('../../../views/admin/AdminPanelView.vue', () => ({ default: { name: 'MockAdmin' } }));
vi.mock('../../../views/teacher/TeacherPanelView.vue', () => ({ default: { name: 'MockTeacher' } }));
vi.mock('../../../views/not-found/NotFoundView.vue', () => ({ default: { name: 'MockNotFound' } }));

/**
 * Router thật dùng createWebHashHistory() — module của nó đọc `location.host` và `window`
 * ngay tại lúc import. Môi trường vitest là node nên phải dựng sẵn window/document/location
 * giả TRƯỚC khi import động router (AU-010).
 */
function installFakeBrowserGlobals(): void {
  const location = {
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    protocol: 'http:',
    pathname: '/',
    search: '',
    hash: '',
    href: 'http://localhost/',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    toString: () => 'http://localhost/',
  };

  const history = {
    length: 1,
    state: null,
    scrollRestoration: 'auto',
    pushState: vi.fn(),
    replaceState: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  };

  vi.stubGlobal('window', {
    location,
    history,
    pageXOffset: 0,
    pageYOffset: 0,
    scrollX: 0,
    scrollY: 0,
    scrollTo: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  // vue-router (createRouter) đọc `history` GLOBAL (không phải window.history).
  vi.stubGlobal('history', history);
  vi.stubGlobal('location', location);
  vi.stubGlobal('document', {
    visibilityState: 'visible',
    documentElement: { style: {} },
    querySelector: vi.fn(() => null),
    getElementById: vi.fn(() => null),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
}

let router: Router;

function makeUser(role: 'Student' | 'Teacher' | 'Admin'): AuthUserDto {
  return {
    id: `user-${role}`,
    email: `${role.toLowerCase()}@dsa.com`,
    username: `user_${role.toLowerCase()}`,
    totalXP: 100,
    currentLevel: 2,
    streakDays: 1,
    createdAt: '2024-01-01',
    badges: [],
    isPremium: false,
    role,
  };
}

function loginAs(role: 'Student' | 'Teacher' | 'Admin'): void {
  const store = useAuthStore();
  store.accessToken = `token-${role}`;
  store.currentUser = makeUser(role);
}

describe('Router Guard — requiresAuth / requiresRole / impersonation (AU-010)', () => {
  beforeAll(async () => {
    installFakeBrowserGlobals();
    // Guard đọc useAuthStore() ngay ở navigation đầu tiên → cần pinia active.
    setActivePinia(createPinia());
    router = (await import('../../../router/index')).default;
    // Navigation đầu tiên chỉ được khởi động khi router được install vào app (vue-router 4) —
    // chưa install thì router.isReady() không bao giờ resolve.
    const app = createApp({});
    app.use(router);
    await router.isReady();
  });

  beforeEach(async () => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    // Router là singleton module-level: route của test trước còn tồn tại. Nếu test hiện tại
    // push() đúng route đang đứng, vue-router trả NAVIGATION_DUPLICATED và KHÔNG chạy lại
    // guard → redirect không xảy ra. Reset về route trung lập /courses (public, không bị
    // guard chặn) để mỗi test bắt đầu từ một location khác target của nó (AU-010).
    await router.push('/courses');
  });

  it('chưa đăng nhập: vào /dashboard → redirect về landing', async () => {
    await router.push('/dashboard');

    expect(router.currentRoute.value.name).toBe('landing');
  });

  it('đã đăng nhập: vào landing (/) → redirect về dashboard', async () => {
    loginAs('Student');

    await router.push('/');

    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('Student vào /admin → redirect về dashboard', async () => {
    loginAs('Student');

    await router.push('/admin');

    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('Teacher vào /admin → redirect về dashboard (không vào được /admin)', async () => {
    loginAs('Teacher');

    await router.push('/admin');

    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('Admin vào /admin → đi tiếp (ok)', async () => {
    loginAs('Admin');

    await router.push('/admin');

    expect(router.currentRoute.value.name).toBe('admin');
    expect(router.currentRoute.value.path).toBe('/admin');
  });

  it('Admin vào /teacher → được phép (Admin đứng trên Teacher)', async () => {
    loginAs('Admin');

    await router.push('/teacher');

    expect(router.currentRoute.value.name).toBe('teacher');
  });

  it('Teacher vào /teacher → đi tiếp (ok)', async () => {
    loginAs('Teacher');

    await router.push('/teacher');

    expect(router.currentRoute.value.name).toBe('teacher');
  });

  it('Student vào /teacher → redirect về dashboard', async () => {
    loginAs('Student');

    await router.push('/teacher');

    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('rời /admin khi đang impersonate → stopImpersonating được gọi + phục hồi admin session', async () => {
    loginAs('Admin');
    await router.push('/admin');
    expect(router.currentRoute.value.name).toBe('admin');

    localStorage.setItem('vdsa_admin_access_token', 'admin-token');
    localStorage.setItem('vdsa_admin_refresh_token', 'admin-refresh');
    localStorage.setItem('vdsa_admin_user_id', 'admin-123');
    localStorage.setItem('vdsa_admin_user_data', JSON.stringify(makeUser('Admin')));

    const store = useAuthStore();
    store.currentUser = makeUser('Student');
    expect(store.isImpersonating).toBe(true);

    const stopSpy = vi.spyOn(store, 'stopImpersonating');

    await router.push('/dashboard');

    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(store.isImpersonating).toBe(false);
    expect(localStorage.getItem('vdsa_admin_access_token')).toBeNull();
    expect(store.currentUser?.role).toBe('Admin');
    expect(store.getAccessToken()).toBe('admin-token');
  });
});
