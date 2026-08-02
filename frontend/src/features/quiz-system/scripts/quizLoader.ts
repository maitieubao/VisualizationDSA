import type { QuizScript } from '../types/quiz.types';
import { bubbleSortQuiz } from './bubble-sort.quiz';

const quizRegistry = new Map<string, QuizScript>([
  ['bubble-sort', bubbleSortQuiz],
]);

export function loadQuizScript(algorithmId: string): QuizScript | null {
  return quizRegistry.get(algorithmId) ?? null;
}

export function hasQuizScript(algorithmId: string): boolean {
  return quizRegistry.has(algorithmId);
}
