<template>
  <header class="app-header">
    <div class="app-header__inner">

      
      <router-link to="/" class="header-logo hover:opacity-80 transition-opacity">
        <div class="logo-text text-xl">
          <span class="logo-prefix font-mono font-bold text-accent drop-shadow-md">~/</span>
          <span class="logo-name font-display tracking-tight text-text-heading ml-1">Visualization<span class="text-accent">DSA</span></span>
        </div>
        <span class="logo-badge ml-2 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium">BETA</span>
      </router-link>

      
      <nav class="header-nav flex-1 flex justify-center items-center px-4 hidden lg:flex space-x-1">
        <template v-for="tabOrGroup in filteredTabs" :key="'groupName' in tabOrGroup ? tabOrGroup.groupName : tabOrGroup.id">
          
          
          <div v-if="'groupName' in tabOrGroup" class="relative group header-nav-item z-[999999]">
            <button class="flex items-center space-x-1 px-4 py-2 text-base font-medium text-text-secondary hover:text-text-primary rounded-full transition-colors group-hover:bg-bg-hover">
              <span>{{ tabOrGroup.groupName }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            <div class="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[999999]">
              <div class="bg-bg-surface border border-border-default rounded-xl shadow-xl py-2 relative z-[999999] glass-panel">
                <router-link 
                  v-for="item in tabOrGroup.items" 
                  :key="item.id" 
                  :to="item.path"
                  class="block px-4 py-2 text-sm text-text-secondary hover:text-accent hover:bg-bg-hover transition-colors"
                  active-class="text-accent bg-accent/10 font-medium border-l-2 border-accent"
                >
                  {{ item.name }}
                </router-link>
              </div>
            </div>
          </div>

          <router-link 
            v-else
            :to="tabOrGroup.path"
            class="px-4 py-2 text-base font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-full transition-colors"
            active-class="text-accent bg-accent/10 font-medium shadow-[inset_0_0_12px_rgba(79,70,229,0.15)]"
          >
            {{ tabOrGroup.name }}
          </router-link>

        </template>
      </nav>

      
      <div class="spacer lg:hidden flex-1"></div>

      
      <div class="header-controls">

        
        <template v-if="authStore.isAuthenticated">
          
          <!-- Bordered thin boxes for Heart and Bell -->
          <div class="flex items-center gap-2 mr-2">
            <div class="flex items-center justify-center border border-border-subtle rounded-full px-2 py-1 bg-bg-surface/50 hover:bg-bg-hover transition-colors">
              <HeartDisplay />
            </div>
            <div class="flex items-center justify-center border border-border-subtle rounded-full p-1 bg-bg-surface/50 hover:bg-bg-hover transition-colors">
              <NotificationBell />
            </div>
          </div>
          
          <!-- Avatar Dropdown -->
          <div class="relative group z-[999999]">
            <button class="relative flex items-center justify-center rounded-full transition-colors group-hover:opacity-80">
              <AvatarDisplay 
                :avatar-url="authStore.currentUser?.avatarUrl" 
                :initials="authStore.userName" 
                :frame-type="authStore.currentUser?.avatarFrameType" 
                size="w-9 h-9" 
              />
            </button>
            
            <div class="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[999999]">
              <div class="bg-bg-surface border border-border-default rounded-xl shadow-xl py-2 relative z-[999999] glass-panel flex flex-col text-left">
                
                <div class="px-4 py-3 border-b border-border-subtle mb-1 flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-text-heading truncate">{{ authStore.userName }}</span>
                    <span v-if="authStore.isPremium" class="text-xs" title="Thành viên Premium"><BaseIcon name="crown" class="w-3.5 h-3.5 text-accent-warm" /></span>
                  </div>
                  <span class="text-xs text-text-muted truncate">{{ authStore.currentUser?.email || 'Tài khoản' }}</span>
                </div>
                
                <router-link to="/profile" class="px-4 py-2 text-sm text-text-secondary hover:text-accent hover:bg-bg-hover transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>Hồ sơ cá nhân</span>
                </router-link>
                
                <button @click="themeStore.toggleTheme()" class="px-4 py-2 text-sm text-text-secondary hover:text-accent hover:bg-bg-hover transition-colors flex items-center gap-2 w-full text-left">
                  <svg v-if="themeStore.currentTheme === 'light'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                  <span>Đổi giao diện</span>
                </button>
                
                <a href="https://github.com/maitieubao/VisualizationDSA" target="_blank" rel="noopener noreferrer" class="px-4 py-2 text-sm text-text-secondary hover:text-accent hover:bg-bg-hover transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
                
                <router-link v-if="!authStore.isPremium" to="/checkout" class="text-left px-4 py-2 text-sm text-accent-warm hover:text-accent-warm hover:bg-accent-warm/20 transition-colors flex items-center gap-2 w-full border-t border-border-subtle mt-1 pt-2">
                  <BaseIcon name="crown" class="w-4 h-4 text-accent-warm" />
                  <span class="font-bold">Đăng ký Premium</span>
                </router-link>
                
                <button @click="$emit('logout')" class="text-left px-4 py-2 text-sm text-accent-red hover:text-accent-red hover:bg-accent-red/20 transition-colors flex items-center gap-2 w-full border-t border-border-subtle mt-1 pt-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Help / Tour Button (?) -->
          <button class="btn-icon btn-icon--ghost ml-2 border border-border-default rounded-full bg-bg-surface/50 hover:bg-bg-hover w-9 h-9 flex-shrink-0" @click="tourStore.startTour()" title="Hướng dẫn nhanh">
            <span class="font-bold text-sm text-text-secondary">?</span>
          </button>
        </template>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useGuidedTourStore } from '../features/guided-tour/store/useGuidedTourStore';
import { useThemeStore } from '../shared/store/useThemeStore';
import NotificationBell from '../features/e-lecture/components/NotificationBell.vue';
import HeartDisplay from './common/HeartDisplay.vue';
import AvatarDisplay from '../shared/components/AvatarDisplay.vue';
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
