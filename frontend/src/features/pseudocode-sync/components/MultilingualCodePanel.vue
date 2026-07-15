<template>
  <div class="code-panel">
    <!-- Language Selector Tabs -->
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
    <!-- Code Lines Viewport -->
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
import { highlightSyntax } from '../utils/syntaxHighlighter';
import VariableWatchPanel from './VariableWatchPanel.vue';
import type { CodeLine, SupportedLanguage } from '../types/pseudocode.types';

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
.code-panel {
  display: flex;
  flex-direction: column;
  background-color: color-mix(in srgb, var(--color-bg-surface) 45%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  height: 100%;
}

.lang-tabs {
  display: flex;
  background-color: color-mix(in srgb, var(--color-bg-secondary) 60%, transparent);
  padding: 4px;
  border-radius: 14px;
  margin: 8px 12px 0 12px;
  border: 1px solid var(--color-border-subtle);
}

.lang-btn {
  flex: 1;
  padding: 6px 8px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  background-color: transparent;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.lang-btn.active {
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
}

.code-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  background-color: color-mix(in srgb, var(--color-bg-primary) 20%, transparent);
  outline: none;
}

.code-line {
  display: flex;
  align-items: start;
  padding: 4px 14px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.625;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: var(--transition-fast);
  position: relative;
}

.code-line:hover {
  background-color: rgba(255, 255, 255, 0.02);
  color: var(--color-text-primary);
}

.code-line.executable:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: var(--color-text-primary);
}

.code-line.active {
  background-color: rgba(61, 184, 122, 0.12);
  color: var(--color-accent-green);
  border-left-color: var(--color-accent-green);
  font-weight: var(--font-medium);
}

.code-line.comment {
  cursor: default;
  color: var(--color-text-muted);
}

.line-num {
  width: 24px;
  text-align: right;
  margin-right: 12px;
  color: var(--color-text-muted);
  user-select: none;
  font-size: 10px;
  flex-shrink: 0;
}

.line-num.active-num {
  color: var(--color-accent-green);
}

.occurrence-badge {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-text-secondary);
  background-color: color-mix(in srgb, var(--color-bg-hover) 60%, transparent);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-subtle);
}

.empty-text {
  color: var(--color-text-muted);
  font-style: italic;
  padding: 16px;
  font-size: var(--text-xs);
}
</style>
