<template>
  <div class="leetcode-editor flex flex-col h-full w-full bg-bg-secondary border border-border-default rounded-2xl overflow-hidden">
    
    <!-- Header -->
    <div class="bg-bg-primary px-4 py-3 border-b border-border-default flex justify-between items-center flex-shrink-0">
      <div class="flex items-center gap-4">
        <h3 class="text-text-primary font-bold">Thử thách Code</h3>
        <select v-model="language" class="bg-bg-hover border border-border-default text-sm text-text-secondary rounded px-2 py-1 outline-none focus:border-border-accent">
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="python">Python 3</option>
          <option value="js">JavaScript</option>
        </select>
      </div>
      <button 
        @click="submit"
        :disabled="submitting || !code"
        class="px-5 py-1.5 bg-accent-green hover:bg-accent-green text-text-primary font-bold rounded shadow disabled:opacity-50 transition"
      >
        {{ submitting ? 'Đang chạy...' : 'Run Code' }} <BaseIcon name="play" class="w-3.5 h-3.5 inline-block ml-1 align-text-bottom" />
      </button>
    </div>

    <!-- Main Editor Area -->
    <div class="flex-1 flex flex-col lg:flex-row min-h-[400px]">
      
      <!-- Code Editor (Fallback Textarea if Monaco not ready) -->
      <div class="flex-1 border-r border-border-default relative">
        <textarea 
          v-model="code"
          class="w-full h-full bg-[#1e1e1e] text-text-secondary font-mono text-sm p-4 outline-none resize-none custom-scrollbar"
          placeholder="Viết code của bạn vào đây..."
          spellcheck="false"
        ></textarea>
        <!-- Temporary Overlay for UX -->
        <div class="absolute top-2 right-4 text-[10px] text-text-muted font-mono uppercase">Basic Editor</div>
      </div>

      <!-- Result Panel -->
      <div class="w-full lg:w-1/3 bg-bg-secondary flex flex-col custom-scrollbar overflow-y-auto">
        <div class="p-3 border-b border-border-default bg-bg-primary/50">
          <h4 class="text-xs font-bold text-text-secondary uppercase tracking-wider">Test Results</h4>
        </div>
        
        <div class="p-4 flex-1">
          <div v-if="!result && !submitting" class="h-full flex flex-col items-center justify-center text-text-muted">
            <BaseIcon name="code-ide" class="w-8 h-8 mb-2 text-text-muted" />
            <p class="text-sm text-center">Bấm Run Code để chạy test cases trên server (Judge0).</p>
          </div>
          
          <div v-else-if="submitting" class="h-full flex flex-col items-center justify-center text-accent">
            <div class="w-8 h-8 border-4 border-border-accent border-t-indigo-500 rounded-full animate-spin mb-3"></div>
            <p class="text-sm">Đang chấm điểm...</p>
          </div>

          <div v-else-if="result" class="space-y-4">
            <!-- Summary -->
            <div 
              class="p-4 rounded-xl border text-center"
              :class="result.passed ? 'bg-emerald-900/20 border-accent-green/30' : 'bg-rose-900/20 border-accent-red/30'"
            >
              <h2 
                class="text-2xl font-black mb-1"
                :class="result.passed ? 'text-accent-green' : 'text-accent-red'"
              >
                {{ result.result === 'AC' ? 'Accepted' : result.result }}
              </h2>
              <p class="text-sm text-text-secondary">
                Testcases passed: <span class="font-bold">{{ result.passedTestcases }}/{{ result.totalTestcases }}</span>
              </p>
              <div v-if="result.passed" class="mt-2 text-xs text-text-secondary flex justify-center gap-3">
                <span><BaseIcon name="clock" class="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> {{ result.runtimeMs }} ms</span>
                <span><BaseIcon name="save" class="w-3.5 h-3.5 inline-block mr-0.5 align-text-bottom" /> {{ (result.memoryKb / 1024).toFixed(1) }} MB</span>
              </div>
            </div>

            <!-- Error Details -->
            <div v-if="result.result === 'CE'" class="bg-accent-red/20 border border-accent-red/40 rounded-lg p-3">
              <h5 class="text-accent-red text-xs font-bold mb-2">LỖI BIÊN DỊCH:</h5>
              <pre class="text-accent-red text-xs font-mono whitespace-pre-wrap">{{ result.compilerOutput }}</pre>
            </div>

            <div v-else-if="result.result === 'WA' && result.failedTestcase" class="bg-accent-red/20 border border-accent-red/40 rounded-lg p-3 space-y-2">
              <h5 class="text-accent-red text-xs font-bold">WRONG ANSWER (Test #{{ result.failedTestcase }})</h5>
              <div>
                <span class="text-text-muted text-[10px]">EXPECTED:</span>
                <div class="bg-bg-secondary px-2 py-1 rounded border border-border-default text-accent-green font-mono text-xs">{{ result.expected }}</div>
              </div>
              <div>
                <span class="text-text-muted text-[10px]">GOT:</span>
                <div class="bg-bg-secondary px-2 py-1 rounded border border-border-default text-accent-red font-mono text-xs">{{ result.got }}</div>
              </div>
            </div>

            <div v-else-if="result.result === 'TLE'" class="bg-accent-warm/20 border border-accent-warm/40 rounded-lg p-3">
              <h5 class="text-accent-warm text-xs font-bold">TIME LIMIT EXCEEDED</h5>
              <p class="text-text-secondary text-xs mt-1">Chương trình chạy quá {{ result.timeLimitMs }}ms (Thực tế: {{ result.actualMs }}ms).</p>
            </div>
            
            <button v-if="result.passed" @click="$emit('continue')" class="w-full py-3 mt-4 bg-accent hover:bg-accent text-text-primary font-bold rounded-lg transition">
              Hoàn thành Practice Ladder <BaseIcon name="party-popper" class="w-4 h-4 inline-block ml-1 align-text-bottom" />
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
