// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import NotificationBell from '../components/NotificationBell.vue';
import { useNotificationStore } from '../store/useNotificationStore';
import type { NotificationDto } from '../services/notificationApi';

const mockGetNotifications = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockRouterPush = vi.fn();

vi.mock('../services/notificationApi', () => ({
  getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
  markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
  markAllAsRead: (...args: unknown[]) => mockMarkAllAsRead(...args),
}));

vi.mock('../../auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    accessToken: 'mock-token',
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock('../../../shared/components/BaseIcon.vue', () => ({
  default: { template: '<i class="base-icon" />' },
}));

function createMockNotifications(): NotificationDto[] {
  return [
    { id: 'n1', content: 'Chào mừng bạn!', isRead: false, linkUrl: '/welcome', createdAt: '2026-08-01T10:00:00Z' },
    { id: 'n2', content: 'Đã đọc rồi', isRead: true, linkUrl: '', createdAt: '2026-08-02T10:00:00Z' },
  ];
}

describe('NotificationBell', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockGetNotifications.mockResolvedValue([]);
  });

  it('không hiện badge khi không có unread', () => {
    const wrapper = mount(NotificationBell);

    expect(wrapper.find('.bell-badge').exists()).toBe(false);
  });

  it('hiện badge với số unread (9+ khi > 9)', async () => {
    const store = useNotificationStore();
    store.notifications = Array.from({ length: 12 }, (_, i) => ({
      id: `n${i}`,
      content: `Nội dung ${i}`,
      isRead: false,
      linkUrl: '',
      createdAt: '2026-08-01T10:00:00Z',
    }));

    const wrapper = mount(NotificationBell);

    expect(wrapper.find('.bell-badge').exists()).toBe(true);
    expect(wrapper.find('.bell-badge').text()).toBe('9+');
  });

  it('hiện badge với số unread chính xác khi <= 9', async () => {
    const store = useNotificationStore();
    store.notifications = createMockNotifications();

    const wrapper = mount(NotificationBell);

    expect(wrapper.find('.bell-badge').text()).toBe('1');
  });

  it('click chuông mở dropdown và tải notifications', async () => {
    mockGetNotifications.mockResolvedValue(createMockNotifications());

    const wrapper = mount(NotificationBell);
    expect(wrapper.find('.notification-dropdown').exists()).toBe(false);

    await wrapper.find('.bell-btn').trigger('click');

    expect(wrapper.find('.notification-dropdown').exists()).toBe(true);
    expect(mockGetNotifications).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Chào mừng bạn!');
  });

  it('dropdown hiện empty state khi không có notification', async () => {
    const wrapper = mount(NotificationBell);
    await wrapper.find('.bell-btn').trigger('click');

    expect(wrapper.text()).toContain('Chưa có thông báo nào.');
  });

  it('click notification chưa đọc gọi readNotification và điều hướng linkUrl', async () => {
    mockGetNotifications.mockResolvedValue(createMockNotifications());
    mockMarkAsRead.mockResolvedValue(undefined);

    const wrapper = mount(NotificationBell);
    await wrapper.find('.bell-btn').trigger('click');

    const firstItem = wrapper.find('.notification-item');
    await firstItem.trigger('click');

    expect(mockMarkAsRead).toHaveBeenCalledWith('n1', 'mock-token');
    expect(mockRouterPush).toHaveBeenCalledWith('/welcome');
  });

  it('click ngoài dropdown đóng dropdown', async () => {
    const wrapper = mount(NotificationBell);
    await wrapper.find('.bell-btn').trigger('click');
    expect(wrapper.find('.notification-dropdown').exists()).toBe(true);

    document.dispatchEvent(new MouseEvent('click'));

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.notification-dropdown').exists()).toBe(false);
  });

  it('click nút "Đánh dấu tất cả đã đọc" gọi readAll', async () => {
    mockGetNotifications.mockResolvedValue(createMockNotifications());
    mockMarkAllAsRead.mockResolvedValue(undefined);

    const wrapper = mount(NotificationBell);
    await wrapper.find('.bell-btn').trigger('click');

    await wrapper.find('.mark-all-btn').trigger('click');

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });
});
