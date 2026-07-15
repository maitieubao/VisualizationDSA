import type { AlgorithmRequest, AlgorithmResult } from '../types/animation.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5055';

/**
 * Gọi API Backend thực thi thuật toán và nhận về chuỗi frames hoạt họa.
 */
export async function executeAlgorithm(request: AlgorithmRequest): Promise<AlgorithmResult> {
  const response = await fetch(`${API_BASE}/api/v1/algorithms/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, br',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message ?? `HTTP Error ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<AlgorithmResult>;
}

/**
 * Sinh dữ liệu Bubble Sort giả lập (Dummy) để phát triển Frontend
 * mà không cần Backend chạy.
 */
export function generateDummyBubbleSortResult(inputData: number[]): AlgorithmResult {
  const arr = [...inputData];
  const n = arr.length;
  const frames: AlgorithmResult['frames'] = [];
  const sortedIndices: number[] = [];
  let stepId = 0;

  const pseudoCode = [
    'for i from 0 to N-1',
    '  for j from 0 to N-i-2',
    '    if A[j] > A[j+1]',
    '      swap(A[j], A[j+1])',
  ];

  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: 'Khởi tạo mảng đầu vào và chuẩn bị sắp xếp.',
    dataState: [...arr],
    highlights: { compare: [], swap: [], sorted: [] },
    activeLogicalLineId: 'FUNC_DECL',
    variables: { n },
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push({
        stepId: ++stepId,
        activeLine: 2,
        explanation: `So sánh A[${j}] (${arr[j]}) và A[${j + 1}] (${arr[j + 1]})`,
        dataState: [...arr],
        highlights: { compare: [j, j + 1], swap: [], sorted: [...sortedIndices] },
        activeLogicalLineId: 'COMPARE_STEP',
        variables: { i, j, n },
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        frames.push({
          stepId: ++stepId,
          activeLine: 3,
          explanation: `Hoán vị A[${j}] và A[${j + 1}] vì ${arr[j + 1]} > ${arr[j]}`,
          dataState: [...arr],
          highlights: { compare: [], swap: [j, j + 1], sorted: [...sortedIndices] },
          activeLogicalLineId: 'SWAP_STEP',
          variables: { i, j, n, temp: arr[j] },
        });
      }
    }

    sortedIndices.push(n - i - 1);
    frames.push({
      stepId: ++stepId,
      activeLine: 0,
      explanation: `Phần tử ${arr[n - i - 1]} đã cố định tại index ${n - i - 1}.`,
      dataState: [...arr],
      highlights: { compare: [], swap: [], sorted: [...sortedIndices] },
      activeLogicalLineId: 'OUTER_LOOP',
      variables: { i, n },
    });
  }

  sortedIndices.push(0);
  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: 'Mảng đã được sắp xếp tăng dần hoàn chỉnh!',
    dataState: [...arr],
    highlights: { compare: [], swap: [], sorted: [...sortedIndices] },
    activeLogicalLineId: 'FUNC_DECL',
    variables: { n },
  });

  return {
    algorithmId: 'bubble-sort',
    pseudoCode,
    frames,
  };
}
