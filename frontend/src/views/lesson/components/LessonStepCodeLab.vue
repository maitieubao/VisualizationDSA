<template>
  <div class="lesson-step-codelab flex flex-col lg:flex-row h-full w-full bg-slate-950 overflow-hidden text-slate-200 font-sans">
    <!-- Left Column: Problem Description, Testcases, Hints & Ranking -->
    <div class="w-full lg:w-1/2 h-full flex flex-col border-r border-white/10 bg-slate-900/60 overflow-hidden">
      <!-- Tabs -->
      <div class="flex border-b border-white/10 bg-slate-950/60 px-4 shrink-0">
        <button
          v-for="tab in problemTabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer"
          :class="activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab 1: Đề Bài (Problem Specification) -->
      <div v-show="activeTab === 'problem'" class="flex-1 overflow-y-auto p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Step 4 / 4 — Code Lab</span>
            </div>
            <h2 class="text-lg font-extrabold text-white mt-0.5">{{ problemTitle }}</h2>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            Dễ (Easy)
          </span>
        </div>

        <div class="text-xs leading-relaxed text-slate-300 space-y-3">
          <p>Viết hàm sắp xếp mảng số nguyên tăng dần bằng thuật toán đã học. Đảm bảo đạt độ phức tạp O(N²).</p>
          <div class="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase font-mono">Ví dụ 1:</span>
            <div class="font-mono text-xs text-indigo-300">Input: [5, 2, 9, 1, 5, 6]</div>
            <div class="font-mono text-xs text-emerald-400">Output: [1, 2, 5, 5, 6, 9]</div>
          </div>
        </div>

        <!-- Constraints -->
        <div class="pt-2 border-t border-white/10">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Giới hạn hiệu suất:</span>
          <ul class="text-xs text-slate-400 list-disc list-inside mt-1 space-y-0.5 font-mono">
            <li>N ≤ 1000 phần tử</li>
            <li>Thời gian chạy (Time Limit) ≤ 1000ms</li>
            <li>Bộ nhớ (Memory Limit) ≤ 128MB</li>
          </ul>
        </div>
      </div>

      <!-- Tab 2: Testcases -->
      <div v-show="activeTab === 'testcases'" class="flex-1 overflow-y-auto p-5 space-y-3">
        <h3 class="text-xs font-bold uppercase text-slate-400">Bộ Kiểm Thử (Testcases)</h3>
        <div v-for="(tc, idx) in sampleTestcases" :key="idx" class="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-300">Testcase #{{ idx + 1 }} {{ tc.isHidden ? '(Ẩn)' : '' }}</span>
            <span v-if="testResults[idx]" :class="testResults[idx].passed ? 'text-emerald-400' : 'text-rose-400'" class="font-bold text-[11px]">
              {{ testResults[idx].passed ? '✓ PASSED' : '✕ FAILED' }}
            </span>
          </div>
          <div v-if="!tc.isHidden" class="font-mono text-[11px] text-slate-400">
            <div>Input: <span class="text-indigo-300">{{ tc.input }}</span></div>
            <div>Expected: <span class="text-emerald-400">{{ tc.expectedOutput }}</span></div>
          </div>
          <div v-else class="text-[11px] text-slate-500 italic">
            Testcase ẩn dùng để đánh giá độ chính xác khi Submit.
          </div>
        </div>
      </div>

      <!-- Tab 3: Tiered Hints & Solution -->
      <div v-show="activeTab === 'hints'" class="flex-1 overflow-y-auto p-5 space-y-3">
        <h3 class="text-xs font-bold uppercase text-slate-400">Gợi Ý Theo Tầng (Tiered Hints)</h3>
        
        <div class="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Gợi ý #1 (Cơ bản)</span>
            </div>
            <button @click="showHint1 = !showHint1" class="text-[11px] text-slate-400 hover:text-white cursor-pointer">
              {{ showHint1 ? 'Ẩn' : 'Xem (-5 XP)' }}
            </button>
          </div>
          <p v-if="showHint1" class="text-xs text-slate-300 leading-relaxed">
            Sử dụng 2 vòng lặp lồng nhau. Vòng ngoài chạy từ 0 đến N-1, vòng trong so sánh từng cặp kề nhau.
          </p>
        </div>

        <div class="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Gợi ý #2 (Tối ưu)</span>
            </div>
            <button @click="showHint2 = !showHint2" class="text-[11px] text-slate-400 hover:text-white cursor-pointer">
              {{ showHint2 ? 'Ẩn' : 'Xem (-10 XP)' }}
            </button>
          </div>
          <p v-if="showHint2" class="text-xs text-slate-300 leading-relaxed">
            Nếu trong một lượt duyệt không có cặp nào bị hoán đổi, mảng đã sắp xếp xong → có thể dừng sớm.
          </p>
        </div>
      </div>

      <!-- Tab 4: Bảng Xếp Hạng Hiệu Suất (Leaderboard) -->
      <div v-show="activeTab === 'ranking'" class="flex-1 overflow-y-auto p-5 space-y-3">
        <h3 class="text-xs font-bold uppercase text-slate-400">Bảng Xếp Hạng Bài Tập (Leaderboard)</h3>
        <div class="space-y-2">
          <div
            v-for="(r, idx) in leaderboard"
            :key="r.id"
            class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/10 text-xs"
          >
            <div class="flex items-center gap-3">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">
                #{{ idx + 1 }}
              </span>
              <span class="font-bold text-white">{{ r.username }}</span>
            </div>
            <div class="flex items-center gap-4 text-[11px] font-mono">
              <span class="text-indigo-400">{{ r.runtimeMs }}ms</span>
              <span class="text-emerald-400">{{ r.memoryMb }}MB</span>
              <span class="text-amber-400 font-bold">{{ r.score }} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Code Editor & Execution Actions -->
    <div class="w-full lg:w-1/2 h-full flex flex-col bg-slate-950">
      <!-- Editor Header -->
      <div class="px-4 py-2.5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-300 font-mono">Solution.cs</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">C# .NET 9</span>
        </div>
        <button @click="resetCode" class="text-[11px] text-slate-400 hover:text-white cursor-pointer">
          Đặt lại code mẫu
        </button>
      </div>

      <!-- Code Textarea / Monaco Container -->
      <div class="flex-1 min-h-0 relative p-3">
        <textarea
          v-model="userCode"
          class="w-full h-full bg-slate-950 text-indigo-200 font-mono text-xs p-4 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
          spellcheck="false"
        ></textarea>
      </div>

      <!-- Footer Actions (Run Testcases & Submit Solution) -->
      <div class="p-4 border-t border-white/10 bg-slate-900/90 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <button
            @click="runTestcases"
            :disabled="isRunning"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-white/10 disabled:opacity-50 cursor-pointer"
          >
            {{ isRunning ? 'Đang chạy...' : 'Chạy Testcases' }}
          </button>
        </div>

        <button
          @click="submitSolution"
          :disabled="isSubmitting"
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <span>Nộp Bài (Submit)</span>
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  problemTitle?: string;
}>(), {
  problemTitle: 'Cài đặt thuật toán Bubble Sort'
});

