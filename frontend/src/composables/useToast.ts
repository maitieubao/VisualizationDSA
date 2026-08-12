

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

// CU-013: cấu trúc ApiError trả về từ apiClient (shared/services) — nhận diện theo shape.
export interface ApiErrorLike {
  status?: number;
  title?: string;
  detail?: string;
  message?: string;
}

function isApiErrorLike(err: unknown): err is ApiErrorLike {
  if (typeof err !== 'object' || err === null) return false;
  const record = err as Record<string, unknown>;
  return typeof record.detail === 'string'
    || typeof record.title === 'string'
    || typeof record.message === 'string';
}

let nextId = 0;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([]);
  const maxToasts = 5;
  // CU-013: theo dõi timer theo id toast — clear khi remove/clearAll, tránh rò rỉ timer.
  const timers = new Map<number, ReturnType<typeof setTimeout>>();

  const activeToasts = computed(() => toasts.value.slice(-maxToasts));

  function clearToastTimer(id: number): void {
    const timer = timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }

  function scheduleAutoClose(id: number, duration: number): void {
    // CU-013: duration <= 0 → toast vĩnh viễn, không tạo timer.
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      timers.delete(id);
      removeToast(id);
    }, duration);
    timers.set(id, timer);
  }

  function addToast(type: ToastType, title: string, message: string, duration = 4000): void {
    const id = ++nextId;
    const toast: ToastItem = { id, type, title, message, duration, createdAt: Date.now() };
    toasts.value.push(toast);

    // CU-013: cap danh sách — toast cũ nhất bị đẩy ra khi vượt maxToasts (kèm clear timer).
    while (toasts.value.length > maxToasts) {
      const removed = toasts.value.shift();
      if (removed) clearToastTimer(removed.id);
    }

    scheduleAutoClose(id, duration);
  }

  function removeToast(id: number): void {
    clearToastTimer(id);
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
    // CU-013: clear mọi timer đang treo trước khi rỗng danh sách.
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    toasts.value = [];
  }

  function handleApiError(err: unknown, fallbackMessage = 'Đã xảy ra lỗi không xác định.'): void {
    // CU-013: nhận diện ApiError (object {status, title, detail}) từ apiClient —
    // ưu tiên detail/title để hiển thị chi tiết lỗi backend thay vì nuốt im lặng.
    if (isApiErrorLike(err)) {
      error(err.detail || err.title || err.message || fallbackMessage);
    } else if (err instanceof Error) {
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
