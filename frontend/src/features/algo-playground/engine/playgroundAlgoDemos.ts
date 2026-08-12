import type { AlgoInputKind } from './AlgoInputParser';

export type AlgoDemoCategory = 'sorting' | 'searching' | 'stack-queue' | 'tree-graph';

export interface AlgoDemo {
  id: string;
  title: string;
  description: string;
  category: AlgoDemoCategory;
  inputKind: AlgoInputKind;
  defaultInput: string;
  code: string;
  /** Độ phức tạp thời gian (hiển thị dạng chip trên UI) */
  complexity?: string;
  /** Độ phức tạp bộ nhớ (hiển thị dạng chip trên UI) */
  space?: string;
}

export const HOOKS_HINT = `// Hooks (hàm hỗ trợ quan sát trạng thái):
//   compare(i, j)   — tô sáng 2 chỉ số đang so sánh
//   swap(i, j)      — tráo đổi 2 phần tử và tô sáng
//   highlight(i)    — đánh dấu phần tử đã đúng chỗ
//   visit(id)       — đánh dấu đỉnh đã thăm (cây/đồ thị)
//   active(id)      — tô sáng đỉnh đang xử lý
//   enqueue(id)/dequeue(id) — mô phỏng hàng đợi
//   push(id)/pop(id)        — mô phỏng ngăn xếp
//   setDist(id, n)  — cập nhật khoảng cách (Dijkstra)
//   markEdge(u, v)  — đánh dấu cạnh đang duyệt
//   log(msg)        — ghi chú thích vào bảng trace
//   searchRange(low, high)     — hiển thị phạm vi tìm kiếm [low..high]
//   searchTarget(val)          — hiển thị giá trị cần tìm
//   found(index)               — đánh dấu đã tìm thấy tại vị trí
//   comparisonCount(n)         — hiển thị số phép so sánh
//   pointer(index, label, color) — hiển thị con trỏ L/H/M/R trên thanh
//   setSearchRegion(s, e, state) — tô vùng active/pruned trên mảng
//   setCallStack(frames)        — hiển thị call stack (đệ quy)
//   setPruneNode(id)            — loại bỏ nhánh trên cây
//   setCounts(arr)              — cập nhật mảng đếm (Counting Sort)
//   setCountingPhase(phase)     — 'count' | 'accumulate' | 'output'
//   setOutputs(arr)             — cập nhật mảng kết quả (Counting Sort)
//   setBuckets(buckets)         — cập nhật các xô (Radix/Bucket Sort)
//   setBucketPhase(phase)       — 'distribute' | 'collect' | 'sort'
//   setDigitPlace(place)        — hàng chữ số hiện tại (Radix Sort)
//   setActiveBucket(idx)        — xô đang xử lý (Bucket Sort)
//   setRangeLabels(labels)      — nhãn dải giá trị của xô
//   setBucketComparing(a, b)    — cặp phần tử đang so sánh trong xô
//   setMergeState(state)        — trạng thái chia/trộn Merge Sort {phase, left, right, leftIdx, rightIdx, output, low, mid, high, width, pass}
//   setHeapState(state)         — trạng thái Heap Sort {phase: 'build'|'extract', heapSize, activeIdx}
// Biến có sẵn: array (mảng số), treeNodes (cây nhị phân), graphNodes/graphEdges (đồ thị)
// Giới hạn: tối đa 10000 bước thực thi; vòng lặp vô hạn sẽ bị chặn tự động.

`;

const register = (demo: AlgoDemo): AlgoDemo => {
  const meta = DEMO_COMPLEXITY[demo.id];
  return meta ? { ...demo, complexity: meta.complexity, space: meta.space } : demo;
};

