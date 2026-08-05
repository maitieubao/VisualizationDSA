<template>
  <div class="flex flex-col w-full" data-tour-id="pseudocode-syncer">
    <div v-if="!hidePresets" class="px-4 pt-4 pb-2">
      <CodeEditorPresetTabs
        :presets="PRESETS"
        :active-preset="activePreset"
        @select="loadPreset"
      />
    </div>

    <div class="flex-1 relative flex flex-col min-h-0 overflow-hidden w-full">
      <div v-if="editorLoadError" role="alert" class="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-bg-surface/30">
        <BaseIcon name="warning" class="w-8 h-8 mb-2 text-accent-yellow" />
        <p class="text-xs font-semibold text-text-primary mb-1">Không thể tải Monaco Editor</p>
        <p class="text-[10px] text-text-secondary mb-4 max-w-xs leading-normal font-sans">
          Lỗi do xung đột tối ưu hóa module hoặc kết nối. Hãy reload lại trang.
        </p>
        <button type="button" @click="reloadPage" class="px-3 py-1.5 rounded-lg text-xs bg-accent/25 text-accent border border-accent/30 hover:bg-accent/40 transition-colors font-sans cursor-pointer">
          Tải lại trang (F5)
        </button>
      </div>
      <div v-else ref="editorContainer" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import * as monaco from "monaco-editor";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/min/vs/editor/editor.main.css";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { useVcrStore } from "../../vcr-player/store/useVcrStore";
import { useThemeStore } from "../../../shared/store/useThemeStore";
import { MonacoLineSyncerCoordinator } from "../../algorithm-sandbox/engine/MonacoLineSyncerCoordinator";
import CodeEditorPresetTabs from "./CodeEditorPresetTabs.vue";

defineProps<{ hidePresets?: boolean }>();

interface MonacoWorkerEnvironment {
  MonacoEnvironment: {
    getWorker(moduleId: string, label: string): Worker;
  };
}

(globalThis as unknown as MonacoWorkerEnvironment).MonacoEnvironment = {
  getWorker: (_moduleId: string, label: string): Worker => {
    if (label === "typescript" || label === "javascript") return new tsWorker();
    return new editorWorker();
  },
};

const vcrStore = useVcrStore();
const themeStore = useThemeStore();
const monacoTheme = computed(() => themeStore.currentTheme === 'light' ? 'vs' : 'vs-dark');

watch(monacoTheme, (theme) => {
  editorInstance?.updateOptions({ theme });
});
const editorContainer = ref<HTMLDivElement | null>(null);
const editorLoadError = ref(false);

function reloadPage() {
  window.location.reload();
}

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let syncerCoordinator: MonacoLineSyncerCoordinator | null = null;

const activePreset = ref<PresetKey>("bubble");

type PresetKey = "bubble" | "selection" | "insertion";

const PRESETS: Record<PresetKey, { name: string; shortName: string; code: string }> = {
  bubble: {
    name: "Sắp xếp nổi bọt (Bubble Sort)",
    shortName: "Bubble Sort",
    code: `// Thuật toán Sắp xếp nổi bọt
for (let i = 0; i < array.length - 1; i++) {
  for (let j = 0; j < array.length - i - 1; j++) {
    compare(j, j + 1);
    if (array[j] > array[j + 1]) {
      swap(j, j + 1);
    }
  }
  highlight(array.length - i - 1);
}
highlight(0);`,
  },
  selection: {
    name: "Sắp xếp chọn (Selection Sort)",
    shortName: "Selection Sort",
    code: `// Thuật toán Sắp xếp chọn
for (let i = 0; i < array.length - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < array.length; j++) {
    compare(minIdx, j);
    if (array[j] < array[minIdx]) { minIdx = j; }
  }
  if (minIdx !== i) { swap(i, minIdx); }
  highlight(i);
}
highlight(array.length - 1);`,
  },
  insertion: {
    name: "Sắp xếp chèn (Insertion Sort)",
    shortName: "Insertion Sort",
    code: `// Thuật toán Sắp xếp chèn
highlight(0);
for (let i = 1; i < array.length; i++) {
  let j = i;
  while (j > 0) {
    compare(j - 1, j);
    if (array[j] < array[j - 1]) { swap(j - 1, j); j--; }
    else { break; }
  }
  for (let k = 0; k <= i; k++) { highlight(k); }
}`,
  },
};

onMounted(() => {
  if (!editorContainer.value) return;
  try {
    editorInstance = monaco.editor.create(editorContainer.value, {
      value: vcrStore.code, language: "javascript", theme: monacoTheme.value,
      automaticLayout: true, fontSize: 14, lineNumbers: "on",
      minimap: { enabled: false }, scrollBeyondLastLine: false,
      cursorBlinking: "smooth", cursorSmoothCaretAnimation: "on",
      padding: { top: 12, bottom: 12 },
      fontFamily: "JetBrains Mono, Fira Code, monospace",
      scrollbar: { vertical: "visible", horizontal: "visible", verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
    });
    editorInstance.onDidChangeModelContent(() => { 
      vcrStore.code = editorInstance?.getValue() ?? ""; 
      vcrStore.customCompileFn = null;
      vcrStore.playbackFrames = [];
      vcrStore.reset();
    });
    syncerCoordinator = new MonacoLineSyncerCoordinator(editorInstance, vcrStore);
  } catch (err) {
    console.error('Monaco create failed in code editor:', err);
    editorLoadError.value = true;
  }
});

onBeforeUnmount(() => {
  vcrStore.pause();
  syncerCoordinator?.destroy();
  editorInstance?.dispose();
});

function loadPreset(key: string): void {
  if (key !== "bubble" && key !== "selection" && key !== "insertion") return;
  activePreset.value = key;
  const newCode = PRESETS[key].code;
  vcrStore.code = newCode;
  vcrStore.customCompileFn = null;
  editorInstance?.setValue(newCode);
  vcrStore.compileAndLoad();
  // Bỏ auto-play để người dùng có thể chỉnh sửa code trước khi chạy
}
</script>

<style scoped>

</style>

