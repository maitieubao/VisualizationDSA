import type { InteractiveQuizQuestion } from '../types/smart-quiz.types';

/**
 * VCR Playback Interceptor — intercepts timeline step progression
 * to trigger quiz overlays at configured step indices.
 *
 * When the algorithm VCR player reaches a triggerStepIndex,
 * the interceptor pauses playback and fires the quiz callback.
 */
export class VCRPlaybackInterceptor {
  private activeQuizzes: Map<number, InteractiveQuizQuestion> = new Map();
  private quizTriggerCallback: (quiz: InteractiveQuizQuestion) => void;

  constructor(
    quizzes: InteractiveQuizQuestion[],
    onQuizTrigger: (quiz: InteractiveQuizQuestion) => void
  ) {
    quizzes.forEach(quiz => {
      this.activeQuizzes.set(quiz.triggerStepIndex, quiz);
    });
    this.quizTriggerCallback = onQuizTrigger;
  }

  /**
   * Intercepts timeline step — returns true if a quiz is triggered (VCR should pause).
   * Once triggered, the quiz is removed from the active map to prevent re-triggering
   * when the student scrubs back through the same step.
   */
  public interceptStep(nextStepIndex: number): boolean {
    if (this.activeQuizzes.has(nextStepIndex)) {
      const quiz = this.activeQuizzes.get(nextStepIndex)!;
      this.quizTriggerCallback(quiz);
      this.activeQuizzes.delete(nextStepIndex);
      return true;
    }
    return false;
  }

  public registerQuiz(quiz: InteractiveQuizQuestion): void {
    this.activeQuizzes.set(quiz.triggerStepIndex, quiz);
  }

  public removeQuiz(stepIndex: number): boolean {
    return this.activeQuizzes.delete(stepIndex);
  }

  public clearQuizzes(): void {
    this.activeQuizzes.clear();
  }

  public hasQuizAtStep(stepIndex: number): boolean {
    return this.activeQuizzes.has(stepIndex);
  }

  public getActiveQuizCount(): number {
    return this.activeQuizzes.size;
  }

  public getRegisteredStepIndices(): number[] {
    return Array.from(this.activeQuizzes.keys()).sort((a, b) => a - b);
  }
}
