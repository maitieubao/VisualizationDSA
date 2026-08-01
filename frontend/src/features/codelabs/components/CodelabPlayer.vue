<template>
  <div class="codelab-player min-h-[calc(100vh-3.5rem)] w-full flex flex-col bg-gray-950 text-gray-200 font-sans">

    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="text-xl animate-pulse text-indigo-400">Loading Codelab...</div>
    </div>

    <template v-else-if="codelab">
      
      <header class="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-semibold text-gray-100">{{ codelab.title }}</h1>
          <span class="px-2 py-0.5 rounded text-xs font-medium"
            :class="difficultyClass">
            {{ difficultyLabel }}
          </span>
          <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-medium">
            +{{ codelab.xpReward }} XP
          </span>
        </div>

        <div class="flex items-center gap-4">
          <select v-model="language" class="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm outline-none focus:border-indigo-500 transition-colors">
            <option v-for="lang in codelab.allowedLanguages.split(',')" :key="lang" :value="lang.trim()">
              {{ lang.trim() }}
            </option>
          </select>
          <button @click="resetCode" class="text-xs text-gray-400 hover:text-white px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition cursor-pointer" title="Reset to starter code">
            Reset Code
          </button>
          <button @click="runCode" :disabled="isRunning || isSubmitting"
            class="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 cursor-pointer">
            <span v-if="isRunning" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isRunning ? 'Running...' : 'Run' }}
          </button>
          <button @click="submitCode" :disabled="isRunning || isSubmitting"
            class="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm font-medium transition-all shadow-[0_0_10px_rgba(79,70,229,0.3)] flex items-center gap-2 cursor-pointer">
            <span v-if="isSubmitting" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isSubmitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
      </header>

      
      <div class="flex-1 flex overflow-hidden bg-gray-950">
        <div class="w-1/2 h-full flex flex-col border-r border-gray-700">
          
          <div class="flex border-b border-gray-700 bg-gray-900/60 shrink-0">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
              class="py-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer"
              :class="activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'">
              {{ tab.name }}
              <span v-if="tab.badge" class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400">{{ tab.badge }}</span>
            </button>
          </div>

          
          <div class="flex-1 overflow-y-auto">
            
            <div v-show="activeTab === 'problem'" class="p-5 space-y-4">
              <div class="prose prose-invert prose-sm max-w-none" v-html="codelab.description"></div>

              <div v-if="codelab.constraints" class="p-3 rounded-xl bg-gray-900 border border-gray-700/50">
                <span class="text-[10px] font-bold text-gray-400 uppercase">Constraints</span>
                <pre class="mt-2 text-xs text-gray-400 font-mono whitespace-pre-wrap">{{ codelab.constraints }}</pre>
              </div>

              <div v-if="codelab.examples && codelab.examples.length" class="space-y-3">
                <h3 class="text-xs font-bold text-gray-300 uppercase">Examples</h3>
                <div v-for="(ex, idx) in codelab.examples" :key="idx" class="p-3 rounded-xl bg-gray-900 border border-gray-700/50 space-y-2">
                  <div class="text-[10px] font-bold text-gray-500 uppercase">Example {{ idx + 1 }}</div>
                  <div class="font-mono text-xs text-indigo-300">Input: {{ ex.input }}</div>
                  <div class="font-mono text-xs text-emerald-400">Output: {{ ex.expectedOutput }}</div>
                </div>
              </div>

              <div v-if="codelab.hints" class="p-3 rounded-xl bg-gray-900 border border-gray-700/50">
                <span class="text-[10px] font-bold text-gray-400 uppercase">Hints</span>
                <div v-for="(hint, idx) in codelab.hints" :key="idx" class="mt-3">
                  <button @click="toggleHint(idx)" class="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    Hint {{ idx + 1 }}
                    <span v-if="hint.xpCost" class="text-amber-400 text-[10px]">(-{{ hint.xpCost }} XP)</span>
                  </button>
                  <p v-if="revealedHints[idx]" class="mt-2 text-xs text-gray-400 leading-relaxed pl-5">{{ hint.content }}</p>
                  <button v-else-if="hint.xpCost" @click="revealHint(idx)" class="mt-2 text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer">
                    Reveal hint (costs {{ hint.xpCost }} XP)
                  </button>
                  <p v-else class="mt-2 text-xs text-gray-500 pl-5">Click to reveal</p>
                </div>
              </div>
            </div>

            
            <div v-show="activeTab === 'testcases'" class="p-4 space-y-3">
              <h3 class="text-xs font-bold text-gray-400 uppercase mb-3">Test Cases ({{ visibleTestCaseCount }} visible / {{ allTestCaseCount }} total)</h3>
              <div v-for="(tc, idx) in testCaseResults" :key="idx" class="p-3 rounded-xl border text-xs"
                :class="tc.passed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-rose-500/30 bg-rose-950/10'">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold" :class="tc.passed ? 'text-emerald-400' : 'text-rose-400'">
                    {{ tc.passed ? '✓ PASS' : '✗ FAIL' }}
                  </span>
                  <span class="text-[10px] text-gray-500">{{ tc.name }}</span>
                </div>
                <div v-if="!tc.isHidden" class="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span class="text-gray-500">Input:</span>
                    <pre class="text-indigo-300 font-mono whitespace-pre-wrap">{{ tc.input }}</pre>
                  </div>
                  <div>
                    <span class="text-gray-500">Expected:</span>
                    <pre class="text-emerald-400 font-mono whitespace-pre-wrap">{{ tc.expectedOutput }}</pre>
                  </div>
                </div>
                <div v-if="tc.actualOutput" class="mt-1">
                  <span class="text-gray-500">Actual:</span>
                  <pre class="text-gray-300 font-mono whitespace-pre-wrap">{{ tc.actualOutput }}</pre>
                </div>
                <div v-if="tc.errorMessage" class="mt-1 text-rose-400 text-[11px]">{{ tc.errorMessage }}</div>
                <div v-if="tc.runtimeMs !== undefined" class="mt-1 text-[10px] text-gray-500">{{ tc.runtimeMs }}ms</div>
              </div>
              <div v-if="testCaseResults.length === 0" class="text-gray-500 text-xs italic text-center py-8">
                Run or Submit your code to see test results.
              </div>
            </div>

            
            <div v-show="activeTab === 'hints'" class="p-4 space-y-3">
              <h3 class="text-xs font-bold text-gray-400 uppercase mb-3">Hints & Solution</h3>
              <div v-for="(hint, idx) in codelab.hints" :key="idx" class="p-3 rounded-xl bg-gray-900 border border-gray-700/50 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-indigo-400">Hint #{{ idx + 1 }}</span>
                  <span v-if="hint.xpCost" class="text-[10px] text-amber-400">-{{ hint.xpCost }} XP</span>
                </div>
                <p v-if="revealedHints[idx]" class="text-xs text-gray-300 leading-relaxed">{{ hint.content }}</p>
                <button v-else @click="revealHint(idx)" class="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer">
                  Reveal (costs {{ hint.xpCost }} XP)
                </button>
              </div>
              <div v-if="codelab.hints?.length === 0" class="text-gray-500 text-xs italic">No hints available for this codelab.</div>
            </div>

            
            <div v-show="activeTab === 'leaderboard'" class="p-4 space-y-3">
              <h3 class="text-xs font-bold text-gray-400 uppercase mb-3">Leaderboard</h3>
              <div v-for="(entry, idx) in leaderboard" :key="entry.id" class="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-700/50 text-xs">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    :class="idx === 0 ? 'bg-amber-500/20 text-amber-400' : idx === 1 ? 'bg-gray-400/20 text-gray-300' : idx === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-gray-800 text-gray-500'">
                    {{ idx + 1 }}
                  </span>
                  <span class="font-bold text-white">{{ entry.username }}</span>
                  <span v-if="entry.isYou" class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">You</span>
                </div>
                <div class="flex items-center gap-4 text-[10px] font-mono">
                  <span class="text-indigo-400">{{ entry.runtimeMs }}ms</span>
                  <span class="text-emerald-400">{{ entry.memoryMb }}MB</span>
                  <span class="text-amber-400 font-bold">{{ entry.score }} XP</span>
                </div>
              </div>
            </div>

            
            <div v-show="activeTab === 'submissions'" class="p-4 space-y-3">
              <h3 class="text-xs font-bold text-gray-400 uppercase mb-3">Submission History</h3>
              <div v-for="(sub, idx) in submissionHistory" :key="idx" class="p-3 rounded-xl bg-gray-900 border border-gray-700/50 text-xs">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-bold" :class="sub.passed ? 'text-emerald-400' : 'text-rose-400'">
                    {{ sub.passed ? '✓ Accepted' : '✗ ' + sub.status }}
                  </span>
                  <span class="text-gray-500">{{ sub.language }} · {{ sub.runtimeMs }}ms</span>
                </div>
                <div v-if="!sub.passed && sub.errorMessage" class="text-rose-400 text-[11px] mb-2 whitespace-pre-wrap">{{ sub.errorMessage }}</div>
                <div v-if="sub.score !== undefined" class="text-amber-400 font-bold">Score: {{ sub.score }} XP</div>
              </div>
              <div v-if="submissionHistory.length === 0" class="text-gray-500 text-xs italic text-center py-8">
                No submissions yet. Submit your code to see history.
              </div>
            </div>
          </div>
        </div>

        
        <div class="w-1/2 h-full flex flex-col">
          <div class="px-4 py-2 bg-gray-900/80 border-b border-gray-700 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-gray-300 font-mono">{{ codelab.title }}.{{ languageExtension }}</span>
            </div>
            <span class="text-[10px] text-gray-500">Ctrl+Enter to run · Ctrl+Enter in editor</span>
          </div>
          <div class="flex-1 min-h-0" ref="editorContainer"></div>
        </div>
      </div>
    </template>

    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-red-400 text-lg">Codelab not found.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, computed } from 'vue';
