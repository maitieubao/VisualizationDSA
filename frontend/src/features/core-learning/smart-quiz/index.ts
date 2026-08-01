export { default as SmartQuizWorkspace } from './components/SmartQuizWorkspace.vue';
export { useSmartQuizStore } from './store/useSmartQuizStore';
export { VCRPlaybackInterceptor } from './engine/VCRPlaybackInterceptor';
export { SVGTargetResolver } from './engine/SVGTargetResolver';
export { QuizEvaluationEngine } from './engine/QuizEvaluationEngine';
export type {
  InteractiveQuizQuestion,
  QuizEvaluationResult,
  QuestionType,
  QuizSubmissionState,
  QuizOverlayStatus,
  QuizSessionStats,
  MultipleChoiceOption,
} from './types/smart-quiz.types';
export { QUIZ_CONSTANTS } from './types/smart-quiz.types';
