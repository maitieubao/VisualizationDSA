import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VCRPlaybackInterceptor } from '../engine/VCRPlaybackInterceptor';
import type { InteractiveQuizQuestion } from '../types/smart-quiz.types';

describe('VCRPlaybackInterceptor', () => {
  let interceptor: VCRPlaybackInterceptor;
  const mockTrigger = vi.fn();

  const quizAtStep8: InteractiveQuizQuestion = {
    quizId: 'heap-sort-swap',
    triggerStepIndex: 8,
    questionType: 'SVG_NODE_CLICK',
    promptText: 'Hai phần tử nào sẽ hoán đổi?',
    correctAnswers: ['node-bar-2', 'node-bar-5'],
    explanationMarkdown: 'Heapify swap explanation',
    xpReward: 30,
  };

  const quizAtStep15: InteractiveQuizQuestion = {
    quizId: 'quicksort-pivot',
    triggerStepIndex: 15,
    questionType: 'MONACO_LINE_CLICK',
    promptText: 'Dòng code nào thực thi tiếp theo?',
    correctAnswers: ['line-9'],
    explanationMarkdown: 'Pivot partition explanation',
    xpReward: 25,
  };

  beforeEach(() => {
    mockTrigger.mockClear();
    interceptor = new VCRPlaybackInterceptor([quizAtStep8, quizAtStep15], mockTrigger);
  });

  it('should not intercept steps without quizzes', () => {
    expect(interceptor.interceptStep(1)).toBe(false);
    expect(interceptor.interceptStep(5)).toBe(false);
    expect(interceptor.interceptStep(10)).toBe(false);
    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it('should intercept step 8 and trigger quiz callback', () => {
    const intercepted = interceptor.interceptStep(8);
    expect(intercepted).toBe(true);
    expect(mockTrigger).toHaveBeenCalledOnce();
    expect(mockTrigger).toHaveBeenCalledWith(quizAtStep8);
  });

  it('should intercept step 15 and trigger quiz callback', () => {
    const intercepted = interceptor.interceptStep(15);
    expect(intercepted).toBe(true);
    expect(mockTrigger).toHaveBeenCalledWith(quizAtStep15);
  });

  it('should remove quiz after triggering to prevent re-trigger', () => {
    interceptor.interceptStep(8);
    mockTrigger.mockClear();

    const secondIntercept = interceptor.interceptStep(8);
    expect(secondIntercept).toBe(false);
    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it('should still intercept other quizzes after one is consumed', () => {
    interceptor.interceptStep(8);
    mockTrigger.mockClear();

    const intercepted = interceptor.interceptStep(15);
    expect(intercepted).toBe(true);
    expect(mockTrigger).toHaveBeenCalledWith(quizAtStep15);
  });

  it('should register new quiz at a step index', () => {
    const newQuiz: InteractiveQuizQuestion = {
      quizId: 'bubble-sort-compare',
      triggerStepIndex: 20,
      questionType: 'MULTIPLE_CHOICE',
      promptText: 'Which elements compare next?',
      correctAnswers: ['option-b'],
      explanationMarkdown: 'Bubble sort inner loop',
      xpReward: 20,
    };

    interceptor.registerQuiz(newQuiz);
    const intercepted = interceptor.interceptStep(20);
    expect(intercepted).toBe(true);
    expect(mockTrigger).toHaveBeenCalledWith(newQuiz);
  });

  it('should remove a specific quiz by step index', () => {
    const removed = interceptor.removeQuiz(8);
    expect(removed).toBe(true);

    const intercepted = interceptor.interceptStep(8);
    expect(intercepted).toBe(false);
  });

  it('should return false when removing non-existent quiz', () => {
    const removed = interceptor.removeQuiz(999);
    expect(removed).toBe(false);
  });

  it('should clear all quizzes', () => {
    interceptor.clearQuizzes();
    expect(interceptor.interceptStep(8)).toBe(false);
    expect(interceptor.interceptStep(15)).toBe(false);
    expect(interceptor.getActiveQuizCount()).toBe(0);
  });

  it('should check if quiz exists at a given step', () => {
    expect(interceptor.hasQuizAtStep(8)).toBe(true);
    expect(interceptor.hasQuizAtStep(15)).toBe(true);
    expect(interceptor.hasQuizAtStep(999)).toBe(false);
  });

  it('should return correct active quiz count', () => {
    expect(interceptor.getActiveQuizCount()).toBe(2);
    interceptor.interceptStep(8);
    expect(interceptor.getActiveQuizCount()).toBe(1);
    interceptor.interceptStep(15);
    expect(interceptor.getActiveQuizCount()).toBe(0);
  });

  it('should return sorted registered step indices', () => {
    const indices = interceptor.getRegisteredStepIndices();
    expect(indices).toEqual([8, 15]);
  });

  it('should handle empty quizzes list in constructor', () => {
    const emptyInterceptor = new VCRPlaybackInterceptor([], mockTrigger);
    expect(emptyInterceptor.interceptStep(0)).toBe(false);
    expect(emptyInterceptor.getActiveQuizCount()).toBe(0);
  });

  it('should handle step index 0', () => {
    const zeroQuiz: InteractiveQuizQuestion = {
      quizId: 'zero-step',
      triggerStepIndex: 0,
      questionType: 'SVG_NODE_CLICK',
      promptText: 'First step quiz',
      correctAnswers: ['node-0'],
      explanationMarkdown: 'Step zero',
      xpReward: 10,
    };
    const zeroInterceptor = new VCRPlaybackInterceptor([zeroQuiz], mockTrigger);
    expect(zeroInterceptor.interceptStep(0)).toBe(true);
    expect(mockTrigger).toHaveBeenCalledWith(zeroQuiz);
  });

  it('should handle negative step indices without error', () => {
    expect(interceptor.interceptStep(-1)).toBe(false);
    expect(interceptor.interceptStep(-100)).toBe(false);
  });

  it('should override quiz at same step index when registering', () => {
    const overrideQuiz: InteractiveQuizQuestion = {
      quizId: 'override-quiz',
      triggerStepIndex: 8,
      questionType: 'MULTIPLE_CHOICE',
      promptText: 'Override quiz at step 8',
      correctAnswers: ['option-c'],
      explanationMarkdown: 'Override',
      xpReward: 50,
    };
    interceptor.registerQuiz(overrideQuiz);
    interceptor.interceptStep(8);
    expect(mockTrigger).toHaveBeenCalledWith(overrideQuiz);
  });
});