import loader from '@monaco-editor/loader';
import type * as monaco from 'monaco-editor';
import { codelabApi, type CodelabDto } from '../api/codelabApi';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

const props = defineProps<{
  codelabId: string;
}>();

const isLoading = ref(true);
const isSubmitting = ref(false);
const isRunning = ref(false);
const codelab = ref<CodelabDto | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);
const result = ref<any>(null);
const activeTab = ref('problem');
const language = ref('csharp');
const revealedHints = ref<boolean[]>([]);
const submissionHistory = ref<Array<{ passed: boolean; status: string; runtimeMs: number; memoryMb: number; score?: number; language: string; errorMessage?: string }>>([]);
const leaderboard = ref<Array<{ id: string; username: string; runtimeMs: number; memoryMb: number; score: number; isYou?: boolean }>>([]);

const testCaseResults = computed(() => {
  if (!result.value) return [];
  if (result.value.testCaseResultsJson) {
    try { return JSON.parse(result.value.testCaseResultsJson); } catch { return []; }
  }
  return [];
});

const visibleTestCaseCount = computed(() => testCaseResults.value.filter(tc => !tc.isHidden).length);
const allTestCaseCount = computed(() => testCaseResults.value.length);

const difficultyLabel = computed(() => {
  const d = codelab.value?.difficulty;
  if (d === 1) return 'Easy';
  if (d === 2) return 'Medium';
  if (d === 3) return 'Hard';
  return `Level ${d}`;
});

