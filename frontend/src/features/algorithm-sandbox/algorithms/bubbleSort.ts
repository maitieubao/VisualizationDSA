import type { SortFrame } from '../types/sorting.types';

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
  });

  for (let i = 0; i < n - 1; i++) {
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
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
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
    });
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
  });

  return frames;
}
