<template>
  <div class="code-panel">
    
    <div class="lang-tabs" v-if="availableLanguages.length > 0">
      <button 
        v-for="lang in availableLanguages" 
        :key="lang" 
        @click="pseudocodeStore.changeLanguage(lang)" 
        class="lang-btn" 
        :class="{ 'active': pseudocodeStore.selectedLanguage === lang }"
      >
        {{ languageLabels[lang] }}
      </button>
    </div>
    
    <div class="code-viewport" ref="viewport" @keydown="onKeyDown" tabindex="0">
      <div 
        v-for="line in activeCodeLines" 
        :key="line.lineNumber" 
        :ref="(el) => { if (el) lineRefs[line.lineNumber] = el as HTMLElement }" 
        @click="onLineClick(line)" 
        class="code-line" 
        :class="{ 
          'active': line.lineNumber === activePhysicalLine, 
          'executable': isLineExecutable(line.logicalId) && line.lineNumber !== activePhysicalLine, 
          'comment': !isLineExecutable(line.logicalId) && line.logicalId === 'NO_ACTION' 
        }"
      >
        <span class="line-num" :class="{ 'active-num': line.lineNumber === activePhysicalLine }">{{ line.lineNumber }}</span>
        <span class="white-space-pre flex-1" v-html="highlightSyntax(line.text)"></span>
        <span v-if="isLineExecutable(line.logicalId) && line.logicalId !== 'NO_ACTION' && getOccurrenceTotal(line.logicalId) > 1" class="occurrence-badge">
          {{ getOccurrenceCurrent(line.logicalId) }}/{{ getOccurrenceTotal(line.logicalId) }}
        </span>
      </div>
      <p v-if="activeCodeLines.length === 0" class="empty-text">Chưa có mã nguồn. Hãy chọn thuật toán và nhấn Visualize.</p>
    </div>
    <VariableWatchPanel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { usePseudocodeStore } from '../store/usePseudocodeStore';
import { highlightSyntax } from '@/features/core-learning/pseudocode-sync/utils/syntaxHighlighter';
import VariableWatchPanel from './VariableWatchPanel.vue';
import type { CodeLine, SupportedLanguage } from '@/features/core-learning/pseudocode-sync/types/pseudocode.types';

const pseudocodeStore = usePseudocodeStore();
const viewport = ref<HTMLDivElement | null>(null);
const lineRefs = ref<Record<number, HTMLElement>>({});
const languageLabels: Record<SupportedLanguage, string> = { cpp: 'C++', java: 'Java', python: 'Python', javascript: 'JavaScript' };

const availableLanguages = computed(() => pseudocodeStore.availableLanguages);
const activeCodeLines = computed(() => pseudocodeStore.activeCodeLines);
const activePhysicalLine = computed(() => pseudocodeStore.activePhysicalLineNumber);
const isLineExecutable = (logicalId: string): boolean => logicalId !== 'NO_ACTION';
const getOccurrenceTotal = (logicalId: string): number => pseudocodeStore.getOccurrenceInfo(logicalId).total;
const getOccurrenceCurrent = (logicalId: string): number => pseudocodeStore.getOccurrenceInfo(logicalId).current;

const onLineClick = (line: CodeLine) => { if (line.logicalId !== 'NO_ACTION') pseudocodeStore.snapToNextOccurrence(line.logicalId); };
const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Tab') { e.preventDefault(); pseudocodeStore.cycleLanguage(); } };

watch(() => pseudocodeStore.activePhysicalLineNumber, async (newLineNum) => {
  if (!newLineNum || newLineNum <= 0) return;
  await nextTick();
  const activeEl = lineRefs.value[newLineNum], viewportEl = viewport.value;
  if (activeEl && viewportEl) {
    const elTop = activeEl.offsetTop, elHeight = activeEl.offsetHeight, viewTop = viewportEl.scrollTop, viewHeight = viewportEl.clientHeight;
    if (elTop < viewTop || elTop + elHeight > viewTop + viewHeight) {
      viewportEl.scrollTo({ top: elTop - viewHeight / 2 + elHeight / 2, behavior: 'smooth' });
    }
  }
});
</script>

<style scoped>
@import "./MultilingualCodePanel.css";
</style>
