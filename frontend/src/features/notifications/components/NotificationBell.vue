<template>
  <div class="notification-bell" ref="bellRef">
    <!-- NT-013/014: aria-expanded + haspopup + aria-label động kèm số chưa đọc; badge aria-live=polite -->
    <button
      ref="bellButtonRef"
      class="bell-btn"
      :class="{ 'bell-btn--has-unread': notificationStore.hasUnread }"
      title="Thông báo"
      :aria-label="bellAriaLabel"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click="toggleDropdown"
    >
      <BaseIcon name="bell" class="w-[15px] h-[15px]" aria-hidden="true" />

      <span v-if="notificationStore.hasUnread" class="bell-badge" aria-live="polite">
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    <!-- NT-013: dropdown là dialog có focus trap (useModalA11y), đóng bằng Esc -->
    <Transition name="dropdown-fade">
      <div v-if="isOpen" ref="overlayEl" role="dialog" aria-label="Danh sách thông báo" class="notification-dropdown">
        <div class="dropdown-header">
          <span class="dropdown-title">Thông báo</span>
          <button
            v-if="notificationStore.hasUnread"
            class="mark-all-btn"
            :disabled="notificationStore.isMarkingAll"
            @click="handleMarkAll"
          >
            {{ notificationStore.isMarkingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc' }}
          </button>
        </div>

        <!-- NT-012: skeleton khi đang tải — empty state chỉ hiện khi đã tải xong -->
        <div v-if="notificationStore.isLoading" class="dropdown-loading" role="status">
          <span class="dropdown-loading__spinner" aria-hidden="true"></span>
          <p>Đang tải thông báo...</p>
        </div>

        <!-- NT-005: item là <button> — focusable + Enter/Space hoạt động tự nhiên -->
        <div v-else-if="notificationStore.notifications.length > 0" class="dropdown-body">
          <button
            v-for="n in notificationStore.notifications"
            :key="n.id"
            type="button"
            class="notification-item"
            :class="{ 'notification-item--unread': !n.isRead }"
            @click="handleNotificationClick(n)"
          >
            <div class="notification-item__dot" v-if="!n.isRead"></div>
            <div class="notification-item__content">
              <p class="notification-item__text">{{ n.content }}</p>
              <span class="notification-item__time">{{ formatTime(n.createdAt) }}</span>
            </div>
          </button>
        </div>

        <div v-else class="dropdown-empty">
          <span class="dropdown-empty__icon"><BaseIcon name="bell" class="w-6 h-6" /></span>
          <p>Chưa có thông báo nào.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useSignalRStore } from '../../realtime/stores/useSignalRStore';
import { useModalA11y } from '../../../composables/useModalA11y';
import type { NotificationDto } from '../services/notificationApi';

const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const signalRStore = useSignalRStore();
const router = useRouter();

const isOpen = ref(false);
const bellRef = ref<HTMLElement | null>(null);
const bellButtonRef = ref<HTMLElement | null>(null);

// NT-013: focus trap + Esc đóng dropdown (composable dùng chung TC-028/EX-006).
const { overlayEl } = useModalA11y(isOpen, bellButtonRef);

// NT-014: aria-label động — "Thông báo, X chưa đọc" khi có unread.
const bellAriaLabel = computed(() =>
  notificationStore.hasUnread
    ? `Thông báo, ${notificationStore.unreadCount} chưa đọc`
    : 'Thông báo',
);

// NT-009: poll 60s khi authenticated — notification mới tự hiện dù realtime lỗi.
const POLL_INTERVAL_MS = 60_000;
let pollTimer: ReturnType<typeof setInterval> | null = null;

function startPolling(): void {
  stopPolling();
  pollTimer = setInterval(() => {
    void notificationStore.loadNotifications();
  }, POLL_INTERVAL_MS);
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

// NT-002: nối realtime sau khi authenticated — hub badge/level-up đẩy thẳng vào store.
async function ensureRealtimeConnection(): Promise<void> {
  const token = authStore.accessToken;
  if (!token) return;
  if (signalRStore.isNotificationConnected) return;
  try {
    await signalRStore.connectNotifications(token);
  } catch {
    // Lỗi kết nối realtime — polling (NT-009) vẫn là phương án dự phòng.
  }
}

// NT-004: đổi user (impersonate/stop) → ngắt + nối lại hub với token mới.
watch(
  () => authStore.currentUser?.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await signalRStore.disconnectNotifications();
      await ensureRealtimeConnection();
    }
  },
);

watch(
  () => authStore.isAuthenticated,
  async (authenticated) => {
    if (authenticated) {
      await ensureRealtimeConnection();
    } else {
      stopPolling();
      await signalRStore.disconnectNotifications();
    }
  },
);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    void notificationStore.loadNotifications();
  }
}

function handleMarkAll(): void {
  void notificationStore.readAll();
}

function handleNotificationClick(n: NotificationDto) {
  if (!n.isRead) {
    void notificationStore.readNotification(n.id);
  }
  if (n.linkUrl) {
    router.push(n.linkUrl);
  }
  isOpen.value = false;
}

// NT-024: guard "Invalid Date" + clamp diff âm (đồng hồ lệch/server future).
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function handleClickOutside(event: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  void notificationStore.loadNotifications();
  if (authStore.isAuthenticated) {
    void ensureRealtimeConnection();
  }
  startPolling();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  stopPolling();
  void signalRStore.disconnectNotifications();
});
</script>

<style scoped>
@import "./NotificationBell.css";
</style>
