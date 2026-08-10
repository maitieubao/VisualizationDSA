import type { AlgorithmResult, FrameDTO, GraphEdgeDTO, GraphNodeDTO, HighlightIndices, TreeNodeDTO } from '../types/algorithm.types';
import { defaultHighlights } from './highlightHelpers';

interface BSTNode {
  id: number;
  originalValue: number;
  currentDistance: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

function serializeTree(node: BSTNode | null): { treeNodes: TreeNodeDTO[]; values: number[] } {
  const treeNodes: TreeNodeDTO[] = [];
  const values: number[] = [];

  function traverse(n: BSTNode | null): void {
    if (!n) return;
    treeNodes.push({
      id: n.id,
      value: n.currentDistance, 
      leftNodeId: n.left?.id ?? null,
      rightNodeId: n.right?.id ?? null,
    });
    values.push(n.currentDistance);
    traverse(n.left);
    traverse(n.right);
  }
  traverse(node);
  return { treeNodes, values };
}

function insertBST(node: BSTNode | null, value: number, idCounter: { val: number }): BSTNode {
  if (node === null) {
    idCounter.val++;
    return { id: idCounter.val, originalValue: value, currentDistance: 999, left: null, right: null };
  }
  if (value < node.originalValue) {
    node.left = insertBST(node.left, value, idCounter);
  } else {
    node.right = insertBST(node.right, value, idCounter);
  }
  return node;
}


export function generateBFS(inputData: number[]): AlgorithmResult {
  const frames: FrameDTO[] = [];
  let stepId = 0;
  const idCounter = { val: 0 };
  let root: BSTNode | null = null;

  for (const val of inputData) {
    root = insertBST(root, val, idCounter);
  }

  
  function resetDistancesToOriginal(n: BSTNode | null): void {
    if (!n) return;
    n.currentDistance = n.originalValue;
    resetDistancesToOriginal(n.left);
    resetDistancesToOriginal(n.right);
  }
  resetDistancesToOriginal(root);

  const pseudoCode = [
    'BFS(root):',
    '  queue = [root]',
    '  visited = {root}',
    '  while queue is not empty:',
    '    curr = queue.dequeue()',
    '    for neighbor in curr.neighbors:',
    '      if neighbor not in visited:',
    '        visited.add(neighbor)',
    '        queue.enqueue(neighbor)'
  ];

  const { treeNodes: initialNodes, values: initialVals } = serializeTree(root);
  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: 'Khởi tạo cấu trúc cây nhị phân để chuẩn bị thực hiện duyệt BFS.',
    dataState: [],
    highlights: defaultHighlights(),
    treeNodes: initialNodes,
  });

  if (!root) {
    return { algorithmId: 'bfs', pseudoCode, frames };
  }

  const queue: BSTNode[] = [];
  const visitedValues: number[] = [];

  queue.push(root);
  const { treeNodes: qNodes, values: qVals } = serializeTree(root);
  frames.push({
    stepId: ++stepId,
    activeLine: 1,
    explanation: `Bắt đầu duyệt BFS. Đưa nút gốc ${root.originalValue} vào Queue.`,
    dataState: [...visitedValues],
    highlights: defaultHighlights({ active: [root.id] }),
    treeNodes: qNodes,
  });

  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedValues.push(curr.originalValue);

    const { treeNodes: stepNodes } = serializeTree(root);
    frames.push({
      stepId: ++stepId,
      activeLine: 4,
      explanation: `Lấy nút ${curr.originalValue} ra khỏi Queue và đánh dấu đã duyệt.`,
      dataState: [...visitedValues],
      highlights: defaultHighlights({ active: [curr.id] }),
      treeNodes: stepNodes,
    });

    if (curr.left) {
      queue.push(curr.left);
      const { treeNodes: leftNodes } = serializeTree(root);
      frames.push({
        stepId: ++stepId,
        activeLine: 8,
        explanation: `Phát hiện con trái ${curr.left.originalValue} chưa duyệt. Thêm vào Queue.`,
        dataState: [...visitedValues],
        highlights: defaultHighlights({ active: [curr.left.id] }),
        treeNodes: leftNodes,
      });
    }

    if (curr.right) {
      queue.push(curr.right);
      const { treeNodes: rightNodes } = serializeTree(root);
      frames.push({
        stepId: ++stepId,
        activeLine: 8,
        explanation: `Phát hiện con phải ${curr.right.originalValue} chưa duyệt. Thêm vào Queue.`,
        dataState: [...visitedValues],
        highlights: defaultHighlights({ active: [curr.right.id] }),
        treeNodes: rightNodes,
      });
    }
  }

  const { treeNodes: finalNodes } = serializeTree(root);
  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: `Duyệt BFS hoàn tất! Thứ tự duyệt: [${visitedValues.join(', ')}]`,
    dataState: [...visitedValues],
    highlights: defaultHighlights(),
    treeNodes: finalNodes,
  });

  return { algorithmId: 'bfs', pseudoCode, frames };
}


