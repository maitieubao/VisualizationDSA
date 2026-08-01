import type { SortFrame } from '@/features/core-learning/algorithm-sandbox/types/sorting.types';

interface TrackedElement {
  id: number;
  value: number;
}

export function generateRadixSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  let step = 0;

  const arr: TrackedElement[] = inputArray.map((val, idx) => ({ id: idx, value: val }));

  const maxVal = Math.max(...inputArray, 1);

  let trackedBuckets: TrackedElement[][] = Array.from({ length: 10 }, () => []);

  function emit(
    desc: string,
    arrSnap: TrackedElement[],
    comp: number | null,
    exp: number,
    radixStep: 'distribute' | 'collect',
    vars: Record<string, string | number>
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
      radixStep,
      variables: vars,
    });
  }

  emit('Khởi tạo Radix Sort — sắp xếp theo chữ số', [...arr], null, 1, 'distribute', { exp: 1, i: '-', digit: '-', d: '-', maxVal });

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    trackedBuckets = Array.from({ length: 10 }, () => []);

    const arrBeforeDistribute = [...arr];

    for (let i = 0; i < arr.length; i++) {
      const elem = arr[i];
      const digit = Math.floor(elem.value / exp) % 10;
      trackedBuckets[digit].push({ id: elem.id, value: elem.value });

      emit(
        `Đưa ${elem.value} vào Hộp [${digit}] (chữ số hàng ${exp})`,
        arrBeforeDistribute,
        i, exp, 'distribute',
        { exp, i, digit, d: '-', maxVal }
      );
    }

    const collected: TrackedElement[] = [];

    for (let d = 0; d < 10; d++) {
      while (trackedBuckets[d].length > 0) {
        const elem = trackedBuckets[d].shift()!;
        collected.push(elem);

        const stillInBuckets: TrackedElement[] = [];
        for (let dd = d; dd < 10; dd++) {
          stillInBuckets.push(...trackedBuckets[dd]);
        }
        const snapArr = [...collected, ...stillInBuckets];
        emit(
          `Thu hồi ${elem.value} từ Hộp [${d}] → mảng[${collected.length - 1}]`,
          snapArr,
          collected.length - 1, exp, 'collect',
          { exp, i: collected.length - 1, digit: '-', d, maxVal }
        );
      }
    }

    for (let i = 0; i < arr.length; i++) {
      arr[i] = collected[i];
    }
  }

  emit('✅ Radix Sort hoàn thành!', [...arr], null, 1, 'collect', { exp: '-', i: '-', digit: '-', d: '-', maxVal });
  return frames;
}
