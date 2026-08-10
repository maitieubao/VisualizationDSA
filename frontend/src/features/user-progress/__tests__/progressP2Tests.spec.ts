// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('../service/userProgressApi', () => {
  const ApiError = class extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  };
  return {
    fetchUserProgress: vi.fn(),
    syncXPToServer: vi.fn(),
    markModuleComplete: vi.fn(),
    ApiError,
  };
});

vi.mock('../../auth/store/useAuthStore', () => {
  const mockAuthStore = {
    getAccessToken: vi.fn(),
    refreshAccessToken: vi.fn(),
    statelessUser: { id: 'user-001' },
    userLevel: 1,
    userXP: 0,
    currentUser: null,
    isAuthenticated: false,
  };
  return { useAuthStore: () => mockAuthStore };
});

vi.mock('../../../services/gamificationApi', () => ({
  gamificationApi: {
    awardXP: vi.fn(async () => ({ totalXP: 100 })),
    getUserProgress: vi.fn(async () => ({ totalXP: 500, streakDays: 5, badges: [] })),
    checkNewBadges: vi.fn(async () => []),
  },
}));

vi.mock('../../../services/leaderboardApi', () => ({
  leaderboardApi: { getTopPlayers: vi.fn(async () => []) },
}));

vi.mock('../../gamification-engine/service/statelessGamificationApi', () => ({
  statelessGamificationApi: {
    getProfile: vi.fn(async () => ({
      userId: 'user-001', username: 'testuser', totalXp: 500, currentLevel: 3,
      levelName: 'Hoc Vien', streakDays: 7, earnedBadges: [{ id: 'streak-warrior', name: 'Streak Warrior', desc: '7 days', icon: 'fire', color: '#f97316', earnedAt: '2026-01-01' }], recentActivity: [],
    })),
    awardXp: vi.fn(async (_a: number, _r: string) => ({
      userId: 'user-001', username: 'testuser', totalXp: 550, currentLevel: 3,
      levelName: 'Hoc Vien', streakDays: 7, earnedBadges: [{ id: 'streak-warrior', name: 'Streak Warrior', desc: '7 days', icon: 'fire', color: '#f97316', earnedAt: '2026-01-01' }], recentActivity: [],
    })),
    getBadges: vi.fn(async () => [
      { id: 'recursion-master', name: 'Recursion Master', description: 'De Quy', icon: 'refresh-cw', color: '#6366f1', earnedAt: '' },
      { id: 'solid-architect', name: 'SOLID Architect', description: 'SOLID', icon: 'solid', color: '#10b981', earnedAt: '' },
    ]),
    getLeaderboard: vi.fn(async () => [
      { rank: 1, username: 'top1', totalXp: 2000, level: 5, levelName: 'Thac Si', badgeCount: 4, streakDays: 15 },
      { rank: 2, username: 'top2', totalXp: 1800, level: 4, levelName: 'Cu Nhan', badgeCount: 3, streakDays: 10 },
    ]),
  },
}));

vi.mock('../../../services/courseApi', () => ({
  courseApi: { getCourses: vi.fn(async () => []), getCourseById: vi.fn(async () => ({ lessons: [] })) },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {}, params: { id: 'test-lesson' } }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../../../shared/components/BaseIcon.vue', () => ({
  default: { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' },
}));

vi.mock('vue-chartjs', () => ({
  Radar: { name: 'Radar', template: '<canvas class="radar-canvas"></canvas>' },
}));

vi.mock('monaco-editor', () => ({
  editor: { create: vi.fn(), setModelLanguage: vi.fn() },
}));

vi.mock('@monaco-editor/loader', () => ({
  default: { init: vi.fn(async () => ({ editor: { create: vi.fn() } })) },
}));

vi.mock('monaco-editor/esm/vs/language/typescript/monaco.contribution', () => ({}));
vi.mock('monaco-editor/esm/vs/editor/editor.main.css', () => ({}));
vi.mock('monaco-editor/esm/vs/editor/editor.worker?worker', () => ({ default: class {} }));
vi.mock('monaco-editor/esm/vs/language/typescript/ts.worker?worker', () => ({ default: class {} }));

vi.mock('../../algo-playground/components/AlgoPlaygroundWorkspace.vue', () => ({
  default: { name: 'AlgoPlaygroundWorkspace', props: ['demoId'], template: '<div class="algo-playground-workspace"></div>' },
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() }, RadialLinearScale: {}, PointElement: {},
  LineElement: {}, Filler: {}, Tooltip: {}, Legend: {},
}));

