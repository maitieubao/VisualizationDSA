import type { AlgorithmResult, FrameDTO, HighlightIndices } from '../types/algorithm.types';

function defaultHighlights(overrides?: Partial<HighlightIndices>): HighlightIndices {
  return { compare: [], swap: [], sorted: [], dimmed: [], active: [], ...overrides };
}

export function generateBubbleSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], n = arr.length, frames: FrameDTO[] = [], sortedIndices: number[] = [];
  let stepId = 0;
  const pseudoCode = ['for i from 0 to N-1', '  for j from 0 to N-i-2', '    if A[j] > A[j+1]', '      swap(A[j], A[j+1])'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Bubble Sort.', dataState: [...arr], highlights: defaultHighlights() });
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push({ stepId: ++stepId, activeLine: 2, explanation: `So sánh A[${j}] (${arr[j]}) và A[${j+1}] (${arr[j+1]})`, dataState: [...arr], highlights: defaultHighlights({ compare: [j, j+1], sorted: [...sortedIndices] }) });
      if (arr[j] > arr[j+1]) { [arr[j], arr[j+1]] = [arr[j+1], arr[j]]; frames.push({ stepId: ++stepId, activeLine: 3, explanation: `Hoán vị A[${j}] và A[${j+1}]`, dataState: [...arr], highlights: defaultHighlights({ swap: [j, j+1], sorted: [...sortedIndices] }) }); }
    }
    sortedIndices.push(n - i - 1);
    frames.push({ stepId: ++stepId, activeLine: 0, explanation: `Phần tử ${arr[n-i-1]} cố định tại index ${n-i-1}.`, dataState: [...arr], highlights: defaultHighlights({ sorted: [...sortedIndices] }) });
  }
  sortedIndices.push(0);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: [...sortedIndices] }) });
  return { algorithmId: 'bubble-sort', pseudoCode, frames };
}

export function generateSelectionSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], n = arr.length, frames: FrameDTO[] = [], sortedIndices: number[] = [];
  let stepId = 0;
  const pseudoCode = ['for i from 0 to N-1', '  minIdx = i', '  for j from i+1 to N-1', '    if A[j] < A[minIdx]', '      minIdx = j', '  swap(A[i], A[minIdx])'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Selection Sort.', dataState: [...arr], highlights: defaultHighlights() });
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    frames.push({ stepId: ++stepId, activeLine: 1, explanation: `minIdx = ${i}, giá trị = ${arr[i]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [i], sorted: [...sortedIndices] }) });
    for (let j = i + 1; j < n; j++) {
      frames.push({ stepId: ++stepId, activeLine: 3, explanation: `So sánh A[${j}] (${arr[j]}) với A[${minIdx}] (${arr[minIdx]})`, dataState: [...arr], highlights: defaultHighlights({ compare: [j, minIdx], sorted: [...sortedIndices] }) });
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) { [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; frames.push({ stepId: ++stepId, activeLine: 5, explanation: `Hoán đổi A[${i}] và A[${minIdx}]`, dataState: [...arr], highlights: defaultHighlights({ swap: [i, minIdx], sorted: [...sortedIndices] }) }); }
    sortedIndices.push(i);
  }
  sortedIndices.push(n - 1);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: [...sortedIndices] }) });
  return { algorithmId: 'selection-sort', pseudoCode, frames };
}

export function generateInsertionSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], n = arr.length, frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['for i from 1 to N-1', '  key = A[i]', '  j = i - 1', '  while j >= 0 and A[j] > key', '    A[j+1] = A[j]; j--', '  A[j+1] = key'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Insertion Sort.', dataState: [...arr], highlights: defaultHighlights({ sorted: [0] }) });
  for (let i = 1; i < n; i++) {
    const key = arr[i]; let j = i - 1;
    frames.push({ stepId: ++stepId, activeLine: 1, explanation: `key = A[${i}] = ${key}`, dataState: [...arr], highlights: defaultHighlights({ compare: [i] }) });
    while (j >= 0 && arr[j] > key) { arr[j+1] = arr[j]; frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Dịch A[${j}] sang phải`, dataState: [...arr], highlights: defaultHighlights({ swap: [j, j+1] }) }); j--; }
    arr[j+1] = key;
    frames.push({ stepId: ++stepId, activeLine: 5, explanation: `Chèn key = ${key} vào vị trí ${j+1}`, dataState: [...arr], highlights: defaultHighlights({ swap: [j+1] }) });
  }
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: Array.from({ length: n }, (_, i) => i) }) });
  return { algorithmId: 'insertion-sort', pseudoCode, frames };
}

