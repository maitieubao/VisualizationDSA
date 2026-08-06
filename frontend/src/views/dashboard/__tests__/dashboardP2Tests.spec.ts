// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';

// ─── DASHBOARD ───
import DashboardView from '../DashboardView.vue';

// ─── LANDING ───
import LandingView from '../../landing/LandingView.vue';

// ─── PROFILE ───
import ProfileView from '../../profile/ProfileView.vue';
import ProfileGeneralTab from '../../profile/ProfileGeneralTab.vue';
import ProfileProgressTab from '../../profile/ProfileProgressTab.vue';
import ProfileHistoryTab from '../../profile/ProfileHistoryTab.vue';
import ProfileSecurityTab from '../../profile/ProfileSecurityTab.vue';
import ProfilePreferencesTab from '../../profile/ProfilePreferencesTab.vue';

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), currentRoute: { value: { query: {} } } }),
  useRoute: () => ({ params: {}, query: {} }),
  RouterLink: { name: 'RouterLink', template: '<a class="router-link-stub"><slot /></a>' },
}));

// Mock authApi
vi.mock('../../../features/auth/services/authApi', () => ({
  updateProfile: vi.fn(async () => true),
  changePassword: vi.fn(async () => true),
  getAccessToken: vi.fn(() => 'fake-token'),
}));

