import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  learningPathApi,
  type EnterNodeResponse,
  type LearningPathMapDto,
  type LearningPathNodeDto,
  type LearningPathSummaryDto,
  type PassNodePayload,
} from '../../../services/learningPathApi';

export const useLearningPathStore = defineStore('learningPath', () => {
  const paths = ref<LearningPathSummaryDto[]>([]);
  const currentPath = ref<LearningPathMapDto | null>(null);
  const isLoadingPaths = ref(false);
  const isLoadingMap = ref(false);
  const isEntering = ref(false);
  const isPassing = ref(false);
  const error = ref<string | null>(null);
  const heartsEmpty = ref(false);
  const lastEnterResult = ref<EnterNodeResponse | null>(null);

  const hearts = computed(() => currentPath.value?.hearts ?? 0);
  const heartsMax = computed(() => currentPath.value?.heartsMax ?? 10);
  const nextHeartAt = computed(() => currentPath.value?.nextHeartAt ?? null);
  const nodes = computed(() => currentPath.value?.nodes ?? []);

  function currentNode(nodeId: string): LearningPathNodeDto | null {
    return nodes.value.find(n => n.id === nodeId) ?? null;
  }

  async function loadPaths(): Promise<void> {
    isLoadingPaths.value = true;
    error.value = null;
    try {
      paths.value = await learningPathApi.getLearningPaths();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Không thể tải danh sách lộ trình học.';
    } finally {
      isLoadingPaths.value = false;
    }
  }

  async function loadMap(pathId: string): Promise<void> {
    isLoadingMap.value = true;
    error.value = null;
    heartsEmpty.value = false;
    try {
      currentPath.value = await learningPathApi.getLearningPath(pathId);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Không thể tải bản đồ lộ trình.';
    } finally {
      isLoadingMap.value = false;
    }
  }

  async function enterNode(pathId: string, nodeId: string): Promise<boolean> {
    isEntering.value = true;
    error.value = null;
    heartsEmpty.value = false;
    try {
      const result = await learningPathApi.enterNode(pathId, nodeId);
      lastEnterResult.value = result;
      if (currentPath.value) {
        currentPath.value = {
          ...currentPath.value,
          hearts: result.hearts,
          heartsMax: result.heartsMax,
        };
      }
      return true;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Không thể vào node này.';
      heartsEmpty.value = isHeartsEmptyError(err);
      return false;
    } finally {
      isEntering.value = false;
    }
  }

  async function passNode(pathId: string, nodeId: string, payload?: PassNodePayload): Promise<boolean> {
    isPassing.value = true;
    error.value = null;
    try {
      await learningPathApi.passNode(pathId, nodeId, payload);
      await loadMap(pathId);
      return true;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Không thể hoàn thành node này.';
      return false;
    } finally {
      isPassing.value = false;
    }
  }

  function dismissHeartsEmpty(): void {
    heartsEmpty.value = false;
  }

  function isHeartsEmptyError(err: unknown): boolean {
    if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 403) {
      // Review F9: backend trả { error: "HEARTS_EMPTY", ... } — parseErrorBody chỉ map
      // status/title/detail nên errorCode KHÔNG có trong ApiError. Đọc trực tiếp từ body.
      const detail = (err as { detail?: string }).detail ?? '';
      if (detail.includes('HEARTS_EMPTY')) return true;
      const errorCode = (err as { error?: string }).error ?? '';
      return errorCode.includes('HEARTS_EMPTY');
    }
    return false;
  }

  return {
    paths,
    currentPath,
    isLoadingPaths,
    isLoadingMap,
    isEntering,
    isPassing,
    error,
    heartsEmpty,
    lastEnterResult,
    hearts,
    heartsMax,
    nextHeartAt,
    nodes,
    currentNode,
    loadPaths,
    loadMap,
    enterNode,
    passNode,
    dismissHeartsEmpty,
  };
});