export function generateQuickSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['quickSort(A, low, high)', '  if low < high', '    pivotIdx = partition(A, low, high)', '    quickSort(A, low, pivotIdx-1)', '    quickSort(A, pivotIdx+1, high)'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Quick Sort.', dataState: [...arr], highlights: defaultHighlights() });
  function partition(low: number, high: number): number {
    const pivot = arr[high]; let i = low - 1;
    frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Pivot = ${pivot} (index ${high})`, dataState: [...arr], highlights: defaultHighlights({ pivot: high }) });
    for (let j = low; j < high; j++) {
      frames.push({ stepId: ++stepId, activeLine: 2, explanation: `So sánh A[${j}] (${arr[j]}) với Pivot (${pivot})`, dataState: [...arr], highlights: defaultHighlights({ compare: [j], pivot: high }) });
      if (arr[j] < pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Hoán vị A[${i}] và A[${j}]`, dataState: [...arr], highlights: defaultHighlights({ swap: [i, j], pivot: high }) }); }
    }
    [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
    frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Đưa Pivot về vị trí ${i+1}`, dataState: [...arr], highlights: defaultHighlights({ swap: [i+1, high] }) });
    return i + 1;
  }
  function quickSort(low: number, high: number): void { if (low < high) { const p = partition(low, high); quickSort(low, p-1); quickSort(p+1, high); } }
  quickSort(0, arr.length - 1);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: Array.from({ length: arr.length }, (_, i) => i) }) });
  return { algorithmId: 'quick-sort', pseudoCode, frames };
}

export function generateMergeSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['mergeSort(A, left, right)', '  if left < right', '    mid = (left+right)/2', '    mergeSort(A, left, mid)', '    mergeSort(A, mid+1, right)', '    merge(A, left, mid, right)'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Bắt đầu Merge Sort.', dataState: [...arr], highlights: defaultHighlights() });
  function merge(left: number, mid: number, right: number): void {
    const L = arr.slice(left, mid+1), R = arr.slice(mid+1, right+1);
    let i = 0, j = 0, k = left;
    while (i < L.length && j < R.length) {
      frames.push({ stepId: ++stepId, activeLine: 5, explanation: `Trộn: so sánh ${L[i]} và ${R[j]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [k] }) });
      if (L[i] <= R[j]) { arr[k] = L[i]; i++; } else { arr[k] = R[j]; j++; }
      frames.push({ stepId: ++stepId, activeLine: 5, explanation: `Đặt ${arr[k]} tại index ${k}`, dataState: [...arr], highlights: defaultHighlights({ swap: [k] }) });
      k++;
    }
    while (i < L.length) { arr[k] = L[i]; i++; k++; }
    while (j < R.length) { arr[k] = R[j]; j++; k++; }
  }
  function mergeSort(left: number, right: number): void {
    if (left < right) { const mid = Math.floor((left+right)/2); frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Chia tại mid = ${mid}`, dataState: [...arr], highlights: defaultHighlights({ compare: [mid] }) }); mergeSort(left, mid); mergeSort(mid+1, right); merge(left, mid, right); }
  }
  mergeSort(0, arr.length - 1);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: Array.from({ length: arr.length }, (_, i) => i) }) });
  return { algorithmId: 'merge-sort', pseudoCode, frames };
}

export function generateLinearSearch(inputData: number[]): AlgorithmResult {
  const target = inputData[inputData.length - 1], arr = inputData.slice(0, -1), frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['linearSearch(A, target)', '  for i from 0 to N-1', '    if A[i] == target', '      return i', '  return -1'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: `Tìm kiếm target = ${target}`, dataState: [...arr], highlights: defaultHighlights({ target }) });
  let found = false;
  for (let i = 0; i < arr.length; i++) {
    const dimmed = Array.from({ length: i }, (_, k) => k);
    frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Kiểm tra A[${i}] = ${arr[i]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [i], dimmed, target }) });
    if (arr[i] === target) { frames.push({ stepId: ++stepId, activeLine: 3, explanation: `Tìm thấy! A[${i}] = ${target}`, dataState: [...arr], highlights: defaultHighlights({ found: i, dimmed, target }) }); found = true; break; }
  }
  if (!found) frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Không tìm thấy ${target}`, dataState: [...arr], highlights: defaultHighlights({ dimmed: Array.from({ length: arr.length }, (_, i) => i), target }) });
  return { algorithmId: 'linear-search', pseudoCode, frames };
}

