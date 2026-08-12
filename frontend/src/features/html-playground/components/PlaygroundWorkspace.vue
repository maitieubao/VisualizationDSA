<template>
  <div ref="workspaceRoot" class="html-playground-workspace flex flex-col w-full h-full min-h-0 bg-bg-primary">
    <header class="shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1.5 justify-between px-3 sm:px-4 py-2 sm:h-12 border-b border-border-default bg-bg-secondary">
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-2 h-2 rounded-full bg-accent-green animate-pulse" aria-hidden="true"></span>
        <span class="text-sm font-semibold text-text-primary truncate">HTML / CSS / JS Playground</span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="px-2.5 py-1 rounded-md text-xs font-medium bg-bg-surface hover:bg-bg-hover border transition-colors cursor-pointer"
          :class="autoRun ? 'text-accent border-accent/40' : 'text-text-secondary border-border-default/60'"
          :aria-pressed="autoRun"
          @click="handleToggleAutoRun"
          title="Tự động chạy preview sau khi dừng gõ 800ms"
        >
          Tự chạy: {{ autoRun ? 'BẬT' : 'TẮT' }}
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-md text-xs font-medium text-text-secondary bg-bg-surface hover:bg-bg-hover border border-border-default/60 transition-colors cursor-pointer"
          @click="handleReset"
          title="Khôi phục code mẫu (có xác nhận)"
        >
          Reset
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-md text-xs font-medium text-text-secondary bg-bg-surface hover:bg-bg-hover border border-border-default/60 transition-colors cursor-pointer"
          @click="handleCopyShareUrl"
          title="Sao chép link chia sẻ (code nén vào URL)"
        >
          <span v-if="copyState === 'copied'">Đã sao chép <BaseIcon name="check" class="w-3 h-3 inline ml-0.5 align-middle" /></span>
          <span v-else-if="copyState === 'error'">Sao chép thất bại <BaseIcon name="warning" class="w-3 h-3 inline ml-0.5 align-middle text-accent-yellow" /></span>
          <span v-else>Chia sẻ</span>
        </button>
        <button
          type="button"
          class="p-1.5 rounded-md text-text-secondary bg-bg-surface hover:bg-bg-hover border border-border-default/60 transition-colors cursor-pointer"
          @click="handleTogglePreview"
          :aria-label="store.isPreviewVisible ? 'Ẩn bản xem trước' : 'Hiện bản xem trước'"
          :title="store.isPreviewVisible ? 'Ẩn bản xem trước' : 'Hiện bản xem trước'"
        >
          <BaseIcon :name="store.isPreviewVisible ? 'minimize-2' : 'maximize-2'" class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          class="px-3 py-1 rounded-md text-xs font-bold text-white bg-accent transition-colors shadow-[0_0_10px_rgba(79,70,229,0.3)] cursor-pointer"
          :class="isRunning ? 'opacity-60 pointer-events-none' : 'hover:bg-accent/80'"
          :disabled="isRunning"
          @click="handleRun"
          title="Chạy lại preview ngay lập tức"
        >
          <BaseIcon v-if="isRunning" name="spinner" class="w-3 h-3 inline mr-1 align-middle animate-spin" />
          <BaseIcon v-else name="play" class="w-3 h-3 inline mr-1 align-middle" />
          {{ isRunning ? 'Đang chạy…' : 'Run' }}
        </button>
        <span
          role="status"
          aria-live="polite"
          style="position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap"
        >
          {{ copyStatusMessage }}
        </span>
      </div>
    </header>

    <!-- HT-024: WAI-ARIA tabs — roving tabindex + phím mũi tên -->
    <div role="tablist" aria-label="Ngôn ngữ code" class="shrink-0 flex items-center border-b border-border-default bg-bg-secondary/60 px-2 gap-1 overflow-x-auto">
      <button
        v-for="(tab, index) in store.tabs"
        :key="tab.id"
        :id="'pg-tab-' + tab.id"
        type="button"
        role="tab"
        :aria-selected="store.activeTab === tab.id"
        :aria-controls="'pg-panel-' + tab.id"
        :tabindex="store.activeTab === tab.id ? 0 : -1"
        class="px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap"
        :class="store.activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-secondary'"
        @click="store.setActiveTab(tab.id)"
        @keydown="onTabKeydown($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="flex-1 min-h-0 grid gap-0" :style="{ gridTemplateRows }">
      <div
        :id="'pg-panel-' + store.activeTab"
        role="tabpanel"
        :aria-labelledby="'pg-tab-' + store.activeTab"
        class="min-h-0 relative overflow-hidden bg-bg-active"
      >
        <!-- HT-026: fallback Monaco thành textarea thay thế, không gây hiểu lầm -->
        <div v-if="editorLoadError" class="w-full h-full flex flex-col min-h-0">
          <div class="shrink-0 flex flex-col items-center justify-center p-4 text-center">
            <BaseIcon name="warning" class="w-8 h-8 mb-2 text-accent-yellow" />
            <p class="text-xs font-semibold text-text-primary mb-1">Không thể chỉnh sửa code bằng Monaco Editor</p>
            <p class="text-[10px] text-text-secondary mb-3 max-w-xs leading-normal font-sans">
              Đã chuyển sang ô nhập liệu đơn giản. Code vẫn chạy bình thường.
            </p>
            <button type="button" @click="reloadPage" class="px-3 py-1.5 rounded-lg text-xs bg-accent/25 text-accent border border-accent/30 hover:bg-accent/40 transition-colors font-sans cursor-pointer">
              Tải lại trang (F5)
            </button>
          </div>
          <textarea
            class="flex-1 min-h-0 w-full resize-none bg-bg-active text-text-primary font-mono text-sm p-3 outline-none border-t border-border-default"
            :value="store.activeCode"
            :aria-label="'Code ' + store.activeTab"
            spellcheck="false"
            @input="onFallbackEditorInput"
          ></textarea>
        </div>
        <div v-else ref="editorContainer" class="w-full h-full"></div>
      </div>

      <div
        v-if="store.isPreviewVisible"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Kéo để thay đổi tỉ lệ editor / preview"
        class="bg-border-default cursor-row-resize touch-none select-none"
        @pointerdown="onSplitDragStart"
      ></div>

      <div v-if="store.isPreviewVisible" class="min-h-0 relative overflow-hidden bg-white">
        <PlaygroundPreview
          :document-html="previewDoc"
          :key="previewKey"
          @runtime-error="onRuntimeError"
          @loaded="onPreviewLoaded"
        />
        <div v-if="isRunning" class="absolute inset-0 flex items-center justify-center bg-white/50 pointer-events-none" aria-hidden="true">
          <span class="flex items-center gap-2 text-xs font-semibold text-text-primary bg-bg-surface/90 border border-border-default rounded-md px-3 py-2 shadow-lg">
            <BaseIcon name="spinner" class="w-3.5 h-3.5 animate-spin text-accent" /> Đang chạy preview…
          </span>
        </div>
        <div
          v-if="runtimeErrors.length > 0"
          class="absolute left-2 right-2 bottom-2 max-h-28 overflow-y-auto rounded-md border border-accent-red/40 bg-bg-surface/95 shadow-lg text-left"
          role="alert"
        >
          <div class="flex items-center justify-between px-2 py-1 border-b border-border-default">
            <span class="text-[10px] font-bold text-accent-red uppercase tracking-wide">Lỗi runtime ({{ runtimeErrors.length }})</span>
            <button type="button" class="text-[10px] text-text-secondary hover:text-text-primary cursor-pointer" @click="dismissRuntimeErrors">Đóng</button>
          </div>
          <ul class="p-2 space-y-1">
            <li v-for="(err, i) in runtimeErrors" :key="i" class="text-[10px] font-mono text-accent-red leading-snug break-words">
              {{ err.message }}<template v-if="err.line > 0"> — dòng {{ err.line }}<template v-if="err.col > 0">:{{ err.col }}</template></template>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/min/vs/editor/editor.main.css';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useHtmlPlaygroundStore } from '../store/useHtmlPlaygroundStore';