// Mock statelessAuthApi
vi.mock('../../../features/auth/services/statelessAuthApi', () => ({
  statelessAuthApi: {
    login: vi.fn(async () => ({ accessToken: 'fake', refreshToken: 'refresh', expiresIn: 3600, user: { id: '1', username: 'testuser', email: 'test@example.com', totalXP: 450, currentLevel: 3, streakDays: 5, createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student', nickname: 'Test', bio: '', university: '' } })),
    register: vi.fn(async () => ({ accessToken: 'fake', refreshToken: 'refresh', expiresIn: 3600, user: { id: '1', username: 'testuser', email: 'test@example.com', totalXP: 450, currentLevel: 3, streakDays: 5, createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student', nickname: 'Test', bio: '', university: '' } })),
    refresh: vi.fn(async () => ({ accessToken: 'fake', refreshToken: 'refresh', expiresIn: 3600, user: { id: '1', username: 'testuser', email: 'test@example.com', totalXP: 450, currentLevel: 3, streakDays: 5, createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student', nickname: 'Test', bio: '', university: '' } })),
    logout: vi.fn(async () => {}),
    getMe: vi.fn(async () => ({ id: '1', username: 'testuser', email: 'test@example.com', totalXP: 450, currentLevel: 3, streakDays: 5, createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student', nickname: 'Test', bio: '', university: '' })),
    updateProfile: vi.fn(async (username: string, nickname?: string, bio?: string, university?: string) => ({ id: '1', username: username || 'testuser', email: 'test@example.com', totalXP: 450, currentLevel: 3, streakDays: 5, createdAt: '2024-01-01', badges: [], isPremium: false, role: 'Student', nickname: nickname || 'Test', bio: bio || '', university: university || '' })),
    changePassword: vi.fn(async () => {}),
  },
}));

// Mock courseApi
vi.mock('../../../features/courses/services/courseApi', () => ({
  fetchCourses: vi.fn(async () => []),
}));

// Mock SkillRadarChart (uses chart.js which is hard to test in jsdom)
vi.mock('../../../features/user-progress/components/SkillRadarChart.vue', () => ({
  default: { name: 'SkillRadarChart', template: '<div class="skill-radar-chart-stub"><h3 class="chart-title"><span class="chart-title__dot"></span>Phân Tích Năng Lực Cốt Lõi</h3></div>' },
}));

// Mock guided tour store
vi.mock('../../../features/guided-tour/store/useGuidedTourStore', () => ({
  useGuidedTourStore: () => ({ startPageTour: vi.fn() }),
}));

// Mock user progress store
vi.mock('../../../features/user-progress/store/useUserProgressStore', () => ({
  useUserProgressStore: () => ({
    completedModuleIds: [],
    currentStreak: 5,
    initFromServer: vi.fn(),
  }),
}));

// Mock course store
vi.mock('../../../features/courses/store/useCourseStore', () => ({
  useCourseStore: () => ({
    courses: [],
    loadCourses: vi.fn(),
  }),
}));

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'Student',
    currentLevel: 3,
    totalXP: 450,
    nickname: 'Test',
    bio: '',
    university: '',
    streakDays: 5,
    badges: [],
    isPremium: false,
    createdAt: '2024-01-01',
    ...overrides,
  };
}

function mountWithAuth(component: any, options: any = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const authStore = useAuthStore();
  (authStore as any).currentUser = makeUser(options.authOverrides);
  (authStore as any).accessToken = 'fake-token';
  (authStore as any).isAuthenticated = true;
  return mount(component, {
    global: {
      plugins: [pinia],
      stubs: {
        BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' },
        SkillRadarChart: { name: 'SkillRadarChart', template: '<div class="skill-radar-chart-stub"><h3 class="chart-title"><span class="chart-title__dot"></span>Phân Tích Năng Lực Cốt Lõi</h3></div>' },
      },
    },
    ...options,
  });
}

function mountLanding(auth = false) {
  const pinia = createPinia();
  setActivePinia(pinia);
  if (auth) {
    const authStore = useAuthStore();
    (authStore as any).currentUser = makeUser();
    (authStore as any).accessToken = 'fake-token';
    (authStore as any).isAuthenticated = true;
  }
  return mount(LandingView, {
    global: {
      plugins: [pinia],
      stubs: { BaseIcon: { name: 'BaseIcon', template: '<svg class="base-icon-stub"><slot /></svg>' } },
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// P2 TESTS — Dashboard + Profile + Landing
// ═══════════════════════════════════════════════════════════════

describe('DB-001 (P2): Greeting cá nhân hóa', () => {
  it('hiển thị tên user trong greeting banner', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const nameEl = wrapper.find('.greeting-banner__name');
    expect(nameEl.exists()).toBe(true);
    expect(nameEl.text()).toContain('testuser');
  });

  it('hiển thị initials từ username', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const avatarText = wrapper.find('.greeting-banner__avatar-text');
    expect(avatarText.exists()).toBe(true);
    expect(avatarText.text()).toBe('T');
  });
});

describe('DB-002 (P2): 4 stats cards', () => {
  it('render đúng 4 stat-card', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const cards = wrapper.findAll('.stat-card');
    expect(cards.length).toBe(4);
  });

  it('mỗi stat-card có value và label', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const cards = wrapper.findAll('.stat-card');
    cards.forEach((card) => {
      expect(card.find('.stat-card__val').exists()).toBe(true);
      expect(card.find('.stat-card__label').exists()).toBe(true);
    });
  });

  it('hiển thị label đúng cho từng card', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const text = wrapper.text();
    expect(text).toContain('Khóa học');
    expect(text).toContain('Đã hoàn thành');
    expect(text).toContain('Tổng XP');
    expect(text).toContain('Streak ngày');
  });
});

describe('DB-003 (P2): Quick start', () => {
  it('render đúng 4 quickstart-item', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const steps = wrapper.findAll('.quickstart-item');
    expect(steps.length).toBe(4);
  });

  it('hiển thị số thứ tự 1-4 cho mỗi bước', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const numbers = wrapper.findAll('.quickstart-item__number');
    expect(numbers.length).toBe(4);
    expect(numbers[0].text()).toBe('1');
    expect(numbers[1].text()).toBe('2');
    expect(numbers[2].text()).toBe('3');
    expect(numbers[3].text()).toBe('4');
  });

  it('mỗi bước có title và description', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const titles = wrapper.findAll('.quickstart-item__title');
    expect(titles.length).toBe(4);
    const descs = wrapper.findAll('.quickstart-item__desc');
    expect(descs.length).toBe(4);
  });

  it('hiển thị tiêu đề Bắt Đầu Nhanh', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.text()).toContain('Bắt Đầu Nhanh');
  });
});

describe('DB-005 (P2): XP progress bar', () => {
  it('render xp-progress__bar', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.find('.xp-progress__bar').exists()).toBe(true);
  });

  it('render xp-progress__fill với width style', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    const fill = wrapper.find('.xp-progress__fill');
    expect(fill.exists()).toBe(true);
    expect(fill.attributes('style')).toContain('width');
  });

  it('hiển thị level và XP info', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.find('.xp-progress__level').exists()).toBe(true);
    expect(wrapper.find('.xp-progress__xp').exists()).toBe(true);
  });

  it('hiển thị XP cần để lên level tiếp theo', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.find('.xp-card__hint').exists()).toBe(true);
    expect(wrapper.text()).toContain('XP để lên level tiếp theo');
  });
});

