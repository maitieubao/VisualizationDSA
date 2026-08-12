import type { SortFrame, SortHighlights } from '../types/sorting.types';

// CC-009: ánh xạ bước thuật toán → dòng vật lý + logicalId chuẩn
// (theo bubble-sort.pseudocode.ts, nhánh javascript: line 2 = const n, line 3 = for i, line 4 = for j,
//  line 5 = if arr[j] > arr[j+1], line 6 = swap)
const LINE_FUNC_DECL = 1;
const LINE_OUTER_LOOP = 3;
const LINE_COMPARE_STEP = 5;
const LINE_SWAP_STEP = 6;

function mkHighlights(
  sorted: number[],
  extras: Partial<SortHighlights> = {}
): SortHighlights {
  return { compare: [], swap: [], sorted: [...sorted], ...extras };
}

export function generateBubbleSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const n = arr.length;
  const sortedIndices: number[] = [];
  let step = 0;
  let comparisons = 0;
  let swaps = 0;

  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: 'Khởi tạo mảng dữ liệu đầu vào',
    algorithm: 'bubble',
    variables: { i: '-', j: '-', comparisons: 0, swaps: 0 },
    lineNumber: LINE_FUNC_DECL,
    activeLogicalLineId: 'FUNC_DECL',
    highlights: mkHighlights([]),
  });

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: [j, j + 1],
        pivotIndex: null,
        swappedIndices: null,
        sortedIndices: [...sortedIndices],
        description: `So sánh arr[${j}]=${arr[j]} và arr[${j + 1}]=${arr[j + 1]}`,
        algorithm: 'bubble',
        variables: { i, j, comparisons, swaps },
        lineNumber: LINE_COMPARE_STEP,
        activeLogicalLineId: 'COMPARE_STEP',
        highlights: mkHighlights(sortedIndices, { compare: [j, j + 1] }),
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        swappedInPass = true;
        frames.push({
          stepIndex: step++,
          arrayState: [...arr],
          comparingIndices: null,
          pivotIndex: null,
          swappedIndices: [j, j + 1],
          sortedIndices: [...sortedIndices],
          description: `Hoán vị: arr[${j}]↔arr[${j + 1}] → [${arr[j]}, ${arr[j + 1]}]`,
          algorithm: 'bubble',
          variables: { i, j, comparisons, swaps },
          lineNumber: LINE_SWAP_STEP,
          activeLogicalLineId: 'SWAP_STEP',
          highlights: mkHighlights(sortedIndices, { swap: [j, j + 1] }),
        });
      }
    }

    sortedIndices.push(n - i - 1);
    frames.push({
      stepIndex: step++,
      arrayState: [...arr],
      comparingIndices: null,
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [...sortedIndices],
      description: `arr[${n - i - 1}] = ${arr[n - i - 1]} đã yên vị ✓`,
      algorithm: 'bubble',
      variables: { i, j: '-', comparisons, swaps },
      lineNumber: LINE_OUTER_LOOP,
      activeLogicalLineId: 'OUTER_LOOP',
      highlights: mkHighlights(sortedIndices),
    });

    // SV-018: early-exit — pass không có hoán vị nào → mảng đã sắp xếp hoàn toàn
    if (!swappedInPass) {
      // Chốt nốt các vị trí còn lại (0..n-i-2); vị trí 0 do frame hoàn thành chốt sau
      for (let rest = n - i - 2; rest >= 1; rest--) {
        sortedIndices.push(rest);
      }
      break;
    }
  }

  if (n > 0) sortedIndices.push(0);
  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [...sortedIndices],
    description: `✅ Bubble Sort hoàn thành! Mảng đã được sắp xếp tăng dần.`,
    algorithm: 'bubble',
    variables: { i: '-', j: '-', comparisons, swaps },
    lineNumber: LINE_FUNC_DECL,
    activeLogicalLineId: 'FUNC_DECL',
    highlights: mkHighlights(sortedIndices),
  });

  return frames;
}
