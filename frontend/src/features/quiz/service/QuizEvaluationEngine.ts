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

    const passed = maxPossible > 0 ? (score >= maxPossible * 0.8) : true; // Ngưỡng đạt 80% điểm số
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
