<template>
  <div class="code-panel">
    <div class="lang-tabs" v-if="availableLanguages.length > 0" role="tablist" aria-label="Ngôn ngữ mã nguồn">
      <button
        v-for="lang in availableLanguages"
        :key="lang"
        :id="`lang-tab-${lang}`"
        role="tab"
        :aria-selected="pseudocodeStore.selectedLanguage === lang"
        aria-controls="code-viewport-panel"
        @click="pseudocodeStore.changeLanguage(lang)"
        class="lang-btn"
        :class="{ 'active': pseudocodeStore.selectedLanguage === lang }"
      >
        {{ languageLabels[lang] }}
      </button>
    </div>

    <div
      id="code-viewport-panel"
      ref="viewport"
      class="code-viewport"
      role="tabpanel"
      :aria-labelledby="`lang-tab-${pseudocodeStore.selectedLanguage}`"
      aria-label="Khu vực mã nguồn mã giả"
      tabindex="0"
      @keydown="onKeyDown"
    >
      <div
        v-for="line in activeCodeLines"
        :key="line.lineNumber"
        :ref="(el) => { if (el) { lineRefs[line.lineNumber] = el as HTMLElement } else { delete lineRefs[line.lineNumber] } }"
        @click="onLineClick(line)"
        @keydown.enter="onLineClick(line)"
        role="button"
        tabindex="0"
        class="code-line"
        :class="{
          'active': activePhysicalLines.includes(line.lineNumber),
          'executable': isLineExecutable(line.logicalId) && !activePhysicalLines.includes(line.lineNumber),
          'comment': !isLineExecutable(line.logicalId)
        }"
      >
        <span class="line-num" :class="{ 'active-num': activePhysicalLines.includes(line.lineNumber) }">{{ line.lineNumber }}</span>
        <span class="whitespace-pre flex-1" v-html="highlightSyntax(line.text, pseudocodeStore.selectedLanguage)"></span>
        <span
          v-if="line.logicalId === pseudocodeStore.activeLogicalLineId && (occurrenceMap.get(line.logicalId)?.total ?? 0) > 1"
          class="occurrence-badge"
        >
          {{ occurrenceMap.get(line.logicalId)?.current }}/{{ occurrenceMap.get(line.logicalId)?.total }}
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
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { highlightSyntax } from '../utils/syntaxHighlighter';
import VariableWatchPanel from './VariableWatchPanel.vue';
import type { CodeLine, SupportedLanguage } from '../types/pseudocode.types';

const pseudocodeStore = usePseudocodeStore();
const animStore = useAnimationStore();
const viewport = ref<HTMLDivElement | null>(null);
const lineRefs = ref<Record<number, HTMLElement>>({});
const languageLabels: Record<SupportedLanguage, string> = { cpp: 'C++', java: 'Java', python: 'Python', javascript: 'JavaScript' };

const availableLanguages = computed(() => pseudocodeStore.availableLanguages);
const activeCodeLines = computed(() => pseudocodeStore.activeCodeLines);
// PS-011: highlight mọi dòng khớp logicalId (Java khối swap 3 dòng cùng SWAP_STEP
// phải sáng cả block, không chỉ dòng đầu tiên — engine trả danh sách line).
const activePhysicalLines = computed(() => pseudocodeStore.activePhysicalLineNumbers);
const isLineExecutable = (logicalId: string): boolean => logicalId !== 'NO_ACTION';

// PS-013: Map occurrence tính MỘT LẦN mỗi khi frames/currentIndex/script đổi
// (getOccurrenceInfo nội bộ là O(F) theo helper trong store) — trước đây gọi
// 2 lần/dòng ngay trong template `v-for` → O(L×F) mỗi render.
const occurrenceMap = computed<Map<string, { current: number; total: number }>>(() => {
  const map = new Map<string, { current: number; total: number }>();
  for (const line of activeCodeLines.value) {
    if (line.logicalId === 'NO_ACTION') continue;
    map.set(line.logicalId, pseudocodeStore.getOccurrenceInfo(line.logicalId));
  }
  return map;
});

// PS-007: click dòng = nhảy tới FIRST occurrence (BEHAVIOR_SPEC §2) — trước đây
// luôn gọi snapToNextOccurrence nên không bao giờ quay về occurrence đầu tiên.
const onLineClick = (line: CodeLine): void => { if (line.logicalId !== 'NO_ACTION') pseudocodeStore.snapToLogicalLine(line.logicalId); };

// PS-014: Tab giữ hành vi focus mặc định (không preventDefault → không bẫy
// focus, người dùng Tab qua panel bình thường). Chỉ Ctrl+Tab / Alt+Tab
// (Shift để đổi ngược chiều) mới hoán chuyển ngôn ngữ.
const cycleLanguageBackward = (): void => {
  const langs = availableLanguages.value;
  if (langs.length === 0) return;
  const currentIdx = langs.indexOf(pseudocodeStore.selectedLanguage);
  pseudocodeStore.changeLanguage(langs[(currentIdx - 1 + langs.length) % langs.length]);
};

const onKeyDown = (e: KeyboardEvent): void => {
  if (e.key !== 'Tab' || !(e.ctrlKey || e.altKey)) return;
  e.preventDefault();
  if (e.shiftKey) cycleLanguageBackward();
  else pseudocodeStore.cycleLanguage();
};

// PS-005: Auto-scroll sai hệ tọa độ — `offsetTop` của dòng code tính theo
// offsetParent (có thể là <body>) trong khi `scrollTop` là tọa độ trong
// viewport → điều kiện so sánh gần như luôn đúng → scroll về đáy mỗi frame.
// Sửa bằng rect math: quy đổi về tọa độ nội dung viewport qua
// `aRect.top - vRect.top + viewportEl.scrollTop`.
// PS-019: khi đang PLAYING dùng `behavior: 'auto'` tránh smooth-scroll xếp
// hàng jank khi tua nhanh; chỉ smooth khi đã tạm dừng.
watch(() => pseudocodeStore.activePhysicalLineNumbers, async (newLineNums) => {
  const newLineNum = newLineNums[0] ?? null;
  if (!newLineNum || newLineNum <= 0) return;
  await nextTick();
  const activeEl = lineRefs.value[newLineNum];
  const viewportEl = viewport.value;
  if (!activeEl || !viewportEl) return;

  const aRect = activeEl.getBoundingClientRect();
  const vRect = viewportEl.getBoundingClientRect();
  const elTop = aRect.top - vRect.top + viewportEl.scrollTop;
  const elHeight = aRect.height;
  const viewTop = viewportEl.scrollTop;
  const viewHeight = viewportEl.clientHeight;

  if (elTop < viewTop || elTop + elHeight > viewTop + viewHeight) {
    const behavior: ScrollBehavior = animStore.isPlaying ? 'auto' : 'smooth';
    viewportEl.scrollTo({ top: elTop - viewHeight / 2 + elHeight / 2, behavior });
  }
});
</script>

<style scoped>
@import "./MultilingualCodePanel.css";
</style>
