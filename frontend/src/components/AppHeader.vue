<template>
  <header class="app-header z-[999999]" style="position: relative; z-index: 999999 !important;">
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

      
      <nav class="header-nav flex-1 flex justify-center items-center px-4 hidden lg:flex space-x-1">
        <template v-for="tabOrGroup in filteredTabs" :key="'groupName' in tabOrGroup ? tabOrGroup.groupName : tabOrGroup.id">
          
          
          <div v-if="'groupName' in tabOrGroup" class="relative group header-nav-item z-[999999]">
            <button class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-md transition-colors group-hover:bg-bg-hover">
              <span>{{ tabOrGroup.groupName }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            <div class="absolute left-0 mt-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[999999]" style="z-index: 999999 !important;">
              <div class="bg-bg-surface border border-border-default rounded-lg shadow-xl py-1 relative z-[999999]">
                <router-link 
                  v-for="item in tabOrGroup.items" 
                  :key="item.id" 
                  :to="item.path"
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

        
        <template v-if="authStore.isAuthenticated">
          
          <NotificationBell />
          
          <span v-if="authStore.isPremium" class="premium-crown" title="Thành viên Premium"><BaseIcon name="crown" class="w-4 h-4" /></span>
          <div class="user-badge" :class="{ 'user-badge--premium': authStore.isPremium }" @click="$router.push('/profile')" title="Xem hồ sơ cá nhân">
            <div class="user-badge__avatar" :class="{ 'user-badge__avatar--premium': authStore.isPremium }">
              {{ authStore.userName.charAt(0).toUpperCase() }}
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
          </div>
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
</template>

<script setup lang="ts">
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';
import { useThemeStore } from '../shared/store/useThemeStore';
import NotificationBell from '../features/e-lecture/components/NotificationBell.vue';
import { APP_TABS } from '../appTabs';
import type { TabGroup, TabItem } from '../appTabs';
import { computed } from 'vue';

const authStore = useAuthStore();
const tourStore = useGuidedTourStore();
const themeStore = useThemeStore();

defineEmits<{
  (e: 'logout'): void;
  (e: 'openLogin'): void;
}>();

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
</script>
