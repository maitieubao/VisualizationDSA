// @vitest-environment jsdom
// PR-008 (P1): SecurityTab — logic handleChangePassword: submit gọi changePassword
// với đúng args + 3 nhánh lỗi (<8 ký tự, mismatch, server từ chối → fieldErrors +
// focus) + 401 → toast phiên hết hạn. (Cấu trúc 3 input ở profileP0Tests PF-009.)

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
    bio: '',
    university: '',
    badges: [],
    role: 'Student',
    isPremium: false,
    currentLevel: 1,
    totalXP: 0,
    streakDays: 0,
    createdAt: '2025-01-01T00:00:00Z',
  },
  isAuthenticated: true,
  userName: 'nguyenvana',
  userLevel: 1,
  userXP: 0,
  isPremium: false,
  userRole: 'Student',
  isTeacher: false,
  isAdmin: false,
  getAccessToken: () => 'fake-token',
  statelessUser: null,
  isStatelessMode: true,
  updateProfile: vi.fn(async () => null),
  changePassword: changePasswordMock,
  loadStatelessProfile: vi.fn(async () => {}),
});

vi.mock('../../../features/auth/store/useAuthStore', () => ({
  useAuthStore: vi.fn(() => authStoreMock),
}));

vi.mock('../../../composables/useToast', () => ({
  useToastStore: vi.fn(() => toastStoreMock),
}));

// BaseIcon là component GLOBAL (main.ts app.component) — vi.mock(module) là mock chết.
const BaseIconStub = {
  name: 'BaseIcon',
  props: ['name', 'class'],
  template: '<svg class="base-icon-mock"><title>{{ name }}</title></svg>',
};

config.global.stubs = {
  BaseIcon: BaseIconStub,
};

import ProfileSecurityTab from '../ProfileSecurityTab.vue';

async function fillAndSubmit(wrapper: VueWrapper, current: string, next: string, confirm: string): Promise<void> {
  await wrapper.find('#currentPassword').setValue(current);
  await wrapper.find('#newPassword').setValue(next);
  await wrapper.find('#confirmNewPassword').setValue(confirm);
  await wrapper.find('form').trigger('submit');
  await flushPromises();
}

describe('ProfileSecurityTab — logic đổi mật khẩu (PR-008)', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    changePasswordMock.mockClear();
    toastStoreMock.success.mockClear();
    toastStoreMock.error.mockClear();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
  });

  it('submit hợp lệ → changePassword(currentPassword, newPassword) + toast success + form reset', async () => {
    // attachTo document.body để focus() của jsdom hoạt động (test focus nhánh lỗi).
    wrapper = mount(ProfileSecurityTab, { attachTo: document.body });
    await fillAndSubmit(wrapper, 'old-pass-1', 'newpass123', 'newpass123');
    expect(changePasswordMock).toHaveBeenCalledTimes(1);
    expect(changePasswordMock).toHaveBeenCalledWith('old-pass-1', 'newpass123');
    expect(toastStoreMock.success).toHaveBeenCalledWith('Đổi mật khẩu thành công!');
    expect((wrapper.find('#currentPassword').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('#newPassword').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('#confirmNewPassword').element as HTMLInputElement).value).toBe('');
  });

  it('currentPassword trống → fieldErrors.currentPassword inline + focus, không gọi changePassword', async () => {
    wrapper = mount(ProfileSecurityTab, { attachTo: document.body });
    await fillAndSubmit(wrapper, '', 'newpass123', 'newpass123');
    expect(changePasswordMock).not.toHaveBeenCalled();
    expect(wrapper.find('.field-error').text()).toBe('Vui lòng nhập mật khẩu hiện tại.');
    expect(wrapper.find('#currentPassword').classes()).toContain('pm-input--error');
    expect(document.activeElement).toBe(wrapper.find('#currentPassword').element);
  });

  it('PR-028: newPassword < 8 ký tự → fieldErrors.newPassword inline + focus, không toast, không gọi changePassword', async () => {
    wrapper = mount(ProfileSecurityTab, { attachTo: document.body });
    await fillAndSubmit(wrapper, 'old-pass-1', 'short', 'short');
    expect(changePasswordMock).not.toHaveBeenCalled();
    expect(wrapper.find('#newPassword-error').text()).toBe('Mật khẩu mới phải từ 8 ký tự trở lên.');
    expect(wrapper.find('#newPassword').classes()).toContain('pm-input--error');
    expect(document.activeElement).toBe(wrapper.find('#newPassword').element);
    expect(toastStoreMock.error).not.toHaveBeenCalled();
  });

  it('PR-028: confirm không khớp → fieldErrors.newPassword inline + focus, không gọi changePassword', async () => {
    wrapper = mount(ProfileSecurityTab, { attachTo: document.body });
    await fillAndSubmit(wrapper, 'old-pass-1', 'newpass123', 'different9');
    expect(changePasswordMock).not.toHaveBeenCalled();
    expect(wrapper.find('#newPassword-error').text()).toBe('Xác nhận mật khẩu mới không khớp.');
    expect(wrapper.find('#newPassword').classes()).toContain('pm-input--error');
    expect(document.activeElement).toBe(wrapper.find('#newPassword').element);
  });

  it('server từ chối (mật khẩu hiện tại sai) → fieldErrors.currentPassword + class error + focus', async () => {
    changePasswordMock.mockRejectedValueOnce(new Error('Mật khẩu hiện tại không chính xác'));
    wrapper = mount(ProfileSecurityTab, { attachTo: document.body });
    await fillAndSubmit(wrapper, 'wrong-pass', 'newpass123', 'newpass123');
    expect(changePasswordMock).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.field-error').text()).toBe('Mật khẩu hiện tại không chính xác.');
    expect(wrapper.find('#currentPassword').classes()).toContain('pm-input--error');
    expect(document.activeElement).toBe(wrapper.find('#currentPassword').element);
    expect(toastStoreMock.error).not.toHaveBeenCalledWith('Mật khẩu hiện tại không chính xác.');
  });

  it('401 → toast phiên hết hạn, không set fieldErrors', async () => {
    const err = new Error('Unauthorized');
    (err as { status?: number }).status = 401;
    changePasswordMock.mockRejectedValueOnce(err);
    wrapper = mount(ProfileSecurityTab);
    await fillAndSubmit(wrapper, 'old-pass-1', 'newpass123', 'newpass123');
    expect(changePasswordMock).toHaveBeenCalledTimes(1);
    expect(toastStoreMock.error).toHaveBeenCalledWith('Phiên đã hết hạn, vui lòng đăng nhập lại');
    expect(wrapper.find('.field-error').exists()).toBe(false);
    expect(wrapper.find('#currentPassword').classes()).not.toContain('pm-input--error');
  });
});
