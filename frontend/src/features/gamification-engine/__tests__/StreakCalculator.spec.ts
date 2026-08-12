import { describe, it, expect, afterEach } from 'vitest';
import { StreakCalculator } from '../engine/StreakCalculator';

describe('StreakCalculator', () => {
  describe('getAdjustedDate', () => {
    it('should subtract 2 hours for Grace Period adjustment', () => {
      const date = new Date('2026-05-18T03:00:00');
      const result = StreakCalculator.getAdjustedDate(date);
      expect(result).toBe('2026-05-18');
    });

    it('should keep streak active when submitting at 1:45 AM (Late-Night Grace Period)', () => {
      const submissionTime = new Date('2026-05-18T01:45:00');
      const adjustedDateStr = StreakCalculator.getAdjustedDate(submissionTime);
      expect(adjustedDateStr).toBe('2026-05-17');
    });

    it('should break streak when submitting at 2:05 AM (past Grace Period)', () => {
      const submissionTime = new Date('2026-05-18T02:05:00');
      const adjustedDateStr = StreakCalculator.getAdjustedDate(submissionTime);
      expect(adjustedDateStr).toBe('2026-05-18');
    });

    it('should handle midnight submission (00:00 AM)', () => {
      const midnight = new Date('2026-05-18T00:00:00');
      const result = StreakCalculator.getAdjustedDate(midnight);
      expect(result).toBe('2026-05-17');
    });

    it('should handle exactly 2:00 AM boundary', () => {
      const boundary = new Date('2026-05-18T02:00:00');
      const result = StreakCalculator.getAdjustedDate(boundary);
      expect(result).toBe('2026-05-18');
    });

    it('should handle noon submission without date change', () => {
      const noon = new Date('2026-05-18T12:00:00');
      const result = StreakCalculator.getAdjustedDate(noon);
      expect(result).toBe('2026-05-18');
    });

    it('should handle year boundary (Jan 1 at 1:00 AM)', () => {
      const newYear = new Date('2027-01-01T01:00:00');
      const result = StreakCalculator.getAdjustedDate(newYear);
      expect(result).toBe('2026-12-31');
    });

    it('should handle month boundary (March 1 at 0:30 AM)', () => {
      const monthBoundary = new Date('2026-03-01T00:30:00');
      const result = StreakCalculator.getAdjustedDate(monthBoundary);
      expect(result).toBe('2026-02-28');
    });

    it('should return date in YYYY-MM-DD format', () => {
      const date = new Date('2026-05-18T15:30:00');
      const result = StreakCalculator.getAdjustedDate(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should pad single digit month and day with zeros', () => {
      const date = new Date('2026-01-05T10:00:00');
      const result = StreakCalculator.getAdjustedDate(date);
      expect(result).toBe('2026-01-05');
    });
  });

  describe('calculateUpdatedStreak', () => {
    it('should not update streak if already submitted today', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-18', 5, '2026-05-18');
      expect(result).toEqual({ nextStreak: 5, shouldUpdate: false });
    });

    it('should increment streak when continuing from yesterday', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-17', 5, '2026-05-18');
      expect(result).toEqual({ nextStreak: 6, shouldUpdate: true });
    });

    it('should reset streak to 1 when gap is more than 1 day', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-15', 10, '2026-05-18');
      expect(result).toEqual({ nextStreak: 1, shouldUpdate: true });
    });

    it('should reset streak to 1 when gap is exactly 2 days', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-16', 3, '2026-05-18');
      expect(result).toEqual({ nextStreak: 1, shouldUpdate: true });
    });

    it('should start new streak from 1 when first ever activity', () => {
      const result = StreakCalculator.calculateUpdatedStreak('', 0, '2026-05-18');
      expect(result).toEqual({ nextStreak: 1, shouldUpdate: true });
    });

    it('should handle streak increment across month boundary', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-31', 10, '2026-06-01');
      expect(result).toEqual({ nextStreak: 11, shouldUpdate: true });
    });

    it('should handle streak increment across year boundary', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-12-31', 30, '2027-01-01');
      expect(result).toEqual({ nextStreak: 31, shouldUpdate: true });
    });

    it('should maintain current streak value when same day (no change)', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-18', 1, '2026-05-18');
      expect(result.nextStreak).toBe(1);
      expect(result.shouldUpdate).toBe(false);
    });

    it('should return shouldUpdate true when incrementing', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-17', 3, '2026-05-18');
      expect(result.shouldUpdate).toBe(true);
    });

    it('should return shouldUpdate true when resetting', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-10', 20, '2026-05-18');
      expect(result.shouldUpdate).toBe(true);
    });
  });

  describe('GM-018: streak freeze gap', () => {
    it('freeze đúng 1 ngày nghỉ (gap 2 ngày) + có freeze + streak>1 → giữ streak', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-16', 5, '2026-05-18', 3);
      expect(result).toEqual({ nextStreak: 5, shouldUpdate: true, freezeUsed: true });
    });

    it('gap > 2 ngày (nghỉ ≥ 2 ngày) → reset dù còn freeze', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-15', 5, '2026-05-18', 3);
      expect(result).toEqual({ nextStreak: 1, shouldUpdate: true });
      expect(result.freezeUsed).toBeUndefined();
    });

    it('gap 2 ngày nhưng hết freeze → reset về 1', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-16', 5, '2026-05-18', 0);
      expect(result).toEqual({ nextStreak: 1, shouldUpdate: true });
    });

    it('gap 2 ngày + streak==1 → giữ streak 1 (không cần reset)', () => {
      const result = StreakCalculator.calculateUpdatedStreak('2026-05-16', 1, '2026-05-18', 3);
      expect(result.nextStreak).toBe(1);
      expect(result.shouldUpdate).toBe(true);
    });
  });

  describe('GM-008t: timezone matrix', () => {
    const savedTz = process.env.TZ;

    afterEach(() => {
      if (savedTz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = savedTz;
      }
    });

    it.each(['UTC', 'UTC+5', 'UTC-7'])(
      'TZ=%s: wall-clock 23:30 → adjusted = ngày local (không lệch sang UTC date)',
      (tz) => {
        process.env.TZ = tz;
        expect(StreakCalculator.getAdjustedDate(new Date('2026-05-18T23:30:00'))).toBe('2026-05-18');
        expect(StreakCalculator.getAdjustedDate(new Date('2026-05-18T01:00:00'))).toBe('2026-05-17');
        expect(StreakCalculator.getAdjustedDate(new Date('2026-05-18T12:00:00'))).toBe('2026-05-18');
      },
    );

    it('adjusted date tính theo local getters (getFullYear/getMonth/getDate), không theo UTC', () => {
      const date = new Date('2026-05-18T23:30:00');
      const adjusted = new Date(date.getTime() - 2 * 3_600_000);
      const expected = `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, '0')}-${String(adjusted.getDate()).padStart(2, '0')}`;
      expect(StreakCalculator.getAdjustedDate(date)).toBe(expected);
    });

    it('calculateUpdatedStreak nhất quán với todayDateStr sinh từ getAdjustedDate (không lệch 2 hệ)', () => {
      const today = StreakCalculator.getAdjustedDate(new Date('2026-05-18T12:00:00'));
      const yesterday = StreakCalculator.getAdjustedDate(new Date('2026-05-17T12:00:00'));
      const result = StreakCalculator.calculateUpdatedStreak(yesterday, 4, today);
      expect(result.nextStreak).toBe(5);
    });
  });
});
