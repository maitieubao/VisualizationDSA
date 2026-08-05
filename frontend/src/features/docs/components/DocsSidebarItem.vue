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
        ? 'text-accent-primary font-medium' 
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
import { ref, watch, onMounted } from 'vue';
import type { NavItem } from '../types/docs.types';
import BaseIcon from '@/shared/components/BaseIcon.vue';

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


const containsActiveRoute = (navItem: NavItem): boolean => {
  if (navItem.path && isCurrentRoute(navItem.path)) return true;
  if (navItem.children) {
    return navItem.children.some(child => containsActiveRoute(child));
  }
  return false;
};


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

export default {
  name: 'DocsSidebarItem'
}
</script>
