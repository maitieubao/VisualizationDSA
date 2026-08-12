<template>
  <div v-if="modalOpen" ref="overlayEl" class="settings-modal-overlay" role="dialog" aria-modal="true" aria-label="Cài đặt tài khoản" @click.self="closeModal">
    <div class="settings-modal-dialog">

      <div class="settings-modal-header">
        <div class="header-title-box">
          <BaseIcon name="admin" class="w-4 h-4 text-accent mr-2" />
          <!-- PR-030: thống nhất ngôn ngữ tiếng Việt -->
          <h1 class="header-title">Cài đặt</h1>
        </div>

        <div class="header-right-actions">
          <div class="user-tier-badge" :class="{ 'user-tier-badge--pro': authStore.isPremium }">
            <BaseIcon :name="authStore.isPremium ? 'diamond' : 'badge'" class="w-3.5 h-3.5 mr-1" />
            <span>{{ authStore.isPremium ? 'PRO' : 'Standard' }}</span>
          </div>
          <!-- PR-030: aria-label tiếng Việt cho nút đóng -->
          <button class="modal-close-btn" @click="closeModal" aria-label="Đóng cài đặt">
            <BaseIcon name="close" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div class="settings-modal-body">
        <aside class="modal-sidebar">
          <div class="sidebar-user-card">
            <div class="user-avatar" :class="{ 'user-avatar--pro': authStore.isPremium }">
              <img v-if="avatarUrl" :src="avatarUrl" alt="Ảnh đại diện" class="user-avatar-img" />
              <template v-else>{{ initials }}</template>
            </div>
            <div class="user-meta">
              <span class="user-display-name">{{ currentNickname || authStore.userName }}</span>
              <span class="user-email-text">{{ authStore.currentUser?.email }}</span>
            </div>
          </div>

          <!-- PR-004: nav tabs đủ ARIA tablist/tab — role, aria-selected, aria-controls,
               tabindex roving + phím Arrow/Home/End -->
          <nav class="sidebar-nav" aria-label="Khu vực cài đặt tài khoản">
            <div class="nav-group" role="tablist" aria-label="Hồ sơ cá nhân">
              <span class="nav-group-label">HỒ SƠ CÁ NHÂN</span>
              <button
                id="profile-tab-general"
                class="nav-item"
                role="tab"
                :aria-selected="activeTab === 'general'"
                aria-controls="profile-panel"
                :tabindex="activeTab === 'general' ? 0 : -1"
                @click="activeTab = 'general'"
                @keydown="onTabKeydown($event, 'general', 'profile')"
              >
                <BaseIcon name="admin" class="nav-icon" />
                <span>Hồ sơ cá nhân</span>
              </button>
              <button
                id="profile-tab-progress"
                class="nav-item"
                role="tab"
                :aria-selected="activeTab === 'progress'"
                aria-controls="profile-panel"
                :tabindex="activeTab === 'progress' ? 0 : -1"
                @click="activeTab = 'progress'"
                @keydown="onTabKeydown($event, 'progress', 'profile')"
              >
                <BaseIcon name="medal" class="nav-icon" />
                <span>Huy hiệu &amp; Tiến trình</span>
                <span class="nav-badge-pill">{{ badgesCount }}</span>
              </button>
              <button
                id="profile-tab-history"
                class="nav-item"
                role="tab"
                :aria-selected="activeTab === 'history'"
                aria-controls="profile-panel"
                :tabindex="activeTab === 'history' ? 0 : -1"
                @click="activeTab = 'history'"
                @keydown="onTabKeydown($event, 'history', 'profile')"
              >
                <BaseIcon name="clipboard-list" class="nav-icon" />
                <span>Lịch sử làm bài</span>
              </button>
            </div>

            <div class="nav-group" role="tablist" aria-label="Hệ thống và bảo mật">
              <span class="nav-group-label">HỆ THỐNG &amp; BẢO MẬT</span>
              <button
                id="profile-tab-security"
                class="nav-item"
                role="tab"
                :aria-selected="activeTab === 'security'"
                aria-controls="profile-panel"
                :tabindex="activeTab === 'security' ? 0 : -1"
                @click="activeTab = 'security'"
                @keydown="onTabKeydown($event, 'security', 'system')"
              >
                <BaseIcon name="shield" class="nav-icon" />
                <span>Bảo mật</span>
              </button>
              <button
                id="profile-tab-preferences"
                class="nav-item"
                role="tab"
                :aria-selected="activeTab === 'preferences'"
                aria-controls="profile-panel"
                :tabindex="activeTab === 'preferences' ? 0 : -1"
                @click="activeTab = 'preferences'"
                @keydown="onTabKeydown($event, 'preferences', 'system')"
              >
                <BaseIcon name="pattern-hunter" class="nav-icon" />
                <span>Tùy chọn</span>
              </button>
              <button
                id="profile-tab-about"
                class="nav-item"
                role="tab"
                :aria-selected="activeTab === 'about'"
                aria-controls="profile-panel"
                :tabindex="activeTab === 'about' ? 0 : -1"
                @click="activeTab = 'about'"
                @keydown="onTabKeydown($event, 'about', 'system')"
              >
                <BaseIcon name="dsa-champion" class="nav-icon" />
                <span>Giới thiệu</span>
              </button>
            </div>
          </nav>
        </aside>

        <!-- PR-004: tabpanel duy nhất, aria-labelledby trỏ tới tab đang active -->
        <main id="profile-panel" class="modal-content-panel" role="tabpanel" :aria-labelledby="`profile-tab-${activeTab}`" tabindex="0">
          <ProfileGeneralTab v-if="activeTab === 'general'" />
          <ProfileProgressTab v-else-if="activeTab === 'progress'" />
          <ProfileHistoryTab v-else-if="activeTab === 'history'" />
          <ProfileSecurityTab v-else-if="activeTab === 'security'" />
          <ProfilePreferencesTab v-else-if="activeTab === 'preferences'" />
          <ProfileAboutTab v-else-if="activeTab === 'about'" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useModalA11y } from '../../composables/useModalA11y';
