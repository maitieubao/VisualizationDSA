// CONTRACT SPEC — useNotificationStore (NT-017 P2, NT-008 P2, NT-018 P2, NT-021 P3, NT-023 P3, NT-004 P3).
// Contract (fix Round 21, đã có trong source):
//  - NT-008: 401 → authStore.refreshAccessToken() → retry 1 lần với token mới (runWithAuthRetry);
//    refresh thất bại → reset() sạch state (auth store tự toast + redirect AU-007).
//  - NT-018: sequence guard — 2 load chồng lấn → response cũ (seq lỗi thời) bị bỏ.
//  - NT-021: mark-read map mảng mới (không mutate object cũ).
//  - NT-023: readAll có isMarkingAll guard chống double PUT.
//  - NT-004: watch currentUser?.id → reset() — đổi user/logout không lộ dữ liệu user cũ.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { reactive } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { useNotificationStore } from '../store/useNotificationStore';
import type { NotificationDto } from '../services/notificationApi';

const mockGetNotifications = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();
const mockRefreshAccessToken = vi.fn();

// Auth mock reactive — contract store đọc currentUser?.id / isAuthenticated / accessToken.
const authState = reactive({
  accessToken: 'mock-token' as string | null,
  currentUser: { id: 'user-a', username: 'user-a' } as { id: string; username: string } | null,
});

vi.mock('../services/notificationApi', () => ({
  getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
  markAsRead: (...args: unknown[]) => mockMarkAsRead(...args),
  markAllAsRead: (...args: unknown[]) => mockMarkAllAsRead(...args),
}));

vi.mock('../../auth/store/useAuthStore', () => ({
  useAuthStore: () => ({
    get isAuthenticated() {
      return authState.accessToken !== null && authState.currentUser !== null;
    },
    get accessToken() {
      return authState.accessToken;
    },
    get currentUser() {
      return authState.currentUser;
    },
    refreshAccessToken: mockRefreshAccessToken,
  }),
}));

function createMockNotifications(): NotificationDto[] {
  return [
    { id: 'n1', content: 'Chào mừng bạn!', isRead: false, linkUrl: '/welcome', createdAt: '2026-08-01T10:00:00Z' },
    { id: 'n2', content: 'Bài mới đã có', isRead: false, linkUrl: '/courses', createdAt: '2026-08-02T10:00:00Z' },
    { id: 'n3', content: 'Đã đọc rồi', isRead: true, linkUrl: '', createdAt: '2026-08-03T10:00:00Z' },
  ];
}

function unauthorizedError(): Error & { status: number } {
  return Object.assign(new Error('HTTP 401: Unauthorized'), { status: 401 });
}

