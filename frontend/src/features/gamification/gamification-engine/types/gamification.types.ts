export interface UserProgressState {
  userId: string;
  totalXP: number;
  activeStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  unlockedBadges: string[];
  streakFreezesCount: number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpThresholdRequired: number;
  streakThresholdRequired: number;
  requiredAlgorithmId?: string;
}

export interface LeaderboardEntry {
  userId: string;
  fullName: string;
  weeklyXP: number;
  rank: number;
}

export interface StreakResult {
  nextStreak: number;
  shouldUpdate: boolean;
}

export interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

export const GRACE_HOURS_OFFSET = 2;
export const MAX_XP_PER_QUIZ = 200;
export const MAX_STREAK_FREEZES = 3;
export const RATE_LIMIT_SECONDS = 30;
export const CONFETTI_PARTICLE_COUNT = 150;
export const CONFETTI_COLORS = ['#FF007F', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'];
export const CONFETTI_DURATION_MS = 4000;
export const LEADERBOARD_TOP_N = 10;
export const WEEKLY_RESET_DAY = 0; // Sunday

export const BADGE_TEMPLATES: BadgeDefinition[] = [
  { id: 'recursion-master', title: 'Recursion Master', description: 'Hoàn thành Quiz thuật toán Đệ Quy xuất sắc', icon: '🔄', xpThresholdRequired: 500, streakThresholdRequired: 3, requiredAlgorithmId: 'quicksort' },
  { id: 'solid-architect', title: 'SOLID Architect', description: 'Đạt coupling index dưới 20% trong DIP Sandbox', icon: '🏛️', xpThresholdRequired: 1000, streakThresholdRequired: 5 },
  { id: 'sorting-champion', title: 'Sorting Champion', description: 'Hoàn thành tất cả thuật toán sắp xếp', icon: '⚡', xpThresholdRequired: 300, streakThresholdRequired: 2, requiredAlgorithmId: 'sorting' },
  { id: 'streak-warrior', title: 'Streak Warrior', description: 'Duy trì chuỗi học tập 7 ngày liên tiếp', icon: '🔥', xpThresholdRequired: 200, streakThresholdRequired: 7 },
  { id: 'graph-explorer', title: 'Graph Explorer', description: 'Khám phá tất cả thuật toán đồ thị', icon: '🗺️', xpThresholdRequired: 800, streakThresholdRequired: 4, requiredAlgorithmId: 'graph' },
];
