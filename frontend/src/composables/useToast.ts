/**
 * useToast.ts — Global Toast Notification System (Pinia-powered).
 * Hiển thị toast thông báo lỗi / thành công / cảnh báo bằng Tiếng Việt.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  createdAt: number;
}

let nextId = 0;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([]);
  const maxToasts = 5;

  const activeToasts = computed(() => toasts.value.slice(-maxToasts));

  function addToast(type: ToastType, title: string, message: string, duration = 4000): void {
    const id = ++nextId;
    const toast: ToastItem = { id, type, title, message, duration, createdAt: Date.now() };
    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }

  function removeToast(id: number): void {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  function success(message: string, title = 'Thành công'): void {
    addToast('success', title, message);
  }

  function error(message: string, title = 'Lỗi'): void {
    addToast('error', title, message, 6000);
  }

  function warning(message: string, title = 'Cảnh báo'): void {
    addToast('warning', title, message, 5000);
  }

  function info(message: string, title = 'Thông báo'): void {
    addToast('info', title, message);
  }

  function clearAll(): void {
    toasts.value = [];
  }

  /**
   * Xử lý lỗi API tự động — parse structured JSON từ ErrorHandlingMiddleware.
   */
  function handleApiError(err: unknown, fallbackMessage = 'Đã xảy ra lỗi không xác định.'): void {
    if (err instanceof Error) {
      error(err.message);
    } else if (typeof err === 'string') {
      error(err);
    } else {
      error(fallbackMessage);
    }
  }

  return {
    toasts, activeToasts,
    addToast, removeToast, clearAll,
    success, error, warning, info, handleApiError,
  };
});
