// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../service/userProgressApi', () => ({
  fetchUserProgress: vi.fn(),
  syncXPToServer: vi.fn(async (_token: string, payload: { amount: number; reason: string }) => ({
    message: 'OK',
    totalXP: payload.amount,
    currentLevel: 1,
  })),
  markModuleComplete: vi.fn(),
}));

vi.mock('../../auth/store/useAuthStore', () => {
  const mockAuthStore = {
    getAccessToken: vi.fn(),
    refreshAccessToken: vi.fn(),
  };
  return {
    useAuthStore: () => mockAuthStore,
  };
});

interface MockAuthStore {
  getAccessToken: ReturnType<typeof vi.fn>;
  refreshAccessToken: ReturnType<typeof vi.fn>;
}

import { useUserProgressStore } from '../store/useUserProgressStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { fetchUserProgress, syncXPToServer } from '../service/userProgressApi';

describe('UP-001 (P0): Radar chart render', () => {
  let wrapper: VueWrapper | null = null;

  afterEach(() => {
    wrapper?.unmount();
    setActivePinia(createPinia());
  });

  it('SkillRadarChart render title và 5 trục labels', async () => {
    const SkillRadarChart = (await import('../components/SkillRadarChart.vue')).default;
    setActivePinia(createPinia());
    wrapper = mount(SkillRadarChart);

    expect(wrapper.text()).toContain('Phân Tích Năng Lực Cốt Lõi');
    const chartContainer = wrapper.find('.chart-container');
    expect(chartContainer.exists()).toBe(true);
  });

  it('SkillRadarChart render legend với đúng 5 skills', async () => {
    const SkillRadarChart = (await import('../components/SkillRadarChart.vue')).default;
    setActivePinia(createPinia());
    wrapper = mount(SkillRadarChart);

    const legendItems = wrapper.findAll('.legend-item');
    expect(legendItems.length).toBe(5);
  });

  it('SkillRadarChart render legend labels đúng tên', async () => {
    const SkillRadarChart = (await import('../components/SkillRadarChart.vue')).default;
    setActivePinia(createPinia());
    wrapper = mount(SkillRadarChart);

    expect(wrapper.text()).toContain('Sắp xếp');
    expect(wrapper.text()).toContain('Đồ thị');
    expect(wrapper.text()).toContain('OOP');
    expect(wrapper.text()).toContain('SOLID');
    expect(wrapper.text()).toContain('Design Patterns');
  });
});

describe('UP-002 (P0): XP + Level', () => {
  let authStore: MockAuthStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue('mock-token');
    vi.mocked(fetchUserProgress).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('store.totalXP được set đúng từ DTO', async () => {
    const mockProgress = {
      totalXP: 750,
      currentLevel: 4,
      xpToNextLevel: 250,
      levelProgressPercent: 60,
      badgesEarned: 2,
      modulesCompleted: 3,
      currentStreak: 5,
      completedModuleIds: ['m1', 'm2'],
      badges: [],
    };
    vi.mocked(fetchUserProgress).mockResolvedValue(mockProgress);

    const store = useUserProgressStore();
    await store.loadProgress();

    expect(store.totalXP).toBe(750);
    expect(store.currentLevel).toBe(4);
  });

  it('store.currentLevel đúng khi XP đủ threshold', async () => {
    const mockProgress = {
      totalXP: 600,
      currentLevel: 4,
      xpToNextLevel: 400,
      levelProgressPercent: 50,
      badgesEarned: 1,
      modulesCompleted: 2,
      currentStreak: 3,
      completedModuleIds: ['m1'],
      badges: [],
    };
    vi.mocked(fetchUserProgress).mockResolvedValue(mockProgress);

    const store = useUserProgressStore();
    await store.loadProgress();

    expect(store.currentLevel).toBe(4);
    expect(store.totalXP).toBe(600);
  });

  it('syncXP cập nhật totalXP local trước khi server confirm', () => {
    const store = useUserProgressStore();
    store.syncXP(100, 'lesson-completed');
    expect(store.totalXP).toBe(100);
  });

  it('syncXP tích lũy nhiều lần', () => {
    const store = useUserProgressStore();
    store.syncXP(50, 'quiz-1');
    store.syncXP(75, 'quiz-2');
    store.syncXP(25, 'streak-bonus');
    expect(store.totalXP).toBe(150);
  });
});