import { PlaygroundDebouncer } from '../engine/PlaygroundDebouncer';
import { useToastStore } from '../../../composables/useToast';
import type { PlaygroundRuntimeError } from '../types/playground.types';
import PlaygroundPreview from './PlaygroundPreview.vue';

interface MonacoWorkerEnvironment {
  MonacoEnvironment: {
    getWorker(moduleId: string, label: string): Worker;
  };
}

(globalThis as unknown as MonacoWorkerEnvironment).MonacoEnvironment = {
  getWorker: (_moduleId: string, label: string): Worker => {
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

const DEBOUNCE_MS = 800;
const MIN_EDITOR_HEIGHT = 120;

const store = useHtmlPlaygroundStore();
const toastStore = useToastStore();
const editorContainer = ref<HTMLElement | null>(null);
const workspaceRoot = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);
const previewKey = ref(0);
/** HT-001: snapshot gating — nội dung thật mà iframe đang render (không phải store.documentHtml). */
const previewDoc = ref('');
const copyState = ref<'idle' | 'copied' | 'error'>('idle');
const copyResetTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const editorLoadError = ref(false);
const isRunning = ref(false);
const autoRun = ref(true);
const isNarrowViewport = ref(false);
const editorHeightPx = ref(360);
const runtimeErrors = ref<PlaygroundRuntimeError[]>([]);
const isProgrammaticWrite = ref(false);
let runningResetTimer: ReturnType<typeof setTimeout> | null = null;
let dragState: { startY: number; startHeight: number } | null = null;

const debouncer = new PlaygroundDebouncer(DEBOUNCE_MS);

const copyStatusMessage = computed(() => {
  if (copyState.value === 'copied') return 'Đã sao chép link chia sẻ vào clipboard';
  if (copyState.value === 'error') return 'Sao chép thất bại, hãy thử lại';
  return '';
});

/**
 * HT-001/HT-014: snapshot gating — iframe chỉ nhận previewDoc khi debouncer/Run
 * kích hoạt; gõ liên tục không làm iframe reload giữa chừng.
 */
function commitPreview(): void {
  previewDoc.value = store.documentHtml;
}

function setCopyState(next: 'copied' | 'error'): void {
  if (copyResetTimer.value !== null) {
    clearTimeout(copyResetTimer.value);
    copyResetTimer.value = null;
  }
  copyState.value = next;
  copyResetTimer.value = setTimeout(() => {
    copyState.value = 'idle';
    copyResetTimer.value = null;
  }, 2000);
}

/** HT-018: flush trước khi chạy — không để pending debounce reload lần 2. */
function handleRun(): void {
  debouncer.flush();
  commitPreview();
  previewKey.value += 1;
  startRunningState();
}

function startRunningState(): void {
  isRunning.value = true;
  if (runningResetTimer !== null) clearTimeout(runningResetTimer);
  runningResetTimer = setTimeout(() => {
    isRunning.value = false;
    runningResetTimer = null;
  }, 1500);
}

function onPreviewLoaded(): void {
  isRunning.value = false;
  if (runningResetTimer !== null) {
    clearTimeout(runningResetTimer);
    runningResetTimer = null;
  }
}

/** HT-003: gom lỗi runtime từ iframe vào panel console nhỏ ở góc preview. */
function onRuntimeError(error: PlaygroundRuntimeError): void {
  runtimeErrors.value = [...runtimeErrors.value.slice(-4), error];
}

function dismissRuntimeErrors(): void {
  runtimeErrors.value = [];
}

/** HT-013: xác nhận trước khi reset + giữ nguyên activeTab + báo undo bị mất. HT-022: bỏ async. */
function handleReset(): void {
  if (!window.confirm('Khôi phục code mẫu? Toàn bộ code hiện tại sẽ bị xoá — lịch sử undo cũng bị mất, không thể hoàn tác.')) {
    return;
  }
  const keepTab = store.activeTab;
  store.resetToDefault();
  store.setActiveTab(keepTab);
  syncEditorFromStore();
  handleRun();
  toastStore.warning('Code đã khôi phục về mẫu ban đầu. Lịch sử undo của phiên trước đã bị xoá.', 'Đã reset');
}

function reloadPage(): void {
  window.location.reload();
}

/** HT-006: payload quá ngưỡng → toast thay vì URL bị cắt im lặng. */
async function handleCopyShareUrl(): Promise<void> {
  const payload = store.buildSharePayload();
  if (payload === null) {
    toastStore.warning('Code quá dài để chia sẻ. Hãy rút gọn code rồi thử lại.', 'Không thể chia sẻ');
    setCopyState('error');
    return;
  }
  const url = `${window.location.origin}${window.location.pathname}#/playground?code=${encodeURIComponent(payload)}`;
  try {
    await navigator.clipboard.writeText(url);
    setCopyState('copied');
  } catch (err) {
    console.error('Copy failed:', err);
    setCopyState('error');
  }
}

/** HT-028: khi ẩn preview, trả focus về editor; khi hiện lại, commit snapshot mới nhất. */
function handleTogglePreview(): void {
  store.togglePreview();
  if (store.isPreviewVisible) {
    commitPreview();
  } else if (editorInstance.value) {
    editorInstance.value.focus?.();
  }
}

/** HT-009: tắt auto-run → huỷ pending debounce, chỉ chạy khi bấm Run. */
function handleToggleAutoRun(): void {
  autoRun.value = !autoRun.value;
  debouncer.cancel();
  if (autoRun.value) {
    commitPreview();
  }
}

/** HT-024: điều hướng tabs bằng phím mũi tên (roving tabindex). */
function onTabKeydown(event: KeyboardEvent, index: number): void {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  const total = store.tabs.length;
  const delta = event.key === 'ArrowRight' ? 1 : -1;
  const nextTab = store.tabs[(index + delta + total) % total];
  store.setActiveTab(nextTab.id);
  document.getElementById(`pg-tab-${nextTab.id}`)?.focus();
}

/** HT-010: kéo thả phân chia editor / preview (có min/max). */
function onSplitDragStart(event: PointerEvent): void {
  if (isNarrowViewport.value || event.button !== 0) return;
  dragState = { startY: event.clientY, startHeight: editorHeightPx.value };
  window.addEventListener('pointermove', onSplitDragMove);
  window.addEventListener('pointerup', onSplitDragEnd);
  event.preventDefault();
}

function onSplitDragMove(event: PointerEvent): void {
  if (!dragState) return;
  const rootHeight = workspaceRoot.value?.clientHeight ?? 600;
  const max = Math.max(rootHeight - MIN_EDITOR_HEIGHT, MIN_EDITOR_HEIGHT + 80);
  const next = dragState.startHeight + (event.clientY - dragState.startY);
  editorHeightPx.value = Math.round(Math.min(Math.max(next, MIN_EDITOR_HEIGHT), max));
}

function onSplitDragEnd(): void {
  dragState = null;
  window.removeEventListener('pointermove', onSplitDragMove);
  window.removeEventListener('pointerup', onSplitDragEnd);
}

/** HT-027: màn hình hẹp → editor/preview xếp dọc theo tỉ lệ cố định. */
function updateViewport(): void {
  if (typeof window.matchMedia !== 'function') {
    isNarrowViewport.value = false;
    return;
  }
  isNarrowViewport.value = window.matchMedia('(max-width: 767px)').matches;
}

const gridTemplateRows = computed(() => {
  if (!store.isPreviewVisible) return '1fr';
  if (isNarrowViewport.value) return '45% 4px 1fr';
  return `${editorHeightPx.value}px 4px 1fr`;
});

/**
 * HT-001: auto-run — chỉ commit snapshot vào previewDoc sau 800ms idle.
 * HT-019: isProgrammaticWrite chặn phantom run (setValue → echo event → setSourceFile).
 */
watch(
  () => [store.html, store.css, store.js],
  () => {
    if (isProgrammaticWrite.value) return;
    if (!autoRun.value) return;
    debouncer.schedule(commitPreview);
  },
);

/** HT-019: ghi giá trị từ store vào Monaco mà không kích hoạt chuỗi phantom run. */
function syncEditorFromStore(): void {
  if (!editorInstance.value) return;
  isProgrammaticWrite.value = true;
  editorInstance.value.setValue(store.activeCode);
  queueMicrotask(() => {
    isProgrammaticWrite.value = false;
  });
}

function onFallbackEditorInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement;
  store.setSourceFile(store.activeTab, target.value);
}

