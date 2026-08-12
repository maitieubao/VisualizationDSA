<template>
  <li class="docs-sidebar-item">
    
    <div 
      v-if="item.children" 
      class="flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md transition-colors group"
      :class="isOpen ? '' : 'hover:bg-bg-hover'"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown.enter="toggle"
      @keydown.space.prevent="toggle"
    >
      <span 
        class="text-sm font-medium select-none"
        :class="isOpen ? 'text-text-primary font-bold' : 'text-text-secondary group-hover:text-text-primary'"
      >
        {{ item.title }}
      </span>
      <BaseIcon 
        name="chevron-right"
        class="w-4 h-4 text-text-muted transition-transform duration-200"
        :class="isOpen ? 'rotate-90 text-accent-primary' : ''"
      />
    </div>

    
    <router-link
      v-else-if="item.path"
      :to="item.path"
      class="block px-2 py-1.5 text-sm rounded-md transition-colors select-none"
      :class="isCurrentRoute(item.path) 
        ? 'text-accent-primary font-medium sidebar-item-active' 
        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'"
      @click="$emit('link-clicked')"
    >
      {{ item.title }}
    </router-link>

    
    <ul 
      v-if="item.children" 
      v-show="isOpen"
      class="pl-4 mt-1 space-y-1 border-l border-border-color ml-2"
    >
      <DocsSidebarItem 
        v-for="child in item.children" 
        :key="child.id" 
        :item="child" 
        :current-route="currentRoute"
        @link-clicked="$emit('link-clicked')"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { NavItem } from '../types/docs.types';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const props = defineProps<{
  item: NavItem;
  currentRoute: string;
}>();

const emit = defineEmits<{
  (e: 'link-clicked'): void;
}>();

// Giữ trạng thái collapse của từng nhóm qua các lần điều hướng (App remount view mỗi route) (DC-021).
const COLLAPSE_STORAGE_KEY = 'docs-sidebar-collapsed';

const getCollapsedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    return raw ? JSON.parse(raw) as string[] : [];
  } catch {
    return [];
  }
};

const persistCollapse = (id: string, collapsed: boolean): void => {
  try {
    const ids = getCollapsedIds();
    const next = collapsed ? Array.from(new Set([...ids, id])) : ids.filter(existing => existing !== id);
    localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage có thể bị chặn (privacy mode) — bỏ qua, chỉ mất trạng thái lưu.
  }
};

const isCollapsedByUser = ref(getCollapsedIds().includes(props.item.id));

// Sửa điều kiện viết ngược: khớp cả đường dẫn chính xác lẫn trailing slash (DC-012).
const isCurrentRoute = (path: string): boolean => {
  return props.currentRoute === path || path + '/' === props.currentRoute;
};


const containsActiveRoute = (navItem: NavItem): boolean => {
  if (navItem.path && isCurrentRoute(navItem.path)) return true;
  if (navItem.children) {
    return navItem.children.some(child => containsActiveRoute(child));
  }
  return false;
};

// Nhóm chứa bài đang mở luôn hiện (auto-open); nhóm khác theo trạng thái người dùng đã thu gọn.
const isOpen = computed({
  get: () => props.item.children
    ? containsActiveRoute(props.item) || !isCollapsedByUser.value
    : false,
  set: (value: boolean) => {
    isCollapsedByUser.value = !value;
    persistCollapse(props.item.id, !value);
  }
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<script lang="ts">

export default {
  name: 'DocsSidebarItem'
}
</script>