/** Metadata độ phức tạp cho từng demo (bổ sung vào demo khi register). */
const DEMO_COMPLEXITY: Record<string, { complexity: string; space: string }> = {
  'bubble-sort': { complexity: 'O(n²)', space: 'O(1)' },
  'selection-sort': { complexity: 'O(n²)', space: 'O(1)' },
  'insertion-sort': { complexity: 'O(n²)', space: 'O(1)' },
  'quick-sort': { complexity: 'O(n·log n)', space: 'O(log n)' },
  'merge-sort': { complexity: 'O(n·log n)', space: 'O(n)' },
  'heap-sort': { complexity: 'O(n·log n)', space: 'O(1)' },
  'counting-sort': { complexity: 'O(n + k)', space: 'O(k)' },
  'radix-sort': { complexity: 'O(d·(n+k))', space: 'O(n+k)' },
  'bucket-sort': { complexity: 'O(n + k)', space: 'O(n)' },
  'linear-search': { complexity: 'O(n)', space: 'O(1)' },
  'binary-search': { complexity: 'O(log n)', space: 'O(1)' },
  'two-pointers': { complexity: 'O(n)', space: 'O(1)' },
  'sliding-window': { complexity: 'O(n)', space: 'O(1)' },
  'stack': { complexity: 'O(n)', space: 'O(n)' },
  'queue': { complexity: 'O(n)', space: 'O(n)' },
  'monotonic-stack': { complexity: 'O(n)', space: 'O(n)' },
  'bst': { complexity: 'O(h)', space: 'O(h)' },
  'tree-traversal': { complexity: 'O(n)', space: 'O(h)' },
  'bfs': { complexity: 'O(V + E)', space: 'O(V)' },
  'dfs': { complexity: 'O(V + E)', space: 'O(V)' },
  'dijkstra': { complexity: 'O((V+E)·log V)', space: 'O(V)' },
};

