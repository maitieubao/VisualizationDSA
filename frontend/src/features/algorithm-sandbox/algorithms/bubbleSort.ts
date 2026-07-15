import type { SortFrame } from '../types/sorting.types';

/**
 * bubbleSort.ts — [ALGORITHM] Frame generator cho Bubble Sort.
 * Sinh danh sách SortFrame[] mô tả từng bước: compare → swap → sorted mark.
 */
export function generateBubbleSortFrames(inputArray: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  const arr = [...inputArray];
  const n = arr.length;
  const sortedIndices: number[] = [];
  let step = 0;

  // Frame khởi tạo
  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: 'Khởi tạo mảng dữ liệu đầu vào',
    algorithm: 'bubble',
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Bước so sánh
      frames.push({
        stepIndex: step++,
        arrayState: [...arr],
        comparingIndices: [j, j + 1],
        pivotIndex: null,
        swappedIndices: null,
        sortedIndices: [...sortedIndices],
        description: `So sánh arr[${j}]=${arr[j]} và arr[${j + 1}]=${arr[j + 1]}`,
        algorithm: 'bubble',
      });

      if (arr[j] > arr[j + 1]) {
        // Thực hiện hoán vị
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        frames.push({
          stepIndex: step++,
          arrayState: [...arr],
          comparingIndices: null,
          pivotIndex: null,
          swappedIndices: [j, j + 1],
          sortedIndices: [...sortedIndices],
          description: `Hoán vị: arr[${j}]↔arr[${j + 1}] → [${arr[j]}, ${arr[j + 1]}]`,
          algorithm: 'bubble',
        });
      }
    }

    // Đánh dấu phần tử đã yên vị
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
    });
  }

  // Phần tử cuối cùng cũng đã sắp xếp xong
  sortedIndices.push(0);
  frames.push({
    stepIndex: step++,
    arrayState: [...arr],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [...sortedIndices],
    description: `✅ Bubble Sort hoàn thành! Mảng đã được sắp xếp tăng dần.`,
    algorithm: 'bubble',
  });

  return frames;
}
