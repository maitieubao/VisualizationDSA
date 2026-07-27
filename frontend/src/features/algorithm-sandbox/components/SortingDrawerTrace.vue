<template>
  <div class="sorting-drawer-trace relative font-sans">
    <!-- Toggle Button (Clean Floating Button with SVG Icon) -->
    <button
      @click="isOpen = !isOpen"
      class="drawer-toggle-btn flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-lg cursor-pointer"
      :class="isOpen ? 'bg-indigo-600 text-white border border-indigo-400/50' : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-white/20 backdrop-blur-md'"
    >
      <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <span>{{ isOpen ? 'Thu Gọn Mã Giả' : 'Mã Giả & Trạng Thái' }}</span>
      <svg class="w-3 h-3 opacity-60 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Collapsible Drawer Content -->
    <transition name="drawer-slide">
      <div v-if="isOpen" class="drawer-card absolute bottom-12 right-0 z-40 p-4 rounded-lg bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-xl w-96 max-h-[480px] flex flex-col gap-3 overflow-hidden">
        <div class="flex items-center justify-between border-b border-white/10 pb-2 flex-shrink-0">
          <span class="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Trạng Thái & Lời Giải Thích
          </span>
          <button @click="isOpen = false" class="text-slate-400 hover:text-white text-xs cursor-pointer p-0.5">✕</button>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto pr-1">
          <SortingDetailPanel />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SortingDetailPanel from './SortingDetailPanel.vue';

const isOpen = ref(false);
</script>

<style scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
