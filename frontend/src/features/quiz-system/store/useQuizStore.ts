import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLectureStore } from '../../e-lecture/store/useLectureStore';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { QuizVerificationEngine } from '../engine/QuizVerificationEngine';
import { QuizStatsManager } from '../engine/QuizStatsManager';
import type { QuizQuestion, QuizCheckpoint, CanvasNodeDTO } from '../types/quiz.types';
import { submitQuizAttempt } from '../service/quizApi';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { resetActiveQuestionState, verifyAndRecordOption } from './quizStoreHelpers';
import { statelessQuizApi } from '../service/statelessQuizApi';
import type { StatelessQuizSummary, StatelessQuizDetail, StatelessAttemptResult } from '../service/statelessQuizApi';

// QZ-029: lối thoát an toàn cho CANVAS_TARGET — sau N lần click trống/không khớp,
// câu hỏi được nộp tự động (sai) để mở nút "Tiếp tục", tránh kẹt lecture vĩnh viễn.
const MAX_CANVAS_BLANK_CLICKS = 5;

// QZ-033: sessionStorage lưu tiến trình quiz đang làm (refresh không mất trắng).
const BACKEND_QUIZ_PROGRESS_KEY = 'dsa_backend_quiz_progress_v1';

interface BackendQuizProgress {
  quizId: string;
  index: number;
  answers: (number | null)[];
}

// QZ-033: phục hồi tiến trình quiz chỉ 1 lần MỖI LẦN NẠP TRANG (module load).
// sessionStorage sống theo tab: "refresh" = nạp lại module = quyền phục hồi mới.
// Không dùng flag trong store (Pinia cache theo id) vì mỗi createPinia/instance
// test đều là "trang mới" — flag module giữ đúng ngữ nghĩa "1 lần mỗi page load".
let backendProgressRestored = false;

