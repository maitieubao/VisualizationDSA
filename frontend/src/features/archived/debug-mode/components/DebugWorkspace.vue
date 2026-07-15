<template>
  <div class="debug-workspace" @keydown="handleKeydown">
    <!-- Top Section: Monaco Editor + Canvas + CallStack -->
    <div class="flex-1 min-h-0 grid grid-cols-12 gap-3">
      <!-- Monaco Editor (Left 5 cols) -->
      <div class="col-span-5 flex flex-col min-h-0 rounded-xl overflow-hidden"
        style="border: 1px solid rgba(255, 255, 255, 0.04); background: rgba(15, 23, 42, 0.4);"
      >
        <!-- Editor Header -->
        <div class="flex items-center justify-between px-4 py-2 border-b"
          style="border-color: rgba(255, 255, 255, 0.05); background: rgba(30, 41, 59, 0.6);"
        >
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="statusDotClass"></div>
            <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Debug Editor — JavaScript
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span
              v-if="debugStore.activeBreakpoints.length > 0"
              class="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style="background: rgba(244, 63, 94, 0.1); color: #F43F5E;"
            >
              {{ debugStore.activeBreakpoints.length }} BP
            </span>
            <span class="text-[10px] text-text-muted font-mono">JetBrains Mono</span>
          </div>
        </div>

        <!-- Monaco Container -->
        <div v-if="editorLoadError" class="flex-1 flex flex-col items-center justify-center p-6 text-center bg-bg-surface/30 border border-border-default/20 rounded-xl min-h-[300px]">
          <span class="text-2xl mb-2">⚠️</span>
          <p class="text-xs font-semibold text-text-primary mb-1">Không thể tải Monaco Editor</p>
          <p class="text-[10px] text-text-secondary mb-4 max-w-xs leading-normal font-sans">
            Lỗi do xung đột tối ưu hóa module hoặc kết nối. Hãy reload lại trang.
          </p>
          <button @click="reloadPage" class="px-3 py-1.5 rounded-lg text-xs bg-accent/25 text-accent border border-accent/30 hover:bg-accent/40 transition-colors font-sans cursor-pointer">
            Tải lại trang (F5)
          </button>
        </div>
        <div v-else ref="editorContainerRef" class="flex-1 min-h-0" style="background: var(--color-bg-active);" />
      </div>

      <!-- Canvas (Middle 4 cols) -->
      <div class="col-span-4 min-h-0">
        <DebugCanvas
          :array-state="debugStore.arrayState"
          :current-line="debugStore.currentLineNumber"
        />
      </div>

      <!-- Call Stack + Watch Panel (Right 3 cols) -->
      <div class="col-span-3 flex flex-col gap-3 min-h-0">
        <!-- Call Stack (top half) -->
        <div class="flex-1 min-h-0">
          <CallStackVisualizer :frames="debugStore.callStackFrames" />
        </div>

        <!-- Watch Panel (bottom half) -->
        <div class="flex-1 min-h-0">
          <WatchVariableConfig
            :variables="debugStore.watchedVariables"
            :mutated-keys="debugStore.mutatedVariableKeys"
            :previous-variables="debugStore.previousVariables"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Section: VCR Debug Controls -->
    <div class="flex-shrink-0 mt-3">
      <div class="debug-control-bar">
        <!-- Status Badge -->
        <div class="flex items-center gap-3">
          <span
            class="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded"
            :style="statusBadgeStyle"
          >
            {{ debugStore.status }}
          </span>
          <span
            v-if="debugStore.currentLineNumber !== null"
            class="text-xs font-mono text-text-secondary"
          >
            Dong {{ debugStore.currentLineNumber }}
          </span>
          <span class="text-xs font-mono text-text-muted">
            Buoc {{ debugStore.stepCount }}
          </span>
        </div>

        <!-- VCR Buttons -->
        <div class="flex items-center gap-2">
          <!-- Start Debug / Restart -->
          <button
            @click="handleStartOrRestart"
            class="debug-btn debug-btn-primary"
            :title="debugStore.isDebugging ? 'Khoi dong lai (R)' : 'Bat dau Debug (F5)'"
          >
            <span v-if="!debugStore.isDebugging">&#9654; Debug</span>
            <span v-else>&#8634; Restart</span>
          </button>

          <!-- Step Over (F10) -->
          <button
            @click="debugStore.stepForward()"
            :disabled="!debugStore.canStepForward"
            class="debug-btn"
            title="Step Over (F10)"
          >
            &#8594; Step
          </button>

          <!-- Step Backward -->
          <button
            @click="debugStore.stepBackward()"
            :disabled="!debugStore.canStepBackward"
            class="debug-btn"
            title="Step Backward"
          >
            &#8592; Back
          </button>

          <!-- Step Out (Shift+F11) -->
          <button
            @click="debugStore.stepOut()"
            :disabled="!debugStore.canStepForward"
            class="debug-btn"
            title="Step Out (Shift+F11)"
          >
            &#8593; Out
          </button>

          <!-- Continue (F5) -->
          <button
            @click="debugStore.continueToNextBreakpoint()"
            :disabled="!debugStore.canContinue"
            class="debug-btn debug-btn-continue"
            title="Continue to Breakpoint (F5)"
          >
            &#9654;&#9654; Continue
          </button>

          <!-- Stop -->
          <button
            v-if="debugStore.isDebugging"
            @click="debugStore.stopDebuggingSession()"
            class="debug-btn debug-btn-stop"
            title="Dung Debug (Shift+F5)"
          >
            &#9632; Stop
          </button>
        </div>

        <!-- Input Array -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-text-muted uppercase tracking-wider">Input:</span>
          <input
            v-model="inputArrayStr"
            @change="updateInputArray"
            :disabled="debugStore.isDebugging"
            class="debug-input"
            placeholder="5, 3, 8, 1, 9"
          />
        </div>
      </div>

      <!-- Error message -->
      <div
        v-if="debugStore.hasError && debugStore.errorMessage"
        class="mt-2 px-4 py-2 rounded-lg text-xs font-mono"
        style="background: rgba(244, 63, 94, 0.08); color: #F43F5E; border: 1px solid rgba(244, 63, 94, 0.15);"
      >
        {{ debugStore.errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useLiveDebuggerStore } from '../store/useLiveDebuggerStore';
import CallStackVisualizer from './CallStackVisualizer.vue';
import WatchVariableConfig from './WatchVariableConfig.vue'; // 🆕 thay thế DebugWatchPanel
import DebugCanvas from './DebugCanvas.vue';
import loader from '@monaco-editor/loader';

const debugStore = useLiveDebuggerStore();
const editorContainerRef = ref<HTMLDivElement | null>(null);
const inputArrayStr = ref<string>(debugStore.inputArray.join(', '));
const editorLoadError = ref(false);

function reloadPage() {
  window.location.reload();
}

interface MonacoEditor {
  getValue: () => string;
  setValue: (v: string) => void;
  dispose: () => void;
  onDidChangeModelContent: (cb: () => void) => { dispose: () => void };
  onMouseDown: (cb: (e: MonacoMouseEvent) => void) => { dispose: () => void };
  deltaDecorations: (oldIds: string[], newDecorations: MonacoDecoration[]) => string[];
  revealLineInCenter: (line: number) => void;
  layout: () => void;
}

interface MonacoMouseEvent {
  target: {
    type: number;
    position?: { lineNumber: number };
  };
}

interface MonacoDecoration {
  range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
  options: {
    isWholeLine?: boolean;
    glyphMarginClassName?: string;
    glyphMarginHoverMessage?: { value: string };
    className?: string;
    linesDecorationsClassName?: string;
  };
}

let editorInstance: MonacoEditor | null = null;
let monacoModule: { editor: { MouseTargetType: { GUTTER_GLYPH_MARGIN: number; GUTTER_LINE_NUMBERS: number } } } | null = null;
let breakpointDecorationIds: string[] = [];
let activeLineDecorationIds: string[] = [];
let errorLineDecorationIds: string[] = []; // 🆕 theo dõi decoration dòng lỗi compile

const statusDotClass = computed(() => {
  switch (debugStore.status) {
    case 'DEBUGGING':
    case 'PAUSED': return 'bg-accent-yellow animate-pulse';
    case 'FINISHED': return 'bg-accent-green';
    case 'ERROR': return 'bg-accent-red';
    default: return 'bg-bg-hover';
  }
});

const statusBadgeStyle = computed(() => {
  switch (debugStore.status) {
    case 'PAUSED': return { background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
    case 'DEBUGGING': return { background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' };
    case 'FINISHED': return { background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
    case 'ERROR': return { background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E' };
    default: return { background: 'rgba(100, 116, 139, 0.1)', color: '#94A3B8' };
  }
});

function handleStartOrRestart(): void {
  if (debugStore.isDebugging) {
    debugStore.stopDebuggingSession();
  }
  if (editorInstance) {
    debugStore.setSourceCode(editorInstance.getValue());
  }
  debugStore.startDebuggingSession();
}

function updateInputArray(): void {
  const parts = inputArrayStr.value.split(',').map(s => s.trim()).filter(Boolean);
  const nums = parts.map(Number).filter(n => !isNaN(n));
  if (nums.length > 0) {
    debugStore.setInputArray(nums);
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  if (e.key === 'F5' && !e.shiftKey) {
    e.preventDefault();
    if (debugStore.isDebugging) {
      debugStore.continueToNextBreakpoint();
    } else {
      handleStartOrRestart();
    }
  } else if (e.key === 'F5' && e.shiftKey) {
    e.preventDefault();
    debugStore.stopDebuggingSession();
  } else if (e.key === 'F10') {
    e.preventDefault();
    debugStore.stepForward();
  } else if (e.key === 'F11' && e.shiftKey) {
    e.preventDefault();
    debugStore.stepOut();
  } else if (e.key === 'F11' && !e.shiftKey) {
    e.preventDefault();
    debugStore.stepForward();
  } else if (e.key === 'r' || e.key === 'R') {
    if (!debugStore.isDebugging) return;
    handleStartOrRestart();
  }
}

function syncBreakpointDecorations(): void {
  if (!editorInstance) return;

  const decorations: MonacoDecoration[] = debugStore.activeBreakpoints.map(line => ({
    range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
    options: {
      isWholeLine: false,
      glyphMarginClassName: 'monaco-breakpoint-glyph',
      glyphMarginHoverMessage: { value: 'Nhan de go bo diem dung (Breakpoint)' },
    },
  }));

  breakpointDecorationIds = editorInstance.deltaDecorations(breakpointDecorationIds, decorations);
}

function syncActiveLineDecoration(): void {
  if (!editorInstance) return;

  const line = debugStore.currentLineNumber;
  if (line === null) {
    activeLineDecorationIds = editorInstance.deltaDecorations(activeLineDecorationIds, []);
    return;
  }

  const decorations: MonacoDecoration[] = [{
    range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
    options: {
      isWholeLine: true,
      className: 'monaco-active-debug-line',
      linesDecorationsClassName: 'monaco-debug-line-arrow',
    },
  }];

  activeLineDecorationIds = editorInstance.deltaDecorations(activeLineDecorationIds, decorations);
  editorInstance.revealLineInCenter(line);
}

// 🆕 Highlight dòng lỗi compile trong Monaco bằng màu đỏ
function syncErrorLineDecoration(): void {
  if (!editorInstance) return;

  const errorLine = debugStore.errorLine;
  if (errorLine === null) {
    errorLineDecorationIds = editorInstance.deltaDecorations(errorLineDecorationIds, []);
    return;
  }

  const decorations: MonacoDecoration[] = [{
    range: { startLineNumber: errorLine, startColumn: 1, endLineNumber: errorLine, endColumn: 1 },
    options: {
      isWholeLine: true,
      className: 'monaco-error-line',
      linesDecorationsClassName: 'monaco-error-line-gutter',
    },
  }];

  errorLineDecorationIds = editorInstance.deltaDecorations(errorLineDecorationIds, decorations);
  editorInstance.revealLineInCenter(errorLine);
}

onMounted(async () => {
  if (!editorContainerRef.value) return;

  let monaco;
  try {
    monaco = await loader.init();
  } catch (err) {
    console.error('Monaco load failed in debugger:', err);
    editorLoadError.value = true;
    return;
  }
  monacoModule = monaco;

  const style = getComputedStyle(document.documentElement);
  const editorBg = style.getPropertyValue('--color-bg-active').trim() || '#1e293b';

  monaco.editor.defineTheme('visualizationdsa-debug', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'C084FC' },
      { token: 'string', foreground: '34D399' },
      { token: 'number', foreground: 'F59E0B' },
      { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
      { token: 'type', foreground: '38BDF8' },
    ],
    colors: {
      'editor.background': editorBg,
      'editor.foreground': '#E2E8F0',
      'editor.lineHighlightBackground': '#334155',
      'editor.selectionBackground': '#475569',
      'editorCursor.foreground': '#06B6D4',
      'editorLineNumber.foreground': '#64748B',
      'editorLineNumber.activeForeground': '#06B6D4',
    },
  });

  const editor = monaco.editor.create(editorContainerRef.value, {
    value: debugStore.sourceCode,
    language: 'javascript',
    theme: 'visualizationdsa-debug',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 14,
    lineHeight: 22,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    padding: { top: 12, bottom: 12 },
    renderLineHighlight: 'line',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    bracketPairColorization: { enabled: true },
    glyphMargin: true,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  });

  editorInstance = editor as unknown as MonacoEditor;

  editor.onDidChangeModelContent(() => {
    debugStore.setSourceCode(editor.getValue());
  });

  editor.onMouseDown((e: { target: { type: number; position?: { lineNumber: number } | null } }) => {
    if (!monacoModule) return;
    const GLYPH_MARGIN = 2;
    const LINE_NUMBERS = 3;

    if (e.target.type === GLYPH_MARGIN || e.target.type === LINE_NUMBERS) {
      const lineNumber = e.target.position?.lineNumber;
      if (lineNumber) {
        debugStore.toggleBreakpoint(lineNumber);
        nextTick(syncBreakpointDecorations);
      }
    }
  });
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
    editorInstance = null;
  }
});

watch(() => debugStore.activeBreakpoints, syncBreakpointDecorations, { deep: true });
watch(() => debugStore.currentLineNumber, syncActiveLineDecoration);
watch(() => debugStore.errorLine, syncErrorLineDecoration); // 🆕
watch(() => debugStore.status, (newStatus) => {
  if (newStatus === 'IDLE') {
    syncBreakpointDecorations();
    syncActiveLineDecoration();
    syncErrorLineDecoration(); // 🆕 reset error decoration khi IDLE
  }
});
</script>

<style scoped>
.debug-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.debug-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.debug-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.15s ease;
  background: rgba(100, 116, 139, 0.1);
  color: #CBD5E1;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.debug-btn:hover:not(:disabled) {
  background: rgba(100, 116, 139, 0.2);
  color: #F1F5F9;
}

.debug-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.debug-btn-primary {
  background: rgba(6, 182, 212, 0.15) !important;
  color: #06B6D4 !important;
  border-color: rgba(6, 182, 212, 0.2) !important;
}

.debug-btn-primary:hover:not(:disabled) {
  background: rgba(6, 182, 212, 0.25) !important;
}

.debug-btn-continue {
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10B981 !important;
  border-color: rgba(16, 185, 129, 0.15) !important;
}

.debug-btn-continue:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2) !important;
}

