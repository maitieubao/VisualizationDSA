import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningPathStore } from '../store/useLearningPathStore';

describe('useLearningPathStore', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    setActivePinia(createPinia());
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have 4 default nodes', () => {
      const store = useLearningPathStore();
      expect(store.rawNodes).toHaveLength(4);
    });

    it('should have bubble-sort as completed by default', () => {
      const store = useLearningPathStore();
      expect(store.completedNodeIds.has('bubble-sort')).toBe(true);
    });

    it('should have quicksort as active node', () => {
      const store = useLearningPathStore();
      expect(store.activeNodeId).toBe('quicksort');
    });

    it('should have initial score for bubble-sort', () => {
      const store = useLearningPathStore();
      expect(store.userScoresHistory).toHaveLength(1);
      expect(store.userScoresHistory[0].algorithmId).toBe('bubble-sort');
    });
  });

  describe('resolvedNodes computed', () => {
    it('should resolve bubble-sort as COMPLETED', () => {
      const store = useLearningPathStore();
      const bubbleNode = store.resolvedNodes.find((n) => n.id === 'bubble-sort');
      expect(bubbleNode!.status).toBe('COMPLETED');
    });

    it('should resolve quicksort as UNLOCKED', () => {
      const store = useLearningPathStore();
      const qsNode = store.resolvedNodes.find((n) => n.id === 'quicksort');
      expect(qsNode!.status).toBe('UNLOCKED');
    });

    it('should resolve binary-tree as LOCKED', () => {
      const store = useLearningPathStore();
      const btNode = store.resolvedNodes.find((n) => n.id === 'binary-tree');
      expect(btNode!.status).toBe('LOCKED');
    });

    it('should resolve solid-uml as LOCKED', () => {
      const store = useLearningPathStore();
      const solidNode = store.resolvedNodes.find((n) => n.id === 'solid-uml');
      expect(solidNode!.status).toBe('LOCKED');
    });
  });

  describe('aiRecommendedNode computed', () => {
    it('should recommend quicksort as next node', () => {
      const store = useLearningPathStore();
      expect(store.aiRecommendedNode.recommendedNodeId).toBe('quicksort');
    });

    it('should recommend review when score is low', () => {
      const store = useLearningPathStore();
      store.userScoresHistory = [
        { algorithmId: 'bubble-sort', scorePercentage: 50, timeSpentSeconds: 200 },
      ];
      expect(store.aiRecommendedNode.recommendedNodeId).toBe('bubble-sort');
      expect(store.aiRecommendedNode.recommendationReason).toContain('50%');
    });
  });

  describe('completionPercentage computed', () => {
    it('should return 25% with 1 of 4 nodes completed', () => {
      const store = useLearningPathStore();
      expect(store.completionPercentage).toBe(25);
    });

    it('should return 50% with 2 of 4 nodes completed', () => {
      const store = useLearningPathStore();
      store.completedNodeIds.add('quicksort');
      expect(store.completionPercentage).toBe(50);
    });
  });

  describe('averageScore computed', () => {
    it('should return initial average score', () => {
      const store = useLearningPathStore();
      expect(store.averageScore).toBe(85);
    });
  });

  describe('completeNodeMilestone action', () => {
    it('should add node to completed set', async () => {
      const store = useLearningPathStore();
      await store.completeNodeMilestone('quicksort', 90, 120);

      expect(store.completedNodeIds.has('quicksort')).toBe(true);
    });

    it('should add score to history', async () => {
      const store = useLearningPathStore();
      await store.completeNodeMilestone('quicksort', 90, 120);

      const score = store.userScoresHistory.find((s) => s.algorithmId === 'quicksort');
      expect(score).toBeDefined();
      expect(score!.scorePercentage).toBe(90);
      expect(score!.timeSpentSeconds).toBe(120);
    });

    it('should unlock binary-tree after quicksort is completed', async () => {
      const store = useLearningPathStore();
      await store.completeNodeMilestone('quicksort', 85, 100);

      const btNode = store.resolvedNodes.find((n) => n.id === 'binary-tree');
      expect(btNode!.status).toBe('UNLOCKED');
    });

    it('should save to localStorage', async () => {
      const store = useLearningPathStore();
      await store.completeNodeMilestone('quicksort', 90, 120);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'learning_path_completed',
        expect.any(String)
      );
    });

    it('should skip server sync when not authenticated', async () => {
      const store = useLearningPathStore();
      await store.completeNodeMilestone('quicksort', 90, 120);

      expect(store.completedNodeIds.has('quicksort')).toBe(true);
      expect(store.isOnlineMode).toBe(false);
    });

    it('should handle server sync failure gracefully', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const store = useLearningPathStore();
      await expect(store.completeNodeMilestone('quicksort', 90, 120)).resolves.not.toThrow();

      expect(store.completedNodeIds.has('quicksort')).toBe(true);
    });
  });

  describe('setActiveNode action', () => {
    it('should update active node', () => {
      const store = useLearningPathStore();
      store.setActiveNode('binary-tree');
      expect(store.activeNodeId).toBe('binary-tree');
    });
  });

  describe('loadProgressFromLocalStorage action', () => {
    it('should load saved completed nodes', () => {
      mockStorage['learning_path_completed'] = JSON.stringify(['bubble-sort', 'quicksort']);
      mockStorage['learning_path_scores'] = JSON.stringify([
        { algorithmId: 'bubble-sort', scorePercentage: 85, timeSpentSeconds: 90 },
        { algorithmId: 'quicksort', scorePercentage: 92, timeSpentSeconds: 150 },
      ]);

      const store = useLearningPathStore();
      store.loadProgressFromLocalStorage();

      expect(store.completedNodeIds.has('quicksort')).toBe(true);
      expect(store.userScoresHistory).toHaveLength(2);
    });

    it('should not crash when no saved data exists', () => {
      const store = useLearningPathStore();
      expect(() => store.loadProgressFromLocalStorage()).not.toThrow();
    });
  });

  describe('resetProgress action', () => {
    it('should reset to initial state', async () => {
      const store = useLearningPathStore();
      await store.completeNodeMilestone('quicksort', 90, 120);

      store.resetProgress();

      expect(store.completedNodeIds.size).toBe(0);
      expect(store.userScoresHistory).toHaveLength(0);
      expect(store.activeNodeId).toBe('');
    });

    it('should clear localStorage', () => {
      const store = useLearningPathStore();
      store.resetProgress();

      expect(localStorage.removeItem).toHaveBeenCalledWith('learning_path_completed');
    });
  });

  describe('nodePositions computed', () => {
    it('should generate positions for all nodes', () => {
      const store = useLearningPathStore();
      expect(store.nodePositions).toHaveLength(4);
    });

    it('should have x/y coordinates for each node', () => {
      const store = useLearningPathStore();
      store.nodePositions.forEach((pos) => {
        expect(pos.nodeId).toBeTruthy();
        expect(typeof pos.x).toBe('number');
        expect(typeof pos.y).toBe('number');
      });
    });
  });

  describe('laserBridges computed', () => {
    it('should generate bridges based on prerequisites', () => {
      const store = useLearningPathStore();
      expect(store.laserBridges.length).toBeGreaterThan(0);
    });

    it('should mark bridges as active when source node is completed', () => {
      const store = useLearningPathStore();
      const bubbleToQuick = store.laserBridges.find(
        (b) => b.fromNodeId === 'bubble-sort' && b.toNodeId === 'quicksort'
      );
      expect(bubbleToQuick).toBeDefined();
      expect(bubbleToQuick!.isActive).toBe(true);
    });

    it('should mark bridges as inactive when source node is not completed', () => {
      const store = useLearningPathStore();
      const quickToTree = store.laserBridges.find(
        (b) => b.fromNodeId === 'quicksort' && b.toNodeId === 'binary-tree'
      );
      expect(quickToTree).toBeDefined();
      expect(quickToTree!.isActive).toBe(false);
    });
  });
});
