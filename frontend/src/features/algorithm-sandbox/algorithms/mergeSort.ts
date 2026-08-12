import type { SortFrame, SubArray, SortHighlights } from '../types/sorting.types';

interface TrackedElement {
  id: number;
  value: number;
}

// CC-009: ánh xạ bước thuật toán → dòng vật lý + logicalId (giả định khối mã MergeSort
// được nạp vào Monaco: line 1 = hàm, line 3 = chia, line 4 = trường cơ sở,
// line 6 = so sánh L/R, line 7 = ghi đè arr[k])
const LINE_FUNC_DECL = 1;
const LINE_DIVIDE_STEP = 3;
const LINE_BASE_CASE_STEP = 4;
const LINE_MERGE_COMPARE_STEP = 6;
const LINE_MERGE_WRITE_STEP = 7;

function mkHighlights(
  sorted: number[],
  extras: Partial<SortHighlights> = {}
): SortHighlights {
  return { compare: [], swap: [], sorted: [...sorted], ...extras };
}

export function generateMergeSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr: TrackedElement[] = inputArray.map((val, idx) => ({ id: idx, value: val }));
  // SV-021: Set thay mảng — sortedIndices.includes O(n) trong vòng lặp bị loại bỏ
  const sortedSet: Set<number> = new Set();
  let step = 0;
  let comparisons = 0;
  let writes = 0;

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
    actLvl: number,
    vars: Record<string, string | number>,
    lineNumber: number,
    activeLogicalLineId: string,
    highlightExtras: Partial<SortHighlights> = {}
  ) {
    frames.push({
      stepIndex: step++,
      arrayState: arr.map(e => e.value),
      arrayStateWithIds: arr.map(e => ({ id: e.id, value: e.value })),
      comparingIndices: comp,
      pivotIndex: null,
      swappedIndices: swap,
      sortedIndices: [...sortedSet],
      description: desc,
      algorithm: 'merge',
      subArrays: tree.map(s => ({
        ...s,
        isActive: s.level === actLvl && s.start === actL && s.end === actR
      })),
      variables: vars,
      lineNumber,
      activeLogicalLineId,
      highlights: mkHighlights([...sortedSet], highlightExtras),
    });
  }

  function merge(left: number, mid: number, right: number, lvl: number): void {
    // Bản sao có identity: mỗi phép ghi arr[k] mang theo id của phần tử nguồn
    // → identity đi theo đúng phần tử qua mọi frame, kể cả khi giá trị trùng nhau
    const leftArr: TrackedElement[] = arr.slice(left, mid + 1).map(e => ({ id: e.id, value: e.value }));
    const rightArr: TrackedElement[] = arr.slice(mid + 1, right + 1).map(e => ({ id: e.id, value: e.value }));
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      emit(`So sánh L[${i}]=${leftArr[i].value} với R[${j}]=${rightArr[j].value}`, [left + i, mid + 1 + j], null, left, right, lvl, { left, mid, right, i, j, k, lvl, comparisons, writes }, LINE_MERGE_COMPARE_STEP, 'MERGE_COMPARE_STEP', { compare: [left + i, mid + 1 + j] });
      if (leftArr[i].value <= rightArr[j].value) {
        arr[k] = { id: leftArr[i].id, value: leftArr[i].value };
        i++;
      } else {
        arr[k] = { id: rightArr[j].id, value: rightArr[j].value };
        j++;
      }
      writes++;
      emit(`Ghi đè arr[${k}] = ${arr[k].value}`, null, [k, k], left, right, lvl, { left, mid, right, i, j, k, lvl, comparisons, writes }, LINE_MERGE_WRITE_STEP, 'MERGE_WRITE_STEP', { assign: [k] });
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = { id: leftArr[i].id, value: leftArr[i].value };
      writes++;
      emit(`Sao chép phần thừa L[${i}] → arr[${k}]`, null, [k, k], left, right, lvl, { left, mid, right, i, j, k, lvl, comparisons, writes }, LINE_MERGE_WRITE_STEP, 'MERGE_WRITE_STEP', { assign: [k] });
      i++; k++;
    }
    while (j < rightArr.length) {
      arr[k] = { id: rightArr[j].id, value: rightArr[j].value };
      writes++;
      emit(`Sao chép phần thừa R[${j}] → arr[${k}]`, null, [k, k], left, right, lvl, { left, mid, right, i, j, k, lvl, comparisons, writes }, LINE_MERGE_WRITE_STEP, 'MERGE_WRITE_STEP', { assign: [k] });
      j++; k++;
    }

    // Chỉ đánh dấu "đã yên vị" khi segment là phép gộp cuối cùng phủ toàn bộ mảng
    if (left === 0 && right === arr.length - 1) {
      for (let x = left; x <= right; x++) {
        sortedSet.add(x);
      }
    }
  }

  function mergeSort(left: number, right: number, lvl: number): void {
    if (left >= right) {
      emit(`Đạt trường cơ sở: mảng con [${left}] gồm 1 phần tử`, null, null, left, right, lvl, { left, mid: left, right, i: '-', j: '-', k: '-', lvl, comparisons, writes }, LINE_BASE_CASE_STEP, 'BASE_CASE_STEP');
      return;
    }
    const mid = Math.floor((left + right) / 2);
    emit(`Chia [${left}..${right}] tại chỉ số [${mid}]`, null, null, left, right, lvl, { left, mid, right, i: '-', j: '-', k: '-', lvl, comparisons, writes }, LINE_DIVIDE_STEP, 'DIVIDE_STEP');
    mergeSort(left, mid, lvl + 1);
    mergeSort(mid + 1, right, lvl + 1);
    merge(left, mid, right, lvl);
  }

  emit('Khởi tạo Merge Sort — chia đôi mảng rồi gộp lại', null, null, 0, arr.length - 1, 0, { left: 0, mid: '-', right: arr.length - 1, i: '-', j: '-', k: '-', lvl: 0, comparisons, writes }, LINE_FUNC_DECL, 'FUNC_DECL');
  mergeSort(0, arr.length - 1, 0);

  // SV-004: mảng 1 phần tử không bao giờ đi qua merge() → tự đánh dấu yên vị
  if (arr.length === 1) {
    sortedSet.add(0);
  }

  emit('✅ Merge Sort hoàn thành!', null, null, 0, arr.length - 1, 0, { left: '-', mid: '-', right: '-', i: '-', j: '-', k: '-', lvl: '-', comparisons, writes }, LINE_FUNC_DECL, 'FUNC_DECL');

  return frames;
}
