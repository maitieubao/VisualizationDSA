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
      style="background: color-mix(in srgb, var(--color-bg-surface) 60%, transparent);"
    />
    <button @click="$emit('run')" :disabled="isCompiling" class="run-btn" :class="{ 'run-btn-loading': isCompiling }">
      <BaseIcon v-if="!isCompiling" name="play" class="w-3.5 h-3.5 mr-1.5" />
      <div v-else class="w-3.5 h-3.5 border-2 border-border-default border-t-transparent rounded-full animate-spin mr-1.5" />
      <span class="text-xs font-semibold uppercase tracking-wider">{{ isCompiling ? 'Đang biên dịch...' : 'Run' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string; isValid: boolean; isCompiling: boolean }>();
defineEmits<{ 'update:modelValue': [v: string]; parse: []; run: [] }>();
</script>

<style scoped>
.run-btn { display: flex; align-items: center; padding: 6px 16px; border-radius: 10px; background: linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan)); color: white; cursor: pointer; border: none; transition: all 0.2s ease; white-space: nowrap; }
.run-btn:hover:not(:disabled) { background: linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan)); box-shadow: 0 0 16px color-mix(in srgb, var(--color-accent-cyan) 40%, transparent); }
.run-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.run-btn-loading { background: linear-gradient(135deg, var(--color-accent-cyan), color-mix(in srgb, var(--color-accent-cyan) 55%, var(--color-bg-primary))); animation: loadingPulse 1.5s infinite alternate; }
@keyframes loadingPulse { 0% { box-shadow: 0 0 8px color-mix(in srgb, var(--color-accent-cyan) 20%, transparent); } 100% { box-shadow: 0 0 20px color-mix(in srgb, var(--color-accent-cyan) 50%, transparent); } }
</style>
