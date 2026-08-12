import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Lesson, QuizQuestion } from '../types/lesson.types';
import { LESSONS } from '../../../data/lessons';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { fetchLessonProgress, saveLessonProgress, awardXp, fetchLessonDetail, getLessonAuthToken, type LessonDetailResponse, type LessonProgressPayload } from '../services/lessonApi';
import { courseApi } from '../../../services/courseApi';
import { statelessQuizApi } from '../../quiz-system/service/statelessQuizApi';
import { CODELAB_TASK_REGISTRY } from '../utils/codelabTaskRegistry';
import { parseSandboxDemo } from '../utils/sandboxConfig';
import type { Course } from '../../courses/types/course.types';

/** Thông tin bổ sung từ backend (không nằm trong Lesson local). */
export interface LessonMeta {
  courseId: string;
  courseTitle: string;
  quizId: string | null;
  sandboxType: string;
  sandboxConfig: string;
  orderIndex: number;
}

/** @deprecated Dùng `parseSandboxDemo` từ `utils/sandboxConfig`. */
export const resolveSandboxDemo = parseSandboxDemo;

function mapBackendQuizQuestions(questions: Array<{ id: string; text: string; options: string[]; correctIndex: number; explanation: string }>): QuizQuestion[] {
  return questions.map(q => ({
    id: q.id,
    questionText: q.text,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation ?? '',
  }));
}

