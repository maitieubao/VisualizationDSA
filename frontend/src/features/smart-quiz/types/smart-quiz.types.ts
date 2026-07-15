/**
 * Smart Interactive Quiz Widget — Type Definitions
 *
 * Defines the core interfaces for the VCR playback interception quiz system,
 * SVG node click targeting, Monaco line click, and evaluation results.
 */

export type QuestionType = 'SVG_NODE_CLICK' | 'MONACO_LINE_CLICK' | 'MULTIPLE_CHOICE';

export interface InteractiveQuizQuestion {
  quizId: string;
  triggerStepIndex: number;
  questionType: QuestionType;
  promptText: string;
  correctAnswers: string[];
  explanationMarkdown: string;
  xpReward: number;
  options?: MultipleChoiceOption[];
}

export interface MultipleChoiceOption {
  id: string;
  label: string;
}

export interface QuizEvaluationResult {
  isCorrect: boolean;
  scorePercentage: number;
  matchCount: number;
  totalCorrect: number;
}

export interface SVGResolverResult {
  nodeId: string | null;
}

export interface QuizSubmissionState {
  hasSubmitted: boolean;
  isCorrect: boolean;
  scorePercentage: number;
}

export type QuizOverlayStatus = 'HIDDEN' | 'SLIDE_IN' | 'SUBMITTED' | 'SLIDE_OUT';

export interface QuizSessionStats {
  totalQuestions: number;
  correctFirstTry: number;
  totalXPEarned: number;
}

export const QUIZ_CONSTANTS = {
  SLIDE_ANIMATION_MS: 500,
  SHAKE_ANIMATION_MS: 400,
  SUBMIT_DEBOUNCE_MS: 2000,
  CONFETTI_EVENT_NAME: 'TRIGGER_CONFETTI_RAIN',
  MAX_QUIZ_PER_SESSION: 50,
} as const;
