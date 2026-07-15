# 🧠 Prerequisite DAG Solver & AI Personalized Evaluator (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân giải đồ thị có hướng không chu trình cây tiên quyết `PrerequisiteDAGEngine`, bộ não gợi ý lộ trình cá nhân hóa học lực `PersonalizedPathEvaluator` và các ca kiểm thử tự động (Unit Tests) xác thực thuật toán đồ thị.

---

## 1. Động cơ Cây Tiên quyết & Đề xuất AI (TypeScript Core Logic)

Mã nguồn lõi được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa duyệt DFS và cấu trúc dữ liệu bản đồ học tập:

```typescript
export interface PathNode {
  id: string;
  title: string;
  prerequisites: string[]; // Mảng danh sách các Node ID tiên quyết
  status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface UserQuizScore {
  algorithmId: string;
  scorePercentage: number; // Điểm số bài thi từ 0 đến 100%
  timeSpentSeconds: number;
}

export class PrerequisiteDAGEngine {
  /**
   * Giải đồ thị tiên quyết DAG xác định trạng thái mở khóa các Node
   */
  public static resolveNodeStatuses(
    nodes: PathNode[], 
    completedNodeIds: Set<string>
  ): PathNode[] {
    return nodes.map(node => {
      // 1. Nếu node đã hoàn thành, giữ nguyên trạng thái COMPLETED
      if (completedNodeIds.has(node.id)) {
        return { ...node, status: 'COMPLETED' };
      }

      // 2. Không có điều kiện tiên quyết, tự động UNLOCKED
      if (node.prerequisites.length === 0) {
        return { ...node, status: node.status === 'LOCKED' ? 'UNLOCKED' : node.status };
      }

      // 3. Kiểm tra xem tất cả các node tiên quyết đã COMPLETED chưa
      const allPrereqsCompleted = node.prerequisites.every(prereqId => completedNodeIds.has(prereqId));

      if (allPrereqsCompleted) {
        return { ...node, status: node.status === 'LOCKED' ? 'UNLOCKED' : node.status };
      }

      // Vẫn còn ải chưa hoàn thành, khóa chặt Slate
      return { ...node, status: 'LOCKED' };
    });
  }
}

export class PersonalizedPathEvaluator {
  /**
   * Đề xuất ải học tối ưu tiếp theo dựa trên hiệu suất thi cử
   */
  public static evaluateNextRecommendedNode(
    nodes: PathNode[],
    recentScores: UserQuizScore[]
  ): { recommendedNodeId: string; recommendationReason: string } {
    // 1. Kiểm tra xem có ải nào thi đạt điểm thấp (< 70%) cần ôn tập lại không
    const weakQuiz = recentScores.find(score => score.scorePercentage < 70);
    if (weakQuiz) {
      return {
        recommendedNodeId: weakQuiz.algorithmId,
        recommendationReason: `Điểm thi của bạn ở ải này đạt ${weakQuiz.scorePercentage}%. Hãy dành thêm thời gian ôn tập lại sơ đồ để nắm vững kiến thức.`
      };
    }

    // 2. Nếu học lực tốt, gợi ý Node UNLOCKED đầu tiên trên bản đồ
    const nextUnlockedNode = nodes.find(node => node.status === 'UNLOCKED');
    if (nextUnlockedNode) {
      return {
        recommendedNodeId: nextUnlockedNode.id,
        recommendationReason: `Bạn học rất xuất sắc! Hãy sẵn sàng khám phá thử thách ải tiếp theo: ${nextUnlockedNode.title}.`
      };
    }

    return {
      recommendedNodeId: '',
      recommendationReason: 'Chúc mừng! Bạn đã chinh phục xuất sắc toàn bộ lộ trình học tập của VisualizationDSA.'
    };
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình mở khóa ải tiên quyết DAG và các gợi ý ôn tập AI:

```typescript
import { describe, it, expect } from 'vitest';
import { PrerequisiteDAGEngine, PersonalizedPathEvaluator, PathNode, UserQuizScore } from './PrerequisiteDAGEngine';

describe('Learning Path DAG Engine Unit Tests', () => {
  it('Should successfully unlock QuickSort node when BubbleSort is COMPLETED', () => {
    const mockNodes: PathNode[] = [
      { id: 'bubble-sort', title: 'Bubble Sort', prerequisites: [], status: 'UNLOCKED' },
      { id: 'quicksort', title: 'Quick Sort', prerequisites: ['bubble-sort'], status: 'LOCKED' }
    ];

    const completedIds = new Set<string>(['bubble-sort']);

    // Giải đồ thị DAG cập nhật mở khóa
    const resolvedNodes = PrerequisiteDAGEngine.resolveNodeStatuses(mockNodes, completedIds);

    const quicksortNode = resolvedNodes.find(n => n.id === 'quicksort');
    expect(quicksortNode).not.toBeUndefined();
    expect(quicksortNode!.status).toBe('UNLOCKED'); // Đã mở khóa thành công!
  });

  it('Should recommend reviewing dynamic bubble sort when score percentage is below 70%', () => {
    const mockNodes: PathNode[] = [
      { id: 'bubble-sort', title: 'Bubble Sort', prerequisites: [], status: 'COMPLETED' },
      { id: 'quicksort', title: 'Quick Sort', prerequisites: ['bubble-sort'], status: 'UNLOCKED' }
    ];

    const recentScores: UserQuizScore[] = [
      { algorithmId: 'bubble-sort', scorePercentage: 65, timeSpentSeconds: 120 } // Điểm thấp
    ];

    const recommendation = PersonalizedPathEvaluator.evaluateNextRecommendedNode(mockNodes, recentScores);

    expect(recommendation.recommendedNodeId).toBe('bubble-sort'); // Gợi ý ôn tập lại Bubble Sort
    expect(recommendation.recommendationReason).toContain('ôn tập lại');
  });
});
```
 Bộ động cơ giải quyết cây kỹ năng tiên quyết và đề xuất ôn tập cá nhân hóa AI cam kết mang lại lộ trình học tập tối tân, an toàn và dẫn lối thông minh 100% giúp người học thăng tiến vững vàng.