describe('useNotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // resetAllMocks (không clearAllMocks) — dọn cả queue once giữa các test.
    vi.resetAllMocks();
    authState.accessToken = 'mock-token';
    authState.currentUser = { id: 'user-a', username: 'user-a' };
    mockGetNotifications.mockResolvedValue([]);
    mockRefreshAccessToken.mockResolvedValue('fresh-token-2');
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

    it('NT-008: 401 → refreshAccessToken + retry 1 lần với token mới', async () => {
      mockGetNotifications.mockRejectedValueOnce(unauthorizedError()).mockResolvedValueOnce(createMockNotifications());
      mockRefreshAccessToken.mockResolvedValue('fresh-token-2');

      const store = useNotificationStore();
      await store.loadNotifications();

      expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
      expect(mockGetNotifications).toHaveBeenCalledTimes(2);
      expect(mockGetNotifications).toHaveBeenLastCalledWith('fresh-token-2');
      expect(store.notifications.length).toBe(3);
    });

    it('NT-008: refresh thất bại → reset state, không crash (auth store tự redirect)', async () => {
      mockGetNotifications.mockRejectedValueOnce(unauthorizedError());
      mockRefreshAccessToken.mockRejectedValue(new Error('Phiên đã hết hạn.'));

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      await expect(store.loadNotifications()).resolves.toBeUndefined();

      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toBe(0);
      expect(store.isLoading).toBe(false);
    });

    it('NT-017: unauth (accessToken null) → no-op, không gọi API', async () => {
      authState.accessToken = null;

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      await store.loadNotifications();

      expect(mockGetNotifications).not.toHaveBeenCalled();
      expect(store.notifications.length).toBe(3);
      expect(store.isLoading).toBe(false);
    });

    it('NT-017: isLoading = true trong lúc tải, false sau khi xong', async () => {
      let resolveLoad!: (value: NotificationDto[]) => void;
      mockGetNotifications.mockReturnValueOnce(new Promise<NotificationDto[]>((r) => { resolveLoad = r; }));

      const store = useNotificationStore();
      const pending = store.loadNotifications();

      expect(store.isLoading).toBe(true);

      resolveLoad(createMockNotifications());
      await pending;

      expect(store.isLoading).toBe(false);
      expect(store.notifications.length).toBe(3);
    });

    it('NT-025: merge theo id — poll không ghi đè trạng thái đọc cục bộ', async () => {
      const store = useNotificationStore();
      store.notifications = [
        { id: 'n1', content: 'Cũ', isRead: true, linkUrl: '', createdAt: '2026-08-01T10:00:00Z' },
      ];

      mockGetNotifications.mockResolvedValue([
        { id: 'n1', content: 'Cũ', isRead: false, linkUrl: '', createdAt: '2026-08-01T10:00:00Z' },
        { id: 'n9', content: 'Mới từ server', isRead: false, linkUrl: '', createdAt: '2026-08-05T10:00:00Z' },
      ]);

      await store.loadNotifications();

      const n1 = store.notifications.find(n => n.id === 'n1');
      expect(n1?.isRead).toBe(true);
      expect(store.notifications.some(n => n.id === 'n9')).toBe(true);
    });
  });

  describe('NT-018: race 2 load chồng lấn → sequence guard', () => {
    it('response cũ trả về sau cùng → bị bỏ, không ghi đè response mới', async () => {
      let resolveFirst!: (value: NotificationDto[]) => void;
      let resolveSecond!: (value: NotificationDto[]) => void;
      mockGetNotifications
        .mockReturnValueOnce(new Promise<NotificationDto[]>((r) => { resolveFirst = r; }))
        .mockReturnValueOnce(new Promise<NotificationDto[]>((r) => { resolveSecond = r; }));

      const oldList: NotificationDto[] = [
        { id: 'old-1', content: 'Cũ', isRead: false, linkUrl: '', createdAt: '2026-08-01T10:00:00Z' },
      ];
      const newList: NotificationDto[] = [
        { id: 'new-1', content: 'Mới', isRead: false, linkUrl: '', createdAt: '2026-08-02T10:00:00Z' },
      ];

      const store = useNotificationStore();
      const p1 = store.loadNotifications();
      const p2 = store.loadNotifications();

      // Response mới (load 2) về trước.
      resolveSecond(newList);
      await p2;

      // Response cũ (load 1) về sau → phải bị bỏ.
      resolveFirst(oldList);
      await p1;

      expect(store.notifications).toEqual(newList);
      expect(store.isLoading).toBe(false);
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

    it('NT-021: map mảng mới — object cũ không bị mutate', async () => {
      mockMarkAsRead.mockResolvedValue(undefined);

      const store = useNotificationStore();
      const original = createMockNotifications();
      store.notifications = original;

      await store.readNotification('n1');

      expect(original[0].isRead).toBe(false);
      expect(store.notifications.find(n => n.id === 'n1')?.isRead).toBe(true);
      expect(store.notifications[0]).not.toBe(original[0]);
    });

    it('NT-017: mark lỗi → giữ nguyên isRead = false, không throw', async () => {
      mockMarkAsRead.mockRejectedValue(new Error('Server error'));

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      await expect(store.readNotification('n1')).resolves.toBeUndefined();

      expect(store.notifications.find(n => n.id === 'n1')?.isRead).toBe(false);
      expect(store.unreadCount).toBe(2);
    });

    it('NT-017: id lạ → không crash, không đổi state', async () => {
      mockMarkAsRead.mockResolvedValue(undefined);

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      await expect(store.readNotification('unknown-id')).resolves.toBeUndefined();

      expect(store.unreadCount).toBe(2);
    });

    it('NT-008: 401 ở mark → refresh + retry mark với token mới', async () => {
      mockMarkAsRead.mockRejectedValueOnce(unauthorizedError()).mockResolvedValueOnce(undefined);
      mockRefreshAccessToken.mockResolvedValue('fresh-token-2');

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      await store.readNotification('n1');

      expect(mockRefreshAccessToken).toHaveBeenCalledTimes(1);
      expect(mockMarkAsRead).toHaveBeenCalledTimes(2);
      expect(mockMarkAsRead).toHaveBeenLastCalledWith('n1', 'fresh-token-2');
      expect(store.notifications.find(n => n.id === 'n1')?.isRead).toBe(true);
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

    it('NT-023: isMarkingAll guard — double click không gửi 2 PUT', async () => {
      let resolveMark!: () => void;
      mockMarkAllAsRead.mockReturnValueOnce(new Promise<void>((r) => { resolveMark = r; }));

      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      const first = store.readAll();
      const second = store.readAll();

      resolveMark();
      await Promise.all([first, second]);

      expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
      expect(store.isMarkingAll).toBe(false);
    });
  });

  describe('NT-004: reset khi logout / đổi user', () => {
    it('đổi user (đăng nhập khác / impersonate) → reset danh sách', async () => {
      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      authState.currentUser = { id: 'user-b', username: 'user-b' };
      await flushPromises();

      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toBe(0);
    });

    it('logout (currentUser = null) → reset danh sách', async () => {
      const store = useNotificationStore();
      store.notifications = createMockNotifications();

      authState.currentUser = null;
      await flushPromises();

      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toBe(0);
    });

    it('reset() xóa sạch list + unreadCount + cờ tải', () => {
      const store = useNotificationStore();
      store.notifications = createMockNotifications();
      store.isLoading = true;

      store.reset();

      expect(store.notifications).toEqual([]);
      expect(store.unreadCount).toBe(0);
      expect(store.hasUnread).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.isMarkingAll).toBe(false);
    });

    it('reset() vô hiệu hóa load đang chạy dở (response cũ không lọt vào)', async () => {
      let resolveLoad!: (value: NotificationDto[]) => void;
      mockGetNotifications.mockReturnValueOnce(new Promise<NotificationDto[]>((r) => { resolveLoad = r; }));

      const store = useNotificationStore();
      const pending = store.loadNotifications();

      store.reset();

      resolveLoad(createMockNotifications());
      await pending;

      expect(store.notifications).toEqual([]);
      expect(store.isLoading).toBe(false);
    });
  });
});
