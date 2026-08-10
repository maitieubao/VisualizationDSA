<template>
  <div class="notification-bell" ref="bellRef">
    
    <button
      class="bell-btn"
      :class="{ 'bell-btn--has-unread': notificationStore.hasUnread }"
      title="Thông báo"
      aria-label="Thông báo"
      @click="toggleDropdown"
    >
      <BaseIcon name="bell" class="w-[15px] h-[15px]" aria-hidden="true" />
      
      <span v-if="notificationStore.hasUnread" class="bell-badge">
        {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
      </span>
    </button>

    
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
          <span class="dropdown-empty__icon"><BaseIcon name="bell" class="w-6 h-6" /></span>
          <p>Chưa có thông báo nào.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../store/useNotificationStore';
import type { NotificationDto } from '../services/notificationApi';

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
@import "./NotificationBell.css";
</style>
