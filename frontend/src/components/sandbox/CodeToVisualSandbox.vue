<template>
  <div class="code-to-visual-sandbox bg-bg-secondary border border-border-default rounded-2xl overflow-hidden shadow-2xl flex flex-col mt-8">
    <div class="px-6 py-4 bg-bg-hover border-b border-border-default flex justify-between items-center flex-wrap gap-4">
      <div>
        <h3 class="text-xl font-bold text-text-primary flex items-center">
          <BaseIcon name="zap" class="w-5 h-5 mr-2" /> Code-to-Visual Sandbox
        </h3>
        <p class="text-text-secondary text-sm mt-1">Viết code của bạn và xem Animation minh họa từng bước.</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <!-- Animation Controls (only visible if trace exists) -->
        <div v-if="executionTrace" class="flex items-center space-x-2 bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-default">
          <button @click="canvasRef?.reset()" class="px-3 py-1 bg-bg-hover hover:bg-bg-hover rounded text-xs text-text-primary"><BaseIcon name="refresh" class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />Reset</button>
          <button @click="canvasRef?.togglePlay()" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded font-bold text-xs text-text-primary">
            <BaseIcon v-if="canvasRef?.isPlaying" name="pause" class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />
            <BaseIcon v-else name="play" class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />
            {{ canvasRef?.isPlaying ? 'Pause' : 'Play' }}
          </button>
          <button @click="canvasRef?.stepForward()" class="px-3 py-1 bg-bg-hover hover:bg-bg-hover rounded text-xs text-text-primary" :disabled="canvasRef?.isPlaying || (canvasRef?.currentStepIndex >= canvasRef?.totalSteps - 1)"><BaseIcon name="step-forward" class="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />Step</button>
          <div class="text-xs font-mono text-text-secondary ml-2 border-l border-border-default pl-2">
            Step: {{ (canvasRef?.currentStepIndex ?? 0) + 1 }} / {{ canvasRef?.totalSteps ?? 0 }}
          </div>
        </div>

        <button 
          @click="runVisualize" 
          :disabled="isRunning" 
          class="px-6 py-2 bg-accent hover:bg-accent disabled:opacity-50 text-text-primary font-bold rounded-lg transition-colors flex items-center shadow-lg shadow-indigo-500/20"
        >
          <BaseIcon v-if="isRunning" name="hourglass" class="w-4 h-4 mr-2" />
          <BaseIcon v-else name="play" class="w-4 h-4 mr-2" />
          {{ isRunning ? 'Đang chạy...' : 'Visualize' }}
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row h-[600px]">
      <!-- Left: Code Editor -->
      <div class="w-full lg:w-1/2 flex flex-col border-r border-border-default relative">
        <div class="flex justify-between items-center px-4 py-2 bg-bg-surface border-b border-border-default">
          <div class="flex items-center space-x-2 bg-bg-hover/50 px-3 py-1.5 rounded-lg border border-border-default">
            <span class="text-xs text-text-secondary font-bold uppercase tracking-wider">Ngôn ngữ:</span>
            <span class="text-sm text-accent font-semibold">{{ languageStore.currentLanguage }}</span>
          </div>
        </div>
        
        <div class="flex-1 relative" ref="editorContainerRef">
          <!-- Monaco Editor mounts here -->
        </div>
      </div>

      <!-- Right: Animation Canvas / Result -->
      <div class="w-full lg:w-1/2 flex flex-col bg-bg-secondary">
        <div v-if="error" class="m-4 p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red">
          <h4 class="font-bold flex items-center mb-1">
            <BaseIcon name="close" class="w-4 h-4 mr-2" /> {{ error.error || 'Lỗi' }}
          </h4>
          <p class="text-sm whitespace-pre-wrap">{{ error.message }}</p>
        </div>

        <div v-else-if="executionTrace" class="flex-1 p-4 h-full">
          <TraceAnimationCanvas ref="canvasRef" :trace="executionTrace" @line-change="highlightLine" />
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-center">
          <BaseIcon name="sparkles" class="w-12 h-12 mb-4 opacity-50" />
          <p>Nhấn <strong>Visualize</strong> để chạy code của bạn qua hệ thống Sandbox an toàn.<br/>Hệ thống sẽ tự động phân tích và tạo animation thuật toán.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef } from 'vue';
import { executeSandboxCode } from '@/services/sandboxApi';
import type { SandboxResult, TraceStep } from '@/services/sandboxApi';
import TraceAnimationCanvas from './TraceAnimationCanvas.vue';
import loader from '@monaco-editor/loader';
import { useLanguageStore } from '@/features/dsa/dsa-modules/store/languageStore';
import { watch } from 'vue';

const emit = defineEmits<{
  (e: 'skip'): void;
}>();

const languageStore = useLanguageStore();

const defaultCode = `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Data will be injected here automatically by Sandbox instrumentation, 
# or you can test by defining local variables.
arr = [64, 34, 25, 12, 22, 11, 90]
bubble_sort(arr)`;

const isRunning = ref(false);
const error = ref<SandboxResult | null>(null);
const executionTrace = ref<TraceStep[] | null>(null);

const editorContainerRef = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<any>(null);
const monacoRef = shallowRef<any>(null);
const canvasRef = ref<any>(null);
let decorationsCollection: any = null;

onMounted(async () => {
  if (!editorContainerRef.value) return;

  try {
    const monaco = await loader.init();
    monacoRef.value = monaco;

    editorInstance.value = monaco.editor.create(editorContainerRef.value, {
      value: defaultCode,
      language: languageStore.currentLanguage || 'python',
      theme: 'vs-dark',
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    });

    decorationsCollection = editorInstance.value.createDecorationsCollection();
  } catch (err) {
    console.error('Failed to load Monaco editor', err);
  }
});

// Update editor language when store changes
watch(() => languageStore.currentLanguage, (newLang) => {
  if (editorInstance.value && monacoRef.value && newLang) {
    monacoRef.value.editor.setModelLanguage(editorInstance.value.getModel(), newLang);
  }
});

onUnmounted(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
});

const runVisualize = async () => {
  if (!editorInstance.value) return;
  const currentCode = editorInstance.value.getValue();
  if (!currentCode.trim()) return;
  
  isRunning.value = true;
  error.value = null;
  executionTrace.value = null;
  clearHighlight();

  try {
    const langToRun = languageStore.currentLanguage || 'python';
    const result = await executeSandboxCode(currentCode, langToRun);
    if (result.success && result.executionTrace) {
      executionTrace.value = result.executionTrace;
    } else {
      error.value = result;
    }
  } catch (err: any) {
    error.value = { success: false, error: 'API_ERROR', message: err.message };
  } finally {
    isRunning.value = false;
  }
};

const highlightLine = (line: number) => {
  if (!editorInstance.value || !decorationsCollection || !monacoRef.value) return;
  
  decorationsCollection.set([{
    range: new monacoRef.value.Range(line, 1, line, 1),
    options: {
      isWholeLine: true,
      className: 'bg-accent/30 border-l-4 border-border-accent',
    }
  }]);
  
  editorInstance.value.revealLineInCenterIfOutsideViewport(line);
};

const clearHighlight = () => {
  if (decorationsCollection) {
    decorationsCollection.clear();
  }
};
</script>

<style>
/* Style for monaco line highlight */
.bg-accent\/30 {
  background-color: rgba(99, 102, 241, 0.3) !important;
}
.border-border-accent {
  border-left-color: rgba(129, 140, 248, 1) !important;
}
</style>
