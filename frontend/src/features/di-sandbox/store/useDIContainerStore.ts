/**
 * useDIContainerStore — Pinia Setup Store for DI/IoC Container Visualizer.
 * Wraps DIContainerEngine and adds VCR playback from backend API.
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { executeDIContainerScenario, type DIContainerFrameResponse } from '../services/diContainerApi';

export const useDIContainerStore = defineStore('diContainer', () => {
  // ==========================================
  // VCR STATE (Backend API frames)
  // ==========================================
  const vcrFrames = ref<DIContainerFrameResponse[]>([]);
  const vcrCurrentIndex = ref(0);
  const isVcrMode = ref(false);
  const isVcrLoading = ref(false);
  const vcrError = ref<string | null>(null);

  const vcrCurrentFrame = computed(() =>
    vcrFrames.value[vcrCurrentIndex.value] ?? null
  );
  const vcrTotalFrames = computed(() => vcrFrames.value.length);

  async function loadVcrScenario(scenarioId: string): Promise<void> {
    isVcrLoading.value = true;
    vcrError.value = null;
    try {
      const frames = await executeDIContainerScenario(scenarioId);
      vcrFrames.value = frames;
      vcrCurrentIndex.value = 0;
      isVcrMode.value = true;
    } catch (err: unknown) {
      vcrError.value = err instanceof Error ? err.message : 'API call failed';
      isVcrMode.value = false;
    } finally {
      isVcrLoading.value = false;
    }
  }

  function vcrNext(): void {
    if (vcrCurrentIndex.value < vcrFrames.value.length - 1) {
      vcrCurrentIndex.value++;
    }
  }

  function vcrPrev(): void {
    if (vcrCurrentIndex.value > 0) {
      vcrCurrentIndex.value--;
    }
  }

  function vcrReset(): void {
    vcrCurrentIndex.value = 0;
  }

  function exitVcrMode(): void {
    isVcrMode.value = false;
    vcrFrames.value = [];
    vcrCurrentIndex.value = 0;
    vcrError.value = null;
  }

  return {
    // VCR State
    vcrFrames,
    vcrCurrentIndex,
    isVcrMode,
    isVcrLoading,
    vcrError,
    // VCR Computed
    vcrCurrentFrame,
    vcrTotalFrames,
    // VCR Actions
    loadVcrScenario,
    vcrNext,
    vcrPrev,
    vcrReset,
    exitVcrMode,
  };
});