export const playgroundAlgoDemos: Record<string, AlgoDemo> = {
  'bubble-sort': register({
    id: 'bubble-sort',
    title: 'Bubble Sort',
    description: 'Sắp xếp nổi bọt — so sánh cặp liền kề, phần tử lớn nổi dần về cuối.',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '5, 3, 8, 4, 2',
    code: `// Bubble Sort: phần tử lớn "nổi" về cuối mảng sau mỗi lượt
for (let i = 0; i < array.length - 1; i++) {
  for (let j = 0; j < array.length - i - 1; j++) {
    compare(j, j + 1);
    if (array[j] > array[j + 1]) {
      swap(j, j + 1);
    }
  }
  highlight(array.length - i - 1);
}
highlight(0);`,
  }),

  'selection-sort': register({
    id: 'selection-sort',
    title: 'Selection Sort',
    description: 'Sắp xếp chọn — mỗi lượt tìm phần tử nhỏ nhất đưa về đầu.',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '64, 25, 12, 22, 11',
    code: `// Selection Sort: chọn phần tử nhỏ nhất còn lại rồi đưa về đầu
for (let i = 0; i < array.length - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < array.length; j++) {
    compare(minIdx, j);
    if (array[j] < array[minIdx]) {
      minIdx = j;
    }
  }
  if (minIdx !== i) {
    swap(i, minIdx);
  }
  highlight(i);
}`,
  }),

  'insertion-sort': register({
    id: 'insertion-sort',
    title: 'Insertion Sort',
    description: 'Sắp xếp chèn — chèn từng phần tử vào đúng vị trí của dãy đã sắp xếp.',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '12, 11, 13, 5, 6',
    code: `// Insertion Sort: chèn "lá bài" đang cầm vào vị trí thích hợp
for (let i = 1; i < array.length; i++) {
  const key = array[i];
  let j = i - 1;
  while (j >= 0 && array[j] > key) {
    compare(i, j);
    array[j + 1] = array[j];
    j--;
  }
  array[j + 1] = key;
  highlight(i);
}`,
  }),

  'quick-sort': register({
    id: 'quick-sort',
    title: 'Quick Sort',
    description: 'Sắp xếp nhanh — chia để trị, chọn pivot rồi phân hoạch mảng.',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '10, 80, 30, 90, 40, 50, 70',
    code: `// Quick Sort (khử đệ quy bằng ngăn xếp tường minh)
const stack = [[0, array.length - 1]];
while (stack.length > 0) {
  const top = stack.pop();
  const low = top[0];
  const high = top[1];
  if (low >= high) {
    continue;
  }
  const pivot = array[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    compare(j, high);
    if (array[j] < pivot) {
      i++;
      swap(i, j);
    }
  }
  const p = i + 1;
  if (p !== high) {
    swap(p, high);
  }
  highlight(p);
  stack.push([low, p - 1]);
  stack.push([p + 1, high]);
}`,
  }),

  'merge-sort': register({
    id: 'merge-sort',
    title: 'Merge Sort',
    description: 'Sắp xếp trộn — chia đôi mảng rồi trộn hai nửa đã sắp xếp.',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '38, 27, 43, 3, 9, 82, 10',
    code: `// Merge Sort (bottom-up): chia mảng thành đoạn nhỏ rồi trộn dần
let pass = 0;
for (let width = 1; width < array.length; width = width * 2) {
  for (let left = 0; left < array.length; left = left + width * 2) {
    const mid = Math.min(left + width - 1, array.length - 1);
    const right = Math.min(left + width * 2 - 1, array.length - 1);
    const leftArr = [];
    const rightArr = [];
    for (let m = left; m <= mid; m++) {
      leftArr.push(array[m]);
    }
    for (let m = mid + 1; m <= right; m++) {
      rightArr.push(array[m]);
    }
    setMergeState({ phase: "divide", left: leftArr, right: rightArr, leftIdx: 0, rightIdx: 0, output: [], low: left, mid: mid, high: right, width: width, pass: pass });
    log("Chia đoạn [" + left + ".." + right + "] (width=" + width + ") thành 2 nửa");
    const output = [];
    let a = 0;
    let b = 0;
    while (a < leftArr.length && b < rightArr.length) {
      compare(left + a, left + width + b);
      if (leftArr[a] <= rightArr[b]) {
        output.push(leftArr[a]);
        a++;
      } else {
        output.push(rightArr[b]);
        b++;
      }
      setMergeState({ phase: "merge", left: leftArr, right: rightArr, leftIdx: a, rightIdx: b, output: output, low: left, mid: mid, high: right, width: width, pass: pass });
    }
    while (a < leftArr.length) {
      output.push(leftArr[a]);
      a++;
      setMergeState({ phase: "merge", left: leftArr, right: rightArr, leftIdx: a, rightIdx: b, output: output, low: left, mid: mid, high: right, width: width, pass: pass });
    }
    while (b < rightArr.length) {
      output.push(rightArr[b]);
      b++;
      setMergeState({ phase: "merge", left: leftArr, right: rightArr, leftIdx: a, rightIdx: b, output: output, low: left, mid: mid, high: right, width: width, pass: pass });
    }
    for (let x = 0; x < output.length; x++) {
      array[left + x] = output[x];
    }
    for (let x = left; x <= right; x++) {
      highlight(x);
    }
  }
  pass++;
}`,
  }),

  'heap-sort': register({
    id: 'heap-sort',
    title: 'Heap Sort',
    description: 'Sắp xếp vun đống — xây Max Heap rồi trích xuất dần phần tử lớn nhất.',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '12, 11, 13, 5, 6, 7',
    code: `// Heap Sort: vun đống rồi trích xuất phần tử lớn nhất về cuối
let phase = "build";
let siftPath = [];
function heapify(n, i) {
  siftPath = [i];
  while (true) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    setHeapState({ phase: phase, heapSize: n, activeIdx: i, siftPath: siftPath });
    if (left < n) {
      compare(left, largest);
      if (array[left] > array[largest]) {
        largest = left;
        siftPath.push(left);
      }
    }
    if (right < n) {
      compare(right, largest);
      if (array[right] > array[largest]) {
        largest = right;
        siftPath.push(right);
      }
    }
    if (largest === i) {
      break;
    }
    swap(i, largest);
    i = largest;
    siftPath.push(i);
  }
}
for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
  heapify(array.length, i);
}
phase = "extract";
for (let i = array.length - 1; i > 0; i--) {
  setHeapState({ phase: phase, heapSize: i, activeIdx: 0, siftPath: [] });
  swap(0, i);
  highlight(i);
  heapify(i, 0);
}
highlight(0);`,
  }),

  'counting-sort': register({
    id: 'counting-sort',
    title: 'Counting Sort',
    description: 'Sắp xếp đếm — đếm tần suất rồi rải lại theo thứ tự (O(N + K)).',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '4, 2, 2, 8, 3, 3, 1',
    code: `// Counting Sort: đếm tần suất xuất hiện rồi rải theo thứ tự
let min = array[0];
let max = array[0];
for (let i = 1; i < array.length; i++) {
  if (array[i] < min) { min = array[i]; }
  if (array[i] > max) { max = array[i]; }
}
const size = max - min + 1;
const count = new Array(size).fill(0);
setCountingPhase("count");
for (let i = 0; i < array.length; i++) {
  count[array[i] - min]++;
  compare(i, array[i] - min);
}
setCounts(count);
const output = new Array(array.length).fill(null);
setOutputs(output);
setCountingPhase("output");
let pos = 0;
for (let v = 0; v < count.length; v++) {
  while (count[v] > 0) {
    array[pos] = v + min;
    output[pos] = v + min;
    setOutputs(output);
    compare(pos, v);
    count[v]--;
    pos++;
  }
}`,
  }),

  'radix-sort': register({
    id: 'radix-sort',
    title: 'Radix Sort',
    description: 'Sắp xếp theo chữ số — phân loại dần từ hàng đơn vị lên hàng cao nhất.',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '170, 45, 75, 90, 802, 24, 2, 66',
    code: `// Radix Sort: sắp theo từng chữ số (dùng Counting Sort làm nền tảng)
let minVal = 0;
let maxVal = 0;
for (let i = 0; i < array.length; i++) {
  if (array[i] < minVal) { minVal = array[i]; }
  if (array[i] > maxVal) { maxVal = array[i]; }
}
const offset = -minVal;
const max = maxVal + offset;
let exp = 1;
const buckets = [];
for (let b = 0; b < 10; b++) {
  buckets.push([]);
}
while (Math.floor(max / exp) > 0) {
  setDigitPlace(exp);
  setBucketPhase("distribute");
  for (let i = 0; i < array.length; i++) {
    const digit = Math.floor((array[i] + offset) / exp) % 10;
    buckets[digit].push(array[i]);
    setBuckets(buckets);
    compare(i, digit);
  }
  setBucketPhase("collect");
  const output = [];
  for (let b = 0; b < 10; b++) {
    while (buckets[b].length > 0) {
      output.push(buckets[b].shift());
    }
  }
  for (let i = 0; i < array.length; i++) {
    array[i] = output[i];
    highlight(i);
  }
  for (let b = 0; b < 10; b++) {
    buckets[b] = [];
  }
  setBuckets(buckets);
  exp = exp * 10;
}`,
  }),

  'bucket-sort': register({
    id: 'bucket-sort',
    title: 'Bucket Sort',
    description: 'Sắp xếp theo xô — phân tán số thập phân [0, 1) vào các xô rồi sắp trong từng xô.',
    category: 'sorting',
    inputKind: 'array',
    defaultInput: '0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68',
    code: `// Bucket Sort: dành cho số thập phân từ 0 đến nhỏ hơn 1
for (let i = 0; i < array.length; i++) {
  if (array[i] < 0 || array[i] >= 1) {
    throw new Error("Bucket Sort yêu cầu mọi giá trị trong [0, 1) — ví dụ: 0.78, 0.17, 0.39");
  }
}
const n = array.length;
if (n === 0) {
  return;
}
const buckets = new Array(n);
for (let i = 0; i < n; i++) {
  buckets[i] = [];
}
setBucketPhase("distribute");
setBuckets(buckets);
for (let i = 0; i < n; i++) {
  const idx = Math.min(Math.floor(array[i] * n), n - 1);
  buckets[idx].push(array[i]);
  setBuckets(buckets);
  setActiveBucket(idx);
  compare(i, idx);
}
const labels = [];
for (let i = 0; i < n; i++) {
  const lo = i / n;
  const hi = (i + 1) / n;
  labels.push("[" + lo.toFixed(2) + ".." + hi.toFixed(2) + ")");
}
setRangeLabels(labels);
setBucketPhase("sort");
let pos = 0;
for (let i = 0; i < n; i++) {
  setActiveBucket(i);
  buckets[i].sort(function (a, b) { return a - b; });
  for (let j = 0; j < buckets[i].length; j++) {
    if (j > 0) {
      setBucketComparing(j - 1, j);
    }
    array[pos] = buckets[i][j];
    highlight(pos);
    pos++;
  }
}
setBucketPhase("collect");`,
  }),

  'linear-search': register({
    id: 'linear-search',
    title: 'Linear Search',
    description: 'Tìm kiếm tuyến tính — duyệt tuần tự từng phần tử tới khi gặp target.',
    category: 'searching',
    inputKind: 'array',
    defaultInput: '5, 3, 8, 4, 2, 9, 1',
    code: `// Linear Search: duyệt tuần tự tìm phần tử khớp target
const target = array[Math.floor(array.length / 2)];
searchTarget(target);
log("Đang tìm giá trị " + target);
let comparisons = 0;
for (let i = 0; i < array.length; i++) {
  compare(i, i);
  comparisons++;
  comparisonCount(comparisons);
  pointer(i, "I", "#06b6d4");
  if (array[i] === target) {
    found(i);
    log("Tìm thấy " + target + " tại vị trí " + i);
    break;
  }
}`,
  }),

  'binary-search': register({
    id: 'binary-search',
    title: 'Binary Search',
    description: 'Tìm kiếm nhị phân — thu hẹp phạm vi một nửa mỗi lần (cần mảng đã sắp xếp).',
    category: 'searching',
    inputKind: 'array',
    defaultInput: '12, 23, 29, 37, 41, 56, 60',
    code: `// Binary Search: chỉ áp dụng trên mảng ĐÃ SẮP XẾP
for (let i = 1; i < array.length; i++) {
  if (array[i - 1] > array[i]) {
    throw new Error("Binary Search yêu cầu mảng đã sắp xếp tăng dần!");
  }
}
const target = array[Math.floor(array.length / 2)];
searchTarget(target);
log("Đang tìm giá trị " + target);
let low = 0;
let high = array.length - 1;
let comparisons = 0;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  searchRange(low, high);
  pointer(low, "L", "#06b6d4");
  pointer(high, "H", "#8b5cf6");
  pointer(mid, "M", "#f59e0b");
  compare(mid, mid);
  comparisons++;
  comparisonCount(comparisons);
  if (array[mid] === target) {
    found(mid);
    log("Tìm thấy " + target + " tại vị trí " + mid);
    break;
  } else if (array[mid] < target) {
    low = mid + 1;
    log("array[" + mid + "]=" + array[mid] + " < " + target + " → loại trái");
  } else {
    high = mid - 1;
    log("array[" + mid + "]=" + array[mid] + " > " + target + " → loại phải");
  }
}`,
  }),

  'two-pointers': register({
    id: 'two-pointers',
    title: 'Two Pointers',
    description: 'Hai con trỏ — tìm cặp số có tổng bằng target trên mảng đã sắp xếp.',
    category: 'searching',
    inputKind: 'array',
    defaultInput: '23, 29, 37, 41, 56, 60',
    code: `// Two Pointers: tìm cặp số có tổng bằng target (mảng đã sắp xếp)
for (let i = 1; i < array.length; i++) {
  if (array[i - 1] > array[i]) {
    throw new Error("Two Pointers yêu cầu mảng đã sắp xếp tăng dần!");
  }
}
const target = array[0] + array[array.length - 1];
searchTarget(target);
log("Cần tìm tổng " + target);
let left = 0;
let right = array.length - 1;
let comparisons = 0;
while (left < right) {
  pointer(left, "L", "#06b6d4");
  pointer(right, "R", "#ef4444");
  const sum = array[left] + array[right];
  compare(left, right);
  comparisons++;
  comparisonCount(comparisons);
  if (sum === target) {
    highlight(left);
    highlight(right);
    log("Tìm thấy cặp " + array[left] + " + " + array[right] + " = " + target);
    break;
  } else if (sum < target) {
    left++;
    log("Tổng " + sum + " < " + target + " → di chuyển L");
  } else {
    right--;
    log("Tổng " + sum + " > " + target + " → di chuyển R");
  }
}`,
  }),

  'sliding-window': register({
    id: 'sliding-window',
    title: 'Sliding Window',
    description: 'Cửa sổ trượt — tìm tổng lớn nhất của dãy con có độ dài k.',
    category: 'searching',
    inputKind: 'array',
    defaultInput: '2, 1, 5, 1, 3, 2',
    code: `// Sliding Window: tổng lớn nhất của dãy con độ dài k
const k = 3;
if (array.length < k) {
  throw new Error("Cần mảng có ít nhất " + k + " phần tử!");
}
let maxSum = 0;
let currentSum = 0;
for (let i = 0; i < k; i++) {
  currentSum = currentSum + array[i];
  highlight(i);
  pointer(i, "W", "#06b6d4");
}
maxSum = currentSum;
log("Cửa sổ đầu tiên có tổng " + maxSum);
for (let i = k; i < array.length; i++) {
  currentSum = currentSum - array[i - k] + array[i];
  searchRange(i - k + 1, i);
  pointer(i, "W", "#06b6d4");
  for (let j = i - k + 1; j <= i; j++) {
    highlight(j);
  }
  if (currentSum > maxSum) {
    maxSum = currentSum;
    log("Cửa sổ mới có tổng lớn hơn: " + maxSum);
  }
}
log("Tổng lớn nhất: " + maxSum);`,
  }),

  'stack': register({
    id: 'stack',
    title: 'Stack (Daily Temperatures)',
    description: 'Ngăn xếp — đếm số ngày phải chờ cho tới khi trời nóng hơn.',
    category: 'stack-queue',
    inputKind: 'array',
    defaultInput: '73, 74, 75, 71, 69, 72, 76, 73',
    code: `// Stack: bài toán Daily Temperatures (monotonic stack)
const result = new Array(array.length).fill(0);
const stackIndices = [];
for (let i = 0; i < array.length; i++) {
  while (stackIndices.length > 0 && array[i] > array[stackIndices[stackIndices.length - 1]]) {
    const top = stackIndices.pop();
    pop(top);
    result[top] = i - top;
    log("Ngày " + top + " chờ " + result[top] + " ngày tới khi gặp " + array[i] + " độ");
  }
  stackIndices.push(i);
  push(i);
}`,
  }),

  'queue': register({
    id: 'queue',
    title: 'Queue (FIFO)',
    description: 'Hàng đợi — vào trước ra trước, minh họa quy trình phục vụ.',
    category: 'stack-queue',
    inputKind: 'array',
    defaultInput: '10, 20, 30, 40, 50',
    code: `// Queue: FIFO (First In, First Out)
const q = [];
for (let i = 0; i < array.length; i++) {
  q.push(array[i]);
  enqueue(array[i]);
  log("Nạp " + array[i] + " vào hàng đợi");
}
while (q.length > 0) {
  const item = q.shift();
  dequeue(item);
  log("Phục vụ: " + item);
}`,
  }),

  'monotonic-stack': register({
    id: 'monotonic-stack',
    title: 'Monotonic Stack',
    description: 'Ngăn xếp đơn điệu — tìm phần tử lớn hơn gần nhất bên phải (Next Greater).',
    category: 'stack-queue',
    inputKind: 'array',
    defaultInput: '4, 5, 2, 25',
    code: `// Monotonic Stack: tìm Next Greater Element
const result = new Array(array.length).fill(-1);
const monoStack = [];
for (let i = 0; i < array.length; i++) {
  while (monoStack.length > 0 && array[i] > array[monoStack[monoStack.length - 1]]) {
    const top = monoStack.pop();
    pop(top);
    result[top] = array[i];
    log("Next Greater của " + array[top] + " (vị trí " + top + ") = " + array[i]);
  }
  monoStack.push(i);
  push(i);
}
for (let i = 0; i < result.length; i++) {
  if (result[i] === -1) {
    log("Next Greater của " + array[i] + ": không có (-1)");
  }
}`,
  }),

  'bst': register({
    id: 'bst',
    title: 'BST (Tìm kiếm)',
    description: 'Cây tìm kiếm nhị phân — duyệt rẽ trái/phải để tìm target nhanh hơn tuyến tính.',
    category: 'tree-graph',
    inputKind: 'tree',
    defaultInput: '8, 3, 10, 1, 6, 14, 4, 7, 13',
    code: `// BST Search: rẽ nhánh trái/phải theo giá trị target
const root = treeNodes[0];
const target = 7;
searchTarget(target);
log("Tìm kiếm " + target + " trong cây nhị phân");
let comparisons = 0;
function find(node, target, depth) {
  setCallStack([{ functionName: "find", depth: depth }]);
  if (!node) {
    log("Không tìm thấy " + target + "!");
    return;
  }
  active(node.id);
  visit(node.id);
  comparisons++;
  comparisonCount(comparisons);
  if (node.value === target) {
    found(-1);
    log("Đã tìm thấy " + target + "!");
    return;
  }
  let next = null;
  if (target < node.value) {
    next = treeNodes.find(function (t) { return t.id === node.leftId; });
    if (next && next.rightId) {
      pruneNode(next.rightId);
      log("Loại nhánh phải của " + node.value);
    }
  } else {
    next = treeNodes.find(function (t) { return t.id === node.rightId; });
    if (next && next.leftId) {
      pruneNode(next.leftId);
      log("Loại nhánh trái của " + node.value);
    }
  }
  find(next, target, depth + 1);
}
find(root, target, 1);`,
  }),

  'tree-traversal': register({
    id: 'tree-traversal',
    title: 'Tree Traversal (In-order)',
    description: 'Duyệt cây nhị phân — In-order: trái, gốc, phải cho kết quả tăng dần.',
    category: 'tree-graph',
    inputKind: 'tree',
    defaultInput: '8, 3, 10, 1, 6, 14, 4, 7, 13',
    code: `// In-order Traversal: L - N - R
const root = treeNodes[0];
let order = 0;
function traverse(node, depth) {
  setCallStack([{ functionName: "traverse", depth: depth }]);
  if (!node) {
    return;
  }
  const left = treeNodes.find(function (t) { return t.id === node.leftId; }) || null;
  const right = treeNodes.find(function (t) { return t.id === node.rightId; }) || null;
  traverse(left, depth + 1);
  order++;
  visit(node.id);
  active(node.id);
  log("Thăm " + node.value + " (thứ tự #" + order + ")");
  traverse(right, depth + 1);
}
traverse(root, 1);`,
  }),

  'bfs': register({
    id: 'bfs',
    title: 'BFS',
    description: 'Duyệt theo chiều rộng — dùng hàng đợi, thăm đỉnh theo tầng.',
    category: 'tree-graph',
    inputKind: 'graph',
    defaultInput: 'A-B:4, A-C:2, B-C:1, B-D:5, C-D:8, C-E:10, D-E:2',
    code: `// BFS: duyệt theo chiều rộng bằng hàng đợi
const adj = {};
for (const n of graphNodes) {
  adj[n.id] = [];
}
for (const e of graphEdges) {
  adj[e.from].push(e.to);
  if (!e.directed) {
    adj[e.to].push(e.from);
  }
}
const visitedSet = new Set();
const queue = [graphNodes[0].id];
visitedSet.add(graphNodes[0].id);
visit(graphNodes[0].id);
log("Bắt đầu BFS từ " + graphNodes[0].id);
while (queue.length > 0) {
  const current = queue.shift();
  active(current);
  dequeue(current);
  for (const next of adj[current]) {
    if (!visitedSet.has(next)) {
      visitedSet.add(next);
      visit(next);
      markEdge(current, next);
      queue.push(next);
      enqueue(next);
    }
  }
}`,
  }),

  'dfs': register({
    id: 'dfs',
    title: 'DFS',
    description: 'Duyệt theo chiều sâu — dùng đệ quy, thăm sâu nhất có thể.',
    category: 'tree-graph',
    inputKind: 'graph',
    defaultInput: 'A-B:4, A-C:2, B-C:1, B-D:5, C-D:8, C-E:10, D-E:2',
    code: `// DFS: duyệt theo chiều sâu bằng đệ quy
const adj = {};
for (const n of graphNodes) {
  adj[n.id] = [];
}
for (const e of graphEdges) {
  adj[e.from].push(e.to);
  if (!e.directed) {
    adj[e.to].push(e.from);
  }
}
const visitedSet = new Set();
log("Bắt đầu DFS từ " + graphNodes[0].id);
let order = 0;
function dfs(nodeId, depth) {
  setCallStack([{ functionName: "dfs", depth: depth }]);
  if (visitedSet.has(nodeId)) {
    return;
  }
  visitedSet.add(nodeId);
  order++;
  visit(nodeId);
  active(nodeId);
  log("Thăm " + nodeId + " (thứ tự #" + order + ", depth=" + depth + ")");
  for (const next of adj[nodeId]) {
    if (!visitedSet.has(next)) {
      markEdge(nodeId, next);
      dfs(next, depth + 1);
    }
  }
}
dfs(graphNodes[0].id, 1);`,
  }),

  'dijkstra': register({
    id: 'dijkstra',
    title: 'Dijkstra',
    description: 'Đường đi ngắn nhất — cập nhật khoảng cách tới mọi đỉnh từ đỉnh nguồn.',
    category: 'tree-graph',
    inputKind: 'graph',
    defaultInput: 'A-B:4, A-C:2, B-C:1, B-D:5, C-D:8, C-E:10, D-E:2',
    code: `// Dijkstra: đường đi ngắn nhất từ đỉnh nguồn
clearEdges();
const dist = {};
const unvisited = new Set();
const adj = {};
for (const n of graphNodes) {
  adj[n.id] = [];
  dist[n.id] = 999999;
  unvisited.add(n.id);
}
for (const e of graphEdges) {
  adj[e.from].push({ to: e.to, w: e.weight || 1 });
  if (!e.directed) {
    adj[e.to].push({ to: e.from, w: e.weight || 1 });
  }
}
const start = graphNodes[0].id;
dist[start] = 0;
setDist(start, 0);
log("Khởi tạo khoảng cách từ " + start + " = 0");
while (unvisited.size > 0) {
  let u = null;
  let best = 999999;
  for (const n of unvisited) {
    if (dist[n] < best) {
      best = dist[n];
      u = n;
    }
  }
  if (u === null) {
    break;
  }
  unvisited.delete(u);
  active(u);
  for (const e of adj[u]) {
    if (unvisited.has(e.to)) {
      const nd = dist[u] + e.w;
      if (nd < dist[e.to]) {
        dist[e.to] = nd;
        setDist(e.to, nd);
        markEdge(u, e.to);
      }
    }
  }
}
for (const n of graphNodes) {
  log("Khoảng cách tới " + n.id + ": " + (dist[n.id] === 999999 ? "∞" : dist[n.id]));
}`,
  }),
};

