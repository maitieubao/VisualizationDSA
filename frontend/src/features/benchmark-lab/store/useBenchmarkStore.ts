import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { compareAlgorithms } from '../services/benchmarkApi';
import type { CompareResultDto } from '../types';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const detail = (err as { detail?: unknown }).detail;
    const message = (err as { message?: unknown }).message;
    if (typeof detail === 'string' && detail !== '') return detail;
    if (typeof message === 'string' && message !== '') return message;
  }
  return 'Không thể so sánh thuật toán. Vui lòng thử lại sau.';
}

export const useBenchmarkStore = defineStore('benchmark', () => {
  const selectedIds = ref<string[]>([]);
  const inputText = ref<string>('5, 3, 8, 1, 9');
  const results = ref<CompareResultDto[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string>('');

  const selectedCount = computed<number>(() => selectedIds.value.length);
  const canRun = computed<boolean>(
    () => selectedCount.value >= 2 && selectedCount.value <= 4 && !isLoading.value,
  );

  function toggleAlgorithm(id: string): void {
    const index = selectedIds.value.indexOf(id);
    if (index >= 0) {
      selectedIds.value = selectedIds.value.filter((item) => item !== id);
      return;
    }
    if (selectedIds.value.length >= 4) return;
    selectedIds.value = [...selectedIds.value, id];
  }

  function setInputText(text: string): void {
    inputText.value = text;
  }

  function parseInput(): number[] {
    return inputText.value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part !== '')
      .map((part) => Number(part));
  }

  async function runComparison(): Promise<void> {
    error.value = '';

    if (selectedIds.value.length < 2 || selectedIds.value.length > 4) {
      error.value = 'Vui lòng chọn từ 2 đến 4 thuật toán.';
      return;
    }

    const input = parseInput();
    if (input.length === 0 || input.some((value) => Number.isNaN(value))) {
      error.value = 'Dữ liệu đầu vào phải là danh sách số nguyên, cách nhau bởi dấu phẩy.';
      return;
    }

    isLoading.value = true;
    try {
      results.value = await compareAlgorithms({
        algorithmIds: [...selectedIds.value],
        inputData: input,
      });
    } catch (err: unknown) {
      results.value = [];
      error.value = errorMessage(err);
    } finally {
      isLoading.value = false;
    }
  }

  function reset(): void {
    selectedIds.value = [];
    results.value = [];
    error.value = '';
  }

  return {
    selectedIds,
    inputText,
    results,
    isLoading,
    error,
    selectedCount,
    canRun,
    toggleAlgorithm,
    setInputText,
    parseInput,
    runComparison,
    reset,
  };
});