export function generateDFS(inputData: number[]): AlgorithmResult {
  const frames: FrameDTO[] = [];
  let stepId = 0;
  const idCounter = { val: 0 };
  let root: BSTNode | null = null;

  for (const val of inputData) {
    root = insertBST(root, val, idCounter);
  }

  function resetDistancesToOriginal(n: BSTNode | null): void {
    if (!n) return;
    n.currentDistance = n.originalValue;
    resetDistancesToOriginal(n.left);
    resetDistancesToOriginal(n.right);
  }
  resetDistancesToOriginal(root);

  const pseudoCode = [
    'DFS(node, visited):',
    '  visited.add(node)',
    '  for neighbor in node.neighbors:',
    '    if neighbor not in visited:',
    '      DFS(neighbor, visited)'
  ];

  const { treeNodes: initialNodes } = serializeTree(root);
  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: 'Khởi tạo cấu trúc cây nhị phân để chuẩn bị thực hiện duyệt DFS.',
    dataState: [],
    highlights: defaultHighlights(),
    treeNodes: initialNodes,
  });

  if (!root) {
    return { algorithmId: 'dfs', pseudoCode, frames };
  }

  const visitedValues: number[] = [];

  function traverseDFS(node: BSTNode): void {
    visitedValues.push(node.originalValue);
    const { treeNodes: stepNodes } = serializeTree(root);
    frames.push({
      stepId: ++stepId,
      activeLine: 1,
      explanation: `Duyệt qua nút ${node.originalValue} và thêm vào kết quả duyệt.`,
      dataState: [...visitedValues],
      highlights: defaultHighlights({ active: [node.id] }),
      treeNodes: stepNodes,
    });

    if (node.left) {
      const { treeNodes: leftNodes } = serializeTree(root);
      frames.push({
        stepId: ++stepId,
        activeLine: 3,
        explanation: `Đi sâu xuống cây con bên trái của nút ${node.originalValue}.`,
        dataState: [...visitedValues],
        highlights: defaultHighlights({ active: [node.left.id] }),
        treeNodes: leftNodes,
      });
      traverseDFS(node.left);
    }

    if (node.right) {
      const { treeNodes: rightNodes } = serializeTree(root);
      frames.push({
        stepId: ++stepId,
        activeLine: 3,
        explanation: `Đi sâu xuống cây con bên phải của nút ${node.originalValue}.`,
        dataState: [...visitedValues],
        highlights: defaultHighlights({ active: [node.right.id] }),
        treeNodes: rightNodes,
      });
      traverseDFS(node.right);
    }

    const { treeNodes: backtrackNodes } = serializeTree(root);
    frames.push({
      stepId: ++stepId,
      activeLine: 0,
      explanation: `Quay lui (Backtrack) từ nút ${node.originalValue}.`,
      dataState: [...visitedValues],
      highlights: defaultHighlights({ active: [node.id] }),
      treeNodes: backtrackNodes,
    });
  }

  traverseDFS(root);

  const { treeNodes: finalNodes } = serializeTree(root);
  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: `Duyệt DFS hoàn tất! Thứ tự duyệt: [${visitedValues.join(', ')}]`,
    dataState: [...visitedValues],
    highlights: defaultHighlights(),
    treeNodes: finalNodes,
  });

  return { algorithmId: 'dfs', pseudoCode, frames };
}


