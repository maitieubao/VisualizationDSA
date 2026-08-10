
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useQuizStore } from '../store/useQuizStore';
import { submitQuizAttempt } from '../service/quizApi';
import type { QuizQuestion, QuizCheckpoint } from '../types/quiz.types';

// QZ-006: mock quizApi để assert syncSessionToServer gửi đúng payload (quizId + answers).
vi.mock('../service/quizApi', () => ({
  submitQuizAttempt: vi.fn(async () => ({ score: 3, maxScore: 3, passed: true, xpAwarded: 100 })),
}));

vi.mock('../../auth/store/useAuthStore', () => ({
  useAuthStore: () => ({ getAccessToken: () => 'jwt-token' }),
}));

const mockMCQuestion: QuizQuestion = {
  id: 'q1',
  type: 'MULTIPLE_CHOICE',
  prompt: 'Test MC?',
  options: ['A', 'B', 'C'],
  correctOptionIndex: 1,
  explanation: 'B is correct.',
};

const mockTFQuestion: QuizQuestion = {
  id: 'q2',
  type: 'TRUE_FALSE',
  prompt: 'True or False?',
  options: ['True', 'False'],
  correctOptionIndex: 0,
  explanation: 'True is correct.',
};

const mockCanvasQuestion: QuizQuestion = {
  id: 'q3',
  type: 'CANVAS_TARGET',
  prompt: 'Click node C',
  targetNodeId: 'node_C',
  explanation: 'Node C is the answer.',
};

const mockCheckpoints: QuizCheckpoint[] = [
  { frameIndex: 1, question: mockMCQuestion },
  { frameIndex: 5, question: mockTFQuestion },
  { frameIndex: 10, question: mockCanvasQuestion },
];