export function generateBinarySearch(inputData: number[]): AlgorithmResult {
  const target = inputData[inputData.length - 1], arr = inputData.slice(0, -1), frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = [
    'binarySearch(A, target)',
    '  low=0, high=N-1',
    '  while low <= high',
    '    mid = (low+high)/2',
    '    if A[mid] == target: return mid',
    '    else if A[mid] < target: low=mid+1',
    '    else: high=mid-1',
    '  return -1'
  ];

  // 1. Initial Frame
  frames.push({
    stepId: ++stepId,
    activeLine: 1,
    explanation: `Bắt đầu Tìm kiếm nhị phân (Binary Search). Mục tiêu tìm target = ${target}. Khởi tạo low=0, high=${arr.length - 1}.`,
    dataState: [...arr],
    highlights: defaultHighlights({ target, low: 0, high: arr.length - 1 })
  });

  let low = 0, high = arr.length - 1, found = false;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = arr[mid];

    // Dimmed elements for the current loop (outside [low, high])
    const currentDimmed: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (i < low || i > high) currentDimmed.push(i);
    }

    // --- Sub-step 1: Calculate Mid ---
    frames.push({
      stepId: ++stepId,
      activeLine: 3, // mid = (low+high)/2
      explanation: `Vòng lặp mới: Tính vị trí giữa mid = (${low} + ${high}) / 2 = ${mid}. Giá trị A[mid] = ${midVal}.`,
      dataState: [...arr],
      highlights: defaultHighlights({
        low,
        mid,
        high,
        dimmed: [...currentDimmed],
        target
      })
    });

    // --- Sub-step 2: Comparison Decision ---
    const decisionLine = midVal === target ? 4 : (midVal < target ? 5 : 6);
    let compExplain = "";
    if (midVal === target) {
      compExplain = `So sánh: A[mid] = ${midVal} bằng target = ${target}. Đã tìm thấy mục tiêu!`;
    } else if (midVal < target) {
      compExplain = `So sánh: A[mid] = ${midVal} < target = ${target}. Do mảng đã sắp xếp, toàn bộ các phần tử từ index ${low} đến ${mid} đều nhỏ hơn target và bị loại.`;
    } else {
      compExplain = `So sánh: A[mid] = ${midVal} > target = ${target}. Do mảng đã sắp xếp, toàn bộ các phần tử từ index ${mid} đến ${high} đều lớn hơn target và bị loại.`;
    }

    frames.push({
      stepId: ++stepId,
      activeLine: decisionLine,
      explanation: compExplain,
      dataState: [...arr],
      highlights: defaultHighlights({
        low,
        mid,
        high,
        dimmed: [...currentDimmed],
        compare: [mid],
        target
      })
    });

    if (midVal === target) {
      // --- Found Frame ---
      frames.push({
        stepId: ++stepId,
        activeLine: 4,
        explanation: `Tìm thấy target = ${target} tại vị trí index ${mid}. Kết thúc thuật toán thành công!`,
        dataState: [...arr],
        highlights: defaultHighlights({
          low,
          mid,
          high,
          dimmed: [...currentDimmed],
          found: mid,
          target
        })
      });
      found = true;
      break;
    }

    // --- Sub-step 3: Shrink range & Shift boundary ---
    let oldLow = low;
    let oldHigh = high;
    
    if (midVal < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }

    // Dimmed list now includes the newly eliminated segment!
    const nextDimmed: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (i < low || i > high) nextDimmed.push(i);
    }

    let shrinkExplain = "";
    if (midVal < target) {
      shrinkExplain = `Cập nhật ranh giới: Dịch low = mid + 1 = ${low}. Loại bỏ phạm vi phía bên trái [${oldLow}..${mid}] (được gạch chéo đỏ).`;
    } else {
      shrinkExplain = `Cập nhật ranh giới: Dịch high = mid - 1 = ${high}. Loại bỏ phạm vi phía bên phải [${mid}..${oldHigh}] (được gạch chéo đỏ).`;
    }

    frames.push({
      stepId: ++stepId,
      activeLine: midVal < target ? 5 : 6,
      explanation: shrinkExplain,
      dataState: [...arr],
      highlights: defaultHighlights({
        // Show low/high at their new coordinates
        low: low <= high ? low : null,
        high: low <= high ? high : null,
        dimmed: [...nextDimmed],
        target
      })
    });
  }

  if (!found) {
    frames.push({
      stepId: ++stepId,
      activeLine: 7, // return -1
      explanation: `Khoảng tìm kiếm trống (low > high). Đã xét tất cả phần tử và không tìm thấy target = ${target} trong mảng!`,
      dataState: [...arr],
      highlights: defaultHighlights({
        dimmed: Array.from({ length: arr.length }, (_, i) => i),
        target
      })
    });
  }

  return { algorithmId: 'binary-search', pseudoCode, frames };
}

