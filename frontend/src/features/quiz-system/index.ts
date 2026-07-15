export { default as QuizCardOverlay } from './components/QuizCardOverlay.vue';
export { default as QuizSummaryCard } from './components/QuizSummaryCard.vue';
export { useQuizStore } from './store/useQuizStore';
export { QuizVerificationEngine } from './engine/QuizVerificationEngine';
export { QuizStatsManager } from './engine/QuizStatsManager';
export { QuizSchemaValidator } from './engine/QuizSchemaValidator';
export { loadQuizScript, hasQuizScript } from './scripts/quizLoader';
export type {
  QuizQuestion,
  QuizCheckpoint,
  QuizScript,
  CanvasNodeDTO,
  VerificationResult,
  UserQuizStats,
  QuestionType,
} from './types/quiz.types';
