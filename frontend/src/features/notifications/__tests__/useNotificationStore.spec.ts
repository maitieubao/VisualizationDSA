import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from '../store/useNotificationStore';
import type { NotificationDto } from '../services/notificationApi';

const mockGetNotifications = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

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

function createMockNotifications(): NotificationDto[] {
  return [
    { id: 'n1', content: 'Chào mừng bạn!', isRead: false, linkUrl: '/welcome', createdAt: '2026-08-01T10:00:00Z' },
    { id: 'n2', content: 'Bài mới đã có', isRead: false, linkUrl: '/courses', createdAt: '2026-08-02T10:00:00Z' },
    { id: 'n3', content: 'Đã đọc rồi', isRead: true, linkUrl: '', createdAt: '2026-08-03T10:00:00Z' },
  ];
}

describe('useNotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('computed counters', () => {
    it('unreadCount trả về đúng số notification chưa đọc', () => {
      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      expect(store.unreadCount).toBe(2);
    });

    it('hasUnread = true khi có notification chưa đọc', () => {
      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      expect(store.hasUnread).toBe(true);
    });

    it('unreadCount = 0 khi tất cả đã đọc', () => {
      const store = useNotificationStore();
      store.notifications = [
        { id: 'n1', content: 'Đã đọc', isRead: true, linkUrl: '', createdAt: '2026-08-01T10:00:00Z' },
      ];

      expect(store.unreadCount).toBe(0);
      expect(store.hasUnread).toBe(false);
    });
  });

  describe('loadNotifications', () => {
    it('tải notifications từ API và truyền đúng access token', async () => {
      mockGetNotifications.mockResolvedValue(createMockNotifications());

      const store = useNotificationStore();
      store.notifications = [];

      await store.loadNotifications();

      expect(store.notifications.length).toBe(3);
      expect(mockGetNotifications).toHaveBeenCalledWith('mock-token');
    });

    it('giữ nguyên danh sách cũ khi API lỗi', async () => {
      mockGetNotifications.mockRejectedValue(new Error('Network error'));

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      await store.loadNotifications();

      expect(store.notifications.length).toBe(3);
    });
  });

  describe('readNotification', () => {
    it('đánh dấu 1 notification đã đọc và gọi API với id + token', async () => {
      mockMarkAsRead.mockResolvedValue(undefined);

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      await store.readNotification('n1');

      const n1 = store.notifications.find(n => n.id === 'n1');
      expect(n1?.isRead).toBe(true);
      expect(store.unreadCount).toBe(1);
      expect(mockMarkAsRead).toHaveBeenCalledWith('n1', 'mock-token');
    });
  });

  describe('readAll', () => {
    it('đánh dấu tất cả đã đọc và reset unreadCount về 0', async () => {
      mockMarkAllAsRead.mockResolvedValue(undefined);

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      expect(store.unreadCount).toBe(2);

      await store.readAll();

      expect(store.unreadCount).toBe(0);
      expect(store.hasUnread).toBe(false);
      expect(store.notifications.every(n => n.isRead)).toBe(true);
      expect(mockMarkAllAsRead).toHaveBeenCalledWith('mock-token');
    });
  });
});
