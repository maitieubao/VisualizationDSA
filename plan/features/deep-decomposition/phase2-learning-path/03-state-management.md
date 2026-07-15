# 🗄️ State Management - useLearningPathStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useLearningPathStore** chịu trách nhiệm điều phối trạng thái mở khóa bản đồ kỹ năng RPG Map, quản lý tiến độ hoàn thành các ải môn của sinh viên và đồng bộ lưu trữ.

---

## 1. Cấu trúc Mã nguồn Store (`useLearningPathStore.ts`)

Mã nguồn store được viết theo mô hình setup store tối ưu, tích hợp bộ giải đồ thị tiên quyết DAG:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { PathNode, PrerequisiteDAGEngine, PersonalizedPathEvaluator, UserQuizScore } from '../utils/PrerequisiteDAGEngine';

export const useLearningPathStore = defineStore('learningPath', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const rawNodes = ref<PathNode[]>([
    { id: 'bubble-sort', title: 'Bubble Sort', prerequisites: [], status: 'UNLOCKED' },
    { id: 'quicksort', title: 'Quick Sort Recursion', prerequisites: ['bubble-sort'], status: 'LOCKED' },
    { id: 'binary-tree', title: 'Binary Search Tree', prerequisites: ['quicksort'], status: 'LOCKED' },
    { id: 'solid-uml', title: 'SOLID Design Patterns', prerequisites: ['binary-tree'], status: 'LOCKED' }
  ]);

  const completedNodeIds = ref<Set<string>>(new Set(['bubble-sort']));
  const activeNodeId = ref('quicksort');
  const userScoresHistory = ref<UserQuizScore[]>([
    { algorithmId: 'bubble-sort', scorePercentage: 85, timeSpentSeconds: 90 }
  ]);

  // ==========================================
  // GETTERS (Tự động giải đồ thị DAG & AI Gợi ý)
  // ==========================================
  
  /**
   * Giải đồ thị DAG trả về trạng thái mở khóa node reactive
   */
  const resolvedNodes = computed(() => {
    return PrerequisiteDAGEngine.resolveNodeStatuses(rawNodes.value, completedNodeIds.value);
  });

  /**
   * Gọi bộ não AI chấm điểm và đưa ra đề xuất ải tiếp theo
   */
  const aiRecommendedNode = computed(() => {
    return PersonalizedPathEvaluator.evaluateNextRecommendedNode(resolvedNodes.value, userScoresHistory.value);
  });

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Đánh dấu hoàn thành xuất sắc một ải môn giải thuật
   */
  async function completeNodeMilestone(nodeId: string, finalScore: number, timeSpent: number) {
    // 1. Thêm vào danh sách hoàn thành
    completedNodeIds.value.add(nodeId);

    // 2. Lưu lịch sử điểm số bài thi phục vụ AI đánh giá
    userScoresHistory.value.push({
      algorithmId: nodeId,
      scorePercentage: finalScore,
      timeSpentSeconds: timeSpent
    });

    // 3. Đồng bộ offline vào LocalStorage bảo toàn tiến trình
    saveProgressToLocalStorage();

    // 4. Đồng bộ đẩy lên Database Supabase ở background
    try {
      await fetch('/api/v1/learning-path/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedNodes: Array.from(completedNodeIds.value),
          scores: userScoresHistory.value
        })
      });
    } catch (err) {
      console.warn('Lỗi kết nối máy chủ, tiến độ được lưu trữ an toàn offline.');
    }
  }

  /**
   * Lưu trữ offline LocalStorage
   */
  function saveProgressToLocalStorage() {
    localStorage.setItem('learning_path_completed', JSON.stringify(Array.from(completedNodeIds.value)));
    localStorage.setItem('learning_path_scores', JSON.stringify(userScoresHistory.value));
  }

  /**
   * Khôi phục tiến trình khi khởi chạy ứng dụng
   */
  function loadProgressFromLocalStorage() {
    const savedCompleted = localStorage.getItem('learning_path_completed');
    const savedScores = localStorage.getItem('learning_path_scores');

    if (savedCompleted) {
      completedNodeIds.value = new Set(JSON.parse(savedCompleted));
    }
    if (savedScores) {
      userScoresHistory.value = JSON.parse(savedScores);
    }
  }

  return {
    rawNodes,
    completedNodeIds,
    activeNodeId,
    resolvedNodes,
    aiRecommendedNode,
    completeNodeMilestone,
    loadProgressFromLocalStorage
  };
});
```

---

## 2. Giao diện Đồ họa Tự động Đồng bộ Cây Kỹ năng

Bằng việc kết hợp Pinia Setup Store với thuộc tính computed đồ thị DAG:
*   **Mở khóa cầu nối ánh sáng thời gian thực (Zero Lag):** Ngay khi sinh viên vượt qua ải Bubble Sort, thuộc tính computed lập tức giải lại đồ thị DAG mở khóa ải QuickSort, tự động kích hoạt cầu nối laser bập bùng năng lượng dưới 10ms.
*   **Đề xuất AI linh hoạt:** Gợi ý ôn tập hay thăng cấp tự động thay đổi nhạy bén dựa trên mảng điểm thi `userScoresHistory` giúp học viên luôn có định hướng học tập tối ưu.
