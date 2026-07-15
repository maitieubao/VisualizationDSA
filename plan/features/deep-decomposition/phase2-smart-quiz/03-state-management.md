# 🗄️ State Management - useSmartQuizStore (Pinia Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của Pinia Setup Store **useSmartQuizStore** chịu trách nhiệm quản lý danh sách câu hỏi trắc nghiệm, các lựa chọn node/line thời gian thực và tích hợp thăng điểm XP.

---

## 1. Cấu trúc Mã nguồn Store (`useSmartQuizStore.ts`)

Mã nguồn store được viết theo mô hình setup store tối ưu, tích hợp đồng bộ:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { QuizEvaluationEngine, InteractiveQuizQuestion } from '../utils/QuizEvaluationEngine';

export const useSmartQuizStore = defineStore('smartQuiz', () => {
  // ==========================================
  // STATE (Trạng thái)
  // ==========================================
  const activeQuiz = ref<InteractiveQuizQuestion | null>(null);
  const isQuizVisible = ref(false);
  
  // Danh sách các ID node SVG hoặc các số dòng Monaco học viên đang click chọn làm đáp án
  const selectedAnswers = ref<string[]>([]);
  
  const evaluationResult = ref<{
    hasSubmitted: boolean;
    isCorrect: boolean;
    scorePercentage: number;
  }>({
    hasSubmitted: false,
    isCorrect: false,
    scorePercentage: 0
  });

  const xpAwarded = ref(0);

  // ==========================================
  // ACTIONS (Hành động điều khiển)
  // ==========================================

  /**
   * Kích hoạt hiển thị câu hỏi trắc nghiệm dừng giải thuật
   */
  function triggerQuiz(question: InteractiveQuizQuestion) {
    activeQuiz.value = question;
    selectedAnswers.value = [];
    isQuizVisible.value = true;
    evaluationResult.value = {
      hasSubmitted: false,
      isCorrect: false,
      scorePercentage: 0
    };
    xpAwarded.value = 0;
  }

  /**
   * Click chọn hoặc bỏ chọn một đáp án tương tác (Toggle selection)
   */
  function toggleAnswerSelection(id: string) {
    if (evaluationResult.value.hasSubmitted) return; // Đã nộp bài, khóa tương tác chọn

    const index = selectedAnswers.value.indexOf(id);
    if (index > -1) {
      selectedAnswers.value.splice(index, 1); // Đã chọn -> Bỏ chọn
    } else {
      // Giới hạn chỉ cho chọn tối đa bằng số đáp án đúng cấu hình để tránh spam click tràn lan
      if (activeQuiz.value && selectedAnswers.value.length < activeQuiz.value.correctAnswers.length) {
        selectedAnswers.value.push(id);
      }
    }
  }

  /**
   * Nộp bài chấm điểm trực tiếp dưới RAM
   */
  function submitAnswers(): boolean {
    if (!activeQuiz.value || selectedAnswers.value.length === 0) return false;

    const evaluation = QuizEvaluationEngine.evaluate(
      selectedAnswers.value,
      activeQuiz.value.correctAnswers
    );

    evaluationResult.value = {
      hasSubmitted: true,
      isCorrect: evaluation.isCorrect,
      scorePercentage: evaluation.scorePercentage
    };

    if (evaluation.isCorrect) {
      xpAwarded.value = activeQuiz.value.xpReward;
      
      // Kích hoạt nổ confetti pháo hoa ăn mừng ở Client-side
      triggerConfetti();
    }

    return evaluation.isCorrect;
  }

  /**
   * Đóng hộp trắc nghiệm trượt ẩn đi, khôi phục dòng chạy giải thuật
   */
  function closeQuiz() {
    isQuizVisible.value = false;
    activeQuiz.value = null;
    selectedAnswers.value = [];
    evaluationResult.value = {
      hasSubmitted: false,
      isCorrect: false,
      scorePercentage: 0
    };
  }

  /**
   * Hàm giả lập gọi Confetti ăn mừng
   */
  function triggerConfetti() {
    const confettiEvent = new CustomEvent('TRIGGER_CONFETTI_RAIN');
    window.dispatchEvent(confettiEvent);
  }

  return {
    activeQuiz,
    isQuizVisible,
    selectedAnswers,
    evaluationResult,
    xpAwarded,
    triggerQuiz,
    toggleAnswerSelection,
    submitAnswers,
    closeQuiz
  };
});
```

---

## 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store

Bằng việc kết hợp Pinia Setup Store với động cơ `QuizEvaluationEngine` giải quyết so khớp đáp án:
*   **Trải nghiệm tương tác mượt mà:** Khóa tương tác chọn `hasSubmitted` ngay sau khi nộp bài cam kết tính minh bạch của điểm số.
*   **Hạt confetti bùng nổ ăn mừng:** Bắn sự kiện `TRIGGER_CONFETTI_RAIN` ra hệ thống giúp bừng sáng màn hình ăn mừng vô cùng bắt mắt, khích lệ người học.
