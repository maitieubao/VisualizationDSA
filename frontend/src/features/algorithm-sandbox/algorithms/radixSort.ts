import type { SortFrame } from '../types/sorting.types';

/** Each slot carries its value AND a stable id so Vue's transition-group
 *  can track the same element across frames without mis-assigning keys. */
interface TrackedElement {
  id: number;
  value: number;
}

export function generateRadixSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  let step = 0;

  // ── Bootstrap: assign stable IDs (0…n-1) once at the start ──────────────
  const arr: TrackedElement[] = inputArray.map((val, idx) => ({ id: idx, value: val }));

  const maxVal = Math.max(...inputArray, 1);

  // Typed bucket state: 10 queues, each holds tracked elements
  let trackedBuckets: TrackedElement[][] = Array.from({ length: 10 }, () => []);

  /** Snapshot helper — deep-clones the provided arr & current buckets state */
  function emit(
    desc: string,
    arrSnap: TrackedElement[],
    comp: number | null,
    exp: number,
    radixStep: 'distribute' | 'collect'
  ) {
    frames.push({
      stepIndex: step++,
      arrayState: arrSnap.map(e => e.value),
      arrayStateWithIds: arrSnap.map(e => ({ id: e.id, value: e.value })),
      comparingIndices: comp !== null ? [comp, comp] : null,
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: desc,
      algorithm: 'radix',
      radixBuckets: trackedBuckets.map(b => b.map(e => e.value)),
      radixBucketsWithIds: trackedBuckets.map(b => b.map(e => ({ id: e.id, value: e.value }))),
      activeDigitPlace: exp,
      radixStep
    });
  }

  emit('Khởi tạo Radix Sort — sắp xếp theo chữ số', [...arr], null, 1, 'distribute');

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    // ── DISTRIBUTE phase ─────────────────────────────────────────────────────
    trackedBuckets = Array.from({ length: 10 }, () => []);

    // Snapshot of arr before distribute (current sorted state going into this pass)
    const arrBeforeDistribute = [...arr];

    for (let i = 0; i < arr.length; i++) {
      const elem = arr[i];
      const digit = Math.floor(elem.value / exp) % 10;
      trackedBuckets[digit].push({ id: elem.id, value: elem.value });
      // Array doesn't change during distribute — pass the same pre-distribute snapshot
      emit(
        `Đưa ${elem.value} vào Hộp [${digit}] (chữ số hàng ${exp})`,
        arrBeforeDistribute,
        i, exp, 'distribute'
      );
    }

    // ── COLLECT phase ────────────────────────────────────────────────────────
    // Build snapArr as: [collected_so_far] + [all_elements_still_in_buckets].
    // This guarantees each element ID appears exactly once in every frame.
    const collected: TrackedElement[] = [];

    for (let d = 0; d < 10; d++) {
      while (trackedBuckets[d].length > 0) {
        const elem = trackedBuckets[d].shift()!; // FIFO — preserves stability
        collected.push(elem);
        // Gather every element still waiting in remaining buckets (d..9)
        const stillInBuckets: TrackedElement[] = [];
        for (let dd = d; dd < 10; dd++) {
          stillInBuckets.push(...trackedBuckets[dd]);
        }
        const snapArr = [...collected, ...stillInBuckets];
        emit(
          `Thu hồi ${elem.value} từ Hộp [${d}] → mảng[${collected.length - 1}]`,
          snapArr,
          collected.length - 1, exp, 'collect'
        );
      }
    }

    // Commit the collected order back to arr for next pass
    for (let i = 0; i < arr.length; i++) {
      arr[i] = collected[i];
    }
  }

  emit('✅ Radix Sort hoàn thành!', [...arr], null, 1, 'collect');
  return frames;
}
