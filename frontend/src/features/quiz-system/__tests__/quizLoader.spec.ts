import { describe, it, expect } from 'vitest';
import { loadQuizScript, hasQuizScript } from '../scripts/quizLoader';

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
});
