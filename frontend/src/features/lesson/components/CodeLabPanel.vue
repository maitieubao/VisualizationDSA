<template>
  <div class="lesson-step-codelab flex flex-col lg:flex-row h-full w-full bg-slate-950 overflow-hidden text-slate-200 font-sans">
    
    <div class="w-full lg:w-1/2 h-full flex flex-col border-r border-white/10 bg-slate-900/60 overflow-hidden">
      
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
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/30">
            Trung bình (Medium)
          </span>
        </div>

        <div class="text-xs leading-relaxed text-slate-300 space-y-3">
          <p>{{ task?.description }}</p>
          <div v-if="task?.testCases?.[0]" class="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase font-mono">Ví dụ 1:</span>
            <div class="font-mono text-xs text-indigo-300">Input: {{ task.testCases[0].input }}</div>
            <div class="font-mono text-xs text-emerald-400">Output: {{ task.testCases[0].expectedOutput }}</div>
          </div>
        </div>
      </div>

      
      <div v-show="activeTab === 'testcases'" class="flex-1 overflow-y-auto p-5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 group relative">
            <h3 class="text-xs font-bold uppercase text-slate-400">Bộ Kiểm Thử (Testcases)</h3>
            <svg class="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="absolute left-0 top-5 w-48 p-2 bg-slate-800 text-xs text-slate-300 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none border border-white/10">
              Testcase ẩn sẽ tự động được chạy khi bạn bấm nút <b class="text-emerald-400">Nộp Code</b>.
            </div>
          </div>
          <span v-if="isRunning" class="text-xs text-indigo-400 flex items-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang chạy sandbox...
          </span>
        </div>

        
        <div v-if="isRunning && testResults.length === 0" class="space-y-3">
          <div v-for="i in task?.testCases?.length || 2" :key="i" class="h-20 rounded-xl bg-slate-800/50 animate-pulse border border-white/5"></div>
        </div>

        <div v-for="(tc, idx) in task?.testCases" :key="idx" class="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-300">Testcase #{{ idx + 1 }} {{ tc.isHidden ? '(Ẩn)' : '' }}</span>
            <span v-if="testResults[idx]" :class="testResults[idx].passed ? 'text-emerald-400' : 'text-rose-400'" class="font-bold text-[11px]">
              {{ testResults[idx].passed ? '✓ PASSED' : '✕ FAILED' }}
            </span>
          </div>
          <div v-if="!tc.isHidden" class="font-mono text-[11px] text-slate-400">
            <div>Input: <span class="text-indigo-300">{{ tc.input }}</span></div>
            <div>Expected: <span class="text-emerald-400">{{ tc.expectedOutput }}</span></div>
            <div v-if="testResults[idx] && !testResults[idx].passed">Actual: <span class="text-rose-400">{{ testResults[idx].actualOutput }}</span></div>
          </div>
          <div v-else class="text-[11px] text-slate-500 italic">
            Testcase ẩn dùng để đánh giá độ chính xác khi Submit. (Sẽ được chạy khi bạn nhấn Nộp Bài)
          </div>
        </div>
      </div>
      
      
      <div v-show="activeTab === 'solution'" class="flex-1 overflow-y-auto p-5 space-y-3">
        <h3 class="text-xs font-bold uppercase text-slate-400">Giải pháp tham khảo</h3>
        <div class="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Mã nguồn chuẩn</span>
            </div>
            <button @click="showSolution = !showSolution" class="text-[11px] text-slate-400 hover:text-white cursor-pointer">
              {{ showSolution ? 'Ẩn' : 'Xem (-20 XP)' }}
            </button>
          </div>
          <pre v-if="showSolution" class="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900 p-3 rounded-lg overflow-x-auto">{{ task?.solution }}</pre>
        </div>
      </div>
    </div>

    
    <div class="w-full lg:w-1/2 h-full flex flex-col bg-slate-950">
      
      <div class="px-4 py-2.5 border-b border-white/10 bg-slate-900/80 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-300 font-mono">Solution.js</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">JavaScript</span>
        </div>
        <button @click="resetCode" class="text-[11px] text-slate-400 hover:text-white cursor-pointer">
          Đặt lại code mẫu
        </button>
      </div>

      
      <div class="flex-1 min-h-0 relative p-3">
        
        <textarea
          v-model="userCode"
          class="w-full h-full bg-slate-950 text-indigo-200 font-mono text-xs p-4 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
          spellcheck="false"
        ></textarea>
      </div>

      
      <div class="p-4 border-t border-white/10 bg-slate-900/90 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <button
            @click="runTestcases(false)"
            :disabled="isRunning"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-white/10 disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <svg v-if="isRunning && !isSubmitting" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ (isRunning && !isSubmitting) ? 'Đang chạy...' : 'Chạy Testcases' }}
          </button>
        </div>

        <button
          @click="submitSolution"
          :disabled="isSubmitting"
          class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSubmitting ? 'Đang chấm điểm...' : 'Nộp Bài (Submit)' }}</span>
          <svg v-if="!isSubmitting" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { CodeLabTask } from '../types/lesson.types';
