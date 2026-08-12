export interface UserProgressState {
  userId: string;
  totalXP: number;
  activeStreak: number;
  lastActiveDate: string; 
  unlockedBadges: string[];
  streakFreezesCount: number;
  /** Id các thuật toán người dùng đã hoàn thành — badge có requiredAlgorithmId cần khớp. */
  completedAlgorithms: string[];
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

/** Một dòng bảng xếp hạng — totalXP là tổng XP tích lũy (backend chỉ có TotalXP, không có weekly). */
export interface LeaderboardEntry {
  userId: string;
  fullName: string;
  totalXP: number;
  rank: number;
}

export interface StreakResult {
  nextStreak: number;
  shouldUpdate: boolean;
  /** Đánh dấu lượt dùng Streak Freeze để store giảm số lượng còn lại. */
  freezeUsed?: boolean;
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
/** Số freeze mặc định — bị ghi đè bởi profile server nếu có trường streakFreezes. */
export const MAX_STREAK_FREEZES = 3;
export const CONFETTI_PARTICLE_COUNT = 150;
export const CONFETTI_COLORS = ['#FF007F', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'];
export const CONFETTI_DURATION_MS = 4000;
export const LEADERBOARD_TOP_N = 10;

// GM-009: BADGE_TEMPLATES đồng bộ 1 hệ id với GamificationStrategy.cs:28-35 của backend
// (first-steps/sorting-wizard/oop-guru/solid-master/pattern-hunter/streak-keeper/
//  system-architect/dsa-champion) — nếu lệch id, tủ huy hiệu luôn hiển thị "khóa".
export const BADGE_TEMPLATES: BadgeDefinition[] = [
  { id: 'first-steps', title: 'First Steps', description: 'Hoàn thành bài trắc nghiệm đầu tiên', icon: 'target', xpThresholdRequired: 50, streakThresholdRequired: 0 },
  { id: 'sorting-wizard', title: 'Sorting Wizard', description: 'Hoàn thành 4 thuật toán sắp xếp', icon: 'zap', xpThresholdRequired: 300, streakThresholdRequired: 0, requiredAlgorithmId: 'sorting' },
  { id: 'oop-guru', title: 'OOP Guru', description: 'Hiểu rõ Encapsulation & Inheritance', icon: 'lock', xpThresholdRequired: 500, streakThresholdRequired: 0 },
  { id: 'solid-master', title: 'SOLID Master', description: 'Áp dụng đúng 5 nguyên lý SOLID', icon: 'landmark', xpThresholdRequired: 1000, streakThresholdRequired: 0 },
  { id: 'pattern-hunter', title: 'Pattern Hunter', description: 'Sử dụng 3 Design Patterns', icon: 'palette', xpThresholdRequired: 1500, streakThresholdRequired: 0 },
  { id: 'streak-keeper', title: 'Streak Keeper', description: 'Học liên tục 7 ngày', icon: 'flame', xpThresholdRequired: 200, streakThresholdRequired: 7 },
  { id: 'system-architect', title: 'System Architect', description: 'Thiết kế hệ thống phân tán', icon: 'construction', xpThresholdRequired: 2200, streakThresholdRequired: 0 },
  { id: 'dsa-champion', title: 'DSA Champion', description: 'Hoàn thành toàn bộ khóa học', icon: 'crown', xpThresholdRequired: 3000, streakThresholdRequired: 0 },
];
