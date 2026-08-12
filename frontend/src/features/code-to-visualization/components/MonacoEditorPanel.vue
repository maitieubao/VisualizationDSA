<template>
  <div
    data-tour-id="code-ide-editor"
    class="flex flex-col h-full"
    :class="{ 'compile-failed-glow': hasCompileError, 'compile-success-glow': showSuccessGlow }"
  >
    
    <div class="flex items-center justify-between px-4 py-2 border-b"
      style="border-color: var(--color-border-subtle); background: color-mix(in srgb, var(--color-bg-secondary) 60%, transparent);"
    >
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :class="statusDotClass"></div>
        <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Monaco Editor — JavaScript
        </span>
      </div>
      <span class="text-[10px] text-text-muted font-mono">JetBrains Mono</span>
    </div>

    
    <div v-if="editorLoadError" class="flex-1 flex flex-col items-center justify-center p-6 text-center bg-bg-surface/30 border border-border-default/20 rounded-xl min-h-[300px]">
      <BaseIcon name="warning" class="w-8 h-8 mb-2 text-accent-yellow" />
      <p class="text-xs font-semibold text-text-primary mb-1">Không thể tải Monaco Editor</p>
      <p class="text-[10px] text-text-secondary mb-4 max-w-xs leading-normal">
        Lỗi do xung đột tối ưu hóa module hoặc kết nối. Hãy reload lại trang.
      </p>
      <button @click="reloadPage" class="px-3 py-1.5 rounded-lg text-xs bg-accent/25 text-accent border border-accent/30 hover:bg-accent/40 transition-colors">
        Tải lại trang (F5)
      </button>
    </div>
    <div v-else ref="editorContainerRef" class="flex-1 min-h-0" style="background: var(--color-bg-active);" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useLiveCompilerStore } from '../store/useLiveCompilerStore';
import loader from '@monaco-editor/loader';
import type * as monacoNs from 'monaco-editor/esm/vs/editor/editor.api.js';

type MonacoApi = typeof import('monaco-editor/esm/vs/editor/editor.api.js');

const compilerStore = useLiveCompilerStore();
const editorContainerRef = ref<HTMLDivElement | null>(null);
const showSuccessGlow = ref(false);
const editorLoadError = ref(false);

let successGlowTimer: ReturnType<typeof setTimeout> | null = null;

function clearSuccessGlow(): void {
  if (successGlowTimer !== null) {
    clearTimeout(successGlowTimer);
    successGlowTimer = null;
  }
  showSuccessGlow.value = false;
}

function reloadPage() {
  window.location.reload();
}

let monacoApi: MonacoApi | null = null;
let editorInstance: monacoNs.editor.IStandaloneCodeEditor | null = null;

const hasCompileError = computed(() => compilerStore.hasCompileError);

const statusDotClass = computed(() => {
  if (compilerStore.isCompiling) return 'bg-accent-yellow animate-pulse';
  if (compilerStore.hasCompileError) return 'bg-accent-red';
  return 'bg-accent-green';
});

function applyCompileMarkers(errorLine: number | null): void {
  const api = monacoApi;
  const editor = editorInstance;
  if (!api || !editor) return;
  const model = editor.getModel();
  if (!model) return;
  const markers: monacoNs.editor.IMarkerData[] = errorLine === null
    ? []
    : [{
        severity: api.MarkerSeverity.Error,
        message: 'Lỗi biên dịch — kiểm tra lại dòng này.',
        startLineNumber: errorLine,
        startColumn: 1,
        endLineNumber: errorLine,
        endColumn: Number.MAX_SAFE_INTEGER,
      }];
  api.editor.setModelMarkers(model, 'liveCompiler', markers);
}

onMounted(async () => {
  if (!editorContainerRef.value) return;
  const container = editorContainerRef.value;

  let monaco: MonacoApi | null = null;
  try {
    monaco = await loader.init();
  } catch (err) {
    console.error('Monaco load failed:', err);
    editorLoadError.value = true;
    return;
  }
  if (!monaco) return;
  monacoApi = monaco;

  const style = getComputedStyle(document.documentElement);
  const editorBg = style.getPropertyValue('--color-bg-active').trim() || '#1e293b';

  monacoApi.editor.defineTheme('visualizationdsa-dark', {
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

  editorInstance = monacoApi.editor.create(container, {
    value: compilerStore.sourceCode,
    language: 'javascript',
    theme: 'visualizationdsa-dark',
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
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
  });

  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance?.getValue() ?? '';
    compilerStore.setSourceCode(value);
  });

  applyCompileMarkers(compilerStore.compileErrorLine);
});

onBeforeUnmount(() => {
  clearSuccessGlow();
  if (editorInstance) {
    const model = editorInstance.getModel();
    if (model) model.dispose();
    editorInstance.dispose();
    editorInstance = null;
  }
});

watch(
  () => compilerStore.lastCompileSucceeded,
  (succeeded) => {
    if (successGlowTimer !== null) {
      clearTimeout(successGlowTimer);
      successGlowTimer = null;
    }
    if (succeeded) {
      showSuccessGlow.value = true;
      successGlowTimer = setTimeout(() => {
        showSuccessGlow.value = false;
        successGlowTimer = null;
      }, 2000);
    } else {
      showSuccessGlow.value = false;
    }
  },
);

watch(
  () => compilerStore.hasCompileError,
  (hasError) => {
    if (hasError) {
      clearSuccessGlow();
    }
  },
);

watch(
  () => compilerStore.compileErrorLine,
  (errorLine) => {
    applyCompileMarkers(errorLine);
  },
);
</script>

<style scoped>
.compile-failed-glow {
  border: 1px solid var(--color-accent-red) !important;
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-accent-red) 15%, transparent) !important;
  animation: glowPulseError 2.0s infinite alternate;
}

.compile-success-glow {
  border: 1px solid var(--color-accent-emerald) !important;
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-accent-emerald) 15%, transparent) !important;
}

@keyframes glowPulseError {
  0% { box-shadow: 0 0 10px color-mix(in srgb, var(--color-accent-red) 10%, transparent); }
  100% { box-shadow: 0 0 25px color-mix(in srgb, var(--color-accent-red) 30%, transparent); }
}
</style>