describe('useQuizStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    // QZ-006: mock submitQuizAttempt phải sạch giữa các test.
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const store = useQuizStore();
    expect(store.activeQuestion).toBeNull();
    expect(store.isSubmitted).toBe(false);
    expect(store.isCorrect).toBe(false);
    expect(store.isQuizActive).toBe(false);
    expect(store.checkpoints.length).toBe(0);
  });

  it('should load checkpoints', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);

    expect(store.checkpoints.length).toBe(3);
    expect(store.completedCheckpointIndexes.length).toBe(0);
    expect(store.sessionCorrect).toBe(0);
    expect(store.sessionTotal).toBe(0);
  });

  it('should trigger checkpoint question at matching frameIndex', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(1);

    expect(store.activeQuestion).not.toBeNull();
    expect(store.activeQuestion?.id).toBe('q1');
    expect(store.isQuizActive).toBe(true);
    expect(store.isLectureLockedByQuiz).toBe(true);
  });

  it('should not trigger checkpoint for non-matching frameIndex', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(3);

    expect(store.activeQuestion).toBeNull();
    expect(store.isQuizActive).toBe(false);
  });

  it('should not re-trigger completed checkpoint (chỉ sau khi trả lời ĐÚNG — QZ-018)', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);

    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(1); // q1 đúng (correctOptionIndex=1)
    store.dismissQuestionAndContinue();
    expect(store.completedCheckpointIndexes).toContain(1);

    store.checkFrameForQuiz(1);
    expect(store.activeQuestion).toBeNull();
  });

  it('dismiss khi chưa trả lời đúng KHÔNG đánh dấu completed — được phép trả lời lại (QZ-018)', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);

    store.checkFrameForQuiz(1);
    store.dismissQuestionAndContinue();
    expect(store.completedCheckpointIndexes).not.toContain(1);

    store.checkFrameForQuiz(1);
    expect(store.activeQuestion).not.toBeNull();
  });

  it('should submit correct MC answer', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(1);

    expect(store.isSubmitted).toBe(true);
    expect(store.isCorrect).toBe(true);
    expect(store.feedbackExplanation).toContain('correct');
    expect(store.sessionCorrect).toBe(1);
    expect(store.sessionTotal).toBe(1);
  });

  it('should submit incorrect MC answer', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(0);

    expect(store.isSubmitted).toBe(true);
    expect(store.isCorrect).toBe(false);
    expect(store.sessionCorrect).toBe(0);
    expect(store.sessionTotal).toBe(1);
  });

  it('should not submit answer twice', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(1);

    store.submitOptionAnswer(1);
    store.submitOptionAnswer(0);

    expect(store.isCorrect).toBe(true);
    expect(store.sessionTotal).toBe(1);
  });

  it('should dismiss question and reset active state', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(1);
    store.dismissQuestionAndContinue();

    expect(store.activeQuestion).toBeNull();
    expect(store.isSubmitted).toBe(false);
    expect(store.isCorrect).toBe(false);
    expect(store.isQuizActive).toBe(false);
  });

  it('should calculate session accuracy', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);

    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(1);
    store.dismissQuestionAndContinue();

    store.checkFrameForQuiz(5);
    store.submitOptionAnswer(1);
    store.dismissQuestionAndContinue();

    expect(store.sessionAccuracy).toBe(50);
  });

  it('should handle canvas click answer with correct node', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(10);

    const nodes = [
      { id: 'node_A', x: 100, y: 100, radius: 20 },
      { id: 'node_C', x: 200, y: 200, radius: 20 },
    ];

    store.handleCanvasClickAnswer(202, 198, nodes);

    expect(store.isSubmitted).toBe(true);
    expect(store.isCorrect).toBe(true);
    expect(store.matchedNodeId).toBe('node_C');
  });

  it('should handle canvas click answer with wrong node', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(10);

    const nodes = [
      { id: 'node_A', x: 100, y: 100, radius: 20 },
      { id: 'node_C', x: 200, y: 200, radius: 20 },
    ];

    store.handleCanvasClickAnswer(102, 98, nodes);

    expect(store.isSubmitted).toBe(true);
    expect(store.isCorrect).toBe(false);
    expect(store.matchedNodeId).toBe('node_A');
  });

  it('should ignore canvas click on empty space', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(10);

    const nodes = [{ id: 'node_A', x: 100, y: 100, radius: 20 }];

    store.handleCanvasClickAnswer(500, 500, nodes);

    expect(store.isSubmitted).toBe(false);
  });

  it('should detect allCheckpointsCompleted', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);

    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(1);
    store.dismissQuestionAndContinue();

    store.checkFrameForQuiz(5);
    store.submitOptionAnswer(0);
    store.dismissQuestionAndContinue();

    expect(store.allCheckpointsCompleted).toBe(false);

    store.checkFrameForQuiz(10);
    const nodes = [{ id: 'node_C', x: 200, y: 200, radius: 20 }];
    store.handleCanvasClickAnswer(200, 200, nodes);
    store.dismissQuestionAndContinue();

    expect(store.allCheckpointsCompleted).toBe(true);
  });

  it('should reset quiz store completely', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(1);
    store.dismissQuestionAndContinue();

    store.resetQuizStore();

    expect(store.activeQuestion).toBeNull();
    expect(store.checkpoints.length).toBe(0);
    expect(store.completedCheckpointIndexes.length).toBe(0);
    expect(store.sessionCorrect).toBe(0);
    expect(store.sessionTotal).toBe(0);
    expect(store.isQuizActive).toBe(false);
    expect(store.allCheckpointsCompleted).toBe(false);
  });

  it('should not trigger quiz when another question is active', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);

    store.checkFrameForQuiz(1);
    expect(store.activeQuestion?.id).toBe('q1');

    store.checkFrameForQuiz(5);
    expect(store.activeQuestion?.id).toBe('q1');
  });

  it('should set isCanvasTargetMode for CANVAS_TARGET questions', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(10);

    expect(store.isCanvasTargetMode).toBe(true);
  });

  it('should not set isCanvasTargetMode for MC questions', () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints);
    store.checkFrameForQuiz(1);

    expect(store.isCanvasTargetMode).toBe(false);
  });

  it('QZ-006: truyền quizId → dismiss sau khi trả lời đúng hết sẽ sync XP lên server', async () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints, 'bubble-sort');

    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(1); // q1 MC đúng
    store.dismissQuestionAndContinue();

    store.checkFrameForQuiz(5);
    store.submitOptionAnswer(0); // q2 TF đúng
    store.dismissQuestionAndContinue();

    store.checkFrameForQuiz(10);
    store.handleCanvasClickAnswer(202, 198, [
      { id: 'node_A', x: 100, y: 100, radius: 20 },
      { id: 'node_C', x: 200, y: 200, radius: 20 },
    ]); // q3 CANVAS đúng
    expect(store.isCorrect).toBe(true);
    store.dismissQuestionAndContinue();

    await flushPromises();
    // Lưu ý: CANVAS_TARGET không có option index nên sessionAnswers giữ null → gửi -1
    // (thiết kế hiện tại — câu canvas không được chấm phía server, chỉ đếm session local).
    expect(submitQuizAttempt).toHaveBeenCalledWith(
      { quizId: 'bubble-sort', answers: [1, 0, -1] },
      'jwt-token',
    );
  });

  it('QZ-006: KHÔNG truyền quizId → syncSessionToServer không được gọi (không sync XP)', async () => {
    const store = useQuizStore();
    store.loadCheckpoints(mockCheckpoints); // thiếu quizId — trước đây VisualizationPlayer gọi nhầm dạng này

    store.checkFrameForQuiz(1);
    store.submitOptionAnswer(1);
    store.dismissQuestionAndContinue();

    await flushPromises();
    expect(submitQuizAttempt).not.toHaveBeenCalled();
  });
});
