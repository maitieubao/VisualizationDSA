// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// AD-036: spy dùng chung (vi.hoisted) cho mock useAuthStore — impersonate test assert trực tiếp
// việc gọi store (startImpersonating HOẶC impersonate) + refreshAccessToken cho test 401-retry (AD-038).
const authStoreMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(() => 'fake-admin-token'),
  impersonate: vi.fn(),
  startImpersonating: vi.fn(),
  refreshAccessToken: vi.fn(),
}));

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => authStoreMocks,
}));

vi.mock('./useAdminApi', () => ({
  useAdminApi: () => ({
    BASE_URL: 'http://localhost:5055',
    authStore: authStoreMocks,
    auditLogs: { value: [
      { time: '15:20:04', type: 'INFO', message: 'Hệ thống Admin khởi động hoàn tất.' },
      { time: '15:20:08', type: 'INFO', message: 'Đã kết nối cơ sở dữ liệu PostgreSQL.' },
    ]},
    getAuthHeaders: () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer fake-admin-token' }),
    pushLog: vi.fn(),
    getDifficultyLabel: (d: string) => d === 'easy' ? 'Dễ' : d === 'hard' ? 'Khó' : 'Trung bình',
  }),
}));

// FetchMock dùng cho interceptor (AD-038); mockFetch chính là vi.fn() không type cứng
// vì các mockImplementation viết (url: string) — tránh lỗi contravariance typecheck.
type FetchCallTuple = [input: RequestInfo | URL, init?: RequestInit];
type FetchMock = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
const mockFetch = vi.fn();
global.fetch = mockFetch;

interface AdminUser {
  id: string; email: string; username: string; role: string;
  isPremium: boolean; isActive: boolean;
  totalXP: number; currentLevel: number; streakDays: number;
  createdAt: string; lastLogin: string;
}
interface AdminUsersPage { users: AdminUser[]; total: number; page?: number; totalAdmins?: number; }
interface AdminDashboardData {
  users: { total: number; students: number; teachers: number; admins: number; premium: number };
  quizzes: { total: number };
  orders: { total: number; paid: number };
  topUsers: Array<{ email: string; username: string; totalXP: number; currentLevel: number; role: string }>;
  registrationsLast7Days: Array<{ date: string; count: number }>;
  popularCourses: Array<{ courseId: string; title: string; enrollmentsCount: number }>;
}

const defaultDashboardData: AdminDashboardData = {
  users: { total: 0, students: 0, teachers: 0, admins: 0, premium: 0 },
  quizzes: { total: 0 },
  orders: { total: 0, paid: 0 },
  topUsers: [],
  registrationsLast7Days: [],
  popularCourses: [],
};

function notFoundResponse(): Response {
  return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}) } as unknown as Response;
}

function createMockUsers(): AdminUser[] {
  return [
    { id: 'u1', email: 'alice@test.com', username: 'alice', role: 'Student', isPremium: true, isActive: true, totalXP: 1500, currentLevel: 8, streakDays: 10, createdAt: '2024-01-15', lastLogin: '2024-08-01' },
    { id: 'u2', email: 'bob@test.com', username: 'bob', role: 'Teacher', isPremium: false, isActive: true, totalXP: 800, currentLevel: 5, streakDays: 3, createdAt: '2024-03-20', lastLogin: '2024-07-28' },
    { id: 'u3', email: 'charlie@test.com', username: 'charlie', role: 'Admin', isPremium: false, isActive: false, totalXP: 200, currentLevel: 2, streakDays: 0, createdAt: '2024-05-10', lastLogin: '2024-06-15' },
  ];
}

const mockUsers = createMockUsers();

function setupMockFetch(dashboardData: AdminDashboardData = defaultDashboardData, usersData: AdminUsersPage | null = null) {
  const defaultUsersData: AdminUsersPage = usersData || { users: createMockUsers(), total: 3 };
  mockFetch.mockImplementation(async (url: string) => {
    if (url.includes('/admin/dashboard')) {
      return { ok: true, json: async () => dashboardData };
    }
    if (url.includes('/admin/users')) {
      // Deep clone to prevent mutation across tests
      const cloned: AdminUsersPage = JSON.parse(JSON.stringify(defaultUsersData));
      // Ensure page is set for pagination
      if (cloned.page === undefined) cloned.page = 1;
      return { ok: true, json: async () => cloned };
    }
    if (url.includes('/admin/quizzes')) {
      return { ok: true, json: async () => [] };
    }
    if (url.includes('/admin/audit-logs')) {
      return { ok: true, json: async () => ({ logs: [] }) };
    }
    if (url.includes('/concepts/quiz/')) {
      return { ok: true, json: async () => ({ questions: [] }) };
    }
    // AD-035: URL không thuộc allowlist → 404 (không còn catch-all ok:true nuốt URL/payload sai).
    return notFoundResponse();
  });
}

import AdminPanelView from '../AdminPanelView.vue';

let wrapper: VueWrapper | null = null;