describe('UP-004 (P1): Offline queue', () => {
  let authStore: MockAuthStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue(null);
    vi.mocked(syncXPToServer).mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('syncXP khi không có token sẽ vào queue (persist vào localStorage)', () => {
    const store = useUserProgressStore();
    store.syncXP(50, 'offline-lesson');
    const saved = JSON.parse(localStorage.getItem('vdsa_xp_sync_queue') ?? '[]');
    expect(saved.length).toBe(1);
    expect(saved[0]).toEqual({ amount: 50, reason: 'offline-lesson' });
  });

  it('queue persist vào localStorage', () => {
    const store = useUserProgressStore();
    store.syncXP(30, 'offline-quiz');
    const saved = JSON.parse(localStorage.getItem('vdsa_xp_sync_queue') ?? '[]');
    expect(saved).toEqual([{ amount: 30, reason: 'offline-quiz' }]);
  });

  it('nhiều XP offline đều được queue', () => {
    const store = useUserProgressStore();
    store.syncXP(10, 'a');
    store.syncXP(20, 'b');
    store.syncXP(30, 'c');
    const saved = JSON.parse(localStorage.getItem('vdsa_xp_sync_queue') ?? '[]');
    expect(saved.length).toBe(3);
  });

  it('không gọi syncXPToServer khi offline', () => {
    const store = useUserProgressStore();
    store.syncXP(50, 'offline-action');
    expect(vi.mocked(syncXPToServer)).not.toHaveBeenCalled();
  });
});

describe('UP-006 (P1): Level thresholds', () => {
  let authStore: MockAuthStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue('token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('level 1 khi XP = 0', () => {
    const store = useUserProgressStore();
    store.syncXP(0, 'test');
    expect(store.currentLevel).toBe(1);
  });

  it('level 2 khi XP = 100', () => {
    const store = useUserProgressStore();
    store.syncXP(100, 'test');
    expect(store.currentLevel).toBe(2);
  });

  it('level 3 khi XP = 300', () => {
    const store = useUserProgressStore();
    store.syncXP(300, 'test');
    expect(store.currentLevel).toBe(3);
  });

  it('level 4 khi XP = 600', () => {
    const store = useUserProgressStore();
    store.syncXP(600, 'test');
    expect(store.currentLevel).toBe(4);
  });

  it('level 5 khi XP = 1000', () => {
    const store = useUserProgressStore();
    store.syncXP(1000, 'test');
    expect(store.currentLevel).toBe(5);
  });

  it('level 6 khi XP = 1500', () => {
    const store = useUserProgressStore();
    store.syncXP(1500, 'test');
    expect(store.currentLevel).toBe(6);
  });

  it('level 7 khi XP = 2200', () => {
    const store = useUserProgressStore();
    store.syncXP(2200, 'test');
    expect(store.currentLevel).toBe(7);
  });

  it('level 8 khi XP = 3000', () => {
    const store = useUserProgressStore();
    store.syncXP(3000, 'test');
    expect(store.currentLevel).toBe(8);
  });

  it('level không thay đổi khi XP giữa thresholds', () => {
    const store = useUserProgressStore();
    store.syncXP(150, 'test');
    expect(store.currentLevel).toBe(2);
  });
});

describe('UP-007 (P1): Level progress %', () => {
  let authStore: MockAuthStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue('token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('xpProgressPercent = 0 khi level 1 XP 0', () => {
    const store = useUserProgressStore();
    expect(store.levelProgressPercent).toBe(0);
  });

  it('xpProgressPercent tăng khi XP tăng trong level', () => {
    const store = useUserProgressStore();
    store.syncXP(50, 'test');
    expect(store.levelProgressPercent).toBeGreaterThan(0);
  });

  it('xpProgressPercent = 0 khi vừa lên level mới (XP=100 → level 2, next=300)', () => {
    const store = useUserProgressStore();
    store.syncXP(100, 'test');
    expect(store.currentLevel).toBe(2);
    expect(store.levelProgressPercent).toBe(0);
  });

  it('xpToNextLevel giảm khi XP tăng', () => {
    const store = useUserProgressStore();
    expect(store.xpToNextLevel).toBe(100);
    store.syncXP(50, 'test');
    expect(store.xpToNextLevel).toBe(50);
  });
});