onMounted(() => {
  previewDoc.value = store.documentHtml;
  updateViewport();
  window.addEventListener('resize', updateViewport);
  if (!editorContainer.value) return;
  try {
    editorInstance.value = monaco.editor.create(editorContainer.value, {
      value: store.activeCode,
      language: store.activeTab,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
      padding: { top: 12 },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
      tabSize: 2,
    });

    editorInstance.value.onDidChangeModelContent(() => {
      if (!editorInstance.value) return;
      const nextValue = editorInstance.value.getValue();
      // HT-019: bỏ qua echo từ setValue programmatic (giá trị đã khớp store) —
      // lớp chặn thứ 2 bên cạnh isProgrammaticWrite (kể cả khi monaco fire async).
      if (nextValue === store.activeCode) return;
      store.setSourceFile(store.activeTab, nextValue);
    });
  } catch (err) {
    console.error('Monaco create failed in playground:', err);
    editorLoadError.value = true;
  }
});

// flush: 'sync' — editor phải cập nhật ngay trong cùng tick (đổi tab/revision) để
// contract editor ↔ store đồng bộ tức thời, tránh window lệch 1 frame.
watch(
  () => store.activeTab,
  (language) => {
    if (!editorInstance.value) return;
    const model = editorInstance.value.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }
    syncEditorFromStore();
  },
  { flush: 'sync' },
);

watch(
  () => store.revision,
  () => {
    if (!editorInstance.value) return;
    const model = editorInstance.value.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, store.activeTab);
    }
    syncEditorFromStore();
  },
  { flush: 'sync' },
);

onBeforeUnmount(() => {
  debouncer.cancel();
  if (copyResetTimer.value !== null) {
    clearTimeout(copyResetTimer.value);
    copyResetTimer.value = null;
  }
  if (runningResetTimer !== null) {
    clearTimeout(runningResetTimer);
    runningResetTimer = null;
  }
  window.removeEventListener('resize', updateViewport);
  window.removeEventListener('pointermove', onSplitDragMove);
  window.removeEventListener('pointerup', onSplitDragEnd);
  if (editorInstance.value) {
    editorInstance.value.dispose();
    editorInstance.value = null;
  }
});
</script>

<style scoped>
.html-playground-workspace {
  min-height: 0;
}
</style>