async function mountAdminPanel(): Promise<VueWrapper> {
  setActivePinia(createPinia());
  wrapper = mount(AdminPanelView, {
    attachTo: document.body,
    global: {
      components: { BaseIcon },
      stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
    },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

async function navigateToTab(wrapper: VueWrapper, tabName: string): Promise<void> {
  const tab = wrapper.findAll('.tab-btn').find((el) => el.text().includes(tabName));
  expect(tab).toBeTruthy();
  await tab!.trigger('click');
  await nextTick();
  await flushPromises();
}

// Helper to get text from document.body (for Teleport modals)
function getBodyText(): string {
  return document.body.textContent || '';
}

// Set native input value + dispatch input event để v-model trong modal cập nhật (AD-037).
function setNativeInputValue(input: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input'));
}

// Mô phỏng global fetch wrapper trong main.ts (AU-042): request /api/v1/concepts gặp 401
// → gọi authStore.refreshAccessToken() → retry 1 lần với Bearer mới (AD-038).
async function installFetchInterceptor(underlying: FetchMock, onRetry: (newToken: string) => void): Promise<void> {
  const interceptor: FetchMock = async (input, init) => {
    let headers = new Headers(init?.headers);
    let response = await underlying(input, init);
    if (response.status === 401) {
      const newToken = await authStoreMocks.refreshAccessToken();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        onRetry(newToken);
        response = await underlying(input, { ...init, headers });
      }
    }
    return response;
  };
  vi.stubGlobal('fetch', interceptor);
}

describe('AdminPanelView — P2 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockReset();
    setupMockFetch();
    // Mock window.confirm to always return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // =============================================
  // US-ADM-003 (P2): Chart — biểu đồ cột 7 ngày
  // =============================================
  describe('US-ADM-003: Chart — Biểu đồ cột 7 ngày', () => {
    it('renders bar chart with 7 days of registration data', async () => {
      const chartData = {
        users: { total: 100, students: 70, teachers: 5, admins: 2, premium: 30 },
        quizzes: { total: 25 },
        orders: { total: 50, paid: 35 },
        topUsers: [],
        registrationsLast7Days: [
          { date: '2024-08-01', count: 5 },
          { date: '2024-08-02', count: 8 },
          { date: '2024-08-03', count: 3 },
          { date: '2024-08-04', count: 12 },
          { date: '2024-08-05', count: 7 },
          { date: '2024-08-06', count: 9 },
          { date: '2024-08-07', count: 4 },
        ],
        popularCourses: [],
      };
      setupMockFetch(chartData);

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Lượng học viên đăng ký mới (7 ngày gần nhất)');
      const svgs = w.findAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('renders correct number of bars for 7 days', async () => {
      const chartData = {
        users: { total: 50, students: 40, teachers: 3, admins: 1, premium: 15 },
        quizzes: { total: 10 },
        orders: { total: 20, paid: 15 },
        topUsers: [],
        registrationsLast7Days: [
          { date: '2024-08-01', count: 5 },
          { date: '2024-08-02', count: 8 },
          { date: '2024-08-03', count: 3 },
          { date: '2024-08-04', count: 12 },
          { date: '2024-08-05', count: 7 },
          { date: '2024-08-06', count: 9 },
          { date: '2024-08-07', count: 4 },
        ],
        popularCourses: [],
      };
      setupMockFetch(chartData);

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      const chartSection = w.find('.card--chart');
      expect(chartSection.exists()).toBe(true);
      const rects = chartSection.findAll('rect');
      // 7 bars should be rendered
      expect(rects.length).toBe(7);
    });

    it('displays count labels on chart bars', async () => {
      const chartData = {
        users: { total: 50, students: 40, teachers: 3, admins: 1, premium: 15 },
        quizzes: { total: 10 },
        orders: { total: 20, paid: 15 },
        topUsers: [],
        registrationsLast7Days: [
          { date: '2024-08-01', count: 5 },
          { date: '2024-08-02', count: 8 },
          { date: '2024-08-03', count: 3 },
        ],
        popularCourses: [],
      };
      setupMockFetch(chartData);

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('5');
      expect(w.text()).toContain('8');
      expect(w.text()).toContain('3');
    });

    it('shows empty state when no registration data', async () => {
      setupMockFetch(defaultDashboardData);

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Lượng học viên đăng ký mới (7 ngày gần nhất)');
    });
  });

  // =============================================
  // US-ADM-004 (P2): Popular courses — progress bar top courses
  // =============================================
  describe('US-ADM-004: Popular courses — Progress bar top courses', () => {
    it('renders popular courses section with progress bars', async () => {
      const data = {
        users: { total: 100, students: 70, teachers: 5, admins: 2, premium: 30 },
        quizzes: { total: 25 },
        orders: { total: 50, paid: 35 },
        topUsers: [],
        registrationsLast7Days: [],
        popularCourses: [
          { courseId: 'c1', title: 'DSA Basics', enrollmentsCount: 120 },
          { courseId: 'c2', title: 'Algorithm Mastery', enrollmentsCount: 85 },
          { courseId: 'c3', title: 'Vue 3 Deep Dive', enrollmentsCount: 60 },
        ],
      };
      setupMockFetch(data);

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Khóa học phổ biến nhất (Lượt tương tác)');
      expect(w.text()).toContain('DSA Basics');
      expect(w.text()).toContain('Algorithm Mastery');
      expect(w.text()).toContain('Vue 3 Deep Dive');
    });

    it('displays enrollment counts for each course', async () => {
      const data = {
        users: { total: 100, students: 70, teachers: 5, admins: 2, premium: 30 },
        quizzes: { total: 25 },
        orders: { total: 50, paid: 35 },
        topUsers: [],
        registrationsLast7Days: [],
        popularCourses: [
          { courseId: 'c1', title: 'DSA Basics', enrollmentsCount: 120 },
          { courseId: 'c2', title: 'Algorithm Mastery', enrollmentsCount: 85 },
        ],
      };
      setupMockFetch(data);

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('120 lượt học');
      expect(w.text()).toContain('85 lượt học');
    });

    it('shows empty state when no popular courses', async () => {
      setupMockFetch(defaultDashboardData);

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Chưa có dữ liệu khóa học tương tác');
    });

    it('renders progress bar div elements for each course', async () => {
      const data = {
        users: { total: 100, students: 70, teachers: 5, admins: 2, premium: 30 },
        quizzes: { total: 25 },
        orders: { total: 50, paid: 35 },
        topUsers: [],
        registrationsLast7Days: [],
        popularCourses: [
          { courseId: 'c1', title: 'DSA Basics', enrollmentsCount: 120 },
          { courseId: 'c2', title: 'Algorithm Mastery', enrollmentsCount: 85 },
        ],
      };
      setupMockFetch(data);

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      const courseSection = w.find('.course-stats-container');
      expect(courseSection.exists()).toBe(true);
      const progressBars = courseSection.findAll('[class*="bg-gradient-to-r"]');
      expect(progressBars.length).toBe(2);
    });
  });

  // =============================================
  // US-ADM-005 (P2): User search — input search email/username
  // =============================================
  describe('US-ADM-005: User search — Input search email/username', () => {
    it('renders search input in users tab', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const searchInput = w.find('.search-input');
      expect(searchInput.exists()).toBe(true);
      expect(searchInput.attributes('placeholder')).toContain('Tìm kiếm');
    });

    it('filters users by search query', async () => {
      const filteredUsers = {
        users: [{ id: 'u1', email: 'alice@test.com', username: 'alice', role: 'Student', isPremium: true, isActive: true, totalXP: 1500, currentLevel: 8, streakDays: 10, createdAt: '2024-01-15', lastLogin: '2024-08-01' }],
        total: 1,
      };
      setupMockFetch(defaultDashboardData, filteredUsers);

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const searchInput = w.find('.search-input');
      await searchInput.setValue('alice');
      await searchInput.trigger('input');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('alice');
      expect(w.text()).toContain('alice@test.com');
    });

    it('calls API with search parameter when typing', async () => {
      setupMockFetch(defaultDashboardData, { users: [], total: 0 });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const searchInput = w.find('.search-input');
      await searchInput.setValue('test@x.com');
      await searchInput.trigger('input');
      await flushPromises();
      await nextTick();

      // AD-060: assert URL đầy đủ + giá trị được encodeURIComponent + page=1.
      const fetchCalls = mockFetch.mock.calls as FetchCallTuple[];
      const searchCall = fetchCalls.find((call) => String(call[0]).includes('/admin/users') && String(call[0]).includes('search='));
      expect(searchCall).toBeTruthy();
      expect(String(searchCall![0])).toBe('http://localhost:5055/api/v1/concepts/admin/users?page=1&pageSize=10&search=test%40x.com');
    });

    it('AD-060: search từ trang 2 → page reset về 1 trong request', async () => {
      const manyUsers = Array.from({ length: 25 }, (_, i) => ({
        id: `u${i}`, email: `user${i}@test.com`, username: `user${i}`, role: 'Student', isPremium: false, isActive: true, totalXP: i * 100, currentLevel: i, streakDays: 0, createdAt: '2024-01-01', lastLogin: '2024-08-01',
      } as AdminUser));
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users')) {
          const page = url.includes('page=2') ? 2 : 1;
          const start = (page - 1) * 10;
          return { ok: true, json: async () => ({ users: manyUsers.slice(start, start + 10), total: 25, page }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const paginationBtns = w.findAll('.pagination-btn');
      await paginationBtns[1].trigger('click');
      await flushPromises();
      await nextTick();

      const searchInput = w.find('.search-input');
      await searchInput.setValue('alice');
      await searchInput.trigger('input');
      await flushPromises();
      await nextTick();

      const searchCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('search=alice'));
      expect(searchCall).toBeTruthy();
      expect(String(searchCall![0])).toContain('page=1&pageSize=10');
    });

    it('shows empty state when no users match search', async () => {
      setupMockFetch(defaultDashboardData, { users: [], total: 0 });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      expect(w.text()).toContain('Không tìm thấy người dùng nào');
    });
  });

  // =============================================
  // US-ADM-006 (P2): Create user — form tạo tài khoản
  // =============================================
  describe('US-ADM-006: Create user — Form tạo tài khoản', () => {
    it('opens create user modal when clicking "Tạo tài khoản" button', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const createBtn = w.find('.btn-create-user');
      expect(createBtn.exists()).toBe(true);
      await createBtn.trigger('click');
      await nextTick();
      await flushPromises();

      // Modal is teleported to body, check document.body
      expect(getBodyText()).toContain('Tạo người dùng mới');
    });

    it('renders create user form with all fields', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const createBtn = w.find('.btn-create-user');
      await createBtn.trigger('click');
      await nextTick();
      await flushPromises();

      const bodyText = getBodyText();
      expect(bodyText).toContain('Username');
      expect(bodyText).toContain('Email');
      expect(bodyText).toContain('Mật khẩu ban đầu');
      expect(bodyText).toContain('Vai trò (Role)');
      expect(bodyText).toContain('Kích hoạt tài khoản Premium');
    });

    it('submits create user form successfully', async () => {
      mockFetch.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users') && opts?.method === 'POST') {
          return { ok: true, json: async () => ({ id: 'new-id', ...JSON.parse(String(opts.body)) }) };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const createBtn = w.find('.btn-create-user');
      await createBtn.trigger('click');
      await nextTick();
      await flushPromises();

      // AD-037: query TRỰC TIẾP trong modal (không dùng if (textInputs.length > 0) nuốt lỗi),
      // tránh nhầm với .search-input type=text ngoài modal.
      const modal = document.body.querySelector('.user-modal-card') as HTMLElement;
      expect(modal).toBeTruthy();
      const usernameInput = modal.querySelector('input[type="text"]') as HTMLInputElement;
      const emailInput = modal.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = modal.querySelector('input[type="password"]') as HTMLInputElement;
      expect(usernameInput).toBeTruthy();
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();

      setNativeInputValue(usernameInput, 'newuser');
      setNativeInputValue(emailInput, 'new@test.com');
      setNativeInputValue(passwordInput, 'password123');
      await nextTick();
      await flushPromises();

      // Submit form
      const submitBtn = document.body.querySelector('.submit-btn') as HTMLElement;
      expect(submitBtn).toBeTruthy();
      submitBtn.click();
      await flushPromises();
      await nextTick();

      // AD-037: assert body POST đúng contract {username, email, password, role, isPremium}.
      const postCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/admin/users') && call[1]?.method === 'POST');
      expect(postCall).toBeTruthy();
      expect(String(postCall![0])).toBe('http://localhost:5055/api/v1/concepts/admin/users');
      const body = JSON.parse(String(postCall![1]?.body)) as Record<string, unknown>;
      expect(body).toEqual({ username: 'newuser', email: 'new@test.com', password: 'password123', role: 'Student', isPremium: false });
    });

    it('closes create user modal when clicking cancel', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const createBtn = w.find('.btn-create-user');
      await createBtn.trigger('click');
      await nextTick();
      await flushPromises();

      expect(getBodyText()).toContain('Tạo người dùng mới');

      const cancelBtn = document.body.querySelector('.btn-modal-close-secondary') as HTMLElement;
      expect(cancelBtn).toBeTruthy();
      cancelBtn.click();
      await nextTick();
      await flushPromises();

      // Modal should be closed
      expect(document.body.querySelector('.submit-btn')).toBeNull();
    });
  });

  // =============================================
  // US-ADM-007 (P2): Role change — dropdown role Student/Teacher/Admin
  // =============================================
  describe('US-ADM-007: Role change — Dropdown role Student/Teacher/Admin', () => {
    it('renders role dropdown for each user', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const selects = w.findAll('.inline-select');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('shows all role options (Student, Teacher, Admin)', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const firstSelect = w.find('.inline-select');
      const options = firstSelect.findAll('option');
      const optionTexts = options.map((o) => o.text());
      expect(optionTexts).toContain('Học viên');
      expect(optionTexts).toContain('Giảng viên');
      expect(optionTexts).toContain('Quản trị viên');
    });

    it('changes user role when selecting different option', async () => {
      const freshUsers = createMockUsers();
      mockFetch.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users') && opts?.method === 'PUT') {
          return { ok: true, json: async () => ({ success: true }) };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: JSON.parse(JSON.stringify(freshUsers)), total: 3 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const firstSelect = w.find('.inline-select');
      await firstSelect.setValue('Teacher');
      await firstSelect.trigger('change');
      await flushPromises();
      await nextTick();

      // Verify PUT was called for role change
      const putCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/role') && call[1]?.method === 'PUT');
      expect(putCall).toBeTruthy();
    });

    it('displays current role as selected value', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');
      await flushPromises();
      await nextTick();

      const selects = w.findAll('.inline-select');
      // First user is Student
      expect((selects[0].element as HTMLSelectElement).value).toBe('Student');
    });
  });

  // =============================================
  // US-ADM-008 (P2): Premium toggle — toggle premium
  // =============================================
  describe('US-ADM-008: Premium toggle — Toggle premium', () => {
    it('renders premium toggle button for each user', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const toggleBtns = w.findAll('.toggle-btn');
      expect(toggleBtns.length).toBeGreaterThan(0);
    });

    it('shows "Premium" text for premium users', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const premiumToggle = w.find('.toggle-btn--active');
      expect(premiumToggle.exists()).toBe(true);
      expect(premiumToggle.text()).toContain('Premium');
    });

    it('shows "Miễn phí" text for non-premium users', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const freeToggle = w.find('.toggle-btn--inactive');
      expect(freeToggle.exists()).toBe(true);
      expect(freeToggle.text()).toContain('Miễn phí');
    });

    it('toggles premium status when clicked', async () => {
      mockFetch.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/premium') && opts?.method === 'PUT') {
          return { ok: true, json: async () => ({ success: true }) };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      // Find the inactive toggle (bob is not premium)
      const inactiveToggle = w.find('.toggle-btn--inactive');
      await inactiveToggle.trigger('click');
      await flushPromises();
      await nextTick();

      // Verify PUT was called for premium toggle
      const putCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/premium') && call[1]?.method === 'PUT');
      expect(putCall).toBeTruthy();
    });
  });

  // =============================================
  // US-ADM-009 (P2): Level + XP — hiển thị level/XP
  // =============================================
  describe('US-ADM-009: Level + XP — Hiển thị level/XP', () => {
    it('displays user level badge', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const levelBadges = w.findAll('.level-badge');
      expect(levelBadges.length).toBeGreaterThan(0);
      expect(levelBadges[0].text()).toContain('Lv.8');
    });

    it('displays user XP value', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      expect(w.text()).toContain('1500 XP');
      expect(w.text()).toContain('800 XP');
    });

    it('shows correct level for each user', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const levelBadges = w.findAll('.level-badge');
      expect(levelBadges[0].text()).toContain('Lv.8');
      expect(levelBadges[1].text()).toContain('Lv.5');
      expect(levelBadges[2].text()).toContain('Lv.2');
    });

    it('shows correct XP for each user', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      // alice: 1500 XP, bob: 800 XP, charlie: 200 XP
      expect(w.text()).toContain('1500 XP');
      expect(w.text()).toContain('800 XP');
      expect(w.text()).toContain('200 XP');
    });
  });

  // =============================================
  // US-ADM-010 (P2): Ban/unban — toggle active
  // =============================================
  describe('US-ADM-010: Ban/unban — Toggle active', () => {
    it('renders ban/unban button for each user', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const banBtns = w.findAll('.ban-btn');
      expect(banBtns.length).toBeGreaterThan(0);
    });

    it('shows "Hoạt động" for active users', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const activeBtn = w.find('.ban-btn--active');
      expect(activeBtn.exists()).toBe(true);
      expect(activeBtn.text()).toContain('Hoạt động');
    });

    it('shows "Bị khóa" for banned users', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const bannedBtn = w.find('.ban-btn--banned');
      expect(bannedBtn.exists()).toBe(true);
      // The ban button for charlie (banned) should show "Bị khóa"
      const bannedBtns = w.findAll('.ban-btn--banned');
      const hasBannedText = bannedBtns.some((btn) => btn.text().includes('Bị khóa'));
      expect(hasBannedText).toBe(true);
    });

    it('toggles ban status when clicked', async () => {
      mockFetch.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/ban') && opts?.method === 'PUT') {
          return { ok: true, json: async () => ({ success: true }) };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      // Find active ban button (alice is active)
      const activeBtn = w.find('.ban-btn--active');
      await activeBtn.trigger('click');
      await flushPromises();
      await nextTick();

      // Verify PUT was called for ban toggle
      const putCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/ban') && call[1]?.method === 'PUT');
      expect(putCall).toBeTruthy();
    });
  });

  // =============================================
  // US-ADM-011 (P2): Reset password — nút reset
  // =============================================
  describe('US-ADM-011: Reset password — Nút reset', () => {
    it('renders reset password button for each user', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const resetBtns = w.findAll('.btn-reset-password');
      expect(resetBtns.length).toBeGreaterThan(0);
    });

    it('opens reset password modal when clicked', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const resetBtn = w.find('.btn-reset-password');
      await resetBtn.trigger('click');
      await nextTick();
      await flushPromises();

      // Modal is teleported to body
      expect(getBodyText()).toContain('Đặt lại mật khẩu');
    });

    it('shows target username in reset password modal', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const resetBtn = w.find('.btn-reset-password');
      await resetBtn.trigger('click');
      await nextTick();
      await flushPromises();

      expect(getBodyText()).toContain('alice');
    });

    it('submits reset password form', async () => {
      mockFetch.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/reset-password') && opts?.method === 'PUT') {
          return { ok: true, json: async () => ({ success: true }) };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const resetBtn = w.find('.btn-reset-password');
      await resetBtn.trigger('click');
      await nextTick();
      await flushPromises();

      // Modal is teleported - query document.body
      const passwordInput = document.body.querySelector('input[type="password"]') as HTMLInputElement;
      expect(passwordInput).toBeTruthy();
      setNativeInputValue(passwordInput, 'newpassword123');
      await nextTick();
      await flushPromises();

      // Submit
      const submitBtn = document.body.querySelector('.submit-btn') as HTMLElement;
      submitBtn.click();
      await flushPromises();
      await nextTick();

      // Verify PUT was called for reset password
      const putCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/reset-password') && call[1]?.method === 'PUT');
      expect(putCall).toBeTruthy();
    });
  });

  // =============================================
  // US-ADM-012 (P2): Impersonate — nút đóng vai
  // =============================================
  describe('US-ADM-012: Impersonate — Nút đóng vai', () => {
    it('renders impersonate button for each user', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      // Impersonate buttons have class btn-impersonate but NOT btn-reset-password
      const allImpersonateBtns = w.findAll('.btn-impersonate');
      const impersonateOnlyBtns = allImpersonateBtns.filter((btn) => !btn.classes().includes('btn-reset-password'));
      expect(impersonateOnlyBtns.length).toBeGreaterThan(0);
    });

    it('calls impersonate API when clicked', async () => {
      // AD-013t: CONTRACT MỚI — response impersonate là StatelessAuthResponse,
      // user là StatelessUserDto (currentLevel/totalXP/streakDays/badges đầy đủ).
      const impersonatedResponse = {
        accessToken: 'impersonated-token',
        refreshToken: 'impersonated-refresh',
        expiresIn: 3600,
        user: {
          id: 'u1', email: 'alice@test.com', username: 'alice',
          totalXP: 1500, currentLevel: 8, streakDays: 10,
          createdAt: '2024-01-15', badges: [], isPremium: true, role: 'Student',
        },
      };
      mockFetch.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/impersonate') && opts?.method === 'POST') {
          return { ok: true, json: async () => impersonatedResponse };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        return notFoundResponse();
      });

      // AD-036: impersonate redirect bằng window.location.href → stub location trước khi click.
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', { value: { href: '' }, writable: true, configurable: true });
      try {
        const w = await mountAdminPanel();
        await navigateToTab(w, 'Người dùng');

        // Find impersonate buttons (not reset password ones)
        const allImpersonateBtns = w.findAll('.btn-impersonate');
        const impersonateOnlyBtns = allImpersonateBtns.filter((btn) => !btn.classes().includes('btn-reset-password'));
        await impersonateOnlyBtns[0].trigger('click');
        await flushPromises();
        await nextTick();

        // Verify POST was called for impersonate
        const postCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/impersonate') && call[1]?.method === 'POST');
        expect(postCall).toBeTruthy();
        expect(String(postCall![0])).toBe('http://localhost:5055/api/v1/concepts/admin/users/u1/impersonate');
        expect(postCall![1]?.method).toBe('POST');
        const headers = postCall![1]?.headers as Record<string, string> | undefined;
        expect(headers?.Authorization).toBe('Bearer fake-admin-token');

        // AD-036: assert store được gọi — startImpersonating(userId) theo flow mới HOẶC impersonate(response)
        // theo flow hiện tại, và response đúng StatelessUserDto shape.
        const startCalls = authStoreMocks.startImpersonating.mock.calls;
        const impersonateCalls = authStoreMocks.impersonate.mock.calls;
        if (startCalls.length > 0) {
          expect(startCalls[0][0]).toBe('u1');
        } else {
          expect(impersonateCalls.length).toBeGreaterThan(0);
          const arg = impersonateCalls[0][0] as { accessToken: string; refreshToken: string; expiresIn: number; user: { currentLevel: number; totalXP: number; streakDays: number; badges: unknown[] } };
          expect(arg.accessToken).toBe('impersonated-token');
          expect(arg.user.currentLevel).toBe(8);
          expect(arg.user.totalXP).toBe(1500);
          expect(arg.user.streakDays).toBe(10);
          expect(Array.isArray(arg.user.badges)).toBe(true);
        }

        // AD-036: assert redirect về trang chủ sau khi đóng vai.
        expect(window.location.href).toBe('/');
      } finally {
        Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true });
      }
    });

    it('shows impersonate icon in button', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const allImpersonateBtns = w.findAll('.btn-impersonate');
      const impersonateOnlyBtns = allImpersonateBtns.filter((btn) => !btn.classes().includes('btn-reset-password'));
      expect(impersonateOnlyBtns.length).toBeGreaterThan(0);
      // Check that the button contains "Đóng vai" text
      const hasImpersonateText = impersonateOnlyBtns.some((btn) => btn.text().includes('Đóng vai'));
      expect(hasImpersonateText).toBe(true);
    });
  });

  // =============================================
  // US-ADM-013 (P2): Delete user — nút xóa
  // =============================================
  describe('US-ADM-013: Delete user — Nút xóa', () => {
    it('renders delete button for each user', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      // Delete buttons are ban-btn--banned with "Xóa" text
      const deleteBtns = w.findAll('.ban-btn--banned');
      const hasDelete = deleteBtns.some((btn) => btn.text().includes('Xóa'));
      expect(hasDelete).toBe(true);
    });

    it('calls delete API when clicked', async () => {
      mockFetch.mockImplementation(async (url: string, opts?: RequestInit) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users/') && opts?.method === 'DELETE') {
          return { ok: true, json: async () => ({ success: true }) };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      // Find delete buttons (ban-btn--banned with "Xóa" text)
      const deleteBtns = w.findAll('.ban-btn--banned');
      const deleteBtn = deleteBtns.find((btn) => btn.text().includes('Xóa'));
      expect(deleteBtn).toBeTruthy();
      await deleteBtn!.trigger('click');
      await flushPromises();
      await nextTick();

      // Verify DELETE was called
      const deleteCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => call[1]?.method === 'DELETE');
      expect(deleteCall).toBeTruthy();
    });

    it('shows "Xóa" text in delete button', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      expect(w.text()).toContain('Xóa');
    });
  });

  // =============================================
  // US-ADM-014 (P2): User detail modal — modal hiển thị info
  // =============================================
  describe('US-ADM-014: User detail modal — Modal hiển thị info', () => {
    it('opens user detail modal when clicking "Xem" button', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const viewBtns = w.findAll('.btn-audit-detail');
      expect(viewBtns.length).toBeGreaterThan(0);
      await viewBtns[0].trigger('click');
      await nextTick();
      await flushPromises();

      // Modal is teleported to body
      expect(getBodyText()).toContain('Tổng XP');
    });

    it('displays user info in modal (username, email, role)', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const viewBtns = w.findAll('.btn-audit-detail');
      await viewBtns[0].trigger('click');
      await nextTick();
      await flushPromises();

      const bodyText = getBodyText();
      expect(bodyText).toContain('alice');
      expect(bodyText).toContain('alice@test.com');
      expect(bodyText).toContain('Học viên');
    });

    it('shows user stats (XP, Level, Streak, Premium)', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const viewBtns = w.findAll('.btn-audit-detail');
      await viewBtns[0].trigger('click');
      await nextTick();
      await flushPromises();

      const bodyText = getBodyText();
      expect(bodyText).toContain('Tổng XP');
      expect(bodyText).toContain('Cấp độ');
      expect(bodyText).toContain('Streak');
      expect(bodyText).toContain('Gói dịch vụ');
    });

    it('shows user details (join date, last login)', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const viewBtns = w.findAll('.btn-audit-detail');
      await viewBtns[0].trigger('click');
      await nextTick();
      await flushPromises();

      const bodyText = getBodyText();
      expect(bodyText).toContain('Ngày tham gia');
      expect(bodyText).toContain('Đăng nhập gần nhất');
    });

    it('closes modal when clicking close button', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const viewBtns = w.findAll('.btn-audit-detail');
      await viewBtns[0].trigger('click');
      await nextTick();
      await flushPromises();

      expect(getBodyText()).toContain('Tổng XP');

      const closeBtn = document.body.querySelector('.user-modal-close') as HTMLElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await nextTick();
      await flushPromises();

      // Modal should be closed - user-modal-card should not exist
      expect(document.body.querySelector('.user-modal-card')).toBeNull();
    });

    it('shows avatar with first letter of username', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const viewBtns = w.findAll('.btn-audit-detail');
      await viewBtns[0].trigger('click');
      await nextTick();
      await flushPromises();

      const avatar = document.body.querySelector('.user-modal-avatar');
      expect(avatar).toBeTruthy();
      expect(avatar!.textContent).toBe('A'); // alice -> A
    });
  });

  // =============================================
  // US-ADM-015 (P2): Pagination — phân trang
  // =============================================
  describe('US-ADM-015: Pagination — Phân trang', () => {
    it('renders pagination controls', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      expect(w.find('.pagination-row').exists()).toBe(true);
      expect(w.find('.pagination-btn').exists()).toBe(true);
    });

    it('displays current page and total pages', async () => {
      const manyUsers = Array.from({ length: 25 }, (_, i) => ({
        id: `u${i}`, email: `user${i}@test.com`, username: `user${i}`, role: 'Student', isPremium: false, isActive: true, totalXP: i * 100, currentLevel: i, streakDays: 0, createdAt: '2024-01-01', lastLogin: '2024-08-01',
      }));
      setupMockFetch(defaultDashboardData, { users: manyUsers.slice(0, 10), total: 25 });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      // Pagination text format: "Trang X / Y"
      const paginationInfo = w.find('.pagination-info');
      expect(paginationInfo.exists()).toBe(true);
      expect(paginationInfo.text()).toContain('Trang');
      expect(paginationInfo.text()).toContain('/');
    });

    it('disables previous button on first page', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const paginationBtns = w.findAll('.pagination-btn');
      // First button is "Trước" (Previous) - check disabled property
      expect((paginationBtns[0].element as HTMLButtonElement).disabled).toBe(true);
    });

    it('enables next button when there are more pages', async () => {
      const manyUsers = Array.from({ length: 25 }, (_, i) => ({
        id: `u${i}`, email: `user${i}@test.com`, username: `user${i}`, role: 'Student', isPremium: false, isActive: true, totalXP: i * 100, currentLevel: i, streakDays: 0, createdAt: '2024-01-01', lastLogin: '2024-08-01',
      }));
      setupMockFetch(defaultDashboardData, { users: manyUsers.slice(0, 10), total: 25 });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const paginationBtns = w.findAll('.pagination-btn');
      // Second button is "Tiếp" (Next)
      expect((paginationBtns[1].element as HTMLButtonElement).disabled).toBe(false);
    });

    it('navigates to next page when clicking next', async () => {
      const manyUsers = Array.from({ length: 25 }, (_, i) => ({
        id: `u${i}`, email: `user${i}@test.com`, username: `user${i}`, role: 'Student', isPremium: false, isActive: true, totalXP: i * 100, currentLevel: i, streakDays: 0, createdAt: '2024-01-01', lastLogin: '2024-08-01',
      }));
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users')) {
          const page = url.includes('page=2') ? 2 : 1;
          const start = (page - 1) * 10;
          return { ok: true, json: async () => ({ users: manyUsers.slice(start, start + 10), total: 25, page }) };
        }
        return { ok: true, json: async () => ({}) };
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');

      const paginationBtns = w.findAll('.pagination-btn');
      // Click "Tiếp" (Next)
      await paginationBtns[1].trigger('click');
      await flushPromises();
      await nextTick();

      // Verify page 2 was fetched
      const page2Call = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('page=2'));
      expect(page2Call).toBeTruthy();
    });
  });

  // =============================================
  // US-ADM-016 (P2): Audit log — nhật ký quản trị
  // =============================================
  describe('US-ADM-016: Audit log — Nhật ký quản trị', () => {
    it('renders audit log tab', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Nhật ký');

      expect(w.text()).toContain('Nhật ký Hoạt động Quản trị (Admin Audit Logs)');
    });

    it('shows refresh button in audit log tab', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Nhật ký');

      // AD-059: nút Làm mới có class riêng .btn-refresh-audit.
      const refreshBtn = w.find('.btn-refresh-audit');
      expect(refreshBtn.exists()).toBe(true);
      expect(refreshBtn.text()).toContain('Làm mới');
    });

    it('renders audit logs table when data exists', async () => {
      const auditLogs = [
        { id: 'log1', action: 'CreateUser', actorId: 'admin-1', actorName: 'Super Admin', targetId: 'user-1', details: 'Tạo người dùng mới: alice', createdAt: '2024-08-01T10:00:00Z' },
        { id: 'log2', action: 'DeleteUser', actorId: 'admin-1', actorName: 'Super Admin', targetId: 'user-2', details: 'Xóa người dùng: bob', createdAt: '2024-08-01T11:00:00Z' },
        { id: 'log3', action: 'UpdateUserRole', actorId: 'admin-1', actorName: 'Super Admin', targetId: 'user-3', details: 'Đổi vai trò: charlie -> Teacher', createdAt: '2024-08-01T12:00:00Z' },
      ];
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        if (url.includes('/admin/audit-logs')) {
          return { ok: true, json: async () => ({ logs: auditLogs }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Nhật ký');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('CreateUser');
      expect(w.text()).toContain('DeleteUser');
      expect(w.text()).toContain('UpdateUserRole');
    });

    it('shows empty state when no audit logs', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        if (url.includes('/admin/audit-logs')) {
          return { ok: true, json: async () => ({ logs: [] }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Nhật ký');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Chưa ghi nhận hoạt động quản trị nào');
    });

    it('displays audit log details (actor, target, action)', async () => {
      const auditLogs = [
        { id: 'log1', action: 'ResetPassword', actorId: 'admin-1', actorName: 'Super Admin', targetId: 'user-1', details: 'Đặt lại mật khẩu cho alice', createdAt: '2024-08-01T10:00:00Z' },
      ];
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 3 }) };
        }
        if (url.includes('/admin/audit-logs')) {
          return { ok: true, json: async () => ({ logs: auditLogs }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Nhật ký');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Super Admin');
      expect(w.text()).toContain('ResetPassword');
      expect(w.text()).toContain('Đặt lại mật khẩu cho alice');
    });

    it('loads audit logs on mount', async () => {
      const w = await mountAdminPanel();
      await navigateToTab(w, 'Nhật ký');
      await flushPromises();
      await nextTick();

      // Verify audit-logs API was called
      const auditCall = (mockFetch.mock.calls as FetchCallTuple[]).find((call) => String(call[0]).includes('/admin/audit-logs'));
      expect(auditCall).toBeTruthy();
    });
  });

  // =============================================
  // AD-015: isLastAdmin — admin cuối tính TOÀN HỆ THỐNG (totalAdmins từ API),
  // không phải chỉ trên trang hiện tại (pageSize 10)
  // =============================================
  describe('AD-015: isLastAdmin — bảo vệ admin cuối toàn hệ thống', () => {
    const lastAdmin: AdminUser = {
      id: 'admin-1', email: 'root@test.com', username: 'root', role: 'Admin',
      isPremium: false, isActive: true, totalXP: 100, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', lastLogin: '2024-08-01',
    };
    const plainStudent: AdminUser = {
      id: 'stu-1', email: 'stu@test.com', username: 'stu', role: 'Student',
      isPremium: false, isActive: true, totalXP: 10, currentLevel: 1, streakDays: 0,
      createdAt: '2024-01-01', lastLogin: '2024-08-01',
    };

    it('không chặn/admin nhãn "⚠ Cuối cùng" khi hệ thống còn >1 admin (trang chỉ hiện 1 admin)', async () => {
      setupMockFetch(defaultDashboardData, { users: [lastAdmin, plainStudent], total: 12, totalAdmins: 2 });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');
      await flushPromises();

      expect(w.text()).not.toContain('⚠ Cuối cùng');
      const adminSelect = w.findAll('.inline-select')[0];
      expect((adminSelect.element as HTMLSelectElement).disabled).toBe(false);
    });

    it('chặn + nhãn "⚠ Cuối cùng" khi hệ thống chỉ còn đúng 1 admin', async () => {
      setupMockFetch(defaultDashboardData, { users: [lastAdmin, plainStudent], total: 2, totalAdmins: 1 });

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');
      await flushPromises();

      expect(w.text()).toContain('⚠ Cuối cùng');
      const adminSelect = w.findAll('.inline-select')[0];
      expect((adminSelect.element as HTMLSelectElement).disabled).toBe(true);
    });
  });

  // =============================================
  // AD-038: admin fetch 401 → refreshAccessToken → retry thành công
  // (theo global fetch wrapper main.ts AU-042 — helper của agent core)
  // =============================================
  describe('AD-038: admin fetch 401 → refresh → retry', () => {
    it('GET users 401 → gọi refreshAccessToken() 1 lần → retry với Bearer mới → render bảng', async () => {
      const retriedTokens: string[] = [];
      let usersHitCount = 0;
      const underlying: FetchMock = async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('/admin/dashboard')) {
          return { ok: true, status: 200, statusText: 'OK', json: async () => defaultDashboardData } as unknown as Response;
        }
        if (url.includes('/admin/users')) {
          usersHitCount += 1;
          if (usersHitCount === 1) {
            return { ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({ message: 'Token expired' }) } as unknown as Response;
          }
          return { ok: true, status: 200, statusText: 'OK', json: async () => ({ users: createMockUsers(), total: 3 }) } as unknown as Response;
        }
        if (url.includes('/admin/quizzes')) {
          return { ok: true, status: 200, statusText: 'OK', json: async () => [] } as unknown as Response;
        }
        if (url.includes('/admin/audit-logs')) {
          return { ok: true, status: 200, statusText: 'OK', json: async () => ({ logs: [] }) } as unknown as Response;
        }
        return notFoundResponse();
      };
      await installFetchInterceptor(underlying, (token) => retriedTokens.push(token));
      authStoreMocks.refreshAccessToken.mockResolvedValueOnce('fresh-admin-token');

      const w = await mountAdminPanel();
      await navigateToTab(w, 'Người dùng');
      await flushPromises();

      expect(authStoreMocks.refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(retriedTokens).toEqual(['fresh-admin-token']);
      expect(usersHitCount).toBe(2);
      // Retry thành công → bảng người dùng render được.
      expect(w.text()).toContain('alice');
      expect(w.text()).toContain('alice@test.com');
    });
  });
});