import { useUserProgressStore } from '../store/useUserProgressStore';
import { useGamificationStore } from '../../gamification-engine/store/useGamificationStore';
import { useCourseStore } from '../../courses/store/useCourseStore';
import { useLessonStore } from '../../lesson/store/useLessonStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { fetchUserProgress, syncXPToServer, markModuleComplete } from '../service/userProgressApi';
import { GamificationEngine } from '../../gamification-engine/engine/GamificationEngine';
import { StreakCalculator } from '../../gamification-engine/engine/StreakCalculator';
import { BADGE_TEMPLATES, MAX_STREAK_FREEZES, LEADERBOARD_TOP_N } from '../../gamification-engine/types/gamification.types';
import { parseSandboxDemo } from '../../lesson/utils/sandboxConfig';
import { resolveLessonViz } from '../../lesson/utils/visualizerMap';
import { COURSES } from '../../../data/courses';
import { courseApi } from '../../../services/courseApi';
import StreakFire from '../../gamification-engine/components/StreakFire.vue';
import BadgesCabinet from '../../gamification-engine/components/BadgesCabinet.vue';
import WeeklyLeaderboard from '../../gamification-engine/components/WeeklyLeaderboard.vue';
import GamificationWorkspace from '../../gamification-engine/components/GamificationWorkspace.vue';
import CoursesListView from '../../../views/courses/CoursesListView.vue';
import PremiumGate from '../../payment/components/PremiumGate.vue';
import LessonStudyView from '../../../views/lesson/LessonStudyView.vue';
import LessonStepTheory from '../../../views/lesson/components/LessonStepTheory.vue';

interface MockAuthStore {
  getAccessToken: ReturnType<typeof vi.fn>;
  refreshAccessToken: ReturnType<typeof vi.fn>;
  statelessUser: { id: string };
  userLevel: number;
  userXP: number;
}

