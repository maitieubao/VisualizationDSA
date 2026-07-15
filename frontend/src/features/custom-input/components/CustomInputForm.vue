<template>
  <div class="flex flex-col h-full w-full gap-3 p-4 bg-bg-secondary/80 overflow-auto">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" class="text-accent-yellow">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      <span class="text-xs font-bold uppercase tracking-wider text-text-secondary">Custom Input</span>
    </div>

    <!-- TextArea -->
    <div class="flex flex-col gap-1.5">
      <label class="text-[11px] text-text-secondary">Nhập mảng số nguyên (cách nhau bằng dấu phẩy):</label>
      <textarea v-model="inputStore.rawText" :readonly="inputStore.isLoading"
        :placeholder="'Ví dụ: 14, 25, 38, 9, 4'" rows="3"
        class="w-full rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-slate-600 outline-none resize-none transition-all duration-200"
        :class="textareaClasses" @keydown="onKeydown"></textarea>
      <div class="flex items-center justify-between text-[11px]">
        <span :class="counterClasses">{{ inputStore.elementCount }} / {{ inputStore.maxLimit }} phần tử</span>
        <span v-if="statusText" :class="statusClasses">{{ statusText }}</span>
      </div>
      <div v-if="errorText" class="text-[11px] font-mono" :class="formState === 'limit-error' ? 'text-accent-yellow' : 'text-accent-red'">{{ errorText }}</div>
      <div v-if="inputStore.apiErrorMessage" class="text-[11px] font-mono text-accent-red">{{ inputStore.apiErrorMessage }}</div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Random Generate Dropdown -->
      <div class="relative" ref="dropdownRef">
        <button class="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-bg-surface border border-border-default text-text-secondary hover:text-white hover:border-border-strong transition-colors flex items-center gap-1.5"
          @click="showDropdown = !showDropdown">
          <span class="text-base leading-none">&#x1F3B2;</span>
          <span>Sinh Ngẫu Nhiên</span>
          <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showDropdown }" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="showDropdown" class="absolute left-0 top-full mt-1 w-52 bg-bg-surface border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
            <button v-for="opt in generationOptions" :key="opt.type"
              class="w-full text-left px-3 py-2 text-[11px] text-text-secondary hover:bg-bg-active hover:text-white transition-colors"
              @click="onGenerate(opt.type)">{{ opt.label }}</button>
          </div>
        </Transition>
      </div>

      <button class="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-bg-surface border border-border-default text-text-secondary hover:text-white hover:border-border-strong transition-colors"
        @click="inputStore.clear()">Xóa Trắng</button>

      <button :disabled="!inputStore.canExecute"
        class="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5"
        :class="executeButtonClasses" @click="onExecute">
        <svg v-if="inputStore.isLoading" class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="10" class="opacity-25" /><path d="M4 12a8 8 0 018-8" class="opacity-75" />
        </svg>
        <span v-else class="text-base leading-none">&#x26A1;</span>
        <span>{{ inputStore.isLoading ? 'Đang xử lý...' : 'Chạy Trực Quan' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCustomInputForm } from '../composables/useCustomInputForm';

const {
  inputStore, showDropdown, dropdownRef, generationOptions,
  formState, textareaClasses, counterClasses, statusText, statusClasses, errorText, executeButtonClasses,
  onGenerate, onExecute, onKeydown,
} = useCustomInputForm();
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
