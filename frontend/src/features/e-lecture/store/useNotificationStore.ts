/**
 * useNotificationStore.ts — Pinia store quản lý thông báo người dùng.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '../../auth/store/useAuthStore';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type NotificationDto,
} from '../services/notificationApi';

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore();

  // ── State ──
  const notifications = ref<NotificationDto[]>([]);
  const isLoading = ref(false);

  // ── Getters ──
  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);
  const hasUnread = computed(() => unreadCount.value > 0);

  // ── Actions ──

  async function loadNotifications(): Promise<void> {
    if (!authStore.isAuthenticated) return;
    const token = authStore.accessToken;
    if (!token) return;

    isLoading.value = true;
    try {
      notifications.value = await getNotifications(token);
    } catch {
      // silent — notification loading failure is non-critical
    } finally {
      isLoading.value = false;
    }
  }

  async function readNotification(id: string): Promise<void> {
    const token = authStore.accessToken;
    if (!token) return;

    try {
      await markAsRead(id, token);
      const notification = notifications.value.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
    } catch { /* silent */ }
  }

  async function readAll(): Promise<void> {
    const token = authStore.accessToken;
    if (!token) return;

    try {
      await markAllAsRead(token);
      notifications.value.forEach(n => { n.isRead = true; });
    } catch { /* silent */ }
  }

  return {
    notifications,
    isLoading,
    unreadCount,
    hasUnread,
    loadNotifications,
    readNotification,
    readAll,
  };
});
