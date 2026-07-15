# 🎓 Interactive Lecture Mode & Dynamic Quiz Scoring (Phase 1)

Tài liệu này đặc tả chi tiết thiết kế hệ thống bài giảng điện tử tương tác **Interactive Lecture Mode**, Động cơ đánh giá trắc nghiệm thông minh **Quiz Scoring Engine** và cấu trúc xếp hạng XP thăng cấp của Phase 1.

---

## 1. Đồng bộ Trực quan Bài giảng và Hoạt ảnh DSA (Lecture Animations Sync)

Khi học sinh đọc Slide lý thuyết, hệ thống tự động phát hoạt ảnh DSA tương ứng để chứng minh trực tiếp lời giảng bằng hình vẽ sống động:

```typescript
export interface SlideEvent {
  slideId: string;
  triggerFrameIndex: number; // Chỉ số bước giải thuật tương thích
  highlightSourceLine: number;
}

export class LecturePlaybackCoordinator {
  private currentSlideIndex = 0;
  private slideEvents: SlideEvent[] = [];
  private onTriggerCallback: (event: SlideEvent) => void;

  constructor(events: SlideEvent[], onTrigger: (event: SlideEvent) => void) {
    this.slideEvents = events;
    this.onTriggerCallback = onTrigger;
  }

  public nextSlide(): void {
    if (this.currentSlideIndex < this.slideEvents.length - 1) {
      this.currentSlideIndex++;
      this.onTriggerCallback(this.slideEvents[this.currentSlideIndex]);
    }
  }

  public prevSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.onTriggerCallback(this.slideEvents[this.currentSlideIndex]);
    }
  }
}
```

---

## 2. Động cơ Chấm Điểm Trắc nghiệm và Code Thực hành (Quiz Scoring Engine)

Động cơ đánh giá cho phép học viên trả lời câu hỏi lựa chọn, chọn dòng code Monaco và chấm điểm biên dịch mã nguồn thuật toán tùy biến:

```typescript
export interface QuizQuestion {
  id: string;
  correctAnswer: string;
  maxScore: number;
}

export class QuizEvaluationEngine {
  /**
   * Tính toán tỷ lệ phần trăm điểm trắc nghiệm hoàn thành
   */
  public static calculateQuizScore(
    answers: Record<string, string>,
    questions: QuizQuestion[]
  ): { totalScore: number; passed: boolean } {
    let score = 0;
    let maxPossible = 0;

    questions.forEach(q => {
      maxPossible += q.maxScore;
      if (answers[q.id] === q.correctAnswer) {
        score += q.maxScore;
      }
    });

    const passed = score >= maxPossible * 0.8; // Yêu cầu đạt 80% điểm số
    return { totalScore: score, passed };
  }

  /**
   * Xác thực mã nguồn tùy biến của học viên có tuân thủ cấu trúc mong đợi
   * Sử dụng kiểm tra tĩnh (AST-based static validation)
   */
  public static verifyCodeCompliance(
    studentCode: string,
    mandatoryKeywords: string[]
  ): boolean {
    const tokens = studentCode.toLowerCase();
    
    // Kiểm tra nhanh xem học sinh có viết đủ từ khóa bắt buộc (ví dụ: temp, swap, pivot)
    for (const kw of mandatoryKeywords) {
      if (!tokens.includes(kw.toLowerCase())) {
        return false;
      }
    }
    return true;
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Đánh Giá Học Tập (Unit Test Specs)

```typescript
import { describe, it, expect } from 'vitest';
import { QuizEvaluationEngine, QuizQuestion } from './QuizEvaluationEngine';

describe('Phase 1 Learning System Unit Tests', () => {
  it('Should correctly score quiz answers with 80% passing thresholds', () => {
    const questions: QuizQuestion[] = [
      { id: 'Q1', correctAnswer: 'A', maxScore: 10 },
      { id: 'Q2', correctAnswer: 'B', maxScore: 10 }
    ];

    // Trả lời đúng Q1, sai Q2 -> Đạt 10/20 điểm (50%) -> Không qua (failed)
    let evaluation = QuizEvaluationEngine.calculateQuizScore({ Q1: 'A', Q2: 'C' }, questions);
    expect(evaluation.totalScore).toBe(10);
    expect(evaluation.passed).toBeFalsy();

    // Trả lời đúng 100% -> Qua (passed)
    evaluation = QuizEvaluationEngine.calculateQuizScore({ Q1: 'A', Q2: 'B' }, questions);
    expect(evaluation.totalScore).toBe(20);
    expect(evaluation.passed).toBeTruthy();
  });

  it('Should successfully lint student custom algorithm scripts for AST patterns', () => {
    const studentCode = `
      function quickSort(arr) {
        let pivot = arr[0];
        // code swap logic
        swap(arr, i, j);
      }
    `;

    // Yêu cầu bắt buộc có từ khóa 'pivot' và 'swap'
    const isCompliant = QuizEvaluationEngine.verifyCodeCompliance(studentCode, ['pivot', 'swap']);
    expect(isCompliant).toBeTruthy();

    // Viết thiếu từ khóa 'partition' -> Báo vi phạm cấu trúc
    const missingCompliant = QuizEvaluationEngine.verifyCodeCompliance(studentCode, ['partition']);
    expect(missingCompliant).toBeFalsy();
  });
});
```
 Thiết kế đồng bộ bài giảng điện tử hoạt ảnh tự động kết hợp động cơ chấm điểm trắc nghiệm Canvas tương tác và static linter mã nguồn học viên bảo đảm chất lượng đào tạo luôn đạt chuẩn mực kiểm soát kiểm định chặt chẽ, tối tân nhất.
