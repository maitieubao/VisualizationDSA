import { describe, it, expect } from 'vitest';
import { QuizEvaluationEngine } from '../engine/QuizEvaluationEngine';

describe('QuizEvaluationEngine', () => {
  describe('evaluate', () => {
    it('should return 100% when all answers are correct', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['node-bar-2', 'node-bar-5'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(true);
      expect(result.scorePercentage).toBe(100);
      expect(result.matchCount).toBe(2);
      expect(result.totalCorrect).toBe(2);
    });

    it('should return 50% when half the answers are correct', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['node-bar-2', 'node-bar-8'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.scorePercentage).toBe(50);
      expect(result.matchCount).toBe(1);
    });

    it('should return 0% when no answers are correct', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['node-bar-8', 'node-bar-9'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.scorePercentage).toBe(0);
      expect(result.matchCount).toBe(0);
    });

    it('should return 0% for empty selected answers', () => {
      const result = QuizEvaluationEngine.evaluate(
        [],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.scorePercentage).toBe(0);
    });

    it('should return 0% for empty correct answers', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['node-bar-2'],
        []
      );
      expect(result.isCorrect).toBe(false);
      expect(result.scorePercentage).toBe(0);
    });

    it('should return 0% when both arrays are empty', () => {
      const result = QuizEvaluationEngine.evaluate([], []);
      expect(result.isCorrect).toBe(false);
      expect(result.scorePercentage).toBe(0);
    });

    it('should handle single correct answer', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['line-9'],
        ['line-9']
      );
      expect(result.isCorrect).toBe(true);
      expect(result.scorePercentage).toBe(100);
      expect(result.matchCount).toBe(1);
      expect(result.totalCorrect).toBe(1);
    });

    it('should not be correct if extra answers are provided', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['node-bar-2', 'node-bar-5', 'node-bar-7'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.scorePercentage).toBe(100);
      expect(result.matchCount).toBe(2);
    });

    it('should handle duplicate selections gracefully via Set', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['node-bar-2', 'node-bar-2'],
        ['node-bar-2', 'node-bar-5']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.matchCount).toBe(1);
    });

    it('should correctly score 1 out of 3 correct answers', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['a', 'x', 'y'],
        ['a', 'b', 'c']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.scorePercentage).toBe(33);
      expect(result.matchCount).toBe(1);
      expect(result.totalCorrect).toBe(3);
    });

    it('should correctly score 2 out of 3 correct answers', () => {
      const result = QuizEvaluationEngine.evaluate(
        ['a', 'b', 'x'],
        ['a', 'b', 'c']
      );
      expect(result.isCorrect).toBe(false);
      expect(result.scorePercentage).toBe(67);
      expect(result.matchCount).toBe(2);
    });
  });

  describe('validateXPReward', () => {
    it('should accept valid XP values', () => {
      expect(QuizEvaluationEngine.validateXPReward(1)).toBe(true);
      expect(QuizEvaluationEngine.validateXPReward(30)).toBe(true);
      expect(QuizEvaluationEngine.validateXPReward(100)).toBe(true);
      expect(QuizEvaluationEngine.validateXPReward(200)).toBe(true);
    });

    it('should reject XP value of 0', () => {
      expect(QuizEvaluationEngine.validateXPReward(0)).toBe(false);
    });

    it('should reject negative XP', () => {
      expect(QuizEvaluationEngine.validateXPReward(-10)).toBe(false);
    });

    it('should reject XP above 200', () => {
      expect(QuizEvaluationEngine.validateXPReward(201)).toBe(false);
      expect(QuizEvaluationEngine.validateXPReward(999)).toBe(false);
    });

    it('should reject non-integer XP', () => {
      expect(QuizEvaluationEngine.validateXPReward(10.5)).toBe(false);
      expect(QuizEvaluationEngine.validateXPReward(0.1)).toBe(false);
    });
  });

  describe('calculateRetryXP', () => {
    it('should return full XP for first attempt', () => {
      expect(QuizEvaluationEngine.calculateRetryXP(30, 1)).toBe(30);
    });

    it('should return 0 XP for second attempt', () => {
      expect(QuizEvaluationEngine.calculateRetryXP(30, 2)).toBe(0);
    });

    it('should return 0 XP for third attempt', () => {
      expect(QuizEvaluationEngine.calculateRetryXP(30, 3)).toBe(0);
    });

    it('should return 0 XP for invalid attempt number', () => {
      expect(QuizEvaluationEngine.calculateRetryXP(30, 0)).toBe(0);
      expect(QuizEvaluationEngine.calculateRetryXP(30, -1)).toBe(0);
    });

    it('should return 0 XP for invalid base XP', () => {
      expect(QuizEvaluationEngine.calculateRetryXP(0, 1)).toBe(0);
      expect(QuizEvaluationEngine.calculateRetryXP(-10, 1)).toBe(0);
      expect(QuizEvaluationEngine.calculateRetryXP(201, 1)).toBe(0);
    });
  });
});
