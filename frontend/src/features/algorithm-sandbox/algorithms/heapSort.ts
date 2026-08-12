import type { SortFrame, SortHighlights } from '../types/sorting.types';

// CC-009: ánh xạ bước thuật toán → dòng vật lý + logicalId (giả định khối mã HeapSort
// được nạp vào Monaco: line 1 = hàm, line 3 = build heap, line 4 = so sánh heapify,
// line 5 = hoán vị node, line 7 = trích xuất max)
const LINE_FUNC_DECL = 1;
const LINE_BUILD_HEAP_STEP = 3;
const LINE_HEAPIFY_COMPARE_STEP = 4;
const LINE_SWAP_STEP = 5;
const LINE_EXTRACT_STEP = 7;

function mkHighlights(
  sorted: number[],
  extras: Partial<SortHighlights> = {}
): SortHighlights {
  return { compare: [], swap: [], sorted: [...sorted], ...extras };
}

export function generateHeapSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const n = arr.length;
  const sortedIndices: number[] = [];
  let step = 0;
  let swaps = 0;
  let comparisons = 0;

  function emit(
    desc: string,
    comp: [number, number] | null,
    pivot: number | null,
    swap: [number, number] | null,
    heapSize: number,
    vars: Record<string, string | number>,
    lineNumber: number,
    activeLogicalLineId: string,
    highlightExtras: Partial<SortHighlights> = {}
  ) {
    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: comp,
      pivotIndex: pivot,
      swappedIndices: swap,
      sortedIndices: [...sortedIndices],
      description: desc,
      algorithm: 'heap',
      heapSize,
      variables: vars,
      lineNumber,
      activeLogicalLineId,
      highlights: mkHighlights(sortedIndices, highlightExtras),
    });
  }

  function heapify(heapSize: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < heapSize) {
      comparisons++;
      emit(`So sánh node[${largest}]=${arr[largest]} với left[${left}]=${arr[left]}`, [largest, left], i, null, heapSize, { heapSize, i, largest, swaps, comparisons }, LINE_HEAPIFY_COMPARE_STEP, 'HEAPIFY_COMPARE_STEP', { compare: [largest, left], active: [i] });
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < heapSize) {
      comparisons++;
      emit(`So sánh node[${largest}]=${arr[largest]} với right[${right}]=${arr[right]}`, [largest, right], i, null, heapSize, { heapSize, i, largest, swaps, comparisons }, LINE_HEAPIFY_COMPARE_STEP, 'HEAPIFY_COMPARE_STEP', { compare: [largest, right], active: [i] });
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      swaps++;
      emit(`Hoán vị node[${i}] ↔ node[${largest}]`, null, i, [i, largest], heapSize, { heapSize, i, largest, swaps, comparisons }, LINE_SWAP_STEP, 'SWAP_STEP', { swap: [i, largest], active: [i] });
      heapify(heapSize, largest);
    }
  }

  emit('Xây dựng Max-Heap ban đầu', null, null, null, n, { heapSize: n, i: '-', largest: '-', swaps, comparisons }, LINE_BUILD_HEAP_STEP, 'BUILD_HEAP_STEP');
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  if (n > 0) {
    emit(`Max-Heap hoàn thành! Root = ${arr[0]}`, null, 0, null, n, { heapSize: n, i: '-', largest: '-', swaps, comparisons }, LINE_BUILD_HEAP_STEP, 'BUILD_HEAP_STEP', { pivot: 0 });
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sortedIndices.push(i);
    swaps++;
    emit(`Đưa phần tử lớn nhất ${arr[i]} về vị trí [${i}]`, null, null, [0, i], i, { heapSize: i, i, largest: '-', swaps, comparisons }, LINE_EXTRACT_STEP, 'EXTRACT_STEP', { swap: [0, i] });
    heapify(i, 0);
  }

  if (n > 0) sortedIndices.push(0);
  // SV-019: frame hoàn thành heapSize = n (heap rỗng, mảng đã yên vị) — tránh heapSize=0
  // làm composable xét nhầm phase 'SORT' trên frame cuối
  emit('✅ Heap Sort hoàn thành!', null, null, null, n, { heapSize: n, i: '-', largest: '-', swaps, comparisons }, LINE_FUNC_DECL, 'FUNC_DECL');

  return frames;
}
