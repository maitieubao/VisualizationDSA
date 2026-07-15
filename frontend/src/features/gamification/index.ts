// ============================================================
// gamification module — Public API
// Sprint 12: Gamification Rewards & Embed Widget Generator
// ============================================================

export { default as GamificationPanel } from './components/GamificationPanel.vue';

export { XPEngine } from './XPEngine';

export type {
  UserProgress,
  Badge,
  LevelConfig,
  XPEvent,
  EmbedConfig,
} from './xpConfig';
