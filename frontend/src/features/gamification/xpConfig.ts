export interface UserProgress {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  badges: Badge[];
  completedModules: string[];
  streakDays: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  xpRequired: number;
  color: string;
}

export interface XPEvent {
  type: 'QUIZ_COMPLETE' | 'MODULE_FINISH' | 'STREAK_BONUS' | 'ACHIEVEMENT';
  xpAmount: number;
  description: string;
  timestamp: number;
}

export interface EmbedConfig {
  widgetType: 'array-visualizer' | 'sorting-algo' | 'graph-playground' | 'oop-sandbox';
  width: number;
  height: number;
  theme: 'dark' | 'light';
  autoPlay: boolean;
  showControls: boolean;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, name: 'Novice', xpRequired: 0, color: '#64748b' },
  { level: 2, name: 'Explorer', xpRequired: 100, color: '#22c55e' },
  { level: 3, name: 'Learner', xpRequired: 300, color: '#3b82f6' },
  { level: 4, name: 'Practitioner', xpRequired: 600, color: '#8b5cf6' },
  { level: 5, name: 'Expert', xpRequired: 1000, color: '#f59e0b' },
  { level: 6, name: 'Master', xpRequired: 1500, color: '#ef4444' },
  { level: 7, name: 'Grandmaster', xpRequired: 2200, color: '#ec4899' },
  { level: 8, name: 'Legend', xpRequired: 3000, color: '#f97316' },
];

export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Hoàn thành bài trắc nghiệm đầu tiên', icon: '🎯', color: '#22c55e' },
  { id: 'sorting-wizard', name: 'Sorting Wizard', description: 'Hoàn thành 4 thuật toán sắp xếp', icon: '⚡', color: '#3b82f6' },
  { id: 'oop-guru', name: 'OOP Guru', description: 'Hiểu rõ Encapsulation & Inheritance', icon: '🔐', color: '#8b5cf6' },
  { id: 'solid-master', name: 'SOLID Master', description: 'Áp dụng đúng 5 nguyên lý SOLID', icon: '🏛️', color: '#f59e0b' },
  { id: 'pattern-hunter', name: 'Pattern Hunter', description: 'Sử dụng 3 Design Patterns', icon: '🎨', color: '#ec4899' },
  { id: 'streak-keeper', name: 'Streak Keeper', description: 'Học liên tục 7 ngày', icon: '🔥', color: '#ef4444' },
  { id: 'system-architect', name: 'System Architect', description: 'Thiết kế hệ thống phân tán', icon: '🏗️', color: '#f97316' },
  { id: 'dsa-champion', name: 'DSA Champion', description: 'Hoàn thành toàn bộ khóa học', icon: '👑', color: '#eab308' },
];