const difficultyClass = computed(() => {
  const d = codelab.value?.difficulty;
  if (d === 1) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  if (d === 2) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  if (d === 3) return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
  return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
});

const languageExtension = computed(() => {
  const lang = language.value.toLowerCase();
  const map: Record<string, string> = { csharp: 'cs', python: 'py', java: 'java', javascript: 'js', cpp: 'cpp', go: 'go', rust: 'rs', typescript: 'ts' };
  return map[lang] ?? lang;
});

const tabs = computed(() => [
  { id: 'problem', name: 'Problem' },
  { id: 'testcases', name: 'Testcases', badge: testCaseResults.value.length > 0 ? String(testCaseResults.value.length) : undefined },
  { id: 'hints', name: 'Hints' },
  { id: 'leaderboard', name: 'Leaderboard' },
  { id: 'submissions', name: 'Submissions', badge: submissionHistory.value.length > 0 ? String(submissionHistory.value.length) : undefined },
]);

function toggleHint(idx: number): void {
  revealedHints.value[idx] = !revealedHints.value[idx];
}

async function revealHint(idx: number): Promise<void> {
  const hint = codelab.value?.hints?.[idx];
  if (!hint) return;
  if (hint.xpCost && codelab.value) {
    try {
      await codelabApi.revealHint(codelab.value.id, idx);
    } catch {  }
  }
  revealedHints.value[idx] = true;
}

