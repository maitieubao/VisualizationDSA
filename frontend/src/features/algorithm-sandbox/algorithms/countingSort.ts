import type { SortFrame } from "../types/sorting.types";

export function generateCountingSortFrames(arr: number[]): SortFrame[] {
  const frames: SortFrame[] = [];
  let stepIndex = 0;

  // 1. Keep the original input values (e.g. 45, 12, 85) to showcase real-world data and digit mapping.
  const currentArray = [...arr];
  
  // 2. Pre-assign stable IDs so Vue's transition-group can animate duplicate elements accurately.
  const arrayStateWithIds = currentArray.map((val, idx) => ({
    id: idx, // Simple, persistent stable IDs 0, 1, 2, ...
    value: val,
  }));

  // Counting grid of size 10 (indices 0 to 9)
  const count = Array(10).fill(0);
  
  // Initialize output arrays with null placeholders
  const output: Array<number | null> = Array(currentArray.length).fill(null);
  const outputIds: Array<{ id: number; value: number } | null> = Array(currentArray.length).fill(null);

  // Frame 0: Initial setup
  frames.push({
    stepIndex: ++stepIndex,
    arrayState: [...currentArray],
    arrayStateWithIds: [...arrayStateWithIds],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: "Khởi tạo giải thuật Counting Sort. Ánh xạ các phần tử mảng đầu vào theo chữ số hàng đơn vị (% 10) và dựng mảng tần suất Count [0..9].",
    algorithm: "counting",
    countArray: [...count],
    countingStep: "count",
    inputArray: [...currentArray],
    outputArray: [...output],
    outputArrayWithIds: [...outputIds],
  });

  // Step 1: Count element frequencies based on unit digits
  for (let i = 0; i < currentArray.length; i++) {
    const val = currentArray[i];
    const digit = Math.max(0, Math.min(Math.floor(val % 10), 9));
    count[digit]++;
    
    frames.push({
      stepIndex: ++stepIndex,
      arrayState: [...currentArray],
      arrayStateWithIds: [...arrayStateWithIds],
      comparingIndices: [i, digit] as [number, number], // comparingIndices[0]: active index in Input, comparingIndices[1]: target count index
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: `Đếm phần tử A[${i}] = ${val}. Chữ số hàng đơn vị là ${digit}. Tăng Count[${digit}] lên thành ${count[digit]}.`,
      algorithm: "counting",
      countArray: [...count],
      countingStep: "count",
      inputArray: [...currentArray],
      outputArray: [...output],
      outputArrayWithIds: [...outputIds],
    });
  }

  // Step 2: Prefix sums (accumulate)
  frames.push({
    stepIndex: ++stepIndex,
    arrayState: [...currentArray],
    arrayStateWithIds: [...arrayStateWithIds],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: "Bắt đầu pha tính tổng cộng dồn (Prefix Sum). Cộng lũy kế từ trái sang phải để tìm vị trí kết thúc của từng nhóm chữ số.",
    algorithm: "counting",
    countArray: [...count],
    countingStep: "accumulate",
    inputArray: [...currentArray],
    outputArray: [...output],
    outputArrayWithIds: [...outputIds],
  });

  for (let j = 1; j < count.length; j++) {
    const prev = count[j - 1];
    count[j] += prev;

    frames.push({
      stepIndex: ++stepIndex,
      arrayState: [...currentArray],
      arrayStateWithIds: [...arrayStateWithIds],
      comparingIndices: [j - 1, j] as [number, number], // Scanned count cells
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: `Cộng dồn tần suất: Count[${j}] += Count[${j - 1}] → Vị trí kết thúc của nhóm hàng đơn vị ${j} là ${count[j]}.`,
      algorithm: "counting",
      countArray: [...count],
      countingStep: "accumulate",
      inputArray: [...currentArray],
      outputArray: [...output],
      outputArrayWithIds: [...outputIds],
    });
  }

  // Step 3: Reconstruct output array (stable sorting)
  frames.push({
    stepIndex: ++stepIndex,
    arrayState: [...currentArray],
    arrayStateWithIds: [...arrayStateWithIds],
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: [],
    description: "Bắt đầu dựng mảng kết quả. Duyệt mảng Input từ PHẢI qua TRÁI (right-to-left) để giữ nguyên thứ tự xuất hiện của các phần tử trùng (Stable Sort).",
    algorithm: "counting",
    countArray: [...count],
    countingStep: "output",
    inputArray: [...currentArray],
    outputArray: [...output],
    outputArrayWithIds: [...outputIds],
  });

  for (let i = currentArray.length - 1; i >= 0; i--) {
    const val = currentArray[i];
    const digit = Math.max(0, Math.min(Math.floor(val % 10), 9));
    count[digit]--;
    const outputIdx = count[digit];
    
    // Write into output
    output[outputIdx] = val;
    outputIds[outputIdx] = arrayStateWithIds[i];

    frames.push({
      stepIndex: ++stepIndex,
      arrayState: [...currentArray],
      arrayStateWithIds: [...arrayStateWithIds],
      comparingIndices: [i, outputIdx] as [number, number], // comparingIndices[0]: active index in Input, comparingIndices[1]: targets output array slot
      pivotIndex: null,
      swappedIndices: null,
      sortedIndices: [],
      description: `Duyệt A[${i}] = ${val} (Hàng đơn vị là ${digit}). Vị trí chèn là Count[${digit}] - 1 = ${outputIdx}. Đưa vào Output[${outputIdx}] và giảm Count[${digit}].`,
      algorithm: "counting",
      countArray: [...count],
      countingStep: "output",
      inputArray: [...currentArray],
      outputArray: [...output],
      outputArrayWithIds: [...outputIds],
    });
  }

  // Final Frame: Complete
  const finalSortedIndices = Array.from({ length: currentArray.length }, (_, k) => k);
  frames.push({
    stepIndex: ++stepIndex,
    arrayState: output.map((v) => v ?? 0),
    arrayStateWithIds: outputIds.map((item, idx) => item ?? { id: idx, value: 0 }),
    comparingIndices: null,
    pivotIndex: null,
    swappedIndices: null,
    sortedIndices: finalSortedIndices,
    description: "Giải thuật Counting Sort hoàn tất! Mảng đã được sắp xếp tăng dần ổn định dựa trên hàng đơn vị.",
    algorithm: "counting",
    countArray: [...count],
    countingStep: "output",
    inputArray: [...currentArray],
    outputArray: output.map((v) => v ?? 0),
    outputArrayWithIds: outputIds.map((item, idx) => item ?? { id: idx, value: 0 }),
  });

  return frames;
}
