<template>
  





  <div class="app-shell" :class="{ 'is-embed': isMinimalMode }">
    
    <AppHeader
      v-if="!isMinimalMode"
      @logout="handleLogout"
      @openLogin="handleOpenLogin"
    />

    
    <!-- ══════════════════════════════════════════════════════════
         BODY — Sidebar + Main Content Layout
    ══════════════════════════════════════════════════════════ -->
    <div class="app-body">
      <!-- ── LEFT SIDEBAR — Vertical Tab Navigation (hidden on landing) ── -->
      <aside v-if="!isLandingPage && !isMinimalMode" class="app-sidebar" :class="{ 'app-sidebar--collapsed': isSidebarCollapsed }" aria-label="Sidebar navigation">
        <!-- Collapse Button for Desktop -->
        <div class="sidebar-toggle-container">
          <button class="collapse-toggle-btn" @click="toggleSidebar" :title="isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'">
            <svg v-if="isSidebarCollapsed" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
          </button>
        </div>
        <nav class="sidebar-nav">
          <template v-for="tabOrGroup in filteredTabs" :key="'groupName' in tabOrGroup ? tabOrGroup.groupName : tabOrGroup.id">
            <!-- If it is a group -->
            <div v-if="'groupName' in tabOrGroup" class="sidebar-group">
              <div class="sidebar-group__title">{{ tabOrGroup.groupName }}</div>
              <div class="sidebar-group__items">
                <RouterLink
                  v-for="tab in tabOrGroup.items"
                  :key="tab.id"
                  :to="tab.path"
                  class="nav-tab"
                  active-class="nav-tab--active"
                >
                  <BaseIcon :name="tab.id" class="nav-tab__icon" />
                  <span class="nav-tab__label">{{ tab.name }}</span>
                </RouterLink>
              </div>
            </div>
            <!-- If it is a top-level item -->
            <RouterLink
              v-else
              :to="tabOrGroup.path"
              class="nav-tab"
              active-class="nav-tab--active"
            >
              <BaseIcon :name="tabOrGroup.id" class="nav-tab__icon" />
              <span class="nav-tab__label">{{ tabOrGroup.name }}</span>
            </RouterLink>
          </template>
        </nav>
      </aside>

      <!-- ── MAIN CONTENT AREA ── -->
      
      <main class="app-main" :class="{ 'app-main--full': isLandingPage }">
        <RouterView v-slot="{ Component }">
          <Transition name="page-fade">
            <component
              v-if="Component"
              :is="Component"
              :key="$route.fullPath"
              class="app-view"
              @openLogin="handleOpenLogin"
            />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>

  <!-- Impersonation Banner (Phase C) -->
  <div v-if="authStore.isImpersonating" class="impersonate-banner">
    <div class="impersonate-banner__pulse"></div>
    <div class="impersonate-banner__text">
      <span class="impersonate-banner__icon" aria-hidden="true">🎭</span>
      <span>Đang đóng vai: <strong>{{ authStore.userName }}</strong></span>
    </div>
    <button class="impersonate-banner__btn" @click="handleStopImpersonating">
      Thoát đóng vai
    </button>
  </div>

  <!-- Sync Error Banner -->
  <div v-if="progressStore.isSyncError" class="sync-error-banner">
    <div class="sync-error-banner__pulse"></div>
    <div class="sync-error-banner__text">
      <span class="sync-error-banner__icon" aria-hidden="true">⚠️</span>
      <span>Đồng bộ tiến trình thất bại.</span>
    </div>
    <button class="sync-error-banner__btn" :disabled="isSyncingProgress" @click="handleRetrySync">
      {{ isSyncingProgress ? 'Đang thử...' : 'Thử lại' }}
    </button>
  </div>

  
  <LoginModal :visible="showLoginModal" @close="showLoginModal = false" />

  
  <ToastContainer />

  
  <GuidedTourOverlay />

  <!-- Epic 2 Gamification Modals -->
  <OutOfHeartsModal 
    :show="sessionStore.showOutOfHeartsModal"
    :recoveryInfo="sessionStore.outOfHeartsRecoveryInfo"
    @close="sessionStore.closeOutOfHearts()"
    @watch-ad="handleWatchAd"
  />

  <SessionResumePrompt 
    :show="sessionStore.showResumePromptModal"
    :currentStep="sessionStore.pendingSessionInfo?.currentStep || 'Theory'"
    @resume="sessionStore.handleResumePromptDecision(true)"
    @restart="sessionStore.handleResumePromptDecision(false)"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { useGuidedTourStore } from './features/guided-tour/store/useGuidedTourStore';