export const getAlgoDemo = (id: string): AlgoDemo | undefined => playgroundAlgoDemos[id];

export const algoDemoIds: readonly string[] = Object.keys(playgroundAlgoDemos);

/**
 * Sinh dữ liệu input ngẫu nhiên phù hợp với từng demo
 * (bucket-sort cần [0,1); binary-search/two-pointers cần mảng đã sort; graph cần đồ thị liên thông...).
 */
export function generateDemoInput(demoId: string): string {
  const demo = getAlgoDemo(demoId);
  const kind = demo?.inputKind ?? 'array';
  const rand = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (kind) {
    case 'tree': {
      const n = rand(6, 10);
      const values: number[] = [];
      for (let i = 0; i < n; i++) values.push(rand(1, 60));
      return values.join(', ');
    }
    case 'graph': {
      const ids = 'ABCDEFGH'.split('');
      const n = rand(4, 6);
      const nodes = ids.slice(0, n);
      const edges: string[] = [];
      const used = new Set<string>();
      for (let i = 1; i < n; i++) {
        const from = nodes[rand(0, i - 1)];
        const key = [from, nodes[i]].sort().join('');
        used.add(key);
        edges.push(`${from}-${nodes[i]}:${rand(1, 9)}`);
      }
      const extra = rand(0, Math.max(1, n - 3));
      for (let e = 0; e < extra; e++) {
        const a = nodes[rand(0, n - 1)];
        const b = nodes[rand(0, n - 1)];
        if (a === b) continue;
        const key = [a, b].sort().join('');
        if (used.has(key)) continue;
        used.add(key);
        edges.push(`${a}-${b}:${rand(1, 9)}`);
      }
      return edges.join(', ');
    }
    default: {
      if (demoId === 'bucket-sort') {
        const n = rand(6, 10);
        const values: string[] = [];
        for (let i = 0; i < n; i++) values.push((Math.random() * 0.98 + 0.01).toFixed(2));
        return values.join(', ');
      }
      const n = rand(5, 12);
      const minV = demoId === 'counting-sort' ? 0 : 1;
      const maxV = demoId === 'counting-sort' || demoId === 'radix-sort' ? 30 : 99;
      const values: number[] = [];
      for (let i = 0; i < n; i++) values.push(rand(minV, maxV));
      if (demoId === 'binary-search' || demoId === 'two-pointers') {
        values.sort((a, b) => a - b);
      }
      return values.join(', ');
    }
  }
}