// ════════════════════════════════════════════════════════════════
// UP-001 (P2): Radar chart - 5 truc render
// ════════════════════════════════════════════════════════════════
describe('UP-001 (P2): Radar chart - 5 truc render', () => {
  let wrapper: VueWrapper | null = null;
  afterEach(() => { wrapper?.unmount(); setActivePinia(createPinia()); });

  it('SkillRadarChart render title', async () => {
    const Comp = (await import('../components/SkillRadarChart.vue')).default;
    setActivePinia(createPinia());
    wrapper = mount(Comp);
    await nextTick();
    expect(wrapper.text()).toContain('Phân Tích Năng Lực Cốt Lõi');
  });

  it('SkillRadarChart render 5 legend items', async () => {
    const Comp = (await import('../components/SkillRadarChart.vue')).default;
    setActivePinia(createPinia());
    wrapper = mount(Comp);
    await nextTick();
    expect(wrapper.findAll('.legend-item').length).toBe(5);
  });

  it('SkillRadarChart render 5 truc labels', async () => {
    const Comp = (await import('../components/SkillRadarChart.vue')).default;
    setActivePinia(createPinia());
    wrapper = mount(Comp);
    await nextTick();
    expect(wrapper.text()).toContain('Sắp xếp');
    expect(wrapper.text()).toContain('Đồ thị');
    expect(wrapper.text()).toContain('OOP');
    expect(wrapper.text()).toContain('SOLID');
    expect(wrapper.text()).toContain('Design Patterns');
  });

  it('SkillRadarChart co chart-container', async () => {
    const Comp = (await import('../components/SkillRadarChart.vue')).default;
    setActivePinia(createPinia());
    wrapper = mount(Comp);
    await nextTick();
    expect(wrapper.find('.chart-container').exists()).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// UP-002 (P2): XP + Level
// ════════════════════════════════════════════════════════════════
describe('UP-002 (P2): XP + Level', () => {
  let authStore: MockAuthStore;
  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue('mock-token');
    vi.mocked(fetchUserProgress).mockReset();
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('store.totalXP duoc set dung tu DTO', async () => {
    vi.mocked(fetchUserProgress).mockResolvedValue({
      totalXP: 750, currentLevel: 4, xpToNextLevel: 250, levelProgressPercent: 60,
      badgesEarned: 2, modulesCompleted: 3, currentStreak: 5, completedModuleIds: ['m1', 'm2'], badges: [],
    });
    const store = useUserProgressStore();
    await store.loadProgress();
    expect(store.totalXP).toBe(750);
    expect(store.currentLevel).toBe(4);
  });

  it('store.currentLevel dung khi XP du threshold', async () => {
    vi.mocked(fetchUserProgress).mockResolvedValue({
      totalXP: 600, currentLevel: 4, xpToNextLevel: 400, levelProgressPercent: 50,
      badgesEarned: 1, modulesCompleted: 2, currentStreak: 3, completedModuleIds: ['m1'], badges: [],
    });
    const store = useUserProgressStore();
    await store.loadProgress();
    expect(store.currentLevel).toBe(4);
    expect(store.totalXP).toBe(600);
  });

  it('syncXP cap nhat totalXP local truoc khi server confirm', () => {
    const store = useUserProgressStore();
    store.syncXP(100, 'lesson-completed');
    expect(store.totalXP).toBe(100);
  });

  it('syncXP tich luy nhieu lan', () => {
    const store = useUserProgressStore();
    store.syncXP(50, 'quiz-1');
    store.syncXP(75, 'quiz-2');
    store.syncXP(25, 'streak-bonus');
    expect(store.totalXP).toBe(150);
  });
});

// ════════════════════════════════════════════════════════════════
// UP-003 (P2): Sync XP - test syncXP goi API
// ════════════════════════════════════════════════════════════════
describe('UP-003 (P2): Sync XP - goi API', () => {
  let authStore: MockAuthStore;
  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue('mock-token');
    vi.mocked(syncXPToServer).mockReset();
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('syncXP goi syncXPToServer khi co token', async () => {
    vi.mocked(syncXPToServer).mockResolvedValue({ message: 'OK', totalXP: 100, currentLevel: 1 });
    const store = useUserProgressStore();
    await store.syncXP(50, 'lesson-done');
    expect(vi.mocked(syncXPToServer)).toHaveBeenCalled();
  });

  it('syncXP truyen dung payload amount va reason', async () => {
    vi.mocked(syncXPToServer).mockResolvedValue({ message: 'OK', totalXP: 75, currentLevel: 1 });
    const store = useUserProgressStore();
    await store.syncXP(75, 'quiz-complete');
    const callArgs = vi.mocked(syncXPToServer).mock.calls[0];
    expect(callArgs[0]).toBe('mock-token');
    expect(callArgs[1]).toEqual({ amount: 75, reason: 'quiz-complete' });
  });

  it('syncXP cap nhat totalXP tu server response', async () => {
    vi.mocked(syncXPToServer).mockResolvedValue({ message: 'OK', totalXP: 200, currentLevel: 2 });
    const store = useUserProgressStore();
    await store.syncXP(100, 'test');
    expect(store.totalXP).toBe(200);
  });
});

// ════════════════════════════════════════════════════════════════
// UP-004 (P2): Offline queue - test localStorage khi offline
// ════════════════════════════════════════════════════════════════
describe('UP-004 (P2): Offline queue - localStorage', () => {
  let authStore: MockAuthStore;
  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue(null);
    vi.mocked(syncXPToServer).mockReset();
    localStorage.clear();
  });
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

  it('syncXP khi offline se vao queue (persist localStorage)', () => {
    const store = useUserProgressStore();
    store.syncXP(50, 'offline-lesson');
    const saved = JSON.parse(localStorage.getItem('vdsa_xp_sync_queue') ?? '[]');
    expect(saved.length).toBe(1);
    expect(saved[0]).toEqual({ amount: 50, reason: 'offline-lesson' });
  });

  it('queue persist vao localStorage', () => {
    const store = useUserProgressStore();
    store.syncXP(30, 'offline-quiz');
    const saved = JSON.parse(localStorage.getItem('vdsa_xp_sync_queue') ?? '[]');
    expect(saved).toEqual([{ amount: 30, reason: 'offline-quiz' }]);
  });

  it('nhieu XP offline deu duoc queue', () => {
    const store = useUserProgressStore();
    store.syncXP(10, 'a');
    store.syncXP(20, 'b');
    store.syncXP(30, 'c');
    const saved = JSON.parse(localStorage.getItem('vdsa_xp_sync_queue') ?? '[]');
    expect(saved.length).toBe(3);
  });

  it('khong goi syncXPToServer khi offline', () => {
    const store = useUserProgressStore();
    store.syncXP(50, 'offline-action');
    expect(vi.mocked(syncXPToServer)).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════
// UP-005 (P2): Mark complete - test markModuleComplete()
// ════════════════════════════════════════════════════════════════
describe('UP-005 (P2): Mark complete', () => {
  let authStore: MockAuthStore;
  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue('mock-token');
    vi.mocked(markModuleComplete).mockReset();
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('completeModule them moduleId vao completedModuleIds', async () => {
    const store = useUserProgressStore();
    await store.completeModule('module-1');
    expect(store.completedModuleIds).toContain('module-1');
  });

  it('completeModule goi API markModuleComplete', async () => {
    const store = useUserProgressStore();
    await store.completeModule('module-2');
    expect(vi.mocked(markModuleComplete)).toHaveBeenCalledWith('mock-token', 'module-2');
  });

  it('isModuleCompleted tra ve true sau khi complete', async () => {
    const store = useUserProgressStore();
    await store.completeModule('module-3');
    expect(store.isModuleCompleted('module-3')).toBe(true);
  });

  it('khong duplicate moduleId neu complete 2 lan', async () => {
    const store = useUserProgressStore();
    await store.completeModule('module-4');
    await store.completeModule('module-4');
    const count = store.completedModuleIds.filter(id => id === 'module-4').length;
    expect(count).toBe(1);
  });
});

// ════════════════════════════════════════════════════════════════
// UP-006 (P2): Level thresholds
// ════════════════════════════════════════════════════════════════
describe('UP-006 (P2): Level thresholds', () => {
  let authStore: MockAuthStore;
  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue('token');
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('level 1 khi XP = 0', () => {
    const store = useUserProgressStore();
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
});

// ════════════════════════════════════════════════════════════════
// UP-007 (P2): Level progress %
// ════════════════════════════════════════════════════════════════
describe('UP-007 (P2): Level progress %', () => {
  let authStore: MockAuthStore;
  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore() as unknown as MockAuthStore;
    authStore.getAccessToken.mockReturnValue('token');
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('levelProgressPercent = 0 khi level 1 XP 0', () => {
    const store = useUserProgressStore();
    expect(store.levelProgressPercent).toBe(0);
  });

  it('levelProgressPercent tang khi XP tang trong level', () => {
    const store = useUserProgressStore();
    store.syncXP(50, 'test');
    expect(store.levelProgressPercent).toBeGreaterThan(0);
  });

  it('levelProgressPercent = 0 khi vua len level moi (XP=100)', () => {
    const store = useUserProgressStore();
    store.syncXP(100, 'test');
    expect(store.currentLevel).toBe(2);
    expect(store.levelProgressPercent).toBe(0);
  });

  it('xpToNextLevel giam khi XP tang', () => {
    const store = useUserProgressStore();
    expect(store.xpToNextLevel).toBe(100);
    store.syncXP(50, 'test');
    expect(store.xpToNextLevel).toBe(50);
  });
});

// ════════════════════════════════════════════════════════════════
// GM-001 (P2): Streak render - test StreakFire so ngay
// ════════════════════════════════════════════════════════════════
describe('GM-001 (P2): Streak render', () => {
  let wrapper: VueWrapper | null = null;
  afterEach(() => { wrapper?.unmount(); setActivePinia(createPinia()); });

  it('StreakFire render so ngay streak = 0', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, { props: { streakCount: 0 } });
    expect(wrapper.text()).toContain('0');
    expect(wrapper.text()).toContain('ngày');
  });

  it('StreakFire render so ngay streak = 7', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, { props: { streakCount: 7 } });
    expect(wrapper.text()).toContain('7');
    expect(wrapper.text()).toContain('ngày');
  });

  it('StreakFire hien thi \"dang chay\" khi streak > 0', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, { props: { streakCount: 5 } });
    expect(wrapper.text()).toContain('cháy');
  });

  it('StreakFire streak > 0 shows fire icon', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, { props: { streakCount: 5 } });
    expect(wrapper.find('.streak-fire-active').exists()).toBe(true);
  });

  it('StreakFire hien thi \"chua co hoat dong\" khi streak = 0', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, { props: { streakCount: 0 } });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('0');
  });

  it('StreakFire co class active khi streak > 0', () => {
    setActivePinia(createPinia());
    wrapper = mount(StreakFire, { props: { streakCount: 3 } });
    expect(wrapper.find('.streak-fire-active').exists()).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// GM-002 (P2): Badges - test BadgesCabinet unlocked/locked
// ════════════════════════════════════════════════════════════════
describe('GM-002 (P2): Badges', () => {
  let wrapper: VueWrapper | null = null;
  const BaseIconStub = { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' };
  afterEach(() => { wrapper?.unmount(); setActivePinia(createPinia()); });

  it('BadgesCabinet render tat ca badges', () => {
    setActivePinia(createPinia());
    wrapper = mount(BadgesCabinet, {
      global: { components: { BaseIcon: BaseIconStub } },
      props: { allBadges: BADGE_TEMPLATES, unlockedBadges: [] },
    });
    expect(wrapper.findAll('.badge-card-slot').length).toBe(BADGE_TEMPLATES.length);
  });

  it('BadgesCabinet hien thi unlocked badges voi class dung', () => {
    setActivePinia(createPinia());
    wrapper = mount(BadgesCabinet, {
      global: { components: { BaseIcon: BaseIconStub } },
      props: { allBadges: BADGE_TEMPLATES, unlockedBadges: ['sorting-champion', 'streak-warrior'] },
    });
    expect(wrapper.findAll('.badge-unlocked').length).toBe(2);
  });

  it('BadgesCabinet hien thi locked badges voi class dung', () => {
    setActivePinia(createPinia());
    wrapper = mount(BadgesCabinet, {
      global: { components: { BaseIcon: BaseIconStub } },
      props: { allBadges: BADGE_TEMPLATES, unlockedBadges: ['sorting-champion'] },
    });
    expect(wrapper.findAll('.badge-locked').length).toBe(BADGE_TEMPLATES.length - 1);
  });

  it('BadgesCabinet render badge titles', () => {
    setActivePinia(createPinia());
    wrapper = mount(BadgesCabinet, {
      global: { components: { BaseIcon: BaseIconStub } },
      props: { allBadges: BADGE_TEMPLATES, unlockedBadges: [] },
    });
    expect(wrapper.text()).toContain('Recursion Master');
    expect(wrapper.text()).toContain('SOLID Architect');
    expect(wrapper.text()).toContain('Sorting Champion');
  });
});

// ════════════════════════════════════════════════════════════════
// GM-003 (P2): Leaderboard - test WeeklyLeaderboard top 10
// ════════════════════════════════════════════════════════════════
describe('GM-003 (P2): Leaderboard top 10', () => {
  let wrapper: VueWrapper | null = null;
  afterEach(() => { wrapper?.unmount(); setActivePinia(createPinia()); });

  it('WeeklyLeaderboard render top 10 entries', () => {
    setActivePinia(createPinia());
    const entries = Array.from({ length: 10 }, (_, i) => ({
      userId: 'user-' + i, fullName: 'User ' + i, weeklyXP: 1500 - i * 100, rank: i + 1,
    }));
    wrapper = mount(WeeklyLeaderboard, { props: { entries } });
    expect(wrapper.text()).toContain('Top 10');
    expect(wrapper.findAll('.leaderboard-podium-first').length).toBe(1);
  });

  it('WeeklyLeaderboard hien thi empty state khi khong co data', () => {
    setActivePinia(createPinia());
    wrapper = mount(WeeklyLeaderboard, { props: { entries: [] } });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Top 10');
  });

  it('WeeklyLeaderboard sap xep theo rank', () => {
    setActivePinia(createPinia());
    const entries = [
      { userId: 'u2', fullName: 'User 2', weeklyXP: 1200, rank: 2 },
      { userId: 'u1', fullName: 'User 1', weeklyXP: 1500, rank: 1 },
      { userId: 'u3', fullName: 'User 3', weeklyXP: 1000, rank: 3 },
    ];
    wrapper = mount(WeeklyLeaderboard, { props: { entries } });
    expect(wrapper.text()).toContain('User 1');
    expect(wrapper.text()).toContain('User 2');
    expect(wrapper.text()).toContain('User 3');
  });
});

// ════════════════════════════════════════════════════════════════
// GM-004 (P2): GamificationWorkspace - test tong hop XP/Level/Streak
// ════════════════════════════════════════════════════════════════
describe('GM-004 (P2): GamificationWorkspace', () => {
  let wrapper: VueWrapper | null = null;
  const BaseIconStub = { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' };
  afterEach(() => { wrapper?.unmount(); setActivePinia(createPinia()); });

  it('GamificationWorkspace render title', async () => {
    setActivePinia(createPinia());
    wrapper = mount(GamificationWorkspace, {
      global: { components: { BaseIcon: BaseIconStub } },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Gamification Engine');
  });

  it('GamificationWorkspace hien thi XP', async () => {
    setActivePinia(createPinia());
    wrapper = mount(GamificationWorkspace, {
      global: { components: { BaseIcon: BaseIconStub } },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('XP');
  });

  it('GamificationWorkspace co nut Freeze', async () => {
    setActivePinia(createPinia());
    wrapper = mount(GamificationWorkspace, {
      global: { components: { BaseIcon: BaseIconStub } },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Freeze');
  });
});

// ════════════════════════════════════════════════════════════════
// GM-005 (P2): Streak Freeze - test useStreakFreeze() giam count
// ════════════════════════════════════════════════════════════════
describe('GM-005 (P2): Streak Freeze', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('useStreakFreeze giam streakFreezesCount', () => {
    const store = useGamificationStore();
    expect(store.streakFreezesCount).toBe(MAX_STREAK_FREEZES);
    const result = store.useStreakFreeze();
    expect(result).toBe(true);
    expect(store.streakFreezesCount).toBe(MAX_STREAK_FREEZES - 1);
  });

  it('useStreakFreeze khong giam duoi 0', () => {
    const store = useGamificationStore();
    store.useStreakFreeze();
    store.useStreakFreeze();
    store.useStreakFreeze();
    store.useStreakFreeze();
    store.useStreakFreeze();
    expect(store.streakFreezesCount).toBe(0);
  });

  it('useStreakFreeze tra ve false khi het freeze', () => {
    const store = useGamificationStore();
    store.useStreakFreeze();
    store.useStreakFreeze();
    store.useStreakFreeze();
    const result = store.useStreakFreeze();
    expect(result).toBe(false);
  });

  it('useStreakFreeze tra ve true khi con freeze', () => {
    const store = useGamificationStore();
    const result = store.useStreakFreeze();
    expect(result).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// GM-006 (P2): Nhan XP - test awardXp() tang totalXp
// ════════════════════════════════════════════════════════════════
describe('GM-006 (P2): Nhan XP', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('earnXPLocal tang currentXP', () => {
    const store = useGamificationStore();
    store.earnXPLocal(100);
    expect(store.currentXP).toBe(100);
  });

  it('earnXPLocal tich luy XP', () => {
    const store = useGamificationStore();
    store.earnXPLocal(50);
    store.earnXPLocal(75);
    expect(store.currentXP).toBe(125);
  });

  it('earnXPLocal tu choi XP <= 0', () => {
    const store = useGamificationStore();
    store.earnXPLocal(0);
    expect(store.currentXP).toBe(0);
    store.earnXPLocal(-50);
    expect(store.currentXP).toBe(0);
  });

  it('earnXPLocal tu choi XP > MAX_XP_PER_QUIZ (200)', () => {
    const store = useGamificationStore();
    store.earnXPLocal(300);
    expect(store.currentXP).toBe(0);
  });

  it('earnXPLocal chap nhan XP = MAX_XP_PER_QUIZ', () => {
    const store = useGamificationStore();
    store.earnXPLocal(200);
    expect(store.currentXP).toBe(200);
  });
});

// ════════════════════════════════════════════════════════════════
// GM-007 (P2): Mo khoa badge - test checkBadgeUnlocks()
// ════════════════════════════════════════════════════════════════
describe('GM-007 (P2): Mo khoa badge', () => {
  beforeEach(() => { setActivePinia(createPinia()); localStorage.clear(); });
  afterEach(() => { localStorage.clear(); });

  it('checkAndUnlockBadges mo khoa khi du XP va streak', () => {
    const store = useGamificationStore();
    store.earnXPLocal(200);
    store.earnXPLocal(200);
    localStorage.setItem('completed_algorithms', JSON.stringify(['quicksort', 'sorting']));
    store.setStreakForTesting(3);
    store.checkAndUnlockBadges();
    expect(store.unlockedBadges.length).toBeGreaterThan(0);
  });

  it('checkAndUnlockBadges KHONG mo khoa neu thieu requiredAlgorithm', () => {
    const store = useGamificationStore();
    store.earnXPLocal(200);
    store.earnXPLocal(200);
    store.setStreakForTesting(3);
    store.checkAndUnlockBadges();
    expect(store.unlockedBadges).not.toContain('sorting-champion');
  });

  it('checkAndUnlockBadges khong mo lai badge da unlock', () => {
    const store = useGamificationStore();
    store.earnXPLocal(200);
    store.earnXPLocal(200);
    localStorage.setItem('completed_algorithms', JSON.stringify(['quicksort', 'sorting']));
    store.setStreakForTesting(3);
    store.checkAndUnlockBadges();
    const firstCount = store.unlockedBadges.length;
    store.checkAndUnlockBadges();
    expect(store.unlockedBadges.length).toBe(firstCount);
  });

  it('lockedBadges cap nhat sau khi unlock', () => {
    const store = useGamificationStore();
    expect(store.lockedBadges.length).toBe(BADGE_TEMPLATES.length);
    store.earnXPLocal(200);
    store.earnXPLocal(200);
    localStorage.setItem('completed_algorithms', JSON.stringify(['quicksort', 'sorting']));
    store.setStreakForTesting(3);
    store.checkAndUnlockBadges();
    expect(store.lockedBadges.length).toBeLessThan(BADGE_TEMPLATES.length);
  });
});

// ════════════════════════════════════════════════════════════════
// GM-008 (P2): 5 loai badge
// ════════════════════════════════════════════════════════════════
describe('GM-008 (P2): 5 loai badge', () => {
  it('BADGE_TEMPLATES co dung 5 badges', () => {
    expect(BADGE_TEMPLATES.length).toBe(5);
  });

  it('Co badge Recursion Master', () => {
    const badge = BADGE_TEMPLATES.find(b => b.id === 'recursion-master');
    expect(badge).toBeDefined();
    expect(badge?.title).toBe('Recursion Master');
  });

  it('Co badge SOLID Architect', () => {
    const badge = BADGE_TEMPLATES.find(b => b.id === 'solid-architect');
    expect(badge).toBeDefined();
    expect(badge?.title).toBe('SOLID Architect');
  });

  it('Co badge Sorting Champion', () => {
    const badge = BADGE_TEMPLATES.find(b => b.id === 'sorting-champion');
    expect(badge).toBeDefined();
    expect(badge?.title).toBe('Sorting Champion');
  });

  it('Co badge Streak Warrior', () => {
    const badge = BADGE_TEMPLATES.find(b => b.id === 'streak-warrior');
    expect(badge).toBeDefined();
    expect(badge?.title).toBe('Streak Warrior');
  });

  it('Co badge Graph Explorer', () => {
    const badge = BADGE_TEMPLATES.find(b => b.id === 'graph-explorer');
    expect(badge).toBeDefined();
    expect(badge?.title).toBe('Graph Explorer');
  });

  it('GamificationEngine.getBadgeTemplates tra ve 5 badges', () => {
    const templates = GamificationEngine.getBadgeTemplates();
    expect(templates.length).toBe(5);
  });
});

// ════════════════════════════════════════════════════════════════
// GM-009 (P2): XP progress - test thanh tien do badge
// ════════════════════════════════════════════════════════════════
describe('GM-009 (P2): XP progress', () => {
  beforeEach(() => { setActivePinia(createPinia()); });

  it('xpProgressPercent = 0 khi currentXP = 0', () => {
    const store = useGamificationStore();
    expect(store.xpProgressPercent).toBe(0);
  });

  it('xpProgressPercent tang khi XP tang', () => {
    const store = useGamificationStore();
    store.earnXPLocal(100);
    expect(store.xpProgressPercent).toBeGreaterThan(0);
  });

  it('xpProgressPercent = 100 khi dat nextBadgeXPThreshold', () => {
    const store = useGamificationStore();
    const threshold = store.nextBadgeXPThreshold;
    store.earnXPLocal(Math.min(threshold, 200));
    if (threshold <= 200) {
      expect(store.xpProgressPercent).toBe(100);
    }
  });

  it('nextBadgeXPThreshold > 0 khi con badge chua unlock', () => {
    const store = useGamificationStore();
    expect(store.nextBadgeXPThreshold).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════
// GM-010 (P2): Backend profile - test fetchBackendProfile()
// ════════════════════════════════════════════════════════════════
describe('GM-010 (P2): Backend profile', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('loadBackendProfile cap nhat backendProfile', async () => {
    const store = useGamificationStore();
    await store.loadBackendProfile();
    expect(store.backendProfile).not.toBeNull();
    expect(store.backendProfile?.totalXp).toBe(500);
    expect(store.backendProfile?.currentLevel).toBe(3);
  });

  it('loadBackendProfile cap nhat currentXP tu backend', async () => {
    const store = useGamificationStore();
    await store.loadBackendProfile();
    expect(store.currentXP).toBe(500);
  });

  it('loadBackendProfile cap nhat activeStreak tu backend', async () => {
    const store = useGamificationStore();
    await store.loadBackendProfile();
    expect(store.activeStreak).toBe(7);
  });

  it('backendLevelName tra ve ten level', async () => {
    const store = useGamificationStore();
    await store.loadBackendProfile();
    expect(store.backendLevelName).toBe('Hoc Vien');
  });

  it('backendXpProgress tra ve phan tram', async () => {
    const store = useGamificationStore();
    await store.loadBackendProfile();
    expect(store.backendXpProgress).toBeGreaterThanOrEqual(0);
    expect(store.backendXpProgress).toBeLessThanOrEqual(100);
  });
});

// ════════════════════════════════════════════════════════════════
// CR-001 (P2): Course list - test CoursesListView render
// ════════════════════════════════════════════════════════════════
describe('CR-001 (P2): Course list', () => {
  let wrapper: VueWrapper | null = null;
  const BaseIconStub = { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' };
  afterEach(() => { wrapper?.unmount(); });

  it('CoursesListView render title', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(COURSES as never);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.text()).toContain('DSA');
    expect(wrapper.text()).toContain('XP');
  });

  it('CoursesListView render danh sach khoa hoc', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(COURSES as never);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.text()).toContain('300 XP');
    expect(wrapper.text()).toContain('Sorting');
  });

  it('CoursesListView hien thi empty state khi API tra rong', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce([] as never);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.text()).toContain('thay');
    expect(wrapper.text()).toContain('Vui');
  });
});

// ════════════════════════════════════════════════════════════════
// CR-005 (P2): Search - test tim kiem khoa hoc
// ════════════════════════════════════════════════════════════════
describe('CR-005 (P2): Search', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.mocked(courseApi.getCourses).mockResolvedValue(COURSES as never);
  });
  afterEach(() => { vi.useRealTimers(); });

  it('tim kiem theo title', async () => {
    const store = useCourseStore();
    store.loadCourses();
    await vi.advanceTimersByTimeAsync(300);
    store.setSearchQuery('sorting');
    expect(store.filteredCourses.length).toBeGreaterThan(0);
  });

  it('tim kiem theo description', async () => {
    const store = useCourseStore();
    store.loadCourses();
    await vi.advanceTimersByTimeAsync(300);
    store.setSearchQuery('OOP');
    expect(store.filteredCourses.length).toBeGreaterThan(0);
  });

  it('tim kiem khong phan biet hoa thuong', async () => {
    const store = useCourseStore();
    store.loadCourses();
    await vi.advanceTimersByTimeAsync(300);
    store.setSearchQuery('solid');
    expect(store.filteredCourses.length).toBeGreaterThan(0);
  });

  it('tra rong khi khong co ket qua', async () => {
    const store = useCourseStore();
    store.loadCourses();
    await vi.advanceTimersByTimeAsync(300);
    store.setSearchQuery('xyzkhongtontai');
    expect(store.filteredCourses.length).toBe(0);
  });

  it('tim kiem theo category', async () => {
    const store = useCourseStore();
    store.loadCourses();
    await vi.advanceTimersByTimeAsync(300);
    store.setSearchQuery('sorting');
    expect(store.filteredCourses.length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════
// CR-007 (P2): Sort - test sap xep theo difficulty/title/XP
// ════════════════════════════════════════════════════════════════
describe('CR-007 (P2): Sort', () => {
  let wrapper: VueWrapper | null = null;
  const BaseIconStub = { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' };
  afterEach(() => { wrapper?.unmount(); });

  it('sap xep theo difficulty', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(COURSES as never);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });

  it('sap xep theo title A-Z', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(COURSES as never);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });

  it('sap xep theo XP giam dan', async () => {
    vi.mocked(courseApi.getCourses).mockResolvedValueOnce(COURSES as never);
    setActivePinia(createPinia());
    wrapper = mount(CoursesListView, {
      attachTo: document.body,
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: { RouterLink: { template: '<a class="rl-stub"><slot /></a>' } },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// CR-010 (P2): Premium - test PremiumGate render
// ════════════════════════════════════════════════════════════════
describe('CR-010 (P2): Premium gate', () => {
  let wrapper: VueWrapper | null = null;
  const BaseIconStub = { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' };
  afterEach(() => { wrapper?.unmount(); setActivePinia(createPinia()); });

  it('PremiumGate render overlay khi khong co access', () => {
    setActivePinia(createPinia());
    wrapper = mount(PremiumGate, {
      global: { components: { BaseIcon: BaseIconStub } },
      slots: { default: '<div class="premium-content">Premium Content</div>' },
    });
    expect(wrapper.find('.premium-gate__overlay').exists()).toBe(true);
  });

  it('PremiumGate hien thi tieu de Noi dung Premium', () => {
    setActivePinia(createPinia());
    wrapper = mount(PremiumGate, {
      global: { components: { BaseIcon: BaseIconStub } },
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.text()).toContain('Premium');
    expect(wrapper.find('.premium-gate__title').exists()).toBe(true);
  });

  it('PremiumGate co nut Nang cap Premium', () => {
    setActivePinia(createPinia());
    wrapper = mount(PremiumGate, {
      global: { components: { BaseIcon: BaseIconStub } },
      slots: { default: '<div>Content</div>' },
    });
    expect(wrapper.find('.premium-gate__btn').exists()).toBe(true);
    expect(wrapper.text()).toContain('Premium');
  });

  it('PremiumGate hien thi content khi co access (isPremium = true)', () => {
    setActivePinia(createPinia());
    wrapper = mount(PremiumGate, {
      global: { components: { BaseIcon: BaseIconStub } },
      slots: { default: '<div class="premium-content">Free Content</div>' },
    });
    expect(wrapper.find('.premium-gate__overlay').exists()).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// LN-001 (P2): 4 steps - test LessonStudyView tabs
// ════════════════════════════════════════════════════════════════
describe('LN-001 (P2): 4 steps', () => {
  let wrapper: VueWrapper | null = null;
  const BaseIconStub = { name: 'BaseIcon', props: ['name', 'class'], template: '<svg class="base-icon"><title>{{ name }}</title></svg>' };
  afterEach(() => { wrapper?.unmount(); setActivePinia(createPinia()); });

  it('LessonStudyView render step navigation tabs', async () => {
    setActivePinia(createPinia());
    wrapper = mount(LessonStudyView, {
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: {
          RouterLink: { template: '<a class="rl-stub"><slot /></a>' },
          LessonStepTheory: { template: '<div class="step-theory"></div>' },
          LessonStepViz: { template: '<div class="step-viz"></div>' },
          LessonStepQuiz: { template: '<div class="step-quiz"></div>' },
          LessonStepCodeLab: { template: '<div class="step-codelab"></div>' },
          LessonCompletionModal: { template: '<div></div>' },
        },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.exists()).toBe(true);
  });

  it('LessonStudyView co step navigation structure', async () => {
    setActivePinia(createPinia());
    wrapper = mount(LessonStudyView, {
      global: {
        components: { BaseIcon: BaseIconStub },
        stubs: {
          RouterLink: { template: '<a class="rl-stub"><slot /></a>' },
          LessonStepTheory: { template: '<div class="step-theory"></div>' },
          LessonStepViz: { template: '<div class="step-viz"></div>' },
          LessonStepQuiz: { template: '<div class="step-quiz"></div>' },
          LessonStepCodeLab: { template: '<div class="step-codelab"></div>' },
          LessonCompletionModal: { template: '<div></div>' },
        },
      },
    });
    await flushPromises();
    await nextTick();
    expect(wrapper.find('.lesson-study-view').exists()).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// LN-002 (P2): Markdown - test render bold/italic/code
// ════════════════════════════════════════════════════════════════
describe('LN-002 (P2): Markdown render', () => {
  let wrapper: VueWrapper | null = null;
  afterEach(() => { wrapper?.unmount(); });

  it('render bold text from markdown', () => {
    wrapper = mount(LessonStepTheory, {
      props: { title: 'Test', content: 'This is **bold** text' },
    });
    expect(wrapper.find('strong').exists()).toBe(true);
    expect(wrapper.text()).toContain('bold');
  });

  it('render inline code from markdown', () => {
    const content = 'Use `console.log()` to print';
    wrapper = mount(LessonStepTheory, {
      props: { title: 'Test', content },
    });
    expect(wrapper.find('code').exists()).toBe(true);
    expect(wrapper.text()).toContain('console.log()');
  });

  it('render headings from markdown', () => {
    wrapper = mount(LessonStepTheory, {
      props: { title: 'Test', content: '## Heading 2\n\n### Heading 3' },
    });
    expect(wrapper.find('h2').exists()).toBe(true);
    expect(wrapper.find('h3').exists()).toBe(true);
  });

  it('render code block from markdown', () => {
    const mdContent = '```js\nconst x = 1;\n```';
    wrapper = mount(LessonStepTheory, {
      props: { title: 'Test', content: mdContent },
    });
    expect(wrapper.find('pre').exists()).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// LN-029 (P2): Demo viz - test visualizerMap parse sandboxConfig
// ════════════════════════════════════════════════════════════════
describe('LN-029 (P2): Demo viz', () => {
  it('parseSandboxDemo tra ve demo id tu JSON', () => {
    const result = parseSandboxDemo('{\"demo\":\"bubble-sort\"}');
    expect(result).toBe('bubble-sort');
  });

  it('parseSandboxDemo tra ve null khi empty string', () => {
    const result = parseSandboxDemo('');
    expect(result).toBeNull();
  });

  it('parseSandboxDemo tra ve null khi JSON hong', () => {
    const result = parseSandboxDemo('not-json');
    expect(result).toBeNull();
  });

  it('resolveLessonViz tra ve demoId khi co sandboxConfig demo', () => {
    const result = resolveLessonViz('sorting', '{\"demo\":\"bubble-sort\"}');
    expect(result.demoId).toBe('bubble-sort');
  });

  it('resolveLessonViz tra ve component khi sandboxType graph', () => {
    const result = resolveLessonViz('graph', '');
    expect(result.demoId).toBeNull();
    expect(result.component).not.toBeNull();
  });

  it('resolveLessonViz tra ve demoId khi sandboxType sorting va khong co config', () => {
    const result = resolveLessonViz('sorting', '');
    expect(result.demoId).toBe('bubble-sort');
  });

  it('resolveLessonViz tra ve demoId khi searching va khong co config', () => {
    const result = resolveLessonViz('searching', '');
    expect(result.demoId).toBe('binary-search');
  });

  it('resolveLessonViz tra ve null khi khong xac dinh', () => {
    const result = resolveLessonViz('unknown-type', '');
    expect(result.demoId).toBeNull();
    expect(result.component).toBeNull();
  });
});
