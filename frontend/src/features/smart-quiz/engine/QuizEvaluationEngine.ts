import type { QuizEvaluationResult } from '../types/smart-quiz.types';

/**
 * Quiz Evaluation Engine — scores student answers against correct answers
 * using pure RAM-based set comparison (no network calls).
 *
 * Supports all question types: SVG_NODE_CLICK, MONACO_LINE_CLICK, MULTIPLE_CHOICE.
 */
export class QuizEvaluationEngine {
  /**
   * Evaluates selected answers against correct answers.
   * Returns isCorrect (exact match required) and scorePercentage (partial credit).
   */
  public static evaluate(
    selectedAnswers: string[],
    correctAnswers: string[]
  ): QuizEvaluationResult {
    if (selectedAnswers.length === 0 || correctAnswers.length === 0) {
      return {
        isCorrect: false,
        scorePercentage: 0,
        matchCount: 0,
        totalCorrect: correctAnswers.length,
      };
    }

    const correctSet = new Set(correctAnswers);
    const selectedSet = new Set(selectedAnswers);

    let matchCount = 0;
    selectedSet.forEach(ans => {
      if (correctSet.has(ans)) {
        matchCount++;
      }
    });

    const isCorrect =
      matchCount === correctAnswers.length &&
      selectedAnswers.length === correctAnswers.length;

    const scorePercentage = Math.round(
      (matchCount / correctAnswers.length) * 100
    );

    return {
      isCorrect,
      scorePercentage,
      matchCount,
      totalCorrect: correctAnswers.length,
    };
  }

  /**
   * Validates that the XP reward value is within acceptable bounds.
   * XP must be a positive integer between 1 and 200.
   */
  public static validateXPReward(xp: number): boolean {
    return Number.isInteger(xp) && xp >= 1 && xp <= 200;
  }

  /**
   * Calculates reduced XP for retry attempts (first-try bonus policy).
   * First attempt: full XP. Subsequent: 0 XP.
   */
  public static calculateRetryXP(baseXP: number, attemptNumber: number): number {
    if (attemptNumber <= 0 || !QuizEvaluationEngine.validateXPReward(baseXP)) {
      return 0;
    }
    return attemptNumber === 1 ? baseXP : 0;
  }
}
