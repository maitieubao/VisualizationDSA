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
import type { TheoryDocument } from '../types/theory.types';
import { renderMarkdown } from '../utils/markdown';
import SvgIcon from '../../components/icons/SvgIcon.vue';

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
@import "./TheorySummaryView.css";
</style>
