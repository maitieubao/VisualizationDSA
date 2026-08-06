// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BaseIcon from '../../../shared/components/BaseIcon.vue';
import StreakFire from '../components/StreakFire.vue';
import BadgesCabinet from '../components/BadgesCabinet.vue';

import { useGamificationStore } from '../store/useGamificationStore';
import { StreakCalculator } from '../engine/StreakCalculator';
import { BADGE_TEMPLATES, MAX_STREAK_FREEZES } from '../types/gamification.types';

describe('GM-001 (P0): Streak render', () => {
  let wrapper: VueWrapper | null = null;

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('StreakFire render số ngày streak = 0', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, {
      props: { streakCount: 0 },
    });
    expect(wrapper.text()).toContain('0');
    expect(wrapper.text()).toContain('ngày');
  });

  it('StreakFire render số ngày streak = 7', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, {
      props: { streakCount: 7 },
    });
    expect(wrapper.text()).toContain('7');
    expect(wrapper.text()).toContain('ngày');
  });

  it('StreakFire hiển thị "đang cháy" khi streak > 0', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, {
      props: { streakCount: 5 },
    });
    expect(wrapper.text()).toContain('Chuỗi học tập đang cháy!');
  });

  it('StreakFire hiển thị "chưa có hoạt động" khi streak = 0', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, {
      props: { streakCount: 0 },
    });
    expect(wrapper.text()).toContain('Chưa có hoạt động');
  });

  it('StreakFire có class active khi streak > 0', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, {
      props: { streakCount: 3 },
    });
    const icon = wrapper.find('.streak-fire-active');
    expect(icon.exists()).toBe(true);
  });
});

describe('GM-002 (P0): Badges render', () => {
  let wrapper: VueWrapper | null = null;

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('BadgesCabinet render tất cả badges', () => {
    setActivePinia(createPinia());
    wrapper = mount(BadgesCabinet, {
      global: { components: { BaseIcon } },
      props: {
        allBadges: BADGE_TEMPLATES,
        unlockedBadges: [],
      },
    });
    const slots = wrapper.findAll('.badge-card-slot');
    expect(slots.length).toBe(BADGE_TEMPLATES.length);
  });

  it('BadgesCabinet hiển thị unlocked badges với class đúng', () => {
    setActivePinia(createPinia());
    wrapper = mount(BadgesCabinet, {
      global: { components: { BaseIcon } },
      props: {
        allBadges: BADGE_TEMPLATES,
        unlockedBadges: ['sorting-champion', 'streak-warrior'],
      },
    });
    const unlocked = wrapper.findAll('.badge-unlocked');
    expect(unlocked.length).toBe(2);
  });

  it('BadgesCabinet hiển thị locked badges với class đúng', () => {
    setActivePinia(createPinia());
    wrapper = mount(BadgesCabinet, {
      global: { components: { BaseIcon } },
      props: {
        allBadges: BADGE_TEMPLATES,
        unlockedBadges: ['sorting-champion'],
      },
    });
    const locked = wrapper.findAll('.badge-locked');
    expect(locked.length).toBe(BADGE_TEMPLATES.length - 1);
  });

  it('BadgesCabinet render badge titles', () => {
    setActivePinia(createPinia());
    wrapper = mount(BadgesCabinet, {
      global: { components: { BaseIcon } },
      props: {
        allBadges: BADGE_TEMPLATES,
        unlockedBadges: [],
      },
    });
    expect(wrapper.text()).toContain('Recursion Master');
    expect(wrapper.text()).toContain('SOLID Architect');
    expect(wrapper.text()).toContain('Sorting Champion');
  });
});

describe('GM-005 (P1): Streak Freeze', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('useStreakFreeze giảm streakFreezesCount', () => {
    const store = useGamificationStore();
    expect(store.streakFreezesCount).toBe(MAX_STREAK_FREEZES);
    const result = store.useStreakFreeze();
    expect(result).toBe(true);
    expect(store.streakFreezesCount).toBe(MAX_STREAK_FREEZES - 1);
  });

  it('useStreakFreeze không giảm dưới 0', () => {
    const store = useGamificationStore();
    store.useStreakFreeze();
    store.useStreakFreeze();
    store.useStreakFreeze();
    store.useStreakFreeze();
    store.useStreakFreeze();
    expect(store.streakFreezesCount).toBe(0);
  });

  it('useStreakFreeze trả về false khi hết freeze', () => {
    const store = useGamificationStore();
    store.useStreakFreeze();
    store.useStreakFreeze();
    store.useStreakFreeze();
    const result = store.useStreakFreeze();
    expect(result).toBe(false);
  });

  it('useStreakFreeze trả về true khi còn freeze', () => {
    const store = useGamificationStore();
    const result = store.useStreakFreeze();
    expect(result).toBe(true);
  });
});

describe('GM-006 (P1): Nhận XP', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('earnXPLocal tăng currentXP', () => {
    const store = useGamificationStore();
    store.earnXPLocal(100);
    expect(store.currentXP).toBe(100);
  });

  it('earnXPLocal tích lũy XP', () => {
    const store = useGamificationStore();
    store.earnXPLocal(50);
    store.earnXPLocal(75);
    expect(store.currentXP).toBe(125);
  });

  it('earnXPLocal từ chối XP <= 0', () => {
    const store = useGamificationStore();
    store.earnXPLocal(0);
    expect(store.currentXP).toBe(0);
    store.earnXPLocal(-50);
    expect(store.currentXP).toBe(0);
  });

  it('earnXPLocal từ chối XP > MAX_XP_PER_QUIZ (200)', () => {
    const store = useGamificationStore();
    store.earnXPLocal(300);
    expect(store.currentXP).toBe(0);
  });

  it('earnXPLocal chấp nhận XP = MAX_XP_PER_QUIZ', () => {
    const store = useGamificationStore();
    store.earnXPLocal(200);
    expect(store.currentXP).toBe(200);
  });
});

