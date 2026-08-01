import type { SortFrame } from "../types/sorting.types";

interface TrackedElement {
  id: number;
  value: number;
}

export function generateBucketSortFrames(arr: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  let stepIndex = 0;

  const n = arr.length;
  const initialElements: TrackedElement[] = arr.map((val, idx) => ({
    id: idx,
    value: val,
  }));

  const bucketCount = 4;
  const buckets: TrackedElement[][] = Array.from({ length: bucketCount }, () => []);

  const getBucketIndex = (val: number): number => {
    if (val < 25) return 0;
    if (val < 50) return 1;
    if (val < 75) return 2;
    return 3;
  };

  const cloneBuckets = (bks: TrackedElement[][]): TrackedElement[][] => {
    return bks.map((b) => b.map((e) => ({ ...e })));
  };

  const cloneOutput = (out: (TrackedElement | null)[]): ({ id: number; value: number } | null)[] => {
    return out.map((e) => (e ? { id: e.id, value: e.value } : null));
  };

  const outputArrayWithIds: (TrackedElement | null)[] = Array.from({ length: n }, () => null);

  const baseVars = (overrides: Record<string, string | number>): Record<string, string | number> => ({
    i: "-", bucketIdx: "-", b: "-", j: "-", outputCount: "-", ...overrides,
  });

  frames.push({
    stepIndex: ++stepIndex,
    arrayState: initialElements.map((e) => e.value),
    arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: "Khởi tạo Bucket Sort. Chúng ta chia phạm vi giá trị thành 4 Bucket: [0-25), [25-50), [50-75), [75-100].",
    algorithm: "bucket",
    bucketSortBuckets: buckets.map((b) => b.map((e) => e.value)),
    bucketSortBucketsWithIds: cloneBuckets(buckets),
    bucketStep: "distribute",
    bucketSortActiveIdx: null,
    bucketSortComparingBucketIndices: null,
    bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
    variables: baseVars({}),
  });

  for (let i = 0; i < initialElements.length; i++) {
    const elem = initialElements[i];
    const bucketIdx = getBucketIndex(elem.value);

    frames.push({
      stepIndex: ++stepIndex,
      arrayState: initialElements.map((e) => e.value),
      arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
      comparingIndices: [i, i] as [number, number],
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: `Đang phân loại phần tử A[${i}] = ${elem.value} thuộc phạm vi của Bucket ${bucketIdx}.`,
      algorithm: "bucket",
      bucketSortBuckets: buckets.map((b) => b.map((e) => e.value)),
      bucketSortBucketsWithIds: cloneBuckets(buckets),
      bucketStep: "distribute",
      bucketSortActiveIdx: bucketIdx,
      bucketSortComparingBucketIndices: null,
      bucketSortOutputWithIds: cloneOutput(outputArrayWithIds),
      variables: baseVars({ i, bucketIdx }),
    });

    buckets[bucketIdx].push({ ...elem });

    frames.push({
      stepIndex: ++stepIndex,
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
    });
  }

  for (let b = 0; b < bucketCount; b++) {
    const bucket = buckets[b];
    if (bucket.length === 0) continue;

    frames.push({
      stepIndex: ++stepIndex,
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
    });

    if (bucket.length > 1) {
      for (let i = 1; i < bucket.length; i++) {
        let j = i;
        while (j > 0) {
          frames.push({
            stepIndex: ++stepIndex,
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
          });

          if (bucket[j - 1].value > bucket[j].value) {
            const temp = bucket[j];
            bucket[j] = bucket[j - 1];
            bucket[j - 1] = temp;

            frames.push({
              stepIndex: ++stepIndex,
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
            });
            j--;
          } else {
            break;
          }
        }
      }
    }

    frames.push({
      stepIndex: ++stepIndex,
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
    });
  }

  frames.push({
    stepIndex: ++stepIndex,
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
  });

  let outputCount = 0;
  for (let b = 0; b < bucketCount; b++) {
    const bucket = buckets[b];

    if (bucket.length > 0) {
      frames.push({
        stepIndex: ++stepIndex,
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
      });
    }

    while (bucket.length > 0) {
      const elem = bucket.shift()!;

      outputArrayWithIds[outputCount] = elem;

      frames.push({
        stepIndex: ++stepIndex,
        arrayState: initialElements.map((e) => e.value),
        arrayStateWithIds: initialElements.map((e) => ({ id: e.id, value: e.value })),
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
      });

      outputCount++;
    }
  }

  frames.push({
    stepIndex: ++stepIndex,
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
    variables: baseVars({ outputCount }),
  });

  return frames;
}
