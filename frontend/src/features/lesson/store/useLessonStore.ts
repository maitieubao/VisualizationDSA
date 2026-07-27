import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Lesson } from '../types/lesson.types';
import { LESSONS } from '../../../data/lessons';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { fetchLessonProgress, saveLessonProgress, awardXp } from '../services/lessonApi';
// Giả định có composable useToast, nếu không có, sẽ dùng console.log/alert tạm
// import { useToastStore } from '../../../composables/useToast';

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

  // State
  const currentLesson = ref<Lesson | null>(null);
  const activeStep = ref<number>(1);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Progress State
  const hasWatchedVisualizer = ref<boolean>(false);
  const quizScore = ref<number | null>(null);
  const bestScore = ref<number>(0);
  const codelabCompleted = ref<boolean>(false);
  const xpAwarded = ref<number>(0);

  // Sync State
  const isSyncing = ref<boolean>(false);
  const isOnline = ref<boolean>(navigator.onLine);

  // Computed
  const quizPassed = computed(() => {
    if (!currentLesson.value || quizScore.value === null) return false;
    const requiredScore = Math.ceil(currentLesson.value.quizQuestions.length * 0.7);
    return quizScore.value >= requiredScore;
  });

  const totalXpEarned = computed(() => xpAwarded.value);
  const isLessonComplete = computed(() => codelabCompleted.value);

  // LocalStorage Key Helper
  const getStorageKey = (lessonId: string) => `lesson_progress_${lessonId}`;

  // ─── Network Status ─────────────────────────────────────────
  window.addEventListener('online', () => {
    isOnline.value = true;
    syncToServer().catch(() => {});
  });
  window.addEventListener('offline', () => {
    isOnline.value = false;
  });

  // ─── Load / Sync ────────────────────────────────────────────
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
    const data = {
      hasWatchedVisualizer: hasWatchedVisualizer.value,
      quizScore: quizScore.value,
      bestScore: bestScore.value,
      codelabCompleted: codelabCompleted.value,
      xpAwarded: xpAwarded.value,
    };
    localStorage.setItem(getStorageKey(currentLesson.value.id), JSON.stringify(data));
  }

  async function syncToServer(force = false) {
    if (!currentLesson.value) return;
    
    // Nếu không đăng nhập hoặc mất mạng, chỉ lưu local
    const token = localStorage.getItem('token');
    if (!token || !isOnline.value) {
      saveToLocalStorage();
      return;
    }

    if (isSyncing.value && !force) return;

    isSyncing.value = true;
    try {
      const payload = {
        lessonId: currentLesson.value.id,
        hasWatchedVisualizer: hasWatchedVisualizer.value,
        quizScore: quizScore.value,
        codelabCompleted: codelabCompleted.value,
        xpAwarded: xpAwarded.value,
      };
      
      await saveLessonProgress(payload);
      saveToLocalStorage(); // Lưu đồng bộ
    } catch (err) {
      console.warn('Đồng bộ thất bại, sẽ thử lại sau', err);
      saveToLocalStorage();
      // Thử lại sau 10 giây nếu lỗi
      setTimeout(() => {
        if (isOnline.value) syncToServer(true);
      }, 10000);
    } finally {
      isSyncing.value = false;
    }
  }

  // ─── Debounce Sync ──────────────────────────────────────────
  let syncTimeout: ReturnType<typeof setTimeout> | null = null;
  function debouncedSync() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      syncToServer().catch(() => {});
      syncTimeout = null;
    }, 3000);
  }

  // ─── Actions ────────────────────────────────────────────────
  async function loadLesson(lessonId: string) {
    isLoading.value = true;
    error.value = null;
    
    // Khôi phục giá trị mặc định
    activeStep.value = 1;
    hasWatchedVisualizer.value = false;
    quizScore.value = null;
    bestScore.value = 0;
    codelabCompleted.value = false;
    xpAwarded.value = 0;

    const lesson = LESSONS[lessonId];
    if (lesson) {
      currentLesson.value = lesson;
      
      // 1. Khôi phục từ localStorage trước để hiển thị ngay
      loadFromLocalStorage(lessonId);
      
      // 2. Fetch server progress
      const token = localStorage.getItem('token');
      if (token && isOnline.value) {
        try {
          const serverData = await fetchLessonProgress(lessonId);
          if (serverData && Object.keys(serverData).length > 0) {
            hasWatchedVisualizer.value = !!serverData.hasWatchedVisualizer || hasWatchedVisualizer.value;
            if (serverData.quizScore !== undefined) quizScore.value = serverData.quizScore;
            if (serverData.bestScore !== undefined && serverData.bestScore > bestScore.value) bestScore.value = serverData.bestScore;
            codelabCompleted.value = !!serverData.codelabCompleted || codelabCompleted.value;
            if (serverData.xpAwarded !== undefined && serverData.xpAwarded > xpAwarded.value) xpAwarded.value = serverData.xpAwarded;
            
            saveToLocalStorage();
          }
        } catch (e) {
          console.warn('Không thể fetch progress từ server, dùng local', e);
        }
      }
      
      // Khôi phục bước (step) hợp lý nhất
      if (codelabCompleted.value) {
        activeStep.value = 4;
      } else if (quizPassed.value) {
        activeStep.value = 3;
      } else if (hasWatchedVisualizer.value) {
        activeStep.value = 2;
      }
    } else {
      console.error(`Lesson not found: ${lessonId}`);
      currentLesson.value = null;
      error.value = 'Không tìm thấy bài học';
    }
    isLoading.value = false;
  }

  function markVisualizerWatched() {
    if (!hasWatchedVisualizer.value) {
      hasWatchedVisualizer.value = true;
      saveToLocalStorage();
      debouncedSync();
    }
  }

  async function submitQuiz(answers: Record<string, number>) {
    if (!currentLesson.value) return;
    
    const questions = currentLesson.value.quizQuestions;
    let correct = 0;
    
    for (const q of questions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    
    quizScore.value = correct;
    if (correct > bestScore.value) {
      bestScore.value = correct;
    }

    saveToLocalStorage();
    await syncToServer(true);

    if (quizPassed.value) {
      // Chỉ nhận XP phần Quiz (50%)
      const halfXp = Math.floor(currentLesson.value.xpReward * 0.5);
      if (xpAwarded.value < halfXp) {
        const diff = halfXp - xpAwarded.value;
        try {
          await awardXp(diff, `Hoàn thành Quiz: ${currentLesson.value.title}`);
          xpAwarded.value += diff;
          saveToLocalStorage();
          await syncToServer(true);
        } catch (e) {
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
    if (!currentLesson.value) return;

    if (!codelabCompleted.value) {
      codelabCompleted.value = true;
      
      saveToLocalStorage();
      await syncToServer(true);

      const totalXp = currentLesson.value.xpReward;
      if (xpAwarded.value < totalXp) {
        const diff = totalXp - xpAwarded.value;
        try {
          await awardXp(diff, `Hoàn thành CodeLab: ${currentLesson.value.title}`);
          xpAwarded.value += diff;
          saveToLocalStorage();
          await syncToServer(true);
        } catch (e) {
          console.warn('API award-xp lỗi, lưu XP local', e);
          xpAwarded.value += diff;
          saveToLocalStorage();
        }
      }
    }
  }

  function goToStep(stepNumber: number) {
    if (stepNumber === 3 && !hasWatchedVisualizer.value) return;
    if (stepNumber === 4 && !quizPassed.value) return;
    activeStep.value = stepNumber;
  }

  return {
    currentLesson,
    activeStep,
    isLoading,
    error,
    
    // Progress State
    hasWatchedVisualizer,
    quizScore,
    bestScore,
    quizPassed,
    codelabCompleted,
    xpAwarded,
    
    // Sync Status
    isSyncing,
    isOnline,
    totalXpEarned,
    isLessonComplete,

    // Methods
    loadLesson,
    markVisualizerWatched,
    submitQuiz,
    resetQuiz,
    completeCodelab,
    goToStep,
    syncToServer
  };
});
