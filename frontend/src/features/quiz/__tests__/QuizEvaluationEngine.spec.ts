import { describe, it, expect } from 'vitest';
import { 
  QuizEvaluationEngine, 
  type QuizQuestion, 
  LecturePlaybackCoordinator, 
  type SlideEvent 
} from '../service/QuizEvaluationEngine';

describe('Sprint 4 Interactive Quiz & Lecture Unit Tests', () => {
  it('Should successfully transition slide index and trigger playback sync callbacks', () => {
    let triggeredEvent: any = null;
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

    // Chuyển slide tiếp nữa (không vượt giới hạn)
    coordinator.nextSlide();
    expect(coordinator.getCurrentSlideIndex()).toBe(1);

    // Lùi slide lý thuyết
    coordinator.prevSlide();
    expect(coordinator.getCurrentSlideIndex()).toBe(0);
    expect(triggeredEvent?.slideId).toBe('slide-1');

    // Lùi tiếp (không vượt giới hạn)
    coordinator.prevSlide();
    expect(coordinator.getCurrentSlideIndex()).toBe(0);
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

  it('Should evaluate quiz answers and calculate correct scores and check passing threshold of 80%', () => {
    const questions: QuizQuestion[] = [
      { id: 'q1', correctAnswer: 'A', maxScore: 10 },
      { id: 'q2', correctAnswer: 'B', maxScore: 10 },
      { id: 'q3', correctAnswer: 'C', maxScore: 10 },
      { id: 'q4', correctAnswer: 'D', maxScore: 10 },
      { id: 'q5', correctAnswer: 'A', maxScore: 10 }
    ];

    // 5 questions, total 50 score. 80% passing threshold is 40 points (4 correct answers)
    
    // Case 1: 5/5 correct (100%) -> passed
    const res1 = QuizEvaluationEngine.calculateQuizScore(
      { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'A' },
      questions
    );
    expect(res1.totalScore).toBe(50);
    expect(res1.passed).toBe(true);

    // Case 2: 4/5 correct (80%) -> passed
    const res2 = QuizEvaluationEngine.calculateQuizScore(
      { q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'B' }, // q5 incorrect
      questions
    );
    expect(res2.totalScore).toBe(40);
    expect(res2.passed).toBe(true);

    // Case 3: 3/5 correct (60%) -> failed
    const res3 = QuizEvaluationEngine.calculateQuizScore(
      { q1: 'A', q2: 'B', q3: 'C', q4: 'C', q5: 'B' }, // q4, q5 incorrect
      questions
    );
    expect(res3.totalScore).toBe(30);
    expect(res3.passed).toBe(false);
  });
});