function resetCode(): void {
  if (editorInstance.value && codelab.value) {
    editorInstance.value.setValue(codelab.value.initialCode);
  }
}

onMounted(async () => {
  try {
    codelab.value = await codelabApi.getCodelab(props.codelabId);
    if (codelab.value.allowedLanguages) {
      language.value = codelab.value.allowedLanguages.split(',')[0].trim();
    }
    if (codelab.value.hints) {
      revealedHints.value = new Array(codelab.value.hints.length).fill(false);
    }

    
    leaderboard.value = [
      { id: '1', username: 'alex_dev', runtimeMs: 12, memoryMb: 14.2, score: 100 },
      { id: '2', username: 'student_pro', runtimeMs: 15, memoryMb: 14.5, score: 95 },
      { id: '3', username: 'code_wizard', runtimeMs: 18, memoryMb: 15.0, score: 90 },
    ];

    
    const monacoInstance = await loader.init();
    if (editorContainer.value) {
      editorInstance.value = monacoInstance.editor.create(editorContainer.value, {
        value: codelab.value.initialCode || '',
        language: language.value,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        renderLineHighlight: 'all',
        lineNumbers: 'on',
        rulers: [80, 120],
        roundedSelection: false,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        formatOnPaste: true,
      });
    }
  } catch (error) {
    console.error('Failed to load codelab', error);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
});

const submitCode = async () => {
  if (!editorInstance.value || !codelab.value) return;
  isSubmitting.value = true;
  result.value = null;
  const code = editorInstance.value.getValue();

  try {
    const res = await codelabApi.submitCodelab(codelab.value.id, { code, language: language.value });
    result.value = res;
    submissionHistory.value.unshift({
      passed: res.passed,
      status: res.status || (res.passed ? 'Accepted' : 'Wrong Answer'),
      runtimeMs: res.runtimeMs || 0,
      memoryMb: res.memoryBytes ? res.memoryBytes / 1024 / 1024 : 0,
      score: res.passed ? codelab.value.xpReward : undefined,
      language: language.value,
      errorMessage: res.errorMessage,
    });
  } catch (error) {
    console.error('Submission failed', error);
    result.value = { passed: false, status: 'Error', errorMessage: 'Network error or server unavailable.', runtimeMs: 0 };
    submissionHistory.value.unshift({
      passed: false, status: 'Error', runtimeMs: 0, memoryMb: 0, language: language.value,
      errorMessage: 'Network error or server unavailable.',
    });
  } finally {
    isSubmitting.value = false;
  }
};

const runCode = async () => {
  if (!editorInstance.value || !codelab.value) return;
  isRunning.value = true;
  result.value = null;
  const code = editorInstance.value.getValue();

  try {
    const res = await codelabApi.runCodelab(codelab.value.id, { code, language: language.value });
    result.value = res;
  } catch (error) {
    console.error('Run failed', error);
    result.value = { passed: false, status: 'Error', errorMessage: 'Network error or server unavailable.', runtimeMs: 0 };
  } finally {
    isRunning.value = false;
  }
};
</script>

<style scoped>

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: rgba(31, 41, 55, 0.3); }
::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.4); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(79, 70, 229, 0.7); }


.custom-splitpanes.default-theme .splitpanes__pane { background-color: transparent; }
.custom-splitpanes.default-theme .splitpanes__splitter { background-color: #374151; transition: background-color 0.2s; }
.custom-splitpanes.default-theme .splitpanes__splitter:hover { background-color: #4f46e5; }
</style>