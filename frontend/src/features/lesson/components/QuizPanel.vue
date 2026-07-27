<template>
  <div class="lesson-step-quiz flex flex-col h-full overflow-y-auto p-6 text-slate-200 font-sans max-w-3xl mx-auto w-full">
    <!-- Header -->
    <div class="border-b border-white/10 pb-4 mb-6 text-center">
      <div class="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
        <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>Bước 3 / 4</span>
      </div>
      <h2 class="text-xl font-extrabold text-white mt-1">Kiểm Tra Nhận Thức Nhanh</h2>
      <p class="text-xs text-slate-400 mt-1">Hoàn thành bài Quiz (đạt ≥ 70%) để mở khóa phần Code Lab.</p>
    </div>

    <!-- Questions list -->
    <div v-if="questions && questions.length > 0" class="flex flex-col gap-6 flex-1">
      <div
        v-for="(q, qIdx) in questions"
        :key="q.id"
        class="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-lg"
        :class="{'border-emerald-500/50 bg-emerald-950/20': isSubmitted && userAnswers[q.id] === q.correctIndex, 'border-rose-500/50 bg-rose-950/20': isSubmitted && userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctIndex}"
      >
        <div class="flex items-start gap-3 mb-4">
          <span class="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
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
              userAnswers[q.id] === oIdx && !isSubmitted ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' : '',
              !isSubmitted && userAnswers[q.id] !== oIdx ? 'bg-slate-950/60 text-slate-300 border-white/10 hover:border-white/20 hover:bg-slate-800 cursor-pointer' : '',
              isSubmitted && oIdx === q.correctIndex ? 'bg-emerald-600 text-white border-emerald-400 shadow-md' : '',
              isSubmitted && userAnswers[q.id] === oIdx && oIdx !== q.correctIndex ? 'bg-rose-600 text-white border-rose-400 shadow-md' : '',
              isSubmitted && oIdx !== q.correctIndex && userAnswers[q.id] !== oIdx ? 'bg-slate-950/60 text-slate-500 border-white/5 opacity-50 cursor-default' : ''
            ]"
            :disabled="isSubmitted"
          >
            <span>{{ opt }}</span>
            <span v-if="userAnswers[q.id] === oIdx && !isSubmitted" class="text-sm">✓</span>
            <span v-if="isSubmitted && oIdx === q.correctIndex" class="text-sm font-bold">✓</span>
            <span v-if="isSubmitted && userAnswers[q.id] === oIdx && oIdx !== q.correctIndex" class="text-sm font-bold">✕</span>
          </button>
        </div>

        <!-- Explanation after submit -->
        <div v-if="isSubmitted" class="mt-4 ml-9 p-3 rounded-xl border bg-slate-950/80 text-xs leading-relaxed"
          :class="userAnswers[q.id] === q.correctIndex ? 'border-emerald-500/30 text-emerald-200' : 'border-rose-500/30 text-rose-200'"
        >
          <span class="font-bold uppercase tracking-wider mr-1">{{ userAnswers[q.id] === q.correctIndex ? 'Chính xác:' : 'Chưa đúng:' }}</span>
          {{ q.explanation }}
        </div>
      </div>

      <!-- Result / Submit -->
      <div class="mt-4 p-5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
        <div v-if="!isSubmitted">
          <span class="text-xs font-semibold text-slate-400">Đã chọn {{ answeredCount }} / {{ questions.length }} câu hỏi</span>
        </div>
        <div v-else>
          <span class="text-sm font-bold" :class="quizPassed ? 'text-emerald-400' : 'text-rose-400'">
            Điểm số: {{ quizScore }} / {{ questions.length }} ({{ Math.round((quizScore || 0) / questions.length * 100) }}%)
          </span>
          <span v-if="bestScore > 0" class="ml-3 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
            Cao nhất: {{ bestScore }} / {{ questions.length }}
          </span>
          <p class="text-[11px] text-slate-400 mt-1">
            {{ quizPassed ? 'Chúc mừng! Bạn đã đủ điều kiện chuyển sang phần Code Lab.' : 'Bạn chưa đạt điểm yêu cầu (70%). Hãy thử lại!' }}
          </p>
        </div>
        
        <div class="flex gap-3">
          <button
            v-if="isSubmitted"
            @click="resetQuiz"
            class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Làm lại
          </button>
          
          <button
            v-if="!isSubmitted"
            @click="submitQuiz"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Nộp Bài Quiz
          </button>
          
          <button
            v-if="isSubmitted && quizPassed"
            @click="$emit('completeStep')"
            class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Mở Khóa Code Lab →
          </button>
        </div>
      </div>
    </div>

    <!-- Fallback default question if none loaded -->
    <div v-else class="flex flex-col items-center justify-center flex-1 text-center py-12">
      <div class="text-slate-400">Không có câu hỏi nào.</div>
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
  emit('submit', {}); // This will reset score if parent handles empty object appropriately, wait better to add a reset event or handle in store.
  // Actually, parent can just set score to null.
  emit('reset');
}
</script>
