<template>
  <div class="relative flex flex-col h-full w-full gap-3 p-4 bg-bg-secondary/80 overflow-auto">
    
    <div v-if="inputStore.isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-bg-secondary/60 backdrop-blur-sm rounded-xl">
      <div class="flex flex-col items-center gap-2">
        <svg class="w-6 h-6 animate-spin text-accent-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" class="opacity-25" /><path d="M4 12a8 8 0 018-8" class="opacity-75" />
        </svg>
        <span class="text-xs font-medium text-text-secondary">Đang xử lý...</span>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <BaseIcon name="edit" class="w-3.5 h-3.5 text-accent-yellow" />
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Custom Input</span>
    </div>

    
    <div class="flex flex-col gap-1.5">
      <!-- AL-018: label gắn for/id để screen reader biết trường nào -->
      <label for="custom-input-textarea" class="text-[11px] text-text-secondary">Nhập mảng số nguyên (cách nhau bằng dấu phẩy):</label>
      <textarea id="custom-input-textarea" :value="inputStore.rawText" :readonly="inputStore.isLoading"
        :placeholder="'Ví dụ: 14, 25, 38, 9, 4'" rows="3"
        class="w-full rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted outline-none resize-none transition-all duration-200"
        :class="textareaClasses" @input="onRawInput" @keydown="onKeydown"></textarea>
      <div class="flex items-center justify-between text-[11px]">
        <span :class="counterClasses">{{ inputStore.elementCount }} / {{ inputStore.maxLimit }} phần tử</span>
        <span v-if="statusText" :class="statusClasses">{{ statusText }}</span>
      </div>
      <!-- AL-018: lỗi/cảnh báo nằm trong vùng aria-live để screen reader đọc khi cập nhật -->
      <div aria-live="polite">
        <div v-if="errorText" class="text-[11px] font-mono" :class="formState === 'limit-error' ? 'text-accent-yellow' : 'text-accent-red'">{{ errorText }}</div>
        <div v-if="inputStore.hasLargeValues" class="text-[11px] font-mono text-accent-yellow">Cảnh báo: Có phần tử vượt quá 10,000 — có thể gây tràn số nguyên 32-bit.</div>
        <div v-if="inputStore.apiErrorMessage" class="text-[11px] font-mono text-accent-red">{{ inputStore.apiErrorMessage }}</div>
      </div>
      <div class="text-[10px] text-text-muted mt-0.5">Ctrl+Enter: Chạy · Ctrl+Alt+R: Random · Esc: Đóng menu / Xóa</div>
    </div>

    
    <div class="flex items-center gap-2 flex-wrap">
      
      <div class="relative" ref="dropdownRef">
        <button class="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors flex items-center gap-1.5"
          aria-haspopup="menu" :aria-expanded="showDropdown" aria-controls="generation-menu"
          @click="showDropdown = !showDropdown">
          <BaseIcon name="dice" class="w-3.5 h-3.5" />
          <span>Sinh Ngẫu Nhiên</span>
          <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="showDropdown" id="generation-menu" role="menu" class="absolute left-0 top-full mt-1 w-52 bg-bg-surface border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
            <button v-for="opt in generationOptions" :key="opt.type" role="menuitem"
              class="w-full text-left px-3 py-2 text-[11px] text-text-secondary hover:bg-bg-active hover:text-text-primary transition-colors"
              @click="onGenerate(opt.type)">{{ opt.label }}</button>
          </div>
        </Transition>
      </div>

      <button class="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
        :disabled="inputStore.isLoading" @click="inputStore.clear()">Xóa Trắng</button>

      <button :disabled="!inputStore.canExecute"
        class="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5"
        :class="executeButtonClasses" @click="onExecute">
        <svg v-if="inputStore.isLoading" class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="10" class="opacity-25" /><path d="M4 12a8 8 0 018-8" class="opacity-75" />
        </svg>
        <BaseIcon v-else name="zap" class="w-3.5 h-3.5" />
        <span>{{ inputStore.isLoading ? 'Đang xử lý...' : 'Chạy Trực Quan' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import { useCustomInputForm } from '../composables/useCustomInputForm';

const props = defineProps<{
  algorithmId: string;
}>();

const {
  inputStore, showDropdown, dropdownRef, generationOptions,
  formState, textareaClasses, counterClasses, statusText, statusClasses, errorText, executeButtonClasses,
  onRawInput, onGenerate, onExecute, onKeydown,
} = useCustomInputForm(toRef(props, 'algorithmId'));
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