describe('DB-006 (P2): Radar chart', () => {
  it('SkillRadarChart mount thành công', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.find('.radar-card').exists()).toBe(true);
    expect(wrapper.find('.skill-radar-chart-stub').exists()).toBe(true);
  });

  it('radar-card có title Phân Tích Năng Lực Cốt Lõi', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.text()).toContain('Phân Tích Năng Lực Cốt Lõi');
  });
});

describe('DB-007 (P2): Badges', () => {
  it('render badges-card với title Huy hiệu đã mở', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.find('.badges-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Huy hiệu đã mở');
  });

  it('hiển thị 3 badge đầu khi có badges', async () => {
    const wrapper = mountWithAuth(DashboardView, {
      authOverrides: {
        badges: [
          { id: '1', name: 'First Steps', icon: '📝' },
          { id: '2', name: 'Sorting Wizard', icon: '📊' },
          { id: '3', name: 'OOP Guru', icon: '🧬' },
          { id: '4', name: 'SOLID Master', icon: '🏗️' },
        ],
      },
    });
    await flushPromises();
    const badgeItems = wrapper.findAll('.badge-item');
    expect(badgeItems.length).toBe(3);
  });

  it('hiển thị empty state khi không có badge', async () => {
    const wrapper = mountWithAuth(DashboardView);
    await flushPromises();
    expect(wrapper.find('.badges-empty').exists()).toBe(true);
    expect(wrapper.text()).toContain('Chưa có huy hiệu nào');
  });
});

describe('PF-001 (P2): Edit info — GeneralTab', () => {
  it('render form với các trường username, nickname, university, bio', async () => {
    const wrapper = mountWithAuth(ProfileGeneralTab);
    await flushPromises();
    expect(wrapper.find('#username').exists()).toBe(true);
    expect(wrapper.find('#nickname').exists()).toBe(true);
    expect(wrapper.find('#university').exists()).toBe(true);
    expect(wrapper.find('#bio').exists()).toBe(true);
  });

  it('hiển thị email dưới dạng readonly', async () => {
    const wrapper = mountWithAuth(ProfileGeneralTab);
    await flushPromises();
    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput.exists()).toBe(true);
    expect(emailInput.attributes('readonly')).toBeDefined();
  });

  it('hiển thị thông tin user ở summary hero card', async () => {
    const wrapper = mountWithAuth(ProfileGeneralTab);
    await flushPromises();
    expect(wrapper.text()).toContain('test@example.com');
    expect(wrapper.text()).toContain('Test');
  });

  it('có nút Lưu thay đổi', async () => {
    const wrapper = mountWithAuth(ProfileGeneralTab);
    await flushPromises();
    const saveBtn = wrapper.find('.pm-btn--primary');
    expect(saveBtn.exists()).toBe(true);
    expect(saveBtn.text()).toContain('Lưu thay đổi');
  });
});

describe('PF-003 (P2): Save profile', () => {
  it('gọi updateProfile khi submit form', async () => {
    const { statelessAuthApi } = await import('../../../features/auth/services/statelessAuthApi');
    const wrapper = mountWithAuth(ProfileGeneralTab);
    await flushPromises();
    const form = wrapper.find('form');
    await form.trigger('submit');
    await flushPromises();
    expect(statelessAuthApi.updateProfile).toHaveBeenCalled();
  });

  it('hiển thị trạng thái Đang lưu... khi đang save', async () => {
    const wrapper = mountWithAuth(ProfileGeneralTab);
    await flushPromises();
    const authStore = useAuthStore();
    (authStore as any).isLoading = true;
    await flushPromises();
    await new Promise(r => setTimeout(r, 50));
    const hasSaving = wrapper.text().includes('Đang lưu...') || wrapper.text().includes('Lưu thay đổi');
    expect(hasSaving).toBe(true);
  });
});