export function generateHeapSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], n = arr.length, frames: FrameDTO[] = [], sortedIndices: number[] = [];
  let stepId = 0;
  const pseudoCode = ['buildMaxHeap(A)', 'for i from N-1 downto 1:', '  swap(A[0], A[i])', '  heapify(A, 0, i)'];

  function heapify(heapSize: number, i: number) {
    let largest = i, left = 2*i+1, right = 2*i+2;
    if (left < heapSize) {
      frames.push({ stepId: ++stepId, activeLine: 3, explanation: `So sánh node[${largest}]=${arr[largest]} với left[${left}]=${arr[left]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [largest, left], sorted: [...sortedIndices] }) });
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < heapSize) {
      frames.push({ stepId: ++stepId, activeLine: 3, explanation: `So sánh node[${largest}]=${arr[largest]} với right[${right}]=${arr[right]}`, dataState: [...arr], highlights: defaultHighlights({ compare: [largest, right], sorted: [...sortedIndices] }) });
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      frames.push({ stepId: ++stepId, activeLine: 3, explanation: `Hoán vị node[${i}] ↔ node[${largest}]`, dataState: [...arr], highlights: defaultHighlights({ swap: [i, largest], sorted: [...sortedIndices] }) });
      heapify(heapSize, largest);
    }
  }

  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Xây dựng Max-Heap.', dataState: [...arr], highlights: defaultHighlights() });
  for (let i = Math.floor(n/2)-1; i >= 0; i--) heapify(n, i);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: `Max-Heap hoàn thành! Root = ${arr[0]}.`, dataState: [...arr], highlights: defaultHighlights() });
  for (let i = n-1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sortedIndices.push(i);
    frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Đưa phần tử lớn nhất ${arr[i]} về vị trí [${i}].`, dataState: [...arr], highlights: defaultHighlights({ swap: [0, i], sorted: [...sortedIndices] }) });
    heapify(i, 0);
  }
  sortedIndices.push(0);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: [...sortedIndices] }) });
  return { algorithmId: 'heap-sort', pseudoCode, frames };
}

