import { describe, it, expect } from 'vitest';
import { QuizVerificationEngine } from '../engine/QuizVerificationEngine';
import type { QuizQuestion, CanvasNodeDTO } from '../types/quiz.types';

const mockMCQuestion: QuizQuestion = {
  id: 'q1',
  type: 'MULTIPLE_CHOICE',
  prompt: 'Đáp án nào đúng?',
  options: ['Sai A', 'Đúng B', 'Sai C'],
  correctOptionIndex: 1,
  explanation: 'Đúng B là chính xác lý thuyết.',
};

const mockTFQuestion: QuizQuestion = {
  id: 'q2',
  type: 'TRUE_FALSE',
  prompt: 'Bubble Sort có độ phức tạp O(n²)?',
  options: ['Đúng', 'Sai'],
  correctOptionIndex: 0,
  explanation: 'Đúng, Bubble Sort worst case là O(n²).',
};

const mockCanvasQuestion: QuizQuestion = {
  id: 'q3',
  type: 'CANVAS_TARGET',
  prompt: 'Hãy click vào đỉnh C',
  targetNodeId: 'node_C',
  explanation: 'Đỉnh C là đỉnh kề ngắn nhất.',
};

const mockNodes: CanvasNodeDTO[] = [
  { id: 'node_A', x: 100, y: 100, radius: 20 },
  { id: 'node_B', x: 300, y: 150, radius: 25 },
  { id: 'node_C', x: 200, y: 200, radius: 20 },
];

describe('QuizVerificationEngine', () => {
  describe('verifyOptionAnswer', () => {
    it('should verify correct Multiple Choice answer', () => {
      const result = QuizVerificationEngine.verifyOptionAnswer(1, mockMCQuestion);
      expect(result.isCorrect).toBe(true);
      expect(result.explanation).toContain('chính xác');
    });

    it('should reject incorrect Multiple Choice answer', () => {
      const result = QuizVerificationEngine.verifyOptionAnswer(0, mockMCQuestion);
      expect(result.isCorrect).toBe(false);
      expect(result.explanation).toBe(mockMCQuestion.explanation);
    });

    it('should verify correct True/False answer', () => {
      const result = QuizVerificationEngine.verifyOptionAnswer(0, mockTFQuestion);
      expect(result.isCorrect).toBe(true);
    });

    it('should reject incorrect True/False answer', () => {
      const result = QuizVerificationEngine.verifyOptionAnswer(1, mockTFQuestion);
      expect(result.isCorrect).toBe(false);
    });

    it('should handle out-of-range index', () => {
      const result = QuizVerificationEngine.verifyOptionAnswer(99, mockMCQuestion);
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('verifyCanvasClickAnswer', () => {
    it('should verify correct Canvas click on target node', () => {
      const result = QuizVerificationEngine.verifyCanvasClickAnswer(
        202,
        198,
        mockNodes,
        mockCanvasQuestion,
      );
      expect(result.isCorrect).toBe(true);
      expect(result.matchedNodeId).toBe('node_C');
    });

    it('should reject Canvas click on wrong node', () => {
      const result = QuizVerificationEngine.verifyCanvasClickAnswer(
        102,
        98,
        mockNodes,
        mockCanvasQuestion,
      );
      expect(result.isCorrect).toBe(false);
      expect(result.matchedNodeId).toBe('node_A');
    });

    it('should handle click on empty space', () => {
      const result = QuizVerificationEngine.verifyCanvasClickAnswer(
        500,
        500,
        mockNodes,
        mockCanvasQuestion,
      );
      expect(result.isCorrect).toBe(false);
      expect(result.matchedNodeId).toBeUndefined();
      expect(result.explanation).toContain('chưa trúng');
    });

    it('should reject non-CANVAS_TARGET question type', () => {
      const result = QuizVerificationEngine.verifyCanvasClickAnswer(
        200,
        200,
        mockNodes,
        mockMCQuestion,
      );
      expect(result.isCorrect).toBe(false);
      expect(result.explanation).toContain('không tương thích');
    });

    it('should detect click exactly on node border (boundary)', () => {
      const result = QuizVerificationEngine.verifyCanvasClickAnswer(
        220,
        200,
        mockNodes,
        mockCanvasQuestion,
      );
      expect(result.isCorrect).toBe(true);
      expect(result.matchedNodeId).toBe('node_C');
    });

    it('should reject click just outside node radius', () => {
      const result = QuizVerificationEngine.verifyCanvasClickAnswer(
        221,
        200,
        mockNodes,
        mockCanvasQuestion,
      );
      expect(result.isCorrect).toBe(false);
      expect(result.matchedNodeId).toBeUndefined();
    });

    it('should handle empty nodes array', () => {
      const result = QuizVerificationEngine.verifyCanvasClickAnswer(
        200,
        200,
        [],
        mockCanvasQuestion,
      );
      expect(result.isCorrect).toBe(false);
      expect(result.explanation).toContain('chưa trúng');
    });
  });
});
