<template>
  <div class="sorting-drawer-input relative font-sans">
    
    <button
      @click="isOpen = !isOpen"
      class="drawer-toggle-btn flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-xl cursor-pointer"
      :class="isOpen ? 'bg-accent text-white border border-accent/50' : 'bg-bg-surface hover:bg-bg-hover text-text-secondary border border-border-default hover:border-border-strong backdrop-blur-md'"
    >
      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      <span>{{ isOpen ? 'Đóng Tùy Chọn Mảng' : 'Tùy Chọn Mảng' }}</span>
      <svg class="w-3 h-3 opacity-60 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    
    <transition name="drawer-slide">
      <div v-if="isOpen" class="drawer-card absolute bottom-12 left-0 z-40 p-4 rounded-lg bg-bg-surface border border-border-default shadow-2xl backdrop-blur-xl w-96 sm:w-[420px] flex flex-col gap-3.5">
        
        <div class="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <span class="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Tạo & Khởi Tạo Mảng (Create Array)
          </span>
          <button @click="isOpen = false" class="text-text-muted hover:text-text-primary text-xs cursor-pointer p-1">✕</button>
        </div>

        
        <div class="space-y-1.5">
          <span class="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Mẫu dữ liệu có sẵn:</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              @click="generateRandom"
              class="px-2.5 py-1.5 rounded-lg bg-bg-active hover:bg-accent hover:text-white text-text-secondary text-xs font-semibold border border-border-subtle transition-colors cursor-pointer text-center"
            >
              Ngẫu nhiên
            </button>
            <button
              @click="generateSorted"
              class="px-2.5 py-1.5 rounded-lg bg-bg-active hover:bg-accent hover:text-white text-text-secondary text-xs font-semibold border border-border-subtle transition-colors cursor-pointer text-center"
            >
              Đã sắp xếp
            </button>
            <button
              @click="generateReversed"
              class="px-2.5 py-1.5 rounded-lg bg-bg-active hover:bg-accent hover:text-white text-text-secondary text-xs font-semibold border border-border-subtle transition-colors cursor-pointer text-center"
            >
              Sắp xếp ngược
            </button>
            <button
              @click="generateNearlySorted"
              class="px-2.5 py-1.5 rounded-lg bg-bg-active hover:bg-accent hover:text-white text-text-secondary text-xs font-semibold border border-border-subtle transition-colors cursor-pointer text-center"
            >
              Gần sắp xếp
            </button>
          </div>
        </div>

        
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-400 uppercase tracking-wide">Số lượng phần tử (N):</span>
            <span class="font-mono font-bold text-accent">{{ arraySize }}</span>
          </div>
          <input
            type="range"
            min="4"
            max="15"
            v-model.number="arraySize"
            @input="generateRandom"
            class="w-full h-1.5 bg-bg-active rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        
        <div class="space-y-1.5">
          <span class="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Tự nhập chuỗi phần tử:</span>
          <VcrArrayInput
            :raw-input-array="vcrStore.rawInputArray"
            :compilation-error="compilationError"
            @randomize="generateRandom"
            @compile="compileInput"
            @update:rawInputArray="vcrStore.rawInputArray = $event"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import VcrArrayInput from '../../vcr-player/components/VcrArrayInput.vue';

const vcrStore = useVcrStore();
const isOpen = ref(false);
const arraySize = ref(7);
const compilationError = ref<string | null>(null);

function compileInput(): void {
  compilationError.value = null;
  const elements = vcrStore.rawInputArray
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '' && !isNaN(Number(s)));
  if (elements.length > 15) {
    compilationError.value = `⚠️ Vượt quá 15 phần tử! Chỉ lấy 15 phần tử đầu.`;
  }
  const res = vcrStore.compileAndLoad();
  if (!res.success) compilationError.value = res.error || "Lỗi khi biên dịch mảng";
  else isOpen.value = false;
}

function generateRandom(): void {
  compilationError.value = null;
  const count = arraySize.value;
  const arr = Array.from({ length: count }, () => Math.floor(Math.random() * 85) + 10);
  vcrStore.rawInputArray = arr.join(", ");
  vcrStore.compileAndLoad();
}

function generateSorted(): void {
  compilationError.value = null;
  const count = arraySize.value;
  const arr = Array.from({ length: count }, (_, i) => Math.floor((i + 1) * (85 / count)));
  vcrStore.rawInputArray = arr.join(", ");
  vcrStore.compileAndLoad();
}

function generateReversed(): void {
  compilationError.value = null;
  const count = arraySize.value;
  const arr = Array.from({ length: count }, (_, i) => Math.floor((count - i) * (85 / count)));
  vcrStore.rawInputArray = arr.join(", ");
  vcrStore.compileAndLoad();
}

function generateNearlySorted(): void {
  compilationError.value = null;
  const count = arraySize.value;
  const arr = Array.from({ length: count }, (_, i) => Math.floor((i + 1) * (85 / count)));
  if (count > 3) {
    const temp = arr[1];
    arr[1] = arr[2];
    arr[2] = temp;
  }
  vcrStore.rawInputArray = arr.join(", ");
  vcrStore.compileAndLoad();
}
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
