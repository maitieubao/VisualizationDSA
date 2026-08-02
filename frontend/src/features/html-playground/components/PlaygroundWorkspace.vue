<template>
  <div class="html-playground-workspace flex flex-col w-full h-full min-h-0 bg-bg-primary">
    <header class="shrink-0 flex items-center justify-between px-4 h-12 border-b border-border-default bg-bg-secondary">
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
        <span class="text-sm font-semibold text-text-primary truncate">HTML / CSS / JS Playground</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="px-2.5 py-1 rounded-md text-xs font-medium text-text-secondary bg-bg-surface hover:bg-bg-hover border border-border-default/60 transition-colors cursor-pointer"
          @click="handleReset"
          title="Khôi phục code mẫu"
        >
          Reset
        </button>
        <button
          class="px-2.5 py-1 rounded-md text-xs font-medium text-text-secondary bg-bg-surface hover:bg-bg-hover border border-border-default/60 transition-colors cursor-pointer"
          @click="handleCopyShareUrl"
          title="Sao chép link chia sẻ (code nén vào URL)"
        >
          <span v-if="copied">Đã sao chép ✓</span>
          <span v-else>Chia sẻ</span>
        </button>
        <button
          class="px-3 py-1 rounded-md text-xs font-bold text-white bg-accent hover:bg-accent/80 transition-colors shadow-[0_0_10px_rgba(79,70,229,0.3)] cursor-pointer"
          @click="handleRun"
          title="Chạy lại preview ngay lập tức"
        >
          ▶ Run
        </button>
      </div>
    </header>

    <div class="shrink-0 flex items-center border-b border-border-default bg-bg-secondary/60 px-2 gap-1">
      <button
        v-for="tab in store.tabs"
        :key="tab.id"
        class="px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer"
        :class="store.activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-secondary'"
        @click="store.setActiveTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="flex-1 min-h-0 grid gap-0" :style="{ gridTemplateRows: isPreviewVisible ? '1fr 2px 45%' : '1fr' }">
      <div class="min-h-0 relative overflow-hidden bg-bg-active">
        <div v-if="editorLoadError" class="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <span class="text-2xl mb-2">⚠️</span>
          <p class="text-xs font-semibold text-text-primary mb-1">Không thể tải Monaco Editor</p>
          <p class="text-[10px] text-text-secondary mb-4 max-w-xs leading-normal font-sans">
            Playground vẫn chạy được, chỉ không hiển thị editor. Hãy thử tải lại trang.
          </p>
          <button @click="reloadPage" class="px-3 py-1.5 rounded-lg text-xs bg-accent/25 text-accent border border-accent/30 hover:bg-accent/40 transition-colors font-sans cursor-pointer">
            Tải lại trang (F5)
          </button>
        </div>
        <div v-else ref="editorContainer" class="w-full h-full"></div>
      </div>

      <div v-if="isPreviewVisible" class="bg-border-default"></div>

      <div v-if="isPreviewVisible" class="min-h-0 relative overflow-hidden bg-white">
        <PlaygroundPreview :document-html="store.documentHtml" :key="previewKey" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue';
import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
import 'monaco-editor/min/vs/editor/editor.main.css';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { useHtmlPlaygroundStore } from '../store/useHtmlPlaygroundStore';
import { PlaygroundDebouncer } from '../engine/PlaygroundDebouncer';
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

const store = useHtmlPlaygroundStore();
const editorContainer = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);
const isPreviewVisible = ref(true);
const previewKey = ref(0);
const copied = ref(false);
const editorLoadError = ref(false);

const debouncer = new PlaygroundDebouncer(800);

function handleRun(): void {
  previewKey.value += 1;
}

async function handleReset(): Promise<void> {
  store.resetToDefault();
  if (editorInstance.value) {
    editorInstance.value.setValue(store.activeCode);
  }
  handleRun();
}

function reloadPage(): void {
  window.location.reload();
}

async function handleCopyShareUrl(): Promise<void> {
  const payload = store.buildSharePayload();
  const url = `${window.location.origin}${window.location.pathname}#/playground?code=${encodeURIComponent(payload)}`;
  try {
    await navigator.clipboard.writeText(url);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

watch(
  () => [store.html, store.css, store.js],
  () => {
    debouncer.schedule(() => {
      previewKey.value += 1;
    });
  },
);

onMounted(() => {
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
      store.setSourceFile(store.activeTab, editorInstance.value.getValue());
    });
  } catch (err) {
    console.error('Monaco create failed in playground:', err);
    editorLoadError.value = true;
  }
});

watch(
  () => store.activeTab,
  (language) => {
    if (!editorInstance.value) return;
    const model = editorInstance.value.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }
    editorInstance.value.setValue(store.activeCode);
  },
);

watch(
  () => store.revision,
  () => {
    if (!editorInstance.value) return;
    const model = editorInstance.value.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, store.activeTab);
    }
    editorInstance.value.setValue(store.activeCode);
  },
);

onBeforeUnmount(() => {
  debouncer.cancel();
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
