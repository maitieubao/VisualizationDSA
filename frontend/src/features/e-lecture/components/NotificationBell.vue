<template>
  <div class="notification-bell" ref="bellRef">
    <!-- Bell icon button -->
    <button
      class="bell-btn"
      :class="{ 'bell-btn--has-unread': notificationStore.hasUnread }"
      title="Thông báo"
      aria-label="Thông báo"
      @click="toggleDropdown"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <!-- Unread badge -->
      <span v-if="notificationStore.hasUnread" class="bell-badge">
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown-fade">
      <div v-if="isOpen" class="notification-dropdown">
        <div class="dropdown-header">
          <span class="dropdown-title">Thông báo</span>
          <button
            v-if="notificationStore.hasUnread"
            class="mark-all-btn"
            @click="notificationStore.readAll()"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div class="dropdown-body" v-if="notificationStore.notifications.length > 0">
          <div
            v-for="n in notificationStore.notifications"
            :key="n.id"
            class="notification-item"
            :class="{ 'notification-item--unread': !n.isRead }"
            @click="handleNotificationClick(n)"
          >
            <div class="notification-item__dot" v-if="!n.isRead"></div>
            <div class="notification-item__content">
              <p class="notification-item__text">{{ n.content }}</p>
              <span class="notification-item__time">{{ formatTime(n.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="dropdown-empty">
          <span class="dropdown-empty__icon">🔔</span>
          <p>Chưa có thông báo nào.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../e-lecture/store/useNotificationStore';
import type { NotificationDto } from '../../e-lecture/services/notificationApi';

const notificationStore = useNotificationStore();
const router = useRouter();

const isOpen = ref(false);
const bellRef = ref<HTMLElement | null>(null);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    notificationStore.loadNotifications();
  }
}

function handleNotificationClick(n: NotificationDto) {
  if (!n.isRead) {
    notificationStore.readNotification(n.id);
  }
  if (n.linkUrl) {
    router.push(n.linkUrl);
  }
  isOpen.value = false;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
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
  notificationStore.loadNotifications();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted, #94a3b8);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.bell-btn:hover {
  background: var(--color-bg-hover, rgba(255, 255, 255, 0.05));
  color: var(--color-text-primary, #e2e8f0);
  border-color: var(--color-border-subtle, rgba(255, 255, 255, 0.08));
}

.bell-btn--has-unread {
  color: var(--color-accent-primary, #06b6d4);
  animation: bell-ring 2s ease-in-out infinite;
}

@keyframes bell-ring {
  0%, 100% { transform: rotate(0deg); }
  5% { transform: rotate(15deg); }
  10% { transform: rotate(-15deg); }
  15% { transform: rotate(10deg); }
  20% { transform: rotate(-10deg); }
  25% { transform: rotate(0deg); }
}

.bell-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--color-accent-red, #ef4444);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
  pointer-events: none;
}

/* ── Dropdown ── */
.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 340px;
  max-height: 420px;
  background: var(--color-bg-surface, #1e293b);
  border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.1));
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  z-index: 9999;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.06));
}

.dropdown-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #e2e8f0);
}

.mark-all-btn {
  font-size: 11px;
  color: var(--color-accent-primary, #06b6d4);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.2s;
}

.mark-all-btn:hover {
  background: rgba(6, 182, 212, 0.1);
}

.dropdown-body {
  max-height: 350px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.notification-item:hover {
  background: var(--color-bg-hover, rgba(255, 255, 255, 0.04));
}

.notification-item--unread {
  background: rgba(6, 182, 212, 0.04);
}

.notification-item__dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  background: var(--color-accent-primary, #06b6d4);
  margin-top: 5px;
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.4);
}

.notification-item__content {
  flex: 1;
  min-width: 0;
}

.notification-item__text {
  font-size: 12px;
  color: var(--color-text-primary, #e2e8f0);
  line-height: 1.5;
  margin: 0;
  word-break: break-word;
}

.notification-item__time {
  font-size: 10px;
  color: var(--color-text-muted, #64748b);
  margin-top: 4px;
  display: block;
}

.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--color-text-muted, #64748b);
}

.dropdown-empty__icon {
  font-size: 24px;
  opacity: 0.4;
}

.dropdown-empty p {
  font-size: 12px;
  margin: 0;
}

/* ── Dropdown transition ── */
.dropdown-fade-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
