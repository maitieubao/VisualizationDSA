<template>
  <div
    class="flex flex-col h-full"
    :class="{ 'compile-failed-glow': hasCompileError, 'compile-success-glow': showSuccessGlow }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 border-b"
      style="border-color: rgba(255, 255, 255, 0.05); background: rgba(30, 41, 59, 0.6);"
    >
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :class="statusDotClass"></div>
        <span class="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Monaco Editor — JavaScript
        </span>
      </div>
      <span class="text-[10px] text-text-muted font-mono">JetBrains Mono</span>
    </div>

    <!-- Monaco Editor Container -->
    <div v-if="editorLoadError" class="flex-1 flex flex-col items-center justify-center p-6 text-center bg-bg-surface/30 border border-border-default/20 rounded-xl min-h-[300px]">
      <span class="text-2xl mb-2">⚠️</span>
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

const compilerStore = useLiveCompilerStore();
const editorContainerRef = ref<HTMLDivElement | null>(null);
const showSuccessGlow = ref(false);
const editorLoadError = ref(false);

function reloadPage() {
  window.location.reload();
}

let editorInstance: ReturnType<typeof createEditorType> | null = null;
type EditorType = { getValue: () => string; setValue: (v: string) => void; dispose: () => void; onDidChangeModelContent: (cb: () => void) => void; layout: () => void };
function createEditorType(): EditorType { return null as unknown as EditorType; }

const hasCompileError = computed(() => compilerStore.hasCompileError);

const statusDotClass = computed(() => {
  if (compilerStore.isCompiling) return 'bg-accent-yellow animate-pulse';
  if (compilerStore.hasCompileError) return 'bg-accent-red';
  return 'bg-accent-green';
});

onMounted(async () => {
  if (!editorContainerRef.value) return;

  let monaco;
  try {
    monaco = await loader.init();
  } catch (err) {
    console.error('Monaco load failed:', err);
    editorLoadError.value = true;
    return;
  }

  const style = getComputedStyle(document.documentElement);
  const editorBg = style.getPropertyValue('--color-bg-active').trim() || '#1e293b';

  monaco.editor.defineTheme('visualizationdsa-dark', {
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

  editorInstance = editor as unknown as EditorType;

  editor.onDidChangeModelContent(() => {
    const value = editor.getValue();
    compilerStore.setSourceCode(value);
  });
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.dispose();
    editorInstance = null;
  }
});

watch(
  () => compilerStore.hasCompileError,
  (hasError, prevError) => {
    if (!hasError && prevError) {
      showSuccessGlow.value = true;
      setTimeout(() => {
        showSuccessGlow.value = false;
      }, 2000);
    }
  },
);
</script>

<style scoped>
.compile-failed-glow {
  border: 1px solid #EF4444 !important;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.15) !important;
  animation: glowPulseError 2.0s infinite alternate;
}

.compile-success-glow {
  border: 1px solid #10B981 !important;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15) !important;
}

@keyframes glowPulseError {
  0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.1); }
  100% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.3); }
}
</style>
