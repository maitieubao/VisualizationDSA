import { describe, it, expect } from 'vitest';
import { PersonalizedPathEvaluator } from '../engine/PersonalizedPathEvaluator';
import type { PathNode, UserQuizScore } from '../types/learning-path.types';

describe('PersonalizedPathEvaluator', () => {
  describe('evaluateNextRecommendedNode', () => {
    it('should recommend review when score is below 70%', () => {
      const nodes: PathNode[] = [
        { id: 'bubble-sort', title: 'Bubble Sort', prerequisites: [], status: 'COMPLETED' },
        { id: 'quicksort', title: 'Quick Sort', prerequisites: ['bubble-sort'], status: 'UNLOCKED' },
      ];
      const scores: UserQuizScore[] = [
        { algorithmId: 'bubble-sort', scorePercentage: 65, timeSpentSeconds: 120 },
      ];

      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode(nodes, scores);

      expect(rec.recommendedNodeId).toBe('bubble-sort');
      expect(rec.recommendationReason).toContain('65%');
      expect(rec.recommendationReason).toContain('ôn tập');
    });

    it('should recommend next UNLOCKED node when all scores pass', () => {
      const nodes: PathNode[] = [
        { id: 'bubble-sort', title: 'Bubble Sort', prerequisites: [], status: 'COMPLETED' },
        { id: 'quicksort', title: 'Quick Sort', prerequisites: ['bubble-sort'], status: 'UNLOCKED' },
      ];
      const scores: UserQuizScore[] = [
        { algorithmId: 'bubble-sort', scorePercentage: 85, timeSpentSeconds: 90 },
      ];

      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode(nodes, scores);

      expect(rec.recommendedNodeId).toBe('quicksort');
      expect(rec.recommendationReason).toContain('Quick Sort');
    });

    it('should congratulate when all nodes are completed', () => {
      const nodes: PathNode[] = [
        { id: 'bubble-sort', title: 'Bubble Sort', prerequisites: [], status: 'COMPLETED' },
        { id: 'quicksort', title: 'Quick Sort', prerequisites: ['bubble-sort'], status: 'COMPLETED' },
      ];
      const scores: UserQuizScore[] = [
        { algorithmId: 'bubble-sort', scorePercentage: 90, timeSpentSeconds: 60 },
        { algorithmId: 'quicksort', scorePercentage: 80, timeSpentSeconds: 120 },
      ];

      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode(nodes, scores);

      expect(rec.recommendedNodeId).toBe('');
      expect(rec.recommendationReason).toContain('Chúc mừng');
    });

    it('should prioritize weak score over unlocked node advancement', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'COMPLETED' },
        { id: 'b', title: 'B', prerequisites: ['a'], status: 'UNLOCKED' },
      ];
      const scores: UserQuizScore[] = [
        { algorithmId: 'a', scorePercentage: 50, timeSpentSeconds: 200 },
      ];

      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode(nodes, scores);
      expect(rec.recommendedNodeId).toBe('a');
    });

    it('should handle empty scores array', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'Node A', prerequisites: [], status: 'UNLOCKED' },
      ];

      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode(nodes, []);
      expect(rec.recommendedNodeId).toBe('a');
    });

    it('should handle empty nodes array', () => {
      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode([], []);
      expect(rec.recommendedNodeId).toBe('');
      expect(rec.recommendationReason).toContain('Chúc mừng');
    });

    it('should handle exactly 70% score as passing', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'COMPLETED' },
        { id: 'b', title: 'B', prerequisites: ['a'], status: 'UNLOCKED' },
      ];
      const scores: UserQuizScore[] = [
        { algorithmId: 'a', scorePercentage: 70, timeSpentSeconds: 100 },
      ];

      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode(nodes, scores);
      expect(rec.recommendedNodeId).toBe('b');
    });

    it('should handle 69% score as failing', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'COMPLETED' },
        { id: 'b', title: 'B', prerequisites: ['a'], status: 'UNLOCKED' },
      ];
      const scores: UserQuizScore[] = [
        { algorithmId: 'a', scorePercentage: 69, timeSpentSeconds: 100 },
      ];

      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode(nodes, scores);
      expect(rec.recommendedNodeId).toBe('a');
    });

    it('should find first weak score when multiple exist', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'COMPLETED' },
        { id: 'b', title: 'B', prerequisites: [], status: 'COMPLETED' },
      ];
      const scores: UserQuizScore[] = [
        { algorithmId: 'a', scorePercentage: 90, timeSpentSeconds: 60 },
        { algorithmId: 'b', scorePercentage: 40, timeSpentSeconds: 200 },
      ];

      const rec = PersonalizedPathEvaluator.evaluateNextRecommendedNode(nodes, scores);
      expect(rec.recommendedNodeId).toBe('b');
    });
  });

  describe('calculateCompletionPercentage', () => {
    it('should return 0 for empty nodes', () => {
      expect(PersonalizedPathEvaluator.calculateCompletionPercentage([])).toBe(0);
    });

    it('should return 100 when all nodes completed', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'COMPLETED' },
        { id: 'b', title: 'B', prerequisites: [], status: 'COMPLETED' },
      ];
      expect(PersonalizedPathEvaluator.calculateCompletionPercentage(nodes)).toBe(100);
    });

    it('should return 50 when half nodes completed', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'COMPLETED' },
        { id: 'b', title: 'B', prerequisites: [], status: 'LOCKED' },
      ];
      expect(PersonalizedPathEvaluator.calculateCompletionPercentage(nodes)).toBe(50);
    });

    it('should return 25 for 1 of 4 completed', () => {
      const nodes: PathNode[] = [
        { id: 'a', title: 'A', prerequisites: [], status: 'COMPLETED' },
        { id: 'b', title: 'B', prerequisites: [], status: 'LOCKED' },
        { id: 'c', title: 'C', prerequisites: [], status: 'LOCKED' },
        { id: 'd', title: 'D', prerequisites: [], status: 'LOCKED' },
      ];
      expect(PersonalizedPathEvaluator.calculateCompletionPercentage(nodes)).toBe(25);
    });
  });

  describe('getAverageScore', () => {
    it('should return 0 for empty scores', () => {
      expect(PersonalizedPathEvaluator.getAverageScore([])).toBe(0);
    });

    it('should return the score for single entry', () => {
      const scores: UserQuizScore[] = [
        { algorithmId: 'a', scorePercentage: 85, timeSpentSeconds: 60 },
      ];
      expect(PersonalizedPathEvaluator.getAverageScore(scores)).toBe(85);
    });

    it('should return correct average for multiple scores', () => {
      const scores: UserQuizScore[] = [
        { algorithmId: 'a', scorePercentage: 80, timeSpentSeconds: 60 },
        { algorithmId: 'b', scorePercentage: 60, timeSpentSeconds: 120 },
      ];
      expect(PersonalizedPathEvaluator.getAverageScore(scores)).toBe(70);
    });
  });

  describe('isPassingScore', () => {
    it('should return true for score >= 70', () => {
      expect(PersonalizedPathEvaluator.isPassingScore(70)).toBe(true);
      expect(PersonalizedPathEvaluator.isPassingScore(100)).toBe(true);
      expect(PersonalizedPathEvaluator.isPassingScore(85)).toBe(true);
    });

    it('should return false for score < 70', () => {
      expect(PersonalizedPathEvaluator.isPassingScore(69)).toBe(false);
      expect(PersonalizedPathEvaluator.isPassingScore(0)).toBe(false);
      expect(PersonalizedPathEvaluator.isPassingScore(50)).toBe(false);
    });
  });
});