export const useQuizStore = defineStore('quizSystem', () => {
  const lectureStore = useLectureStore();
  const animStore = useAnimationStore();
  const authStore = useAuthStore();

  const activeQuestion = ref<QuizQuestion | null>(null);
  const selectedAnswerIndex = ref<number | null>(null);
  const isSubmitted = ref(false), isCorrect = ref(false);
  const feedbackExplanation = ref(''), matchedNodeId = ref<string | null>(null);
  const isCanvasTargetMode = ref(false);
  const canvasBlankClickCount = ref(0);
  const checkpoints = ref<QuizCheckpoint[]>([]);
  const completedCheckpointIndexes = ref<number[]>([]);
  const sessionCorrect = ref(0), sessionTotal = ref(0);

  // QZ-006: định danh quiz đang học (khớp script.algorithmId / quizId backend) + đáp án
  // theo thứ tự checkpoint — dùng để đồng bộ attempt/XP lên server khi hoàn tất.
  const sessionQuizId = ref<string | null>(null);
  const sessionAnswers = ref<(number | null)[]>([]);
  const xpSyncError = ref<string | null>(null);

  const isLectureLockedByQuiz = computed(() => activeQuestion.value !== null);
  const isQuizActive = computed(() => activeQuestion.value !== null);
  const sessionAccuracy = computed(() => sessionTotal.value === 0 ? 0 : Math.round((sessionCorrect.value / sessionTotal.value) * 100));
  const allCheckpointsCompleted = computed(() => checkpoints.value.length > 0 && checkpoints.value.every(cp => completedCheckpointIndexes.value.includes(cp.frameIndex)));

  function loadCheckpoints(quizCheckpoints: QuizCheckpoint[], quizId?: string | null): void {
    // QZ-009: reset câu hỏi đang mở + nhả lock 'quiz' trước khi nạp script mới —
    // trước đây đổi thuật toán giữa câu hỏi → overlay cũ kẹt, VCR khóa cứng vĩnh viễn.
    resetActiveQuestionState(activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation, matchedNodeId, isCanvasTargetMode, canvasBlankClickCount);
    lectureStore.unlockLectureInteraction('quiz');
    checkpoints.value = quizCheckpoints;
    completedCheckpointIndexes.value = [];
    sessionCorrect.value = 0; sessionTotal.value = 0;
    // TODO(QZ-006): VisualizationPlayer.vue gọi `loadCheckpoints(script.checkpoints, script.algorithmId)`
    // để bật đồng bộ XP — hiện script đã có sẵn algorithmId, chỉ cần truyền thêm tham số.
    sessionQuizId.value = quizId ?? null;
    sessionAnswers.value = quizCheckpoints.map(() => null);
    xpSyncError.value = null;
  }

  function checkFrameForQuiz(frameIndex: number): void {
    if (activeQuestion.value !== null || completedCheckpointIndexes.value.includes(frameIndex)) return;
    const checkpoint = checkpoints.value.find(cp => cp.frameIndex === frameIndex);
    if (checkpoint) triggerCheckpointQuestion(checkpoint.question, frameIndex);
  }

  function triggerCheckpointQuestion(question: QuizQuestion, frameIndex: number): void {
    activeQuestion.value = question; selectedAnswerIndex.value = null;
    isSubmitted.value = false; isCorrect.value = false;
    feedbackExplanation.value = ''; matchedNodeId.value = null;
    isCanvasTargetMode.value = question.type === 'CANVAS_TARGET';
    canvasBlankClickCount.value = 0;
    // QZ-018: KHÔNG đánh dấu completed ngay khi kích hoạt — chỉ sau khi trả lời ĐÚNG
    // (BEHAVIOR_SPEC §3). Trả lời sai → tua lại vẫn được retry.
    // Chủ quyền 'quiz': thoát lecture giữa câu hỏi KHÔNG mở khóa canvas.
    lectureStore.lockLectureInteraction('quiz');
  }

  /** Đánh dấu checkpoint completed — chỉ gọi khi câu trả lời ĐÚNG (QZ-018). */
  function markCheckpointCompleted(questionId: string): void {
    const frameIndex = checkpoints.value.find(cp => cp.question.id === questionId)?.frameIndex;
    if (frameIndex !== undefined && !completedCheckpointIndexes.value.includes(frameIndex)) {
      completedCheckpointIndexes.value.push(frameIndex);
    }
  }

  /** Ghi đáp án đã chọn theo thứ tự checkpoint (phục vụ syncSessionToServer). */
  function recordSessionAnswer(questionId: string, selectedIndex: number): void {
    const idx = checkpoints.value.findIndex(cp => cp.question.id === questionId);
    if (idx === -1) return;
    const next = [...sessionAnswers.value];
    next[idx] = selectedIndex;
    sessionAnswers.value = next;
  }

  function submitOptionAnswer(index: number): void {
    if (!activeQuestion.value || isSubmitted.value) return;
    selectedAnswerIndex.value = index; isSubmitted.value = true;
    const result = verifyAndRecordOption(index, activeQuestion.value, sessionCorrect, sessionTotal);
    isCorrect.value = result.isCorrect; feedbackExplanation.value = result.explanation;
    recordSessionAnswer(activeQuestion.value.id, index);
    if (result.isCorrect) markCheckpointCompleted(activeQuestion.value.id);
  }

  function handleCanvasClickAnswer(clickX: number, clickY: number, nodes: CanvasNodeDTO[]): void {
    if (!activeQuestion.value || isSubmitted.value || activeQuestion.value.type !== 'CANVAS_TARGET') return;

    // QZ-029: data mismatch — nodes rỗng hoặc không chứa targetNodeId thì không bao giờ
    // khớp được → nộp tự động (sai) để mở nút "Tiếp tục", tránh kẹt lecture vĩnh viễn.
    const targetId = activeQuestion.value.targetNodeId;
    const dataMismatch = nodes.length === 0 || (targetId !== undefined && !nodes.some(n => n.id === targetId));

    const result = dataMismatch
      ? null
      : QuizVerificationEngine.verifyCanvasClickAnswer(clickX, clickY, nodes, activeQuestion.value);

    if (!result || !result.matchedNodeId) {
      // BEHAVIOR_SPEC §2: click trượt không tính là trả lời sai — nhưng giới hạn số lần
      // click trống để có lối thoát an toàn (QZ-029).
      canvasBlankClickCount.value++;
      if (canvasBlankClickCount.value >= MAX_CANVAS_BLANK_CLICKS) {
        isSubmitted.value = true; isCorrect.value = false;
        feedbackExplanation.value = dataMismatch
          ? 'Dữ liệu câu hỏi không khớp với sơ đồ Canvas — câu hỏi được bỏ qua.'
          : 'Không tìm thấy đỉnh khớp sau nhiều lần nhấp — câu hỏi được bỏ qua.';
        matchedNodeId.value = null;
        isCanvasTargetMode.value = false; sessionTotal.value++;
        QuizStatsManager.saveAttempt(false, activeQuestion.value.id);
      }
      return;
    }

    canvasBlankClickCount.value = 0;
    isSubmitted.value = true; isCorrect.value = result.isCorrect;
    feedbackExplanation.value = result.explanation; matchedNodeId.value = result.matchedNodeId ?? null;
    isCanvasTargetMode.value = false; sessionTotal.value++;
    if (result.isCorrect) sessionCorrect.value++;
    QuizStatsManager.saveAttempt(result.isCorrect, activeQuestion.value.id);
    // QZ-018: chỉ đánh dấu completed sau khi trả lời ĐÚNG.
    if (result.isCorrect) markCheckpointCompleted(activeQuestion.value.id);
  }

  const dismissQuestionAndContinue = (): void => {
    // QZ-006: đồng bộ session lên server khi hoàn tất TOÀN BỘ checkpoint (đúng hết) —
    // gọi trước khi reset trạng thái câu hỏi; lỗi hiển thị qua xpSyncError (không nuốt im lặng).
    const shouldSync = sessionQuizId.value !== null && sessionTotal.value > 0 && allCheckpointsCompleted.value;
    resetActiveQuestionState(activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation, matchedNodeId, isCanvasTargetMode, canvasBlankClickCount);
    lectureStore.unlockLectureInteraction('quiz');
    // QZ-019: tự động phát tiếp bài giảng từ mốc hiện tại sau khi mở khóa.
    lectureStore.resumeLecturePlayback();
    if (shouldSync) void syncSessionToServer();
  };

  const resetQuizStore = (): void => {
    resetActiveQuestionState(activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation, matchedNodeId, isCanvasTargetMode, canvasBlankClickCount);
    checkpoints.value = []; completedCheckpointIndexes.value = [];
    sessionCorrect.value = 0; sessionTotal.value = 0;
    sessionQuizId.value = null; sessionAnswers.value = [];
    xpSyncError.value = null;
    // Nhả lock 'quiz' — trước đây quên unlock → interactionLocked kẹt vĩnh viễn.
    lectureStore.unlockLectureInteraction('quiz');
  };

  /**
   * Đồng bộ kết quả phiên checkpoint quiz lên server (QZ-006): endpoint thật
   * `/api/v1/concepts/quiz/submit`, payload { quizId, answers }. Backend tự chấm
   * điểm + cấp XP theo chính sách first-pass — client không gửi score/passed tự tính.
   */
  async function syncSessionToServer(): Promise<void> {
    const quizId = sessionQuizId.value;
    const token = authStore.getAccessToken();
    if (!quizId || !token || sessionTotal.value === 0) return;
    xpSyncError.value = null;
    const answers = sessionAnswers.value.map(a => a ?? -1);
    try {
      // submitQuizAttempt đã retry 1 lần nội bộ (lỗi mạng/5xx) — thất bại → throw rõ ràng.
      await submitQuizAttempt({ quizId, answers }, token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đồng bộ kết quả quiz lên máy chủ thất bại.';
      xpSyncError.value = msg;
      console.error('[quizStore] syncSessionToServer:', msg);
    }
  }

  
  const quizCatalog = ref<StatelessQuizSummary[]>([]);
  const activeBackendQuiz = ref<StatelessQuizDetail | null>(null);
  const backendQuizIndex = ref(0);
  const backendAnswers = ref<(number | null)[]>([]);
  const backendResult = ref<StatelessAttemptResult | null>(null);
  const isBackendQuizLoading = ref(false);
  const isBackendQuizSubmitting = ref(false);
  const backendQuizError = ref<string | null>(null);
  const isBackendQuizMode = ref(false);

  // QZ-007: generation-token — response của load/submit cũ không được ghi đè state
  // sau khi user đã thoát (mẫu actionGeneration của useLectureStore).
  let backendQuizGeneration = 0;

  const currentBackendQuestion = computed(() =>
    activeBackendQuiz.value?.questions[backendQuizIndex.value] ?? null
  );
  const backendQuizProgress = computed(() =>
    activeBackendQuiz.value
      ? `${backendQuizIndex.value + 1} / ${activeBackendQuiz.value.questions.length}`
      : ''
  );

  /** QZ-033: lưu tiến trình (câu hỏi hiện tại + đáp án) xuống sessionStorage. */
  function saveBackendQuizProgress(): void {
    if (!activeBackendQuiz.value) return;
    try {
      sessionStorage.setItem(BACKEND_QUIZ_PROGRESS_KEY, JSON.stringify({
        quizId: activeBackendQuiz.value.id,
        index: backendQuizIndex.value,
        answers: backendAnswers.value,
      } satisfies BackendQuizProgress));
    } catch {
      // Storage đầy/không khả dụng — mất tính năng phục hồi nhưng không chặn quiz.
    }
  }

  /** QZ-033: xóa tiến trình đã lưu (nộp bài thành công / thoát quiz). */
  function clearBackendQuizProgress(): void {
    try {
      sessionStorage.removeItem(BACKEND_QUIZ_PROGRESS_KEY);
    } catch {
      // ignore
    }
  }

  /** QZ-033: phục hồi quiz đang làm dở sau refresh — tự tải chi tiết + khôi phục index/đáp án. */
  async function restoreBackendQuizProgress(): Promise<void> {
    let saved: BackendQuizProgress | null = null;
    try {
      const raw = sessionStorage.getItem(BACKEND_QUIZ_PROGRESS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<BackendQuizProgress> | null;
      if (!parsed || typeof parsed.quizId !== 'string' || !Array.isArray(parsed.answers)) return;
      saved = {
        quizId: parsed.quizId,
        index: typeof parsed.index === 'number' ? parsed.index : 0,
        answers: parsed.answers,
      };
    } catch {
      return; // storage hỏng — bỏ qua phục hồi
    }

    try {
      const quiz = await statelessQuizApi.getQuizById(saved.quizId);
      if (quiz.questions.length === 0) return;
      // QZ-054: clamp đáp án vào dải option thật của TỪNG câu — sessionStorage là
      // user-controlled, giá trị 99/âm/NaN không được lọt vào payload submit.
      const restoredAnswers = saved.answers
        .slice(0, quiz.questions.length)
        .map((a, i) => {
          if (typeof a !== 'number' || !Number.isFinite(a)) return null;
          const optionCount = quiz.questions[i]?.options.length ?? 0;
          if (optionCount === 0) return null;
          return Math.min(Math.max(0, Math.floor(a)), optionCount - 1);
        });
      while (restoredAnswers.length < quiz.questions.length) restoredAnswers.push(null);
      backendQuizIndex.value = Math.min(Math.max(0, saved.index), quiz.questions.length - 1);
      backendAnswers.value = restoredAnswers;
      activeBackendQuiz.value = quiz;
      isBackendQuizMode.value = true;
      backendResult.value = null;
      backendQuizError.value = null;
    } catch {
      // Không tải được quiz đã lưu — giữ nguyên catalog, người dùng chọn lại.
    }
  }

  async function loadQuizCatalog(): Promise<void> {
    try {
      isBackendQuizLoading.value = true;
      backendQuizError.value = null;
      quizCatalog.value = await statelessQuizApi.getAllQuizzes();
      // QZ-033: sau khi có catalog, phục hồi quiz đang dở (refresh giữa chừng) —
      // chỉ 1 lần mỗi page load để không đè lên phiên làm bài mới.
      if (!backendProgressRestored) {
        backendProgressRestored = true;
        await restoreBackendQuizProgress();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách quiz';
      backendQuizError.value = msg;
    } finally {
      isBackendQuizLoading.value = false;
    }
  }

  async function startBackendQuiz(quizId: string): Promise<void> {
    // QZ-026: chặn double-call (double-click "Làm lại" → 2 GET song song).
    if (isBackendQuizLoading.value) return;
    const generation = ++backendQuizGeneration;
    try {
      isBackendQuizLoading.value = true;
      backendQuizError.value = null;
      backendResult.value = null;
      const quiz = await statelessQuizApi.getQuizById(quizId);
      if (generation !== backendQuizGeneration) return; // đã exit giữa chừng — bỏ response cũ
      if (quiz.questions.length === 0) {
        throw new Error('Quiz không có câu hỏi nào để làm.');
      }
      activeBackendQuiz.value = quiz;
      backendQuizIndex.value = 0;
      backendAnswers.value = new Array(quiz.questions.length).fill(null);
      isBackendQuizMode.value = true;
      saveBackendQuizProgress();
    } catch (err: unknown) {
      if (generation !== backendQuizGeneration) return;
      const msg = err instanceof Error ? err.message : 'Không thể tải quiz';
      backendQuizError.value = msg;
      // QZ-026: load fail → dọn quiz cũ + tắt chế độ quiz (không giữ banner trên quiz cũ).
      activeBackendQuiz.value = null;
      isBackendQuizMode.value = false;
    } finally {
      if (generation === backendQuizGeneration) {
        isBackendQuizLoading.value = false;
      }
    }
  }

  function selectBackendAnswer(index: number): void {
    // QZ-056: reassignment thay splice — nhất quán với các nơi khác trong file.
    const next = [...backendAnswers.value];
    next[backendQuizIndex.value] = index;
    backendAnswers.value = next;
    saveBackendQuizProgress();
  }

  function nextBackendQuestion(): void {
    if (activeBackendQuiz.value && backendQuizIndex.value < activeBackendQuiz.value.questions.length - 1) {
      backendQuizIndex.value++;
      saveBackendQuizProgress();
    }
  }

  function prevBackendQuestion(): void {
    if (backendQuizIndex.value > 0) {
      backendQuizIndex.value--;
      saveBackendQuizProgress();
    }
  }

  async function submitBackendQuiz(): Promise<void> {
    if (!activeBackendQuiz.value || isBackendQuizSubmitting.value) return;
    const generation = ++backendQuizGeneration;
    const quizId = activeBackendQuiz.value.id;
    const answers = backendAnswers.value.map(a => a ?? -1);
    isBackendQuizSubmitting.value = true;
    backendQuizError.value = null;
    try {
      // QZ-027: submit dùng riêng isBackendQuizSubmitting — KHÔNG kéo isBackendQuizLoading
      // (UI hiện "Đang gửi..." thay vì skeleton).
      const result = await statelessQuizApi.submitAttempt(quizId, answers, authStore.getAccessToken());
      if (generation !== backendQuizGeneration) return; // QZ-007: đã thoát — bỏ kết quả cũ
      backendResult.value = result;
      // QZ-033: ghi kết quả backend quiz vào thống kê cục bộ (đồng bộ 2 flow thống kê).
      for (const qr of result.questionResults) {
        QuizStatsManager.saveAttempt(qr.isCorrect, quizId);
      }
      clearBackendQuizProgress();
    } catch (err: unknown) {
      if (generation !== backendQuizGeneration) return;
      const msg = err instanceof Error ? err.message : 'Không thể gửi bài';
      backendQuizError.value = msg;
    } finally {
      // Luôn nhả cờ submit (exit đã chặn giữa chừng; cờ lỡ kẹt sẽ khóa UI vĩnh viễn).
      isBackendQuizSubmitting.value = false;
    }
  }

  function exitBackendQuiz(): void {
    // QZ-007: chặn thoát giữa chừng khi đang submit — response cũ không thể ghi đè state.
    if (isBackendQuizSubmitting.value) return;
    backendQuizGeneration++;
    isBackendQuizMode.value = false;
    activeBackendQuiz.value = null;
    backendResult.value = null;
    backendQuizIndex.value = 0;
    backendAnswers.value = [];
    backendQuizError.value = null;
    // QZ-034: reset cả 2 cờ async + lỗi khi thoát giữa lúc load.
    isBackendQuizLoading.value = false;
    isBackendQuizSubmitting.value = false;
    clearBackendQuizProgress();
  }

  /** QZ-055: setter tập trung cho lỗi backend quiz — component không gán state trực tiếp. */
  function setBackendQuizError(message: string | null): void {
    backendQuizError.value = message;
  }

  return {
    activeQuestion, selectedAnswerIndex, isSubmitted, isCorrect, feedbackExplanation,
    matchedNodeId, isCanvasTargetMode, checkpoints, completedCheckpointIndexes,
    sessionCorrect, sessionTotal, xpSyncError,
    isLectureLockedByQuiz, isQuizActive, sessionAccuracy, allCheckpointsCompleted,
    loadCheckpoints, checkFrameForQuiz, triggerCheckpointQuestion,
    submitOptionAnswer, handleCanvasClickAnswer, dismissQuestionAndContinue,
    resetQuizStore, syncSessionToServer,
    
    quizCatalog, activeBackendQuiz, backendQuizIndex, backendAnswers, backendResult,
    isBackendQuizLoading, isBackendQuizSubmitting, backendQuizError, isBackendQuizMode,
    currentBackendQuestion, backendQuizProgress,
    loadQuizCatalog, startBackendQuiz, selectBackendAnswer,
    nextBackendQuestion, prevBackendQuestion, submitBackendQuiz, exitBackendQuiz,
    setBackendQuizError,
  };
});
