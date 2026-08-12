// @vitest-environment jsdom
// AD-039: CONTRACT SPEC cho useAdminApi + toàn bộ endpoint Admin Panel.
// Không mock useAdminApi/useAuthStore — dùng store thật + fetch thật (stub global)
// để assert URL, method, body camelCase và Bearer header của 9 endpoint admin.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';
import { useAdminApi } from '../useAdminApi';
import AdminUsersTab from '../AdminUsersTab.vue';
import AdminAuditTab from '../AdminAuditTab.vue';
import type { StatelessAuthResponse } from '../../../features/auth/services/statelessAuthApi';

type FetchCallTuple = [input: RequestInfo | URL, init?: RequestInit];

const BASE_URL = 'http://localhost:5055';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => body } as unknown as Response;
}

function usersListResponse(): Record<string, unknown> {
  return { users: JSON.parse(JSON.stringify(adminUsers)) as AdminUser[], total: 1, page: 1, totalAdmins: 2 };
}

function notFoundResponse(): Response {
  return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}) } as unknown as Response;
}

function parseBody(init: RequestInit | undefined): Record<string, unknown> {
  return JSON.parse(String(init?.body)) as Record<string, unknown>;
}

function headerOf(init: RequestInit | undefined, name: string): string | undefined {
  const headers = init?.headers as Record<string, string> | undefined;
  return headers?.[name];
}

interface AdminUser {
  id: string; email: string; username: string; role: string;
  isPremium: boolean; isActive: boolean;
  totalXP: number; currentLevel: number; streakDays: number;
  createdAt: string; lastLogin: string;
}

const adminUsers: AdminUser[] = [
  { id: 'u1', email: 'alice@test.com', username: 'alice', role: 'Student', isPremium: true, isActive: true, totalXP: 1500, currentLevel: 8, streakDays: 10, createdAt: '2024-01-15', lastLogin: '2024-08-01' },
];

const impersonatedResponse: StatelessAuthResponse = {
  accessToken: 'impersonated-token',
  refreshToken: 'impersonated-refresh',
  expiresIn: 3600,
  user: {
    id: 'u1', email: 'alice@test.com', username: 'alice',
    totalXP: 1500, currentLevel: 8, streakDays: 10,
    createdAt: '2024-01-15', badges: [], isPremium: true, role: 'Student',
  },
};

let fetchMock: ReturnType<typeof vi.fn>;

function stubFetch(): void {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
}

function setAdminToken(): void {
  const store = useAuthStore();
  store.accessToken = 'contract-admin-token';
}

function mountTab(): VueWrapper {
  return mount(AdminUsersTab, {
    global: { components: { BaseIcon } },
  });
}

