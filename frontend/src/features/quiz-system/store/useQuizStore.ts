import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLectureStore } from '../../e-lecture/store/useLectureStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { QuizVerificationEngine } from '../engine/QuizVerificationEngine';
import { QuizStatsManager } from '../engine/QuizStatsManager';
import type { QuizQuestion, QuizCheckpoint, CanvasNodeDTO } from '../types/quiz.types';
import { submitQuizAttempt } from '../service/quizApi';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { resetActiveQuestionState, verifyAndRecordOption } from './quizStoreHelpers';
import { statelessQuizApi } from '../service/statelessQuizApi';
import type { StatelessQuizSummary, StatelessQuizDetail, StatelessAttemptResult } from '../service/statelessQuizApi';

export const useQuizStore = defineStore('quizSystem', () => {
  const lectureStore = useLectureStore();
  const animStore = useAnimationStore();
  const authStore = useAuthStore();

  const activeQuestion = ref<QuizQuestion | null>(null);
  const selectedAnswerIndex = ref<number | null>(null);
  const isSubmitted = ref(false), isCorrect = ref(false);
  const feedbackExplanation = ref(''), matchedNodeId = ref<string | null>(null);
  const isCanvasTargetMode = ref(false);
  const checkpoints = ref<QuizCheckpoint[]>([]);
  const completedCheckpointIndexes = ref<number[]>([]);
  const sessionCorrect = ref(0), sessionTotal = ref(0);

  const isLectureLockedByQuiz = computed(() => activeQuestion.value !== null);
  const isQuizActive = computed(() => activeQuestion.value !== null);
  const sessionAccuracy = computed(() => sessionTotal.value === 0 ? 0 : Math.round((sessionCorrect.value / sessionTotal.value) * 100));
  const allCheckpointsCompleted = computed(() => checkpoints.value.length > 0 && checkpoints.value.every(cp => completedCheckpointIndexes.value.includes(cp.frameIndex)));

  function loadCheckpoints(quizCheckpoints: QuizCheckpoint[]): void {
    checkpoints.value = quizCheckpoints;
    completedCheckpointIndexes.value = [];
    sessionCorrect.value = 0; sessionTotal.value = 0;
  }

  function checkFrameForQuiz(frameIndex: number): void {
    if (activeQuestion.value !== null || completedCheckpointIndexes.value.includes(frameIndex)) return;
    const checkpoint = checkpoints.value.find(cp => cp.frameIndex === frameIndex);
    if (checkpoint) triggerCheckpointQuestion(checkpoint.question, frameIndex);
  }

  function triggerCheckpointQuestion(question: QuizQuestion, frameIndex: number): void {
    activeQuestion.value = question; selectedAnswerIndex.value = null;
    isSubmitted.value = false; isCorrect.value = false;
    feedbackExplanation.value = ''; matchedNodeId.value = null;
    isCanvasTargetMode.value = question.type === 'CANVAS_TARGET';
    lectureStore.lockLectureInteraction();
    if (!completedCheckpointIndexes.value.includes(frameIndex)) completedCheckpointIndexes.value.push(frameIndex);
  }

  function submitOptionAnswer(index: number): void {
    if (!activeQuestion.value || isSubmitted.value) return;
    selectedAnswerIndex.value = index; isSubmitted.value = true;
    const result = verifyAndRecordOption(index, activeQuestion.value, sessionCorrect, sessionTotal);
    isCorrect.value = result.isCorrect; feedbackExplanation.value = result.explanation;
  }

  function handleCanvasClickAnswer(clickX: number, clickY: number, nodes: CanvasNodeDTO[]): void {
    if (!activeQuestion.value || isSubmitted.value || activeQuestion.value.type !== 'CANVAS_TARGET') return;
    const result = QuizVerificationEngine.verifyCanvasClickAnswer(clickX, clickY, nodes, activeQuestion.value);
    if (!result.matchedNodeId) return;
    isSubmitted.value = true; isCorrect.value = result.isCorrect;
    feedbackExplanation.value = result.explanation; matchedNodeId.value = result.matchedNodeId ?? null;
    isCanvasTargetMode.value = false; sessionTotal.value++;
    if (result.isCorrect) sessionCorrect.value++;
    QuizStatsManager.saveAttempt(result.isCorrect, activeQuestion.value.id);
  }

  const dismissQuestionAndContinue = (): void => {
    resetActiveQuestionState(activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation, matchedNodeId, isCanvasTargetMode);
    lectureStore.unlockLectureInteraction();
  };

  const resetQuizStore = (): void => {
    resetActiveQuestionState(activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation, matchedNodeId, isCanvasTargetMode);
    checkpoints.value = []; completedCheckpointIndexes.value = [];
    sessionCorrect.value = 0; sessionTotal.value = 0;
  };

  async function syncSessionToServer(quizId: string): Promise<void> {
    if (sessionTotal.value === 0) return;
    const authStore = useAuthStore();
    const passed = sessionCorrect.value / sessionTotal.value >= 0.6;
    await submitQuizAttempt({ quizId, score: sessionCorrect.value, maxScore: sessionTotal.value, passed }, authStore.getAccessToken());
  }

  // ── Standalone Backend Quiz Mode ──────────────────────────────
  const quizCatalog = ref<StatelessQuizSummary[]>([]);
  const activeBackendQuiz = ref<StatelessQuizDetail | null>(null);
  const backendQuizIndex = ref(0);
  const backendAnswers = ref<(number | null)[]>([]);
  const backendResult = ref<StatelessAttemptResult | null>(null);
  const isBackendQuizLoading = ref(false);
  const backendQuizError = ref<string | null>(null);
  const isBackendQuizMode = ref(false);

  const currentBackendQuestion = computed(() =>
    activeBackendQuiz.value?.questions[backendQuizIndex.value] ?? null
  );
  const backendQuizProgress = computed(() =>
    activeBackendQuiz.value
      ? `${backendQuizIndex.value + 1} / ${activeBackendQuiz.value.questions.length}`
      : ''
  );

  async function loadQuizCatalog(): Promise<void> {
    try {
      isBackendQuizLoading.value = true;
      backendQuizError.value = null;
      quizCatalog.value = await statelessQuizApi.getAllQuizzes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách quiz';
      backendQuizError.value = msg;
    } finally {
      isBackendQuizLoading.value = false;
    }
  }

  async function startBackendQuiz(quizId: string): Promise<void> {
    try {
      isBackendQuizLoading.value = true;
      backendQuizError.value = null;
      backendResult.value = null;
      activeBackendQuiz.value = await statelessQuizApi.getQuizById(quizId);
      backendQuizIndex.value = 0;
      backendAnswers.value = new Array(activeBackendQuiz.value.questions.length).fill(null);
      isBackendQuizMode.value = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải quiz';
      backendQuizError.value = msg;
    } finally {
      isBackendQuizLoading.value = false;
    }
  }

  function selectBackendAnswer(index: number): void {
    backendAnswers.value.splice(backendQuizIndex.value, 1, index);
  }

  function nextBackendQuestion(): void {
    if (activeBackendQuiz.value && backendQuizIndex.value < activeBackendQuiz.value.questions.length - 1)
      backendQuizIndex.value++;
  }

  function prevBackendQuestion(): void {
    if (backendQuizIndex.value > 0) backendQuizIndex.value--;
  }

  async function submitBackendQuiz(): Promise<void> {
    if (!activeBackendQuiz.value) return;
    const answers = backendAnswers.value.map(a => a ?? -1);
    try {
      isBackendQuizLoading.value = true;
      backendResult.value = await statelessQuizApi.submitAttempt(
        activeBackendQuiz.value.id,
        answers,
        authStore.getAccessToken()
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi bài';
      backendQuizError.value = msg;
    } finally {
      isBackendQuizLoading.value = false;
    }
  }

  function exitBackendQuiz(): void {
    isBackendQuizMode.value = false;
    activeBackendQuiz.value = null;
    backendResult.value = null;
    backendQuizIndex.value = 0;
    backendAnswers.value = [];
    backendQuizError.value = null;
  }

  return {
    activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation,
    matchedNodeId, isCanvasTargetMode, checkpoints, completedCheckpointIndexes,
    sessionCorrect, sessionTotal,
    isLectureLockedByQuiz, isQuizActive, sessionAccuracy, allCheckpointsCompleted,
    loadCheckpoints, checkFrameForQuiz, triggerCheckpointQuestion,
    submitOptionAnswer, handleCanvasClickAnswer, dismissQuestionAndContinue,
    resetQuizStore, syncSessionToServer,
    // Backend quiz mode
    quizCatalog, activeBackendQuiz, backendQuizIndex, backendAnswers, backendResult,
    isBackendQuizLoading, backendQuizError, isBackendQuizMode,
    currentBackendQuestion, backendQuizProgress,
    loadQuizCatalog, startBackendQuiz, selectBackendAnswer,
    nextBackendQuestion, prevBackendQuestion, submitBackendQuiz, exitBackendQuiz,
  };
});