const emit = defineEmits<{
  (e: 'completeLesson'): void;
}>();

const activeTab = ref('problem');
const showHint1 = ref(false);
const showHint2 = ref(false);
const isRunning = ref(false);
const isSubmitting = ref(false);

const problemTabs = [
  { id: 'problem', name: 'Đề Bài' },
  { id: 'testcases', name: 'Testcases' },
  { id: 'hints', name: 'Gợi Ý' },
  { id: 'ranking', name: 'Xếp Hạng' }
];

const defaultCode = `using System;

public class Solution {
    public int[] BubbleSort(int[] arr) {
        int n = arr.Length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // Swap
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
  { input: '[100 phần tử ngẫu nhiên]', expectedOutput: '[Mảng đã sắp xếp]', isHidden: true }
];

const testResults = ref<Array<{ passed: boolean }>>([]);

const leaderboard = ref([
  { id: '1', username: 'alex_dev', runtimeMs: 12, memoryMb: 14.2, score: 100 },
  { id: '2', username: 'student_pro', runtimeMs: 15, memoryMb: 14.5, score: 95 },
  { id: '3', username: 'code_wizard', runtimeMs: 18, memoryMb: 15.0, score: 90 }
]);

function resetCode(): void {
  userCode.value = defaultCode;
}

function runTestcases(): void {
  isRunning.value = true;
  activeTab.value = 'testcases';
  setTimeout(() => {
    testResults.value = [
      { passed: true },
      { passed: true },
      { passed: true }
    ];
    isRunning.value = false;
  }, 800);
}

function submitSolution(): void {
  isSubmitting.value = true;
  activeTab.value = 'ranking';
  setTimeout(() => {
    isSubmitting.value = false;
    emit('completeLesson');
  }, 1000);
}
</script>
