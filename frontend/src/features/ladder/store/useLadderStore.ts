import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  ladderApi,
  STAGE_QUIZ,
  STAGE_LAB,
  STAGE_CODE,
  type LadderResponse,
  type LadderStageDto,
  type LabOperationDto,
  type PassStagePayload,
} from '../../../services/ladderApi';

interface LabSelection {
  first: number | null;
  second: number | null;
}

export const useLadderStore = defineStore('practiceLadder', () => {
  const lessonId = ref<string>('');
  const stages = ref<LadderStageDto[]>([]);
  const isLoading = ref(false);
  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  // Bậc 2: dãy ô mảng + thao tác swap + kết quả.
  const labArray = ref<number[]>([]);
  const labMaxSwaps = ref(0);
  const labOperations = ref<LabOperationDto[]>([]);
  const labSelection = ref<LabSelection>({ first: null, second: null });
  const labResult = ref<string | null>(null);

  const stage1 = computed(() => stages.value.find(s => s.stage === STAGE_QUIZ) ?? null);
  const stage2 = computed(() => stages.value.find(s => s.stage === STAGE_LAB) ?? null);
  const stage3 = computed(() => stages.value.find(s => s.stage === STAGE_CODE) ?? null);

  const labSwapsLeft = computed(() => labMaxSwaps.value - labOperations.value.length);
  const isLabComplete = computed(() => stage2.value?.passed === true);

  function findStage(stage: number): LadderStageDto | undefined {
    return stages.value.find(s => s.stage === stage);
  }

  async function loadLadder(id: string): Promise<void> {
    lessonId.value = id;
    isLoading.value = true;
    error.value = null;
    try {
      const data = await ladderApi.getLadder(id);
      stages.value = data.stages;
      resetLab();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Không thể tải Practice Ladder.';
    } finally {
      isLoading.value = false;
    }
  }

  async function passStage(stage: number, payload: PassStagePayload): Promise<boolean> {
    if (!lessonId.value) return false;
    isSubmitting.value = true;
    error.value = null;
    labResult.value = null;
    try {
      const result = await ladderApi.passStage(lessonId.value, stage, payload);
      await refreshLadderAfterPass();
      return result.passed;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Không thể nộp bậc này.';
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  /** Đồng bộ lại trạng thái 3 bậc sau khi pass (mở khóa bậc kế phía server). */
  async function refreshLadderAfterPass(): Promise<void> {
    if (!lessonId.value) return;
    try {
      const data = await ladderApi.getLadder(lessonId.value);
      stages.value = data.stages;
      resetLab();
    } catch {
      // Không ghi đè lỗi nộp bài — trạng thái vẫn phản ánh pass thành công từ response trước.
    }
  }

  // ── Bậc 2: Interactive Lab ──
  function resetLab(): void {
    const lab = stage2.value?.lab;
    labArray.value = lab ? [...lab.input] : [];
    labMaxSwaps.value = lab?.maxSwaps ?? 0;
    labOperations.value = [];
    labSelection.value = { first: null, second: null };
    labResult.value = null;
  }

  function toggleCell(index: number): void {
    if (isLabComplete.value || isSubmitting.value || labSwapsLeft.value <= 0) return;
    const { first, second } = labSelection.value;
    if (first === null) {
      labSelection.value = { first: index, second: null };
      return;
    }
    if (first === index) {
      labSelection.value = { first: null, second: null };
      return;
    }
    // Đủ cặp → thực hiện swap.
    const arr = [...labArray.value];
    [arr[first], arr[index]] = [arr[index], arr[first]];
    labArray.value = arr;
    labOperations.value = [...labOperations.value, { fromIndex: first, toIndex: index }];
    labSelection.value = { first: null, second: null };
  }

  async function submitLab(): Promise<boolean> {
    if (isLabComplete.value || isSubmitting.value) return false;
    if (labOperations.value.length === 0) {
      labResult.value = 'Hãy thực hiện ít nhất một lần swap trước khi nộp.';
      return false;
    }
    const ok = await passStage(STAGE_LAB, {
      operations: labOperations.value,
      finalArray: labArray.value,
    });
    labResult.value = ok
      ? 'Đạt! Trạng thái cuối khớp kết quả chuẩn.'
      : (error.value ?? 'Chưa đạt — kiểm tra lại thứ tự các phần tử.');
    return ok;
  }

  function isSelected(index: number): boolean {
    const { first, second } = labSelection.value;
    return first === index || second === index;
  }

  return {
    lessonId,
    stages,
    isLoading,
    isSubmitting,
    error,
    stage1,
    stage2,
    stage3,
    findStage,
    loadLadder,
    passStage,
    labArray,
    labMaxSwaps,
    labOperations,
    labSelection,
    labResult,
    labSwapsLeft,
    isLabComplete,
    resetLab,
    toggleCell,
    submitLab,
    isSelected,
  };
});
