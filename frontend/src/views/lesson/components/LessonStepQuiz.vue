<template>
  <div class="lesson-step-quiz flex flex-col h-full overflow-y-auto p-6 text-text-primary font-sans max-w-3xl mx-auto w-full">
    <div class="border-b border-border-subtle pb-4 mb-6 text-center">
      <div class="flex items-center justify-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider">
        <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>Bước 3 / 4</span>
      </div>
      <h2 class="text-xl font-extrabold text-white mt-1">Kiểm Tra Nhận Thức Nhanh</h2>
      <p class="text-xs text-text-muted mt-1">Hoàn thành bài Quiz (đạt ≥ 70%) để mở khóa phần Code Lab.</p>
    </div>

    <div v-if="questions.length > 0" class="flex flex-col gap-6 flex-1">
      <div
        v-for="(q, qIdx) in questions"
        :key="q.id"
        class="bg-bg-secondary border border-border-subtle rounded-2xl p-5 shadow-lg"
        :class="{'border-accent-green/50 bg-accent-green/20': isSubmitted && userAnswers[q.id] === q.correctIndex, 'border-accent-red/50 bg-accent-red/20': isSubmitted && userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctIndex}"
      >
        <div class="flex items-start gap-3 mb-4">
          <span class="w-6 h-6 rounded-full bg-accent/30 border border-accent/50 text-accent font-bold text-xs flex items-center justify-center shrink-0">
            {{ qIdx + 1 }}
          </span>
          <p class="text-sm font-bold text-white leading-relaxed">{{ q.questionText }}</p>
        </div>

        <div class="grid grid-cols-1 gap-2.5 ml-9">
          <button
            v-for="(opt, oIdx) in q.options"
            :key="oIdx"
            @click="!isSubmitted && (userAnswers[q.id] = oIdx)"
            class="px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between"
            :class="[
              userAnswers[q.id] === oIdx && !isSubmitted ? 'bg-accent text-white border-accent shadow-md' : '',
              !isSubmitted && userAnswers[q.id] !== oIdx ? 'bg-bg-secondary text-text-secondary border-border-subtle hover:border-border-default hover:bg-bg-surface cursor-pointer' : '',
              isSubmitted && oIdx === q.correctIndex ? 'bg-accent-green text-white border-accent-green shadow-md' : '',
              isSubmitted && userAnswers[q.id] === oIdx && oIdx !== q.correctIndex ? 'bg-accent-red text-white border-accent-red shadow-md' : '',
              isSubmitted && oIdx !== q.correctIndex && userAnswers[q.id] !== oIdx ? 'bg-bg-secondary text-text-muted border-border-subtle opacity-50 cursor-default' : ''
            ]"
            :disabled="isSubmitted"
          >
            <span>{{ opt }}</span>
            <span v-if="userAnswers[q.id] === oIdx && !isSubmitted" class="text-sm"><BaseIcon name="check" class="w-3.5 h-3.5" /></span>
            <span v-if="isSubmitted && oIdx === q.correctIndex" class="text-sm font-bold"><BaseIcon name="check" class="w-3.5 h-3.5" /></span>
            <span v-if="isSubmitted && userAnswers[q.id] === oIdx && oIdx !== q.correctIndex" class="text-sm font-bold"><BaseIcon name="close" class="w-3.5 h-3.5" /></span>
          </button>
        </div>

        <div v-if="isSubmitted" class="mt-4 ml-9 p-3 rounded-xl border bg-bg-secondary text-xs leading-relaxed"
          :class="userAnswers[q.id] === q.correctIndex ? 'border-accent-green/30 text-accent-green' : 'border-accent-red/30 text-accent-red'"
        >
          <span class="font-bold uppercase tracking-wider mr-1">{{ userAnswers[q.id] === q.correctIndex ? 'Chính xác:' : 'Chưa đúng:' }}</span>
          {{ q.explanation || (userAnswers[q.id] === q.correctIndex ? 'Đáp án đúng!' : `Đáp án đúng là: ${q.options[q.correctIndex] ?? '(không xác định)'}`) }}
        </div>
      </div>

      <div class="mt-4 p-5 rounded-2xl bg-bg-secondary border border-border-subtle flex items-center justify-between">
        <div v-if="!isSubmitted">
          <span class="text-xs font-semibold text-text-muted">Đã chọn {{ answeredCount }} / {{ questions.length }} câu hỏi</span>
        </div>
        <div v-else>
          <span class="text-sm font-bold" :class="quizPassed ? 'text-accent-green' : 'text-accent-red'">
            Điểm số: {{ quizScore }} / {{ questions.length }} ({{ Math.round((quizScore || 0) / questions.length * 100) }}%)
          </span>
          <p class="text-[11px] text-text-muted mt-1">
            {{ quizPassed ? 'Chúc mừng! Bạn đã đủ điều kiện chuyển sang phần Code Lab.' : 'Bạn chưa đạt điểm yêu cầu (70%). Hãy thử lại!' }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            v-if="isSubmitted"
            @click="resetQuiz"
            class="px-5 py-3 bg-bg-surface hover:bg-bg-hover text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Làm lại
          </button>

          <button
            v-if="!isSubmitted"
            @click="submitQuiz"
            class="px-6 py-3 bg-accent hover:bg-accent text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Nộp Bài Quiz
          </button>

          <button
            v-if="isSubmitted && quizPassed"
            @click="completeStep"
            class="px-6 py-3 bg-accent-green hover:bg-accent-green text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Mở Khóa Code Lab <BaseIcon name="arrow-right" class="w-4 h-4 inline ml-1 align-middle" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center flex-1 text-center py-12">
      <div class="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent mb-4">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-white">Kiểm Tra Trắc Nghiệm</h3>
      <p class="text-xs text-text-muted mt-1 max-w-md">Không có câu hỏi nào cho bước này.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { QuizQuestion } from '../../../features/lesson/types/lesson.types';

const props = withDefaults(defineProps<{
  questions?: QuizQuestion[];
}>(), {
  questions: () => [],
});

const emit = defineEmits<{
  (e: 'submit', answers: Record<string, number>): void;
  (e: 'completeStep'): void;
}>();

const PASS_THRESHOLD = 0.7;

const userAnswers = ref<Record<string, number>>({});
const isSubmitted = ref(false);

const answeredCount = computed(() => Object.keys(userAnswers.value).length);

const quizScore = computed(() => {
  let score = 0;
  for (const q of props.questions) {
    if (userAnswers.value[q.id] === q.correctIndex) score++;
  }
  return score;
});

const quizPassed = computed(() => {
  if (props.questions.length === 0) return false;
  return quizScore.value / props.questions.length >= PASS_THRESHOLD;
});

function submitQuiz(): void {
  if (isSubmitted.value) return;
  if (answeredCount.value < props.questions.length) {
    const isConfirmed = window.confirm('Bạn chưa chọn hết đáp án. Các câu bỏ trống sẽ bị tính là sai. Bạn có chắc chắn muốn nộp?');
    if (!isConfirmed) return;
  }
  isSubmitted.value = true;
  emit('submit', { ...userAnswers.value });
}

function resetQuiz(): void {
  isSubmitted.value = false;
  userAnswers.value = {};
}

function completeStep(): void {
  if (!quizPassed.value || !isSubmitted.value) return;
  emit('completeStep');
}
</script>
