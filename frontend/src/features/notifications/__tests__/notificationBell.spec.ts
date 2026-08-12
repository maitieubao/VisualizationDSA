// @vitest-environment jsdom
// CONTRACT SPEC — NotificationBell (NT-006 P1, NT-009 P2, NT-019 P2, NT-024 P3).
// Contract (fix Round 21, đã có trong source):
//  - NT-006: badge dựa trên mock getNotifications (KHÔNG overwrite store trực tiếp) + flushPromises.
//  - NT-009: poll 60s khi authenticated — sau 60s gọi lại loadNotifications; unmount → ngừng.
//  - NT-019: click item đã đọc → không mark nhưng vẫn navigate; linkUrl="" → không push;
//    click item → dropdown tự đóng; mark-all chỉ hiện khi hasUnread; unmount gỡ listener.
//  - NT-024: formatTime biên 1ph/60ph/24h/7ngày + Invalid Date + ngày tương lai (setSystemTime).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import NotificationBell from '../components/NotificationBell.vue';
import type { NotificationDto } from '../services/notificationApi';

const mockGetNotifications = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockRouterPush = vi.fn();
const mockConnectNotifications = vi.fn();
const mockDisconnectNotifications = vi.fn();

vi.mock('../services/notificationApi', () => ({
  getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
  markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
  markAllAsRead: (...args: unknown[]) => mockMarkAllAsRead(...args),
}));

vi.mock('../../auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    accessToken: 'mock-token',
    currentUser: { id: 'user-a', username: 'user-a' },
  }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

// NT-002: realtime mock — tránh HubConnection thật (fetch lỗi ồn trong test).
vi.mock('../../realtime/stores/useSignalRStore', () => ({
  useSignalRStore: () => ({
    isNotificationConnected: false,
    connectNotifications: mockConnectNotifications,
    disconnectNotifications: mockDisconnectNotifications,
  }),
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

function unreadItems(count: number): NotificationDto[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `n${i}`,
    content: `Nội dung ${i}`,
    isRead: false,
    linkUrl: '',
    createdAt: '2026-08-01T10:00:00Z',
  }));
}

function timeOfItem(wrapper: VueWrapper, contentMarker: string): string {
  const item = wrapper.findAll('.notification-item').find((w) => w.text().includes(contentMarker));
  return item?.find('.notification-item__time').text() ?? '';
}

