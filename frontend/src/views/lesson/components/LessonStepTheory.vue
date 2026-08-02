<template>
  <div class="lesson-step-theory flex flex-col h-full overflow-y-auto p-6 text-text-primary font-sans leading-relaxed">
    
    <div class="border-b border-border-default pb-4 mb-6">
      <div class="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
        <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>Bước 1 / 4</span>
        <span>•</span>
        <span>Kiến Thức Nền Tảng</span>
      </div>
      <h1 class="text-2xl font-black text-text-primary tracking-tight">{{ title }}</h1>
    </div>

    
    <div class="prose prose-invert prose-indigo max-w-none text-sm space-y-4">
      <div v-html="formattedContent"></div>
    </div>

    
    <div class="mt-8 pt-6 border-t border-border-default flex items-center justify-between">
      <span class="text-xs text-text-secondary">Đọc hết bài học để mở khóa phần Trực quan hóa.</span>
      <button
        @click="$emit('completeStep')"
        class="px-5 py-2.5 bg-accent hover:bg-accent text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
      >
        <span>Chuyển sang Trực Quan Hóa</span>
        <BaseIcon name="arrow-right" class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  content: string;
}>();

defineEmits<{
  (e: 'completeStep'): void;
}>();

const formattedContent = computed(() => {
  if (!props.content) return '<p class="text-text-muted italic">Không có nội dung lý thuyết.</p>';
  
  return props.content
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-accent mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-text-primary mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-text-primary mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-text-primary">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-bg-hover text-accent px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\n\n/g, '</p><p class="my-3">');
});
</script>
