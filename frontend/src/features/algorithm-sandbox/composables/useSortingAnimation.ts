import { ref, computed } from "vue";
import { useVcrStore } from "../../vcr-player";
import { useToastStore } from "../../../composables/useToast";
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
const FALLBACK_ARRAY: number[] = [45, 12, 85, 32, 9, 60];

let _sharedInstance: ReturnType<typeof useSortingAnimation> | null = null;

export function useSharedSortingAnimation() {
  const vcrStore = useVcrStore();
  if (!_sharedInstance) {
    _sharedInstance = useSortingAnimation();
  }
  // SV-006: view remount → SortingView.onUnmounted đã xóa customCompileFn (null) —
  // đăng ký lại + tái compile để frames khớp view hiện tại (hết "frames cũ mâu thuẫn")
  if (vcrStore.customCompileFn === null) {
    _sharedInstance.selectAlgorithm(_sharedInstance.selectedAlgo.value);
  }
  return _sharedInstance;
}

export function useSortingAnimation() {
  const vcrStore = useVcrStore();
  const toastStore = useToastStore();
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
    // SV-024: tái sử dụng vcrStore.inputArray (đã parse sẵn) — không parse token 2 lần
    const arrStr = vcrStore.rawInputArray;
    const tokens = arrStr.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    const parsed = vcrStore.inputArray;
    // Token rác → vcrStore.inputArray lọc bỏ → độ dài lệch = input hỏng
    const malformed = tokens.length !== parsed.length;

    let arr: number[];
    if (!malformed && parsed.length > 0) {
      if (parsed.length > MAX_ELEMENTS) {
        toastStore.warning(
          `Mảng có ${parsed.length} phần tử — chỉ hiển thị tối đa ${MAX_ELEMENTS} phần tử đầu tiên.`
        );
        arr = parsed.slice(0, MAX_ELEMENTS);
      } else {
        arr = parsed;
      }
    } else {
      arr = FALLBACK_ARRAY;
    }

    try {
      sortFrames.value = generators[algo](arr);
    } catch (err) {
      console.error(`[useSortingAnimation] Generator failed for ${algo}:`, err);
      // SV-005: reset cả VCR store — tránh VCR dock đếm frame cũ rồi Play chạy lệch
      sortFrames.value = [];
      vcrStore.playbackFrames = [];
      vcrStore.reset();
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

  // SV-006 + SV-043: KHÔNG dùng onMounted (warning khi test gọi composable trực tiếp,
  // chỉ chạy 1 lần với singleton) — init lười ngay trong setup: mỗi lần composable
  // được setup lại (test trực tiếp / remount view) đều tự selectAlgorithm lại
  selectAlgorithm(selectedAlgo.value);

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