describe('NotificationBell', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
    mockGetNotifications.mockResolvedValue([]);
    mockRouterPush.mockResolvedValue(undefined);
    mockConnectNotifications.mockResolvedValue(undefined);
    mockDisconnectNotifications.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('không hiện badge khi không có unread', async () => {
    const wrapper = mount(NotificationBell);
    await flushPromises();

    expect(wrapper.find('.bell-badge').exists()).toBe(false);
  });

  it('NT-006: mock 12 unread + flushPromises → badge hiện 9+ (không overwrite store)', async () => {
    mockGetNotifications.mockResolvedValue(unreadItems(12));

    const wrapper = mount(NotificationBell);
    await flushPromises();

    const badge = wrapper.find('.bell-badge');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('9+');
  });

  it('hiện badge với số unread chính xác khi <= 9', async () => {
    mockGetNotifications.mockResolvedValue(createMockNotifications());

    const wrapper = mount(NotificationBell);
    await flushPromises();

    expect(wrapper.find('.bell-badge').text()).toBe('1');
  });

  it('click chuông mở dropdown và tải notifications', async () => {
    mockGetNotifications.mockResolvedValue(createMockNotifications());

    const wrapper = mount(NotificationBell);
    await flushPromises();

    expect(wrapper.find('.notification-dropdown').exists()).toBe(false);

    await wrapper.find('.bell-btn').trigger('click');
    await flushPromises();

    expect(wrapper.find('.notification-dropdown').exists()).toBe(true);
    expect(mockGetNotifications).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Chào mừng bạn!');
  });

  it('dropdown hiện empty state khi không có notification', async () => {
    const wrapper = mount(NotificationBell);
    await flushPromises();

    await wrapper.find('.bell-btn').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Chưa có thông báo nào.');
  });

  it('NT-019: click notification chưa đọc → mark + navigate linkUrl + dropdown tự đóng', async () => {
    mockGetNotifications.mockResolvedValue(createMockNotifications());
    mockMarkAsRead.mockResolvedValue(undefined);

    const wrapper = mount(NotificationBell);
    await flushPromises();
    await wrapper.find('.bell-btn').trigger('click');
    await flushPromises();

    // Danh sách sort giảm dần theo createdAt → item chưa đọc không nhất thiết đứng đầu.
    const unreadItem = wrapper.find('.notification-item--unread');
    expect(unreadItem.exists()).toBe(true);
    await unreadItem.trigger('click');
    await flushPromises();

    expect(mockMarkAsRead).toHaveBeenCalledWith('n1', 'mock-token');
    expect(mockRouterPush).toHaveBeenCalledWith('/welcome');
    expect(wrapper.find('.notification-dropdown').exists()).toBe(false);
  });

  it('NT-019: click item đã đọc → KHÔNG mark nhưng vẫn navigate', async () => {
    const readItem: NotificationDto = {
      id: 'r1', content: 'Đã đọc có link', isRead: true, linkUrl: '/courses', createdAt: '2026-08-02T10:00:00Z',
    };
    mockGetNotifications.mockResolvedValue([readItem]);

    const wrapper = mount(NotificationBell);
    await flushPromises();
    await wrapper.find('.bell-btn').trigger('click');
    await flushPromises();

    await wrapper.find('.notification-item').trigger('click');
    await flushPromises();

    expect(mockMarkAsRead).not.toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/courses');
    expect(wrapper.find('.notification-dropdown').exists()).toBe(false);
  });

  it('NT-019: linkUrl rỗng → không push (vẫn mark)', async () => {
    const noLinkItem: NotificationDto = {
      id: 'n2', content: 'Không có link', isRead: false, linkUrl: '', createdAt: '2026-08-02T10:00:00Z',
    };
    mockGetNotifications.mockResolvedValue([noLinkItem]);
    mockMarkAsRead.mockResolvedValue(undefined);

    const wrapper = mount(NotificationBell);
    await flushPromises();
    await wrapper.find('.bell-btn').trigger('click');
    await flushPromises();

    await wrapper.find('.notification-item--unread').trigger('click');
    await flushPromises();

    expect(mockMarkAsRead).toHaveBeenCalledWith('n2', 'mock-token');
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('click ngoài dropdown đóng dropdown', async () => {
    const wrapper = mount(NotificationBell);
    await flushPromises();

    await wrapper.find('.bell-btn').trigger('click');
    await flushPromises();
    expect(wrapper.find('.notification-dropdown').exists()).toBe(true);

    document.dispatchEvent(new MouseEvent('click'));

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.notification-dropdown').exists()).toBe(false);
  });

  it('NT-019: nút "Đánh dấu tất cả đã đọc" chỉ hiện khi hasUnread', async () => {
    const allRead: NotificationDto[] = [
      { id: 'r1', content: 'Đã đọc 1', isRead: true, linkUrl: '', createdAt: '2026-08-01T10:00:00Z' },
    ];
    mockGetNotifications.mockResolvedValue(allRead);

    const wrapper = mount(NotificationBell);
    await flushPromises();
    await wrapper.find('.bell-btn').trigger('click');
    await flushPromises();

    expect(wrapper.find('.mark-all-btn').exists()).toBe(false);
  });

  it('click nút "Đánh dấu tất cả đã đọc" gọi readAll', async () => {
    mockGetNotifications.mockResolvedValue(createMockNotifications());
    mockMarkAllAsRead.mockResolvedValue(undefined);

    const wrapper = mount(NotificationBell);
    await flushPromises();
    await wrapper.find('.bell-btn').trigger('click');
    await flushPromises();

    await wrapper.find('.mark-all-btn').trigger('click');
    await flushPromises();

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('NT-009: polling 60s gọi lại loadNotifications; unmount → ngừng polling', async () => {
    vi.useFakeTimers();
    mockGetNotifications.mockResolvedValue([]);

    const wrapper = mount(NotificationBell);
    await vi.advanceTimersByTimeAsync(0);

    const callsAfterMount = mockGetNotifications.mock.calls.length;
    expect(callsAfterMount).toBeGreaterThanOrEqual(1);

    await vi.advanceTimersByTimeAsync(60_000);
    expect(mockGetNotifications.mock.calls.length).toBe(callsAfterMount + 1);

    const callsAfterFirstPoll = mockGetNotifications.mock.calls.length;
    wrapper.unmount();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mockGetNotifications.mock.calls.length).toBe(callsAfterFirstPoll);
  });

  it('NT-019: unmount gỡ listener click-outside', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const wrapper = mount(NotificationBell);
    await flushPromises();
    wrapper.unmount();

    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('NT-024: formatTime biên 1ph/60ph/24h/7ngày + Invalid Date + tương lai', async () => {
    vi.useFakeTimers();
    const NOW = new Date('2026-08-13T12:00:00Z');
    vi.setSystemTime(NOW);

    const items: NotificationDto[] = [
      { id: 'f1', content: 'Moc 1 phut', isRead: false, linkUrl: '', createdAt: new Date(NOW.getTime() - 1 * 60_000).toISOString() },
      { id: 'f2', content: 'Moc 60 phut', isRead: false, linkUrl: '', createdAt: new Date(NOW.getTime() - 60 * 60_000).toISOString() },
      { id: 'f3', content: 'Moc 24 gio', isRead: false, linkUrl: '', createdAt: new Date(NOW.getTime() - 24 * 3_600_000).toISOString() },
      { id: 'f4', content: 'Moc 7 ngay', isRead: false, linkUrl: '', createdAt: new Date(NOW.getTime() - 7 * 86_400_000).toISOString() },
      { id: 'f5', content: 'Moc tuong lai', isRead: false, linkUrl: '', createdAt: new Date(NOW.getTime() + 3_600_000).toISOString() },
      { id: 'f6', content: 'Moc invalid', isRead: false, linkUrl: '', createdAt: 'khong-phai-ngay-hop-le' },
    ];
    mockGetNotifications.mockResolvedValue(items);

    const wrapper = mount(NotificationBell);
    await vi.advanceTimersByTimeAsync(0);
    await wrapper.find('.bell-btn').trigger('click');
    await vi.advanceTimersByTimeAsync(0);

    expect(timeOfItem(wrapper, 'Moc 1 phut')).toBe('1 phút trước');
    expect(timeOfItem(wrapper, 'Moc 60 phut')).toBe('1 giờ trước');
    expect(timeOfItem(wrapper, 'Moc 24 gio')).toBe('1 ngày trước');
    expect(timeOfItem(wrapper, 'Moc 7 ngay')).toBe(new Date(NOW.getTime() - 7 * 86_400_000).toLocaleDateString('vi-VN'));
    // Ngày tương lai (đồng hồ lệch) → clamp về "Vừa xong".
    expect(timeOfItem(wrapper, 'Moc tuong lai')).toBe('Vừa xong');
    // Invalid Date → không được hiển thị 'Invalid Date' và không crash.
    expect(timeOfItem(wrapper, 'Moc invalid')).not.toContain('Invalid');
  });

  it('NT-024: formatTime biên 59ph vẫn "phút", 60ph chuyển "giờ"', async () => {
    vi.useFakeTimers();
    const NOW = new Date('2026-08-13T12:00:00Z');
    vi.setSystemTime(NOW);

    const items: NotificationDto[] = [
      { id: 'b1', content: 'Moc 59 phut', isRead: false, linkUrl: '', createdAt: new Date(NOW.getTime() - 59 * 60_000).toISOString() },
      { id: 'b2', content: 'Moc 60 phut', isRead: false, linkUrl: '', createdAt: new Date(NOW.getTime() - 60 * 60_000).toISOString() },
    ];
    mockGetNotifications.mockResolvedValue(items);

    const wrapper = mount(NotificationBell);
    await vi.advanceTimersByTimeAsync(0);
    await wrapper.find('.bell-btn').trigger('click');
    await vi.advanceTimersByTimeAsync(0);

    expect(timeOfItem(wrapper, 'Moc 59 phut')).toBe('59 phút trước');
    expect(timeOfItem(wrapper, 'Moc 60 phut')).toBe('1 giờ trước');
  });
});
