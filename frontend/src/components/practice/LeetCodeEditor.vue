<template>
  <div class="leetcode-editor flex flex-col h-full w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
    
    <!-- Header -->
    <div class="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
      <div class="flex items-center gap-4">
        <h3 class="text-slate-200 font-bold">Thử thách Code</h3>
        <select v-model="language" class="bg-slate-800 border border-slate-700 text-sm text-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500">
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python">Python 3</option>
          <option value="js">JavaScript</option>
        </select>
      </div>
      <button 
        @click="submit"
        :disabled="submitting || !code"
        class="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow disabled:opacity-50 transition"
      >
        {{ submitting ? 'Đang chạy...' : '▶ Run Code' }}
      </button>
    </div>

    <!-- Main Editor Area -->
    <div class="flex-1 flex flex-col lg:flex-row min-h-[400px]">
      
      <!-- Code Editor (Fallback Textarea if Monaco not ready) -->
      <div class="flex-1 border-r border-slate-800 relative">
        <textarea 
          v-model="code"
          class="w-full h-full bg-[#1e1e1e] text-slate-300 font-mono text-sm p-4 outline-none resize-none custom-scrollbar"
          placeholder="Viết code của bạn vào đây..."
          spellcheck="false"
        ></textarea>
        <!-- Temporary Overlay for UX -->
        <div class="absolute top-2 right-4 text-[10px] text-slate-500 font-mono uppercase">Basic Editor</div>
      </div>

      <!-- Result Panel -->
      <div class="w-full lg:w-1/3 bg-slate-900 flex flex-col custom-scrollbar overflow-y-auto">
        <div class="p-3 border-b border-slate-800 bg-slate-950/50">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Results</h4>
        </div>
        
        <div class="p-4 flex-1">
          <div v-if="!result && !submitting" class="h-full flex flex-col items-center justify-center text-slate-600">
            <span class="text-3xl mb-2">💻</span>
            <p class="text-sm text-center">Bấm Run Code để chạy test cases trên server (Judge0).</p>
          </div>
          
          <div v-else-if="submitting" class="h-full flex flex-col items-center justify-center text-indigo-400">
            <div class="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
            <p class="text-sm">Đang chấm điểm...</p>
          </div>

          <div v-else-if="result" class="space-y-4">
            <!-- Summary -->
            <div 
              class="p-4 rounded-xl border text-center"
              :class="result.passed ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-rose-900/20 border-rose-500/30'"
            >
              <h2 
                class="text-2xl font-black mb-1"
                :class="result.passed ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ result.result === 'AC' ? 'Accepted' : result.result }}
              </h2>
              <p class="text-sm text-slate-300">
                Testcases passed: <span class="font-bold">{{ result.passedTestcases }}/{{ result.totalTestcases }}</span>
              </p>
              <div v-if="result.passed" class="mt-2 text-xs text-slate-400 flex justify-center gap-3">
                <span>⏱ {{ result.runtimeMs }} ms</span>
                <span>💾 {{ (result.memoryKb / 1024).toFixed(1) }} MB</span>
              </div>
            </div>

            <!-- Error Details -->
            <div v-if="result.result === 'CE'" class="bg-rose-950/30 border border-rose-900 rounded-lg p-3">
              <h5 class="text-rose-400 text-xs font-bold mb-2">LỖI BIÊN DỊCH:</h5>
              <pre class="text-rose-300 text-xs font-mono whitespace-pre-wrap">{{ result.compilerOutput }}</pre>
            </div>

            <div v-else-if="result.result === 'WA' && result.failedTestcase" class="bg-rose-950/30 border border-rose-900 rounded-lg p-3 space-y-2">
              <h5 class="text-rose-400 text-xs font-bold">WRONG ANSWER (Test #{{ result.failedTestcase }})</h5>
              <div>
                <span class="text-slate-500 text-[10px]">EXPECTED:</span>
                <div class="bg-slate-900 px-2 py-1 rounded border border-slate-700 text-emerald-300 font-mono text-xs">{{ result.expected }}</div>
              </div>
              <div>
                <span class="text-slate-500 text-[10px]">GOT:</span>
                <div class="bg-slate-900 px-2 py-1 rounded border border-slate-700 text-rose-300 font-mono text-xs">{{ result.got }}</div>
              </div>
            </div>

            <div v-else-if="result.result === 'TLE'" class="bg-amber-950/30 border border-amber-900 rounded-lg p-3">
              <h5 class="text-amber-400 text-xs font-bold">TIME LIMIT EXCEEDED</h5>
              <p class="text-slate-300 text-xs mt-1">Chương trình chạy quá {{ result.timeLimitMs }}ms (Thực tế: {{ result.actualMs }}ms).</p>
            </div>
            
            <button v-if="result.passed" @click="$emit('continue')" class="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition">
              Hoàn thành Practice Ladder 🎉
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const props = defineProps({
  nodeId: { type: String, required: true },
  sessionId: { type: String, required: true }
});

const emit = defineEmits(['continue', 'update-status']);

const code = ref('// Viết code thuật toán của bạn tại đây\n');
const language = ref('python');
const submitting = ref(false);
const result = ref<any>(null);

const submit = async () => {
  submitting.value = true;
  result.value = null;
  
  try {
    const res = await fetch(`${API_BASE}/api/v1/nodes/${props.nodeId}/leetcode/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        sessionId: props.sessionId,
        sourceCode: code.value,
        language: language.value
      })
    });
    
    if (res.ok) {
      result.value = await res.json();
      if (result.value?.passed) emit('update-status');
    } else {
      if (res.status === 403) alert("Vui lòng hoàn thành Lab trước.");
      else alert("Lỗi khi nộp bài");
    }
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};
</script>
