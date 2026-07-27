<template>
  <li class="docs-sidebar-item">
    <!-- Nút cho thư mục (có children) -->
    <div 
      v-if="item.children" 
      class="flex items-center justify-between px-2 py-1.5 cursor-pointer rounded-md transition-colors group"
      :class="isOpen ? '' : 'hover:bg-[#1e293b]'"
      @click="toggle"
    >
      <span 
        class="text-sm font-medium select-none"
        :class="isOpen ? 'text-text-primary font-bold' : 'text-text-secondary group-hover:text-text-primary'"
      >
        {{ item.title }}
      </span>
      <svg 
        class="w-4 h-4 text-text-muted transition-transform duration-200"
        :class="isOpen ? 'rotate-90 text-accent-primary' : ''"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>

    <!-- Link cho bài viết (không có children) -->
    <router-link
      v-else-if="item.path"
      :to="item.path"
      class="block px-2 py-1.5 text-sm rounded-md transition-colors select-none"
      :class="isCurrentRoute(item.path) 
        ? 'text-accent-primary font-medium' 
        : 'text-text-secondary hover:bg-[#1e293b] hover:text-text-primary'"
      @click="$emit('link-clicked')"
    >
      {{ item.title }}
    </router-link>

    <!-- Menu con đệ quy -->
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
import { ref, watch, onMounted } from 'vue';
import type { NavItem } from '../types/docs.types';

const props = defineProps<{
  item: NavItem;
  currentRoute: string;
}>();

const emit = defineEmits<{
  (e: 'link-clicked'): void;
}>();

const isOpen = ref(false);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const isCurrentRoute = (path: string) => {
  return props.currentRoute === path || props.currentRoute + '/' === path;
};

// Đệ quy kiểm tra xem route hiện tại có nằm trong thư mục này không
const containsActiveRoute = (navItem: NavItem): boolean => {
  if (navItem.path && isCurrentRoute(navItem.path)) return true;
  if (navItem.children) {
    return navItem.children.some(child => containsActiveRoute(child));
  }
  return false;
};

// Tự động mở thư mục nếu đang ở bài viết bên trong
watch(() => props.currentRoute, () => {
  if (props.item.children && containsActiveRoute(props.item)) {
    isOpen.value = true;
  }
});

onMounted(() => {
  if (props.item.children && containsActiveRoute(props.item)) {
    isOpen.value = true;
  }
});
</script>

<script lang="ts">
// Định nghĩa tên component để có thể gọi đệ quy chính nó
export default {
  name: 'DocsSidebarItem'
}
</script>
