<template>
  <div class="interactive-lab bg-bg-secondary border border-border-default p-6 rounded-2xl w-full">
    <div class="flex flex-col lg:flex-row gap-8">
      
      <!-- Visual Canvas Area (Mock) -->
      <div class="flex-1 bg-bg-primary rounded-xl border border-border-default flex items-center justify-center min-h-[300px] relative">
        <span class="text-text-muted font-mono">Visual Stack Representation</span>
        <div class="absolute bottom-4 left-4 right-4 flex flex-col-reverse gap-2 items-center">
          <div v-for="(item, i) in currentStack" :key="i" class="w-24 h-10 bg-accent/20 border border-border-accent rounded flex items-center justify-center text-accent-light font-bold">
            {{ item }}
          </div>
        </div>
      </div>

      <!-- Operations Area -->
      <div class="w-full lg:w-[350px] flex flex-col gap-6">
        <div>
          <h3 class="text-text-secondary font-bold mb-2">Thao tác khả dụng</h3>
          <p class="text-xs text-text-muted mb-3">Nhấp để thêm vào danh sách thực thi</p>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="op in availableOps" 
              :key="op"
              @click="addOperation(op)"
              class="px-3 py-1.5 bg-bg-hover hover:bg-bg-hover border border-border-default text-text-secondary rounded text-sm font-mono transition"
            >
              {{ op }}
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-text-secondary font-bold mb-2 flex justify-between">
            <span>Dãy lệnh của bạn</span>
            <button @click="reset" class="text-xs text-accent-red hover:text-accent-red">Xóa hết</button>
          </h3>
          
          <div class="min-h-[150px] bg-bg-primary rounded-lg p-3 border border-border-default space-y-2">
            <div 
              v-for="(op, index) in sequence" 
              :key="index"
              class="bg-accent-dark/40 border border-border-accent text-accent-light px-3 py-2 rounded text-sm font-mono flex justify-between items-center"
            >
              <span>{{ index + 1 }}. {{ op }}</span>
              <button @click="removeOperation(index)" class="text-text-muted hover:text-accent-red"><BaseIcon name="close" class="w-3 h-3" /></button>
            </div>
            <div v-if="sequence.length === 0" class="text-text-muted text-sm text-center py-4 italic">
              Trống
            </div>
          </div>
        </div>

        <!-- Submit & Result -->
        <div>
          <button 
            @click="submit"
            :disabled="sequence.length === 0 || submitting"
            class="w-full py-3 bg-accent hover:bg-accent text-text-primary font-bold rounded-xl disabled:opacity-50 transition"
          >
            {{ submitting ? 'Đang chấm...' : 'Thực thi & Nộp bài' }}
          </button>
          
          <div v-if="result" class="mt-4 p-4 rounded-xl text-sm" :class="result.passed ? 'bg-emerald-900/30 border border-accent-green/50' : 'bg-rose-900/30 border border-accent-red/50'">
            <div v-if="result.passed" class="text-accent-green font-bold flex flex-col items-center">
              <span><BaseIcon name="check-circle" class="w-4 h-4 inline-block mr-1 align-text-bottom" />Chính xác! Lab Completed.</span>
              <button @click="$emit('continue')" class="mt-3 px-4 py-2 bg-accent-green hover:bg-accent-green text-text-primary rounded-lg w-full">Tiếp tục đến LeetCode</button>
            </div>
            <div v-else class="text-accent-red">
              <span class="font-bold"><BaseIcon name="close" class="w-4 h-4 inline-block mr-1 align-text-bottom" />Lỗi ở bước {{ result.wrongAt }}:</span>
              <p class="mt-1">Kỳ vọng: <code class="bg-accent-red/20 px-1 rounded">{{ result.expectedOperation }}</code></p>
              <p>Thực tế: <code class="bg-accent-red/20 px-1 rounded">{{ result.yourOperation }}</code></p>
            </div>
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

const availableOps = ['push(5)', 'push(3)', 'pop()', 'peek()', 'size()'];
const sequence = ref<any[]>([]);
const currentStack = ref<any[]>([]);
const submitting = ref(false);
const result = ref<any>(null);

const addOperation = (op: any) => {
  sequence.value.push(op);
  updateVisualMock();
};

const removeOperation = (index: number) => {
  sequence.value.splice(index, 1);
  updateVisualMock();
};

const reset = () => {
  sequence.value = [];
  result.value = null;
  updateVisualMock();
};

// Mock visual update based on sequence
const updateVisualMock = () => {
  let temp: string[] = [];
  for (let op of sequence.value) {
    if (op.startsWith('push')) {
      const val = op.match(/\d+/)[0];
      temp.push(val);
    } else if (op === 'pop()') {
      temp.pop();
    }
  }
  currentStack.value = temp;
};

const submit = async () => {
  submitting.value = true;
  result.value = null;
  
  try {
    const res = await fetch(`${API_BASE}/api/v1/nodes/${props.nodeId}/lab/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        sessionId: props.sessionId,
        operations: sequence.value
      })
    });
    
    if (res.ok) {
      result.value = await res.json();
      if (result.value?.passed) emit('update-status');
    } else {
      if (res.status === 403) alert("Vui lòng hoàn thành Quiz trước.");
      else alert("Lỗi hệ thống");
    }
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};
</script>
