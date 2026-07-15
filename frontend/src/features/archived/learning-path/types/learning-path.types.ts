/** Status of a learning path node */
export type NodeStatus = 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';

/** A single node in the learning path skill tree DAG */
export interface PathNode {
  id: string;
  title: string;
  prerequisites: string[];
  status: NodeStatus;
}

/** Quiz score record for AI evaluation */
export interface UserQuizScore {
  algorithmId: string;
  scorePercentage: number;
  timeSpentSeconds: number;
}

/** AI recommendation result */
export interface AIRecommendation {
  recommendedNodeId: string;
  recommendationReason: string;
}

/** 2D point for laser bridge rendering */
export interface Point {
  x: number;
  y: number;
}

/** Node position on the RPG map grid */
export interface NodePosition {
  nodeId: string;
  x: number;
  y: number;
}

/** Laser bridge connection between two nodes */
export interface LaserBridge {
  fromNodeId: string;
  toNodeId: string;
  svgPath: string;
  isActive: boolean;
}

/** Offline sync status */
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

/** Progress data stored in localStorage */
export interface OfflineProgressData {
  completedNodeIds: string[];
  scoresHistory: UserQuizScore[];
  lastSyncTimestamp: number;
}
