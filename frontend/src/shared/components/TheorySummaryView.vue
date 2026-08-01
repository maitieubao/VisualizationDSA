<template>
  <div class="summary-view-container animate-fade-in">
    <div class="summary-card-premium">
      <h4 class="summary-card-title flex items-center gap-1.5">
        <SvgIcon name="target" :size="15" color="var(--color-accent-yellow)" />
        <span>Khái niệm cốt lõi</span>
      </h4>
      <div class="summary-card-body" v-html="renderMarkdown(document.sections[0]?.content || '')"></div>
      
      <button class="read-more-premium-btn" @click="$emit('readMore')">
        <div class="flex items-center justify-center gap-1.5">
          <SvgIcon name="book" :size="13" color="white" />
          <span>Đọc Giáo trình & Ví dụ C# đầy đủ</span>
        </div>
      </button>
    </div>

    <!-- Key Terms Tag Cloud -->
    <div class="key-terms-cloud mt-4" v-if="allTags.length > 0">
      <span class="text-[10px] text-text-muted uppercase tracking-wider block mb-2 font-bold">
        Từ khóa bài học (Click để highlight Code):
      </span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="term-tag-btn"
          @click="$emit('tagClick', tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TheoryDocument } from '@/shared/types/theory.types';
import { renderMarkdown } from '@/shared/utils/markdown';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const props = defineProps<{
  document: TheoryDocument;
}>();

defineEmits<{
  (e: 'tagClick', tag: string): void;
  (e: 'readMore'): void;
}>();

const allTags = computed<string[]>(() => {
  if (!props.document) return [];
  const set = new Set<string>();
  props.document.sections.forEach(sec => {
    sec.keywordTags?.forEach(tag => {
      const t = tag.trim().toLowerCase();
      if (t) set.add(t);
    });
  });
  return Array.from(set);
});
</script>

<style scoped>
.summary-view-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.summary-card-premium {
  background: color-mix(in srgb, var(--color-bg-surface) 75%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--color-accent-yellow) 25%, var(--color-border-subtle));
  border-radius: var(--radius-xl);
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-card-title {
  font-size: 12.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-accent-yellow);
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 6px;
}

.summary-card-body {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.read-more-premium-btn {
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-purple));
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px var(--color-accent-primary-glow);
  text-align: center;
  margin-top: 6px;
}

.read-more-premium-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--color-accent-primary-glow);
  filter: brightness(1.1);
}

.term-tag-btn {
  background: color-mix(in srgb, var(--color-bg-surface) 40%, transparent);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: 600;
  font-family: var(--font-mono);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
}

.term-tag-btn:hover {
  background: var(--color-accent-cyan-dim);
  border-color: var(--color-accent-cyan);
  color: var(--color-accent-cyan-text);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
