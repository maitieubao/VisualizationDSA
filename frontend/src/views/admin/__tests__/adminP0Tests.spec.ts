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

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    getAccessToken: () => 'fake-admin-token',
    impersonate: vi.fn(),
  }),
}));

vi.mock('./useAdminApi', () => ({
  useAdminApi: () => ({
    BASE_URL: 'http://localhost:5055',
    authStore: { getAccessToken: () => 'fake-admin-token', impersonate: vi.fn() },
    auditLogs: { value: [
      { time: '15:20:04', type: 'INFO', message: 'Hệ thống Admin khởi động hoàn tất.' },
      { time: '15:20:08', type: 'INFO', message: 'Đã kết nối cơ sở dữ liệu PostgreSQL.' },
    ]},
    getAuthHeaders: () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer fake-admin-token' }),
    pushLog: vi.fn(),
    getDifficultyLabel: (d: string) => d === 'easy' ? 'Dễ' : d === 'hard' ? 'Khó' : 'Trung bình',
  }),
}));

type FetchCallTuple = [input: RequestInfo | URL, init?: RequestInit];
const mockFetch = vi.fn();
global.fetch = mockFetch;

interface AdminTopUser { email: string; username: string; totalXP: number; currentLevel: number; role: string; }
interface AdminDashboardData {
  users: { total: number; students: number; teachers: number; admins: number; premium: number };
  quizzes: { total: number };
  orders: { total: number; paid: number };
  topUsers: AdminTopUser[];
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

function setupMockFetch(dashboardData: AdminDashboardData = defaultDashboardData) {
  mockFetch.mockImplementation(async (url: string) => {
    if (url.includes('/admin/dashboard')) {
      return { ok: true, json: async () => dashboardData };
    }
    if (url.includes('/admin/users')) {
      return { ok: true, json: async () => ({ users: [], total: 0 }) };
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
    // AD-035: URL không thuộc allowlist → trả 404 (thay vì ok:true để không nuốt lỗi URL/payload sai).
    return notFoundResponse();
  });
}

// AD-035: allowlist endpoint hợp lệ của Admin Panel — mọi fetch phải nằm trong tập này.
const ADMIN_ALLOWED_URL_PARTS: readonly string[] = [
  '/api/v1/concepts/admin/dashboard',
  '/api/v1/concepts/admin/users',
  '/api/v1/concepts/admin/quizzes',
  '/api/v1/concepts/admin/audit-logs',
  '/api/v1/concepts/quiz/',
  '/health',
  '/api/v1/diagnostics/health',
];

// AD-013t: shape DashboardAuditLog từ GET /admin/audit-logs (dashboard + audit tab dùng chung).
interface DashboardAuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  targetId: string | null;
  details: string;
  createdAt: string;
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

describe('AdminPanelView — P0 Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockFetch.mockReset();
    setupMockFetch();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  describe('Tab Navigation', () => {
    it('renders all admin panel tabs', async () => {
      const w = await mountAdminPanel();
      const tabTexts = w.findAll('.tab-btn').map((el) => el.text());
      expect(tabTexts).toContain('Tổng quan');
      expect(tabTexts).toContain('Người dùng');
      expect(tabTexts).toContain('Quản lý Quiz');
      expect(tabTexts).toContain('Hệ thống');
      expect(tabTexts).toContain('Nhật ký Quản trị');
    });

    it('defaults to "dashboard" tab on mount', async () => {
      setupMockFetch({
        users: { total: 100, students: 70, teachers: 5, admins: 2, premium: 30 },
        quizzes: { total: 25 },
        orders: { total: 50, paid: 35 },
        topUsers: [],
        registrationsLast7Days: [],
        popularCourses: [],
      });

      const w = await mountAdminPanel();
      expect(w.text()).toContain('Tổng Người dùng');
    });

    it('switches to "users" tab when clicked', async () => {
      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      expect(usersTab).toBeTruthy();
      await usersTab!.trigger('click');
      await nextTick();
      await flushPromises();
      expect(w.text()).toContain('Quản lý Thành viên & Quyền hạn');
    });

    it('switches to "quizzes" tab when clicked', async () => {
      const w = await mountAdminPanel();
      const quizzesTab = w.findAll('.tab-btn').find((el) => el.text().includes('Quản lý Quiz'));
      expect(quizzesTab).toBeTruthy();
      await quizzesTab!.trigger('click');
      await nextTick();
      await flushPromises();
      expect(w.text()).toContain('Ngân hàng Quiz hiện có');
    });

    it('switches to "system" tab when clicked', async () => {
      const w = await mountAdminPanel();
      const systemTab = w.findAll('.tab-btn').find((el) => el.text().includes('Hệ thống'));
      expect(systemTab).toBeTruthy();
      await systemTab!.trigger('click');
      await nextTick();
      expect(w.text()).toContain('Thông tin Máy chủ & API');
    });

    it('switches to "audit" tab when clicked', async () => {
      const w = await mountAdminPanel();
      const auditTab = w.findAll('.tab-btn').find((el) => el.text().includes('Nhật ký'));
      expect(auditTab).toBeTruthy();
      await auditTab!.trigger('click');
      await nextTick();
      expect(w.text()).toContain('Nhật ký Hoạt động Quản trị');
    });
  });

  describe('Dashboard Stats', () => {
    it('displays dashboard stats with data from API', async () => {
      setupMockFetch({
        users: { total: 150, students: 100, teachers: 8, admins: 3, premium: 45 },
        quizzes: { total: 42 },
        orders: { total: 60, paid: 48 },
        topUsers: [
          { email: 'top@test.com', username: 'topUser', totalXP: 5000, currentLevel: 15, role: 'Student' },
        ],
        registrationsLast7Days: [
          { date: '2024-08-01', count: 5 },
          { date: '2024-08-02', count: 8 },
        ],
        popularCourses: [
          { courseId: 'c1', title: 'DSA Basics', enrollmentsCount: 120 },
        ],
      });

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      const statTexts = w.findAll('.stat-card__val').map((el) => el.text());
      expect(statTexts[0]).toContain('150');
      expect(statTexts[1]).toContain('45');
      expect(statTexts[2]).toContain('42');
    });

    it('renders chart SVG for registrations', async () => {
      setupMockFetch({
        users: { total: 0, students: 0, teachers: 0, admins: 0, premium: 0 },
        quizzes: { total: 0 },
        orders: { total: 0, paid: 0 },
        topUsers: [],
        registrationsLast7Days: [
          { date: '2024-08-01', count: 3 },
          { date: '2024-08-02', count: 7 },
          { date: '2024-08-03', count: 2 },
        ],
        popularCourses: [],
      });

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      const svgs = w.findAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('renders top users table', async () => {
      setupMockFetch({
        users: { total: 100, students: 80, teachers: 5, admins: 2, premium: 30 },
        quizzes: { total: 30 },
        orders: { total: 40, paid: 30 },
        topUsers: [
          { email: 'user1@test.com', username: 'alice', totalXP: 3000, currentLevel: 10, role: 'Student' },
          { email: 'user2@test.com', username: 'bob', totalXP: 2500, currentLevel: 8, role: 'Student' },
          { email: 'user3@test.com', username: 'charlie', totalXP: 2000, currentLevel: 7, role: 'Teacher' },
        ],
        registrationsLast7Days: [],
        popularCourses: [],
      });

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Top 5 Học viên tích cực nhất');
      expect(w.text()).toContain('alice');
      expect(w.text()).toContain('bob');
      expect(w.text()).toContain('charlie');
    });

    it('renders audit logs in dashboard', async () => {
      const systemLogs: DashboardAuditLog[] = [
        { id: 'log1', action: 'CreateUser', actorId: 'admin-1', actorName: 'Super Admin', targetId: 'user-1', details: 'Hệ thống Admin khởi động hoàn tất', createdAt: '2024-08-01T10:00:00Z' },
        { id: 'log2', action: 'TogglePremium', actorId: 'admin-1', actorName: 'Super Admin', targetId: 'user-2', details: 'Đã kết nối cơ sở dữ liệu PostgreSQL', createdAt: '2024-08-01T10:01:00Z' },
      ];
      setupMockFetch({
        users: { total: 50, students: 40, teachers: 3, admins: 1, premium: 15 },
        quizzes: { total: 20 },
        orders: { total: 25, paid: 20 },
        topUsers: [],
        registrationsLast7Days: [],
        popularCourses: [],
      });
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => ({
            users: { total: 50, students: 40, teachers: 3, admins: 1, premium: 15 },
            quizzes: { total: 20 },
            orders: { total: 25, paid: 20 },
            topUsers: [],
            registrationsLast7Days: [],
            popularCourses: [],
          }) };
        }
        if (url.includes('/admin/audit-logs')) {
          return { ok: true, json: async () => ({ logs: systemLogs }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Nhật ký hệ thống mới nhất');
      expect(w.text()).toContain('Hệ thống Admin khởi động hoàn tất');
      expect(w.text()).toContain('Đã kết nối cơ sở dữ liệu PostgreSQL');
    });
  });

  describe('User Management', () => {
    const mockUsers = [
      { id: 'u1', email: 'user1@test.com', username: 'alice', role: 'Student', isPremium: true, isActive: true, totalXP: 1500, currentLevel: 8, streakDays: 10, createdAt: '2024-01-15', lastLogin: '2024-08-01' },
      { id: 'u2', email: 'user2@test.com', username: 'bob', role: 'Teacher', isPremium: false, isActive: true, totalXP: 800, currentLevel: 5, streakDays: 3, createdAt: '2024-03-20', lastLogin: '2024-07-28' },
    ];

    beforeEach(() => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: mockUsers, total: 2 }) };
        }
        if (url.includes('/admin/quizzes')) {
          return { ok: true, json: async () => [] };
        }
        if (url.includes('/admin/audit-logs')) {
          return { ok: true, json: async () => ({ logs: [] }) };
        }
        return notFoundResponse();
      });
    });

