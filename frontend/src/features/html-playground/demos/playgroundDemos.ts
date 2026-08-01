import type { PlaygroundSource } from '../types/playground.types';

export interface PlaygroundDemo {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly source: PlaygroundSource;
}

const buildSource = (title: string, js: string): PlaygroundSource => ({
  html: `<h1 class="title">${title}</h1>\n<pre id="output">Đang chạy...</pre>`,
  css: `body {
  font-family: system-ui, sans-serif;
  margin: 0;
  padding: 1.5rem;
  min-height: 100vh;
  box-sizing: border-box;
  background: #0f172a;
  color: #e2e8f0;
}

.title {
  color: #818cf8;
  font-size: 1.4rem;
  margin-top: 0;
}

#output {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  font-family: "JetBrains Mono", Consolas, monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
  color: #a5b4fc;
}`,
  js: `${js}\n\n// Tự động chạy demo khi mở Playground\nconst output = document.getElementById("output");\noutput.textContent = run();`,
});

const register = (id: string, title: string, description: string, js: string): PlaygroundDemo => ({
  id,
  title,
  description,
  source: buildSource(title, js),
});

export const playgroundDemos: Record<string, PlaygroundDemo> = {
  // ============================================================ SẮP XẾP
  'bubble-sort': register(
    'bubble-sort',
    'Bubble Sort',
    'Sắp xếp nổi bọt — so sánh cặp liền kề, phần tử lớn nổi dần về cuối mảng.',
    `function bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  let trace = [];
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
      trace.push("So sánh " + a[j] + " và " + a[j + 1]);
    }
    trace.push("Lượt " + (i + 1) + ": [" + a.join(", ") + "]");
    if (!swapped) break;
  }
  return "Kết quả: [" + a.join(", ") + "]\\n\\n" + trace.join("\\n");
}

function run() {
  const input = [5, 3, 8, 4, 2];
  return "Mảng đầu vào: [" + input.join(", ") + "]\\n\\n" + bubbleSort(input);
}`,
  ),

  'selection-sort': register(
    'selection-sort',
    'Selection Sort',
    'Sắp xếp chọn — mỗi lượt tìm phần tử nhỏ nhất đưa về đầu mảng.',
    `function selectionSort(arr) {
  const a = [...arr];
  const n = a.length;
  const trace = [];
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) [a[i], a[minIdx]] = [a[minIdx], a[i]];
    trace.push("Lượt " + (i + 1) + ": [" + a.join(", ") + "]");
  }
  return "Kết quả: [" + a.join(", ") + "]\\n\\n" + trace.join("\\n");
}

function run() {
  const input = [64, 25, 12, 22, 11];
  return "Mảng đầu vào: [" + input.join(", ") + "]\\n\\n" + selectionSort(input);
}`,
  ),

  'insertion-sort': register(
    'insertion-sort',
    'Insertion Sort',
    'Sắp xếp chèn — lấy từng phần tử chèn vào đúng vị trí của dãy đã sắp xếp.',
    `function insertionSort(arr) {
  const a = [...arr];
  const n = a.length;
  const trace = [];
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
    trace.push("Chèn " + key + ": [" + a.join(", ") + "]");
  }
  return "Kết quả: [" + a.join(", ") + "]\\n\\n" + trace.join("\\n");
}

function run() {
  const input = [12, 11, 13, 5, 6];
  return "Mảng đầu vào: [" + input.join(", ") + "]\\n\\n" + insertionSort(input);
}`,
  ),

  'quick-sort': register(
    'quick-sort',
    'Quick Sort',
    'Sắp xếp nhanh — chia để trị với kỹ thuật phân mảnh Lomuto.',
    `function partition(a, low, high) {
  const pivot = a[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (a[j] < pivot) {
      i++;
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  [a[i + 1], a[high]] = [a[high], a[i + 1]];
  return i + 1;
}

function quickSort(a, low, high) {
  if (low < high) {
    const pi = partition(a, low, high);
    quickSort(a, low, pi - 1);
    quickSort(a, pi + 1, high);
  }
}

function run() {
  const input = [10, 80, 30, 90, 40, 50, 70];
  const a = [...input];
  quickSort(a, 0, a.length - 1);
  return "Mảng đầu vào: [" + input.join(", ") + "]\\nKết quả: [" + a.join(", ") + "]";
}`,
  ),

  'merge-sort': register(
    'merge-sort',
    'Merge Sort',
    'Sắp xếp trộn — chia để trị, trộn hai nửa đã sắp xếp.',
    `function merge(a, left, mid, right) {
  const leftArr = a.slice(left, mid + 1);
  const rightArr = a.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;
  while (i < leftArr.length && j < rightArr.length) {
    a[k++] = leftArr[i] <= rightArr[j] ? leftArr[i++] : rightArr[j++];
  }
  while (i < leftArr.length) a[k++] = leftArr[i++];
  while (j < rightArr.length) a[k++] = rightArr[j++];
}

function mergeSort(a, left, right) {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    mergeSort(a, left, mid);
    mergeSort(a, mid + 1, right);
    merge(a, left, mid, right);
  }
}

function run() {
  const input = [38, 27, 43, 3, 9, 82, 10];
  const a = [...input];
  mergeSort(a, 0, a.length - 1);
  return "Mảng đầu vào: [" + input.join(", ") + "]\\nKết quả: [" + a.join(", ") + "]";
}`,
  ),

  'heap-sort': register(
    'heap-sort',
    'Heap Sort',
    'Sắp xếp vun đống — dựng max-heap rồi lấy dần phần tử lớn nhất.',
    `function heapify(a, n, i) {
  let largest = i;
  const l = 2 * i + 1;
  const r = 2 * i + 2;
  if (l < n && a[l] > a[largest]) largest = l;
  if (r < n && a[r] > a[largest]) largest = r;
  if (largest !== i) {
    [a[i], a[largest]] = [a[largest], a[i]];
    heapify(a, n, largest);
  }
}

function heapSort(a) {
  const n = a.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(a, n, i);
  for (let i = n - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    heapify(a, i, 0);
  }
}

function run() {
  const input = [12, 11, 13, 5, 6, 7];
  const a = [...input];
  heapSort(a);
  return "Mảng đầu vào: [" + input.join(", ") + "]\\nKết quả: [" + a.join(", ") + "]";
}`,
  ),

  'counting-sort': register(
    'counting-sort',
    'Counting Sort',
    'Sắp xếp đếm — đếm tần suất rồi tái cấu trúc mảng trong O(N + K).',
    `function countingSort(arr) {
  if (arr.length === 0) return arr;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1;
  const count = new Array(range).fill(0);
  for (const v of arr) count[v - min]++;
  let idx = 0;
  const out = [];
  for (let i = 0; i < range; i++) {
    while (count[i] > 0) {
      out[idx++] = i + min;
      count[i]--;
    }
  }
  return out;
}

function run() {
  const input = [4, 2, 2, 8, 3, 3, 1];
  const out = countingSort(input);
  return "Mảng đầu vào: [" + input.join(", ") + "]\\nKết quả: [" + out.join(", ") + "]";
}`,
  ),

  'radix-sort': register(
    'radix-sort',
    'Radix Sort',
    'Sắp xếp cơ số — sắp theo từng chữ số từ hàng đơn vị lên.',
    `function countingSortByDigit(arr, exp) {
  const n = arr.length;
  const out = new Array(n);
  const count = new Array(10).fill(0);
  for (let i = 0; i < n; i++) count[Math.floor(arr[i] / exp) % 10]++;
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];
  for (let i = n - 1; i >= 0; i--) {
    const d = Math.floor(arr[i] / exp) % 10;
    out[--count[d]] = arr[i];
  }
  for (let i = 0; i < n; i++) arr[i] = out[i];
}

function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
}

function run() {
  const input = [170, 45, 75, 90, 802, 24, 2, 66];
  const a = [...input];
  radixSort(a);
  return "Mảng đầu vào: [" + input.join(", ") + "]\\nKết quả: [" + a.join(", ") + "]";
}`,
  ),

  'bucket-sort': register(
    'bucket-sort',
    'Bucket Sort',
    'Sắp xếp theo xô — phân phối phần tử vào các xô rồi sắp từng xô.',
    `function bucketSort(arr, bucketCount = 5) {
  if (arr.length <= 1) return arr;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = (max - min) / bucketCount || 1;
  const buckets = Array.from({ length: bucketCount }, () => []);
  for (const v of arr) {
    const idx = Math.min(Math.floor((v - min) / range), bucketCount - 1);
    buckets[idx].push(v);
  }
  const out = [];
  for (const b of buckets) {
    b.sort((x, y) => x - y);
    out.push(...b);
  }
  return out;
}

function run() {
  const input = [0.42, 0.32, 0.33, 0.52, 0.37, 0.47, 0.51];
  const out = bucketSort(input);
  return "Mảng đầu vào: [" + input.join(", ") + "]\\nKết quả: [" + out.join(", ") + "]";
}`,
  ),

  // ============================================================ TÌM KIẾM
  'linear-search': register(
    'linear-search',
    'Linear Search',
    'Tìm kiếm tuần tự — duyệt từ đầu đến cuối mảng.',
    `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

function run() {
  const input = [5, 3, 8, 4, 2, 9, 1];
  const target = 4;
  const idx = linearSearch(input, target);
  return "Mảng: [" + input.join(", ") + "]\\nTìm " + target + " → chỉ số " + idx;
}`,
  ),

  'binary-search': register(
    'binary-search',
    'Binary Search',
    'Tìm kiếm nhị phân — chặt đôi không gian tìm kiếm trong mảng đã sắp xếp.',
    `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

function run() {
  const input = [1, 3, 5, 7, 9, 11, 13];
  const target = 9;
  const idx = binarySearch(input, target);
  return "Mảng: [" + input.join(", ") + "]\\nTìm " + target + " → chỉ số " + idx;
}`,
  ),

  'two-pointers': register(
    'two-pointers',
    'Two Pointers',
    'Kỹ thuật hai con trỏ — tìm cặp số có tổng bằng target trên mảng đã sắp xếp.',
    `function twoSumSorted(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [-1, -1];
}

function run() {
  const input = [1, 2, 3, 6, 8, 11];
  const target = 10;
  const [l, r] = twoSumSorted(input, target);
  return "Mảng: [" + input.join(", ") + "]\\nCặp có tổng = " + target + ": [" + input[l] + ", " + input[r] + "] tại (" + l + ", " + r + ")";
}`,
  ),

  'sliding-window': register(
    'sliding-window',
    'Sliding Window',
    'Cửa sổ trượt — tìm tổng lớn nhất của mảng con có độ dài K.',
    `function maxSubarraySum(arr, k) {
  if (arr.length < k) return null;
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}

function run() {
  const input = [2, 1, 5, 1, 3, 2];
  const k = 3;
  return "Mảng: [" + input.join(", ") + "]\\nCửa sổ k = " + k + " → tổng lớn nhất = " + maxSubarraySum(input, k);
}`,
  ),

  // ============================================================ STACK & QUEUE
  'stack': register(
    'stack',
    'Stack',
    'Ngăn xếp LIFO — push/pop/peek và kiểm tra chuỗi ngoặc hợp lệ.',
    `function isValidParentheses(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if ('([{'.includes(ch)) stack.push(ch);
    else if (stack.pop() !== map[ch]) return false;
  }
  return stack.length === 0;
}

function run() {
  const test1 = "([{}])";
  const test2 = "([)]";
  return "'" + test1 + "' hợp lệ? " + isValidParentheses(test1) +
         "\\n'" + test2 + "' hợp lệ? " + isValidParentheses(test2);
}`,
  ),

  'queue': register(
    'queue',
    'Queue',
    'Hàng đợi FIFO — mô phỏng hàng đợi in (printer queue).',
    `class Queue {
  constructor() { this.items = []; }
  enqueue(v) { this.items.push(v); }
  dequeue() { return this.items.shift(); }
  peek() { return this.items[0]; }
  get size() { return this.items.length; }
}

function run() {
  const q = new Queue();
  q.enqueue("Tài liệu A");
  q.enqueue("Tài liệu B");
  q.enqueue("Tài liệu C");
  const first = q.dequeue();
  return "Hàng đợi: [" + q.items.join(", ") + "]\\nĐã in: " + first + "\\nTiếp theo: " + q.peek();
}`,
  ),

  'monotonic-stack': register(
    'monotonic-stack',
    'Monotonic Stack',
    'Ngăn xếp đơn điệu — tìm phần tử lớn hơn gần nhất bên phải.',
    `function nextGreaterElement(arr) {
  const stack = [];
  const result = new Array(arr.length).fill(-1);
  for (let i = arr.length - 1; i >= 0; i--) {
    while (stack.length && arr[stack[stack.length - 1]] <= arr[i]) stack.pop();
    if (stack.length) result[i] = arr[stack[stack.length - 1]];
    stack.push(i);
  }
  return result;
}

function run() {
  const input = [4, 5, 2, 10, 8];
  return "Mảng: [" + input.join(", ") + "]\\nPhần tử lớn hơn gần nhất: [" + nextGreaterElement(input).join(", ") + "]";
}`,
  ),

  // ============================================================ CÂY & ĐỒ THỊ
  'bst': register(
    'bst',
    'Binary Search Tree',
    'Cây nhị phân tìm kiếm — chèn, duyệt inorder ra dãy tăng dần.',
    `class TreeNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}

function insert(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insert(root.left, val);
  else root.right = insert(root.right, val);
  return root;
}

function inorder(root, out = []) {
  if (!root) return out;
  inorder(root.left, out);
  out.push(root.val);
  inorder(root.right, out);
  return out;
}

function run() {
  let root = null;
  for (const v of [50, 30, 70, 20, 40, 60, 80]) root = insert(root, v);
  return "Duyệt inorder: [" + inorder(root).join(", ") + "]";
}`,
  ),

  'tree-traversal': register(
    'tree-traversal',
    'Tree Traversal',
    'Duyệt cây nhị phân — Preorder, Inorder, Postorder.',
    `class TreeNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}

function preorder(n, out = []) {
  if (!n) return out;
  out.push(n.val);
  preorder(n.left, out);
  preorder(n.right, out);
  return out;
}

function inorder(n, out = []) {
  if (!n) return out;
  inorder(n.left, out);
  out.push(n.val);
  inorder(n.right, out);
  return out;
}

function postorder(n, out = []) {
  if (!n) return out;
  postorder(n.left, out);
  postorder(n.right, out);
  out.push(n.val);
  return out;
}

function run() {
  const root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.left.left = new TreeNode(4);
  root.left.right = new TreeNode(5);
  return "Preorder:  [" + preorder(root).join(", ") + "]\\n" +
         "Inorder:   [" + inorder(root).join(", ") + "]\\n" +
         "Postorder: [" + postorder(root).join(", ") + "]";
}`,
  ),

  'bfs': register(
    'bfs',
    'BFS — Duyệt theo chiều rộng',
    'Breadth-First Search — duyệt đồ thị theo từng tầng bằng Queue.',
    `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

function run() {
  const graph = {
    A: ["B", "C"],
    B: ["A", "D", "E"],
    C: ["A", "F"],
    D: ["B"],
    E: ["B", "F"],
    F: ["C", "E"],
  };
  return "Thứ tự BFS từ A: [" + bfs(graph, "A").join(", ") + "]";
}`,
  ),

  'dfs': register(
    'dfs',
    'DFS — Duyệt theo chiều sâu',
    'Depth-First Search — duyệt đồ thị đi sâu nhánh trước khi lùi lại.',
    `function dfs(graph, node, visited = new Set(), order = []) {
  visited.add(node);
  order.push(node);
  for (const neighbor of graph[node] || []) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited, order);
  }
  return order;
}

function run() {
  const graph = {
    A: ["B", "C"],
    B: ["A", "D", "E"],
    C: ["A", "F"],
    D: ["B"],
    E: ["B", "F"],
    F: ["C", "E"],
  };
  return "Thứ tự DFS từ A: [" + dfs(graph, "A").join(", ") + "]";
}`,
  ),

  'dijkstra': register(
    'dijkstra',
    'Dijkstra',
    'Thuật toán Dijkstra — đường đi ngắn nhất từ đỉnh nguồn.',
    `function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  for (const node in graph) distances[node] = Infinity;
  distances[start] = 0;
  while (visited.size < Object.keys(graph).length) {
    let current = null;
    let best = Infinity;
    for (const node in distances) {
      if (!visited.has(node) && distances[node] < best) {
        best = distances[node];
        current = node;
      }
    }
    if (current === null) break;
    visited.add(current);
    for (const [neighbor, weight] of graph[current]) {
      distances[neighbor] = Math.min(distances[neighbor], distances[current] + weight);
    }
  }
  return distances;
}

function run() {
  const graph = {
    A: [["B", 4], ["C", 2]],
    B: [["C", 1], ["D", 5]],
    C: [["D", 8]],
    D: [],
  };
  const d = dijkstra(graph, "A");
  return Object.keys(d).map(k => k + " → " + d[k]).join("\\n");
}`,
  ),
};

export const getPlaygroundDemo = (id: string): PlaygroundDemo | undefined => playgroundDemos[id];

export const playgroundDemoIds: readonly string[] = Object.keys(playgroundDemos);
