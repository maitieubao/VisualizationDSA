import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLadderStore } from '../store/useLadderStore';
import { ladderApi } from '../../../services/ladderApi';
import type { LadderResponse, LadderStageDto } from '../../../services/ladderApi';

vi.mock('../../../services/ladderApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/ladderApi')>();
  return {
    ...actual,
    ladderApi: {
      getLadder: vi.fn(),
      passStage: vi.fn(),
    },
  };
});

function stage(
  stage: number,
  status: 0 | 1 | 2,
  extra: Partial<LadderStageDto> = {},
): LadderStageDto {
  return {
    stage,
    status,
    passed: status === 2,
    bestScore: status === 2 ? 100 : null,
    passedAt: status === 2 ? '2026-08-17T00:00:00Z' : null,
    quizId: stage === 1 ? 'quiz-1' : null,
    codelabId: stage === 3 ? 'codelab-1' : null,
    lab: stage === 2 ? { input: [4, 2, 3, 1], maxSwaps: 6 } : null,
    ...extra,
  };
}

function ladderResponse(stages: LadderStageDto[]): LadderResponse {
  return { lessonId: 'lesson-1', stages };
}

describe('useLadderStore — Practice Ladder 3 bậc', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('tải trạng thái 3 bậc và hiển thị bậc 1 mở, bậc 2/3 khóa', async () => {
    vi.mocked(ladderApi.getLadder).mockResolvedValueOnce(
      ladderResponse([
        stage(1, 1),
        stage(2, 0),
        stage(3, 0),
      ]),
    );
    const store = useLadderStore();

    await store.loadLadder('lesson-1');

    expect(store.stages).toHaveLength(3);
    expect(store.stage1?.status).toBe(1);
    expect(store.stage2?.status).toBe(0);
    expect(store.stage3?.status).toBe(0);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('swap 2 ô cập nhật mảng và ghi nhận thao tác', async () => {
    vi.mocked(ladderApi.getLadder).mockResolvedValueOnce(
      ladderResponse([
        stage(1, 2),
        stage(2, 1),
        stage(3, 0),
      ]),
    );
    const store = useLadderStore();
    await store.loadLadder('lesson-1');

    expect(store.labArray).toEqual([4, 2, 3, 1]);

    store.toggleCell(0);
    store.toggleCell(3);

    expect(store.labArray).toEqual([1, 2, 3, 4]);
    expect(store.labOperations).toEqual([{ fromIndex: 0, toIndex: 3 }]);
    expect(store.labSwapsLeft).toBe(5);
  });

  it('nộp lab gọi API với chuỗi thao tác và mảng cuối, sau đó đồng bộ trạng thái', async () => {
    vi.mocked(ladderApi.getLadder)
      .mockResolvedValueOnce(
        ladderResponse([
          stage(1, 2),
          stage(2, 1),
          stage(3, 0),
        ]),
      )
      .mockResolvedValueOnce(
        ladderResponse([
          stage(1, 2),
          stage(2, 2),
          stage(3, 1),
        ]),
      );
    vi.mocked(ladderApi.passStage).mockResolvedValueOnce({ passed: true, stage: 2, bestScore: 100 });

    const store = useLadderStore();
    await store.loadLadder('lesson-1');

    store.toggleCell(0);
    store.toggleCell(3);
    const ok = await store.submitLab();

    expect(ok).toBe(true);
    expect(ladderApi.passStage).toHaveBeenCalledWith('lesson-1', 2, {
      operations: [{ fromIndex: 0, toIndex: 3 }],
      finalArray: [1, 2, 3, 4],
    });
    expect(store.stage2?.status).toBe(2);
    expect(store.stage3?.status).toBe(1);
  });

  it('nộp lab thất bại khi chưa có thao tác swap', async () => {
    vi.mocked(ladderApi.getLadder).mockResolvedValueOnce(
      ladderResponse([
        stage(1, 2),
        stage(2, 1),
        stage(3, 0),
      ]),
    );
    const store = useLadderStore();
    await store.loadLadder('lesson-1');

    const ok = await store.submitLab();

    expect(ok).toBe(false);
    expect(ladderApi.passStage).not.toHaveBeenCalled();
    expect(store.labResult).toContain('ít nhất một lần swap');
  });
});
