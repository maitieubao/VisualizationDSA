import { describe, it, expect } from 'vitest';
import { QuizSchemaValidator } from '../engine/QuizSchemaValidator';

describe('QuizSchemaValidator', () => {
  it('should validate a correct MC quiz checkpoint', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 5,
          question: {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Test?',
            options: ['A', 'B'],
            correctOptionIndex: 0,
            explanation: 'Explanation text.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should reject missing checkpoints array', () => {
    const result = QuizSchemaValidator.validateQuizJson({ questions: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('checkpoints');
  });

  it('should reject null input', () => {
    const result = QuizSchemaValidator.validateQuizJson(null);
    expect(result.isValid).toBe(false);
  });

  it('should reject checkpoint missing frameIndex', () => {
    const data = {
      checkpoints: [
        {
          question: {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q?',
            options: ['A', 'B'],
            correctOptionIndex: 0,
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('frameIndex'))).toBe(true);
  });

  it('should reject MC question missing options', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 3,
          question: {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q?',
            correctOptionIndex: 0,
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('options'))).toBe(true);
  });

  it('should reject CANVAS_TARGET missing targetNodeId', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 10,
          question: {
            id: 'q2',
            type: 'CANVAS_TARGET',
            prompt: 'Click node?',
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('targetNodeId'))).toBe(true);
  });

  it('should reject question missing id', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            type: 'TRUE_FALSE',
            prompt: 'Q?',
            options: ['Đúng', 'Sai'],
            correctOptionIndex: 0,
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('should reject question missing explanation', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'TRUE_FALSE',
            prompt: 'Q?',
            options: ['Đúng', 'Sai'],
            correctOptionIndex: 0,
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('explanation'))).toBe(true);
  });

  it('should validate a correct CANVAS_TARGET checkpoint', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 7,
          question: {
            id: 'q3',
            type: 'CANVAS_TARGET',
            prompt: 'Click target?',
            targetNodeId: 'node_A',
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(true);
  });

  it('should validate multiple checkpoints', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q1?',
            options: ['A', 'B', 'C'],
            correctOptionIndex: 2,
            explanation: 'E1.',
          },
        },
        {
          frameIndex: 5,
          question: {
            id: 'q2',
            type: 'TRUE_FALSE',
            prompt: 'Q2?',
            options: ['Đúng', 'Sai'],
            correctOptionIndex: 1,
            explanation: 'E2.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(true);
  });

  it('should reject checkpoint missing question object', () => {
    const data = {
      checkpoints: [{ frameIndex: 3 }],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('question'))).toBe(true);
  });
});