import AppHeader from './components/AppHeader.vue';
import LoginModal from './features/auth/components/LoginModal.vue';
import ToastContainer from './components/ToastContainer.vue';
import { useUserProgressStore } from './features/gamification/user-progress/store/useUserProgressStore';
// NotificationBell removed
import HeartDisplay from './components/common/HeartDisplay.vue';

// Epic 2 Session
import { useSessionStore } from './features/gamification/gamification-engine/store/useSessionStore';
import OutOfHeartsModal from './features/gamification/components/OutOfHeartsModal.vue';
import SessionResumePrompt from './features/gamification/components/SessionResumePrompt.vue';
import GuidedTourOverlay from './features/guided-tour/components/GuidedTourOverlay.vue';
import { useThemeStore } from './shared/store/useThemeStore';

const authStore      = useAuthStore();
const progressStore  = useUserProgressStore();
const sessionStore   = useSessionStore();
const themeStore     = useThemeStore();
const tourStore      = useGuidedTourStore();
const route          = useRoute();
const router         = useRouter();
const showLoginModal = ref(false);
const isSyncingProgress = ref(false);

const isSidebarCollapsed = ref(false);
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}
const filteredTabs = computed<any[]>(() => {
  return [
    { id: 'dashboard', name: 'Bảng điều khiển', path: '/dashboard' },
    { id: 'courses', name: 'Lộ trình', path: '/courses' },
    { id: 'classrooms', name: 'Lớp học', path: '/classrooms' },
    { id: 'gems-shop', name: 'Cửa hàng', path: '/gems-shop' },
    { id: 'teacher', name: 'Teacher', path: '/teacher' },
  ];
});

const isLandingPage = computed(() => route.name === 'landing');
const isMinimalMode = computed(() => route.path === '/embed' && route.query.algo !== undefined);

async function handleRetrySync(): Promise<void> {
  isSyncingProgress.value = true;
  try {
    await progressStore.loadProgress();
  } finally {
    isSyncingProgress.value = false;
  }
}

async function handleLogout(): Promise<void> {
  if (authStore.isStatelessMode) {
    await authStore.statelessLogout();
  } else {
    await authStore.logOut();
  }
  router.push('/');
}

function handleOpenLogin(): void {
  showLoginModal.value = true;
}

function handleStopImpersonating(): void {
  authStore.stopImpersonating();
  alert('Đã thoát chế độ đóng vai. Khôi phục tài khoản Admin.');
  router.push('/admin');
}

onMounted(() => {
  authStore.init();
  // tourStore.initTour();
  themeStore.initTheme();
  authStore.statelessInit();
  tourStore.initTour();
});

async function handleWatchAd() {
  // Call watch-ad API logic here, then close modal
  // Example placeholder for watch-ad
  try {
    // await gamificationApi.watchAd();
    sessionStore.closeOutOfHearts();
    // authStore.startHeartTimer(0); // reset if needed
  } catch (error) {
    console.error(error);
  }
}
</script>

<style scoped>
/* ============================================================
   APP SHELL LAYOUT
   Tất cả màu sắc dùng CSS variables từ src/styles/theme.css
   KHÔNG hardcode màu trực tiếp tại đây
   ============================================================ */

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  overflow: hidden;
}

/* ── HEADER ─────────────────────────────────────────────── */
.app-header {
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px) saturate(1.3);
  -webkit-backdrop-filter: blur(16px) saturate(1.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  height: var(--header-height);
  position: relative;
  z-index: var(--z-raised);
}

.app-header__inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: 100%;
  padding: 0 var(--space-4);
}

/* ── LOGO ────────────────────────────────────────────────── */
.header-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  align-items: baseline;
  gap: 0;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
  line-height: 1;
}

.logo-prefix {
  color: var(--color-accent-primary);
}

.logo-name {
  color: var(--color-text-primary);
}

.logo-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: var(--font-normal);
  color: var(--color-text-muted);
  background: var(--color-bg-active);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  letter-spacing: 0.05em;
}

/* ── APP BODY & SIDEBAR ───────────────────────────────────── */
.app-body {
  display: flex;
  flex-direction: column; /* Default: stacked vertically on mobile */
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .app-body {
    flex-direction: row; /* Desktop: side-by-side */
  }
}

.app-sidebar {
  width: 100%;
  height: 48px;
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.55);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 var(--space-3);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  scrollbar-width: none; /* Hide scrollbar on mobile */
  -ms-overflow-style: none;
}
.app-sidebar::-webkit-scrollbar { display: none; }

