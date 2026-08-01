<template>
  <div class="lesson-step-codelab flex flex-col lg:flex-row h-full w-full bg-bg-secondary overflow-hidden text-text-primary font-sans">
    
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
              <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Step 4 / 4 — Code Lab</span>
            </div>
            <h2 class="text-lg font-extrabold text-white mt-0.5">{{ problemTitle }}</h2>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-accent-green/80 text-accent-green border border-accent-green/30">
            Easy
          </span>
        </div>

        <div class="text-xs leading-relaxed text-text-secondary space-y-3">
          <p>Viết hàm sắp xếp mảng số nguyên tăng dần bằng thuật toán đã học. Đảm bảo đạt độ phức tạp O(N²).</p>
          <div class="p-3 rounded-xl bg-bg-secondary border border-border-subtle space-y-1">
            <span class="text-[10px] font-bold text-text-muted uppercase font-mono">Example 1:</span>
            <div class="font-mono text-xs text-accent">Input: [5, 2, 9, 1, 5, 6]</div>
            <div class="font-mono text-xs text-accent-green">Output: [1, 2, 5, 5, 6, 9]</div>
          </div>
        </div>

        
        <div class="pt-2 border-t border-border-subtle">
          <span class="text-[11px] font-bold text-text-muted uppercase">Performance Limits:</span>
          <ul class="text-xs text-text-muted list-disc list-inside mt-1 space-y-0.5 font-mono">
            <li>N ≤ 1000 elements</li>
            <li>Time Limit ≤ 1000ms</li>
            <li>Memory Limit ≤ 128MB</li>
          </ul>
        </div>
      </div>

      
      <div v-show="activeTab === 'testcases'" class="flex-1 overflow-y-auto p-5 space-y-3">
        <h3 class="text-xs font-bold uppercase text-text-muted">Testcases ({{ testCaseResults.length }} tests)</h3>
        <div v-for="(tc, idx) in sampleTestcases" :key="idx" class="p-3.5 rounded-xl bg-bg-secondary border border-border-subtle space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-text-secondary">Testcase #{{ idx + 1 }} {{ tc.isHidden ? '(Hidden)' : '' }}</span>
            <span v-if="testResults[idx]" :class="testResults[idx].passed ? 'text-accent-green' : 'text-accent-red'" class="font-bold text-[11px]">
              {{ testResults[idx].passed ? '✓ PASSED' : '✕ FAILED' }}
            </span>
          </div>
          <div v-if="!tc.isHidden" class="font-mono text-[11px] text-text-muted">
            <div>Input: <span class="text-accent">{{ tc.input }}</span></div>
            <div>Expected: <span class="text-accent-green">{{ tc.expectedOutput }}</span></div>
          </div>
          <div v-else class="text-[11px] text-text-muted italic">
            Hidden testcase used for accuracy evaluation on Submit.
          </div>
        </div>
        <div v-if="testResults.length === 0" class="text-text-muted text-xs italic text-center py-8">
          Run or Submit your code to see test results.
        </div>
      </div>

      
      <div v-show="activeTab === 'hints'" class="flex-1 overflow-y-auto p-5 space-y-3">
        <h3 class="text-xs font-bold uppercase text-text-muted">Tiered Hints</h3>
        <div class="p-4 rounded-xl bg-bg-secondary border border-border-subtle space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-accent">
              <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Hint #1 (Basic)</span>
            </div>
            <button @click="showHint1 = !showHint1" class="text-[11px] text-text-muted hover:text-white cursor-pointer">
              {{ showHint1 ? 'Hide' : 'View (-5 XP)' }}
            </button>
          </div>
          <p v-if="showHint1" class="text-xs text-text-secondary leading-relaxed">
            Use two nested loops. Outer loop runs 0 to N-1, inner loop compares adjacent pairs.
          </p>
        </div>
        <div class="p-4 rounded-xl bg-bg-secondary border border-border-subtle space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-accent">
              <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Hint #2 (Optimized)</span>
            </div>
            <button @click="showHint2 = !showHint2" class="text-[11px] text-text-muted hover:text-white cursor-pointer">
              {{ showHint2 ? 'Hide' : 'View (-10 XP)' }}
            </button>
          </div>
          <p v-if="showHint2" class="text-xs text-text-secondary leading-relaxed">
            If in one pass no pair was swapped, the array is already sorted → stop early.
          </p>
        </div>
      </div>

      
      <div v-show="activeTab === 'ranking'" class="flex-1 overflow-y-auto p-5 space-y-3">
        <h3 class="text-xs font-bold uppercase text-text-muted">Performance Leaderboard</h3>
        <div class="space-y-2">
          <div v-for="(r, idx) in leaderboard" :key="r.id" class="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border-subtle text-xs">
            <div class="flex items-center gap-3">
              <span class="w-5 h-5 rounded-full bg-bg-surface text-text-secondary font-bold text-[10px] flex items-center justify-center">
                #{{ idx + 1 }}
              </span>
              <span class="font-bold text-white">{{ r.username }}</span>
            </div>
            <div class="flex items-center gap-4 text-[11px] font-mono">
              <span class="text-accent">{{ r.runtimeMs }}ms</span>
              <span class="text-accent-green">{{ r.memoryMb }}MB</span>
              <span class="text-accent-yellow font-bold">{{ r.score }} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="w-full lg:w-1/2 h-full flex flex-col bg-bg-secondary">
      
      <div class="px-4 py-2.5 border-b border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-text-secondary font-mono">Solution.cs</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-bg-surface text-text-muted font-mono">C# .NET 9</span>
        </div>
        <button @click="resetCode" class="text-[11px] text-text-muted hover:text-white cursor-pointer">
          Reset to Starter Code
        </button>
      </div>

      
      <div class="flex-1 min-h-0" ref="editorContainer"></div>

      
      <div class="p-4 border-t border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <button @click="runTestcases" :disabled="isRunning"
            class="px-4 py-2 bg-bg-surface hover:bg-bg-hover text-text-primary rounded-xl text-xs font-bold transition-all border border-border-subtle disabled:opacity-50 cursor-pointer">
            {{ isRunning ? 'Running...' : 'Run Testcases' }}
          </button>
        </div>
        <button @click="submitSolution" :disabled="isSubmitting"
          class="px-5 py-2 bg-accent hover:bg-accent text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/30 disabled:opacity-50 cursor-pointer flex items-center gap-2">
          <span>Submit Solution</span>
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, computed } from 'vue';
import loader from '@monaco-editor/loader';
import type * as monaco from 'monaco-editor';

