import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { QuizEvaluationEngine } from '../engine/QuizEvaluationEngine';
import { VCRPlaybackInterceptor } from '../engine/VCRPlaybackInterceptor';
import type {
  InteractiveQuizQuestion,
  QuizSubmissionState,
  QuizOverlayStatus,
  QuizSessionStats,
} from '../types/smart-quiz.types';
import { QUIZ_CONSTANTS } from '../types/smart-quiz.types';

const DEMO_QUIZZES: InteractiveQuizQuestion[] = [
  {
    quizId: 'heap-sort-swap-quiz',
    triggerStepIndex: 3,
    questionType: 'SVG_NODE_CLICK',
    promptText: 'Hai phần tử nào sẽ hoán đổi tiếp theo trong Heap Sort?',
    correctAnswers: ['node-bar-2', 'node-bar-5'],
    explanationMarkdown:
      'Quy luật **Heapify** yêu cầu đẩy node cha nhỏ hơn xuống dưới. Phần tử tại vị trí 2 (cha) nhỏ hơn phần tử tại vị trí 5 (con phải), do đó cần hoán đổi để duy trì tính chất Max-Heap.',
    xpReward: 30,
  },
  {
    quizId: 'quicksort-pivot-quiz',
    triggerStepIndex: 7,
    questionType: 'MONACO_LINE_CLICK',
    promptText: 'Dòng code nào trong Monaco Editor sẽ thực thi tiếp theo?',
    correctAnswers: ['line-9'],
    explanationMarkdown:
      'Sau khi gán pivot tại dòng 8, biến **i** sẽ được khởi tạo tại **dòng 9** để bắt đầu quá trình phân hoạch (partition). Đây là bước chuẩn bị cho vòng lặp duyệt mảng con.',
    xpReward: 25,
  },
  {
    quizId: 'bubble-sort-compare-quiz',
    triggerStepIndex: 12,
    questionType: 'MULTIPLE_CHOICE',
    promptText: 'Phép so sánh tiếp theo sẽ so sánh hai phần tử tại vị trí nào?',
    correctAnswers: ['option-b'],
    explanationMarkdown:
      'Trong Bubble Sort, vòng lặp trong đang ở vị trí i=3. Phép so sánh tiếp theo sẽ là `arr[3] > arr[4]`, tức là so sánh phần tử tại **vị trí 3 và 4**.',
    xpReward: 20,
    options: [
      { id: 'option-a', label: 'Vị trí 2 và 3' },
      { id: 'option-b', label: 'Vị trí 3 và 4' },
      { id: 'option-c', label: 'Vị trí 4 và 5' },
      { id: 'option-d', label: 'Vị trí 1 và 2' },
    ],
  },
];

