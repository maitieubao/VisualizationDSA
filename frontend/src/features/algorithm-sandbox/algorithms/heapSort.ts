import type { SortFrame } from '../types/sorting.types';

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
      algorithm: 'heap',
      heapSize,
      variables: vars,
    });
  }

  function heapify(heapSize: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < heapSize) {
      comparisons++;
      emit(`So sánh node[${largest}]=${arr[largest]} với left[${left}]=${arr[left]}`, [largest, left], i, null, heapSize, { heapSize, i, largest, swaps, comparisons });
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < heapSize) {
      comparisons++;
      emit(`So sánh node[${largest}]=${arr[largest]} với right[${right}]=${arr[right]}`, [largest, right], i, null, heapSize, { heapSize, i, largest, swaps, comparisons });
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      swaps++;
      emit(`Hoán vị node[${i}] ↔ node[${largest}]`, null, i, [i, largest], heapSize, { heapSize, i, largest, swaps, comparisons });
      heapify(heapSize, largest);
    }
  }

  emit('Xây dựng Max-Heap ban đầu', null, null, null, n, { heapSize: n, i: '-', largest: '-', swaps, comparisons });
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  if (n > 0) {
    emit(`Max-Heap hoàn thành! Root = ${arr[0]}`, null, 0, null, n, { heapSize: n, i: '-', largest: '-', swaps, comparisons });
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sortedIndices.push(i);
    swaps++;
    emit(`Đưa phần tử lớn nhất ${arr[i]} về vị trí [${i}]`, null, null, [0, i], i, { heapSize: i, i, largest: '-', swaps, comparisons });
    heapify(i, 0);
  }

  if (n > 0) sortedIndices.push(0);
  emit('✅ Heap Sort hoàn thành!', null, null, null, 0, { heapSize: 0, i: '-', largest: '-', swaps, comparisons });

  return frames;
}
