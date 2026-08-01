<template>
  <div class="flex items-center gap-3 mb-3">
    <label class="text-[11px] text-text-secondary uppercase tracking-wider font-medium whitespace-nowrap">
      Mảng đầu vào:
    </label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      placeholder="5, 3, 8, 1, 9"
      class="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors focus:outline-none"
      :class="isValid ? 'border-border-default text-text-secondary focus:border-accent-cyan/50' : 'border-accent-red/50 text-accent-red'"
      @blur="$emit('parse')"
      @keydown.enter="$emit('parse')"
      style="background: rgba(15, 23, 42, 0.6);"
    />
    <button @click="$emit('run')" :disabled="isCompiling" class="run-btn" :class="{ 'run-btn-loading': isCompiling }">
      <svg v-if="!isCompiling" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="mr-1.5">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <div v-else class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
      <span class="text-xs font-semibold uppercase tracking-wider">{{ isCompiling ? 'Đang biên dịch...' : 'Run' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string; isValid: boolean; isCompiling: boolean }>();
defineEmits<{ 'update:modelValue': [v: string]; parse: []; run: [] }>();
</script>

<style scoped>
.run-btn { display: flex; align-items: center; padding: 6px 16px; border-radius: 10px; background: linear-gradient(135deg, #06B6D4, #0891B2); color: white; cursor: pointer; border: none; transition: all 0.2s ease; white-space: nowrap; }
.run-btn:hover:not(:disabled) { background: linear-gradient(135deg, #22D3EE, #06B6D4); box-shadow: 0 0 16px rgba(6, 182, 212, 0.4); }
.run-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.run-btn-loading { background: linear-gradient(135deg, #0891B2, #0E7490); animation: loadingPulse 1.5s infinite alternate; }
@keyframes loadingPulse { 0% { box-shadow: 0 0 8px rgba(6, 182, 212, 0.2); } 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.5); } }
</style>
