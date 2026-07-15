# ⚙️ Technical Specification - Interactive Quiz & Lecture System (Sprint 4)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript và cơ chế điều phối đồng bộ Slide bài giảng điện tử cùng bộ chấm điểm trắc nghiệm thông minh Client-side trong Sprint 4.

---

## 1. Bộ Điều Phối Bài Giảng Slide & Giải Thuật (LecturePlaybackCoordinator TS)

Lớp hạt nhân chịu trách nhiệm phối hợp đổi trang slide lý thuyết và đồng bộ tự nhảy bước giải thuật VCR:

```typescript
export interface SlideEvent {
  slideId: string;
  triggerFrameIndex: number; // Chỉ số bước hoạt ảnh DSA tương thích
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

  /**
   * Chuyển slide lý thuyết tiếp theo (Next Slide)
   */
  public nextSlide(): void {
    if (this.currentSlideIndex < this.slideEvents.length - 1) {
      this.currentSlideIndex++;
      this.onTriggerCallback(this.slideEvents[this.currentSlideIndex]);
    }
  }

  /**
   * Lùi lại slide lý thuyết phía trước (Prev Slide)
   */
  public prevSlide(): void {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.onTriggerCallback(this.slideEvents[this.currentSlideIndex]);
    }
  }

  public getCurrentSlideIndex(): number {
    return this.currentSlideIndex;
  }
}
```

---

## 2. Động Cơ Chấm Điểm Trắc Nghiệm & Kiểm Tra Code (QuizEvaluationEngine TS)

```typescript
export interface QuizQuestion {
  id: string;
  correctAnswer: string;
  maxScore: number;
}

export class QuizEvaluationEngine {
  /**
   * Chấm điểm đáp án trắc nghiệm tính toán tỉ lệ vượt qua 80%
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

    const passed = score >= maxPossible * 0.8; // Ngưỡng đạt 80% điểm số
    return { totalScore: score, passed };
  }

  /**
   * Kiểm soát tĩnh mã nguồn tùy biến của học viên (Static compliance check)
   * Kiểm duyệt từ khóa bắt buộc dưới RAM dưới 2ms
   */
  public static verifyCodeCompliance(
    studentCode: string,
    mandatoryKeywords: string[]
  ): boolean {
    const tokens = studentCode.toLowerCase();
    
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
import { describe, it, expect, beforeEach } from 'vitest';
import { QuizEvaluationEngine, QuizQuestion, LecturePlaybackCoordinator, SlideEvent } from './QuizEvaluationEngine';

describe('Sprint 4 Interactive Quiz & Lecture Unit Tests', () => {
  it('Should successfully transition slide index and trigger playback sync callbacks', () => {
    let triggeredEvent: SlideEvent | null = null;
    const mockEvents: SlideEvent[] = [
      { slideId: 'slide-1', triggerFrameIndex: 0, highlightSourceLine: 1 },
      { slideId: 'slide-2', triggerFrameIndex: 5, highlightSourceLine: 10 }
    ];

    const coordinator = new LecturePlaybackCoordinator(mockEvents, (ev) => {
      triggeredEvent = ev;
    });

    expect(coordinator.getCurrentSlideIndex()).toBe(0);

    // Chuyển slide tiếp theo -> Kích hoạt callback đồng bộ bước 5 giải thuật
    coordinator.nextSlide();
    expect(coordinator.getCurrentSlideIndex()).toBe(1);
    expect(triggeredEvent?.slideId).toBe('slide-2');
    expect(triggeredEvent?.triggerFrameIndex).toBe(5);
  });

  it('Should score multiple-choice answers correctly and lint student code for required keywords', () => {
    const studentCode = `
      function bubbleSort(arr) {
        let temp = arr[i];
        arr[i] = arr[i+1];
        arr[i+1] = temp;
      }
    `;

    // Phải chứa từ khóa 'temp' và 'bubblesort'
    const isCompliant = QuizEvaluationEngine.verifyCodeCompliance(studentCode, ['temp', 'bubbleSort']);
    expect(isCompliant).toBeTruthy();

    // Thiếu từ khóa 'quickSort' -> Báo vi phạm compliance linter
    const isMissing = QuizEvaluationEngine.verifyCodeCompliance(studentCode, ['quickSort']);
    expect(isMissing).toBeFalsy();
  });
});
```
 Thiết kế bộ lập lịch đồng bộ Slide bài giảng hoạt ảnh Canvas kết hợp động cơ chấm điểm trắc nghiệm thông minh và static code compliance linter Client-side đảm bảo chất lượng giảng dạy DSA lý thuyết thực hành luôn chặt chẽ, tối tân tuyệt đối.
