import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PathNode, UserQuizScore, NodePosition, LaserBridge } from '../types/learning-path.types';
import { PrerequisiteDAGEngine } from '../engine/PrerequisiteDAGEngine';
import { PersonalizedPathEvaluator } from '../engine/PersonalizedPathEvaluator';
import { OfflineProgressSynchronizer } from '../engine/OfflineProgressSynchronizer';
import { LaserBatchRenderer } from '../engine/LaserBatchRenderer';
import { learningProgressApi } from '../../../services/learningProgressApi';
import { getStoredToken } from '../../../services/apiClient';

/** Grid layout constants for RPG map positioning */
const MAP_GRID_SPACING_X = 220;
const MAP_GRID_SPACING_Y = 140;
const MAP_GRID_OFFSET_X = 160;
const MAP_GRID_OFFSET_Y = 100;

export const useLearningPathStore = defineStore('learningPath', () => {
  // ==========================================
  // STATE
  // ==========================================
  const rawNodes = ref<PathNode[]>([
    { id: 'bubble-sort', title: 'Bubble Sort', prerequisites: [], status: 'UNLOCKED' },
    { id: 'quicksort', title: 'Quick Sort Recursion', prerequisites: ['bubble-sort'], status: 'LOCKED' },
    { id: 'binary-tree', title: 'Binary Search Tree', prerequisites: ['quicksort'], status: 'LOCKED' },
    { id: 'solid-uml', title: 'SOLID Design Patterns', prerequisites: ['binary-tree'], status: 'LOCKED' },
  ]);

  const completedNodeIds = ref<Set<string>>(new Set(['bubble-sort']));
  const activeNodeId = ref('quicksort');
  const userScoresHistory = ref<UserQuizScore[]>([
    { algorithmId: 'bubble-sort', scorePercentage: 85, timeSpentSeconds: 90 },
  ]);

  // ==========================================
  // GETTERS (Computed)
  // ==========================================

  const resolvedNodes = computed(() => {
    return PrerequisiteDAGEngine.resolveNodeStatuses(rawNodes.value, completedNodeIds.value);
  });

  const aiRecommendedNode = computed(() => {
    return PersonalizedPathEvaluator.evaluateNextRecommendedNode(
      resolvedNodes.value,
      userScoresHistory.value
    );
  });

  const completionPercentage = computed(() => {
    return PersonalizedPathEvaluator.calculateCompletionPercentage(resolvedNodes.value);
  });

  const averageScore = computed(() => {
    return PersonalizedPathEvaluator.getAverageScore(userScoresHistory.value);
  });

  const nodePositions = computed<NodePosition[]>(() => {
    return rawNodes.value.map((node, index) => ({
      nodeId: node.id,
      x: MAP_GRID_OFFSET_X + (index % 2) * MAP_GRID_SPACING_X,
      y: MAP_GRID_OFFSET_Y + Math.floor(index / 2) * MAP_GRID_SPACING_Y,
    }));
  });

  const laserBridges = computed<LaserBridge[]>(() => {
    const bridges: LaserBridge[] = [];
    const posMap = new Map(nodePositions.value.map((p) => [p.nodeId, p]));

    for (const node of rawNodes.value) {
      for (const prereqId of node.prerequisites) {
        const fromPos = posMap.get(prereqId);
        const toPos = posMap.get(node.id);

        if (fromPos && toPos) {
          bridges.push({
            fromNodeId: prereqId,
            toNodeId: node.id,
            svgPath: LaserBatchRenderer.calculateBezierPath(
              { x: fromPos.x, y: fromPos.y },
              { x: toPos.x, y: toPos.y }
            ),
            isActive: completedNodeIds.value.has(prereqId),
          });
        }
      }
    }

    return bridges;
  });

  // ==========================================
  // ACTIONS
  // ==========================================

  const isSyncing = ref(false);
  const syncError = ref<string | null>(null);
  const isOnlineMode = computed(() => !!getStoredToken());

  async function completeNodeMilestone(nodeId: string, finalScore: number, timeSpent: number) {
    completedNodeIds.value.add(nodeId);

    userScoresHistory.value.push({
      algorithmId: nodeId,
      scorePercentage: finalScore,
      timeSpentSeconds: timeSpent,
    });

    OfflineProgressSynchronizer.saveToLocalStorage(
      Array.from(completedNodeIds.value),
      userScoresHistory.value
    );

    if (isOnlineMode.value) {
      try {
        await learningProgressApi.completeModule(nodeId);
      } catch {
        console.warn('Server sync failed. Progress saved offline.');
      }
    }
  }

  function setActiveNode(nodeId: string) {
    activeNodeId.value = nodeId;
  }

  function loadProgressFromLocalStorage() {
    const data = OfflineProgressSynchronizer.loadFromLocalStorage();
    if (data) {
      completedNodeIds.value = new Set(data.completedNodeIds);
      userScoresHistory.value = data.scoresHistory;
    }
  }

  function resetProgress() {
    completedNodeIds.value = new Set();
    userScoresHistory.value = [];
    activeNodeId.value = '';
    OfflineProgressSynchronizer.clearLocalStorage();
  }

  async function syncProgressFromServer(): Promise<void> {
    if (!isOnlineMode.value) return;

    try {
      isSyncing.value = true;
      syncError.value = null;
      const progresses = await learningProgressApi.getMyProgress();
      for (const p of progresses) {
        completedNodeIds.value.add(p.moduleId);
      }
      OfflineProgressSynchronizer.saveToLocalStorage(
        Array.from(completedNodeIds.value),
        userScoresHistory.value
      );
    } catch {
      syncError.value = 'Không thể tải tiến trình từ server';
    } finally {
      isSyncing.value = false;
    }
  }

  return {
    rawNodes,
    completedNodeIds,
    activeNodeId,
    userScoresHistory,
    resolvedNodes,
    aiRecommendedNode,
    completionPercentage,
    averageScore,
    nodePositions,
    laserBridges,
    completeNodeMilestone,
    setActiveNode,
    loadProgressFromLocalStorage,
    resetProgress,
    // Server-sync
    isSyncing,
    syncError,
    isOnlineMode,
    syncProgressFromServer,
  };
});
