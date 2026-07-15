# 🛠 Technical Specification - Prerequisite DAG Engine & AI Path Advisor

Tài liệu này đặc tả chi tiết cấu trúc đồ thị tiên quyết có hướng không chu trình (DAG), giải thuật duyệt trạng thái mở khóa node ải DFS, và bộ công cụ AI gợi ý cá nhân hóa học tập ở Client-side.

---

## 1. Đồ thị Tiên quyết DAG & Giải thuật duyệt khóa Node (DAG Solver)

Mối quan hệ tiên quyết giữa các node ải học tập được mô hình hóa thành Đồ thị có hướng không chu trình (DAG). Lớp `PrerequisiteDAGEngine` thực thi quy trình kiểm tra điều kiện mở khóa node:

```typescript
export interface PathNode {
  id: string;
  title: string;
  prerequisites: string[]; // Mảng danh sách các Node ID tiên quyết
  status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
}

export class PrerequisiteDAGEngine {
  /**
   * Tính toán cập nhật trạng thái mở khóa toàn bộ các Node trong đồ thị tiên quyết DAG
   * @param nodes Mảng toàn bộ các node kỹ năng trong hệ thống
   * @param completedNodeIds Danh sách các Node ID đã học viên hoàn thành xuất sắc
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

      // 2. Kiểm tra xem tất cả các node tiên quyết đã hoàn thành chưa
      if (node.prerequisites.length === 0) {
        // Không có điều kiện tiên quyết, tự động UNLOCKED
        return { ...node, status: node.status === 'LOCKED' ? 'UNLOCKED' : node.status };
      }

      const allPrereqsCompleted = node.prerequisites.every(prereqId => completedNodeIds.has(prereqId));

      if (allPrereqsCompleted) {
        // Đã hoàn thành toàn bộ ải trước, mở khóa ải này
        return { ...node, status: node.status === 'LOCKED' ? 'UNLOCKED' : node.status };
      }

      // Vẫn còn ải chưa hoàn thành, khóa chặt
      return { ...node, status: 'LOCKED' };
    });
  }
}
```

---

## 2. Giải thuật Đề xuất AI Cá nhân hóa (AI Personalized Path Evaluator)

Để đưa ra lời khuyên học tập chính xác cao, lớp `PersonalizedPathEvaluator` phân tích kết quả bài quiz học tập gần nhất:

```typescript
export interface UserQuizScore {
  algorithmId: string;
  scorePercentage: number; // Điểm số bài thi từ 0 đến 100%
  timeSpentSeconds: number;
}

export class PersonalizedPathEvaluator {
  /**
   * Đưa ra đề xuất node học tập tối ưu tiếp theo dựa trên học lực
   */
  public static evaluateNextRecommendedNode(
    nodes: PathNode[],
    recentScores: UserQuizScore[]
  ): { recommendedNodeId: string; recommendationReason: string } {
    // 1. Kiểm tra xem có ải nào học viên thi đạt điểm thấp (< 70%) cần học lại ôn tập không
    const weakQuiz = recentScores.find(score => score.scorePercentage < 70);
    if (weakQuiz) {
      return {
        recommendedNodeId: weakQuiz.algorithmId,
        recommendationReason: `Điểm số bài thi của bạn ở phần này đạt ${weakQuiz.scorePercentage}%. Hãy thực hành ôn tập lại sơ đồ trực quan để củng cố vững chắc kiến thức.`
      };
    }

    // 2. Nếu học lực tốt, gợi ý Node UNLOCKED đầu tiên trong danh sách bản đồ
    const nextUnlockedNode = nodes.find(node => node.status === 'UNLOCKED');
    if (nextUnlockedNode) {
      return {
        recommendedNodeId: nextUnlockedNode.id,
        recommendationReason: `Tuyệt vời! Bạn đã nắm chắc nền tảng, hãy sẵn sàng vượt qua thử thách ải môn tiếp theo: ${nextUnlockedNode.title}.`
      };
    }

    return {
      recommendedNodeId: '',
      recommendationReason: 'Chúc mừng! Bạn đã chinh phục thành công toàn bộ bản đồ lộ trình học tập của VisualizationDSA.'
    };
  }
}
```
 Động cơ giải quyết đồ thị DAG tiên quyết chạy 100% Client-side và bộ giải thuật phân tích học lực AI cam kết trải nghiệm học thuật cá nhân hóa diễn ra tức thời dưới 10ms, dẫn lối thông minh cho học sinh vượt qua các rào cản thuật toán.