export const useSmartQuizStore = defineStore('smartQuiz', () => {
  // ==========================================
  // STATE
  // ==========================================
  const activeQuiz = ref<InteractiveQuizQuestion | null>(null);
  const overlayStatus = ref<QuizOverlayStatus>('HIDDEN');
  const selectedAnswers = ref<string[]>([]);

  const evaluationResult = ref<QuizSubmissionState>({
    hasSubmitted: false,
    isCorrect: false,
    scorePercentage: 0,
  });

  const xpAwarded = ref(0);
  const attemptNumber = ref(0);
  const isSubmitLocked = ref(false);
  const isVCRLocked = ref(false);

  const sessionStats = ref<QuizSessionStats>({
    totalQuestions: 0,
    correctFirstTry: 0,
    totalXPEarned: 0,
  });

  let interceptor: VCRPlaybackInterceptor | null = null;

  // ==========================================
  // COMPUTED
  // ==========================================
  const isQuizVisible = computed(() =>
    overlayStatus.value === 'SLIDE_IN' || overlayStatus.value === 'SUBMITTED'
  );

  const canSubmit = computed(() =>
    selectedAnswers.value.length > 0 &&
    !evaluationResult.value.hasSubmitted &&
    !isSubmitLocked.value
  );

  const selectionCount = computed(() => selectedAnswers.value.length);

  const maxSelections = computed(() =>
    activeQuiz.value ? activeQuiz.value.correctAnswers.length : 0
  );

  const currentQuestionType = computed(() =>
    activeQuiz.value?.questionType ?? null
  );

  // ==========================================
  // ACTIONS
  // ==========================================

  function initializeInterceptor(): void {
    interceptor = new VCRPlaybackInterceptor(DEMO_QUIZZES, triggerQuiz);
  }

  function triggerQuiz(question: InteractiveQuizQuestion): void {
    activeQuiz.value = question;
    selectedAnswers.value = [];
    overlayStatus.value = 'SLIDE_IN';
    evaluationResult.value = {
      hasSubmitted: false,
      isCorrect: false,
      scorePercentage: 0,
    };
    xpAwarded.value = 0;
    attemptNumber.value = 0;
    isSubmitLocked.value = false;
    isVCRLocked.value = true;
    sessionStats.value.totalQuestions++;
  }

  function toggleAnswerSelection(id: string): void {
    if (evaluationResult.value.hasSubmitted) return;

    const index = selectedAnswers.value.indexOf(id);
    if (index > -1) {
      selectedAnswers.value.splice(index, 1);
    } else {
      if (
        activeQuiz.value &&
        selectedAnswers.value.length < activeQuiz.value.correctAnswers.length
      ) {
        selectedAnswers.value.push(id);
      }
    }
  }

  function submitAnswers(): boolean {
    if (!activeQuiz.value || selectedAnswers.value.length === 0) return false;
    if (isSubmitLocked.value) return false;

    isSubmitLocked.value = true;
    attemptNumber.value++;

    const evaluation = QuizEvaluationEngine.evaluate(
      selectedAnswers.value,
      activeQuiz.value.correctAnswers
    );

    evaluationResult.value = {
      hasSubmitted: true,
      isCorrect: evaluation.isCorrect,
      scorePercentage: evaluation.scorePercentage,
    };

    overlayStatus.value = 'SUBMITTED';

    if (evaluation.isCorrect) {
      const earnedXP = QuizEvaluationEngine.calculateRetryXP(
        activeQuiz.value.xpReward,
        attemptNumber.value
      );
      xpAwarded.value = earnedXP;

      if (attemptNumber.value === 1) {
        sessionStats.value.correctFirstTry++;
      }
      sessionStats.value.totalXPEarned += earnedXP;

      if (earnedXP > 0) {
        triggerConfetti();
      }
    }

    // Debounce unlock after SUBMIT_DEBOUNCE_MS
    setTimeout(() => {
      isSubmitLocked.value = false;
    }, QUIZ_CONSTANTS.SUBMIT_DEBOUNCE_MS);

    return evaluation.isCorrect;
  }

  function retryQuiz(): void {
    if (!activeQuiz.value) return;
    selectedAnswers.value = [];
    evaluationResult.value = {
      hasSubmitted: false,
      isCorrect: false,
      scorePercentage: 0,
    };
    overlayStatus.value = 'SLIDE_IN';
    isSubmitLocked.value = false;
  }

  function closeQuiz(): void {
    overlayStatus.value = 'SLIDE_OUT';
    isVCRLocked.value = false;

    setTimeout(() => {
      overlayStatus.value = 'HIDDEN';
      activeQuiz.value = null;
      selectedAnswers.value = [];
      evaluationResult.value = {
        hasSubmitted: false,
        isCorrect: false,
        scorePercentage: 0,
      };
    }, QUIZ_CONSTANTS.SLIDE_ANIMATION_MS);
  }

  function checkTimelineStep(stepIndex: number): boolean {
    if (!interceptor) return false;
    return interceptor.interceptStep(stepIndex);
  }

  function triggerConfetti(): void {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      const confettiEvent = new CustomEvent(QUIZ_CONSTANTS.CONFETTI_EVENT_NAME);
      window.dispatchEvent(confettiEvent);
    }
  }

  function resetSession(): void {
    closeQuiz();
    sessionStats.value = {
      totalQuestions: 0,
      correctFirstTry: 0,
      totalXPEarned: 0,
    };
    attemptNumber.value = 0;

    if (interceptor) {
      interceptor.clearQuizzes();
    }
    interceptor = new VCRPlaybackInterceptor(DEMO_QUIZZES, triggerQuiz);
    isVCRLocked.value = false;
  }

  function triggerDemoQuiz(index: number): void {
    if (index >= 0 && index < DEMO_QUIZZES.length) {
      triggerQuiz(DEMO_QUIZZES[index]);
    }
  }

  // Initialize on store creation
  initializeInterceptor();

  return {
    // State
    activeQuiz,
    overlayStatus,
    selectedAnswers,
    evaluationResult,
    xpAwarded,
    attemptNumber,
    isSubmitLocked,
    isVCRLocked,
    sessionStats,

    // Computed
    isQuizVisible,
    canSubmit,
    selectionCount,
    maxSelections,
    currentQuestionType,

    // Actions
    triggerQuiz,
    toggleAnswerSelection,
    submitAnswers,
    retryQuiz,
    closeQuiz,
    checkTimelineStep,
    resetSession,
    triggerDemoQuiz,
    initializeInterceptor,
  };
});