export function generateRadixSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['radixSort(A):', '  for exp = 1; max/exp > 0; exp *= 10:', '    countingSortByDigit(A, exp)'];
  const maxVal = Math.max(...arr, 1);

  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Khởi tạo Radix Sort.', dataState: [...arr], highlights: defaultHighlights() });
  for (let exp = 1; Math.floor(maxVal/exp) > 0; exp *= 10) {
    frames.push({ stepId: ++stepId, activeLine: 1, explanation: `Sắp xếp theo chữ số hàng ${exp}.`, dataState: [...arr], highlights: defaultHighlights() });
    const output = new Array(arr.length), count = new Array(10).fill(0);
    for (let i = 0; i < arr.length; i++) { count[(Math.floor(arr[i]/exp))%10]++; }
    for (let i = 1; i < 10; i++) count[i] += count[i-1];
    for (let i = arr.length-1; i >= 0; i--) { const d = (Math.floor(arr[i]/exp))%10; count[d]--; output[count[d]] = arr[i]; }
    for (let i = 0; i < arr.length; i++) arr[i] = output[i];
    frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Hàng ${exp} hoàn tất: [${arr.join(', ')}].`, dataState: [...arr], highlights: defaultHighlights() });
  }
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng đã sắp xếp hoàn chỉnh!', dataState: [...arr], highlights: defaultHighlights({ sorted: Array.from({ length: arr.length }, (_, i) => i) }) });
  return { algorithmId: 'radix-sort', pseudoCode, frames };
}

export function generateCountingSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], n = arr.length, frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['count[0..9] = 0', 'count[A[i]%10]++', 'prefix sum', 'build output (right-to-left)'];
  const count = new Array(10).fill(0);

  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Khởi tạo Counting Sort.', dataState: [...arr], highlights: defaultHighlights() });
  for (let i = 0; i < n; i++) { const d = Math.max(0, Math.min(arr[i]%10, 9)); count[d]++; frames.push({ stepId: ++stepId, activeLine: 1, explanation: `Count A[${i}]=${arr[i]}, digit=${d}. Count[${d}]=${count[d]}.`, dataState: [...arr], highlights: defaultHighlights({ compare: [i] }) }); }
  for (let i = 1; i < 10; i++) count[i] += count[i-1];
  frames.push({ stepId: ++stepId, activeLine: 2, explanation: 'Prefix sum hoàn tất.', dataState: [...arr], highlights: defaultHighlights() });
  const output = new Array(n);
  for (let i = n-1; i >= 0; i--) { const d = Math.max(0, Math.min(arr[i]%10, 9)); count[d]--; output[count[d]] = arr[i]; }
  frames.push({ stepId: ++stepId, activeLine: 3, explanation: `Kết quả: [${output.join(', ')}].`, dataState: [...output], highlights: defaultHighlights({ sorted: Array.from({ length: n }, (_, i) => i) }) });
  return { algorithmId: 'counting-sort', pseudoCode, frames };
}

export function generateBucketSort(inputData: number[]): AlgorithmResult {
  const arr = [...inputData], frames: FrameDTO[] = [];
  let stepId = 0;
  const pseudoCode = ['buckets[0..3] = []', 'distribute elements', 'sort each bucket', 'collect'];
  const buckets: number[][] = [[], [], [], []];
  const getBucket = (v: number) => v < 25 ? 0 : v < 50 ? 1 : v < 75 ? 2 : 3;

  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Khởi tạo Bucket Sort. 4 xô: [0-25), [25-50), [50-75), [75-100].', dataState: [...arr], highlights: defaultHighlights() });
  for (let i = 0; i < arr.length; i++) { const b = getBucket(arr[i]); buckets[b].push(arr[i]); frames.push({ stepId: ++stepId, activeLine: 1, explanation: `A[${i}]=${arr[i]} → Bucket ${b}.`, dataState: [...arr], highlights: defaultHighlights({ compare: [i] }) }); }
  for (const b of buckets) b.sort((a, c) => a - c);
  frames.push({ stepId: ++stepId, activeLine: 2, explanation: 'Các bucket đã sắp xếp.', dataState: [...arr], highlights: defaultHighlights() });
  const result = buckets.flat();
  frames.push({ stepId: ++stepId, activeLine: 3, explanation: `Kết quả: [${result.join(', ')}].`, dataState: result, highlights: defaultHighlights({ sorted: Array.from({ length: result.length }, (_, i) => i) }) });
  return { algorithmId: 'bucket-sort', pseudoCode, frames };
}
