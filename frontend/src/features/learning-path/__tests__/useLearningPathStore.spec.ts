import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLearningPathStore } from '../store/useLearningPathStore';
import { learningPathApi } from '../../../services/learningPathApi';
import type {
  LearningPathMapDto,
  LearningPathNodeDto,
  LearningPathSummaryDto,
} from '../../../services/learningPathApi';

vi.mock('../../../services/learningPathApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/learningPathApi')>();
  return {
    ...actual,
    learningPathApi: {
      getLearningPaths: vi.fn(),
      getLearningPath: vi.fn(),
      enterNode: vi.fn(),
      passNode: vi.fn(),
    },
  };
});

function node(
  id: string,
  orderIndex: number,
  status: 0 | 1 | 2,
  extra: Partial<LearningPathNodeDto> = {},
): LearningPathNodeDto {
  return {
    id,
    learningPathId: 'path-1',
    orderIndex,
    title: `Node ${orderIndex}`,
    lessonId: `lesson-${orderIndex}`,
    status,
    stars: status === 2 ? 2 : 0,
    nodeScore: status === 2 ? 90 : null,
    unlockedAt: status !== 0 ? '2026-08-17T00:00:00Z' : null,
    passedAt: status === 2 ? '2026-08-17T00:10:00Z' : null,
    session: null,
    ...extra,
  };
}

function mapDto(overrides: Partial<LearningPathMapDto> = {}): LearningPathMapDto {
  return {
    id: 'path-1',
    title: 'Lộ trình DSA cơ bản',
    description: 'Học tuần tự các chủ đề DSA.',
    createdAt: '2026-08-17T00:00:00Z',
    hearts: 10,
    heartsMax: 10,
    nextHeartAt: null,
    nodes: [node('node-1', 1, 1), node('node-2', 2, 0)],
    ...overrides,
  };
}

describe('useLearningPathStore — Learning Path + Tim (F9)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('tải danh sách lộ trình', async () => {
    const summaries: LearningPathSummaryDto[] = [
      { id: 'path-1', title: 'DSA cơ bản', description: null, createdAt: '2026-08-17T00:00:00Z', nodeCount: 3 },
    ];
    vi.mocked(learningPathApi.getLearningPaths).mockResolvedValueOnce(summaries);
    const store = useLearningPathStore();

    await store.loadPaths();

    expect(store.paths).toEqual(summaries);
    expect(store.isLoadingPaths).toBe(false);
    expect(store.error).toBeNull();
  });

  it('tải bản đồ node và trạng thái tim', async () => {
    vi.mocked(learningPathApi.getLearningPath).mockResolvedValueOnce(mapDto({ hearts: 7, heartsMax: 10 }));
    const store = useLearningPathStore();

    await store.loadMap('path-1');

    expect(store.currentPath?.nodes).toHaveLength(2);
    expect(store.hearts).toBe(7);
    expect(store.nodes[0].status).toBe(1);
    expect(store.nodes[1].status).toBe(0);
  });

  it('enter node trừ tim và cập nhật hearts trong store', async () => {
    vi.mocked(learningPathApi.getLearningPath).mockResolvedValueOnce(mapDto());
    vi.mocked(learningPathApi.enterNode).mockResolvedValueOnce({
      message: 'Đã vào node — 1 Tim đã được sử dụng.',
      resumed: false,
      hearts: 9,
      heartsMax: 10,
      session: { startedAt: '2026-08-17T00:00:00Z', expiresAt: '2026-08-17T00:30:00Z' },
    });
    const store = useLearningPathStore();
    await store.loadMap('path-1');

    const ok = await store.enterNode('path-1', 'node-1');

    expect(ok).toBe(true);
    expect(learningPathApi.enterNode).toHaveBeenCalledWith('path-1', 'node-1');
    expect(store.hearts).toBe(9);
    expect(store.lastEnterResult?.resumed).toBe(false);
  });

  it('enter node hết tim → heartsEmpty = true', async () => {
    vi.mocked(learningPathApi.getLearningPath).mockResolvedValueOnce(mapDto({ hearts: 0 }));
    vi.mocked(learningPathApi.enterNode).mockRejectedValueOnce({
      status: 403,
      title: 'Forbidden',
      detail: 'Bạn đã hết Tim. HEARTS_EMPTY',
    });
    const store = useLearningPathStore();
    await store.loadMap('path-1');

    const ok = await store.enterNode('path-1', 'node-1');

    expect(ok).toBe(false);
    expect(store.heartsEmpty).toBe(true);
  });

  it('pass node rồi đồng bộ bản đồ (node kế mở khóa)', async () => {
    vi.mocked(learningPathApi.getLearningPath)
      .mockResolvedValueOnce(mapDto())
      .mockResolvedValueOnce(
        mapDto({ nodes: [node('node-1', 1, 2), node('node-2', 2, 1)] }),
      );
    vi.mocked(learningPathApi.passNode).mockResolvedValueOnce({
      message: 'Đã hoàn thành node!',
      nodeId: 'node-1',
      status: 2,
      stars: 3,
      nodeScore: 100,
      passedAt: '2026-08-17T00:20:00Z',
      nextNodeUnlocked: 'node-2',
      xpAwarded: 25,
      totalXp: 125,
    });
    const store = useLearningPathStore();
    await store.loadMap('path-1');

    const ok = await store.passNode('path-1', 'node-1', { stars: 3, nodeScore: 100 });

    expect(ok).toBe(true);
    expect(store.nodes[0].status).toBe(2);
    expect(store.nodes[1].status).toBe(1);
  });
});
