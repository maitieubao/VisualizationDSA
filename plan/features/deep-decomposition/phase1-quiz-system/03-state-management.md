# 🗄️ State Management - useQuizStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useQuizStore** chịu trách nhiệm điều khiển trạng thái các câu hỏi, kiểm soát nộp bài trắc nghiệm, khóa cứng tiến trình bài giảng E-Lecture và đồng bộ thành tích học tập cục bộ.

---

## 1. Cấu trúc Mã nguồn Store (`useQuizStore.ts`)

Mã nguồn store được viết theo cú pháp setup store tiêu chuẩn, cam kết quản lý an toàn và đồng bộ hai chiều liên Store:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLectureStore } from './useLectureStore';
import { QuizVerificationEngine, QuizQuestion, CanvasNodeDTO } from '../utils/QuizVerificationEngine';
import { QuizStatsManager } from '../utils/QuizStatsManager';

export const useQuizStore = defineStore('quiz', () => {
  const lectureStore = useLectureStore();

  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const activeQuestion = ref<QuizQuestion | null>(null);
  const selectedAnswerIndex = ref<number | null>(null);
  const isSubmitted = ref(false);
  const isCorrect = ref(false);
  const feedbackExplanation = ref('');
  const matchedNodeId = ref<string | null>(null); // Lưu ID đỉnh trúng (cho CANVAS_TARGET)
  
  // Danh sách các checkpoint đã hoàn tất ở phiên hiện tại để tránh kích hoạt lặp
  const completedCheckpointIndexes = ref<number[]>([]);

  // ==========================================
  // GETTERS (Bộ lọc tính toán dữ liệu)
  // ==========================================
  
  /**
   * Bài giảng E-Lecture bị khóa cứng hoàn toàn khi có câu hỏi trắc nghiệm đang mở
   */
  const isLectureLockedByQuiz = computed(() => activeQuestion.value !== null);

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Kích hoạt hiển thị câu hỏi trắc nghiệm (Điểm dừng Checkpoint đột xuất)
   */
  function triggerCheckpointQuestion(question: QuizQuestion, frameIndex: number) {
    activeQuestion.value = question;
    selectedAnswerIndex.value = null;
    isSubmitted.value = false;
    isCorrect.value = false;
    feedbackExplanation.value = '';
    matchedNodeId.value = null;

    // 1. Khóa tương tác của bộ điều khiển VCR Playback
    lectureStore.lockLectureInteraction();
    
    // Đánh dấu đã kích hoạt mốc này
    if (!completedCheckpointIndexes.value.includes(frameIndex)) {
      completedCheckpointIndexes.value.push(frameIndex);
    }
  }

  /**
   * Nộp phương án trả lời cho câu hỏi Multiple Choice / True False
   */
  function submitOptionAnswer(index: number) {
    if (!activeQuestion.value || isSubmitted.value) return;

    selectedAnswerIndex.value = index;
    isSubmitted.value = true;

    // Chạy động cơ chấm điểm
    const result = QuizVerificationEngine.verifyOptionAnswer(index, activeQuestion.value);
    
    isCorrect.value = result.isCorrect;
    feedbackExplanation.value = result.explanation;

    // Đồng bộ thống kê thành tích học tập cục bộ
    QuizStatsManager.saveAttempt(isCorrect.value, activeQuestion.value.id);
  }

  /**
   * Nhấp chuột nộp câu trả lời tương tác đỉnh Canvas (CANVAS_TARGET)
   */
  function handleCanvasClickAnswer(clickX: number, clickY: number, nodes: CanvasNodeDTO[]) {
    if (!activeQuestion.value || isSubmitted.value || activeQuestion.value.type !== 'CANVAS_TARGET') return;

    const result = QuizVerificationEngine.verifyCanvasClickAnswer(clickX, clickY, nodes, activeQuestion.value);
    
    isSubmitted.value = true;
    isCorrect.value = result.isCorrect;
    feedbackExplanation.value = result.explanation;
    matchedNodeId.value = result.matchedNodeId || null;

    // Đồng bộ thống kê thành tích học tập cục bộ
    QuizStatsManager.saveAttempt(isCorrect.value, activeQuestion.value.id);
  }

  /**
   * Bấm nút đóng câu hỏi mở khóa tiếp tục bài giảng E-Lecture
   */
  function dismissQuestionAndContinue() {
    activeQuestion.value = null;
    selectedAnswerIndex.value = null;
    isSubmitted.value = false;
    isCorrect.value = false;
    feedbackExplanation.value = '';
    matchedNodeId.value = null;

    // Giải phóng cờ khóa bài giảng, tháo dỡ Event Listener click Canvas
    lectureStore.unlockLectureInteraction();
    
    // Tự động kích hoạt tiếp tục phát hoạt ảnh từ mốc cũ
    lectureStore.resumeLecturePlayback();
  }

  /**
   * Làm mới toàn bộ phiên học trắc nghiệm hiện tại
   */
  function resetQuizStore() {
    activeQuestion.value = null;
    selectedAnswerIndex.value = null;
    isSubmitted.value = false;
    isCorrect.value = false;
    feedbackExplanation.value = '';
    matchedNodeId.value = null;
    completedCheckpointIndexes.value = [];
  }

  return {
    // States
    activeQuestion,
    selectedAnswerIndex,
    isSubmitted,
    isCorrect,
    feedbackExplanation,
    matchedNodeId,
    completedCheckpointIndexes,
    
    // Getters
    isLectureLockedByQuiz,
    
    // Actions
    triggerCheckpointQuestion,
    submitOptionAnswer,
    handleCanvasClickAnswer,
    dismissQuestionAndContinue,
    resetQuizStore
  };
});
```

---

## 2. Ý nghĩa thiết kế Mở khóa và Tự phát tiếp (Resume Auto-play)

Khi người học nhấn nút *"Tiếp tục bài giảng"* (`dismissQuestionAndContinue`):
*   **Không cần nhấn Play lại thủ công:** Hệ thống tự động gọi `lectureStore.resumeLecturePlayback()` giúp hoạt ảnh Canvas tự động dịch chuyển trơn tru tiếp tục chu kỳ hoạt động, giảm thiểu tối đa số click chuột không cần thiết cho người học.
*   **Duy trì chuỗi tập trung:** Chuyển đổi trạng thái mượt mà từ bảng trắc nghiệm mờ sương biến mất sang hoạt ảnh sắc nét sống động tức thì, tăng hiệu suất tiếp thu kiến thức.
