import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { generateDummyResult } from '../../dsa-modules/services/dummyGenerators';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const ARRAY_FORMAT_REGEX = /^([+-]?\d+)(\s*,\s*[+-]?\d+)*$/;

export type GenerationType = 'random' | 'nearly-sorted' | 'reversed';

export const ALGORITHM_LIMITS: Record<string, number> = {
  'linear-search': 100,
  'binary-search': 150,
  'bubble-sort': 50,
  'selection-sort': 50,
  'insertion-sort': 50,
  'quick-sort': 150,
  'merge-sort': 150,
  'heap-sort': 150,
  'radix-sort': 100,
  'counting-sort': 100,
  'bucket-sort': 100,
  'stack': 20,
  'queue': 20,
  'bst': 15,
};

const DEFAULT_LIMIT = 15;

export const useInputStore = defineStore('input', () => {
  const animationStore = useAnimationStore();

  const rawText = ref<string>('');
  const maxLimit = ref<number>(15);
  const isLoading = ref<boolean>(false);
  const apiErrorMessage = ref<string>('');

  const parsedArray = computed<number[]>(() => {
    const cleanText = rawText.value.trim();
    if (!cleanText || !ARRAY_FORMAT_REGEX.test(cleanText)) {
      return [];
    }
    return cleanText.split(',').map(s => parseInt(s.trim(), 10));
  });

  const elementCount = computed<number>(() => parsedArray.value.length);

  const isValidFormat = computed<boolean>(() => {
    const cleanText = rawText.value.trim();
    if (cleanText === '') return true;
    return ARRAY_FORMAT_REGEX.test(cleanText);
  });

  const isWithinLimit = computed<boolean>(() => {
    return elementCount.value <= maxLimit.value;
  });

  const canExecute = computed<boolean>(() => {
    return (
      rawText.value.trim() !== '' &&
      isValidFormat.value &&
      isWithinLimit.value &&
      elementCount.value > 0 &&
      !isLoading.value
    );
  });

  const hasLargeValues = computed<boolean>(() => {
    return parsedArray.value.some(v => v > 10000 || v < -10000);
  });

  function setLimit(limit: number): void {
    maxLimit.value = limit;
  }

  function setAlgorithmLimit(algorithmId: string): void {
    maxLimit.value = ALGORITHM_LIMITS[algorithmId] ?? DEFAULT_LIMIT;
  }

  function generateRandomInput(type: GenerationType, size: number = 10): void {
    const clampedSize = Math.min(size, maxLimit.value);
    const arr: number[] = [];

    for (let i = 0; i < clampedSize; i++) {
      arr.push(Math.floor(Math.random() * 90) + 10);
    }

    if (type === 'nearly-sorted') {
      arr.sort((a, b) => a - b);
      if (clampedSize > 3) {
        const idx = Math.floor(Math.random() * (clampedSize - 2));
        const temp = arr[idx];
        arr[idx] = arr[idx + 1];
        arr[idx + 1] = temp;
      }
    } else if (type === 'reversed') {
      arr.sort((a, b) => b - a);
    }

    rawText.value = arr.join(', ');
    apiErrorMessage.value = '';
  }

  // AL-006: requestId + AbortController chống race 2 request — response cũ không ghi đè mới
  let requestId = 0;
  let abortController: AbortController | null = null;

  async function submitCustomInput(algorithmId: string): Promise<void> {
    if (!canExecute.value) return;

    const seq = ++requestId;
    abortController?.abort();
    const controller = new AbortController();
    abortController = controller;

    isLoading.value = true;
    apiErrorMessage.value = '';
    animationStore.pause();

    try {
      const response = await fetch(`${API_BASE}/api/v1/algorithms/custom-execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algorithmId,
          rawInput: rawText.value,
        }),
        signal: controller.signal,
      });

      if (seq !== requestId) return; // request cũ hơn đã bị thay thế — bỏ response

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(`HTTP ${response.status}: ${errData?.message ?? 'Lỗi máy chủ'}`);
      }

      const result = await response.json();
      if (seq !== requestId) return; // bỏ kết quả cũ lọt về sau khi có request mới
      animationStore.loadResult(result);
    } catch (err) {
      if (seq !== requestId) return; // bỏ AbortError / lỗi của request cũ
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      apiErrorMessage.value = message.startsWith('HTTP')
        ? `Máy chủ báo lỗi (${message}). Đang dùng dữ liệu mô phỏng cục bộ.`
        : `Không kết nối được máy chủ. Đang dùng dữ liệu mô phỏng cục bộ cho thuật toán '${algorithmId}'.`;
      const fallbackResult = generateDummyResult(algorithmId, parsedArray.value);
      animationStore.loadResult(fallbackResult);
    } finally {
      if (seq === requestId) {
        isLoading.value = false;
        if (abortController === controller) abortController = null;
      }
    }
  }

  function clear(): void {
    requestId++;
    abortController?.abort();
    abortController = null;
    rawText.value = '';
    apiErrorMessage.value = '';
    isLoading.value = false;
  }

  // AL-041: action thay cho v-model mutation trực tiếp từ component
  function setRawText(text: string): void {
    rawText.value = text;
  }

  return {
    rawText,
    maxLimit,
    isLoading,
    apiErrorMessage,
    parsedArray,
    elementCount,
    isValidFormat,
    isWithinLimit,
    canExecute,
    hasLargeValues,
    setLimit,
    setAlgorithmLimit,
    generateRandomInput,
    submitCustomInput,
    clear,
    setRawText,
  };
});
