import type { AlgorithmResult, FrameDTO, GraphNodeDTO, GraphEdgeDTO, HighlightIndices } from '../types/algorithm.types';

function defaultHighlights(overrides?: Partial<HighlightIndices>): HighlightIndices {
  return { compare: [], swap: [], sorted: [], dimmed: [], active: [], ...overrides };
}

function buildGraphFrame(
  stepId: number,
  activeLine: number,
  explanation: string,
  nodes: GraphNodeDTO[],
  edges: GraphEdgeDTO[],
  highlights?: Partial<HighlightIndices>,
  distances?: Record<number, number> | null,
  currentPath?: number[] | null,
): FrameDTO {
  return {
    stepId,
    activeLine,
    explanation,
    dataState: nodes.map(n => n.value),
    highlights: defaultHighlights(highlights),
    graphNodes: nodes,
    graphEdges: edges,
    distances: distances ?? null,
    currentPath: currentPath ?? null,
  };
}

export function generateBellmanFord(inputData: number[]): AlgorithmResult {
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
    edges.push({ from: i, to: i + 1, weight: inputData[i] ?? 1, directed: true });
  }
  if (nodeCount > 2) {
    edges.push({ from: nodeCount - 1, to: 0, weight: inputData[nodeCount - 1] ?? 1, directed: true });
  }

  const pseudoCode = [
    'BellmanFord(graph, source):',
    '  dist[source] = 0',
    '  for i = 1 to V-1:',
    '    for each edge (u,v,w):',
    '      if dist[u] + w < dist[v]:',
    '        dist[v] = dist[u] + w',
    '  for each edge (u,v,w):',
    '    if dist[u] + w < dist[v]:',
    '      return NEGATIVE_CYCLE',
  ];

  const dist: Record<number, number> = {};
  for (let i = 0; i < nodeCount; i++) dist[i] = i === 0 ? 0 : Infinity;

  frames.push(buildGraphFrame(++stepId, 0, 'Khởi tạo Bellman-Ford. Nút nguồn V0 có khoảng cách = 0, các nút còn lại = ∞.', nodes, edges, { active: [0] }, dist));

  for (let iteration = 1; iteration <= nodeCount - 1; iteration++) {
    let updated = false;
    for (const edge of edges) {
      const u = edge.from;
      const v = edge.to;
      const w = edge.weight ?? 1;

      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        updated = true;
      }

      frames.push(buildGraphFrame(
        ++stepId,
        4,
        `Lần lặp thứ ${iteration}. Xét cạnh V${u} → V${v} (trọng số ${w}). dist[V${v}] = ${dist[v] === Infinity ? '∞' : dist[v]}.`,
        nodes,
        edges.map(e => ({ ...e, highlighted: e.from === u && e.to === v })),
        { active: [u, v] },
        { ...dist },
      ));
    }
    if (!updated) {
      frames.push(buildGraphFrame(++stepId, 0, `Không có cập nhật nào trong lần lặp ${iteration}. Thuật toán kết thúc sớm.`, nodes, edges, {}, dist));
      break;
    }
  }

  
  let negativeCycle = false;
  for (const edge of edges) {
    const u = edge.from;
    const v = edge.to;
    const w = edge.weight ?? 1;
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      negativeCycle = true;
      frames.push(buildGraphFrame(++stepId, 8, `Phát hiện chu trình âm! dist[V${u}] + ${w} < dist[V${v}].`, nodes, edges.map(e => ({ ...e, highlighted: e.from === u && e.to === v })), { active: [u, v] }, dist));
      break;
    }
  }

  if (!negativeCycle) {
    frames.push(buildGraphFrame(++stepId, 0, `Bellman-Ford hoàn tất! Không phát hiện chu trình âm. Khoảng cách ngắn nhất: ${JSON.stringify(dist).replace(/Infinity/g, '∞')}.`, nodes, edges, {}, dist));
  }

  return { algorithmId: 'bellman-ford', pseudoCode, frames };
}