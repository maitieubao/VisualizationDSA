import type { UserQuizStats } from '../types/quiz.types';

const STORAGE_KEY = 'dsa_quiz_statistics';

/** Số đếm an toàn: phải là số nguyên không âm (attempts/correct/streak không thể là số thực). */
function isSafeCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Chuẩn hóa dữ liệu đọc từ localStorage sau JSON.parse.
 * Chống QZ-013: storage hợp lệ JSON nhưng sai shape (thiếu field, field sai kiểu, null...)
 * → từng field không đạt chuẩn được thay bằng giá trị mặc định, không ném TypeError.
 */
function normalizeStats(raw: unknown): UserQuizStats {
  const defaults: UserQuizStats = {
    totalAttempts: 0,
    correctAnswers: 0,
    streak: 0,
    bestStreak: 0,
    completedQuizzes: [],
  };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaults;
  }

  const candidate = raw as Record<string, unknown>;

  return {
    totalAttempts: isSafeCount(candidate.totalAttempts) ? candidate.totalAttempts : 0,
    correctAnswers: isSafeCount(candidate.correctAnswers) ? candidate.correctAnswers : 0,
    streak: isSafeCount(candidate.streak) ? candidate.streak : 0,
    bestStreak: isSafeCount(candidate.bestStreak) ? candidate.bestStreak : 0,
    completedQuizzes: Array.isArray(candidate.completedQuizzes)
      ? candidate.completedQuizzes.filter((id): id is string => typeof id === 'string')
      : [],
  };
}

export class QuizStatsManager {
  static getStats(): UserQuizStats {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return normalizeStats(null);
      }
      return normalizeStats(JSON.parse(data) as unknown);
    } catch {
      return normalizeStats(null);
    }
  }

  /**
   * Ghi nhận một lượt trả lời:
   * - `streak` (phiên) tăng khi đúng, reset về 0 khi sai;
   * - `bestStreak` (lifetime) chỉ tăng khi streak phiên vượt kỷ lục cũ — không bao giờ giảm.
   */
  static saveAttempt(isCorrect: boolean, quizId: string): void {
    try {
      const stats = this.getStats();
      stats.totalAttempts++;

      if (isCorrect) {
        stats.correctAnswers++;
        stats.streak++;
        if (stats.streak > stats.bestStreak) {
          stats.bestStreak = stats.streak;
        }
      } else {
        stats.streak = 0;
      }

      if (isCorrect && !stats.completedQuizzes.includes(quizId)) {
        stats.completedQuizzes.push(quizId);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (err) {
      console.error('Failed to save quiz statistics to localStorage:', err);
    }
  }

  /** Tỉ lệ trả lời đúng (0–100), làm tròn; trả 0 khi chưa có lượt trả lời nào. */
  static getAccuracy(): number {
    const stats = this.getStats();
    if (stats.totalAttempts <= 0) {
      return 0;
    }
    return Math.round((stats.correctAnswers / stats.totalAttempts) * 100);
  }

  static clearStats(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