const props = withDefaults(defineProps<{
  problemTitle?: string;
}>(), {
  problemTitle: 'Implement Bubble Sort',
});

const emit = defineEmits<{
  (e: 'completeLesson'): void;
}>();

const activeTab = ref('problem');
const showHint1 = ref(false);
const showHint2 = ref(false);
const isRunning = ref(false);
const isSubmitting = ref(false);
const editorContainer = ref<HTMLElement | null>(null);
const editorInstance = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null);

const problemTabs: Array<{ id: string; name: string; badge?: string }> = [
  { id: 'problem', name: 'Problem' },
  { id: 'testcases', name: 'Testcases' },
  { id: 'hints', name: 'Hints' },
  { id: 'ranking', name: 'Leaderboard' },
];

const testCaseResults = ref<Array<{ passed: boolean; name: string; input: string; expectedOutput: string; actualOutput?: string; errorMessage?: string; runtimeMs?: number; isHidden: boolean }>>([]);

const defaultCode = `using System;

public class Solution {
    public int[] BubbleSort(int[] arr) {
        int n = arr.Length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
}`;

const userCode = ref(defaultCode);

const sampleTestcases = [
  { input: '[5, 2, 9, 1, 5, 6]', expectedOutput: '[1, 2, 5, 5, 6, 9]', isHidden: false },
  { input: '[10, -2, 4, 0]', expectedOutput: '[-2, 0, 4, 10]', isHidden: false },
  { input: '[100 random elements]', expectedOutput: '[Sorted array]', isHidden: true },
];

const leaderboard = ref([
  { id: '1', username: 'alex_dev', runtimeMs: 12, memoryMb: 14.2, score: 100 },
  { id: '2', username: 'student_pro', runtimeMs: 15, memoryMb: 14.5, score: 95 },
  { id: '3', username: 'code_wizard', runtimeMs: 18, memoryMb: 15.0, score: 90 },
]);

const testResults = ref<Array<{ passed: boolean }>>([]);

function resetCode(): void {
  if (editorInstance.value) {
    editorInstance.value.setValue(defaultCode);
  }
  userCode.value = defaultCode;
}

function runTestcases(): void {
  isRunning.value = true;
  activeTab.value = 'testcases';
  setTimeout(() => {
    testResults.value = sampleTestcases.map(() => ({ passed: true }));
    testCaseResults.value = sampleTestcases.map((tc, idx) => ({
      name: `Testcase #${idx + 1}`,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      passed: true,
      isHidden: tc.isHidden,
      runtimeMs: Math.floor(Math.random() * 20) + 5,
    }));
    isRunning.value = false;
  }, 800);
}

function submitSolution(): void {
  isSubmitting.value = true;
  activeTab.value = 'ranking';
  setTimeout(() => {
    testResults.value = sampleTestcases.map(() => ({ passed: true }));
    testCaseResults.value = sampleTestcases.map((tc, idx) => ({
      name: `Testcase #${idx + 1}`,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      passed: true,
      isHidden: tc.isHidden,
      runtimeMs: Math.floor(Math.random() * 20) + 5,
    }));
    isSubmitting.value = false;
    emit('completeLesson');
  }, 1000);
}

onMounted(async () => {
  try {
    const monacoInstance = await loader.init();
    if (editorContainer.value) {
      editorInstance.value = monacoInstance.editor.create(editorContainer.value, {
        value: defaultCode,
        language: 'csharp',
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
  if (editorInstance.value) {
    editorInstance.value.dispose();
  }
});


defineExpose({ userCode });
</script>

<style scoped>

</style>