import type { SortFrame } from '../types/sorting.types';

export function generateHeapSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const n = arr.length;
  const sortedIndices: number[] = [];
  let step = 0;

  function emit(
    desc: string,
    comp: [number, number] | null,
    pivot: number | null,
    swap: [number, number] | null,
    heapSize: number
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
      heapSize
    });
  }

  function heapify(heapSize: number, i: number): void {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < heapSize) {
      emit(`So sánh node[${largest}]=${arr[largest]} với left[${left}]=${arr[left]}`, [largest, left], i, null, heapSize);
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < heapSize) {
      emit(`So sánh node[${largest}]=${arr[largest]} với right[${right}]=${arr[right]}`, [largest, right], i, null, heapSize);
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      emit(`Hoán vị node[${i}] ↔ node[${largest}]`, null, i, [i, largest], heapSize);
      heapify(heapSize, largest);
    }
  }

  emit('Xây dựng Max-Heap ban đầu', null, null, null, n);
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  emit(`Max-Heap hoàn thành! Root = ${arr[0]}`, null, 0, null, n);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sortedIndices.push(i);
    emit(`Đưa phần tử lớn nhất ${arr[i]} về vị trí [${i}]`, null, null, [0, i], i);
    heapify(i, 0);
  }

  sortedIndices.push(0);
  emit('✅ Heap Sort hoàn thành!', null, null, null, 0);

  return frames;
}
