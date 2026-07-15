export { default as LearningPathWorkspace } from './components/LearningPathWorkspace.vue';
export { useLearningPathStore } from './store/useLearningPathStore';
export { PrerequisiteDAGEngine } from './engine/PrerequisiteDAGEngine';
export { PersonalizedPathEvaluator } from './engine/PersonalizedPathEvaluator';
export { LaserBatchRenderer } from './engine/LaserBatchRenderer';
export { OfflineProgressSynchronizer } from './engine/OfflineProgressSynchronizer';
export type {
  PathNode,
  UserQuizScore,
  AIRecommendation,
  Point,
  NodePosition,
  LaserBridge,
  NodeStatus,
  SyncStatus,
  OfflineProgressData,
} from './types/learning-path.types';
