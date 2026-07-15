import type { SortFrame, Partition } from '../types/sorting.types';

export function generateQuickSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const sortedIndices: number[] = [];
  let step = 0;

  let partitionsList: Partition[] = [
    { low: 0, high: arr.length - 1, isActive: true, isSorted: false }
  ];

  function emit(
    desc: string,
    comp: [number, number] | null,
    pivot: number | null,
    swap: [number, number] | null
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
      partitions: partitionsList.map(p => ({ ...p }))
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
    emit(`Chọn Pivot = ${pivot} tại [${high}]`, null, high, null);

    let i = low - 1;
    for (let j = low; j < high; j++) {
      emit(`So sánh arr[${j}]=${arr[j]} với Pivot=${pivot}`, [j, high], high, null);
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          emit(`arr[${j}] <= Pivot → Hoán vị [${i}]↔[${j}]`, null, high, [i, j]);
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const pIdx = i + 1;
    sortedIndices.push(pIdx);
    splitPartition(low, high, pIdx);
    emit(`Đặt Pivot về đúng vị trí [${pIdx}]`, null, pIdx, [pIdx, high]);
    return pIdx;
  }

  function quickSort(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      if (!sortedIndices.includes(low)) {
        sortedIndices.push(low);
        partitionsList = partitionsList.map(p => 
          (p.low === low && p.high === low) ? { ...p, isSorted: true, isActive: false } : p
        );
      }
    }
  }

  emit('Khởi tạo Quick Sort — phân hoạch chia để trị', null, null, null);
  quickSort(0, arr.length - 1);
  emit('✅ Quick Sort hoàn thành!', null, null, null);

  return frames;
}
