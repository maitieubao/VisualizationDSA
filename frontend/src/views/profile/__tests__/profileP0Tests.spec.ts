// @vitest-environment jsdom
//
// Phạm vi test: CÁC TAB PROFILE (component-only, auth store 100% mock).
// PR-022: vi.mock(authApi/statelessAuthApi) là MOCK CHẾT (mọi API đều đi qua
// useAuthStore đã mock; component không import authApi trực tiếp) — đã xóa.
// ProfileView (modal + tabs) → profileViewP1Tests.spec.ts (PR-007).
// Logic handleChangePassword → profileSecurityTabTests.spec.ts (PR-008).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises, config, type VueWrapper } from '@vue/test-utils';
import { reactive } from 'vue';

const toastStoreMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}));

const updateProfileMock = vi.fn(async (username: string, nickname?: string, bio?: string, university?: string) => {
  const current = authStoreMock.currentUser;
  if (!current) return null;
  const updated = { ...current, username, nickname: nickname ?? '', bio: bio ?? '', university: university ?? '' };
  authStoreMock.currentUser = updated;
  return updated;
});

const changePasswordMock = vi.fn(async (_current: string, _new: string) => {
  return;
});

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
  updateProfile: updateProfileMock,
  changePassword: changePasswordMock,
  loadStatelessProfile: vi.fn(async () => {}),
});

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => authStoreMock),
}));

vi.mock('../../../composables/useToast', () => ({
  useToastStore: vi.fn(() => toastStoreMock),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
}));

// BaseIcon được đăng ký GLOBAL ở main.ts (app.component) — component con không import
// nên vi.mock(module) là MOCK CHẾT (PR-022). Dùng config.global.stubs theo pattern
// uiP2Tests/toastP0Tests (global: components/stubs) để render stub thật khi mount.
const BaseIconStub = {
  name: 'BaseIcon',
  props: ['name', 'class'],
  template: '<svg class="base-icon-mock"><title>{{ name }}</title></svg>',
};

config.global.stubs = {
  BaseIcon: BaseIconStub,
  RouterLink: { name: 'RouterLinkStub', template: '<a class="router-link-stub"><slot /></a>' },
};

import ProfileGeneralTab from '../ProfileGeneralTab.vue';
import ProfileProgressTab from '../ProfileProgressTab.vue';
import ProfileHistoryTab from '../ProfileHistoryTab.vue';
import ProfileSecurityTab from '../ProfileSecurityTab.vue';
import ProfilePreferencesTab from '../ProfilePreferencesTab.vue';
import ProfileAboutTab from '../ProfileAboutTab.vue';

interface QuizAttempt {
  id: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attemptedAt: string;
}

const attemptsFixture: QuizAttempt[] = [
  { id: 'a1', quizTitle: 'Mảng cơ bản', score: 8, maxScore: 10, passed: true, attemptedAt: '2025-01-15T08:30:00Z' },
  { id: 'a2', quizTitle: 'Đồ thị nâng cao', score: 4, maxScore: 10, passed: false, attemptedAt: '2025-01-20T10:00:00Z' },
];

function stubHistoryFetch(payload: unknown): (input: RequestInfo | URL) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> {
  return async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('history')) {
      return { ok: true, status: 200, json: async () => payload };
    }
    return { ok: true, status: 200, json: async () => [] };
  };
}