describe('GM-007 (P1): Mở khóa badge', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('checkAndUnlockBadges mở khóa khi đủ XP và streak', () => {
    const store = useGamificationStore();
    store.earnXPLocal(200);
    store.earnXPLocal(200);
    store.completedAlgorithms.push('sorting');
    store.setStreakForTesting(3);
    store.checkAndUnlockBadges();
    expect(store.unlockedBadges.length).toBeGreaterThan(0);
  });

  it('checkAndUnlockBadges KHÔNG mở khóa nếu thiếu requiredAlgorithm', () => {
    const store = useGamificationStore();
    store.earnXPLocal(200);
    store.earnXPLocal(200);
    store.setStreakForTesting(3);
    store.checkAndUnlockBadges();
    expect(store.unlockedBadges).not.toContain('sorting-champion');
  });

  it('checkAndUnlockBadges không mở lại badge đã unlock', () => {
    const store = useGamificationStore();
    store.earnXPLocal(200);
    store.earnXPLocal(200);
    store.completedAlgorithms.push('sorting');
    store.setStreakForTesting(3);
    store.checkAndUnlockBadges();
    const firstCount = store.unlockedBadges.length;
    store.checkAndUnlockBadges();
    expect(store.unlockedBadges.length).toBe(firstCount);
  });

  it('lockedBadges cập nhật sau khi unlock', () => {
    const store = useGamificationStore();
    expect(store.lockedBadges.length).toBe(BADGE_TEMPLATES.length);
    store.earnXPLocal(200);
    store.earnXPLocal(200);
    store.completedAlgorithms.push('sorting');
    store.setStreakForTesting(3);
    store.checkAndUnlockBadges();
    expect(store.lockedBadges.length).toBeLessThan(BADGE_TEMPLATES.length);
  });
});

describe('GM-012 (P1): Streak calculator', () => {
  it('getAdjustedDate trừ GRACE_HOURS_OFFSET (2h)', () => {
    const date = new Date('2026-05-18T03:00:00');
    const result = StreakCalculator.getAdjustedDate(date);
    expect(result).toBe('2026-05-18');
  });

  it('getAdjustedDate giữ streak khi 1:45 AM (trong grace period)', () => {
    const date = new Date('2026-05-18T01:45:00');
    const result = StreakCalculator.getAdjustedDate(date);
    expect(result).toBe('2026-05-17');
  });

  it('getAdjustedDate reset streak khi 2:05 AM (sau grace period)', () => {
    const date = new Date('2026-05-18T02:05:00');
    const result = StreakCalculator.getAdjustedDate(date);
    expect(result).toBe('2026-05-18');
  });

  it('calculateUpdatedStreak tăng streak khi hoạt động hôm qua', () => {
    const result = StreakCalculator.calculateUpdatedStreak('2026-05-17', 5, '2026-05-18');
    expect(result.nextStreak).toBe(6);
    expect(result.shouldUpdate).toBe(true);
  });

  it('calculateUpdatedStreak giữ nguyên streak khi cùng ngày', () => {
    const result = StreakCalculator.calculateUpdatedStreak('2026-05-18', 5, '2026-05-18');
    expect(result.nextStreak).toBe(5);
    expect(result.shouldUpdate).toBe(false);
  });

  it('calculateUpdatedStreak reset streak khi cách 2 ngày', () => {
    const result = StreakCalculator.calculateUpdatedStreak('2026-05-16', 10, '2026-05-18');
    expect(result.nextStreak).toBe(1);
    expect(result.shouldUpdate).toBe(true);
  });

  it('calculateUpdatedStreak dùng Streak Freeze khi cách 1 ngày và có freeze', () => {
    const result = StreakCalculator.calculateUpdatedStreak('2026-05-16', 5, '2026-05-18', 3);
    expect(result.nextStreak).toBe(5);
    expect(result.freezeUsed).toBe(true);
    expect(result.shouldUpdate).toBe(true);
  });

  it('calculateUpdatedStreak không dùng freeze nếu streak <= 1', () => {
    const result = StreakCalculator.calculateUpdatedStreak('2026-05-16', 1, '2026-05-18', 3);
    expect(result.nextStreak).toBe(1);
    expect(result.freezeUsed).toBeUndefined();
  });

  it('calculateUpdatedStreak bắt đầu streak mới từ 1', () => {
    const result = StreakCalculator.calculateUpdatedStreak('', 0, '2026-05-18');
    expect(result.nextStreak).toBe(1);
    expect(result.shouldUpdate).toBe(true);
  });

  it('calculateUpdatedStreak xử lý ranh giới năm', () => {
    const result = StreakCalculator.calculateUpdatedStreak('2026-12-31', 30, '2027-01-01');
    expect(result.nextStreak).toBe(31);
    expect(result.shouldUpdate).toBe(true);
  });
});
