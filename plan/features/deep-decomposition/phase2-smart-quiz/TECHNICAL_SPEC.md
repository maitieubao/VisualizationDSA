# 🛠 Technical Specification - Quiz Execution Engine & Playback Interceptor

Tài liệu này đặc tả chi tiết kiến trúc hạt nhân của bộ đánh chặn phát hoạt ảnh VCR Playback Interceptor, giải thuật chấm điểm tương tác SVG Node Binding và cơ chế tích hợp điểm thưởng XP Gamification.

---

## 1. Trình đánh chặn Dòng thời gian VCR (VCR Playback Interceptor Hook)

Để đảm bảo câu hỏi trắc nghiệm tự động kích hoạt dừng giải thuật mượt mà, hệ thống chèn một hàm hook chặn đứng dòng chảy thời gian của bộ máy phát hoạt ảnh:

```typescript
export interface InteractiveQuizQuestion {
  quizId: string;
  triggerStepIndex: number;
  questionType: 'SVG_NODE_CLICK' | 'MONACO_LINE_CLICK' | 'MULTIPLE_CHOICE';
  promptText: string;
  correctAnswers: string[]; // Mảng chứa ID các node SVG hoặc các số dòng code đúng
  explanationMarkdown: string;
  xpReward: number;
}

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
   * Bộ lọc chặn đứng bước thời gian (kích hoạt mỗi khi timeline thay đổi step)
   * @param currentStepIndex Chỉ số bước giải thuật tiếp theo chuẩn bị chạy
   * @returns true nếu bị chặn bởi quiz, false nếu an toàn cho tua tiếp
   */
  public interceptStep(nextStepIndex: number): boolean {
    if (this.activeQuizzes.has(nextStepIndex)) {
      const quiz = this.activeQuizzes.get(nextStepIndex)!;
      
      // Kích hoạt callback dừng VCR Play, khóa tua, hiển thị Slide-in Overlay
      this.quizTriggerCallback(quiz);
      
      // Xóa khỏi danh sách để tránh lặp vô hạn khi học viên đã trả lời xong và tua lại
      this.activeQuizzes.delete(nextStepIndex);
      return true;
    }
    return false;
  }
}
```

---

## 2. Giải thuật Chấm điểm Tương tác SVG Node Binding (SVG Target Resolver)

Khi sinh viên bấm trực tiếp vào các bar mảng hay node cây trên Canvas SVG để chọn làm đáp án, hạ tầng bắt tọa độ click thông qua kỹ thuật Event Delegation lắng nghe từ thẻ cha `<svg>`:

```typescript
export class SVGTargetResolver {
  /**
   * Phân giải thẻ đồ họa SVG được click dựa trên data-node-id
   */
  public static resolveSelectedNodeId(event: MouseEvent): string | null {
    const target = event.target as SVGElement;
    
    // Tìm phần tử gần nhất chứa ID mô tả nút dữ liệu
    const interactiveParent = target.closest('[data-node-id]');
    if (!interactiveParent) return null;

    return interactiveParent.getAttribute('data-node-id');
  }

  /**
   * So khớp đáp án người học lựa chọn với bộ đáp án đúng thuần RAM
   */
  public static evaluateAnswers(
    selectedIds: string[], 
    correctIds: string[]
  ): { isCorrect: boolean; missingIds: string[]; extraIds: string[] } {
    const correctSet = new Set(correctIds);
    const selectedSet = new Set(selectedIds);

    const missingIds = correctIds.filter(id => !selectedSet.has(id));
    const extraIds = selectedIds.filter(id => !correctSet.has(id));

    const isCorrect = missingIds.length === 0 && extraIds.length === 0;

    return {
      isCorrect,
      missingIds,
      extraIds
    };
  }
}
```
 Trình đánh chặn VCR Playback Interceptor kết hợp cùng giải thuật đối chiếu nút SVG Node Click giải quyết toàn diện tính tương tác bám sát ngữ cảnh của bộ máy trắc nghiệm, nâng tầm trải nghiệm dạy học thuật toán sinh động vô song.
