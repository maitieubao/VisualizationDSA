import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import { generateDummyBubbleSortResult } from '../../animation-engine/services/algorithmApi';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

const ARRAY_FORMAT_REGEX = /^([+-]?\d+)(\s*,\s*[+-]?\d+)*$/;

export type GenerationType = 'random' | 'nearly-sorted' | 'reversed';

export const useInputStore = defineStore('input', () => {
  const animationStore = useAnimationStore();

  // ==========================================
  // 1. STATE
  // ==========================================
  const rawText = ref<string>('');
  const maxLimit = ref<number>(15);
  const isLoading = ref<boolean>(false);
  const apiErrorMessage = ref<string>('');

  // ==========================================
  // 2. GETTERS (Computed)
  // ==========================================

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

  // ==========================================
  // 3. ACTIONS
  // ==========================================

  function setLimit(limit: number): void {
    maxLimit.value = limit;
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

  async function submitCustomInput(algorithmId: string): Promise<void> {
    if (!canExecute.value) return;

    isLoading.value = true;
    apiErrorMessage.value = '';
    animationStore.pause();

    try {
      const response = await fetch(`${API_BASE}/api/v1/algorithms/custom-execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, br',
        },
        body: JSON.stringify({
          algorithmId,
          rawInput: rawText.value,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message ?? `HTTP Error ${response.status}`);
      }

      const result = await response.json();
      animationStore.loadResult(result);
    } catch {
      const fallbackResult = generateDummyBubbleSortResult(parsedArray.value);
      animationStore.loadResult(fallbackResult);
    } finally {
      isLoading.value = false;
    }
  }

  function clear(): void {
    rawText.value = '';
    apiErrorMessage.value = '';
    isLoading.value = false;
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
    setLimit,
    generateRandomInput,
    submitCustomInput,
    clear,
  };
});
