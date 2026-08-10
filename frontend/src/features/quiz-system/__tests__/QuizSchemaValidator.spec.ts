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

  it('should reject empty checkpoints quiz (QZ-020)', () => {
    const result = QuizSchemaValidator.validateQuizJson({ checkpoints: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('không có câu hỏi'))).toBe(true);
  });

  it('should reject non-integer frameIndex (QZ-021)', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 5.5,
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

  it('should reject duplicate frameIndex across checkpoints (QZ-022)', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 3,
          question: {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q1?',
            options: ['A', 'B'],
            correctOptionIndex: 0,
            explanation: 'E1.',
          },
        },
        {
          frameIndex: 3,
          question: {
            id: 'q2',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q2?',
            options: ['A', 'B'],
            correctOptionIndex: 1,
            explanation: 'E2.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Trùng lặp "frameIndex"'))).toBe(true);
  });

  it('should reject duplicate question.id across checkpoints (QZ-022)', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 3,
          question: {
            id: 'dup',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q1?',
            options: ['A', 'B'],
            correctOptionIndex: 0,
            explanation: 'E1.',
          },
        },
        {
          frameIndex: 5,
          question: {
            id: 'dup',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q2?',
            options: ['A', 'B'],
            correctOptionIndex: 1,
            explanation: 'E2.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Trùng lặp "question.id"'))).toBe(true);
  });

  it('should reject correctOptionIndex out of options range (QZ-010)', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q?',
            options: ['A', 'B'],
            correctOptionIndex: 5,
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('ngoài dải phương án'))).toBe(true);
  });

  it('should reject non-integer correctOptionIndex (QZ-010)', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q?',
            options: ['A', 'B'],
            correctOptionIndex: 1.5,
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('correctOptionIndex'))).toBe(true);
  });

  it('should reject unsupported question type (QZ-011)', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'MATCHING',
            prompt: 'Q?',
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Kiểu câu hỏi không hỗ trợ') && e.includes('MATCHING'))).toBe(true);
  });

  it('should reject null checkpoint without crashing (QZ-012)', () => {
    const result = QuizSchemaValidator.validateQuizJson({ checkpoints: [null] });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Checkpoint'))).toBe(true);
  });

  it('should reject non-object checkpoint without crashing (QZ-012)', () => {
    const result = QuizSchemaValidator.validateQuizJson({ checkpoints: ['string-cp'] });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Checkpoint'))).toBe(true);
  });

  it('should reject TRUE_FALSE with more than 2 options (QZ-038)', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'TRUE_FALSE',
            prompt: 'Q?',
            options: ['Đúng', 'Sai', 'Không chắc'],
            correctOptionIndex: 0,
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('đúng 2 phương án'))).toBe(true);
  });

  it('should reject options that are empty strings (QZ-038)', () => {
    const data = {
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            prompt: 'Q?',
            options: ['A', '   '],
            correctOptionIndex: 0,
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('chuỗi không rỗng'))).toBe(true);
  });

  it('should reject canvas nodes with non-positive radius (QZ-038)', () => {
    const data = {
      nodes: [{ id: 'node_A', x: 0, y: 0, radius: 0 }],
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'CANVAS_TARGET',
            prompt: 'Q?',
            targetNodeId: 'node_A',
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('radius') && e.includes('dương'))).toBe(true);
  });

  it('should accept quiz with valid optional canvas nodes (QZ-038)', () => {
    const data = {
      nodes: [{ id: 'node_A', x: 100, y: 100, radius: 20 }],
      checkpoints: [
        {
          frameIndex: 1,
          question: {
            id: 'q1',
            type: 'CANVAS_TARGET',
            prompt: 'Q?',
            targetNodeId: 'node_A',
            explanation: 'E.',
          },
        },
      ],
    };
    const result = QuizSchemaValidator.validateQuizJson(data);
    expect(result.isValid).toBe(true);
  });
});
