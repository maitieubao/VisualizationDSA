<template>
  <div class="flex items-center gap-4 p-4 rounded-2xl compare-selector" data-tour-id="compare-selectors"
       style="background: rgba(30, 41, 59, 0.35); border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px);">
    <!-- Left Algorithm -->
    <div class="flex-1">
      <label class="block text-[10px] font-bold uppercase tracking-widest text-accent mb-1.5">Thuật toán Trái</label>
      
      <!-- Custom Left Dropdown -->
      <div class="relative w-full" ref="leftDropdownRef">
        <button
          @click="showLeftDropdown = !showLeftDropdown"
          class="w-full px-3 py-2 rounded-xl text-sm font-medium text-text-primary border transition-all cursor-pointer flex items-center justify-between"
          style="background: rgba(15, 23, 42, 0.7); border-color: rgba(6, 182, 212, 0.3);"
        >
          <span class="truncate">{{ selectedLeftAlgorithmName }}</span>
          <svg class="w-4 h-4 text-text-muted transition-transform duration-200 flex-shrink-0 ml-2" :class="{ 'rotate-180': showLeftDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div
            v-if="showLeftDropdown"
            class="absolute left-0 right-0 top-full mt-1.5 rounded-xl border z-50 overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col py-1"
            style="background: rgba(15, 23, 42, 0.95); border-color: rgba(6, 182, 212, 0.3);"
          >
            <button
              v-for="alg in sortingAlgorithms"
              :key="alg.id"
              :disabled="alg.id === store.rightAlgorithmId"
              @click="selectLeftAlgorithm(alg.id)"
              class="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              :class="alg.id === store.leftAlgorithmId ? 'text-accent bg-accent/10' : 'text-text-secondary hover:bg-white/5 hover:text-white'"
            >
              <span>{{ alg.name }} — {{ alg.timeComplexity }}</span>
              <span v-if="alg.id === store.leftAlgorithmId" class="text-accent">✓</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- VS Badge & Help Button in Center -->
    <div class="flex-shrink-0 flex flex-col items-center justify-center relative -mt-3.5">
      <button
        class="w-6 h-6 flex items-center justify-center rounded-lg text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all duration-200 cursor-pointer border border-white/5 hover:border-accent-cyan/30 text-[10px] mb-1.5"
        title="Xem lại hướng dẫn"
        @click="tourStore.startPageTour('/compare', true)"
      >❓</button>
      <div class="flex items-center justify-center w-10 h-10 rounded-full"
           style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15)); border: 1px solid rgba(255, 255, 255, 0.08);">
        <span class="text-xs font-black text-text-primary tracking-wider">VS</span>
      </div>
    </div>

    <!-- Right Algorithm -->
    <div class="flex-1">
      <label class="block text-[10px] font-bold uppercase tracking-widest text-accent-green mb-1.5">Thuật toán Phải</label>
      
      <!-- Custom Right Dropdown -->
      <div class="relative w-full" ref="rightDropdownRef">
        <button
          @click="showRightDropdown = !showRightDropdown"
          class="w-full px-3 py-2 rounded-xl text-sm font-medium text-text-primary border transition-all cursor-pointer flex items-center justify-between"
          style="background: rgba(15, 23, 42, 0.7); border-color: rgba(16, 185, 129, 0.3);"
        >
          <span class="truncate">{{ selectedRightAlgorithmName }}</span>
          <svg class="w-4 h-4 text-text-muted transition-transform duration-200 flex-shrink-0 ml-2" :class="{ 'rotate-180': showRightDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div
            v-if="showRightDropdown"
            class="absolute left-0 right-0 top-full mt-1.5 rounded-xl border z-50 overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col py-1"
            style="background: rgba(15, 23, 42, 0.95); border-color: rgba(16, 185, 129, 0.3);"
          >
            <button
              v-for="alg in sortingAlgorithms"
              :key="alg.id"
              :disabled="alg.id === store.leftAlgorithmId"
              @click="selectRightAlgorithm(alg.id)"
              class="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              :class="alg.id === store.rightAlgorithmId ? 'text-accent-green bg-accent-green/10' : 'text-text-secondary hover:bg-white/5 hover:text-white'"
            >
              <span>{{ alg.name }} — {{ alg.timeComplexity }}</span>
              <span v-if="alg.id === store.rightAlgorithmId" class="text-accent-green">✓</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Input Controls -->
    <div class="flex-shrink-0 flex items-center gap-2">
      <div class="flex flex-col gap-1.5">
        <button
          @click="onGenerateAndLoad"
          class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          style="background: linear-gradient(135deg, #06B6D4, #10B981); color: white; box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);"
        >
          Tạo dữ liệu
        </button>
        <button
          @click="onLoadWithCurrent"
          class="px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          style="background: rgba(30, 41, 59, 0.6); color: #94A3B8; border: 1px solid rgba(255, 255, 255, 0.06);"
        >
          So sánh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ALGORITHM_CATALOG } from '../../dsa-modules/services/algorithmCatalog';
import { useCompareAlgorithmsStore } from '../store/useCompareAlgorithmsStore';
import { useGuidedTourStore } from '../../guided-tour/store/useGuidedTourStore';

const store = useCompareAlgorithmsStore();
const tourStore = useGuidedTourStore();

const sortingAlgorithms = computed(() => ALGORITHM_CATALOG.filter((a) => a.category === 'Sorting'));

const showLeftDropdown = ref(false);
const showRightDropdown = ref(false);
const leftDropdownRef = ref<HTMLElement | null>(null);
const rightDropdownRef = ref<HTMLElement | null>(null);

const selectedLeftAlgorithmName = computed(() => {
  const found = ALGORITHM_CATALOG.find(a => a.id === store.leftAlgorithmId);
  return found ? `${found.name} — ${found.timeComplexity}` : 'Chọn thuật toán';
});

const selectedRightAlgorithmName = computed(() => {
  const found = ALGORITHM_CATALOG.find(a => a.id === store.rightAlgorithmId);
  return found ? `${found.name} — ${found.timeComplexity}` : 'Chọn thuật toán';
});

const selectLeftAlgorithm = (id: string) => {
  store.leftAlgorithmId = id;
  showLeftDropdown.value = false;
};

const selectRightAlgorithm = (id: string) => {
  store.rightAlgorithmId = id;
  showRightDropdown.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (leftDropdownRef.value && !leftDropdownRef.value.contains(e.target as Node)) {
    showLeftDropdown.value = false;
  }
  if (rightDropdownRef.value && !rightDropdownRef.value.contains(e.target as Node)) {
    showRightDropdown.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

const onGenerateAndLoad = () => {
  store.generateRandomInput(10);
  store.loadCompareSession(store.leftAlgorithmId, store.rightAlgorithmId);
};
const onLoadWithCurrent = () => store.loadCompareSession(store.leftAlgorithmId, store.rightAlgorithmId);
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