.debug-btn-stop {
  background: rgba(244, 63, 94, 0.1) !important;
  color: #F43F5E !important;
  border-color: rgba(244, 63, 94, 0.15) !important;
}

.debug-btn-stop:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.2) !important;
}

.debug-input {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #E2E8F0;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  outline: none;
  width: 160px;
  transition: border-color 0.2s ease;
}

.debug-input:focus {
  border-color: rgba(6, 182, 212, 0.4);
}

.debug-input:disabled {
  opacity: 0.5;
}
</style>

<style>
/* Global styles for Monaco decorations */
.monaco-breakpoint-glyph {
  width: 12px !important;
  height: 12px !important;
  background: #F43F5E !important;
  border-radius: 50% !important;
  margin-left: 4px !important;
  margin-top: 5px !important;
  box-shadow: 0 0 10px #F43F5E, 0 0 20px rgba(244, 63, 94, 0.4) !important;
  cursor: pointer !important;
}

.monaco-breakpoint-glyph:hover {
  transform: scale(1.3);
  background: #FDA4AF !important;
}

.monaco-active-debug-line {
  background: rgba(6, 182, 212, 0.20) !important; /* tăng từ 0.12 → 0.20 để dễ nhìn hơn */
  border-left: 3px solid #06B6D4 !important;
  box-shadow: inset 0 0 16px rgba(6, 182, 212, 0.07) !important;
}

.monaco-debug-line-arrow {
  width: 5px !important;
  margin-left: 3px !important;
  background: #06B6D4 !important;
}

/* 🆕 Error line styles */
.monaco-error-line {
  background: rgba(244, 63, 94, 0.14) !important;
  border-left: 3px solid #F43F5E !important;
}

.monaco-error-line-gutter {
  width: 5px !important;
  margin-left: 3px !important;
  background: #F43F5E !important;
}
</style>