    it('renders user management table', async () => {
      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      await usersTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('alice');
      expect(w.text()).toContain('bob');
      expect(w.text()).toContain('user1@test.com');
    });

    it('shows search input for filtering users', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: [], total: 0 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      await usersTab!.trigger('click');
      await nextTick();
      await flushPromises();

      const searchInput = w.find('.search-input');
      expect(searchInput).toBeTruthy();
    });

    it('renders "Tạo tài khoản" button', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/users')) {
          return { ok: true, json: async () => ({ users: [], total: 0 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      await usersTab!.trigger('click');
      await nextTick();
      await flushPromises();

      const createBtn = w.find('.btn-create-user');
      expect(createBtn).toBeTruthy();
      expect(createBtn.text()).toContain('Tạo tài khoản');
    });

    it('shows role dropdown for each user', async () => {
      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      await usersTab!.trigger('click');
      await flushPromises();
      await nextTick();

      const selects = w.findAll('.inline-select');
      expect(selects.length).toBe(2);
    });

    it('shows ban button for each user', async () => {
      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      await usersTab!.trigger('click');
      await flushPromises();
      await nextTick();

      const banBtns = w.findAll('.ban-btn');
      expect(banBtns.length).toBeGreaterThan(0);
    });

    it('shows impersonate button for each user', async () => {
      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      await usersTab!.trigger('click');
      await flushPromises();
      await nextTick();

      const impersonateBtns = w.findAll('.btn-impersonate');
      expect(impersonateBtns.length).toBeGreaterThan(0);
    });

    it('shows delete button for each user', async () => {
      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      await usersTab!.trigger('click');
      await flushPromises();
      await nextTick();

      const deleteBtns = w.findAll('.ban-btn--banned');
      expect(deleteBtns.length).toBeGreaterThan(0);
    });

    it('shows user detail modal when "Xem" is clicked', async () => {
      const w = await mountAdminPanel();
      const usersTab = w.findAll('.tab-btn').find((el) => el.text().includes('Người dùng'));
      await usersTab!.trigger('click');
      await flushPromises();
      await nextTick();

      const auditDetailBtns = w.findAll('.btn-audit-detail');
      await auditDetailBtns[0].trigger('click');
      await nextTick();
      await flushPromises();

      const bodyText = document.body.textContent || '';
      expect(bodyText).toContain('Tổng XP');
      expect(bodyText).toContain('Cấp độ');
      expect(bodyText).toContain('Streak');
    });
  });

  describe('Quiz Management', () => {
    const mockQuizzes = [
      { id: 'q1', title: 'Sorting Basics', topic: 'sorting', difficulty: 'easy', xpReward: 50, questionCount: 10, createdAt: '2024-01-01' },
      { id: 'q2', title: 'Graph Traversal', topic: 'graph', difficulty: 'hard', xpReward: 100, questionCount: 15, createdAt: '2024-02-01' },
    ];

    beforeEach(() => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/quizzes')) {
          return { ok: true, json: async () => mockQuizzes };
        }
        if (url.includes('/concepts/quiz/')) {
          return { ok: true, json: async () => ({ questions: [{ text: 'What is BFS?', options: ['A','B','C','D'], correctIndex: 0, explanation: 'Breadth-first search' }] }) };
        }
        return notFoundResponse();
      });
    });

    it('renders quizzes list', async () => {
      const w = await mountAdminPanel();
      const quizzesTab = w.findAll('.tab-btn').find((el) => el.text().includes('Quản lý Quiz'));
      await quizzesTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Sorting Basics');
      expect(w.text()).toContain('Graph Traversal');
    });

    it('shows quiz details when expanded', async () => {
      const w = await mountAdminPanel();
      const quizzesTab = w.findAll('.tab-btn').find((el) => el.text().includes('Quản lý Quiz'));
      await quizzesTab!.trigger('click');
      await flushPromises();
      await nextTick();

      const quizRows = w.findAll('.quiz-row');
      await quizRows[0].trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('What is BFS?');
    });

    it('shows delete button for each quiz', async () => {
      const w = await mountAdminPanel();
      const quizzesTab = w.findAll('.tab-btn').find((el) => el.text().includes('Quản lý Quiz'));
      await quizzesTab!.trigger('click');
      await flushPromises();
      await nextTick();

      const deleteBtns = w.findAll('.btn-delete');
      expect(deleteBtns.length).toBe(2);
    });
  });

  describe('AD-035: URL allowlist — mọi request phải thuộc endpoint Admin Panel', () => {
    it('đi qua toàn bộ tab chỉ gọi endpoint thuộc allowlist (không gọi URL lạ)', async () => {
      const w = await mountAdminPanel();
      const tabNames = ['Người dùng', 'Quản lý Quiz', 'Hệ thống', 'Nhật ký Quản trị'];
      for (const name of tabNames) {
        const tab = w.findAll('.tab-btn').find((el) => el.text().includes(name));
        expect(tab, `Không tìm thấy tab "${name}"`).toBeTruthy();
        await tab!.trigger('click');
        await flushPromises();
        await nextTick();
      }

      const calls = (mockFetch.mock.calls as FetchCallTuple[]).map((call) => String(call[0]));
      expect(calls.length).toBeGreaterThan(0);
      for (const url of calls) {
        const isAllowed = ADMIN_ALLOWED_URL_PARTS.some((part) => url.includes(part));
        expect(isAllowed, `Request tới endpoint ngoài allowlist: ${url}`).toBe(true);
      }
    });

    it('URL không thuộc allowlist bị mock từ chối (ok:false) — không nuốt payload sai', async () => {
      const res = await mockFetch('http://localhost:5055/api/v1/concepts/admin/does-not-exist', {});
      expect(res.ok).toBe(false);
      expect(res.status).toBe(404);
    });
  });

  describe('System Status + Audit Log', () => {
    it('renders system status info', async () => {
      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/api/v1/diagnostics/health')) {
          return { ok: true, json: async () => ({ success: true, environment: 'Development' }) };
        }
        if (url.includes('/health')) {
          return { ok: true, json: async () => ({ status: 'Healthy', checks: [{ name: 'database', latency: 25 }], totalDuration: 30 }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      const systemTab = w.findAll('.tab-btn').find((el) => el.text().includes('Hệ thống'));
      await systemTab!.trigger('click');
      await nextTick();
      await flushPromises();

      expect(w.text()).toContain('API Base URL');
      expect(w.text()).toContain('Trạng thái kết nối CSDL');
      expect(w.text()).toContain('Đang kết nối (PostgreSQL)');
      expect(w.text()).toContain('Development');
    });

    it('renders system settings toggles', async () => {
      const w = await mountAdminPanel();
      const systemTab = w.findAll('.tab-btn').find((el) => el.text().includes('Hệ thống'));
      await systemTab!.trigger('click');
      await nextTick();

      expect(w.text()).toContain('Cho phép Đăng ký tài khoản');
      expect(w.text()).toContain('Bảo trì Timeline VCR');
    });

    it('renders "Chạy chẩn đoán hệ thống" button', async () => {
      const w = await mountAdminPanel();
      const systemTab = w.findAll('.tab-btn').find((el) => el.text().includes('Hệ thống'));
      await systemTab!.trigger('click');
      await nextTick();

      const diagBtn = w.find('.btn-primary');
      expect(diagBtn).toBeTruthy();
      expect(diagBtn.text()).toContain('Chạy chẩn đoán hệ thống');
    });

    it('renders audit logs tab with table headers', async () => {
      const mockLogs = [
        { id: 'log1', action: 'CreateUser', actorId: 'admin-1', actorName: 'SuperAdmin', targetId: 'user-99', details: 'Created new user', createdAt: '2024-08-01T10:30:00Z' },
      ];

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/audit-logs')) {
          return { ok: true, json: async () => ({ logs: mockLogs }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      const auditTab = w.findAll('.tab-btn').find((el) => el.text().includes('Nhật ký'));
      await auditTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Thời gian');
      expect(w.text()).toContain('Hành động');
      expect(w.text()).toContain('Quản trị viên');
      expect(w.text()).toContain('Đối tượng tác động');
    });

    it('renders audit log data', async () => {
      const mockLogs = [
        { id: 'log1', action: 'CreateUser', actorId: 'admin-abc123', actorName: 'SuperAdmin', targetId: 'user-xyz789', details: 'Created new user account', createdAt: '2024-08-01T10:30:00Z' },
        { id: 'log2', action: 'DeleteUser', actorId: 'admin-abc123', actorName: 'SuperAdmin', targetId: 'user-old456', details: 'Deleted inactive user', createdAt: '2024-08-02T14:20:00Z' },
      ];

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/admin/dashboard')) {
          return { ok: true, json: async () => defaultDashboardData };
        }
        if (url.includes('/admin/audit-logs')) {
          return { ok: true, json: async () => ({ logs: mockLogs }) };
        }
        return notFoundResponse();
      });

      const w = await mountAdminPanel();
      const auditTab = w.findAll('.tab-btn').find((el) => el.text().includes('Nhật ký'));
      await auditTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('SuperAdmin');
      expect(w.text()).toContain('CreateUser');
      expect(w.text()).toContain('DeleteUser');
    });

    it('renders "Làm mới" button in audit tab', async () => {
      const w = await mountAdminPanel();
      const auditTab = w.findAll('.tab-btn').find((el) => el.text().includes('Nhật ký'));
      await auditTab!.trigger('click');
      await nextTick();
      await flushPromises();

      // AD-059: nút Làm mới dùng class riêng .btn-refresh-audit (không dùng chung .btn-create-user).
      const refreshBtn = w.find('.btn-refresh-audit');
      expect(refreshBtn).toBeTruthy();
      expect(refreshBtn.text()).toContain('Làm mới');
    });

    it('shows empty state when no audit logs', async () => {
      const w = await mountAdminPanel();
      const auditTab = w.findAll('.tab-btn').find((el) => el.text().includes('Nhật ký'));
      await auditTab!.trigger('click');
      await flushPromises();
      await nextTick();

      expect(w.text()).toContain('Chưa ghi nhận hoạt động quản trị nào');
    });
  });
});
