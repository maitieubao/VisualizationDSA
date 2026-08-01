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

const isMobileSidebarOpen = ref(false);
const route = useRoute();


watch(() => route.path, () => {
  isMobileSidebarOpen.value = false;
});
</script>