describe('useAdminApi — Contract Spec (AD-039)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    setAdminToken();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    stubFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('getAuthHeaders / pushLog / getDifficultyLabel (unit)', () => {
    it('getAuthHeaders trả Content-Type JSON + Bearer token từ authStore', () => {
      const api = useAdminApi();
      expect(api.getAuthHeaders()).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer contract-admin-token',
      });
    });

    it('BASE_URL = VITE_API_BASE_URL fallback http://localhost:5055', () => {
      expect(useAdminApi().BASE_URL).toBe(BASE_URL);
    });

    it('getDifficultyLabel map easy/hard/khác sang Dễ/Khó/Trung bình', () => {
      const api = useAdminApi();
      expect(api.getDifficultyLabel('easy')).toBe('Dễ');
      expect(api.getDifficultyLabel('hard')).toBe('Khó');
      expect(api.getDifficultyLabel('medium')).toBe('Trung bình');
    });

    it('pushLog unshift log mới kèm time + giới hạn tối đa 15 dòng', () => {
      const api = useAdminApi();
      api.pushLog('WARN', 'test-warning');
      expect(api.auditLogs.value.length).toBe(4);
      expect(api.auditLogs.value[0].message).toBe('test-warning');
      expect(api.auditLogs.value[0].type).toBe('WARN');
      expect(api.auditLogs.value[0].time).toMatch(/^\d{2}:\d{2}:\d{2}$/);

      for (let i = 0; i < 20; i += 1) api.pushLog('INFO', `log-${i}`);
      expect(api.auditLogs.value.length).toBe(15);
    });
  });

  describe('GET /api/v1/concepts/admin/users (AdminUsersTab loadUsers)', () => {
    it('GET users kèm page/pageSize + Bearer header từ store', async () => {
      fetchMock.mockImplementation(async (url: string) => {
        if (url.includes('/admin/users')) return jsonResponse(usersListResponse());
        return notFoundResponse();
      });

      const wrapper = mountTab();
      await flushPromises();

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users?page=1&pageSize=10`);
      // GET mặc định — source không truyền method cho request GET.
      expect(init?.method ?? 'GET').toBe('GET');
      expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');
      expect(headerOf(init, 'Content-Type')).toBe('application/json');
      expect(wrapper.text()).toContain('alice');
      wrapper.unmount();
    });
  });

  describe('PUT /api/v1/concepts/admin/users/{id}/role (AD-039)', () => {
    it('đổi role → PUT với body {role} + Bearer', async () => {
      fetchMock.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/users') && opts?.method === 'PUT') return jsonResponse({ success: true });
        if (url.includes('/admin/users')) return jsonResponse(usersListResponse());
        return notFoundResponse();
      });

      const wrapper = mountTab();
      await flushPromises();

      const select = wrapper.find('.inline-select');
      await select.setValue('Teacher');
      await select.trigger('change');
      await flushPromises();

      const putCall = (fetchMock.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/users/u1/role'));
      expect(putCall).toBeTruthy();
      const [input, init] = putCall ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users/u1/role`);
      expect(init?.method).toBe('PUT');
      expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');
      expect(parseBody(init)).toEqual({ role: 'Teacher' });
      wrapper.unmount();
    });
  });

  describe('PUT premium / ban / reset-password (AD-039)', () => {
    it('toggle premium → PUT {isPremium} tại /users/{id}/premium', async () => {
      fetchMock.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/premium') && opts?.method === 'PUT') return jsonResponse({ success: true });
        if (url.includes('/admin/users')) return jsonResponse(usersListResponse());
        return notFoundResponse();
      });

      const wrapper = mountTab();
      await flushPromises();

      await wrapper.find('.toggle-btn').trigger('click');
      await flushPromises();

      const putCall = (fetchMock.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/premium'));
      const [input, init] = putCall ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users/u1/premium`);
      expect(init?.method).toBe('PUT');
      expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');
      expect(parseBody(init)).toEqual({ isPremium: false });
      wrapper.unmount();
    });

    it('ban user → PUT {isActive} tại /users/{id}/ban', async () => {
      fetchMock.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/ban') && opts?.method === 'PUT') return jsonResponse({ success: true });
        if (url.includes('/admin/users')) return jsonResponse(usersListResponse());
        return notFoundResponse();
      });

      const wrapper = mountTab();
      await flushPromises();

      await wrapper.find('.ban-btn--active').trigger('click');
      await flushPromises();

      const putCall = (fetchMock.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/ban'));
      const [input, init] = putCall ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users/u1/ban`);
      expect(init?.method).toBe('PUT');
      expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');
      expect(parseBody(init)).toEqual({ isActive: false });
      wrapper.unmount();
    });

    it('reset password → PUT {newPassword} tại /users/{id}/reset-password', async () => {
      fetchMock.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/reset-password') && opts?.method === 'PUT') return jsonResponse({ success: true });
        if (url.includes('/admin/users')) return jsonResponse(usersListResponse());
        return notFoundResponse();
      });

      const wrapper = mountTab();
      await flushPromises();

      await wrapper.find('.btn-reset-password').trigger('click');
      await nextTick();

      const modal = document.body.querySelector('.user-modal-card') as HTMLElement;
      const passwordInput = modal.querySelector('input[type="password"]') as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
      setter.call(passwordInput, 'newpassword123');
      passwordInput.dispatchEvent(new Event('input'));
      await nextTick();

      const submitBtn = document.body.querySelector('.submit-btn') as HTMLElement;
      submitBtn.click();
      await flushPromises();

      const putCall = (fetchMock.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/reset-password'));
      const [input, init] = putCall ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users/u1/reset-password`);
      expect(init?.method).toBe('PUT');
      expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');
      expect(parseBody(init)).toEqual({ newPassword: 'newpassword123' });
      wrapper.unmount();
    });
  });

  describe('POST /api/v1/concepts/admin/users (create user — AD-037 contract)', () => {
    it('tạo user → POST body {username, email, password, role, isPremium} + Bearer', async () => {
      fetchMock.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/users') && opts?.method === 'POST') {
          return jsonResponse({ id: 'new-id', ...parseBody(opts) });
        }
        if (url.includes('/admin/users')) return jsonResponse(usersListResponse());
        return notFoundResponse();
      });

      const wrapper = mountTab();
      await flushPromises();

      await wrapper.find('.btn-create-user').trigger('click');
      await nextTick();

      const modal = document.body.querySelector('.user-modal-card') as HTMLElement;
      const usernameInput = modal.querySelector('input[type="text"]') as HTMLInputElement;
      const emailInput = modal.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = modal.querySelector('input[type="password"]') as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
      setter.call(usernameInput, 'newuser');
      usernameInput.dispatchEvent(new Event('input'));
      setter.call(emailInput, 'new@test.com');
      emailInput.dispatchEvent(new Event('input'));
      setter.call(passwordInput, 'password123');
      passwordInput.dispatchEvent(new Event('input'));
      await nextTick();

      const submitBtn = document.body.querySelector('.submit-btn') as HTMLElement;
      submitBtn.click();
      await flushPromises();

      const postCall = (fetchMock.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/admin/users') && call[1]?.method === 'POST');
      expect(postCall).toBeTruthy();
      const [input, init] = postCall ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users`);
      expect(init?.method).toBe('POST');
      expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');
      expect(headerOf(init, 'Content-Type')).toBe('application/json');
      expect(parseBody(init)).toEqual({ username: 'newuser', email: 'new@test.com', password: 'password123', role: 'Student', isPremium: false });
      wrapper.unmount();
    });
  });

  describe('DELETE /api/v1/concepts/admin/users/{id} (AD-039)', () => {
    it('xóa user → DELETE tại /users/{id} + Bearer', async () => {
      fetchMock.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/users/') && opts?.method === 'DELETE') return jsonResponse({ success: true });
        if (url.includes('/admin/users')) return jsonResponse(usersListResponse());
        return notFoundResponse();
      });

      const wrapper = mountTab();
      await flushPromises();

      await wrapper.find('.ban-btn--banned').trigger('click');
      await flushPromises();

      const deleteCall = (fetchMock.mock.calls as FetchCallTuple[]).find((call) => call[1]?.method === 'DELETE');
      expect(deleteCall).toBeTruthy();
      const [input, init] = deleteCall ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users/u1`);
      expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');
      wrapper.unmount();
    });
  });

  describe('POST /api/v1/concepts/admin/users/{id}/impersonate (AD-036/AD-013t)', () => {
    it('impersonate → POST /users/{id}/impersonate, store nhận StatelessAuthResponse, redirect /', async () => {
      fetchMock.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/impersonate') && opts?.method === 'POST') return jsonResponse(impersonatedResponse);
        if (url.includes('/admin/users')) return jsonResponse(usersListResponse());
        return notFoundResponse();
      });

      const store = useAuthStore();
      const impersonateSpy = vi.spyOn(store, 'impersonate');
      const startSpy = vi.spyOn(store, 'startImpersonating');

      const originalLocation = window.location;
      Object.defineProperty(window, 'location', { value: { href: '' }, writable: true, configurable: true });
      try {
        const wrapper = mountTab();
        await flushPromises();

        // Loại bỏ nút "Đổi Pass" (cũng mang class btn-impersonate) — chỉ click nút "Đóng vai".
        const impersonateBtn = wrapper.findAll('.btn-impersonate').find((btn) => !btn.classes().includes('btn-reset-password'));
        expect(impersonateBtn).toBeTruthy();
        await impersonateBtn!.trigger('click');
        await flushPromises();

        const postCall = (fetchMock.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/impersonate'));
        const [input, init] = postCall ?? [];
        expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/users/u1/impersonate`);
        expect(init?.method).toBe('POST');
        expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');

        const startCalls = startSpy.mock.calls;
        const impersonateCalls = impersonateSpy.mock.calls;
        if (startCalls.length > 0) {
          expect(startCalls[0][0]).toBe('u1');
        } else {
          expect(impersonateCalls.length).toBeGreaterThan(0);
          const arg = impersonateCalls[0][0] as StatelessAuthResponse;
          expect(arg.accessToken).toBe('impersonated-token');
          expect(arg.refreshToken).toBe('impersonated-refresh');
          expect(arg.expiresIn).toBe(3600);
          expect(arg.user.currentLevel).toBe(8);
          expect(arg.user.totalXP).toBe(1500);
          expect(arg.user.streakDays).toBe(10);
          expect(arg.user.badges).toEqual([]);
        }
        expect(window.location.href).toBe('/');
        wrapper.unmount();
      } finally {
        Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true });
      }
    });
  });

  describe('GET /api/v1/concepts/admin/audit-logs (AdminAuditTab — AD-039)', () => {
    it('audit logs → GET /admin/audit-logs?page=&pageSize= kèm Bearer', async () => {
      fetchMock.mockImplementation(async (url: string) => {
        if (url.includes('/admin/audit-logs')) {
          return jsonResponse({ total: 1, page: 1, logs: [{ id: 'log1', action: 'CreateUser', actorId: 'admin-1', actorName: 'Super Admin', targetId: 'user-1', details: 'Tạo user', createdAt: '2024-08-01T10:00:00Z' }] });
        }
        return notFoundResponse();
      });

      const wrapper = mount(AdminAuditTab, { global: { components: { BaseIcon } } });
      await flushPromises();

      const [input, init] = fetchMock.mock.calls[0] ?? [];
      expect(String(input)).toBe(`${BASE_URL}/api/v1/concepts/admin/audit-logs?page=1&pageSize=20`);
      expect(init?.method ?? 'GET').toBe('GET');
      expect(headerOf(init, 'Authorization')).toBe('Bearer contract-admin-token');
      expect(wrapper.text()).toContain('Tạo user');
      wrapper.unmount();
    });
  });
});
