import type { SortFrame, Partition, SortHighlights } from '../types/sorting.types';

// CC-009: ánh xạ bước thuật toán → dòng vật lý + logicalId (giả định khối mã Lomuto
// được nạp vào Monaco: line 1 = hàm, line 3 = chọn pivot, line 5 = so sánh,
// line 6 = hoán vị, line 8 = đặt pivot về vị trí)
const LINE_FUNC_DECL = 1;
const LINE_PARTITION_STEP = 3;
const LINE_COMPARE_STEP = 5;
const LINE_SWAP_STEP = 6;
const LINE_ASSIGN_STEP = 8;

function mkHighlights(
  sorted: number[],
  extras: Partial<SortHighlights>
): SortHighlights {
  return { compare: [], swap: [], sorted: [...sorted], ...extras };
}

export function generateQuickSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const sortedIndices: number[] = [];
  let step = 0;
  let comparisons = 0;
  let swaps = 0;

  let partitionsList: Partition[] = [
    { low: 0, high: arr.length - 1, isActive: true, isSorted: false }
  ];

  function emit(
    desc: string,
    comp: [number, number] | null,
    pivot: number | null,
    swap: [number, number] | null,
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
      algorithm: 'quick',
      partitions: partitionsList.map(p => ({ ...p })),
      variables: vars,
      lineNumber,
      activeLogicalLineId,
      highlights: mkHighlights(sortedIndices, highlightExtras),
    });
  }

  function splitPartition(low: number, high: number, p: number) {
    partitionsList = partitionsList.filter(x => !(x.low === low && x.high === high));
    partitionsList.push({ low: p, high: p, isActive: false, isSorted: true });
    if (low < p) {
      partitionsList.push({ low, high: p - 1, isActive: true, isSorted: false });
    }
    if (p < high) {
      partitionsList.push({ low: p + 1, high, isActive: true, isSorted: false });
    }
    partitionsList.sort((a, b) => a.low - b.low);
  }

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    partitionsList.forEach(p => {
      p.isActive = (p.low === low && p.high === high);
    });
    emit(`Chọn Pivot = ${pivot} tại [${high}]`, null, high, null, { low, high, i: '-', j: '-', pivot, comparisons, swaps }, LINE_PARTITION_STEP, 'PARTITION_STEP', { pivot: high });

    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      emit(`So sánh arr[${j}]=${arr[j]} với Pivot=${pivot}`, [j, high], high, null, { low, high, i, j, pivot, comparisons, swaps }, LINE_COMPARE_STEP, 'COMPARE_STEP', { compare: [j, high], pivot: high });
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          emit(`arr[${j}] <= Pivot → Hoán vị [${i}]↔[${j}]`, null, high, [i, j], { low, high, i, j, pivot, comparisons, swaps }, LINE_SWAP_STEP, 'SWAP_STEP', { swap: [i, j], pivot: high });
        }
      }
    }

    const pIdx = i + 1;
    sortedIndices.push(pIdx);
    splitPartition(low, high, pIdx);

    if (pIdx === high) {
      // SV-025: pivot đã đứng đúng vị trí — bỏ self-swap [high,high] vô nghĩa (không emit, không tăng swaps)
      emit(`Đặt Pivot về đúng vị trí [${pIdx}]`, null, pIdx, null, { low, high, i, j: '-', pivot, comparisons, swaps }, LINE_ASSIGN_STEP, 'ASSIGN_STEP', { pivot: pIdx });
    } else {
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swaps++;
      emit(`Đặt Pivot về đúng vị trí [${pIdx}]`, null, pIdx, [pIdx, high], { low, high, i, j: '-', pivot, comparisons, swaps }, LINE_ASSIGN_STEP, 'ASSIGN_STEP', { swap: [pIdx, high], pivot: pIdx });
    }
    return pIdx;
  }

  // Dùng stack tường minh thay cho đệ quy — không bao giờ tràn stack
  // (Lomuto trên mảng đã sắp xếp có độ sâu = n, dễ StackOverflow nếu đệ quy thường)
  function quickSortIterative(low: number, high: number): void {
    const stack: Array<[number, number]> = [[low, high]];

    while (stack.length > 0) {
      const [lo, hi] = stack.pop()!;
      if (lo > hi) continue;

      if (lo === hi) {
        if (!sortedIndices.includes(lo)) {
          sortedIndices.push(lo);
          partitionsList = partitionsList.map(p =>
            (p.low === lo && p.high === lo) ? { ...p, isSorted: true, isActive: false } : p
          );
        }
        continue;
      }

      const pi = partition(lo, hi);
      // Đẩy phần phải trước, phần trái sau để giữ đúng thứ tự frame như đệ quy cũ
      if (pi + 1 <= hi) stack.push([pi + 1, hi]);
      if (lo <= pi - 1) stack.push([lo, pi - 1]);
    }
  }

  emit('Khởi tạo Quick Sort — phân hoạch chia để trị', null, null, null, { low: 0, high: arr.length - 1, i: '-', j: '-', pivot: '-', comparisons, swaps }, LINE_FUNC_DECL, 'FUNC_DECL');
  quickSortIterative(0, arr.length - 1);
  emit('✅ Quick Sort hoàn thành!', null, null, null, { low: '-', high: '-', i: '-', j: '-', pivot: '-', comparisons, swaps }, LINE_FUNC_DECL, 'FUNC_DECL');

  return frames;
}
