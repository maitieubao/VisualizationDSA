<template>
  <nav class="bottom-mobile-nav lg:hidden">
    <div class="bottom-mobile-nav__inner glass-panel">
      <!-- We only show up to 5 items to fit on mobile -->
      <router-link
        v-for="item in primaryTabs"
        :key="item.id"
        :to="item.path"
        class="nav-item"
        active-class="nav-item--active"
      >
        <span class="nav-icon"><BaseIcon :name="getIcon(item.id)" class="w-5 h-5" /></span>
        <span class="nav-label">{{ item.name }}</span>
      </router-link>
      
      <!-- More menu trigger if needed, or link to a generic dashboard -->
      <button class="nav-item" @click="$emit('open-menu')">
        <span class="nav-icon"><BaseIcon name="menu" class="w-5 h-5" /></span>
        <span class="nav-label">Menu</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { APP_TABS } from '../appTabs';
import type { TabGroup, TabItem } from '../appTabs';

// Define a simplified list of tabs for mobile
const primaryTabs = computed(() => {
  const tabs: TabItem[] = [];
  APP_TABS.forEach(tabOrGroup => {
    if ('groupName' in tabOrGroup) {
      // Just take the first item of the group or skip
    } else {
      tabs.push(tabOrGroup as TabItem);
    }
  });
  // Return max 4 tabs for mobile bottom nav
  return tabs.slice(0, 4);
});

function getIcon(id: string): string {
  switch (id) {
    case 'dashboard': return 'dashboard';
    case 'courses': return 'book';
    case 'gamification': return 'trophy';
    case 'sorting': return 'sorting';
    case 'graph': return 'graph';
    default: return 'sparkles';
  }
}
</script>

<style scoped>
.bottom-mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-raised, 9999);
  padding: 0 16px 16px 16px;
  pointer-events: none; /* Let clicks pass through padding */
}

.bottom-mobile-nav__inner {
  pointer-events: auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(79, 70, 229, 0.2);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  color: var(--color-text-secondary);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  background: transparent;
  border: none;
}

.nav-item:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-item--active {
  color: var(--color-accent-primary);
  background: rgba(79, 70, 229, 0.15);
  box-shadow: inset 0 0 10px rgba(79, 70, 229, 0.1);
}

.nav-item--active .nav-icon {
  transform: scale(1.15) translateY(-2px);
  filter: drop-shadow(0 0 8px rgba(79, 70, 229, 0.6));
}

.nav-icon {
  font-size: 20px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-sans);
}
</style>
