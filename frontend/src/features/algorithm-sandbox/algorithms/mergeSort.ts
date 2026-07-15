import type { SortFrame, SubArray } from '../types/sorting.types';

export function generateMergeSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const sortedIndices: number[] = [];
  let step = 0;

  const tree: SubArray[] = [];
  function buildTree(l: number, r: number, lvl: number) {
    tree.push({ start: l, end: r, level: lvl, isActive: false });
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    buildTree(l, m, lvl + 1);
    buildTree(m + 1, r, lvl + 1);
  }
  buildTree(0, arr.length - 1, 0);

  function emit(
    desc: string,
    comp: [number, number] | null,
    swap: [number, number] | null,
    actL: number,
    actR: number,
    actLvl: number
  ) {
    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: comp,
      pivotIndex: null,
      swappedIndices: swap,
      sortedIndices: [...sortedIndices],
      description: desc,
      algorithm: 'merge',
      subArrays: tree.map(s => ({
        ...s,
        isActive: s.level === actLvl && s.start === actL && s.end === actR
      }))
    });
  }

  function merge(left: number, mid: number, right: number, lvl: number): void {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      emit(`So sánh L[${i}]=${leftArr[i]} với R[${j}]=${rightArr[j]}`, [left + i, mid + 1 + j], null, left, right, lvl);
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      emit(`Ghi đè arr[${k}] = ${arr[k]}`, null, [k, k], left, right, lvl);
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      emit(`Sao chép phần thừa L[${i}] → arr[${k}]`, null, [k, k], left, right, lvl);
      i++; k++;
    }
    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      emit(`Sao chép phần thừa R[${j}] → arr[${k}]`, null, [k, k], left, right, lvl);
      j++; k++;
    }

    for (let x = left; x <= right; x++) {
      if (!sortedIndices.includes(x)) sortedIndices.push(x);
    }
  }

  function mergeSort(left: number, right: number, lvl: number): void {
    if (left >= right) {
      emit(`Đạt trường cơ sở: mảng con [${left}] gồm 1 phần tử`, null, null, left, right, lvl);
      return;
    }
    const mid = Math.floor((left + right) / 2);
    emit(`Chia [${left}..${right}] tại chỉ số [${mid}]`, null, null, left, right, lvl);
    mergeSort(left, mid, lvl + 1);
    mergeSort(mid + 1, right, lvl + 1);
    merge(left, mid, right, lvl);
  }

  emit('Khởi tạo Merge Sort — chia đôi mảng rồi gộp lại', null, null, 0, arr.length - 1, 0);
  mergeSort(0, arr.length - 1, 0);
  emit('✅ Merge Sort hoàn thành!', null, null, 0, arr.length - 1, 0);

  return frames;
}
