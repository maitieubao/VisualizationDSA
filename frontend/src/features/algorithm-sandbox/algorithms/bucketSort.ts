import type { SortFrame, SortHighlights } from "../types/sorting.types";

interface TrackedElement {
  id: number;
  value: number;
}

// CC-009: ánh xạ bước thuật toán → dòng vật lý + logicalId (giả định khối mã BucketSort
// được nạp vào Monaco: line 1 = hàm, line 3 = phân loại vào bucket, line 4 = sắp xếp trong
// bucket, line 6 = thu hồi vào mảng kết quả)
const LINE_FUNC_DECL = 1;
const LINE_DISTRIBUTE_STEP = 3;
const LINE_SORT_STEP = 4;
const LINE_COLLECT_STEP = 6;

function mkHighlights(
  sorted: number[],
  extras: Partial<SortHighlights> = {}
): SortHighlights {
  return { compare: [], swap: [], sorted: [...sorted], ...extras };
}

// SV-008 (EC-022): min/max 1 pass thay Math.min/max(...arr) — mảng lớn không RangeError
function minMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  let min = values[0];
  let max = values[0];
  for (let i = 1; i < values.length; i++) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

export function generateBucketSortFrames(arr: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  let stepIndex = 0;
  let comparisons = 0;
  let swaps = 0;

  const n = arr.length;
  const initialElements: TrackedElement[] = arr.map((val, idx) => ({
    id: idx,
    value: val,
  }));

  // Dải Bucket được tính động theo giá trị thực tế của mảng (không cố định
  // [0-25)...): giá trị âm hay > 100 vẫn được phân phối đều vào 4 Bucket
  const bucketCount = 4;
  const buckets: TrackedElement[][] = Array.from({ length: bucketCount }, () => []);

  const { min: minVal, max: maxVal } = minMax(arr);
  const spread = maxVal - minVal;

  const getBucketIndex = (val: number): number => {
    if (spread === 0) return 0;
    const idx = Math.floor(((val - minVal) / spread) * bucketCount);
    return Math.min(bucketCount - 1, Math.max(0, idx));
  };

  const fmtRange = (x: number): string =>
    Number.isInteger(x) ? String(x) : x.toFixed(2);

  const rangeLabel = (b: number): string => {
    const low = minVal + (spread * b) / bucketCount;
    const high = b === bucketCount - 1 ? maxVal : minVal + (spread * (b + 1)) / bucketCount;
    return b === bucketCount - 1
      ? `[${fmtRange(low)}-${fmtRange(high)}]`
      : `[${fmtRange(low)}-${fmtRange(high)})`;
  };

  const rangeSummary = (): string =>
    Array.from({ length: bucketCount }, (_, b) => rangeLabel(b)).join(", ");

  const cloneBuckets = (bks: TrackedElement[][]): TrackedElement[][] => {
    return bks.map((b) => b.map((e) => ({ ...e })));
  };

  const cloneOutput = (out: (TrackedElement | null)[]): ({ id: number; value: number } | null)[] => {
    return out.map((e) => (e ? { id: e.id, value: e.value } : null));
  };

  const outputArrayWithIds: (TrackedElement | null)[] = Array.from({ length: n }, () => null);

  const baseVars = (overrides: Record<string, string | number>): Record<string, string | number> => ({
    i: "-", bucketIdx: "-", b: "-", j: "-", outputCount: "-", comparisons, swaps, ...overrides,
  });

  // Góc nhìn chính: phần tử đã thu hồi vào output chiếm vị trí ổn định,
  // phần chưa thu hồi được "nén" giữ nguyên thứ tự — đảm bảo id luôn duy nhất
  const mergedArrayState = (): { arrayState: number[]; arrayStateWithIds: Array<{ id: number; value: number }> } => {
    const placed: Array<{ id: number; value: number }> = [];
    for (const item of outputArrayWithIds) {
      if (item) placed.push(item);
    }
    const placedIds = new Set(placed.map((e) => e.id));
    const remaining = initialElements.filter((e) => !placedIds.has(e.id));

    const result: Array<{ id: number; value: number }> = [];
    for (let i = 0; i < n; i++) {
      result.push(i < placed.length ? placed[i] : remaining[i - placed.length]);
    }
    return { arrayState: result.map((e) => e.value), arrayStateWithIds: result };
  };

  frames.push({
    stepIndex: stepIndex++,
    arrayState: initialElements.map((e) => e.value),
    arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: `Khởi tạo Bucket Sort. Chia phạm vi giá trị [${fmtRange(minVal)}-${fmtRange(maxVal)}] thành 4 Bucket: ${rangeSummary()}.`,
    algorithm: "bucket",
    bucketSortBuckets: buckets.map((b) => b.map((e) => e.value)),
    bucketSortBucketsWithIds: cloneBuckets(buckets),
    bucketStep: "distribute",
    bucketSortActiveIdx: null,
    bucketSortComparingBucketIndices: null,
    bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
    variables: baseVars({}),
    lineNumber: LINE_FUNC_DECL,
    activeLogicalLineId: "FUNC_DECL",
    highlights: mkHighlights([]),
  });

  for (let i = 0; i < initialElements.length; i++) {
    const elem = initialElements[i];
    const bucketIdx = getBucketIndex(elem.value);

    frames.push({
      stepIndex: stepIndex++,
      arrayState: initialElements.map((e) => e.value),
      arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
      comparingIndices: [i, i] as [number, number],
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: `Đang phân loại phần tử A[${i}] = ${elem.value} thuộc phạm vi ${rangeLabel(bucketIdx)} của Bucket ${bucketIdx}.`,
      algorithm: "bucket",
      bucketSortBuckets: buckets.map((b) => b.map((e) => e.value)),
      bucketSortBucketsWithIds: cloneBuckets(buckets),
      bucketStep: "distribute",
      bucketSortActiveIdx: bucketIdx,
      bucketSortComparingBucketIndices: null,
      bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
      variables: baseVars({ i, bucketIdx }),
      lineNumber: LINE_DISTRIBUTE_STEP,
      activeLogicalLineId: "DISTRIBUTE_STEP",
      highlights: mkHighlights([], { active: [i] }),
    });

    buckets[bucketIdx].push({ ...elem });

    frames.push({
      stepIndex: stepIndex++,
      arrayState: initialElements.map((e) => e.value),
      arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
      comparingIndices: [i, i] as [number, number],
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: `Phân phối thành công phần tử A[${i}] = ${elem.value} vào Bucket ${bucketIdx}.`,
      algorithm: "bucket",
      bucketSortBuckets: buckets.map((b) => b.map((e) => e.value)),
      bucketSortBucketsWithIds: cloneBuckets(buckets),
      bucketStep: "distribute",
      bucketSortActiveIdx: bucketIdx,
      bucketSortComparingBucketIndices: null,
      bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
      variables: baseVars({ i, bucketIdx }),
      lineNumber: LINE_DISTRIBUTE_STEP,
      activeLogicalLineId: "DISTRIBUTE_STEP",
      highlights: mkHighlights([], { active: [i] }),
    });
  }

  for (let b = 0; b < bucketCount; b++) {
    const bucket = buckets[b];
    if (bucket.length === 0) continue;

    frames.push({
      stepIndex: stepIndex++,
      arrayState: initialElements.map((e) => e.value),
      arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
      comparingIndices: null,
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: `Bắt đầu sắp xếp các phần tử bên trong Bucket ${b}.`,
      algorithm: "bucket",
      bucketSortBuckets: buckets.map((bk) => bk.map((e) => e.value)),
      bucketSortBucketsWithIds: cloneBuckets(buckets),
      bucketStep: "sort",
      bucketSortActiveIdx: b,
      bucketSortComparingBucketIndices: null,
      bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
      variables: baseVars({ b }),
      lineNumber: LINE_SORT_STEP,
      activeLogicalLineId: "SORT_STEP",
      highlights: mkHighlights([], { active: [] }),
    });

    if (bucket.length > 1) {
      for (let i = 1; i < bucket.length; i++) {
        let j = i;
        while (j > 0) {
          comparisons++;
          frames.push({
            stepIndex: stepIndex++,
            arrayState: initialElements.map((e) => e.value),
            arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
            comparingIndices: null,
            pivotIndex: null,
            swappedIndices: null,
            sortedIndices: [],
            description: `So sánh ${bucket[j - 1].value} và ${bucket[j].value} trong Bucket ${b}.`,
            algorithm: "bucket",
            bucketSortBuckets: buckets.map((bk) => bk.map((e) => e.value)),
            bucketSortBucketsWithIds: cloneBuckets(buckets),
            bucketStep: "sort",
            bucketSortActiveIdx: b,
            bucketSortComparingBucketIndices: [j - 1, j] as [number, number],
            bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
            variables: baseVars({ b, j }),
            lineNumber: LINE_SORT_STEP,
            activeLogicalLineId: "SORT_STEP",
            highlights: mkHighlights([], { compare: [j - 1, j] }),
          });

          if (bucket[j - 1].value > bucket[j].value) {
            const temp = bucket[j];
            bucket[j] = bucket[j - 1];
            bucket[j - 1] = temp;
            swaps++;

            frames.push({
              stepIndex: stepIndex++,
              arrayState: initialElements.map((e) => e.value),
              arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
              comparingIndices: null,
              pivotIndex: null,
              swappedIndices: null,
              sortedIndices: [],
              description: `Hoán đổi ${bucket[j - 1].value} và ${bucket[j].value} trong Bucket ${b} để sắp xếp.`,
              algorithm: "bucket",
              bucketSortBuckets: buckets.map((bk) => bk.map((e) => e.value)),
              bucketSortBucketsWithIds: cloneBuckets(buckets),
              bucketStep: "sort",
              bucketSortActiveIdx: b,
              bucketSortComparingBucketIndices: [j - 1, j] as [number, number],
              bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
              variables: baseVars({ b, j }),
              lineNumber: LINE_SORT_STEP,
              activeLogicalLineId: "SORT_STEP",
              highlights: mkHighlights([], { swap: [j - 1, j] }),
            });
            j--;
          } else {
            break;
          }
        }
      }
    }

    frames.push({
      stepIndex: stepIndex++,
      arrayState: initialElements.map((e) => e.value),
      arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
      comparingIndices: null,
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: `Bucket ${b} đã được sắp xếp xong: [${bucket.map((e) => e.value).join(", ")}].`,
      algorithm: "bucket",
      bucketSortBuckets: buckets.map((bk) => bk.map((e) => e.value)),
      bucketSortBucketsWithIds: cloneBuckets(buckets),
      bucketStep: "sort",
      bucketSortActiveIdx: b,
      bucketSortComparingBucketIndices: null,
      bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
      variables: baseVars({ b }),
      lineNumber: LINE_SORT_STEP,
      activeLogicalLineId: "SORT_STEP",
      highlights: mkHighlights([]),
    });
  }

  frames.push({
    stepIndex: stepIndex++,
    arrayState: initialElements.map((e) => e.value),
    arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: "Ghép nối tất cả các Bucket đã sắp xếp trở lại để tạo thành mảng kết quả.",
    algorithm: "bucket",
    bucketSortBuckets: buckets.map((bk) => bk.map((e) => e.value)),
    bucketSortBucketsWithIds: cloneBuckets(buckets),
    bucketStep: "collect",
    bucketSortActiveIdx: null,
    bucketSortComparingBucketIndices: null,
    bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
    variables: baseVars({}),
    lineNumber: LINE_COLLECT_STEP,
    activeLogicalLineId: "COLLECT_STEP",
    highlights: mkHighlights([]),
  });

  let outputCount = 0;
  for (let b = 0; b < bucketCount; b++) {
    const bucket = buckets[b];

    if (bucket.length > 0) {
      frames.push({
        stepIndex: stepIndex++,
        arrayState: initialElements.map((e) => e.value),
        arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
        comparingIndices: null,
        pivotIndex: null,
        swappedIndices: null,
        sortedIndices: [],
        description: `Bắt đầu thu thập các phần tử từ Bucket ${b}.`,
        algorithm: "bucket",
        bucketSortBuckets: buckets.map((bk) => bk.map((e) => e.value)),
        bucketSortBucketsWithIds: cloneBuckets(buckets),
        bucketStep: "collect",
        bucketSortActiveIdx: b,
        bucketSortComparingBucketIndices: null,
        bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
        variables: baseVars({ b, outputCount }),
        lineNumber: LINE_COLLECT_STEP,
        activeLogicalLineId: "COLLECT_STEP",
        highlights: mkHighlights([], { active: [b] }),
      });
    }

    while (bucket.length > 0) {
      const elem = bucket.shift()!;

      outputArrayWithIds[outputCount] = elem;

      frames.push({
        stepIndex: stepIndex++,
        arrayState: mergedArrayState().arrayState,
        arrayStateWithIds: mergedArrayState().arrayStateWithIds,
        comparingIndices: [outputCount, outputCount] as [number, number],
        pivotIndex: null,
        swappedIndices: null,
        sortedIndices: Array.from({ length: outputCount + 1 }, (_, k) => k),
        description: `Đưa phần tử ${elem.value} từ Bucket ${b} vào vị trí thứ ${outputCount} của mảng kết quả.`,
        algorithm: "bucket",
        bucketSortBuckets: buckets.map((bk) => bk.map((e) => e.value)),
        bucketSortBucketsWithIds: cloneBuckets(buckets),
        bucketStep: "collect",
        bucketSortActiveIdx: b,
        bucketSortComparingBucketIndices: null,
        bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
        variables: baseVars({ b, outputCount }),
        lineNumber: LINE_COLLECT_STEP,
        activeLogicalLineId: "COLLECT_STEP",
        highlights: mkHighlights(Array.from({ length: outputCount + 1 }, (_, k) => k), { compare: [outputCount] }),
      });

      outputCount++;
    }
  }

  frames.push({
    stepIndex: stepIndex++,
    arrayState: outputArrayWithIds.map((e) => e!.value),
    arrayStateWithIds: outputArrayWithIds.map((e) => ({ id: e!.id, value: e!.value })),
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    description: "Giải thuật Bucket Sort hoàn tất! Mảng đã được sắp xếp tăng dần hoàn chỉnh.",
    algorithm: "bucket",
    bucketSortBuckets: Array.from({ length: bucketCount }, () => []),
    bucketSortBucketsWithIds: Array.from({ length: bucketCount }, () => []),
    bucketStep: "collect",
    bucketSortActiveIdx: null,
    bucketSortComparingBucketIndices: null,
    bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
    variables: baseVars({}),
    lineNumber: LINE_FUNC_DECL,
    activeLogicalLineId: "FUNC_DECL",
    highlights: mkHighlights(Array.from({ length: n }, (_, i) => i)),
  });

  // Keep source identity and dynamic ranges available to every visualizer frame.
  const rangeLabels = Array.from({ length: bucketCount }, (_, b) => rangeLabel(b));
  for (const frame of frames) {
    frame.inputArrayWithIds = initialElements.map((element) => ({ ...element }));
    frame.bucketRangeLabels = [...rangeLabels];
  }

  return frames;
}
