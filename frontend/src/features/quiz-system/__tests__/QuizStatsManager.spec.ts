
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizStatsManager } from '../engine/QuizStatsManager';

describe('QuizStatsManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return default stats when localStorage is empty', () => {
    const stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(0);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.completedQuizzes).toEqual([]);
  });

  it('should save correct attempt and increment streak', () => {
    QuizStatsManager.saveAttempt(true, 'q1');
    const stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(1);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.streak).toBe(1);
    expect(stats.completedQuizzes).toContain('q1');
  });

  it('should save incorrect attempt and reset streak', () => {
    QuizStatsManager.saveAttempt(true, 'q1');
    QuizStatsManager.saveAttempt(true, 'q2');
    QuizStatsManager.saveAttempt(false, 'q3');

    const stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(3);
    expect(stats.correctAnswers).toBe(2);
    expect(stats.streak).toBe(0);
  });

  it('should accumulate streak across multiple correct answers', () => {
    QuizStatsManager.saveAttempt(true, 'q1');
    QuizStatsManager.saveAttempt(true, 'q2');
    QuizStatsManager.saveAttempt(true, 'q3');

    const stats = QuizStatsManager.getStats();
    expect(stats.streak).toBe(3);
    expect(stats.correctAnswers).toBe(3);
  });

  it('should not add duplicate quiz IDs to completedQuizzes', () => {
    QuizStatsManager.saveAttempt(true, 'q1');
    QuizStatsManager.saveAttempt(true, 'q1');

    const stats = QuizStatsManager.getStats();
    expect(stats.completedQuizzes.filter((id) => id === 'q1').length).toBe(1);
  });

  it('should not add quiz to completedQuizzes on incorrect answer', () => {
    QuizStatsManager.saveAttempt(false, 'q1');

    const stats = QuizStatsManager.getStats();
    expect(stats.completedQuizzes).not.toContain('q1');
  });

  it('should clear all stats', () => {
    QuizStatsManager.saveAttempt(true, 'q1');
    QuizStatsManager.saveAttempt(true, 'q2');
    QuizStatsManager.clearStats();

    const stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(0);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.completedQuizzes).toEqual([]);
  });

  it('should handle corrupted localStorage gracefully', () => {
    localStorage.setItem('dsa_quiz_statistics', 'not-valid-json');
    const stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(0);
    expect(stats.correctAnswers).toBe(0);
  });

  it('should persist across multiple getStats calls', () => {
    QuizStatsManager.saveAttempt(true, 'q1');
    QuizStatsManager.saveAttempt(false, 'q2');
    QuizStatsManager.saveAttempt(true, 'q3');

    const stats1 = QuizStatsManager.getStats();
    const stats2 = QuizStatsManager.getStats();

    expect(stats1.totalAttempts).toBe(stats2.totalAttempts);
    expect(stats1.correctAnswers).toBe(stats2.correctAnswers);
    expect(stats1.streak).toBe(stats2.streak);
  });

  it('should fallback missing fields to defaults on partial JSON (QZ-049)', () => {
    localStorage.setItem('dsa_quiz_statistics', JSON.stringify({ totalAttempts: 1 }));

    const stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(1);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.bestStreak).toBe(0);
    expect(stats.completedQuizzes).toEqual([]);
  });

  it('should fallback wrong-shaped fields to defaults (QZ-049)', () => {
    localStorage.setItem(
      'dsa_quiz_statistics',
      JSON.stringify({
        totalAttempts: '5',
        correctAnswers: null,
        streak: 3.5,
        bestStreak: -1,
        completedQuizzes: 'q1',
      }),
    );

    const stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(0);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.bestStreak).toBe(0);
    expect(stats.completedQuizzes).toEqual([]);
  });

  it('should not crash saveAttempt when storage is valid JSON but wrong shape (QZ-013)', () => {
    localStorage.setItem('dsa_quiz_statistics', 'null');
    QuizStatsManager.saveAttempt(true, 'q1');

    let stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(1);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.streak).toBe(1);
    expect(stats.completedQuizzes).toContain('q1');

    localStorage.setItem('dsa_quiz_statistics', JSON.stringify({ totalAttempts: 'x', completedQuizzes: 42 }));
    QuizStatsManager.saveAttempt(false, 'q2');

    stats = QuizStatsManager.getStats();
    expect(stats.totalAttempts).toBe(1);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.streak).toBe(0);
    expect(stats.completedQuizzes).toEqual([]);
  });

  it('should keep bestStreak (lifetime) when session streak resets (QZ-023)', () => {
    QuizStatsManager.saveAttempt(true, 'q1');
    QuizStatsManager.saveAttempt(true, 'q2');
    QuizStatsManager.saveAttempt(true, 'q3');
    QuizStatsManager.saveAttempt(false, 'q4');

    const stats = QuizStatsManager.getStats();
    expect(stats.streak).toBe(0);
    expect(stats.bestStreak).toBe(3);
  });

  it('should compute getAccuracy as rounded percentage (QZ-023)', () => {
    expect(QuizStatsManager.getAccuracy()).toBe(0);

    QuizStatsManager.saveAttempt(true, 'q1');
    QuizStatsManager.saveAttempt(true, 'q2');
    QuizStatsManager.saveAttempt(false, 'q3');

    expect(QuizStatsManager.getAccuracy()).toBe(67);
  });
});
