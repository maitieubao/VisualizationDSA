# 🛠 Technical Specification - Interactive Quiz System (Phase 1)

Tài liệu này đặc tả chi tiết kiến trúc kịch bản điểm dừng trắc nghiệm đột xuất, giải thuật nhận diện nhấp chọn đỉnh Canvas và quy trình lưu trữ điểm số cục bộ tại Client-side.

---

## 1. Hợp đồng Dữ liệu Trắc nghiệm (TypeScript Interfaces)

Để đảm bảo tính nhất quán và mở rộng linh hoạt các dạng câu hỏi mới, cấu trúc dữ liệu câu hỏi được định nghĩa chuẩn hóa:

```typescript
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CANVAS_TARGET';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;                  // Câu hỏi hiển thị dạng văn bản
  options?: string[];              // Các phương án lựa chọn (cho MC/TF)
  correctOptionIndex?: number;     // Đáp án đúng (0-indexed)
  targetNodeId?: string;           // Đỉnh đáp án đúng trên Canvas (cho CANVAS_TARGET)
  explanation: string;             // Lời giải thích lý thuyết chi tiết dạng Markdown
}

export interface QuizCheckpoint {
  frameIndex: number;              // Mốc khung hình kích hoạt điểm dừng trắc nghiệm
  question: QuizQuestion;          // Nội dung câu hỏi đính kèm
  isTriggered: boolean;            // Cờ đánh dấu đã hỏi ở phiên phát hiện tại hay chưa
}

export interface UserQuizStats {
  totalAttempts: number;
  correctAnswers: number;
  streak: number;
  completedQuizzes: string[];      // Danh sách ID thuật toán đã hoàn tất trắc nghiệm
}
```

---

## 2. Giải thuật Nhận diện nhấp chọn Đáp án Canvas (Canvas Collision Chấm điểm)

Đối với câu hỏi loại `CANVAS_TARGET`, khi người học click vào thẻ Canvas:
1.  Hệ thống nhận diện tọa độ điểm click chuột ($x, y$).
2.  Duyệt qua mảng `nodes` của `usePlaygroundStore` (hoặc store hoạt ảnh hiện hành).
3.  Tính toán khoảng cách Euclide để tìm đỉnh bị click trúng:
    $$d = \sqrt{(x - \text{node.x})^2 + (y - \text{node.y})^2}$$
4.  Nếu $d \le \text{node.radius}$, xác định người học đang nhấp chọn đỉnh có ID là `node.id`.
5.  Thực hiện đối chiếu với đáp án đúng của câu hỏi:
    ```typescript
    function verifyCanvasTargetAnswer(clickedNodeId: string, question: QuizQuestion): boolean {
      if (question.type !== 'CANVAS_TARGET') return false;
      return clickedNodeId === question.targetNodeId;
    }
    ```
6.  Nếu đúng: Hiện viền Neon Emerald quanh đỉnh vừa click, hiển thị lý thuyết giải thích và cộng điểm.
7.  Nếu sai: Đỉnh vừa nhấp lóe đỏ báo lỗi, rung thẻ Canvas báo hiệu nhầm lẫn và hiện giải thích sửa sai.

---

## 3. Quy trình Lưu trữ cục bộ (Local Storage Statistics)

Hệ thống lưu trữ thống kê ôn thi của học sinh xuống bộ nhớ duyệt trình `localStorage` dưới mã hóa khóa `dsa_quiz_statistics`:

*   **Đồng bộ điểm số:** Mỗi khi người học trả lời đúng, chỉ số `correctAnswers` tăng thêm 1, `streak` tăng thêm 1. Nếu trả lời sai, chỉ số `streak` tự động reset về 0.
*   **Mã nguồn lưu trữ:**
    ```typescript
    export class QuizStatsManager {
      private static STORAGE_KEY = 'dsa_quiz_statistics';

      public static getStats(): UserQuizStats {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) {
          return { totalAttempts: 0, correctAnswers: 0, streak: 0, completedQuizzes: [] };
        }
        return JSON.parse(data);
      }

      public static saveAttempt(isCorrect: boolean, quizId: string): void {
        const stats = this.getStats();
        stats.totalAttempts++;
        if (isCorrect) {
          stats.correctAnswers++;
          stats.streak++;
        } else {
          stats.streak = 0; // Đứt chuỗi trả lời đúng liên tục
        }
        
        if (isCorrect && !stats.completedQuizzes.includes(quizId)) {
          stats.completedQuizzes.push(quizId);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
      }
    }
    ```
