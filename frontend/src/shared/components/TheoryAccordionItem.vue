<template>
  <div
    :id="`sec-pane-${sec.id}`"
    class="accordion-section"
    :class="{
      'active-section': activeSectionId === sec.id,
      'expanded-section': expandedSectionId === sec.id,
      'flash-active': flashedSectionId === sec.id
    }"
  >
    <!-- Accordion Header Title Bar -->
    <div
      class="accordion-header"
      :class="{ 'accordion-header-active': expandedSectionId === sec.id || activeSectionId === sec.id }"
      @click="$emit('toggle')"
    >
      <div class="flex items-center gap-2">
        <span class="accordion-bullet" :class="{ 'bullet-active': activeSectionId === sec.id }">
          {{ idx + 1 }}
        </span>
        <h4
          class="accordion-title"
          :class="{ 'accordion-title-active': expandedSectionId === sec.id || activeSectionId === sec.id }"
        >
          {{ sec.title }}
        </h4>
      </div>
      <span class="accordion-arrow">
        <svg v-if="expandedSectionId === sec.id" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </span>
    </div>

    <!-- Accordion Content Box (Collapsed/Expanded) -->
    <div class="accordion-content-wrapper" v-show="expandedSectionId === sec.id">
      <div class="accordion-content">
        
        <div class="section-markdown-body" v-html="renderMarkdown(sec.content)"></div>

        <!-- C# Sample Code (Collapsed to 5 lines max) -->
        <div class="section-code-sample" v-if="sec.codeSample">
          <div class="code-sample-title flex items-center justify-between mb-2">
            <span class="text-[9.5px] text-text-muted font-bold">Mã C# minh họa:</span>
            <button class="copy-btn" @click="copyCode(sec.codeSample)">Sao chép</button>
          </div>
          
          <div class="code-box-wrapper">
            <pre class="code-pre"><code>{{ codeLinesToShow }}</code></pre>
          </div>

          <button
            v-if="hasMoreThanFiveLines"
            class="code-line-show-btn"
            @click="showFullCode = !showFullCode"
          >
            {{ showFullCode ? '▲ Thu gọn mã nguồn' : '▼ Xem mã nguồn đầy đủ' }}
          </button>
        </div>

        <!-- Pillar Navigation Completion check at the last section -->
        <div v-if="isLast" class="pillar-completion-footer mt-4">
          <div class="completion-banner">
            <span class="check-icon-wrapper">
              <SvgIcon name="check" :size="9" color="#10b981" />
            </span>
            <span class="completion-text">Bạn đã sẵn sàng học tiếp?</span>
          </div>
          <button class="next-pillar-btn mt-2" @click="$emit('nextPillar')">
            Học tiếp: {{ nextPillarName }} ➔
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TheorySection } from '../types/theory.types';
import { renderMarkdown } from '../utils/markdown';
import SvgIcon from '../../components/icons/SvgIcon.vue';

const props = defineProps<{
  sec: TheorySection;
  idx: number;
  activeSectionId?: string | null;
  expandedSectionId?: string | null;
  flashedSectionId?: string | null;
  isLast: boolean;
  nextPillarName: string;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
  (e: 'nextPillar'): void;
}>();

const showFullCode = ref(false);

const hasMoreThanFiveLines = computed(() => {
  if (!props.sec.codeSample) return false;
  return props.sec.codeSample.split('\n').length > 5;
});

const codeLinesToShow = computed(() => {
  if (!props.sec.codeSample) return '';
  if (showFullCode.value) return props.sec.codeSample;
  
  const lines = props.sec.codeSample.split('\n');
  if (lines.length <= 5) return props.sec.codeSample;
  return lines.slice(0, 5).join('\n') + '\n// ...';
});

function copyCode(code: string) {
  navigator.clipboard.writeText(code);
  alert('Đã sao chép mã nguồn ví dụ C# vào Clipboard!');
}
</script>

<style scoped>
.accordion-section {
  border-bottom: 1.5px solid var(--color-border-subtle);
  transition: all 0.25s ease;
}

.accordion-section.active-section {
  border-left: 4px solid var(--color-accent-cyan);
  background: rgba(6, 182, 212, 0.02);
}



.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.accordion-header:hover {
  background-color: var(--color-bg-hover);
}

.accordion-header-active {
  background-color: color-mix(in srgb, var(--color-bg-surface) 30%, transparent);
}

.accordion-bullet {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-muted);
  font-size: 9.5px;
  font-weight: 800;
}

.bullet-active {
  background: var(--color-accent-cyan);
  border-color: var(--color-accent-cyan);
  color: #111827;
}

.accordion-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

.accordion-title-active {
  color: var(--color-text-primary);
}

.accordion-arrow {
  font-size: 9px;
  color: var(--color-text-muted);
}

.accordion-content-wrapper {
  overflow: hidden;
}

.accordion-content {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-markdown-body :deep(.markdown-p) {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  opacity: 0.75;
  margin-bottom: 0;
}

.section-markdown-body :deep(p) {
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  opacity: 0.75;
  margin-bottom: 8px;
}

.section-markdown-body :deep(strong) {
  color: var(--color-text-primary);
  font-weight: 700;
}

.section-markdown-body :deep(em) {
  font-style: italic;
}

.section-markdown-body :deep(li) {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  opacity: 0.75;
  margin-bottom: 4px;
}

.section-markdown-body :deep(.syn-inline-code) {
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: var(--color-accent-cyan);
  font-family: var(--font-mono);
  font-size: 9.5px;
  padding: 1px 4px;
  border-radius: var(--radius-sm);
}

.section-code-sample {
  border-top: 1px solid var(--color-border-subtle);
  margin-top: 12px;
  padding-top: 12px;
}

.code-box-wrapper {
  background: #141622;
  padding: 10px;
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.code-pre {
  margin: 0;
}

.code-pre code {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #c9d1d9;
  line-height: 1.45;
  white-space: pre;
}

.copy-btn {
  background: transparent;
  border: none;
  color: var(--color-accent-cyan);
  font-size: 9px;
  cursor: pointer;
  font-weight: 700;
}

.copy-btn:hover {
  text-decoration: underline;
}

.code-line-show-btn {
  background: transparent;
  border: none;
  color: var(--color-accent-cyan);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  padding: 2px 0;
  transition: opacity 0.2s ease;
  display: block;
}

.code-line-show-btn:hover {
  opacity: 0.8;
}

.pillar-completion-footer {
  border-top: 1px dashed var(--color-border-subtle);
  padding-top: 14px;
}

.completion-banner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.check-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
}

.completion-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.next-pillar-btn {
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-cyan));
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 10px var(--color-accent-primary-glow);
  width: 100%;
  text-align: center;
}

.next-pillar-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px var(--color-accent-primary-glow);
}
</style>
