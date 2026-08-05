<template>
  <div class="lesson-step-codelab flex flex-col lg:flex-row h-full w-full bg-bg-secondary overflow-hidden text-text-primary font-sans">
    <!-- Không có bài tập → hiển thị thông báo nhẹ (bước thường bị ẩn ở parent) -->
    <div v-if="!codelabTask" class="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div class="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent mb-4">
        <BaseIcon name="puzzle" class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-white">Chưa có bài tập Code Lab</h3>
      <p class="text-xs text-text-muted mt-1 max-w-md">Bài học này không kèm bài tập lập trình. Bạn có thể chuyển tiếp để hoàn thành bài học.</p>
      <button
        @click="$emit('completeLesson')"
        class="mt-6 px-6 py-3 bg-accent hover:bg-accent text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
      >
        Hoàn thành bài học
      </button>
    </div>

    <template v-else>
      <!-- Trái: đề bài + testcases + hints -->
      <div class="w-full lg:w-1/2 h-full flex flex-col border-r border-border-subtle bg-bg-secondary overflow-hidden">
        <div class="flex border-b border-border-subtle bg-bg-secondary px-4 shrink-0">
          <button
            v-for="tab in problemTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer"
            :class="activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'"
          >
            {{ tab.name }}
            <span v-if="tab.badge" class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-accent/20 text-accent">{{ tab.badge }}</span>
          </button>
        </div>

        <div v-show="activeTab === 'problem'" class="flex-1 overflow-y-auto p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <div class="flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
                <BaseIcon name="code" class="w-4 h-4" />
                <span>Step 4 / 4 — Code Lab</span>
              </div>
              <h2 class="text-lg font-extrabold text-white mt-0.5">{{ problemTitle }}</h2>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-green/80 text-accent-green border border-accent-green/30">
              Cơ bản
            </span>
          </div>

          <div class="text-xs leading-relaxed text-text-secondary space-y-3">
            <p class="whitespace-pre-line">{{ codelabTask.description }}</p>
            <div v-if="sampleTestcases.length > 0" class="p-3 rounded-xl bg-bg-secondary border border-border-subtle space-y-1">
              <span class="text-[10px] font-bold text-text-muted uppercase font-mono">Example 1:</span>
              <div class="font-mono text-xs text-accent">Input: {{ sampleTestcases[0].input }}</div>
              <div class="font-mono text-xs text-accent-green">Output: {{ sampleTestcases[0].expectedOutput }}</div>
            </div>
          </div>

          <div class="pt-2 border-t border-border-subtle">
            <span class="text-[11px] font-bold text-text-muted uppercase">Quy ước:</span>
            <ul class="text-xs text-text-muted list-disc list-inside mt-1 space-y-0.5 font-mono">
              <li>Input là JSON array các tham số: [[1,3,5],7]</li>
              <li>Hàm entry: {{ codelabTask.entryFunction || 'solution' }}</li>
              <li>Giới hạn thời gian chạy: 1500ms / testcase set</li>
            </ul>
          </div>
        </div>

        <div v-show="activeTab === 'testcases'" class="flex-1 overflow-y-auto p-5 space-y-3">
          <h3 class="text-xs font-bold uppercase text-text-muted">Testcases ({{ codelabTask.testCases.length }} tests)</h3>
          <div v-for="(tc, idx) in codelabTask.testCases" :key="idx" class="p-3.5 rounded-xl bg-bg-secondary border border-border-subtle space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-text-secondary">Testcase #{{ idx + 1 }} {{ tc.isHidden ? '(Hidden)' : '' }}</span>
              <span v-if="caseResults[idx]" :class="caseResults[idx].passed ? 'text-accent-green' : 'text-accent-red'" class="font-bold text-[11px]">
                <BaseIcon :name="caseResults[idx].passed ? 'check' : 'close'" class="w-3 h-3 inline mr-1" />{{ caseResults[idx].passed ? 'PASSED' : 'FAILED' }}
              </span>
            </div>
            <div v-if="!tc.isHidden" class="font-mono text-[11px] text-text-muted">
              <div>Input: <span class="text-accent">{{ tc.input }}</span></div>
              <div>Expected: <span class="text-accent-green">{{ tc.expectedOutput }}</span></div>
            </div>
            <div v-if="caseResults[idx]" class="font-mono text-[11px] text-text-muted">
              <div>Actual: <span class="text-accent-yellow">{{ caseResults[idx].actualOutput ?? '(lỗi)' }}</span></div>
            </div>
            <div v-else-if="tc.isHidden" class="text-[11px] text-text-muted italic">
              Hidden testcase — kết quả hiển thị sau khi chạy.
            </div>
            <div v-if="caseResults[idx]?.error" class="text-[11px] text-accent-red font-mono">{{ caseResults[idx]!.error }}</div>
          </div>
          <div v-if="caseResults.length === 0" class="text-text-muted text-xs italic text-center py-8">
            Bấm Run để chạy testcases.
          </div>
        </div>

        <div v-show="activeTab === 'hints'" class="flex-1 overflow-y-auto p-5 space-y-3">
          <h3 class="text-xs font-bold uppercase text-text-muted">Gợi ý phân tầng</h3>
          <div v-for="(hint, i) in codelabTask.hints ?? []" :key="i" class="p-4 rounded-xl bg-bg-secondary border border-border-subtle space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-xs font-bold text-accent">
                <BaseIcon name="info" class="w-4 h-4 text-accent" />
                <span>Hint #{{ i + 1 }}</span>
              </div>
              <button @click="toggleHint(i)" class="text-[11px] text-text-muted hover:text-white cursor-pointer">
                {{ shownHints.includes(i) ? 'Ẩn' : 'Xem' }}
              </button>
            </div>
            <p v-if="shownHints.includes(i)" class="text-xs text-text-secondary leading-relaxed">{{ hint }}</p>
          </div>
          <p v-if="!codelabTask.hints || codelabTask.hints.length === 0" class="text-text-muted text-xs italic text-center py-8">
            Bài tập này chưa có gợi ý.
          </p>
        </div>
      </div>

      <!-- Phải: Monaco editor + Run/Submit -->
      <div class="w-full lg:w-1/2 h-full flex flex-col bg-bg-secondary">
        <div class="px-4 py-2.5 border-b border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-text-secondary font-mono">Solution.js</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-bg-surface text-text-muted font-mono">JavaScript</span>
          </div>
          <button @click="resetCode" class="text-[11px] text-text-muted hover:text-white cursor-pointer">
            Reset to Starter Code
          </button>
        </div>

        <div class="flex-1 min-h-0" ref="editorContainer"></div>

        <div class="p-4 border-t border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0 gap-3 flex-wrap">
          <div class="flex items-center gap-2 flex-wrap">
            <button @click="runTestcases" :disabled="isRunning"
              class="px-4 py-2 bg-bg-surface hover:bg-bg-hover text-text-primary rounded-xl text-xs font-bold transition-all border border-border-subtle disabled:opacity-50 cursor-pointer">
              <BaseIcon v-if="isRunning" name="spinner" class="w-3 h-3 inline mr-1 animate-spin" />
              {{ isRunning ? 'Đang chạy...' : 'Run Testcases' }}
            </button>
            <span v-if="runError" class="text-[11px] text-accent-red font-mono">{{ runError }}</span>
          </div>
          <button @click="submitSolution" :disabled="isSubmitting || !allPassed"
            class="px-5 py-2 bg-accent hover:bg-accent text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/30 disabled:opacity-50 cursor-pointer flex items-center gap-2">
            <span>{{ allPassed ? 'Submit Solution' : 'Chạy testcases để mở khóa' }}</span>
            <BaseIcon name="check" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onUnmounted, watch } from 'vue';
