import type { PathNode, UserQuizScore, AIRecommendation } from '../types/learning-path.types';

/** Passing score threshold (70%) */
const PASSING_THRESHOLD = 70;

/**
 * AI-powered recommendation engine for personalized learning paths.
 * Analyzes quiz scores to suggest review or advancement.
 */
export class PersonalizedPathEvaluator {
  /**
   * Evaluate and recommend the next optimal learning node.
   * Priority: weak scores first (review), then next unlocked node.
   */
  public static evaluateNextRecommendedNode(
    nodes: PathNode[],
    recentScores: UserQuizScore[]
  ): AIRecommendation {
    const weakQuiz = recentScores.find(
      (score) => score.scorePercentage < PASSING_THRESHOLD
    );

    if (weakQuiz) {
      return {
        recommendedNodeId: weakQuiz.algorithmId,
        recommendationReason: `Điểm thi của bạn ở ải này đạt ${weakQuiz.scorePercentage}%. Hãy dành thêm thời gian ôn tập lại sơ đồ để nắm vững kiến thức.`,
      };
    }

    const nextUnlockedNode = nodes.find((node) => node.status === 'UNLOCKED');
    if (nextUnlockedNode) {
      return {
        recommendedNodeId: nextUnlockedNode.id,
        recommendationReason: `Bạn học rất xuất sắc! Hãy sẵn sàng khám phá thử thách ải tiếp theo: ${nextUnlockedNode.title}.`,
      };
    }

    return {
      recommendedNodeId: '',
      recommendationReason:
        'Chúc mừng! Bạn đã chinh phục xuất sắc toàn bộ lộ trình học tập của VisualizationDSA.',
    };
  }

  /**
   * Calculate overall completion percentage across all nodes.
   */
  public static calculateCompletionPercentage(nodes: PathNode[]): number {
    if (nodes.length === 0) return 0;
    const completedCount = nodes.filter((n) => n.status === 'COMPLETED').length;
    return Math.round((completedCount / nodes.length) * 100);
  }

  /**
   * Get average score from recent quiz results.
   */
  public static getAverageScore(scores: UserQuizScore[]): number {
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, s) => sum + s.scorePercentage, 0);
    return Math.round(total / scores.length);
  }

  /**
   * Check if a score meets the passing threshold.
   */
  public static isPassingScore(scorePercentage: number): boolean {
    return scorePercentage >= PASSING_THRESHOLD;
  }
}
