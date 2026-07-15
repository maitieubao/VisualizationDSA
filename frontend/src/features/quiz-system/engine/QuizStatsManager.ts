import type { UserQuizStats } from '../types/quiz.types';

const STORAGE_KEY = 'dsa_quiz_statistics';

/**
 * QuizStatsManager — Persists quiz statistics to localStorage.
 * Tracks total attempts, correct answers, streak, and completed quizzes.
 */
export class QuizStatsManager {
  static getStats(): UserQuizStats {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { totalAttempts: 0, correctAnswers: 0, streak: 0, completedQuizzes: [] };
      }
      return JSON.parse(data) as UserQuizStats;
    } catch {
      return { totalAttempts: 0, correctAnswers: 0, streak: 0, completedQuizzes: [] };
    }
  }

  static saveAttempt(isCorrect: boolean, quizId: string): void {
    const stats = this.getStats();
    stats.totalAttempts++;

    if (isCorrect) {
      stats.correctAnswers++;
      stats.streak++;
    } else {
      stats.streak = 0;
    }

    if (isCorrect && !stats.completedQuizzes.includes(quizId)) {
      stats.completedQuizzes.push(quizId);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (err) {
      console.error('Failed to save quiz statistics to localStorage:', err);
    }
  }

  static clearStats(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