import { executeInSandbox } from '../../code-to-visualization/engine/WorkerLifecycleCoordinator';

const props = withDefaults(defineProps<{
  problemTitle?: string;
  task?: CodeLabTask;
}>(), {
  problemTitle: 'Thực hành Lập trình'
});

const emit = defineEmits<{
  (e: 'completeLesson'): void;
}>();

const activeTab = ref('problem');
const showSolution = ref(false);
const isRunning = ref(false);
const isSubmitting = ref(false);

const problemTabs = [
  { id: 'problem', name: 'Đề Bài' },
  { id: 'testcases', name: 'Testcases' },
  { id: 'solution', name: 'Giải Pháp' }
];

const userCode = ref('');
const testResults = ref<Array<{ passed: boolean, actualOutput?: string }>>([]);

watch(() => props.task, (newTask) => {
  if (newTask && !userCode.value) {
    userCode.value = newTask.initialCode;
  }
}, { immediate: true });

function resetCode(): void {
  if (props.task) {
    userCode.value = props.task.initialCode;
  }
}

async function runTestcases(isSubmit: boolean = false): Promise<void> {
  if (!props.task || !props.task.testCases) return;
  
  isRunning.value = true;
  activeTab.value = 'testcases';
  testResults.value = []; 
  
  const results = [];
  
  
  
  const wrappedCode = `
    ${userCode.value}
    
    var res = null;
    if (typeof quickSort === 'function') {
      res = quickSort(arr);
    } else if (typeof solution === 'function') {
      res = solution(arr);
    }
    
    // Nếu hàm trả về mảng mới thay vì mutate in-place, copy nó ngược lại arr
    if (res && res !== arr && Array.isArray(res)) {
      arr.length = 0;
      for (var i = 0; i < res.length; i++) {
        arr.push(res[i]);
      }
    }
  `;

  for (const tc of props.task.testCases) {
    
    if (!isSubmit && tc.isHidden) {
      results.push({ passed: false, actualOutput: 'Bỏ qua (Chưa submit)' });
      continue;
    }

    try {
      const inputArr = JSON.parse(tc.input);
      
      const expectedStr = tc.expectedOutput.replace(/\s+/g, '');
      
      const frames = await executeInSandbox(wrappedCode, inputArr, 2000);
      
      
      const finalState = frames[frames.length - 1]?.arrayState || inputArr;
      const actualStr = JSON.stringify(finalState).replace(/\s+/g, '');
      
      results.push({
        passed: actualStr === expectedStr,
        actualOutput: JSON.stringify(finalState)
      });
    } catch (e) {
      results.push({ passed: false, actualOutput: (e as Error).message || 'Runtime Error' });
    }
  }

  testResults.value = results;
  isRunning.value = false;
}

async function submitSolution(): Promise<void> {
  isSubmitting.value = true;
  await runTestcases(true); 
  isSubmitting.value = false;
  
  const allPassed = testResults.value.every(r => r.passed);
  if (allPassed && testResults.value.length > 0) {
    emit('completeLesson');
  } else {
    activeTab.value = 'testcases';
    alert('Có testcase bị sai hoặc lỗi biên dịch, hãy kiểm tra lại!');
  }
}
</script>
