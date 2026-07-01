import { defineStore } from 'pinia'; import { ref, computed, shallowRef } from 'vue';
import type { FrameDTO } from '../../animation-engine/types/animation.types'; import type { ComparePlaybackMode, ComparePlaybackState, CompareStats } from '../types/compare.types';
import { ALGORITHM_CATALOG } from '../../dsa-modules/services/algorithmCatalog';
import { generateDummyResult } from '../../dsa-modules/services/dummyGenerators';
import { extractStats, startPlaybackSession } from './compareHelpers';

export const useCompareAlgorithmsStore = defineStore('compareAlgorithms', () => {
  const leftAlgorithmId = ref('bubble-sort'), rightAlgorithmId = ref('selection-sort');
  const leftFrames = shallowRef<FrameDTO[]>([]), rightFrames = shallowRef<FrameDTO[]>([]);
  const leftPseudoCode = ref<string[]>([]), rightPseudoCode = ref<string[]>([]);
  const leftCurrentIndex = ref(0), rightCurrentIndex = ref(0);
  const isPlaying = ref(false), globalPlaySpeed = ref(1.0);
  const playbackMode = ref<ComparePlaybackMode>('independent');
  const inputArray = ref<number[]>([5, 3, 8, 1, 9, 2, 7, 4, 6]);
  const leftTimerRef = { value: null as any }, rightTimerRef = { value: null as any };

  const leftTotalFrames = computed(() => leftFrames.value.length), rightTotalFrames = computed(() => rightFrames.value.length);
  const leftCurrentFrame = computed(() => leftFrames.value[leftCurrentIndex.value] ?? null), rightCurrentFrame = computed(() => rightFrames.value[rightCurrentIndex.value] ?? null);
  const leftIsFinished = computed(() => leftFrames.value.length > 0 && leftCurrentIndex.value >= leftFrames.value.length - 1), rightIsFinished = computed(() => rightFrames.value.length > 0 && rightCurrentIndex.value >= rightFrames.value.length - 1);
  const bothFinished = computed(() => leftIsFinished.value && rightIsFinished.value);
  const leftProgressPercent = computed(() => leftFrames.value.length <= 1 ? 0 : (leftCurrentIndex.value / (leftFrames.value.length - 1)) * 100), rightProgressPercent = computed(() => rightFrames.value.length <= 1 ? 0 : (rightCurrentIndex.value / (rightFrames.value.length - 1)) * 100);
  const globalProgressPercent = computed(() => Math.max(leftProgressPercent.value, rightProgressPercent.value));

  const playbackState = computed<ComparePlaybackState>(() => {
    if (leftFrames.value.length === 0 && rightFrames.value.length === 0) return 'UNINITIALIZED';
    return bothFinished.value && !isPlaying.value ? 'FINISHED' : isPlaying.value ? 'PLAYING' : (leftCurrentIndex.value === 0 && rightCurrentIndex.value === 0 ? 'LOADED' : 'PAUSED');
  });

  const leftStats = computed<CompareStats>(() => extractStats(leftFrames.value, leftCurrentIndex.value)), rightStats = computed<CompareStats>(() => extractStats(rightFrames.value, rightCurrentIndex.value));
  const efficiencyRatio = computed(() => leftStats.value.comparisons === 0 || rightStats.value.comparisons === 0 ? 1 : Number((leftStats.value.comparisons / rightStats.value.comparisons).toFixed(1)));
  const SORTING_ALGS: Record<string, { name: string; timeComplexity: string }> = {
    'bubble-sort': { name: 'Bubble Sort (Sắp xếp nổi bọt)', timeComplexity: 'O(N²)' },
    'selection-sort': { name: 'Selection Sort (Sắp xếp chọn)', timeComplexity: 'O(N²)' },
    'insertion-sort': { name: 'Insertion Sort (Sắp xếp chèn)', timeComplexity: 'O(N²)' },
    'quick-sort': { name: 'Quick Sort (Sắp xếp nhanh)', timeComplexity: 'O(N log N)' },
    'merge-sort': { name: 'Merge Sort (Sắp xếp trộn)', timeComplexity: 'O(N log N)' },
  };
  const getAlg = (id: string) => {
    if (SORTING_ALGS[id]) return SORTING_ALGS[id];
    return ALGORITHM_CATALOG.find(a => a.id === id);
  };
  const leftAlgorithmName = computed(() => getAlg(leftAlgorithmId.value)?.name ?? leftAlgorithmId.value), rightAlgorithmName = computed(() => getAlg(rightAlgorithmId.value)?.name ?? rightAlgorithmId.value);
  const leftTimeComplexity = computed(() => getAlg(leftAlgorithmId.value)?.timeComplexity ?? ''), rightTimeComplexity = computed(() => getAlg(rightAlgorithmId.value)?.timeComplexity ?? '');

  const clearTimers = () => {
    if (leftTimerRef.value) clearTimeout(leftTimerRef.value);
    if (rightTimerRef.value) clearTimeout(rightTimerRef.value);
    leftTimerRef.value = rightTimerRef.value = null;
  };
  const checkBothFinished = () => { if (bothFinished.value) isPlaying.value = false; };

  const triggerPlayback = () => {
    startPlaybackSession(playbackMode.value, globalPlaySpeed.value, leftTotalFrames.value, rightTotalFrames.value, leftIsFinished, rightIsFinished, isPlaying, leftCurrentIndex, rightCurrentIndex, leftFrames.value.length, rightFrames.value.length, checkBothFinished, leftTimerRef, rightTimerRef);
  };

  const startPlayback = () => {
    if (isPlaying.value) return;
    if (bothFinished.value) leftCurrentIndex.value = rightCurrentIndex.value = 0;
    isPlaying.value = true;
    triggerPlayback();
  };

  const pausePlayback = () => { isPlaying.value = false; clearTimers(); };
  const stopPlayback = () => { pausePlayback(); leftCurrentIndex.value = rightCurrentIndex.value = 0; };
  const togglePlayback = () => isPlaying.value ? pausePlayback() : startPlayback();

  const stepForward = () => { pausePlayback(); leftCurrentIndex.value = Math.min(leftFrames.value.length - 1, leftCurrentIndex.value + 1); rightCurrentIndex.value = Math.min(rightFrames.value.length - 1, rightCurrentIndex.value + 1); };
  const stepBackward = () => { pausePlayback(); leftCurrentIndex.value = Math.max(0, leftCurrentIndex.value - 1); rightCurrentIndex.value = Math.max(0, rightCurrentIndex.value - 1); };

  const scrubToPercent = (percent: number) => {
    pausePlayback();
    const c = Math.max(0, Math.min(100, percent));
    if (leftFrames.value.length > 1) leftCurrentIndex.value = Math.round((c / 100) * (leftFrames.value.length - 1));
    if (rightFrames.value.length > 1) rightCurrentIndex.value = Math.round((c / 100) * (rightFrames.value.length - 1));
  };

  const setSpeed = (speed: number) => {
    globalPlaySpeed.value = speed;
    if (isPlaying.value) { clearTimers(); triggerPlayback(); }
  };

  const setPlaybackMode = (mode: ComparePlaybackMode) => {
    const was = isPlaying.value; if (was) pausePlayback();
    playbackMode.value = mode; if (was) startPlayback();
  };

  const generateRandomInput = (size = 10) => inputArray.value = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);

  const loadCompareSession = (leftAlg: string, rightAlg: string) => {
    stopPlayback();
    leftAlgorithmId.value = leftAlg; rightAlgorithmId.value = rightAlg;
    const L = generateDummyResult(leftAlg, [...inputArray.value]), R = generateDummyResult(rightAlg, [...inputArray.value]);
    leftFrames.value = L.frames; rightFrames.value = R.frames;
    leftPseudoCode.value = L.pseudoCode; rightPseudoCode.value = R.pseudoCode;
    leftCurrentIndex.value = rightCurrentIndex.value = 0;
  };

  const cleanup = () => { stopPlayback(); leftFrames.value = rightFrames.value = []; leftPseudoCode.value = rightPseudoCode.value = []; };

  return {
    leftAlgorithmId, rightAlgorithmId, leftFrames, rightFrames, leftPseudoCode, rightPseudoCode,
    leftCurrentIndex, rightCurrentIndex, isPlaying, globalPlaySpeed, playbackMode, inputArray,
    leftTotalFrames, rightTotalFrames, leftCurrentFrame, rightCurrentFrame, leftIsFinished, rightIsFinished,
    bothFinished, leftProgressPercent, rightProgressPercent, globalProgressPercent, playbackState,
    leftStats, rightStats, efficiencyRatio, leftAlgorithmName, rightAlgorithmName, leftTimeComplexity, rightTimeComplexity,
    loadCompareSession, generateRandomInput, startPlayback, pausePlayback, stopPlayback,
    togglePlayback, stepForward, stepBackward, scrubToPercent, setSpeed, setPlaybackMode, cleanup,
  };
});