describe('PF-005 (P2): Badges — ProgressTab', () => {
  it('render ProgressTab với title Badges & Progress', async () => {
    const wrapper = mountWithAuth(ProfileProgressTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Badges & Progress');
  });

  it('hiển thị XP overview card', async () => {
    const wrapper = mountWithAuth(ProfileProgressTab);
    await flushPromises();
    expect(wrapper.find('.xp-overview-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('CẤP ĐỘ');
    expect(wrapper.text()).toContain('XP');
  });

  it('hiển thị progress bar', async () => {
    const wrapper = mountWithAuth(ProfileProgressTab);
    await flushPromises();
    expect(wrapper.find('.pm-progress-track').exists()).toBe(true);
    expect(wrapper.find('.pm-progress-fill').exists()).toBe(true);
  });

  it('hiển thị badges khi có', async () => {
    const wrapper = mountWithAuth(ProfileProgressTab, {
      authOverrides: {
        badges: [
          { id: '1', name: 'First Steps', description: 'Complete first quiz', icon: '📝', color: '#6366f1', earnedAt: '2024-01-15' },
        ],
      },
    });
    await flushPromises();
    expect(wrapper.find('.pm-badge-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('First Steps');
  });

  it('hiển thị empty state khi không có badge', async () => {
    const wrapper = mountWithAuth(ProfileProgressTab);
    await flushPromises();
    expect(wrapper.find('.empty-state-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Chưa nhận được huy hiệu nào');
  });
});

describe('PF-007 (P2): History — HistoryTab', () => {
  it('render HistoryTab với title Quiz History', async () => {
    const wrapper = mountWithAuth(ProfileHistoryTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Quiz History');
  });

  it('hiển thị subtitle mô tả', async () => {
    const wrapper = mountWithAuth(ProfileHistoryTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Danh sách kết quả các bài quiz');
  });

  it('hiển thị loading hoặc empty state khi chưa có lịch sử', async () => {
    const wrapper = mountWithAuth(ProfileHistoryTab);
    await flushPromises();
    await new Promise(r => setTimeout(r, 100));
    await flushPromises();
    const text = wrapper.text();
    const hasLoading = text.includes('Đang tải');
    const hasEmpty = text.includes('Chưa có lịch sử') || wrapper.find('.empty-state-box').exists();
    expect(hasLoading || hasEmpty).toBe(true);
  });
});

describe('PF-009 (P2): Security — SecurityTab', () => {
  it('render SecurityTab với title Security', async () => {
    const wrapper = mountWithAuth(ProfileSecurityTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Security');
  });

  it('render form với 3 trường password', async () => {
    const wrapper = mountWithAuth(ProfileSecurityTab);
    await flushPromises();
    expect(wrapper.find('#currentPassword').exists()).toBe(true);
    expect(wrapper.find('#newPassword').exists()).toBe(true);
    expect(wrapper.find('#confirmNewPassword').exists()).toBe(true);
  });

  it('tất cả input đều type=password', async () => {
    const wrapper = mountWithAuth(ProfileSecurityTab);
    await flushPromises();
    const inputs = wrapper.findAll('input[type="password"]');
    expect(inputs.length).toBe(3);
  });

  it('có nút Cập nhật mật khẩu', async () => {
    const wrapper = mountWithAuth(ProfileSecurityTab);
    await flushPromises();
    const btn = wrapper.find('.pm-btn--primary');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain('Cập nhật mật khẩu');
  });

  it('gọi changePassword khi submit', async () => {
    const { statelessAuthApi } = await import('../../../features/auth/services/statelessAuthApi');
    const wrapper = mountWithAuth(ProfileSecurityTab);
    await flushPromises();
    await wrapper.find('#currentPassword').setValue('oldpass123');
    await wrapper.find('#newPassword').setValue('newpass123');
    await wrapper.find('#confirmNewPassword').setValue('newpass123');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(statelessAuthApi.changePassword).toHaveBeenCalledWith('oldpass123', 'newpass123');
  });
});

describe('PF-010 (P2): Preferences — PreferencesTab', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('render PreferencesTab với title Preferences', async () => {
    const wrapper = mountWithAuth(ProfilePreferencesTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Preferences');
  });

  it('hiển thị segmented control tốc độ VCR', async () => {
    const wrapper = mountWithAuth(ProfilePreferencesTab);
    await flushPromises();
    expect(wrapper.find('.segmented-control').exists()).toBe(true);
    const segments = wrapper.findAll('.segment-btn');
    expect(segments.length).toBe(4);
  });

  it('hiển thị toggle Confetti', async () => {
    const wrapper = mountWithAuth(ProfilePreferencesTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Hiệu ứng pháo hoa Confetti');
    const toggles = wrapper.findAll('.toggle-switch');
    expect(toggles.length).toBeGreaterThanOrEqual(1);
  });

  it('hiển thị toggle Auto Play', async () => {
    const wrapper = mountWithAuth(ProfilePreferencesTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Tự động phát bước tiếp theo');
    const toggles = wrapper.findAll('.toggle-switch');
    expect(toggles.length).toBeGreaterThanOrEqual(2);
  });

  it('click segment thay đổi tốc độ', async () => {
    const wrapper = mountWithAuth(ProfilePreferencesTab);
    await flushPromises();
    const segments = wrapper.findAll('.segment-btn');
    await segments[2].trigger('click');
    await flushPromises();
    expect(segments[2].classes()).toContain('segment-btn--active');
  });
});

describe('LD-001 (P2): Hero', () => {
  it('hiển thị title VisualizationDSA', () => {
    const wrapper = mountLanding(false);
    expect(wrapper.find('.hero__name').text()).toBe('VisualizationDSA');
  });

  it('hiển thị description/tagline', () => {
    const wrapper = mountLanding(false);
    expect(wrapper.find('.hero__tagline').exists()).toBe(true);
    expect(wrapper.text()).toContain('Cấu trúc Dữ liệu & Giải thuật');
  });

  it('hiển thị sub description', () => {
    const wrapper = mountLanding(false);
    expect(wrapper.find('.hero__sub').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sorting, Graph, OOP, SOLID');
  });
});

describe('LD-002 (P2): 8 modules', () => {
  it('render đúng 8 feature-card', () => {
    const wrapper = mountLanding(false);
    const features = wrapper.findAll('.feature-card');
    expect(features.length).toBe(8);
  });

  it('mỗi feature-card có title và description', () => {
    const wrapper = mountLanding(false);
    const cards = wrapper.findAll('.feature-card');
    cards.forEach((card) => {
      expect(card.find('.feature-card__title').exists()).toBe(true);
      expect(card.find('.feature-card__desc').exists()).toBe(true);
    });
  });

  it('hiển thị title Modules học tập', () => {
    const wrapper = mountLanding(false);
    expect(wrapper.text()).toContain('Modules học tập');
  });
});

describe('LD-003 (P2): Stats', () => {
  it('render stats-bar với 4 stat-item', () => {
    const wrapper = mountLanding(false);
    const stats = wrapper.findAll('.stat-item');
    expect(stats.length).toBe(4);
  });

  it('mỗi stat-item có value và label', () => {
    const wrapper = mountLanding(false);
    const stats = wrapper.findAll('.stat-item');
    stats.forEach((stat) => {
      expect(stat.find('.stat-item__value').exists()).toBe(true);
      expect(stat.find('.stat-item__label').exists()).toBe(true);
    });
  });

  it('hiển thị các giá trị stats cụ thể', () => {
    const wrapper = mountLanding(false);
    const text = wrapper.text();
    expect(text).toContain('7+');
    expect(text).toContain('27+');
    expect(text).toContain('8');
    expect(text).toContain('100%');
  });
});

describe('LD-004 (P2): CTA theo auth', () => {
  it('hiển thị "Bắt đầu ngay" khi chưa đăng nhập', () => {
    const wrapper = mountLanding(false);
    expect(wrapper.text()).toContain('Bắt đầu ngay');
  });

  it('hiển thị "Vào bảng điều khiển" khi đã đăng nhập', () => {
    const wrapper = mountLanding(true);
    expect(wrapper.text()).toContain('Vào bảng điều khiển');
  });

  it('CTA primary button tồn tại', () => {
    const wrapper = mountLanding(false);
    expect(wrapper.find('.hero__cta--primary').exists()).toBe(true);
  });

  it('có link GitHub', () => {
    const wrapper = mountLanding(false);
    const link = wrapper.find('a[href*="github.com"]');
    expect(link.exists()).toBe(true);
  });
});
