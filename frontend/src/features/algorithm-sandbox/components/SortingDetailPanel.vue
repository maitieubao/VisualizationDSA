<template>
  <div class="sorting-detail-panel flex flex-col font-sans h-full min-h-0 panel-card overflow-hidden" data-tour-id="trace-watcher-panel">
    <!-- Header / Tabs (At the very top of the right column) -->
    <div class="flex flex-col border-b bg-slate-900/50" style="border-color:var(--vis-panel-border)">
      <div class="flex items-center gap-2 p-4 pb-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <span class="text-sm font-bold uppercase tracking-wider font-sans" style="color:var(--color-text-primary)">Interactive Workspace</span>
      </div>
      <div class="flex gap-4 w-full px-4 pt-3">
        <button 
          @click="activeTab = 'controls'" 
          class="pb-3 text-xs font-bold uppercase tracking-wider transition-all duration-250 cursor-pointer border-b-2"
          :class="activeTab === 'controls' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'"
        >
          Điều khiển & Đầu vào
        </button>
        <button 
          @click="activeTab = 'code'" 
          class="pb-3 text-xs font-bold uppercase tracking-wider transition-all duration-250 cursor-pointer border-b-2"
          :class="activeTab === 'code' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'"
        >
          Code Sandbox
        </button>
      </div>
    </div>

    <!-- Tab 1: Controls & Input Config -->
    <div v-show="activeTab === 'controls'" class="flex-1 flex flex-col gap-6 overflow-y-auto p-4 custom-scrollbar">
      <!-- Playback Controls -->
      <VcrControlPanel />
      
      <!-- Array Input Config -->
      <div class="vis-badge-panel rounded-xl p-4 flex flex-col gap-4">
        <h4 class="text-sm font-bold text-slate-300">Cấu hình mảng đầu vào</h4>
        <p class="text-[11px] text-slate-400 mb-2 leading-relaxed">Nhập mảng tùy chỉnh để kiểm tra thuật toán. Các phần tử phân cách bằng dấu phẩy. Giới hạn 15 phần tử.</p>
        
        <VcrArrayInput
          :raw-input-array="vcrStore.rawInputArray"
          :compilation-error="compilationError"
          @randomize="randomizeArray"
          @compile="compileInput"
          @update:rawInputArray="vcrStore.rawInputArray = $event"
        />
      </div>
    </div>

    <!-- Tab 2: Code Sandbox (Full Height) -->
    <div v-show="activeTab === 'code'" class="flex-1 flex flex-col min-h-0">
      <CodeEditor class="flex-1 min-h-0 w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVcrStore } from '../../vcr-player';
import { CodeEditor } from '../../code-editor';
import VcrControlPanel from '../../vcr-player/components/VcrControlPanel.vue';
import VcrArrayInput from '../../vcr-player/components/VcrArrayInput.vue';

const vcrStore = useVcrStore();
const activeTab = ref<'controls' | 'code'>('controls');

// Input compilation logic extracted from VcrControlPanel
const compilationError = ref<string | null>(null);

const compileInput = (): void => {
  compilationError.value = null;

  const rawParts = vcrStore.rawInputArray
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');

  if (rawParts.length === 0) {
    compilationError.value = "⚠️ Mảng đầu vào không được để trống.";
    return;
  }

  const invalidParts = rawParts.filter((s) => isNaN(Number(s)));
  if (invalidParts.length > 0) {
    compilationError.value = `⚠️ Đầu vào không hợp lệ: "${invalidParts[0]}". Vui lòng chỉ nhập số.`;
    return;
  }

  const elements = rawParts.map(Number);
  
  if (elements.length > 15) {
    compilationError.value = `⚠️ Vượt quá giới hạn! Chỉ hiển thị 15 phần tử đầu tiên (bạn đã nhập ${elements.length}).`;
  }

  const res = vcrStore.compileAndLoad();
  if (!res.success) {
    compilationError.value = res.error || "Lỗi không xác định khi biên dịch";
  } else {
    // Tự động chuyển về tab code nếu compile thành công
    activeTab.value = 'code';
    // Tự động phát animation ngay lập tức
    vcrStore.play();
  }
};

const randomizeArray = (): void => {
  const length = Math.floor(Math.random() * 5) + 6;
  const arr = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
  vcrStore.rawInputArray = arr.join(", ");
  compileInput();
};
</script>

<style scoped>
.sorting-detail-panel {
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

/* Badge panels styled dynamically */
.vis-badge-panel {
  background-color: color-mix(in srgb, var(--vis-panel-bg) 60%, transparent);
  border: 1px solid var(--color-border-subtle);
}

/* Ghost button (inactive tab) */
.vis-btn-ghost {
  background-color: transparent;
  color: var(--color-text-muted);
}
</style>