describe('ProfileView Tabs — P0 Tests', () => {
  let wrapper: VueWrapper | null = null;

  function resetCurrentUser(): void {
    authStoreMock.currentUser = {
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
    };
  }

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    resetCurrentUser();
    updateProfileMock.mockClear();
    changePasswordMock.mockClear();
    toastStoreMock.success.mockClear();
    toastStoreMock.error.mockClear();
    vi.stubGlobal('fetch', stubHistoryFetch(attemptsFixture));
  });

  afterEach(() => {
    // PR-037: luôn unmount — tránh listener rò rỉ sang test sau.
    wrapper?.unmount();
    wrapper = null;
    vi.unstubAllGlobals();
  });

  it('PF-001 (P0) + PR-035: GeneralTab prefill đủ 4 input từ currentUser (watch immediate) + #university', async () => {
    wrapper = mount(ProfileGeneralTab);
    await flushPromises();
    expect((wrapper.find('#username').element as HTMLInputElement).value).toBe('nguyenvana');
    expect((wrapper.find('#nickname').element as HTMLInputElement).value).toBe('VanA');
    expect((wrapper.find('#university').element as HTMLInputElement).value).toBe('ĐH Bách Khoa');
    expect((wrapper.find('#bio').element as HTMLTextAreaElement).value).toBe('Yêu thích DSA');
  });

  it('PF-003 (P0) + PR-020: submit gọi updateProfile với đủ 4 args + toast success + isSaving', async () => {
    let resolveUpdate!: (value: Awaited<ReturnType<typeof updateProfileMock>>) => void;
    updateProfileMock.mockImplementationOnce(
      () => new Promise<Awaited<ReturnType<typeof updateProfileMock>>>((resolve) => { resolveUpdate = resolve; }),
    );
    wrapper = mount(ProfileGeneralTab);
    await flushPromises();
    await wrapper.find('#username').setValue('new_username');
    const form = wrapper.find('form');
    await form.trigger('submit');
    expect(wrapper.find('button[type="submit"]').text()).toContain('Đang lưu...');
    resolveUpdate(null);
    await flushPromises();
    expect(updateProfileMock).toHaveBeenCalledTimes(1);
    expect(updateProfileMock.mock.calls[0]).toEqual(['new_username', 'VanA', 'Yêu thích DSA', 'ĐH Bách Khoa']);
    expect(toastStoreMock.success).toHaveBeenCalledWith('Cập nhật hồ sơ cá nhân thành công!');
    expect(wrapper.find('button[type="submit"]').text()).toContain('Lưu thay đổi');
  });

  it('PR-020: updateProfile reject → toast error + isSaving về false', async () => {
    updateProfileMock.mockRejectedValueOnce(new Error('Không thể cập nhật hồ sơ.'));
    wrapper = mount(ProfileGeneralTab);
    await flushPromises();
    await wrapper.find('#username').setValue('new_username');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(updateProfileMock).toHaveBeenCalledTimes(1);
    expect(toastStoreMock.error).toHaveBeenCalledWith('Không thể cập nhật hồ sơ.');
    expect(wrapper.find('button[type="submit"]').text()).toContain('Lưu thay đổi');
  });

  it('PF-005 (P0): Xem badges — ProgressTab hiển thị badges', async () => {
    wrapper = mount(ProfileProgressTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Huy hiệu đã mở khóa');
    const badgeCards = wrapper.findAll('.pm-badge-card');
    expect(badgeCards.length).toBe(2);
    expect(wrapper.find('.badge-name').text()).toBe('First Steps');
  });

  it('PR-036: ProgressTab badges rỗng → empty-state-box (không có card)', async () => {
    authStoreMock.currentUser = { ...authStoreMock.currentUser, badges: [] };
    wrapper = mount(ProfileProgressTab);
    await flushPromises();
    expect(wrapper.find('.empty-state-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Chưa nhận được huy hiệu nào');
    expect(wrapper.findAll('.pm-badge-card').length).toBe(0);
  });

  it('PR-036: getBadgeIconName map emoji → BaseIcon name, icon lạ fallback "badge"', async () => {
    authStoreMock.currentUser = {
      ...authStoreMock.currentUser,
      badges: [
        { id: 'b1', name: 'Sorting Wizard', description: 'Master sorting', icon: '📊', color: '#3d9970', earnedAt: '2025-02-01T00:00:00Z' },
        { id: 'b2', name: 'Unknown Badge', description: 'Icon lạ', icon: '🌟', color: '#ff8800', earnedAt: '2025-02-01T00:00:00Z' },
      ],
    };
    wrapper = mount(ProfileProgressTab);
    await flushPromises();
    const iconNames = wrapper.findAll('.badge-icon-box .base-icon-mock title').map((t) => t.text());
    expect(iconNames[0]).toBe('sorting-wizard');
    expect(iconNames[1]).toBe('badge');
  });

  it('PF-007 (P0) + PR-006: HistoryTab render 2 attempts — số dòng + cột score/passed/date', async () => {
    wrapper = mount(ProfileHistoryTab);
    await flushPromises();
    expect(wrapper.find('.panel-title').text()).toBe('Quiz History');
    const rows = wrapper.findAll('.pm-table tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].find('.cell-title').text()).toBe('Mảng cơ bản');
    expect(rows[0].find('.cell-score').text()).toContain('8 / 10');
    expect(rows[0].find('.status-pill').classes()).toContain('status-pill--pass');
    expect(rows[0].find('.status-pill').text()).toContain('ĐẠT');
    expect(rows[0].find('.cell-date').text()).toContain('2025');
    expect(rows[1].find('.cell-title').text()).toBe('Đồ thị nâng cao');
    expect(rows[1].find('.cell-score').text()).toContain('4 / 10');
    expect(rows[1].find('.status-pill').classes()).toContain('status-pill--fail');
    expect(rows[1].find('.status-pill').text()).toContain('CHƯA ĐẠT');
  });

  it('PR-006: HistoryTab history rỗng → empty-state-box, không có bảng', async () => {
    vi.stubGlobal('fetch', stubHistoryFetch([]));
    wrapper = mount(ProfileHistoryTab);
    await flushPromises();
    expect(wrapper.find('.empty-state-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Chưa có lịch sử ngắt mạch quiz');
    expect(wrapper.find('.pm-table').exists()).toBe(false);
  });

  it('PR-006/PR-014: HistoryTab 401 → error-state-box phiên hết hạn, không render bảng/dữ liệu giả', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    })));
    wrapper = mount(ProfileHistoryTab);
    await flushPromises();
    expect(wrapper.find('.pm-table').exists()).toBe(false);
    expect(wrapper.find('.loading-state-box').exists()).toBe(false);
    expect(wrapper.find('.error-state-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Phiên đã hết hạn, vui lòng đăng nhập lại.');
    expect(wrapper.text()).not.toContain('Mảng cơ bản');
  });

  it('PF-009 (P0): Đổi mật khẩu — SecurityTab form có đủ 3 input', async () => {
    wrapper = mount(ProfileSecurityTab);
    expect(wrapper.find('#currentPassword').exists()).toBe(true);
    expect(wrapper.find('#newPassword').exists()).toBe(true);
    expect(wrapper.find('#confirmNewPassword').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toContain('Cập nhật mật khẩu');
  });

  it('PF-010 (P1) + PR-021: click speed 2x → localStorage dsa_preferences đổi + class active', async () => {
    wrapper = mount(ProfilePreferencesTab);
    expect(wrapper.text()).toContain('Tốc độ VCR mặc định');
    expect(wrapper.text()).toContain('Hiệu ứng pháo hoa Confetti');
    const speedButtons = wrapper.findAll('.segment-btn');
    expect(speedButtons.length).toBe(4);
    expect(wrapper.findAll('.toggle-switch').length).toBe(2);

    const speed2 = speedButtons.find((b) => b.text().trim() === '2x');
    expect(speed2).toBeTruthy();
    await speed2!.trigger('click');
    const prefs = JSON.parse(localStorage.getItem('dsa_preferences') ?? '{}') as Record<string, unknown>;
    expect(prefs.defaultSpeed).toBe(2);
    expect(speed2!.classes()).toContain('segment-btn--active');
    expect(toastStoreMock.success).toHaveBeenCalled();
  });

  it('PR-021: click toggle confetti → dsa_preferences enableConfetti đảo + class theo trạng thái', async () => {
    wrapper = mount(ProfilePreferencesTab);
    const toggles = wrapper.findAll('.toggle-switch');
    const initialOn = toggles[0].classes().includes('toggle-switch--on');
    await toggles[0].trigger('click');
    const after = JSON.parse(localStorage.getItem('dsa_preferences') ?? '{}') as Record<string, unknown>;
    expect(after.enableConfetti).toBe(!initialOn);
    expect(toggles[0].classes().includes('toggle-switch--on')).toBe(after.enableConfetti === true);
  });

  it('PR-021: click toggle autoplay → dsa_preferences autoPlay đảo', async () => {
    wrapper = mount(ProfilePreferencesTab);
    const toggles = wrapper.findAll('.toggle-switch');
    const initialOn = toggles[1].classes().includes('toggle-switch--on');
    await toggles[1].trigger('click');
    const after = JSON.parse(localStorage.getItem('dsa_preferences') ?? '{}') as Record<string, unknown>;
    expect(after.autoPlay).toBe(!initialOn);
    expect(toggles[1].classes().includes('toggle-switch--on')).toBe(after.autoPlay === true);
  });

  it('PR-037: ProfileAboutTab render tĩnh — version + 4 spec-card + tech tags', async () => {
    wrapper = mount(ProfileAboutTab);
    expect(wrapper.find('.panel-title').text()).toBe('About');
    expect(wrapper.text()).toContain('VisualizationDSA v2.0.0');
    expect(wrapper.findAll('.spec-card').length).toBe(4);
    expect(wrapper.findAll('.tech-tag').length).toBeGreaterThanOrEqual(5);
  });
});
