<template>
  <!-- CU-033: bỏ z-[999999] + !important trùng — App.css .app-header đã giữ 1 tầng z-index duy nhất -->
  <header ref="headerRef" class="app-header">
    <div class="app-header__inner">

      
      <div class="header-logo">
        
        <div class="terminal-dots" aria-hidden="true">
          <span class="terminal-dot terminal-dot--close"></span>
          <span class="terminal-dot terminal-dot--min"></span>
          <span class="terminal-dot terminal-dot--max"></span>
        </div>

        
        <div class="logo-text">
          <span class="logo-prefix">~/</span>
          <span class="logo-name">VisualizationDSA</span>
        </div>
        <span class="logo-badge">DSA Viz</span>
      </div>

      
      <!-- CU-005: dropdown mở bằng click/focus/mouse — aria-expanded + haspopup + Esc -->
      <nav class="header-nav flex-1 flex justify-center items-center px-4 hidden lg:flex space-x-1">
        <template v-for="tabOrGroup in filteredTabs" :key="'groupName' in tabOrGroup ? tabOrGroup.groupName : tabOrGroup.id">
          
          
          <div
            v-if="'groupName' in tabOrGroup"
            class="relative header-nav-item"
            @mouseenter="openGroup = tabOrGroup.groupName"
            @mouseleave="closeGroup(tabOrGroup.groupName)"
            @focusout="handleGroupFocusOut(tabOrGroup.groupName, $event)"
          >
            <button
              type="button"
              class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md transition-colors"
              :class="{ 'bg-bg-hover text-text-primary': openGroup === tabOrGroup.groupName }"
              :aria-expanded="openGroup === tabOrGroup.groupName"
              aria-haspopup="true"
              @click="toggleGroup(tabOrGroup.groupName)"
              @keydown.esc.prevent="closeGroup(tabOrGroup.groupName)"
            >
              <span>{{ tabOrGroup.groupName }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-70 transition-transform" :class="{ 'rotate-180': openGroup === tabOrGroup.groupName }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            <div v-show="openGroup === tabOrGroup.groupName" class="nav-dropdown-panel absolute left-0 mt-0 w-48 pt-2" role="menu" @click="closeGroup(tabOrGroup.groupName)">
              <div class="bg-bg-surface border border-border-default rounded-lg shadow-xl py-1">
                <router-link 
                  v-for="item in tabOrGroup.items" 
                  :key="item.id" 
                  :to="item.path"
                  role="menuitem"
                  class="block px-4 py-2 text-sm text-text-secondary hover:text-accent hover:bg-bg-hover transition-colors"
                  active-class="text-accent bg-bg-active font-medium"
                >
                  {{ item.name }}
                </router-link>
              </div>
            </div>
          </div>

          
          <router-link 
            v-else
            :to="tabOrGroup.path"
            class="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors"
            active-class="text-accent bg-bg-active font-medium"
          >
            {{ tabOrGroup.name }}
          </router-link>

        </template>
      </nav>

      
      <div class="spacer lg:hidden flex-1"></div>

      
      <div class="header-controls">

        
        <!-- CU-004: hamburger mở drawer mobile (<1024px nav không còn mất trắng) -->
        <button
          type="button"
          class="btn-icon btn-icon--ghost lg:hidden"
          aria-label="Mở menu điều hướng"
          aria-haspopup="dialog"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-nav-drawer"
          @click="mobileMenuOpen = true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        
        <template v-if="authStore.isAuthenticated">
          
          <NotificationBell />
          
          <span v-if="authStore.isPremium" class="premium-crown" title="Thành viên Premium"><BaseIcon name="crown" class="w-4 h-4" /></span>
          <!-- CU-019: user-badge là button — keyboard accessible -->
          <button
            type="button"
            class="user-badge"
            :class="{ 'user-badge--premium': authStore.isPremium }"
            @click="$router.push('/profile')"
            title="Xem hồ sơ cá nhân"
          >
            <div class="user-badge__avatar" :class="{ 'user-badge__avatar--premium': authStore.isPremium }">
              <!-- AU-052: fallback regex [A-Za-zÀ-ỹ] trước charAt(0); không khớp → icon user mặc định -->
              <template v-if="avatarLetter">{{ avatarLetter }}</template>
              <BaseIcon v-else name="user" class="w-4 h-4" />
            </div>
            <div class="user-badge__info">
              <div class="user-badge__name-row">
                <span class="user-badge__name">{{ authStore.userName }}</span>
                <span v-if="authStore.isPremium" class="premium-tag">PRO</span>
              </div>
              <div class="user-badge__meta-row">
                <span class="meta-lvl">Cấp {{ authStore.userLevel }}</span>
                <span class="meta-dot">&middot;</span>
                <span class="meta-xp">{{ authStore.userXP }} XP</span>
              </div>
            </div>
          </button>
          <button
            class="btn-icon btn-icon--ghost"
            title="Đăng xuất"
            aria-label="Đăng xuất"
            @click="$emit('logout')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </template>

        
        <button
          v-else
          class="btn-primary"
          @click="$emit('openLogin')"
        >
          Đăng nhập
        </button>

        
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

        
        <button
          class="btn-icon btn-icon--ghost"
          title="Đổi giao diện (Sáng/Tối)"
          aria-label="Đổi giao diện"
          @click="themeStore.toggleTheme()"
        >
          <svg v-if="themeStore.currentTheme === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>

        
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

  
  <!-- CU-004: drawer mobile — nav không mất trắng < 1024px (pattern DocsLayout DC-001) -->
  <Teleport to="body">
    <Transition name="mobile-nav-fade">
      <div
        v-if="mobileMenuOpen"
        class="mobile-nav-overlay"
        aria-hidden="true"
        @click="mobileMenuOpen = false"
      ></div>
    </Transition>
    <Transition name="mobile-nav-slide">
      <aside
        v-if="mobileMenuOpen"
        id="mobile-nav-drawer"
        class="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
      >
        <div class="mobile-nav-header">
          <span class="mobile-nav-brand">~/ VisualizationDSA</span>
          <button
            type="button"
            class="mobile-nav-close"
            aria-label="Đóng menu điều hướng"
            @click="mobileMenuOpen = false"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav class="mobile-nav-body">
          <template v-for="tabOrGroup in filteredTabs" :key="'groupName' in tabOrGroup ? tabOrGroup.groupName : tabOrGroup.id">
            <div v-if="'groupName' in tabOrGroup" class="mobile-nav-group">
              <p class="mobile-nav-group-title">{{ tabOrGroup.groupName }}</p>
              <router-link
                v-for="item in tabOrGroup.items"
                :key="item.id"
                :to="item.path"
                class="mobile-nav-link"
                @click="mobileMenuOpen = false"
              >
                {{ item.name }}
              </router-link>
            </div>
            <router-link
              v-else
              :to="tabOrGroup.path"
              class="mobile-nav-link mobile-nav-link--solo"
              @click="mobileMenuOpen = false"
            >
              {{ tabOrGroup.name }}
            </router-link>
          </template>
        </nav>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';
import { useThemeStore } from '../shared/store/useThemeStore';
import NotificationBell from '../features/notifications/components/NotificationBell.vue';
import { APP_TABS } from '../appTabs';
import type { TabGroup, TabItem } from '../appTabs';

const authStore = useAuthStore();
const tourStore = useGuidedTourStore();
const themeStore = useThemeStore();

defineEmits<{
  (e: 'logout'): void;
  (e: 'openLogin'): void;
}>();

// AU-052: ký tự đầu tiên là chữ (hỗ trợ tiếng Việt); username số/ký tự đặc biệt → null (dùng icon).
const avatarLetter = computed(() => {
  const name = authStore.userName.trim();
  for (const ch of name) {
    if (/[A-Za-zÀ-ỹ]/.test(ch)) return ch.toUpperCase();
  }
  return null;
});

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
    if (role === 'Admin') return true;
    if (role !== tab.requiresRole) return false;
  }
  return true;
}

