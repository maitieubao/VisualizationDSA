/**
 * Quiz System Type Definitions
 * Defines data structures for Interactive Quiz checkpoints,
 * Canvas-targeted questions, and local statistics.
 */

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CANVAS_TARGET';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctOptionIndex?: number;
  targetNodeId?: string;
  explanation: string;
}

export interface QuizCheckpoint {
  frameIndex: number;
  question: QuizQuestion;
}

export interface QuizScript {
  algorithmId: string;
  checkpoints: QuizCheckpoint[];
}

export interface CanvasNodeDTO {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface VerificationResult {
  isCorrect: boolean;
  explanation: string;
  matchedNodeId?: string;
}

export interface UserQuizStats {
  totalAttempts: number;
  correctAnswers: number;
  streak: number;
  completedQuizzes: string[];
}
