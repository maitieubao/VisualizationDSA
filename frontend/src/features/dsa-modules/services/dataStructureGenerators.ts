import type { AlgorithmResult, FrameDTO, HighlightIndices, TreeNodeDTO } from '../types/algorithm.types';

function defaultHighlights(overrides?: Partial<HighlightIndices>): HighlightIndices {
  return { compare: [], swap: [], sorted: [], dimmed: [], active: [], ...overrides };
}

export function generateStack(inputData: number[]): AlgorithmResult {
  const frames: FrameDTO[] = [], stack: number[] = [];
  let stepId = 0;
  const pseudoCode = ['stack = []', 'push(value):', '  stack.append(value)', 'pop():', '  return stack.removeLast()'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Khởi tạo ngăn xếp rỗng.', dataState: [], highlights: defaultHighlights() });
  for (const val of inputData) { stack.push(val); frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Push(${val})`, dataState: [...stack], highlights: defaultHighlights({ active: [stack.length - 1] }) }); }
  while (stack.length > 0) {
    const top = stack.length - 1, val = stack[top];
    frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Pop() → ${val}`, dataState: [...stack], highlights: defaultHighlights({ swap: [top] }) });
    stack.pop();
    frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Đã lấy ${val}. Còn ${stack.length} phần tử.`, dataState: [...stack], highlights: defaultHighlights() });
  }
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Ngăn xếp rỗng!', dataState: [], highlights: defaultHighlights() });
  return { algorithmId: 'stack', pseudoCode, frames };
}

export function generateQueue(inputData: number[]): AlgorithmResult {
  const frames: FrameDTO[] = [], queue: number[] = [];
  let stepId = 0;
  const pseudoCode = ['queue = []', 'enqueue(value):', '  queue.append(value)', 'dequeue():', '  return queue.removeFirst()'];
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Khởi tạo hàng đợi rỗng.', dataState: [], highlights: defaultHighlights() });
  for (const val of inputData) { queue.push(val); frames.push({ stepId: ++stepId, activeLine: 2, explanation: `Enqueue(${val})`, dataState: [...queue], highlights: defaultHighlights({ active: [queue.length - 1] }) }); }
  while (queue.length > 0) {
    const val = queue[0];
    frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Dequeue() → ${val}`, dataState: [...queue], highlights: defaultHighlights({ swap: [0] }) });
    queue.shift();
    frames.push({ stepId: ++stepId, activeLine: 4, explanation: `Đã lấy ${val}. Còn ${queue.length} phần tử.`, dataState: [...queue], highlights: defaultHighlights() });
  }
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Hàng đợi rỗng!', dataState: [], highlights: defaultHighlights() });
  return { algorithmId: 'queue', pseudoCode, frames };
}

export function generateBST(inputData: number[]): AlgorithmResult {
  const frames: FrameDTO[] = [];
  let stepId = 0, nodeIdCounter = 0;
  const pseudoCode = ['insert(root, value):', '  if root is null: return new Node(value)', '  if value < root.value:', '    root.left = insert(root.left, value)', '  else:', '    root.right = insert(root.right, value)', '  return root'];

  interface BSTNode { id: number; value: number; left: BSTNode | null; right: BSTNode | null }

  function serializeTree(node: BSTNode | null): { treeNodes: TreeNodeDTO[]; values: number[] } {
    const treeNodes: TreeNodeDTO[] = [], values: number[] = [];
    function traverse(n: BSTNode | null): void {
      if (!n) return;
      treeNodes.push({ id: n.id, value: n.value, leftNodeId: n.left?.id ?? null, rightNodeId: n.right?.id ?? null });
      values.push(n.value); traverse(n.left); traverse(n.right);
    }
    traverse(node);
    return { treeNodes, values };
  }

  let root: BSTNode | null = null;

  function insert(node: BSTNode | null, value: number): BSTNode {
    if (node === null) return { id: ++nodeIdCounter, value, left: null, right: null };
    if (value < node.value) { const { treeNodes, values } = serializeTree(root); frames.push({ stepId: ++stepId, activeLine: 2, explanation: `${value} < ${node.value}, đi trái`, dataState: values, highlights: defaultHighlights({ active: [node.id] }), treeNodes: treeNodes.length > 0 ? treeNodes : undefined }); node.left = insert(node.left, value); }
    else { const { treeNodes, values } = serializeTree(root); frames.push({ stepId: ++stepId, activeLine: 5, explanation: `${value} >= ${node.value}, đi phải`, dataState: values, highlights: defaultHighlights({ active: [node.id] }), treeNodes: treeNodes.length > 0 ? treeNodes : undefined }); node.right = insert(node.right, value); }
    return node;
  }

  frames.push({ stepId: ++stepId, activeLine: 0, explanation: 'Khởi tạo cây BST rỗng.', dataState: [], highlights: defaultHighlights() });
  for (const val of inputData) { root = insert(root, val); const { treeNodes, values } = serializeTree(root); frames.push({ stepId: ++stepId, activeLine: 1, explanation: `Đã chèn node ${val}`, dataState: values, highlights: defaultHighlights({ active: [nodeIdCounter] }), treeNodes }); }
  const { treeNodes: finalNodes, values: finalValues } = serializeTree(root);
  frames.push({ stepId: ++stepId, activeLine: 0, explanation: `Cây BST hoàn tất với ${inputData.length} node.`, dataState: finalValues, highlights: defaultHighlights(), treeNodes: finalNodes });
  return { algorithmId: 'bst', pseudoCode, frames };
}
