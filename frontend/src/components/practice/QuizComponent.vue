<template>
  <div class="quiz-container bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full">
    <div v-if="loading" class="text-slate-400 text-center py-10">Đang tải câu hỏi...</div>
    
    <div v-else-if="questions.length > 0">
      <div v-if="!submitted" class="space-y-8">
        <div v-for="(q, index) in questions" :key="q.id" class="question-block">
          <h3 class="text-white font-semibold text-lg mb-4">Câu {{ index + 1 }}: {{ q.text }}</h3>
          <div class="space-y-3">
            <label 
              v-for="(opt, optIndex) in q.options" 
              :key="optIndex"
              class="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 cursor-pointer transition-colors"
              :class="{ 'ring-2 ring-indigo-500 bg-indigo-500/10': answers[index] === optIndex }"
            >
              <input 
                type="radio" 
                :name="'question_' + q.id" 
                :value="optIndex" 
                v-model="answers[index]"
                class="text-indigo-500 bg-slate-900 border-slate-600 focus:ring-indigo-500"
              >
              <span class="text-slate-300">{{ opt }}</span>
            </label>
          </div>
        </div>

        <button 
          @click="submit"
          :disabled="answers.some(a => a === null) || submitting"
          class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-50 transition"
        >
          {{ submitting ? 'Đang chấm điểm...' : 'Nộp bài Quiz' }}
        </button>
      </div>

      <!-- Result State -->
      <div v-else class="text-center py-8">
        <div class="text-6xl mb-4">{{ result.passed ? '🎉' : '💔' }}</div>
        <h2 class="text-2xl font-bold" :class="result.passed ? 'text-emerald-400' : 'text-rose-400'">
          {{ result.passed ? 'Bạn đã Vượt qua!' : 'Chưa đạt yêu cầu' }}
        </h2>
        <p class="text-slate-300 mt-2 text-lg">
          Điểm số: <span class="font-bold">{{ result.score }}%</span> ({{ result.correctCount }}/{{ result.totalCount }})
        </p>
        <p v-if="!result.passed" class="text-slate-400 mt-2">Cần tối thiểu 60% để qua màn. Lưu ý: Không bị trừ tim khi làm lại!</p>

        <div class="mt-8 flex justify-center gap-4">
          <button v-if="!result.passed" @click="retry" class="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition">
            Làm lại
          </button>
          <button v-if="result.passed" @click="$emit('continue')" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition">
            Tiếp tục đến Lab 🧪
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-10 text-slate-500">
      Không có câu hỏi nào cho bài học này.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const props = defineProps({
  nodeId: { type: String, required: true },
  sessionId: { type: String, required: true }
});

const emit = defineEmits(['continue', 'update-status']);

const loading = ref(true);
const submitting = ref(false);
const submitted = ref(false);
const questions = ref<any[]>([]);
const answers = ref<any[]>([]);
const result = ref<any>(null);

onMounted(async () => {
  // Mock fetching questions
  setTimeout(() => {
    questions.value = [
      { id: 'q1', text: 'Stack hoạt động theo nguyên tắc nào?', options: ['FIFO', 'LIFO', 'LILO', 'Ngẫu nhiên'] },
      { id: 'q2', text: 'Thao tác thêm phần tử vào Stack gọi là gì?', options: ['Pop', 'Push', 'Peek', 'Enqueue'] },
      { id: 'q3', text: 'Thao tác lấy phần tử khỏi Stack gọi là gì?', options: ['Dequeue', 'Push', 'Pop', 'Remove'] }
    ];
    answers.value = new Array(questions.value.length).fill(null);
    loading.value = false;
  }, 800);
});

const submit = async () => {
  submitting.value = true;
  try {
    const res = await fetch(`${API_BASE}/api/v1/nodes/${props.nodeId}/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        sessionId: props.sessionId,
        answers: answers.value
      })
    });
    
    if (res.ok) {
      result.value = await res.json();
      submitted.value = true;
      emit('update-status');
    } else {
      alert("Lỗi khi nộp bài");
    }
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const retry = () => {
  submitted.value = false;
  answers.value = new Array(questions.value.length).fill(null);
};
</script>
