<template>
  <aside 
    class="docs-sidebar fixed inset-y-0 left-0 z-40 w-64 bg-bg-base border-r border-border-color transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block pt-16 lg:pt-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    aria-label="Menu tài liệu"
  >
    <div class="h-full overflow-y-auto p-4 pb-20 scrollbar-hide">
      
      <button 
        @click="$emit('close')" 
        class="lg:hidden absolute top-4 right-4 text-text-muted hover:text-white"
        aria-label="Đóng menu"
      >
        <BaseIcon name="x" class="w-6 h-6" />
      </button>

      
      <div class="mb-6 px-2 lg:hidden">
        <h2 class="text-xl font-bold text-text-primary">C# Documentation</h2>
      </div>

      
      <nav class="mt-4 lg:mt-6">
        <ul class="space-y-1">
          <DocsSidebarItem 
            v-for="item in navigation" 
            :key="item.id" 
            :item="item" 
            :current-route="route.path"
            @link-clicked="$emit('close')"
          />
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { docsNavigation } from '../data/docsNavigation';
import DocsSidebarItem from './DocsSidebarItem.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const route = useRoute();
const navigation = docsNavigation;
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
