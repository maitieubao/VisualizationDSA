<template>
  <div class="settings-modal-overlay" @click.self="closeModal">
    <div class="settings-modal-dialog">
      
      <div class="settings-modal-header">
        <div class="header-title-box">
          <BaseIcon name="admin" class="w-4 h-4 text-accent mr-2" />
          <h1 class="header-title">Settings</h1>
        </div>

        <div class="header-right-actions">
          <div class="user-tier-badge" :class="{ 'user-tier-badge--pro': authStore.isPremium }">
            <BaseIcon :name="authStore.isPremium ? 'diamond' : 'badge'" class="w-3.5 h-3.5 mr-1" />
            <span>{{ authStore.isPremium ? 'PRO' : 'Standard' }}</span>
          </div>
          <button class="modal-close-btn" @click="closeModal" title="Đóng Cài Đặt (Esc)">
            <BaseIcon name="close" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      
      <div class="settings-modal-body">
        
        <aside class="modal-sidebar">
          <div class="sidebar-user-card">
            <div class="user-avatar" :class="{ 'user-avatar--pro': authStore.isPremium }">
              {{ initials }}
            </div>
            <div class="user-meta">
              <span class="user-display-name">{{ currentNickname || authStore.userName }}</span>
              <span class="user-email-text">{{ authStore.currentUser?.email }}</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-group">
              <span class="nav-group-label">HỒ SƠ CÁ NHÂN</span>
              <button class="nav-item" :class="{ 'nav-item--active': activeTab === 'general' }" @click="activeTab = 'general'">
                <BaseIcon name="admin" class="nav-icon" />
                <span>General</span>
              </button>
              <button class="nav-item" :class="{ 'nav-item--active': activeTab === 'progress' }" @click="activeTab = 'progress'">
                <BaseIcon name="medal" class="nav-icon" />
                <span>Badges & Progress</span>
                <span class="nav-badge-pill">{{ badgesCount }}</span>
              </button>
              <button class="nav-item" :class="{ 'nav-item--active': activeTab === 'history' }" @click="activeTab = 'history'">
                <BaseIcon name="clipboard-list" class="nav-icon" />
                <span>Quiz History</span>
              </button>
            </div>

            <div class="nav-group">
              <span class="nav-group-label">HỆ THỐNG & BẢO MẬT</span>
              <button class="nav-item" :class="{ 'nav-item--active': activeTab === 'security' }" @click="activeTab = 'security'">
                <BaseIcon name="shield" class="nav-icon" />
                <span>Security</span>
              </button>
              <button class="nav-item" :class="{ 'nav-item--active': activeTab === 'preferences' }" @click="activeTab = 'preferences'">
                <BaseIcon name="pattern-hunter" class="nav-icon" />
                <span>Preferences</span>
              </button>
              <button class="nav-item" :class="{ 'nav-item--active': activeTab === 'about' }" @click="activeTab = 'about'">
                <BaseIcon name="dsa-champion" class="nav-icon" />
                <span>About</span>
              </button>
            </div>
          </nav>
        </aside>

        
        <main class="modal-content-panel">
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import ProfileGeneralTab from './ProfileGeneralTab.vue';
import ProfileProgressTab from './ProfileProgressTab.vue';
import ProfileHistoryTab from './ProfileHistoryTab.vue';
import ProfileSecurityTab from './ProfileSecurityTab.vue';
import ProfilePreferencesTab from './ProfilePreferencesTab.vue';
import ProfileAboutTab from './ProfileAboutTab.vue';

const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref<'general' | 'progress' | 'history' | 'security' | 'preferences' | 'about'>('general');

function closeModal() {
  if (window.history.length > 1) { router.back(); } else { router.push('/dashboard'); }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal();
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  await authStore.loadStatelessProfile();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

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