@media (min-width: 1024px) {
  .app-sidebar {
    width: 230px;
    height: 100%;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    flex-direction: column;
    align-items: stretch;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--space-4) var(--space-3);
    padding-bottom: 60px; /* Safe bottom padding to prevent cutoff on low-height viewports */
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.sidebar-toggle-container {
  display: none;
}

@media (min-width: 1024px) {
  .sidebar-toggle-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
    padding: 0 8px;
    width: 100%;
    box-sizing: border-box;
  }
}

.collapse-toggle-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-muted);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-toggle-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-default);
}

@media (min-width: 1024px) {
  .app-sidebar--collapsed {
    width: 68px !important;
    padding: var(--space-4) 8px !important;
    align-items: center !important;
  }

  .app-sidebar--collapsed .sidebar-toggle-container {
    justify-content: center;
    padding: 0;
  }

  .app-sidebar--collapsed .sidebar-group__title,
  .app-sidebar--collapsed .nav-tab__label {
    display: none !important;
  }

  .app-sidebar--collapsed .nav-tab {
    justify-content: center;
    padding: 8px 0 !important;
    width: 44px;
  }

  .app-sidebar--collapsed .sidebar-group {
    align-items: center;
    width: 100%;
  }
}

@media (min-width: 1024px) {
  .app-sidebar::-webkit-scrollbar {
    width: 4px;
    display: block;
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: row; /* Horizontal on mobile */
  gap: 6px;
}

@media (min-width: 1024px) {
  .sidebar-nav {
    flex-direction: column; /* Vertical on desktop */
    gap: var(--space-4);
  }
}

.sidebar-group {
  display: contents; /* Flat list structure on mobile */
}

@media (min-width: 1024px) {
  .sidebar-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .sidebar-group__title {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    padding: 0 var(--space-3);
    margin-bottom: 2px;
  }
  
  .sidebar-group__items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 1023px) {
  .sidebar-group__title {
    display: none;
  }
  .sidebar-group__items {
    display: flex;
    flex-direction: row;
    gap: 6px;
  }
}

.spacer {
  flex: 1;
}

/* ── NAV TABS ────────────────────────────────────────────── */
.nav-tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px var(--space-3);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--tab-text-default);
  background: var(--tab-bg-default);
  border: 1px solid transparent;
  white-space: nowrap;
  text-decoration: none;
  transition: var(--transition-fast);
  cursor: pointer;
  position: relative;
}

@media (min-width: 1024px) {
  .nav-tab {
    gap: var(--space-3);
    padding: 8px var(--space-3);
    width: 100%;
  }
}

.nav-tab:hover {
  color: var(--tab-text-hover);
  background: var(--tab-bg-hover);
  border-color: var(--color-border-subtle);
}

.nav-tab--active {
  color: var(--tab-text-active) !important;
  background: var(--tab-bg-active) !important;
  border-color: var(--color-border-default) !important;
}

/* Active tab — bottom accent line on mobile, vertical left accent line on desktop */
.nav-tab--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: var(--tab-border-active);
  border-radius: var(--radius-full) var(--radius-full) 0 0;
}

@media (min-width: 1024px) {
  .nav-tab--active::after {
    bottom: auto;
    left: 0;
    top: 25%;
    transform: none;
    width: 3px;
    height: 50%;
    border-radius: 0 var(--radius-full) var(--radius-full) 0;
  }
}

.nav-tab__icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
  flex-shrink: 0;
}

.nav-tab--active .nav-tab__icon { opacity: 1; }

.nav-tab__label { line-height: 1.2; }

/* ── RIGHT CONTROLS ──────────────────────────────────────── */
.header-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

/* Role Badges */
.role-badge {
  font-size: 1.1rem;
  padding: 2px 4px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  cursor: help;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.role-badge--admin {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.2));
  border-color: rgba(239, 68, 68, 0.3);
}
.role-badge--teacher {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.2));
  border-color: rgba(59, 130, 246, 0.3);
}
.role-badge--premium {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(180, 83, 9, 0.2));
  border-color: rgba(245, 158, 11, 0.3);
}
.role-badge--free {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(4, 120, 87, 0.2));
  border-color: rgba(16, 185, 129, 0.3);
}

/* User badge */
.user-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 5px var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  cursor: pointer;
}

.user-badge:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-default);
  transform: translateY(-1px);
}

.user-badge__avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: linear-gradient(
    135deg,
    var(--color-accent-primary),
    var(--color-accent-purple)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: var(--font-bold);
  color: #fff;
  flex-shrink: 0;
}

.user-badge__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1;
}