import loader from '@monaco-editor/loader';
import type * as monaco from 'monaco-editor';
import type { CodeLabTask } from '../../../features/lesson/types/lesson.types';
import { runCodelabTask, type CodelabCaseResult } from '../../../features/lesson/utils/codelabExecutor';

const props = withDefaults(defineProps<{
  problemTitle?: string;
  codelabTask?: CodeLabTask | null;
}>(), {
  problemTitle: 'Thực hành lập trình',
  codelabTask: null,
});

const emit = defineEmits<{
  (e: 'completeLesson'): void;
}>();

const activeTab = ref('problem');
const shownHints = ref<number[]>([]);
const isRunning = ref(false);
const isSubmitting = ref(false);
const runError = ref<string | null>(null);
const caseResults = ref<CodelabCaseResult[]>([]);
const editorContainer = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);

const problemTabs: Array<{ id: string; name: string; badge?: string }> = [
  { id: 'problem', name: 'Problem' },
  { id: 'testcases', name: 'Testcases' },
  { id: 'hints', name: 'Hints' },
];

const allPassed = computed(() =>
  caseResults.value.length > 0 && caseResults.value.length === (props.codelabTask?.testCases.length ?? 0)
  && caseResults.value.every(r => r.passed),
);

const sampleTestcases = computed(() => (props.codelabTask?.testCases ?? []).filter(tc => !tc.isHidden));

