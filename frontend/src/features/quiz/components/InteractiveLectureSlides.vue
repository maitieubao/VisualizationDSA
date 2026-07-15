<template>
  <div class="interactive-panel">
    <!-- Tab Headers -->
    <div class="flex items-center justify-between border-b border-border-subtle pb-4">
      <div class="flex gap-2">
        <button 
          @click="activeTab = 'lecture'" 
          class="tab-btn lecture-tab" 
          :class="{ 'active': activeTab === 'lecture' }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10M6 10h10" /></svg>
          <span>Lý Thuyết & Đồng Bộ</span>
        </button>
        <button 
          @click="activeTab = 'quiz'" 
          class="tab-btn quiz-tab" 
          :class="{ 'active': activeTab === 'quiz' }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
          <span>Trắc Nghiệm Tương Tác</span>
        </button>
      </div>
      <div class="sprint-badge">Sprint 4 Active</div>
    </div>
    <!-- TAB 1: LECTURE SLIDES -->
    <LectureSlidesSection v-if="activeTab === 'lecture'" :current-slide-index="currentSlideIndex" :slides="slides" :active-slide="activeSlide" @sync="syncSlideWithVisualizer" @prev="prevSlide" @next="nextSlide" @jump="jumpToSlide" />
    <!-- TAB 2: INTERACTIVE QUIZ -->
    <InteractiveQuizSection v-else :quiz-questions="quizQuestions" :user-answers="userAnswers" :student-code="studentCode" :compliance-result="complianceResult" :score-result="scoreResult" @update-answer="(id, val) => userAnswers[id] = val" @update-code="(val) => studentCode = val" @run-compliance="runCodeComplianceCheck" @submit="submitAndGradeQuiz" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVcrStore } from '../../vcr-player/store/useVcrStore';
import { LecturePlaybackCoordinator, QuizEvaluationEngine, type QuizQuestion, type SlideEvent } from '../service/QuizEvaluationEngine';
import LectureSlidesSection from './LectureSlidesSection.vue';
import InteractiveQuizSection from './InteractiveQuizSection.vue';
import { INITIAL_SLIDES, QUIZ_QUESTIONS } from './quizConfig';

const vcrStore = useVcrStore();
const activeTab = ref<'lecture' | 'quiz'>('lecture');
const currentSlideIndex = ref<number>(0);
const slides = ref(INITIAL_SLIDES);
const activeSlide = computed(() => slides.value[currentSlideIndex.value]);
const quizQuestions = ref(QUIZ_QUESTIONS);
const userAnswers = ref<Record<string, string>>({ q1: '', q2: '', q3: '' });
const studentCode = ref<string>(`function swap(arr, i, j) {\n  let temp = arr[i];\n  arr[i] = arr[j];\n  arr[j] = temp;\n}`);
const complianceResult = ref<boolean | null>(null);
const scoreResult = ref<{ totalScore: number; passed: boolean } | null>(null);

const slideEvents: SlideEvent[] = slides.value.map(s => ({ slideId: s.slideId, triggerFrameIndex: s.triggerFrameIndex, highlightSourceLine: s.triggerFrameIndex }));
const coordinator = new LecturePlaybackCoordinator(slideEvents, (ev) => {
  const idx = slides.value.findIndex(s => s.slideId === ev.slideId);
  if (idx !== -1) currentSlideIndex.value = idx;
});

const autoSyncWithVisualizer = () => {
  const frameIndex = activeSlide.value.triggerFrameIndex;
  if (vcrStore.playbackFrames.length > 0) {
    vcrStore.jumpToFrame(Math.min(frameIndex, vcrStore.playbackFrames.length - 1));
  }
};

const prevSlide = () => { coordinator.prevSlide(); autoSyncWithVisualizer(); };
const nextSlide = () => { coordinator.nextSlide(); autoSyncWithVisualizer(); };
const jumpToSlide = (idx: number) => { if (idx >= 0 && idx < slides.value.length) { currentSlideIndex.value = idx; autoSyncWithVisualizer(); } };
const syncSlideWithVisualizer = () => {
  if (vcrStore.playbackFrames.length === 0) vcrStore.compileAndLoad();
  autoSyncWithVisualizer();
};

const runCodeComplianceCheck = () => {
  const isCompliant = QuizEvaluationEngine.verifyCodeCompliance(studentCode.value, ['temp', 'arr']);
  complianceResult.value = isCompliant;
  return isCompliant;
};

const submitAndGradeQuiz = () => {
  const questions: QuizQuestion[] = quizQuestions.value.map(q => ({ id: q.id, correctAnswer: q.correctAnswer, maxScore: q.maxScore }));
  const scoreEval = QuizEvaluationEngine.calculateQuizScore(userAnswers.value, questions);
  scoreResult.value = { totalScore: scoreEval.totalScore, passed: scoreEval.passed && runCodeComplianceCheck() };
};
</script>

<style scoped>
.interactive-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background-color: color-mix(in srgb, var(--vis-panel-bg) 70%, transparent);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid color-mix(in srgb, var(--color-border-subtle) 80%, transparent);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-xl);
  border: 1px solid transparent;
  background-color: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-smooth);
}

.tab-btn:hover {
  color: var(--color-text-primary);
}

.tab-btn.lecture-tab.active {
  color: var(--color-accent-cyan);
  background-color: var(--color-accent-cyan-dim);
  border-color: color-mix(in srgb, var(--color-accent-cyan) 40%, transparent);
  box-shadow: 0 0 12px var(--color-accent-cyan-glow);
}

.tab-btn.quiz-tab.active {
  color: var(--color-accent-green);
  background-color: var(--color-accent-green-dim);
  border-color: color-mix(in srgb, var(--color-accent-green) 40%, transparent);
  box-shadow: 0 0 12px var(--color-accent-green-glow);
}

.sprint-badge {
  font-size: 10px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-accent-blue-dim);
  border: 1px solid color-mix(in srgb, var(--color-accent-blue) 25%, transparent);
  color: var(--color-accent-blue-light);
  padding: 4px 8px;
  border-radius: var(--radius-lg);
}
</style>