// ─── CU-005: dropdown trạng thái mở — click/focus-within/mouse, đóng bằng Esc hoặc click ngoài ───
const openGroup = ref<string | null>(null);
const headerRef = ref<HTMLElement | null>(null);

function toggleGroup(groupName: string): void {
  openGroup.value = openGroup.value === groupName ? null : groupName;
}

function closeGroup(groupName: string): void {
  if (openGroup.value === groupName) openGroup.value = null;
}

function handleGroupFocusOut(groupName: string, e: FocusEvent): void {
  const related = e.relatedTarget as HTMLElement | null;
  if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
    closeGroup(groupName);
  }
}

// Đóng dropdown khi click ra ngoài header.
watch(openGroup, (val) => {
  if (val) {
    document.addEventListener('click', onDocumentClick);
  } else {
    document.removeEventListener('click', onDocumentClick);
  }
});

function onDocumentClick(e: MouseEvent): void {
  const target = e.target as HTMLElement | null;
  if (!target || !headerRef.value?.contains(target)) {
    openGroup.value = null;
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onMobileMenuKeydown);
  document.body.style.overflow = '';
});

// ─── CU-004: drawer mobile — Esc đóng + khóa scroll body ───
const mobileMenuOpen = ref(false);

function onMobileMenuKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && mobileMenuOpen.value) {
    mobileMenuOpen.value = false;
  }
}

watch(mobileMenuOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onMobileMenuKeydown);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onMobileMenuKeydown);
  }
});
</script>

<style scoped>
/* CU-019: reset mặc định button cho user-badge (vốn là div @click) */
.user-badge {
  font-family: inherit;
  text-align: left;
}
.user-badge:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* CU-005: dropdown nổi trong stacking context của header — không cần z-index khổng lồ */
.nav-dropdown-panel {
  z-index: 50;
}

/* ─── CU-004: drawer mobile (Teleport) ─── */
.mobile-nav-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 100000;
  backdrop-filter: blur(2px);
}

.mobile-nav-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(320px, 85vw);
  z-index: 100001;
  display: flex;
  flex-direction: column;
  background: color-mix(in srgb, var(--color-bg-surface) 88%, transparent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid var(--color-border-default);
  box-shadow: 12px 0 32px rgba(0, 0, 0, 0.35);
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-default);
}

.mobile-nav-brand {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.mobile-nav-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.mobile-nav-close:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.mobile-nav-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 8px 24px;
}

.mobile-nav-group-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  padding: 14px 12px 6px;
}

.mobile-nav-link {
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all 0.15s;
}
.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: var(--color-bg-hover);
  color: var(--color-accent-primary);
}

.mobile-nav-link--solo {
  margin-top: 4px;
}

/* Desktop ≥1024px: drawer mở sẵn cũng ẩn (chỉ hamburger mới mở được). */
@media (min-width: 1024px) {
  .mobile-nav-overlay,
  .mobile-nav-drawer {
    display: none;
  }
}

.mobile-nav-fade-enter-active,
.mobile-nav-fade-leave-active {
  transition: opacity 0.25s ease;
}
.mobile-nav-fade-enter-from,
.mobile-nav-fade-leave-to {
  opacity: 0;
}

.mobile-nav-slide-enter-active,
.mobile-nav-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-nav-slide-enter-from,
.mobile-nav-slide-leave-to {
  transform: translateX(-100%);
}
</style>
