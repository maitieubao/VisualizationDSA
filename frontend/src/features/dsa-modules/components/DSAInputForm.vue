<template>
  <div class="rounded-xl overflow-hidden border border-border-subtle shadow-lg bg-bg-secondary p-3">
    <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">Dữ liệu đầu vào</h4>
    <textarea
      :value="modelValue"
      @input="onInput"
      class="w-full bg-bg-surface border border-border-default rounded-lg px-3 py-2 text-sm text-text-secondary font-mono resize-none focus:outline-none focus:border-accent transition-colors"
      rows="2"
      placeholder="Ví dụ: 5, 3, 8, 1, 9"
      @keydown.ctrl.enter.prevent="$emit('submit')"
    />
    <div class="flex items-center gap-2 mt-2">
      <button
        class="text-[10px] text-text-secondary hover:text-accent-cyan px-2 py-1 rounded bg-bg-surface hover:bg-bg-active transition-colors"
        @click="generateRandom"
      >
        Sinh ngẫu nhiên
      </button>
      <span class="text-[10px] text-text-muted flex-1 text-right">
        Ctrl+Enter để chạy
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  algorithmCategory: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'submit'): void;
}>();

function onInput(e: Event): void {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}

function generateRandom(): void {
  const category = props.algorithmCategory.toLowerCase();
  const count = category === 'tree' || category === 'stack-queue' ? 7 : 8;
  const max = category === 'tree' ? 99 : 50;
  const values: number[] = [];

  if (category === 'searching') {
    for (let i = 0; i < count; i++) values.push(Math.floor(Math.random() * max) + 1);
    values.sort((a, b) => a - b);
    const target = values[Math.floor(Math.random() * values.length)];
    values.push(target);
  } else {
    for (let i = 0; i < count; i++) values.push(Math.floor(Math.random() * max) + 1);
  }

  emit('update:modelValue', values.join(', '));
}
</script>
