<template>
  <div class="docs-layout-container flex flex-col min-h-screen bg-bg-base text-text-primary">
    
    
    <div class="flex-1 flex max-w-[1400px] w-full mx-auto relative pt-4">
      
      
      <div 
        v-if="isMobileSidebarOpen" 
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
        @click="isMobileSidebarOpen = false"
      ></div>

      
      <DocsSidebar 
        :is-open="isMobileSidebarOpen" 
        @close="isMobileSidebarOpen = false" 
      />

      
      <main class="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-10">
        
        <!-- Hamburger mở sidebar trên mobile — drawer + overlay đã có sẵn, chỉ thiếu nút mở (DC-001). -->
        <button 
          class="lg:hidden flex items-center gap-2 mb-4 px-3 py-2 rounded-md border border-border-color text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          @click="isMobileSidebarOpen = true"
          aria-label="Mở menu tài liệu"
          :aria-expanded="isMobileSidebarOpen"
        >
          <BaseIcon name="list" class="w-5 h-5" />
          <span class="text-sm font-medium">Menu tài liệu</span>
        </button>

        
        <slot></slot>
        
      </main>

      
      <slot name="toc"></slot>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocsSidebar from './DocsSidebar.vue';
import BaseIcon from '@/shared/components/BaseIcon.vue';

const isMobileSidebarOpen = ref(false);
const route = useRoute();


watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
});
</script>
