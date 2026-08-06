// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';

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

vi.mock('../../../features/auth/services/authApi', () => ({
  updateProfile: vi.fn(async () => true),
  changePassword: vi.fn(async () => true),
}));

vi.mock('../../../features/auth/services/statelessAuthApi', () => ({
  statelessAuthApi: {
    updateProfile: vi.fn(async () => ({
      id: 'user-1',
      email: 'test@example.com',
      username: 'updated_user',
      nickname: 'UpdatedNick',
      bio: 'Updated bio',
      university: 'Updated Uni',
      totalXP: 450,
      currentLevel: 3,
      streakDays: 7,
      createdAt: '2025-01-01T00:00:00Z',
      badges: [],
      isPremium: false,
      role: 'Student',
    })),
    changePassword: vi.fn(async () => ({ message: 'Password changed' })),
  },
}));

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => authStoreMock),
}));

vi.mock('../../../composables/useToast', () => ({
  useToastStore: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  })),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
  })),
}));

vi.mock('../../../shared/components/BaseIcon.vue', () => ({
  default: {
    name: 'BaseIcon',
    props: ['name', 'class'],
    template: '<svg class="base-icon-mock"><title>{{ name }}</title></svg>',
  },
}));

import ProfileGeneralTab from '../ProfileGeneralTab.vue';
import ProfileProgressTab from '../ProfileProgressTab.vue';
import ProfileHistoryTab from '../ProfileHistoryTab.vue';
import ProfileSecurityTab from '../ProfileSecurityTab.vue';
import ProfilePreferencesTab from '../ProfilePreferencesTab.vue';

describe('ProfileView Tabs — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => [],
    })));
    localStorage.clear();
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
    updateProfileMock.mockClear();
    changePasswordMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('PF-001 (P0): Chỉnh sửa thông tin — GeneralTab có input username/nickname/bio', async () => {
    const wrapper = mount(ProfileGeneralTab);
    await flushPromises();
    const usernameInput = wrapper.find('#username');
    const nicknameInput = wrapper.find('#nickname');
    const bioInput = wrapper.find('#bio');
    expect(usernameInput.exists()).toBe(true);
    expect(nicknameInput.exists()).toBe(true);
    expect(bioInput.exists()).toBe(true);
  });

  it('PF-003 (P0): Lưu thay đổi — submit form gọi updateProfile', async () => {
    const wrapper = mount(ProfileGeneralTab);
    await flushPromises();
    const usernameInput = wrapper.find('#username');
    await usernameInput.setValue('new_username');
    const form = wrapper.find('form');
    await form.trigger('submit');
    await flushPromises();
    expect(updateProfileMock).toHaveBeenCalled();
    const callArgs = updateProfileMock.mock.calls[0];
    expect(callArgs[0]).toBe('new_username');
  });

  it('PF-005 (P0): Xem badges — ProgressTab hiển thị badges', async () => {
    const wrapper = mount(ProfileProgressTab);
    await flushPromises();
    expect(wrapper.text()).toContain('Huy hiệu đã mở khóa');
    const badgeCards = wrapper.findAll('.pm-badge-card');
    expect(badgeCards.length).toBe(2);
    expect(wrapper.find('.badge-name').text()).toBe('First Steps');
  });

  it('PF-007 (P0): Lịch sử quiz — HistoryTab render attempts', async () => {
    const wrapper = mount(ProfileHistoryTab);
    await flushPromises();
    expect(wrapper.find('.panel-title').text()).toBe('Quiz History');
  });

  it('PF-009 (P0): Đổi mật khẩu — SecurityTab form có đủ 3 input', async () => {
    const wrapper = mount(ProfileSecurityTab);
    expect(wrapper.find('#currentPassword').exists()).toBe(true);
    expect(wrapper.find('#newPassword').exists()).toBe(true);
    expect(wrapper.find('#confirmNewPassword').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toContain('Cập nhật mật khẩu');
  });

  it('PF-010 (P1): Preferences — PreferencesTab VCR speed + confetti toggle', async () => {
    const wrapper = mount(ProfilePreferencesTab);
    expect(wrapper.text()).toContain('Tốc độ VCR mặc định');
    expect(wrapper.text()).toContain('Hiệu ứng pháo hoa Confetti');
    const speedButtons = wrapper.findAll('.segment-btn');
    expect(speedButtons.length).toBe(4);
    expect(wrapper.findAll('.toggle-switch').length).toBeGreaterThanOrEqual(2);
  });
});
