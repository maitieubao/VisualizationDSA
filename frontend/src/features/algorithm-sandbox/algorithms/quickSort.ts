import type { SortFrame, Partition } from '../types/sorting.types';

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
    vars: Record<string, string | number>
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
    emit(`Chọn Pivot = ${pivot} tại [${high}]`, null, high, null, { low, high, i: '-', j: '-', pivot, comparisons, swaps });

    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      emit(`So sánh arr[${j}]=${arr[j]} với Pivot=${pivot}`, [j, high], high, null, { low, high, i, j, pivot, comparisons, swaps });
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          emit(`arr[${j}] <= Pivot → Hoán vị [${i}]↔[${j}]`, null, high, [i, j], { low, high, i, j, pivot, comparisons, swaps });
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    const pIdx = i + 1;
    sortedIndices.push(pIdx);
    splitPartition(low, high, pIdx);
    emit(`Đặt Pivot về đúng vị trí [${pIdx}]`, null, pIdx, [pIdx, high], { low, high, i, j: '-', pivot, comparisons, swaps });
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

  emit('Khởi tạo Quick Sort — phân hoạch chia để trị', null, null, null, { low: 0, high: arr.length - 1, i: '-', j: '-', pivot: '-', comparisons, swaps });
  quickSortIterative(0, arr.length - 1);
  emit('✅ Quick Sort hoàn thành!', null, null, null, { low: '-', high: '-', i: '-', j: '-', pivot: '-', comparisons, swaps });

  return frames;
}
