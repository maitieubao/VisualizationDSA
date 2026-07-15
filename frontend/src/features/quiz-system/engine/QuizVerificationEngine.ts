import type { QuizQuestion, CanvasNodeDTO, VerificationResult } from '../types/quiz.types';

/**
 * QuizVerificationEngine — Client-side grading engine.
 * Handles Multiple Choice, True/False, and Canvas-targeted question verification.
 */
export class QuizVerificationEngine {
  /**
   * Verify a Multiple Choice or True/False answer by selected option index.
   */
  static verifyOptionAnswer(
    selectedIndex: number,
    question: QuizQuestion,
  ): VerificationResult {
    const isCorrect = selectedIndex === question.correctOptionIndex;
    return { isCorrect, explanation: question.explanation };
  }

  /**
   * Verify a Canvas click target answer using Euclidean distance hit detection.
   * Returns the matched node ID if a node was clicked.
   */
  static verifyCanvasClickAnswer(
    clickX: number,
    clickY: number,
    nodes: CanvasNodeDTO[],
    question: QuizQuestion,
  ): VerificationResult {
    if (question.type !== 'CANVAS_TARGET') {
      return { isCorrect: false, explanation: 'Kiểu câu hỏi không tương thích Canvas.' };
    }

    let clickedNode: CanvasNodeDTO | null = null;

    for (const node of nodes) {
      const dx = clickX - node.x;
      const dy = clickY - node.y;
      const distSquared = dx * dx + dy * dy;

      if (distSquared <= node.radius * node.radius) {
        clickedNode = node;
        break;
      }
    }

    if (!clickedNode) {
      return {
        isCorrect: false,
        explanation: 'Bạn nhấp chưa trúng đỉnh nào trên Canvas. Hãy nhìn kỹ sơ đồ và thử lại!',
      };
    }

    const isCorrect = clickedNode.id === question.targetNodeId;
    return {
      isCorrect,
      explanation: question.explanation,
      matchedNodeId: clickedNode.id,
    };
  }
}
