





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
  /**
   * Streak ngữ nghĩa PHIÊN (session streak): số câu trả lời đúng LIÊN TIẾP
   * kể từ lần trả lời sai gần nhất. Trả lời sai → reset về 0.
   * KHÔNG mang nghĩa "thành tích lịch sử" — kỷ lục dài nhất nằm ở `bestStreak`.
   */
  streak: number;
  /** Streak ngữ nghĩa LIFETIME (best streak): kỷ lục streak dài nhất từng đạt được, không bao giờ giảm. */
  bestStreak: number;
  completedQuizzes: string[];
}
