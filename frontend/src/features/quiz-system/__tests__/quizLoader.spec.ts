import { describe, it, expect } from 'vitest';
import { loadQuizScript, hasQuizScript } from '../scripts/quizLoader';
import { QuizSchemaValidator } from '../engine/QuizSchemaValidator';

describe('quizLoader', () => {
  it('should load bubble-sort quiz script', () => {
    const script = loadQuizScript('bubble-sort');
    expect(script).not.toBeNull();
    expect(script?.algorithmId).toBe('bubble-sort');
    expect(script?.checkpoints.length).toBeGreaterThan(0);
  });

  it('should return null for unknown algorithm', () => {
    const script = loadQuizScript('unknown-algo');
    expect(script).toBeNull();
  });

  it('should detect available quiz script', () => {
    expect(hasQuizScript('bubble-sort')).toBe(true);
    expect(hasQuizScript('unknown-algo')).toBe(false);
  });

  it('should have valid question structures in bubble-sort quiz', () => {
    const script = loadQuizScript('bubble-sort');
    if (!script) throw new Error('Script not found');

    for (const cp of script.checkpoints) {
      expect(cp.frameIndex).toBeGreaterThanOrEqual(0);
      expect(cp.question.id).toBeTruthy();
      expect(cp.question.prompt).toBeTruthy();
      expect(cp.question.explanation).toBeTruthy();
      expect(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'CANVAS_TARGET']).toContain(cp.question.type);

      if (cp.question.type === 'MULTIPLE_CHOICE' || cp.question.type === 'TRUE_FALSE') {
        expect(cp.question.options).toBeDefined();
        expect(cp.question.options!.length).toBeGreaterThanOrEqual(2);
        expect(typeof cp.question.correctOptionIndex).toBe('number');
      }
    }
  });

  it('QZ-045 (ADR-12): registry nhất quán — mọi key đăng ký phải load được chính algorithmId của nó', () => {
    // ADR-12: "thêm thuật toán mới = chỉ thêm 1 quiz script file + register vào
    // quizLoader". Kiểm tra hợp đồng key↔algorithmId cho script duy nhất hiện có.
    // TODO (agent sở hữu scripts/quizLoader.ts): expose hàm liệt kê registry
    // (vd listQuizScriptIds()) để test duyệt được toàn bộ key thay vì hardcode.
    const bubbleSort = loadQuizScript('bubble-sort');
    expect(bubbleSort).not.toBeNull();
    expect(hasQuizScript(bubbleSort!.algorithmId)).toBe(true);
    expect(loadQuizScript(bubbleSort!.algorithmId)).toBe(bubbleSort);

    const validation = QuizSchemaValidator.validateQuizJson({
      algorithmId: bubbleSort!.algorithmId,
      checkpoints: bubbleSort!.checkpoints,
    });
    expect(validation.isValid).toBe(true);
  });
});