export function generateDijkstra(inputData: number[]): AlgorithmResult {
  const frames: FrameDTO[] = [];
  let stepId = 0;

  const nodeCount = Math.min(inputData.length, 6);

  const nodes: GraphNodeDTO[] = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: i,
      value: inputData[i] ?? i * 10,
      x: 100 + (i % 3) * 160,
      y: 80 + Math.floor(i / 3) * 140,
      label: `V${i}`,
    });
  }

  const edges: GraphEdgeDTO[] = [];
  for (let i = 0; i < nodeCount - 1; i++) {
    const w = Math.abs((inputData[i] ?? i) % 9) + 1;
    edges.push({ from: i, to: i + 1, weight: w, directed: true });
  }
  for (let i = 0; i + 2 < nodeCount; i += 2) {
    const w = Math.abs((inputData[i + 1] ?? i) % 5) + 1;
    edges.push({ from: i, to: i + 2, weight: w, directed: true });
  }

  const pseudoCode = [
    'Dijkstra(graph, source):',
    '  dist = {v: infinity for v in graph}',
    '  dist[source] = 0',
    '  pq = PriorityQueue(source, 0)',
    '  while pq is not empty:',
    '    curr, d = pq.popMin()',
    '    for neighbor, weight in curr.edges:',
    '      newDist = d + weight',
    '      if newDist < dist[neighbor]:',
    '        dist[neighbor] = newDist',
    '        pq.push(neighbor, newDist)',
  ];

  const dist: Record<number, number> = {};
  const prev: Record<number, number | null> = {};
  const visited: boolean[] = [];
  for (let i = 0; i < nodeCount; i++) {
    dist[i] = i === 0 ? 0 : Infinity;
    prev[i] = null;
    visited[i] = false;
  }

  const buildFrame = (
    activeLine: number,
    explanation: string,
    highlights: Partial<HighlightIndices>,
    highlightedEdge?: { from: number; to: number },
    currentPath?: number[] | null,
  ): void => {
    frames.push({
      stepId: ++stepId,
      activeLine,
      explanation,
      dataState: nodes.map(n => n.value),
      highlights: defaultHighlights(highlights),
      graphNodes: nodes,
      graphEdges: edges.map(e => ({
        ...e,
        highlighted: highlightedEdge !== undefined && e.from === highlightedEdge.from && e.to === highlightedEdge.to,
      })),
      distances: { ...dist },
      currentPath: currentPath ?? null,
    });
  };

  if (nodeCount === 0) {
    frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Mảng rỗng — không có đồ thị để chạy Dijkstra.', dataState: [], highlights: defaultHighlights(), graphNodes: [], graphEdges: [], distances: {}, currentPath: null });
    return { algorithmId: 'dijkstra', pseudoCode, frames };
  }

  buildFrame(2, 'Khởi tạo Dijkstra. Nút nguồn V0 có khoảng cách = 0, các nút còn lại = ∞.', { active: [0] });

  while (true) {
    let u = -1;
    let minD = Infinity;
    for (let i = 0; i < nodeCount; i++) {
      if (!visited[i] && dist[i] < minD) {
        minD = dist[i];
        u = i;
      }
    }
    if (u === -1) break;

    visited[u] = true;
    buildFrame(5, `Chọn nút V${u} có khoảng cách dist = ${dist[u]} nhỏ nhất trong tập chưa xử lý.`, { active: [u] });

    for (const edge of edges) {
      if (edge.from !== u || visited[edge.to]) continue;
      const v = edge.to;
      const w = edge.weight ?? 1;
      const newD = dist[u] + w;
      buildFrame(6, `Xét cạnh V${u} → V${v} (trọng số ${w}). dist[V${u}] + ${w} = ${newD} so với dist[V${v}] = ${dist[v] === Infinity ? '∞' : dist[v]}.`, { active: [u, v] }, { from: u, to: v });
      if (newD < dist[v]) {
        dist[v] = newD;
        prev[v] = u;
        buildFrame(8, `Cập nhật khoảng cách ngắn nhất của nút V${v} thành ${newD}.`, { active: [v] }, { from: u, to: v });
      }
    }
  }

  let lastReachable = 0;
  for (let i = 0; i < nodeCount; i++) {
    if (dist[i] !== Infinity) lastReachable = i;
  }
  const path: number[] = [];
  let cur: number | null = lastReachable;
  while (cur !== null && cur !== undefined) {
    path.unshift(cur);
    cur = prev[cur] ?? null;
  }

  buildFrame(0, `Dijkstra hoàn tất! Khoảng cách ngắn nhất: ${JSON.stringify(dist).replace(/Infinity/g, '∞')}.`, {}, undefined, path.length > 1 ? path : null);

  return { algorithmId: 'dijkstra', pseudoCode, frames };
}