export function getLessonProgress(lessonId: string): {
  hasWatchedVisualizer: boolean;
  quizScore: number | null;
  codelabCompleted: boolean;
  xpAwarded: number;
} | null {
  const key = `lesson_progress_${lessonId}`;
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export const useLessonStore = defineStore('lessonStudy', () => {
  const authStore = useAuthStore();

  // ── State ──
  const currentLesson = ref<Lesson | null>(null);
  const currentCourse = ref<Course | null>(null);
  const lessonMeta = ref<LessonMeta | null>(null);
  const activeStep = ref<number>(1);
  const isLoading = ref<boolean>(false);
  const isLoadingCourse = ref<boolean>(false);
  const error = ref<string | null>(null);
  // Dữ liệu đang hiển thị là bản local (API lỗi) — để UI hiển thị cảnh báo.
  const isOfflineFallback = ref<boolean>(false);
  // Cờ đã đọc hết bước Lý Thuyết (mở khóa bước Trực Quan Hóa — LM-015).
  const theoryRead = ref<boolean>(false);

  // ── Progress ──
  const hasWatchedVisualizer = ref<boolean>(false);
  const quizScore = ref<number | null>(null);
  const bestScore = ref<number>(0);
  const codelabCompleted = ref<boolean>(false);
  const xpAwarded = ref<number>(0);

  // ── Sync ──
  const isSyncing = ref<boolean>(false);
  const isOnline = ref<boolean>(navigator.onLine);

  // ── Computed ──
  const quizPassed = computed(() => {
    const questions = currentLesson.value?.quizQuestions;
    if (!questions || questions.length === 0 || quizScore.value === null) return false;
    const requiredScore = Math.ceil(questions.length * 0.7);
    return quizScore.value >= requiredScore;
  });

  const totalXpEarned = computed(() => xpAwarded.value);
  // Bài không có CodeLab: hoàn thành khi quiz đạt; bài chỉ lý thuyết (không quiz, không codelab):
  // hoàn thành khi xem xong visualizer. Ngược lại cần codelab.
  const isLessonComplete = computed(() => {
    if (codelabCompleted.value) return true;
    const lesson = currentLesson.value;
    if (!lesson) return false;
    if (!lesson.codelabTask && quizPassed.value) return true;
    // Bài không có quiz nào để làm (quizQuestions rỗng — kể cả khi quizId có nhưng tải lỗi):
    // hoàn thành khi xem hết visualizer (không thể chấm quiz không tải được).
    if (!lesson.codelabTask && !(lesson.quizQuestions?.length) && hasWatchedVisualizer.value) return true;
    return false;
  });

  const getStorageKey = (lessonId: string) => `lesson_progress_${lessonId}`;

  // ── Online/offline ──
  window.addEventListener('online', () => {
    isOnline.value = true;
    void flushPendingSyncs();
    syncToServer().catch(() => {});
  });
  window.addEventListener('offline', () => {
    isOnline.value = false;
  });

  // ── Local storage ──
  function loadFromLocalStorage(lessonId: string) {
    const data = localStorage.getItem(getStorageKey(lessonId));
    if (data) {
      try {
        const parsed = JSON.parse(data);
        hasWatchedVisualizer.value = !!parsed.hasWatchedVisualizer;
        quizScore.value = parsed.quizScore ?? null;
        bestScore.value = parsed.bestScore ?? 0;
        codelabCompleted.value = !!parsed.codelabCompleted;
        xpAwarded.value = parsed.xpAwarded ?? 0;
      } catch (e) {
        console.warn('Lỗi khi khôi phục tiến độ từ local:', e);
      }
    }
  }

  function saveToLocalStorage() {
    if (!currentLesson.value) return;
    const key = getStorageKey(currentLesson.value.id);
    // Cờ `completed` là một chiều (LM-034): bài đã hoàn thành không bao giờ bị
    // thoái lui khi "Làm lại" quiz — chỉ đọc trạng thái trước đó rồi OR thêm.
    let previousCompleted = false;
    try {
      const raw = localStorage.getItem(key);
      if (raw) previousCompleted = JSON.parse(raw).completed === true;
    } catch { /* dữ liệu cũ hỏng — bỏ qua */ }
    const data = {
      hasWatchedVisualizer: hasWatchedVisualizer.value,
      quizScore: quizScore.value,
      bestScore: bestScore.value,
      codelabCompleted: codelabCompleted.value,
      xpAwarded: xpAwarded.value,
      // Cờ hoàn thành bài: đúng cho cả bài KHÔNG có codelab (quiz pass = xong).
      completed: previousCompleted || isLessonComplete.value,
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  /** Đúng khi `lessonId` vẫn là bài học đang hiển thị (chống race đổi bài — LM-010). */
  function isSameLesson(lessonId: string): boolean {
    return currentLesson.value?.id === lessonId;
  }

  /** Đổi số câu đúng (count) sang thang 0..100 (percent) khớp backend (LM-021). */
  function quizScoreToPercent(count: number | null, total: number): number | null {
    if (count === null || total <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((count / total) * 100)));
  }

  /** Đổi percent (server lưu thang 0..100) về số câu đúng cho UI. */
  function quizPercentToCount(percent: number, total: number): number {
    if (total <= 0) return percent;
    return Math.round((percent / 100) * total);
  }

  // ── Retry sync theo (lessonId, payload) đã capture (LM-030) ──
  const MAX_SYNC_RETRIES = 3;
  const pendingSyncs = new Map<string, { payload: LessonProgressPayload; attempts: number }>();
  let syncRetryTimer: ReturnType<typeof setTimeout> | null = null;

  async function flushPendingSyncs(): Promise<void> {
    if (!isOnline.value || !getLessonAuthToken() || pendingSyncs.size === 0) return;
    for (const [lessonId, entry] of [...pendingSyncs.entries()]) {
      if (entry.attempts >= MAX_SYNC_RETRIES) {
        pendingSyncs.delete(lessonId);
        continue;
      }
      try {
        await saveLessonProgress(entry.payload);
        pendingSyncs.delete(lessonId);
      } catch {
        entry.attempts += 1;
      }
    }
    if (pendingSyncs.size > 0 && isOnline.value) {
      if (syncRetryTimer) clearTimeout(syncRetryTimer);
      syncRetryTimer = setTimeout(() => {
        syncRetryTimer = null;
        void flushPendingSyncs();
      }, 10000);
    }
  }

  async function syncToServer(force = false) {
    const lessonId = currentLesson.value?.id;
    if (!lessonId) return;

    const token = getLessonAuthToken();
    if (!token || !isOnline.value) {
      saveToLocalStorage();
      return;
    }

    if (isSyncing.value && !force) return;

    // Snapshot payload NGAY tại thời điểm bắt đầu — không đọc state lúc sau
    // (bài có thể đã đổi — LM-010/LM-030).
    const questions = currentLesson.value?.quizQuestions ?? [];
    const payload: LessonProgressPayload = {
      lessonId,
      hasWatchedVisualizer: hasWatchedVisualizer.value,
      // Backend hiểu quizScore là thang 0..100 (percent) — LM-021.
      quizScore: quizScoreToPercent(quizScore.value, questions.length),
      bestScore: bestScore.value,
      quizPassed: quizPassed.value,
      codelabCompleted: codelabCompleted.value,
      xpAwarded: xpAwarded.value,
    };

    isSyncing.value = true;
    try {
      await saveLessonProgress(payload);
      if (isSameLesson(lessonId)) saveToLocalStorage();
    } catch (err) {
      console.warn('Đồng bộ thất bại, sẽ thử lại sau', err);
      if (isSameLesson(lessonId)) saveToLocalStorage();

      // Retry theo đúng (lessonId, payload) bị lỗi — kể cả khi user đã chuyển bài.
      const existing = pendingSyncs.get(lessonId);
      if (!existing || existing.attempts < MAX_SYNC_RETRIES) {
        pendingSyncs.set(lessonId, { payload, attempts: existing?.attempts ?? 0 });
      }
      void flushPendingSyncs();
    } finally {
      isSyncing.value = false;
    }
  }

  let syncTimeout: ReturnType<typeof setTimeout> | null = null;
  function debouncedSync() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncToServer().catch(() => {});
      syncTimeout = null;
    }, 3000);
  }

  /** Build Lesson từ API detail + quiz backend + codelab registry/local. */
  async function buildLessonFromApi(detail: LessonDetailResponse): Promise<Lesson> {
    const local = LESSONS[detail.id];
    const demo = resolveSandboxDemo(detail.sandboxConfig);
    const codelabTask = CODELAB_TASK_REGISTRY[demo ?? ''] ?? local?.codelabTask;

    let quizQuestions: QuizQuestion[] = local?.quizQuestions ?? [];
    if (detail.quizId) {
      try {
        const quiz = await statelessQuizApi.getQuizById(detail.quizId, true);
        if (quiz?.questions && quiz.questions.length > 0) {
          quizQuestions = mapBackendQuizQuestions(quiz.questions);
        }
      } catch (e) {
        console.warn('Không tải được quiz backend, giữ quiz local:', e);
      }
    }

    return {
      id: detail.id,
      title: detail.title,
      algorithmId: demo ?? '',
      xpReward: detail.xpReward,
      theoryContent: detail.contentMd || local?.theoryContent || '',
      quizQuestions,
      codelabTask,
    };
  }

  // ── Load lesson ──
  // Token chống race: chuyển bài nhanh A→B, response của A trả sau sẽ bị bỏ qua.
  let lessonLoadRequestId = 0;

  async function loadLesson(lessonId: string) {
    const requestId = ++lessonLoadRequestId;
    isLoading.value = true;
    error.value = null;
    isOfflineFallback.value = false;

    activeStep.value = 1;
    theoryRead.value = false;
    hasWatchedVisualizer.value = false;
    quizScore.value = null;
    bestScore.value = 0;
    codelabCompleted.value = false;
    xpAwarded.value = 0;
    lessonMeta.value = null;

    // Offline-first: render ngay từ local nếu có, sau đó ghi đè bằng dữ liệu backend.
    const localLesson = LESSONS[lessonId];
    currentLesson.value = localLesson ?? null;
    if (!localLesson) {
      // Chưa có dữ liệu local — hiển thị state đang tải cho tới khi API trả về.
      currentLesson.value = null;
    }

    const token = getLessonAuthToken();
    if (token && isOnline.value) {
      try {
        const detail = await fetchLessonDetail(lessonId);
        if (requestId !== lessonLoadRequestId) return; // response cũ — bỏ qua
        const lesson = await buildLessonFromApi(detail);
        if (requestId !== lessonLoadRequestId) return;
        currentLesson.value = lesson;
        lessonMeta.value = {
          courseId: detail.courseId,
          courseTitle: detail.courseTitle,
          quizId: detail.quizId,
          sandboxType: detail.sandboxType,
          sandboxConfig: detail.sandboxConfig,
          orderIndex: detail.orderIndex,
        };
      } catch (e) {
        console.warn('Không tải được bài học từ server, dùng dữ liệu local:', e);
        // 403 = bài yêu cầu Premium — thông điệp rõ ràng thay vì "Không tìm thấy".
        const httpStatus = (e as { status?: number } | null)?.status;
        if (httpStatus === 403) {
          error.value = 'Bài học này yêu cầu tài khoản Premium để truy cập.';
        } else if (!currentLesson.value) {
          error.value = 'Không tìm thấy bài học';
        } else {
          isOfflineFallback.value = true;
        }
      }
    } else if (!currentLesson.value) {
      error.value = 'Không tìm thấy bài học';
    }

    // Khôi phục tiến độ (local trước, server sau).
    if (currentLesson.value) {
      loadFromLocalStorage(lessonId);

      if (token && isOnline.value) {
        try {
          const serverData = await fetchLessonProgress(lessonId);
          if (requestId !== lessonLoadRequestId) return;
          if (serverData && Object.keys(serverData).length > 0) {
            hasWatchedVisualizer.value = !!serverData.hasWatchedVisualizer || hasWatchedVisualizer.value;
            // Server lưu quizScore theo thang 0..100 (percent) — quy đổi về số câu
            // đúng theo tổng câu hỏi của bài để UI hiển thị nhất quán (LM-021).
            const totalQuestions = currentLesson.value?.quizQuestions?.length ?? 0;
            if (typeof serverData.quizScore === 'number' && totalQuestions > 0) {
              quizScore.value = quizPercentToCount(serverData.quizScore, totalQuestions);
            } else if (serverData.quizScore === null) {
              quizScore.value = null;
            }
            if (serverData.bestScore !== undefined && serverData.bestScore > bestScore.value) bestScore.value = serverData.bestScore;
            codelabCompleted.value = !!serverData.codelabCompleted || codelabCompleted.value;
            if (serverData.xpAwarded !== undefined && serverData.xpAwarded > xpAwarded.value) xpAwarded.value = serverData.xpAwarded;

            saveToLocalStorage();
          }
        } catch (e) {
          console.warn('Không thể fetch progress từ server, dùng local', e);
        }
      }

      if (codelabCompleted.value) {
        activeStep.value = 4;
      } else if (quizPassed.value) {
        activeStep.value = 3;
      } else if (hasWatchedVisualizer.value) {
        activeStep.value = 2;
      }
    }

    if (requestId === lessonLoadRequestId) {
      isLoading.value = false;
    }
  }

  function markVisualizerWatched() {
    if (!hasWatchedVisualizer.value) {
      hasWatchedVisualizer.value = true;
      saveToLocalStorage();
      debouncedSync();
    }
  }

  /** Ghi nhận thuật toán đã hoàn thành (phục vụ badge gamification). */
  function recordCompletedAlgorithm(): void {
    const algoId = currentLesson.value?.algorithmId;
    if (!algoId) return;
    // Map sang id nhóm mà badge sử dụng (badge dùng id cũ 'quicksort'/'sorting'/'graph').
    const GROUP_ALIASES: Record<string, string> = {
      'quick-sort': 'quicksort',
      'bubble-sort': 'sorting',
      'merge-sort': 'sorting',
      'heap-sort': 'sorting',
      'radix-sort': 'sorting',
      'counting-sort': 'sorting',
      'bucket-sort': 'sorting',
      'insertion-sort': 'sorting',
      'selection-sort': 'sorting',
      'bfs': 'graph',
      'dfs': 'graph',
      'dijkstra': 'graph',
    };
    const entries = [algoId, GROUP_ALIASES[algoId]].filter((v): v is string => !!v);
    try {
      const stored = new Set(JSON.parse(localStorage.getItem('completed_algorithms') ?? '[]') as string[]);
      let changed = false;
      for (const e of entries) {
        if (!stored.has(e)) { stored.add(e); changed = true; }
      }
      if (changed) localStorage.setItem('completed_algorithms', JSON.stringify([...stored]));
    } catch { /* ignore */ }
  }

  async function submitQuiz(answers: Record<string, number>) {
    const lessonId = currentLesson.value?.id;
    const lesson = currentLesson.value;
    if (!lessonId || !lesson) return;

    const questions = lesson.quizQuestions ?? [];
    let correct = 0;

    for (const q of questions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }

    // Mutate trước await — đang chắc chắn ở đúng bài (chưa có cơ hội đổi bài).
    quizScore.value = correct;
    if (correct > bestScore.value) {
      bestScore.value = correct;
    }

    saveToLocalStorage();
    await syncToServer(true);
    if (!isSameLesson(lessonId)) return; // đã đổi bài — không ghi XP cho bài cũ

    if (quizPassed.value) {
      recordCompletedAlgorithm();
      // Bài KHÔNG có CodeLab: quiz pass = hoàn thành bài → nhận FULL XP.
      // Bài có CodeLab: quiz chỉ trả 50%, phần còn lại ở bước CodeLab.
      const hasCodelab = !!currentLesson.value?.codelabTask;
      const quizXpCap = hasCodelab
        ? Math.floor(lesson.xpReward * 0.5)
        : lesson.xpReward;
      if (xpAwarded.value < quizXpCap) {
        const diff = quizXpCap - xpAwarded.value;
        try {
          await awardXp(diff, `Hoàn thành Quiz: ${lesson.title}`);
          if (!isSameLesson(lessonId)) return;
          xpAwarded.value += diff;
          saveToLocalStorage();
          await syncToServer(true);
          if (!isSameLesson(lessonId)) return;
        } catch (e) {
          if (!isSameLesson(lessonId)) return;
          console.warn('API award-xp lỗi, lưu XP local', e);
          xpAwarded.value += diff;
          saveToLocalStorage();
        }
      }
    }
  }

  function resetQuiz() {
    quizScore.value = null;
  }

  async function completeCodelab() {
    const lessonId = currentLesson.value?.id;
    const lesson = currentLesson.value;
    if (!lessonId || !lesson) return;

    if (!codelabCompleted.value) {
      codelabCompleted.value = true;
      recordCompletedAlgorithm();

      saveToLocalStorage();
      await syncToServer(true);
      if (!isSameLesson(lessonId)) return; // đã đổi bài — không ghi XP cho bài cũ

      const totalXp = lesson.xpReward;
      if (xpAwarded.value < totalXp) {
        const diff = totalXp - xpAwarded.value;
        try {
          await awardXp(diff, `Hoàn thành CodeLab: ${lesson.title}`);
          if (!isSameLesson(lessonId)) return;
          xpAwarded.value += diff;
          saveToLocalStorage();
          await syncToServer(true);
          if (!isSameLesson(lessonId)) return;
        } catch (e) {
          if (!isSameLesson(lessonId)) return;
          console.warn('API award-xp lỗi, lưu XP local', e);
          xpAwarded.value += diff;
          saveToLocalStorage();
        }
      }
    }
  }

  /** Kiểm tra bước có được phép truy cập hay không (đồng bộ với goToStep). */
  function canAccessStep(stepNumber: number): boolean {
    if (stepNumber === 2) {
      // Bước 2 mở khóa khi đã đọc xong Lý Thuyết hoặc đã tiến xa hơn (LM-015).
      return theoryRead.value || hasWatchedVisualizer.value || activeStep.value >= 2;
    }
    if (stepNumber === 3) {
      return hasWatchedVisualizer.value || quizPassed.value || activeStep.value >= 3;
    }
    if (stepNumber === 4) {
      return !!currentLesson.value?.codelabTask
        && (quizPassed.value || codelabCompleted.value || activeStep.value >= 4);
    }
    return true;
  }

  function markTheoryRead() {
    theoryRead.value = true;
  }

  function goToStep(stepNumber: number) {
    if (!canAccessStep(stepNumber)) return;
    activeStep.value = stepNumber;
  }

  // ── Course detail for sidebar ──
  let courseLoadRequestId = 0;
  async function loadCourseDetail(courseId: string) {
    const requestId = ++courseLoadRequestId;
    if (currentCourse.value?.id === courseId) return;
    isLoadingCourse.value = true;
    try {
      const data = await courseApi.getCourseById(courseId);
      if (requestId !== courseLoadRequestId) return; // response cũ — bỏ qua (LM-031)
      currentCourse.value = {
        ...data,
        coverImage: data.coverImageUrl ?? data.coverImage,
      } as unknown as Course;
    } catch (e) {
      if (requestId !== courseLoadRequestId) return;
      console.warn('Không tải được chi tiết khóa học cho sidebar:', e);
    } finally {
      if (requestId === courseLoadRequestId) isLoadingCourse.value = false;
    }
  }

  return {
    currentLesson,
    currentCourse,
    lessonMeta,
    activeStep,
    isLoading,
    isLoadingCourse,
    error,
    isOfflineFallback,
    theoryRead,
    hasWatchedVisualizer,
    quizScore,
    bestScore,
    quizPassed,
    codelabCompleted,
    xpAwarded,

    isSyncing,
    isOnline,
    totalXpEarned,
    isLessonComplete,

    loadLesson,
    loadCourseDetail,
    markVisualizerWatched,
    markTheoryRead,
    canAccessStep,
    submitQuiz,
    resetQuiz,
    completeCodelab,
    goToStep,
    syncToServer
  };
});
