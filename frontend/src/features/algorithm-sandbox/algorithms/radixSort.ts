import type { SortFrame, SortHighlights } from '../types/sorting.types';

interface TrackedElement {
  id: number;
  value: number;
}

// CC-009: ánh xạ bước thuật toán → dòng vật lý + logicalId (giả định khối mã RadixSort
// được nạp vào Monaco: line 1 = hàm, line 3 = phân phối vào bucket, line 5 = thu hồi)
const LINE_FUNC_DECL = 1;
const LINE_DISTRIBUTE_STEP = 3;
const LINE_COLLECT_STEP = 5;

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

export function generateRadixSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  let step = 0;

  const arr: TrackedElement[] = inputArray.map((val, idx) => ({ id: idx, value: val }));

  // Dịch chuyển toàn bộ giá trị về >= 0 để chữ số luôn hợp lệ [0..9]
  const { min: minVal, max: maxVal } = minMax(inputArray);
  const offset = minVal < 0 ? -minVal : 0;
  const shiftedMax = maxVal + offset;

  let trackedBuckets: TrackedElement[][] = Array.from({ length: 10 }, () => []);

  function emit(
    desc: string,
    arrSnap: TrackedElement[],
    comp: number | null,
    exp: number,
    radixStep: 'distribute' | 'collect',
    vars: Record<string, string | number>,
    lineNumber: number,
    activeLogicalLineId: string,
    highlightExtras: Partial<SortHighlights> = {},
    sortedIndices: number[] = []
  ) {
    frames.push({
      stepIndex: step++,
      arrayState: arrSnap.map(e => e.value),
      arrayStateWithIds: arrSnap.map(e => ({ id: e.id, value: e.value })),
      comparingIndices: comp !== null ? [comp, comp] : null,
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices,
      description: desc,
      algorithm: 'radix',
      radixBuckets: trackedBuckets.map(b => b.map(e => e.value)),
      radixBucketsWithIds: trackedBuckets.map(b => b.map(e => ({ id: e.id, value: e.value }))),
      activeDigitPlace: exp,
      radixStep,
      variables: vars,
      lineNumber,
      activeLogicalLineId,
      highlights: mkHighlights(sortedIndices, highlightExtras),
    });
  }

  emit('Khởi tạo Radix Sort — sắp xếp theo chữ số (LSD)', [...arr], null, 1, 'distribute', { exp: 1, i: '-', digit: '-', d: '-', maxVal }, LINE_FUNC_DECL, 'FUNC_DECL');

  for (let exp = 1; Math.floor(shiftedMax / exp) > 0; exp *= 10) {
    trackedBuckets = Array.from({ length: 10 }, () => []);

    const arrBeforeDistribute = [...arr];
    const digitOf = (val: number): number => Math.floor((val + offset) / exp) % 10;

    for (let i = 0; i < arr.length; i++) {
      const elem = arr[i];
      const digit = digitOf(elem.value);
      trackedBuckets[digit].push({ id: elem.id, value: elem.value });

      emit(
        `Đưa ${elem.value} vào Hộp [${digit}] (chữ số hàng ${exp})`,
        arrBeforeDistribute,
        i, exp, 'distribute',
        { exp, i, digit, d: '-', maxVal },
        LINE_DISTRIBUTE_STEP, 'DISTRIBUTE_STEP',
        { active: [i] }
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
          { exp, i: collected.length - 1, digit: '-', d, maxVal },
          LINE_COLLECT_STEP, 'COLLECT_STEP',
          { active: [collected.length - 1] }
        );
      }
    }

    for (let i = 0; i < arr.length; i++) {
      arr[i] = collected[i];
    }
  }

  const finalSortedIndices = Array.from({ length: arr.length }, (_, i) => i);
  emit('✅ Radix Sort hoàn thành!', [...arr], null, 1, 'collect', { exp: '-', i: '-', digit: '-', d: '-', maxVal }, LINE_FUNC_DECL, 'FUNC_DECL', {}, finalSortedIndices);
  return frames;
}
