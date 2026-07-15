export { default as GamificationWorkspace } from './components/GamificationWorkspace.vue';
export { useGamificationStore } from './store/useGamificationStore';
export { StreakCalculator } from './engine/StreakCalculator';
export { GamificationEngine } from './engine/GamificationEngine';
export { CanvasConfettiEngine } from './engine/CanvasConfettiEngine';
export type {
  UserProgressState,
  BadgeDefinition,
  LeaderboardEntry,
  StreakResult,
  ConfettiParticle,
} from './types/gamification.types';
