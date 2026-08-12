import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type NotificationDto,
} from '../services/notificationApi';

// NT-011 (phần FE): giới hạn hiển thị 100 bản mới nhất — khớp giới hạn backend.
const MAX_DISPLAY_NOTIFICATIONS = 100;

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore();

  const notifications = ref<NotificationDto[]>([]);
  const isLoading = ref(false);
  const isMarkingAll = ref(false);

  // NT-018: sequence guard — response cũ (mount/toggle/poll chồng nhau) không được ghi đè response mới.
  let loadSequence = 0;

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);
  const hasUnread = computed(() => unreadCount.value > 0);

  // NT-004: đổi user (login khác / impersonate / logout) → reset danh sách ngay trong store
  // (pattern useCourseStore) — user B không thấy badge/list của user A.
  watch(
    () => authStore.currentUser?.id,
    () => { reset(); },
  );

  /** Sắp xếp createdAt giảm dần (mới nhất lên đầu) — NT-025. */
  function sortByCreatedAt(list: NotificationDto[]): NotificationDto[] {
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /** Merge/diff theo id — giữ trạng thái đọc cục bộ (poll không ghi đè vừa mark-read) — NT-025. */
  function mergeByUniqueId(local: NotificationDto[], fetched: NotificationDto[]): NotificationDto[] {
    const merged = new Map<string, NotificationDto>();
    for (const n of local) merged.set(n.id, n);
    for (const n of fetched) {
      if (!merged.has(n.id)) merged.set(n.id, n);
    }
    return sortByCreatedAt([...merged.values()]).slice(0, MAX_DISPLAY_NOTIFICATIONS);
  }

  /**
   * NT-008: chạy action với token hiện tại; gặp 401 → authStore.refreshAccessToken() → retry 1 lần
   * với token mới. Refresh thất bại → reset state (auth store tự toast + redirect landing).
   * Lỗi khác (mạng/5xx) → trả { ok: false }, caller giữ nguyên state.
   */
  async function runWithAuthRetry<T>(
    action: (token: string) => Promise<T>,
  ): Promise<{ ok: true; data: T } | { ok: false }> {
    try {
      const data = await action(authStore.accessToken as string);
      return { ok: true, data };
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status !== 401) return { ok: false };

      let newToken: string | null = null;
      try {
        newToken = await authStore.refreshAccessToken();
      } catch {
        newToken = null;
      }
      if (!newToken) {
        // Phiên chết — auth store đã xóa session + toast + redirect; dọn state tránh stale.
        reset();
        return { ok: false };
      }
      try {
        const data = await action(newToken);
        return { ok: true, data };
      } catch {
        return { ok: false };
      }
    }
  }

  async function loadNotifications(): Promise<void> {
    if (!authStore.isAuthenticated) return;
    const token = authStore.accessToken;
    if (!token) return;

    const seq = ++loadSequence;
    isLoading.value = true;
    try {
      const result = await runWithAuthRetry((t) => getNotifications(t));
      // NT-018: có request mới hơn đã chạy → bỏ qua response cũ.
      if (seq !== loadSequence) return;
      if (result.ok) {
        notifications.value = mergeByUniqueId(notifications.value, result.data);
      }
    } finally {
      // reset() (refresh thất bại) đã tự đặt isLoading = false và tăng loadSequence.
      if (seq === loadSequence) isLoading.value = false;
    }
  }

  // NT-002: nguồn realtime đẩy thẳng vào store chung (badge/list/toast 1 nguồn duy nhất).
  function prependNotification(notification: NotificationDto): void {
    notifications.value = sortByCreatedAt([
      notification,
      ...notifications.value.filter(n => n.id !== notification.id),
    ]).slice(0, MAX_DISPLAY_NOTIFICATIONS);
  }

  async function readNotification(id: string): Promise<void> {
    const token = authStore.accessToken;
    if (!token) return;

    const result = await runWithAuthRetry((t) => markAsRead(id, t));
    if (result.ok) {
      // NT-021: map mảng mới thay vì mutate object trực tiếp.
      notifications.value = notifications.value.map(n => (n.id === id ? { ...n, isRead: true } : n));
    }
  }

  async function readAll(): Promise<void> {
    const token = authStore.accessToken;
    if (!token || isMarkingAll.value) return;

    // NT-023: pending guard — chống double PUT khi click liên tục.
    isMarkingAll.value = true;
    try {
      const result = await runWithAuthRetry((t) => markAllAsRead(t));
      if (result.ok) {
        notifications.value = notifications.value.map(n => ({ ...n, isRead: true }));
      }
    } finally {
      isMarkingAll.value = false;
    }
  }

  // NT-004: reset khi đổi user (logout/impersonate) — ngăn badge/list user A lọt sang user B.
  function reset(): void {
    notifications.value = [];
    isLoading.value = false;
    isMarkingAll.value = false;
    loadSequence++; // vô hiệu hóa load đang chạy dở.
  }

  return {
    notifications,
    isLoading,
    isMarkingAll,
    unreadCount,
    hasUnread,
    loadNotifications,
    prependNotification,
    readNotification,
    readAll,
    reset,
  };
});