import { useToastStore } from '../../composables/useToast';
import ProfileGeneralTab from './ProfileGeneralTab.vue';
import ProfileProgressTab from './ProfileProgressTab.vue';
import ProfileHistoryTab from './ProfileHistoryTab.vue';
import ProfileSecurityTab from './ProfileSecurityTab.vue';
import ProfilePreferencesTab from './ProfilePreferencesTab.vue';
import ProfileAboutTab from './ProfileAboutTab.vue';

const router = useRouter();
const authStore = useAuthStore();
const toastStore = useToastStore();

type TabKey = 'general' | 'progress' | 'history' | 'security' | 'preferences' | 'about';
const activeTab = ref<TabKey>('general');

// PR-003/019: modal a11y dùng chung — role=dialog + focus trap + Esc + scroll-lock + restore focus.
// Bắt đầu false rồi bật sau mount để watcher của composable khởi động đúng (route-based modal).
const modalOpen = ref(false);
const { overlayEl } = useModalA11y(modalOpen);

// PR-019: khi modal đóng (Esc/click overlay) → thoát về trang trước; watcher này nối
// trạng thái modal của composable với navigation của route.
watch(modalOpen, (open) => {
  if (!open) navigateBack();
});

function navigateBack(): void {
  if (window.history.length > 1) { router.back(); } else { router.push('/dashboard'); }
}

function closeModal(): void {
  modalOpen.value = false;
}

// PR-004: điều hướng bàn phím giữa các tab — Arrow/Home/End + focus theo dõi (roving).
const PROFILE_TABS: TabKey[] = ['general', 'progress', 'history'];
const SYSTEM_TABS: TabKey[] = ['security', 'preferences', 'about'];

function onTabKeydown(e: KeyboardEvent, tab: TabKey, group: 'profile' | 'system'): void {
  const groupTabs = group === 'profile' ? PROFILE_TABS : SYSTEM_TABS;
  const index = groupTabs.indexOf(tab);
  let next: TabKey | null = null;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    next = groupTabs[(index + 1) % groupTabs.length];
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    next = groupTabs[(index - 1 + groupTabs.length) % groupTabs.length];
  } else if (e.key === 'Home') {
    next = groupTabs[0];
  } else if (e.key === 'End') {
    next = groupTabs[groupTabs.length - 1];
  }
  if (next) {
    e.preventDefault();
    activeTab.value = next;
    (document.getElementById(`profile-tab-${next}`) as HTMLElement | null)?.focus();
  }
}

onMounted(async () => {
  try {
    await authStore.loadStatelessProfile();
  } catch {
    // PR-027: loadStatelessProfile ném ra khi lỗi AUTH thật (401/403) — báo rõ phiên hết hạn
    // thay vì nuốt im lặng; lỗi mạng/5xx đã được store bỏ qua từ trước.
    toastStore.warning('Phiên đã hết hạn, vui lòng đăng nhập lại.');
  }
  modalOpen.value = true;
});

const avatarUrl = computed(() => authStore.currentUser?.avatarUrl || null);
const initials = computed(() => {
  const name = authStore.currentUser?.nickname || authStore.userName;
  return name ? name.charAt(0).toUpperCase() : 'U';
});

const currentNickname = computed(() => authStore.currentUser?.nickname);
const badgesCount = computed(() => authStore.currentUser?.badges?.length || 0);
</script>

<style>
@import "./ProfileView.css";
</style>
