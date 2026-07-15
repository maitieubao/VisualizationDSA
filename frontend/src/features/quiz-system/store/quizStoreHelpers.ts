import type { Ref } from 'vue';
import type { QuizQuestion, QuizCheckpoint } from '../types/quiz.types';
import { QuizVerificationEngine } from '../engine/QuizVerificationEngine';
import { QuizStatsManager } from '../engine/QuizStatsManager';

/** Reset toàn bộ active question state về mặc định */
export function resetActiveQuestionState(
  activeQuestion: Ref<QuizQuestion | null>,
  selectedAnswerIndex: Ref<number | null>,
  isSubmitted: Ref<boolean>,
  isCorrect: Ref<boolean>,
  feedbackExplanation: Ref<string>,
  matchedNodeId: Ref<string | null>,
  isCanvasTargetMode: Ref<boolean>,
): void {
  activeQuestion.value      = null;
  selectedAnswerIndex.value = null;
  isSubmitted.value         = false;
  isCorrect.value           = false;
  feedbackExplanation.value = '';
  matchedNodeId.value       = null;
  isCanvasTargetMode.value  = false;
}

/** Tạo verification result cho option answer */
export function verifyAndRecordOption(
  index: number,
  question: QuizQuestion,
  sessionCorrect: Ref<number>,
  sessionTotal: Ref<number>,
) {
  const result = QuizVerificationEngine.verifyOptionAnswer(index, question);
  sessionTotal.value++;
  if (result.isCorrect) sessionCorrect.value++;
  QuizStatsManager.saveAttempt(result.isCorrect, question.id);
  return result;
}
