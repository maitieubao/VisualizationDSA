import { ref, computed } from "vue";
import { useVcrStore } from "../../vcr-player";
import type { SortAlgorithm, SortFrame } from "../types/sorting.types";
import { generateBubbleSortFrames } from "../algorithms/bubbleSort";
import { generateQuickSortFrames } from "../algorithms/quickSort";
import { generateMergeSortFrames } from "../algorithms/mergeSort";
import { generateHeapSortFrames } from "../algorithms/heapSort";
import { generateRadixSortFrames } from "../algorithms/radixSort";
import { generateCountingSortFrames } from "../algorithms/countingSort";
import { generateBucketSortFrames } from "../algorithms/bucketSort";
import { enrichFramesWithIds } from "../helpers/sortingIdEnricher";

export function useSortingAnimation() {
  const vcrStore = useVcrStore();
  const selectedAlgo = ref<SortAlgorithm>("bubble");
  const sortFrames = ref<SortFrame[]>([]);

  const currentSortFrame = computed<SortFrame | null>(() => {
    const idx = vcrStore.currentFrameIndex;
    return sortFrames.value[idx] ?? null;
  });

  const stepDescription = computed(
    () => currentSortFrame.value?.description ?? "Chọn thuật toán và nhấn Play ▶"
  );

  const progressPercent = computed(() => {
    if (!sortFrames.value.length) return 0;
    return (vcrStore.currentFrameIndex / (sortFrames.value.length - 1)) * 100;
  });

  const generators: Record<SortAlgorithm, (a: number[]) => SortFrame[]> = {
    bubble: generateBubbleSortFrames,
    quick: generateQuickSortFrames,
    merge: generateMergeSortFrames,
    heap: generateHeapSortFrames,
    radix: generateRadixSortFrames,
    counting: generateCountingSortFrames,
    bucket: generateBucketSortFrames,
  };

  function recompileForAlgo(algo: SortAlgorithm): void {
    const arrStr = vcrStore.rawInputArray;
    const parsedArr = arrStr
      .split(",")
      .map((num) => parseInt(num.trim(), 10))
      .filter((num) => !isNaN(num));

    // Clamp: giới hạn tối đa 15 phần tử để tránh tràn Canvas và chồng lấn nhãn STT
    const MAX_ELEMENTS = 15;
    const arr = parsedArr.length > 0
      ? parsedArr.slice(0, MAX_ELEMENTS)
      : [45, 12, 85, 32, 9, 60];

    sortFrames.value = generators[algo](arr);
    enrichFramesWithIds(sortFrames.value);
    vcrStore.playbackFrames = sortFrames.value;
    vcrStore.reset();
  }

  function selectAlgorithm(algo: SortAlgorithm): void {
    selectedAlgo.value = algo;
    recompileForAlgo(algo);
  }

  return {
    selectedAlgo,
    sortFrames,
    currentSortFrame,
    stepDescription,
    progressPercent,
    recompileForAlgo,
    selectAlgorithm,
  };
}
