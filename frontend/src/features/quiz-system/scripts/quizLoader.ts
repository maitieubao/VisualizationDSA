import type { QuizScript } from '../types/quiz.types';
import { QuizSchemaValidator } from '../engine/QuizSchemaValidator';
import { bubbleSortQuiz } from './bubble-sort.quiz';

const quizRegistry = new Map<string, QuizScript>();

// QZ-024: validate fail-fast khi đăng ký — key phải khớp script.algorithmId và script
// phải qua QuizSchemaValidator (lỗi phải nổ ngay khi đăng ký, không phải lúc runtime).
function registerQuizScript(key: string, script: QuizScript): void {
  if (key !== script.algorithmId) {
    throw new Error(`[quizLoader] Key "${key}" không khớp script.algorithmId "${script.algorithmId}".`);
  }
  const { isValid, errors } = QuizSchemaValidator.validateQuizJson({ checkpoints: script.checkpoints });
  if (!isValid) {
    throw new Error(`[quizLoader] Script quiz "${key}" không hợp lệ:\n- ${errors.join('\n- ')}`);
  }
  quizRegistry.set(key, script);
}

registerQuizScript('bubble-sort', bubbleSortQuiz);

export function loadQuizScript(algorithmId: string): QuizScript | null {
  return quizRegistry.get(algorithmId) ?? null;
}

export function hasQuizScript(algorithmId: string): boolean {
  return quizRegistry.has(algorithmId);
}