function currentCode(): string {
  return editorInstance.value?.getValue() ?? '';
}

function resetCode(): void {
  if (!props.codelabTask) return;
  editorInstance.value?.setValue(props.codelabTask.initialCode);
  caseResults.value = [];
  runError.value = null;
}

function toggleHint(i: number): void {
  const idx = shownHints.value.indexOf(i);
  if (idx >= 0) shownHints.value.splice(idx, 1);
  else shownHints.value.push(i);
}

async function runTestcases(): Promise<void> {
  if (!props.codelabTask || isRunning.value) return;
  isRunning.value = true;
  runError.value = null;
  activeTab.value = 'testcases';
  try {
    const result = await runCodelabTask(
      currentCode(),
      props.codelabTask.testCases,
      props.codelabTask.entryFunction ?? 'solution',
    );
    if (result.timedOut) {
      runError.value = result.error ?? 'Hết thời gian chạy.';
      caseResults.value = [];
    } else if (!result.ok) {
      runError.value = result.error ?? 'Lỗi khi chạy code.';
      caseResults.value = [];
    } else {
      caseResults.value = result.results;
    }
  } catch (err: unknown) {
    runError.value = err instanceof Error ? err.message : String(err);
    caseResults.value = [];
  } finally {
    isRunning.value = false;
  }
}

async function submitSolution(): Promise<void> {
  if (!allPassed.value || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    // Chạy lại lần cuối trước khi nộp để đảm bảo trạng thái mới nhất.
    const result = await runCodelabTask(
      currentCode(),
      props.codelabTask!.testCases,
      props.codelabTask!.entryFunction ?? 'solution',
    );
    if (result.timedOut || !result.ok || result.results.some(r => !r.passed)) {
      runError.value = 'Testcase chưa đạt yêu cầu. Hãy kiểm tra lại trước khi nộp.';
      caseResults.value = result.results ?? [];
      activeTab.value = 'testcases';
      return;
    }
    emit('completeLesson');
  } catch (err: unknown) {
    runError.value = err instanceof Error ? err.message : String(err);
  } finally {
    isSubmitting.value = false;
  }
}

watch(() => props.codelabTask, () => {
  if (props.codelabTask) {
    editorInstance.value?.setValue(props.codelabTask.initialCode);
  }
  caseResults.value = [];
  runError.value = null;
});

onMounted(async () => {
  if (!props.codelabTask) return;
  try {
    const monacoInstance = await loader.init();
    if (editorContainer.value) {
      editorInstance.value = monacoInstance.editor.create(editorContainer.value, {
        value: props.codelabTask.initialCode,
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        renderLineHighlight: 'all',
        lineNumbers: 'on',
        bracketPairColorization: { enabled: true },
        formatOnPaste: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
      });
    }
  } catch (error) {
    console.error('Failed to initialize Monaco editor', error);
  }
});

onUnmounted(() => {
  editorInstance.value?.dispose();
  editorInstance.value = null;
});
</script>

<style scoped>

</style>
