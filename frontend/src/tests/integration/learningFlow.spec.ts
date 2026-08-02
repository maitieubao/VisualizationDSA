// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserProgressStore } from '@/features/gamification/user-progress/store/useUserProgressStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import * as api from '@/features/gamification/user-progress/service/userProgressApi';


vi.mock('@/features/gamification/user-progress/service/userProgressApi', () => {
  return {
    fetchUserProgress: vi.fn(),
    syncXPToServer: vi.fn(),
    markModuleComplete: vi.fn(),
    ApiError: class ApiError extends Error {
      status: number;
      constructor(message: string, status: number) {
        super(message);
        this.status = status;
      }
    }
  };
});

describe('E2E Learning Flow Integration Test (Vitest Mock)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'getAccessToken').mockReturnValue('mock-jwt-token');
    authStore.statelessUser = { id: 'user-1', email: 'test@example.com', roles: ['Student'] } as any;
  });

  it('phải mô phỏng toàn bộ luồng: Xem bài giảng -> Làm Quiz -> Gõ Code -> Chấm điểm -> Qua bài mới', async () => {
    const progressStore = useUserProgressStore();
    
    
    vi.mocked(api.fetchUserProgress).mockResolvedValueOnce({
      totalXP: 100,
      currentLevel: 2,
      xpToNextLevel: 150,
      levelProgressPercent: 50,
      currentStreak: 1,
      completedModuleIds: ['lesson-1-id'] 
    });

    await progressStore.loadProgress();
    expect(progressStore.totalXP).toBe(100);
    expect(progressStore.isModuleCompleted('lesson-1-id')).toBe(true);
    expect(progressStore.isModuleCompleted('quiz-1-id')).toBe(false);

    
    vi.mocked(api.syncXPToServer).mockResolvedValueOnce({
      totalXP: 150,
      currentLevel: 2,
      xpToNextLevel: 100,
      levelProgressPercent: 75,
      currentStreak: 1
    });
    vi.mocked(api.markModuleComplete).mockResolvedValueOnce();

    await progressStore.syncXP(50, 'Completed Quiz 1');
    await progressStore.completeModule('quiz-1-id');

    expect(progressStore.totalXP).toBe(150);
    expect(progressStore.isModuleCompleted('quiz-1-id')).toBe(true);

    
    
    vi.mocked(api.syncXPToServer).mockResolvedValueOnce({
      totalXP: 250,
      currentLevel: 3,
      xpToNextLevel: 200,
      levelProgressPercent: 25,
      currentStreak: 1
    });
    vi.mocked(api.markModuleComplete).mockResolvedValueOnce();

    await progressStore.syncXP(100, 'Completed Codelab 1');
    await progressStore.completeModule('codelab-1-id');

    
    expect(progressStore.totalXP).toBe(250);
    expect(progressStore.currentLevel).toBe(3);
    expect(progressStore.isModuleCompleted('codelab-1-id')).toBe(true);
  });
  
  it('phải tự động rollback trạng thái local nếu Backend từ chối XP (HTTP 400)', async () => {
    const progressStore = useUserProgressStore();
    
    vi.mocked(api.fetchUserProgress).mockResolvedValue({
      totalXP: 50,
      currentLevel: 1,
      xpToNextLevel: 50,
      levelProgressPercent: 50,
      currentStreak: 1,
      completedModuleIds: []
    });

    await progressStore.loadProgress();
    expect(progressStore.totalXP).toBe(50);

    
    vi.mocked(api.syncXPToServer).mockRejectedValueOnce(
      new api.ApiError("Invalid XP submission", 400)
    );

    await progressStore.syncXP(1000, 'Hacked Quiz');
    
    
    expect(progressStore.totalXP).toBe(50); 
  });
});