export function generateSlidingWindow(inputData: number[]): AlgorithmResult {
  const frames: FrameDTO[] = [];
  let stepId = 0;
  const arr = [...inputData];
  const n = arr.length;
  const k = Math.min(3, n);

  const pseudoCode = [
    'slidingWindow(A, K):',
    '  left = 0, currentSum = 0, maxSum = 0',
    '  for right from 0 to N-1:',
    '    currentSum += A[right]',
    '    if right - left + 1 > K:',
    '      currentSum -= A[left]',
    '      left++',
    '    maxSum = max(maxSum, currentSum)',
    '  return maxSum'
  ];

  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: `Bắt đầu thuật toán Cửa sổ trượt. Kích thước cửa sổ K = ${k}.`,
    dataState: [...arr],
    highlights: defaultHighlights(),
  });

  let left = 0;
  let currentSum = 0;
  let maxSum = 0;

  for (let right = 0; right < n; right++) {
    currentSum += arr[right];

    const active: number[] = [];
    const dimmed: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i >= left && i <= right) active.push(i);
      else dimmed.push(i);
    }

    frames.push({
      stepId: ++stepId,
      activeLine: 3,
      explanation: `Dịch chuyển biên phải sang index ${right} (A[${right}] = ${arr[right]}). Tổng hiện tại = {${currentSum}}.`,
      dataState: [...arr],
      highlights: defaultHighlights({ active, dimmed, low: left, high: right }),
    });

    if (right - left + 1 > k) {
      const oldVal = arr[left];
      currentSum -= oldVal;
      left++;

      const postActive: number[] = [];
      const postDimmed: number[] = [];
      for (let i = 0; i < n; i++) {
        if (i >= left && i <= right) postActive.push(i);
        else postDimmed.push(i);
      }

      frames.push({
        stepId: ++stepId,
        activeLine: 6,
        explanation: `Cửa sổ vượt quá kích thước K = ${k}. Loại bỏ biên trái A[${left - 1}] = ${oldVal} và dịch biên trái sang index ${left}. Tổng = {${currentSum}}.`,
        dataState: [...arr],
        highlights: defaultHighlights({ active: postActive, dimmed: postDimmed, low: left, high: right }),
      });
    }

    if (right - left + 1 === k) {
      const prevMax = maxSum;
      maxSum = Math.max(maxSum, currentSum);

      const winActive: number[] = [];
      const winDimmed: number[] = [];
      for (let i = 0; i < n; i++) {
        if (i >= left && i <= right) winActive.push(i);
        else winDimmed.push(i);
      }

      let expl = `Cửa sổ đạt kích thước K = ${k}. So sánh tổng hiện tại (${currentSum}) với maxSum cũ (${prevMax}).`;
      if (currentSum > prevMax) {
        expl += ` Cập nhật maxSum mới = ${currentSum}!`;
      } else {
        expl += ` maxSum giữ nguyên = ${maxSum}.`;
      }

      frames.push({
        stepId: ++stepId,
        activeLine: 7,
        explanation: expl,
        dataState: [...arr],
        highlights: defaultHighlights({ active: winActive, dimmed: winDimmed, low: left, high: right }),
      });
    }
  }

  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: `Thuật toán hoàn tất! Tổng con lớn nhất có độ dài K = ${k} là: ${maxSum}.`,
    dataState: [...arr],
    highlights: defaultHighlights(),
  });

  return { algorithmId: 'sliding-window', pseudoCode, frames };
}


export function generateMonotonicStack(inputData: number[]): AlgorithmResult {
  const frames: FrameDTO[] = [];
  let stepId = 0;
  const arr = [...inputData];
  const n = arr.length;
  const res = Array(n).fill(-1);
  const stack: number[] = []; 

  const pseudoCode = [
    'nextGreaterElement(A):',
    '  stack = []',
    '  res = [-1 for _ in A]',
    '  for i from 0 to N-1:',
    '    while stack is not empty and A[stack.top()] < A[i]:',
    '      idx = stack.pop()',
    '      res[idx] = A[i]',
    '    stack.push(i)',
    '  return res'
  ];

  function getStackValues(): number[] {
    return stack.map(idx => arr[idx]);
  }

  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: 'Khởi tạo ngăn xếp đơn điệu (Monotonic Stack) rỗng.',
    dataState: [],
    highlights: defaultHighlights(),
  });

  for (let i = 0; i < n; i++) {
    frames.push({
      stepId: ++stepId,
      activeLine: 3,
      explanation: `Duyệt đến phần tử A[${i}] = ${arr[i]}.`,
      dataState: getStackValues(),
      highlights: defaultHighlights({ compare: [i] }),
    });

    while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
      const poppedIdx = stack.pop()!;
      res[poppedIdx] = arr[i];

      frames.push({
        stepId: ++stepId,
        activeLine: 5,
        explanation: `Vì A[stack.top()] (A[${poppedIdx}] = ${arr[poppedIdx]}) < A[${i}] (${arr[i]}), pop index ${poppedIdx}. Tìm thấy phần tử lớn hơn tiếp theo của ${arr[poppedIdx]} là ${arr[i]}.`,
        dataState: getStackValues(),
        highlights: defaultHighlights({ compare: [poppedIdx] }),
      });
    }

    stack.push(i);
    frames.push({
      stepId: ++stepId,
      activeLine: 7,
      explanation: `Đẩy index ${i} (giá trị ${arr[i]}) vào ngăn xếp.`,
      dataState: getStackValues(),
      highlights: defaultHighlights({ active: [i] }),
    });
  }

  frames.push({
    stepId: ++stepId,
    activeLine: 0,
    explanation: `Thuật toán hoàn tất! Kết quả Next Greater Element: [${res.join(', ')}]`,
    dataState: getStackValues(),
    highlights: defaultHighlights(),
  });

  return { algorithmId: 'monotonic-stack', pseudoCode, frames };
}
