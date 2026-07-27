<template>
  <div class="docs-layout-container flex flex-col min-h-screen bg-bg-base text-text-primary">
    <!-- Header Area (Should be provided by the main app layout, but we need space for it) -->
    
    <div class="flex-1 flex max-w-[1400px] w-full mx-auto relative pt-4">
      
      <!-- Mobile Sidebar Overlay -->
      <div 
        v-if="isMobileSidebarOpen" 
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
        @click="isMobileSidebarOpen = false"
      ></div>

      <!-- Left Sidebar (Navigation) -->
      <DocsSidebar 
        :is-open="isMobileSidebarOpen" 
        @close="isMobileSidebarOpen = false" 
      />

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-10">
        
        <!-- Mobile Menu Toggle -->
        <button 
          @click="isMobileSidebarOpen = true"
          class="lg:hidden flex items-center gap-2 text-text-secondary hover:text-white mb-6 bg-[#1e293b] px-3 py-1.5 rounded-md border border-border-color"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span class="text-sm font-medium">Menu Tài liệu</span>
        </button>

        <!-- Slot for Content -->
        <slot></slot>
        
      </main>

      <!-- Right Sidebar (Table of Contents) -->
      <slot name="toc"></slot>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocsSidebar from './DocsSidebar.vue';

const isMobileSidebarOpen = ref(false);
const route = useRoute();

// Đóng menu mobile khi route thay đổi
watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
});
</script>
