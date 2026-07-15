import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSmartQuizStore } from '../store/useSmartQuizStore';
import type { InteractiveQuizQuestion } from '../types/smart-quiz.types';

describe('useSmartQuizStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  const mockQuiz: InteractiveQuizQuestion = {
    quizId: 'test-quiz-1',
    triggerStepIndex: 5,
    questionType: 'SVG_NODE_CLICK',
    promptText: 'Select the swap elements',
    correctAnswers: ['node-bar-2', 'node-bar-5'],
    explanationMarkdown: 'Heapify swap',
    xpReward: 30,
  };

  const mcQuiz: InteractiveQuizQuestion = {
    quizId: 'test-mc-quiz',
    triggerStepIndex: 12,
    questionType: 'MULTIPLE_CHOICE',
    promptText: 'Which comparison is next?',
    correctAnswers: ['option-b'],
    explanationMarkdown: 'Bubble sort comparison',
    xpReward: 20,
    options: [
      { id: 'option-a', label: 'Position 2 and 3' },
      { id: 'option-b', label: 'Position 3 and 4' },
      { id: 'option-c', label: 'Position 4 and 5' },
    ],
  };

  describe('initial state', () => {
    it('should have null active quiz', () => {
      const store = useSmartQuizStore();
      expect(store.activeQuiz).toBeNull();
    });

    it('should have HIDDEN overlay status', () => {
      const store = useSmartQuizStore();
      expect(store.overlayStatus).toBe('HIDDEN');
    });

    it('should have empty selected answers', () => {
      const store = useSmartQuizStore();
      expect(store.selectedAnswers).toEqual([]);
    });

    it('should not be quiz visible', () => {
      const store = useSmartQuizStore();
      expect(store.isQuizVisible).toBe(false);
    });

    it('should have zero session stats', () => {
      const store = useSmartQuizStore();
      expect(store.sessionStats.totalQuestions).toBe(0);
      expect(store.sessionStats.correctFirstTry).toBe(0);
      expect(store.sessionStats.totalXPEarned).toBe(0);
    });

    it('should not have VCR locked', () => {
      const store = useSmartQuizStore();
      expect(store.isVCRLocked).toBe(false);
    });
  });

  describe('triggerQuiz', () => {
    it('should set active quiz and show overlay', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);

      expect(store.activeQuiz).toEqual(mockQuiz);
      expect(store.overlayStatus).toBe('SLIDE_IN');
      expect(store.isQuizVisible).toBe(true);
    });

    it('should lock VCR timeline', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      expect(store.isVCRLocked).toBe(true);
    });

    it('should reset selections and evaluation', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);

      expect(store.selectedAnswers).toEqual([]);
      expect(store.evaluationResult.hasSubmitted).toBe(false);
      expect(store.xpAwarded).toBe(0);
    });

    it('should increment totalQuestions', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      expect(store.sessionStats.totalQuestions).toBe(1);
    });
  });

  describe('toggleAnswerSelection', () => {
    it('should add answer when not selected', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      expect(store.selectedAnswers).toContain('node-bar-2');
    });

    it('should remove answer when already selected', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-2');
      expect(store.selectedAnswers).not.toContain('node-bar-2');
    });

    it('should enforce max selection limit', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz); // correctAnswers has 2 items

      store.toggleAnswerSelection('node-bar-1');
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-3'); // Should be ignored

      expect(store.selectedAnswers.length).toBe(2);
      expect(store.selectedAnswers).not.toContain('node-bar-3');
    });

    it('should not allow toggle after submission', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      store.submitAnswers();

      store.toggleAnswerSelection('node-bar-1');
      expect(store.selectedAnswers).not.toContain('node-bar-1');
    });

    it('should update selectionCount computed', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      expect(store.selectionCount).toBe(0);

      store.toggleAnswerSelection('node-bar-2');
      expect(store.selectionCount).toBe(1);

      store.toggleAnswerSelection('node-bar-5');
      expect(store.selectionCount).toBe(2);
    });
  });

  describe('submitAnswers', () => {
    it('should return false when no active quiz', () => {
      const store = useSmartQuizStore();
      const result = store.submitAnswers();
      expect(result).toBe(false);
    });

    it('should return false when no answers selected', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      const result = store.submitAnswers();
      expect(result).toBe(false);
    });

    it('should return true for correct answers', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      const result = store.submitAnswers();
      expect(result).toBe(true);
    });

    it('should return false for incorrect answers', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-8');
      const result = store.submitAnswers();
      expect(result).toBe(false);
    });

    it('should set evaluation result on correct submission', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      store.submitAnswers();

      expect(store.evaluationResult.hasSubmitted).toBe(true);
      expect(store.evaluationResult.isCorrect).toBe(true);
      expect(store.evaluationResult.scorePercentage).toBe(100);
    });

    it('should set evaluation result on incorrect submission', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-8');
      store.submitAnswers();

      expect(store.evaluationResult.hasSubmitted).toBe(true);
      expect(store.evaluationResult.isCorrect).toBe(false);
      expect(store.evaluationResult.scorePercentage).toBe(50);
    });

    it('should award XP on first correct attempt', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      store.submitAnswers();

      expect(store.xpAwarded).toBe(30);
      expect(store.sessionStats.totalXPEarned).toBe(30);
      expect(store.sessionStats.correctFirstTry).toBe(1);
    });

    it('should not award XP on retry correct attempt', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);

      // First attempt: wrong
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-8');
      store.submitAnswers();
      vi.advanceTimersByTime(2000);

      // Retry
      store.retryQuiz();
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      store.submitAnswers();

      expect(store.xpAwarded).toBe(0);
    });

    it('should change overlay status to SUBMITTED', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      store.submitAnswers();

      expect(store.overlayStatus).toBe('SUBMITTED');
    });

    it('should lock submit button via debounce', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      store.submitAnswers();

      expect(store.isSubmitLocked).toBe(true);
      vi.advanceTimersByTime(2000);
      expect(store.isSubmitLocked).toBe(false);
    });

    it('should handle multiple choice quiz correctly', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mcQuiz);
      store.toggleAnswerSelection('option-b');
      const result = store.submitAnswers();
      expect(result).toBe(true);
      expect(store.xpAwarded).toBe(20);
    });
  });

  describe('retryQuiz', () => {
    it('should reset selections and evaluation but keep quiz active', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-8');
      store.submitAnswers();
      vi.advanceTimersByTime(2000);

      store.retryQuiz();

      expect(store.activeQuiz).toEqual(mockQuiz);
      expect(store.selectedAnswers).toEqual([]);
      expect(store.evaluationResult.hasSubmitted).toBe(false);
      expect(store.overlayStatus).toBe('SLIDE_IN');
    });
  });

  describe('closeQuiz', () => {
    it('should set status to SLIDE_OUT then HIDDEN', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.closeQuiz();

      expect(store.overlayStatus).toBe('SLIDE_OUT');
      expect(store.isVCRLocked).toBe(false);

      vi.advanceTimersByTime(500);

      expect(store.overlayStatus).toBe('HIDDEN');
      expect(store.activeQuiz).toBeNull();
      expect(store.selectedAnswers).toEqual([]);
    });
  });

  describe('checkTimelineStep', () => {
    it('should trigger demo quiz at step 3', () => {
      const store = useSmartQuizStore();
      const intercepted = store.checkTimelineStep(3);
      expect(intercepted).toBe(true);
      expect(store.isQuizVisible).toBe(true);
    });

    it('should not intercept at non-quiz steps', () => {
      const store = useSmartQuizStore();
      const intercepted = store.checkTimelineStep(1);
      expect(intercepted).toBe(false);
      expect(store.isQuizVisible).toBe(false);
    });
  });

  describe('resetSession', () => {
    it('should reset all session stats', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      store.submitAnswers();

      vi.advanceTimersByTime(500);
      store.resetSession();
      vi.advanceTimersByTime(500);

      expect(store.sessionStats.totalQuestions).toBe(0);
      expect(store.sessionStats.correctFirstTry).toBe(0);
      expect(store.sessionStats.totalXPEarned).toBe(0);
    });
  });

  describe('triggerDemoQuiz', () => {
    it('should trigger first demo quiz (SVG_NODE_CLICK)', () => {
      const store = useSmartQuizStore();
      store.triggerDemoQuiz(0);
      expect(store.activeQuiz?.questionType).toBe('SVG_NODE_CLICK');
      expect(store.isQuizVisible).toBe(true);
    });

    it('should trigger second demo quiz (MONACO_LINE_CLICK)', () => {
      const store = useSmartQuizStore();
      store.triggerDemoQuiz(1);
      expect(store.activeQuiz?.questionType).toBe('MONACO_LINE_CLICK');
    });

    it('should trigger third demo quiz (MULTIPLE_CHOICE)', () => {
      const store = useSmartQuizStore();
      store.triggerDemoQuiz(2);
      expect(store.activeQuiz?.questionType).toBe('MULTIPLE_CHOICE');
      expect(store.activeQuiz?.options).toBeDefined();
    });

    it('should not trigger invalid index', () => {
      const store = useSmartQuizStore();
      store.triggerDemoQuiz(99);
      expect(store.activeQuiz).toBeNull();
    });

    it('should not trigger negative index', () => {
      const store = useSmartQuizStore();
      store.triggerDemoQuiz(-1);
      expect(store.activeQuiz).toBeNull();
    });
  });

  describe('computed properties', () => {
    it('canSubmit should be false without selections', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      expect(store.canSubmit).toBe(false);
    });

    it('canSubmit should be true with selections', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      expect(store.canSubmit).toBe(true);
    });

    it('canSubmit should be false after submission', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      store.toggleAnswerSelection('node-bar-2');
      store.toggleAnswerSelection('node-bar-5');
      store.submitAnswers();
      expect(store.canSubmit).toBe(false);
    });

    it('maxSelections should reflect correct answers length', () => {
      const store = useSmartQuizStore();
      store.triggerQuiz(mockQuiz);
      expect(store.maxSelections).toBe(2);

      store.closeQuiz();
      vi.advanceTimersByTime(500);

      store.triggerQuiz(mcQuiz);
      expect(store.maxSelections).toBe(1);
    });

    it('currentQuestionType should reflect active quiz', () => {
      const store = useSmartQuizStore();
      expect(store.currentQuestionType).toBeNull();

      store.triggerQuiz(mockQuiz);
      expect(store.currentQuestionType).toBe('SVG_NODE_CLICK');
    });
  });
});
