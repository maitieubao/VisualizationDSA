<template>
  <div class="array-input-bar mb-3" data-tour-id="code-ide-array-input">
    <div class="flex items-center gap-3">
      <label for="array-input" class="text-[11px] text-text-secondary uppercase tracking-wider font-medium whitespace-nowrap">
        Mảng đầu vào:
      </label>
      <input
        id="array-input"
        v-model="localValue"
        type="text"
        placeholder="5, 3, 8, 1, 9"
        class="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors focus:outline-none"
        :class="isValid ? 'border-border-default text-text-secondary focus:border-accent-cyan/50' : 'border-accent-red/50 text-accent-red'"
        @blur="$emit('parse')"
        @keydown.enter="$emit('parse')"
        style="background: color-mix(in srgb, var(--color-bg-surface) 60%, transparent);"
      />
      <button v-if="isCompiling" data-tour-id="code-ide-cancel-btn" @click="$emit('cancel')" class="cancel-btn">
        <span class="text-xs font-semibold uppercase tracking-wider">Hủy</span>
      </button>
      <button v-else data-tour-id="code-ide-run-btn" @click="$emit('run')" :disabled="!isValid" class="run-btn">
        <BaseIcon name="play" class="w-3.5 h-3.5 mr-1.5" />
        <span class="text-xs font-semibold uppercase tracking-wider">Run</span>
      </button>
    </div>
    <p v-if="errorMessage && !isValid" class="array-input-error mt-1.5 text-[11px]" role="alert">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ modelValue: string; isValid: boolean; isCompiling: boolean; errorMessage: string }>();
const emit = defineEmits<{ 'update:modelValue': [v: string]; parse: []; run: []; cancel: [] }>();

const localValue = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
});
</script>

<style scoped>
.run-btn { display: flex; align-items: center; padding: 6px 16px; border-radius: 10px; background: linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan)); color: white; cursor: pointer; border: none; transition: all 0.2s ease; white-space: nowrap; }
.run-btn:hover:not(:disabled) { background: linear-gradient(135deg, var(--color-accent-cyan-light), var(--color-accent-cyan)); box-shadow: 0 0 16px color-mix(in srgb, var(--color-accent-cyan) 40%, transparent); }
.run-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.cancel-btn { display: flex; align-items: center; padding: 6px 16px; border-radius: 10px; background: color-mix(in srgb, var(--color-accent-red) 15%, transparent); color: var(--color-accent-red); cursor: pointer; border: 1px solid color-mix(in srgb, var(--color-accent-red) 40%, transparent); transition: all 0.2s ease; white-space: nowrap; }
.cancel-btn:hover { background: color-mix(in srgb, var(--color-accent-red) 25%, transparent); }

.array-input-error { color: var(--color-accent-red); }
</style>
