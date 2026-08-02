<template>
  <div class="lesson-step-quiz flex flex-col h-full overflow-y-auto p-6 text-text-primary font-sans max-w-3xl mx-auto w-full">
    
    <div class="border-b border-border-default pb-4 mb-6 text-center">
      <div class="flex items-center justify-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
        <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>Bước 3 / 4</span>
      </div>
      <h2 class="text-xl font-extrabold text-text-primary mt-1">Kiểm Tra Nhận Thức Nhanh</h2>
      <p class="text-xs text-text-secondary mt-1">Hoàn thành bài Quiz (đạt ≥ 70%) để mở khóa phần Code Lab.</p>
    </div>

    
    <div v-if="questions && questions.length > 0" class="flex flex-col gap-6 flex-1">
      <div
        v-for="(q, qIdx) in questions"
        :key="q.id"
        class="bg-bg-secondary/80 border border-border-default rounded-2xl p-5 shadow-lg"
        :class="{'border-accent-green/50 bg-accent-green/20': isSubmitted && userAnswers[q.id] === q.correctIndex, 'border-accent-red/50 bg-accent-red/20': isSubmitted && userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctIndex}"
      >
        <div class="flex items-start gap-3 mb-4">
          <span class="w-6 h-6 rounded-full bg-accent/30 border border-border-accent/50 text-accent font-bold text-xs flex items-center justify-center shrink-0">
            {{ qIdx + 1 }}
          </span>
          <p class="text-sm font-bold text-text-primary leading-relaxed">{{ q.questionText }}</p>
        </div>

        <div class="grid grid-cols-1 gap-2.5 ml-9">
          <button
            v-for="(opt, oIdx) in q.options"
            :key="oIdx"
            @click="!isSubmitted && (userAnswers[q.id] = oIdx)"
            class="px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between"
            :class="[
              userAnswers[q.id] === oIdx && !isSubmitted ? 'bg-accent text-text-primary border-border-accent shadow-md' : '',
              !isSubmitted && userAnswers[q.id] !== oIdx ? 'bg-bg-primary/60 text-text-secondary border-border-default hover:border-border-strong hover:bg-bg-hover cursor-pointer' : '',
              isSubmitted && oIdx === q.correctIndex ? 'bg-accent-green text-text-primary border-emerald-400 shadow-md' : '',
              isSubmitted && userAnswers[q.id] === oIdx && oIdx !== q.correctIndex ? 'bg-accent-red text-text-primary border-accent-red shadow-md' : '',
              isSubmitted && oIdx !== q.correctIndex && userAnswers[q.id] !== oIdx ? 'bg-bg-primary/60 text-text-muted border-border-default opacity-50 cursor-default' : ''
            ]"
            :disabled="isSubmitted"
          >
            <span>{{ opt }}</span>
            <span v-if="userAnswers[q.id] === oIdx && !isSubmitted" class="text-sm"><BaseIcon name="check" class="w-3.5 h-3.5 text-accent" /></span>
            <span v-if="isSubmitted && oIdx === q.correctIndex" class="text-sm font-bold"><BaseIcon name="check" class="w-3.5 h-3.5 text-accent-green" /></span>
            <span v-if="isSubmitted && userAnswers[q.id] === oIdx && oIdx !== q.correctIndex" class="text-sm font-bold"><BaseIcon name="close" class="w-3.5 h-3.5 text-accent-red" /></span>
          </button>
        </div>

        
        <div v-if="isSubmitted" class="mt-4 ml-9 p-3 rounded-xl border bg-bg-primary/80 text-xs leading-relaxed"
          :class="userAnswers[q.id] === q.correctIndex ? 'border-accent-green/30 text-accent-green' : 'border-accent-red/30 text-accent-red'"
        >
          <span class="font-bold uppercase tracking-wider mr-1">{{ userAnswers[q.id] === q.correctIndex ? 'Chính xác:' : 'Chưa đúng:' }}</span>
          {{ q.explanation }}
        </div>
      </div>

      
      <div class="mt-4 p-5 rounded-2xl bg-bg-secondary border border-border-default flex items-center justify-between">
        <div v-if="!isSubmitted">
          <span class="text-xs font-semibold text-text-secondary">Đã chọn {{ answeredCount }} / {{ questions.length }} câu hỏi</span>
        </div>
        <div v-else>
          <span class="text-sm font-bold" :class="quizPassed ? 'text-accent-green' : 'text-accent-red'">
            Điểm số: {{ quizScore }} / {{ questions.length }} ({{ Math.round((quizScore || 0) / questions.length * 100) }}%)
          </span>
          <span v-if="bestScore > 0" class="ml-3 text-xs text-text-secondary bg-bg-hover px-2 py-1 rounded-lg">
            Cao nhất: {{ bestScore }} / {{ questions.length }}
          </span>
          <p class="text-[11px] text-text-secondary mt-1">
            {{ quizPassed ? 'Chúc mừng! Bạn đã đủ điều kiện chuyển sang phần Code Lab.' : 'Bạn chưa đạt điểm yêu cầu (70%). Hãy thử lại!' }}
          </p>
        </div>
        
        <div class="flex gap-3">
          <button
            v-if="isSubmitted"
            @click="resetQuiz"
            class="px-5 py-3 bg-bg-hover hover:bg-bg-hover text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Làm lại
          </button>
          
          <button
            v-if="!isSubmitted"
            @click="submitQuiz"
            class="px-6 py-3 bg-accent hover:bg-accent text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Nộp Bài Quiz
          </button>
          
          <button
            v-if="isSubmitted && quizPassed"
            @click="$emit('completeStep')"
            class="px-6 py-3 bg-accent-green hover:bg-accent-green text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Mở Khóa Code Lab <BaseIcon name="arrow-right" class="w-3.5 h-3.5 inline-block ml-0.5 align-text-bottom" />
          </button>
        </div>
      </div>
    </div>

    
    <div v-else class="flex flex-col items-center justify-center flex-1 text-center py-12">
      <div class="text-text-secondary">Không có câu hỏi nào.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { QuizQuestion } from '../types/lesson.types';

const props = defineProps<{
  questions: QuizQuestion[];
  quizPassed: boolean;
  quizScore: number | null;
  bestScore: number;
}>();

const emit = defineEmits<{
  (e: 'submit', answers: Record<string, number>): void;
  (e: 'completeStep'): void;
  (e: 'reset'): void;
}>();

const userAnswers = ref<Record<string, number>>({});
const isSubmitted = computed(() => props.quizScore !== null);

const answeredCount = computed(() => Object.keys(userAnswers.value).length);

function submitQuiz(): void {
  if (answeredCount.value < props.questions.length) {
    const isConfirmed = confirm('Bạn chưa chọn hết đáp án. Các câu bỏ trống sẽ bị tính là sai. Bạn có chắc chắn muốn nộp?');
    if (!isConfirmed) return;
  }
  emit('submit', userAnswers.value);
}

function resetQuiz(): void {
  userAnswers.value = {};
  emit('submit', {}); 
  
  emit('reset');
}
</script>