.user-badge__name {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.avatar-frame--neon {
  border: 2px solid #00f3ff;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.6), inset 0 0 5px rgba(0, 243, 255, 0.4);
}
.avatar-frame--gold {
  border: 2px solid #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6), inset 0 0 5px rgba(255, 215, 0, 0.4);
}
.avatar-frame--diamond {
  border: 2px solid #b9f2ff;
  box-shadow: 0 0 15px rgba(185, 242, 255, 0.8), inset 0 0 8px rgba(185, 242, 255, 0.5);
}

.user-badge__meta {
  font-size: 10px;
  color: var(--color-accent-primary);
  font-family: var(--font-mono);
}

/* Icon buttons */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  text-decoration: none;
  flex-shrink: 0;
}

.btn-icon--ghost {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid transparent;
}

.btn-icon--ghost:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
  border-color: var(--color-border-subtle);
}

/* Primary action button */
.btn-primary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 5px var(--space-4);
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--btn-primary-bg-hover);
  box-shadow: var(--btn-primary-shadow);
}

/* ── MAIN CONTENT ────────────────────────────────────────── */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--space-4);
  gap: var(--space-4);
}

.app-main--full {
  padding: 0;
  overflow-y: auto;
}

.app-view {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* ── PAGE TRANSITION ─────────────────────────────────────── */
/* IMPORTANT: Must use :global() because <Transition> injects classes on child
   elements that don't carry App.vue's scoped data attribute. Without :global(),
   Vue's scoped CSS appends [data-v-xxx] making selectors never match → stuck invisible. */
:global(.page-fade-enter-active) {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
:global(.page-fade-leave-active) {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

:global(.page-fade-enter-from) {
  opacity: 0;
  transform: translateY(8px);
}
:global(.page-fade-leave-to) {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── PREMIUM STYLES ──────────────────────────────────────── */
.premium-crown {
  font-size: 16px;
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
  animation: crown-glow 2s ease-in-out infinite alternate;
}
@keyframes crown-glow {
  from { filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.4)); }
  to   { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)); }
}

.user-badge--premium {
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 2px 6px;
  background: rgba(255, 215, 0, 0.05);
}

.user-badge__avatar--premium {
  background: linear-gradient(135deg, #ffd700, #ff8c00) !important;
  color: #000 !important;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}

.premium-tag {
  font-size: 8px;
  font-weight: 700;
  background: linear-gradient(90deg, #ffd700, #ff8c00);
  color: #000;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 4px;
  vertical-align: middle;
  letter-spacing: 0.5px;
}

/* ── RESPONSIVE MOBILE ───────────────────────────────────── */
@media (max-width: 768px) {
  .app-header {
    padding: 0 var(--space-3);
    gap: var(--space-2);
  }
  .logo-badge { font-size: var(--text-xs); padding: 3px 8px; }
  .user-badge { padding: 3px var(--space-2); }
  .user-badge__info { display: none; }
  .btn-primary { padding: 4px var(--space-3); font-size: 11px; }
  .app-main { padding: var(--space-2); gap: var(--space-2); }
}

@media (max-width: 480px) {
  .header-controls { gap: 4px; }
  .btn-icon { width: 26px; height: 26px; }
  .premium-crown { font-size: 13px; }
}

/* ── IMPERSONATION BANNER ────────────────────────────────── */
.impersonate-banner {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(245, 158, 11, 0.12); /* Amber glassmorphism */
  border: 1px solid rgba(245, 158, 11, 0.25);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 15px rgba(245, 158, 11, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  color: #fef08a;
  font-family: inherit;
  animation: banner-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.impersonate-banner__pulse {
  width: 8px;
  height: 8px;
  background-color: #f59e0b;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  animation: pulse-glow 1.6s infinite;
}

.impersonate-banner__text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.impersonate-banner__text strong {
  color: #fff;
  font-weight: 600;
}

.impersonate-banner__btn {
  background: #f59e0b;
  border: none;
  color: #000;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
}

.impersonate-banner__btn:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
}

.impersonate-banner__btn:active {
  transform: translateY(0);
}

@keyframes banner-slide-in {
  from {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes pulse-glow {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

/* ── SYNC ERROR BANNER ───────────────────────────────────── */
.sync-error-banner {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(239, 68, 68, 0.12); /* Rose glassmorphism */
  border: 1px solid rgba(239, 68, 68, 0.25);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 15px rgba(239, 68, 68, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  color: #fecaca;
  font-family: inherit;
  animation: banner-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.sync-error-banner__pulse {
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  animation: pulse-glow-red 1.6s infinite;
}

@keyframes pulse-glow-red {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.sync-error-banner__text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.sync-error-banner__btn {
  background: #ef4444;
  border: none;
  color: #fff;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
}

.sync-error-banner__btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
}

.sync-error-banner__btn:active {
  transform: translateY(0);
}

.sync-error-banner__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
<style>
@import "./App.css";
</style>
