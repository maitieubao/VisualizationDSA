<template>
  <!--
    App Shell — VisualizationDSA
    Phong cách: Terminal / Code Editor aesthetic
    Font: JetBrains Mono (logo/code), Inter (nav/UI)
    Theme: data-theme attribute được set trên <html> trong index.html
  -->
  <div class="app-shell" :class="{ 'is-embed': isMinimalMode }">
    <!-- ══════════════════════════════════════════════════════════
         HEADER — Logo + Right Controls only
    ══════════════════════════════════════════════════════════ -->
    <header v-if="!isMinimalMode" class="app-header">
      <div class="app-header__inner">

        <!-- ── Logo: ~/VisualizationDSA style ── -->
        <div class="header-logo">
          <!-- Traffic light dots — terminal window decoration -->
          <div class="terminal-dots" aria-hidden="true">
            <span class="terminal-dot terminal-dot--close"></span>
            <span class="terminal-dot terminal-dot--min"></span>
            <span class="terminal-dot terminal-dot--max"></span>
          </div>

          <!-- Logo text -->
          <div class="logo-text">
            <span class="logo-prefix">~/</span>
            <span class="logo-name">VisualizationDSA</span>
          </div>
          <span class="logo-badge">DSA Viz</span>
        </div>

        <!-- Spacer to push controls to the right -->
        <div class="spacer"></div>

        <!-- ── Right controls: User + GitHub ── -->
        <div class="header-controls">

          <!-- Authenticated user badge -->
          <template v-if="authStore.isAuthenticated">
            <!-- Notification Bell -->
            <NotificationBell />
            <!-- Premium Crown Badge -->
            <span v-if="authStore.isPremium" class="premium-crown" title="Thành viên Premium">👑</span>
            <div class="user-badge" :class="{ 'user-badge--premium': authStore.isPremium }" @click="router.push('/profile')" title="Xem hồ sơ cá nhân">
              <div class="user-badge__avatar" :class="{ 'user-badge__avatar--premium': authStore.isPremium }">
                {{ authStore.userName.charAt(0).toUpperCase() }}
              </div>
              <div class="user-badge__info">
                <span class="user-badge__name">
                  {{ authStore.userName }}
                  <span v-if="authStore.isPremium" class="premium-tag">PRO</span>
                </span>
                <span class="user-badge__meta">
                  Lv.{{ authStore.userLevel }}&nbsp;&middot;&nbsp;{{ authStore.userXP }} XP
                </span>
              </div>
            </div>
            <button
              class="btn-icon btn-icon--ghost"
              title="Đăng xuất"
              aria-label="Đăng xuất"
              @click="handleLogout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </template>

          <!-- Guest: login button -->
          <button
            v-else
            class="btn-primary"
            @click="showLoginModal = true"
          >
            Đăng nhập
          </button>

          <!-- Restart Guided Tour Button -->
          <button
            class="btn-icon btn-icon--ghost"
            title="Xem hướng dẫn nhanh"
            aria-label="Xem hướng dẫn nhanh"
            @click="tourStore.startTour()"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>

          <!-- GitHub link -->
          <a
            href="https://github.com/maitieubao/VisualizationDSA"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-icon btn-icon--ghost"
            aria-label="GitHub Repository"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>

      </div>
    </header>

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
      <span class="impersonate-banner__icon">🎭</span>
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
      <span class="sync-error-banner__icon">⚠️</span>
      <span>Đồng bộ tiến trình thất bại.</span>
    </div>
    <button class="sync-error-banner__btn" :disabled="isSyncingProgress" @click="handleRetrySync">
      {{ isSyncingProgress ? 'Đang thử...' : 'Thử lại' }}
    </button>
  </div>

  <!-- Login Modal -->
  <LoginModal :visible="showLoginModal" @close="showLoginModal = false" />

  <!-- Global Toast Notifications -->
  <ToastContainer />

  <!-- Interactive Guided Tour Overlay -->
  <GuidedTourOverlay />

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { APP_TABS } from './appTabs';
import type { TabGroup, TabItem } from './appTabs';
import BaseIcon from './shared/components/BaseIcon.vue';
import LoginModal from './features/auth/components/LoginModal.vue';
import ToastContainer from './components/ToastContainer.vue';
import GuidedTourOverlay from './features/guided-tour/components/GuidedTourOverlay.vue';
import { useGuidedTourStore } from './features/guided-tour/store/useGuidedTourStore';
import { useUserProgressStore } from './features/user-progress/store/useUserProgressStore';
import NotificationBell from './features/e-lecture/components/NotificationBell.vue';

const authStore      = useAuthStore();
const tourStore      = useGuidedTourStore();
const progressStore  = useUserProgressStore();
const route          = useRoute();
const router         = useRouter();
const showLoginModal = ref(false);
const isSyncingProgress = ref(false);

const isSidebarCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true');
function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed.value));
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 200);
}

async function handleRetrySync(): Promise<void> {
  isSyncingProgress.value = true;
  try {
    await progressStore.loadProgress();
  } finally {
    isSyncingProgress.value = false;
  }
}

const isLandingPage = computed(() => route.name === 'landing');
const isMinimalMode = computed(() => route.path === '/embed' && route.query.algo !== undefined);

const filteredTabs = computed(() => {
  return APP_TABS.filter((tabOrGroup) => {
    if ('groupName' in tabOrGroup) {
      const group = tabOrGroup as TabGroup;
      const visibleItems = group.items.filter((item: TabItem) => isTabVisible(item));
      return visibleItems.length > 0;
    }
    return isTabVisible(tabOrGroup as TabItem);
  }).map((tabOrGroup) => {
    if ('groupName' in tabOrGroup) {
      const group = tabOrGroup as TabGroup;
      return {
        ...group,
        items: group.items.filter((item: TabItem) => isTabVisible(item)),
      };
    }
    return tabOrGroup;
  });
});

function isTabVisible(tab: TabItem): boolean {
  if (tab.requiresAuth && !authStore.isAuthenticated) return false;
  if (tab.requiresRole) {
    const role = authStore.userRole;
    if (role === 'Admin') return true; // Admin sees everything
    if (role !== tab.requiresRole) return false;
  }
  return true;
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
  authStore.statelessInit();
  tourStore.initTour();
});
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
