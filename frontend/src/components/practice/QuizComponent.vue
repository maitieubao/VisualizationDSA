<template>
  <div class="quiz-container bg-bg-secondary border border-border-default p-6 rounded-2xl w-full">
    <div v-if="loading" class="text-text-secondary text-center py-10">Đang tải câu hỏi...</div>
    
    <div v-else-if="questions.length > 0">
      <div v-if="!submitted" class="space-y-8">
        <div v-for="(q, index) in questions" :key="q.id" class="question-block">
          <h3 class="text-text-primary font-semibold text-lg mb-4">Câu {{ index + 1 }}: {{ q.text }}</h3>
          <div class="space-y-3">
            <label 
              v-for="(opt, optIndex) in q.options" 
              :key="optIndex"
              class="flex items-center gap-3 p-3 rounded-lg border border-border-default bg-bg-hover hover:bg-bg-hover cursor-pointer transition-colors"
              :class="{ 'ring-2 ring-accent bg-accent/10': answers[index] === optIndex }"
            >
              <input 
                type="radio" 
                :name="'question_' + q.id" 
                :value="optIndex" 
                v-model="answers[index]"
                class="text-accent bg-bg-secondary border-border-default focus:ring-accent"
              >
              <span class="text-text-secondary">{{ opt }}</span>
            </label>
          </div>
        </div>

        <button 
          @click="submit"
          :disabled="answers.some(a => a === null) || submitting"
          class="w-full py-4 bg-accent hover:bg-accent text-text-primary font-bold rounded-xl disabled:opacity-50 transition"
        >
          {{ submitting ? 'Đang chấm điểm...' : 'Nộp bài Quiz' }}
        </button>
      </div>

      <!-- Result State -->
      <div v-else class="text-center py-8">
        <div class="text-6xl mb-4"><BaseIcon :name="result.passed ? 'party-popper' : 'close'" class="w-16 h-16" :class="result.passed ? 'text-accent-green' : 'text-accent-red'" /></div>
        <h2 class="text-2xl font-bold" :class="result.passed ? 'text-accent-green' : 'text-accent-red'">
          {{ result.passed ? 'Bạn đã Vượt qua!' : 'Chưa đạt yêu cầu' }}
        </h2>
        <p class="text-text-secondary mt-2 text-lg">
          Điểm số: <span class="font-bold">{{ result.score }}%</span> ({{ result.correctCount }}/{{ result.totalCount }})
        </p>
        <p v-if="!result.passed" class="text-text-secondary mt-2">Cần tối thiểu 60% để qua màn. Lưu ý: Không bị trừ tim khi làm lại!</p>

        <div class="mt-8 flex justify-center gap-4">
          <button v-if="!result.passed" @click="retry" class="px-6 py-3 bg-bg-hover hover:bg-bg-hover text-text-primary font-bold rounded-xl transition">
            Làm lại
          </button>
          <button v-if="result.passed" @click="$emit('continue')" class="px-6 py-3 bg-accent-green hover:bg-accent-green text-text-primary font-bold rounded-xl transition">
            Tiếp tục đến Lab <BaseIcon name="arrow-right" class="w-4 h-4 inline-block ml-1 align-text-bottom" />
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-10 text-text-muted">
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
