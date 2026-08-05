import { ref, computed, onMounted } from "vue";
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

const MAX_ELEMENTS = 15;

let _sharedInstance: ReturnType<typeof useSortingAnimation> | null = null;

export function useSharedSortingAnimation() {
  if (!_sharedInstance) {
    _sharedInstance = useSortingAnimation();
  }
  return _sharedInstance;
}

export function useSortingAnimation() {
  const vcrStore = useVcrStore();
  const selectedAlgo = ref<SortAlgorithm>("bubble");
  const sortFrames = ref<SortFrame[]>([]);

  const currentSortFrame = computed<SortFrame | null>(() => {
    const idx = vcrStore.currentFrameIndex;
    return sortFrames.value[idx] ?? null;
  });

  const stepDescription = computed(
    () => currentSortFrame.value?.description ?? "Chọn thuật toán và nhấn Play"
  );

  const progressPercent = computed(() => {
    if (sortFrames.value.length <= 1) return 0;
    const ratio = vcrStore.currentFrameIndex / (sortFrames.value.length - 1);
    return Math.min(100, Math.max(0, ratio * 100));
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

    // Parse chặt: mỗi token phải là số nguyên hợp lệ; nếu có token rác → dùng mảng mặc định
    const tokens = arrStr.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    const parsedArr: number[] = [];
    let malformed = false;
    for (const token of tokens) {
      if (!/^-?\d+$/.test(token)) {
        malformed = true;
        break;
      }
      parsedArr.push(parseInt(token, 10));
    }

    const arr = !malformed && parsedArr.length > 0
      ? parsedArr.slice(0, MAX_ELEMENTS)
      : [45, 12, 85, 32, 9, 60];

    try {
      sortFrames.value = generators[algo](arr);
    } catch (err) {
      console.error(`[useSortingAnimation] Generator failed for ${algo}:`, err);
      sortFrames.value = [];
      return;
    }

    enrichFramesWithIds(sortFrames.value);
    vcrStore.playbackFrames = sortFrames.value;
    vcrStore.reset();
  }

  function selectAlgorithm(algo: SortAlgorithm): void {
    selectedAlgo.value = algo;
    vcrStore.customCompileFn = () => recompileForAlgo(algo);
    recompileForAlgo(algo);
  }

  onMounted(() => {
    // Luôn khởi tạo frames của sorting khi view mount — kể cả khi store dùng chung
    // đã chứa frames của feature khác (CodeEditor, Quiz...), tránh "sorting tab chết"
    selectAlgorithm(selectedAlgo.value);
  });

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
