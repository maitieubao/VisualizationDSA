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
      <p class="text-xs text-text-secondary mt-1">Hoàn thành bài Quiz củng cố kiến thức để mở khóa phần Code Lab.</p>
    </div>

    
    <div v-if="questions.length > 0" class="flex flex-col gap-6 flex-1">
      <div
        v-for="(q, qIdx) in questions"
        :key="q.id"
        class="bg-bg-secondary/80 border border-border-default rounded-2xl p-5 shadow-lg"
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
            @click="userAnswers[q.id] = oIdx"
            class="px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between"
            :class="userAnswers[q.id] === oIdx
              ? 'bg-accent text-text-primary border-border-accent shadow-md'
              : 'bg-bg-primary/60 text-text-secondary border-border-default hover:border-border-strong hover:bg-bg-hover'"
          >
            <span>{{ opt }}</span>
            <span v-if="userAnswers[q.id] === oIdx" class="text-sm"><BaseIcon name="check" class="w-3.5 h-3.5 text-accent" /></span>
          </button>
        </div>
      </div>

      
      <div class="mt-4 p-5 rounded-2xl bg-bg-secondary border border-border-default flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-text-secondary">Đã chọn {{ answeredCount }} / {{ questions.length }} câu hỏi</span>
        </div>
        <button
          @click="submitQuiz"
          :disabled="answeredCount < questions.length"
          class="px-6 py-3 bg-accent hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
        >
          {{ isSubmitted ? 'Đã Đạt! Mở Khóa Code Lab' : 'Nộp Bài Quiz' }} <BaseIcon v-if="isSubmitted" name="arrow-right" class="w-3.5 h-3.5 inline-block ml-0.5 align-text-bottom" />
        </button>
      </div>
    </div>

    
    <div v-else class="flex flex-col items-center justify-center flex-1 text-center py-12">
      <div class="w-16 h-16 rounded-2xl bg-accent/20 border border-border-accent flex items-center justify-center text-accent mb-4">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 class="text-base font-bold text-text-primary">Kiểm Tra Trắc Nghiệm</h3>
      <p class="text-xs text-text-secondary mt-1 max-w-md">Bấm bên dưới để xác nhận bạn đã nắm vững kiến thức và tiến tới phần Code Lab.</p>
      <button
        @click="$emit('completeStep')"
        class="mt-6 px-6 py-3 bg-accent hover:bg-accent text-text-primary rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
      >
        Mở Khóa Code Lab <BaseIcon name="arrow-right" class="w-3.5 h-3.5 inline-block ml-0.5 align-text-bottom" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

export interface QuizQuestionItem {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
}

const props = withDefaults(defineProps<{
  questions?: QuizQuestionItem[];
}>(), {
  questions: () => [
    {
      id: 'q1',
      questionText: 'Độ phức tạp thời gian trung bình của thuật toán Bubble Sort là bao nhiêu?',
      options: ['O(1)', 'O(N log N)', 'O(N²)', 'O(N³)'],
      correctIndex: 2
    },
    {
      id: 'q2',
      questionText: 'Bubble Sort có phải là một thuật toán sắp xếp ổn định (Stable Sort) không?',
      options: ['Có, giữ nguyên thứ tự tương đối của các phần tử bằng nhau', 'Không, thay đổi thứ tự phần tử bằng nhau'],
      correctIndex: 0
    }
  ]
});

const emit = defineEmits<{
  (e: 'completeStep'): void;
}>();

const userAnswers = ref<Record<string, number>>({});
const isSubmitted = ref(false);

const answeredCount = computed(() => Object.keys(userAnswers.value).length);

function submitQuiz(): void {
  isSubmitted.value = true;
  emit('completeStep');
}
</script>
