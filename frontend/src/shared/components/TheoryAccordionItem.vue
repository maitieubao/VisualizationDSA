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

    
    <div class="accordion-content-wrapper" v-show="expandedSectionId === sec.id">
      <div class="accordion-content">
        
        <div class="section-markdown-body" v-html="renderMarkdown(sec.content)"></div>

        
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

        
        <div v-if="isLast" class="pillar-completion-footer mt-4">
          <div class="completion-banner">
            <span class="check-icon-wrapper">
              <SvgIcon name="check" :size="9" color="#10b981" />
            </span>
            <span class="completion-text">Bạn đã sẵn sàng học tiếp?</span>
          </div>
          <button class="next-pillar-btn mt-2" @click="$emit('nextPillar')">
            Học tiếp: {{ nextPillarName }} <BaseIcon name="arrow-right" class="w-3.5 h-3.5 inline ml-1 align-middle" />
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
@import "./TheoryAccordionItem.css";
</style>
