import type { NodeDTO, EdgeDTO } from '../store/usePlaygroundStore';

export interface AdjacencyEntry { target: string; weight: number; }
export interface GraphPayload {
  algorithmId: string;
  inputType: string;
  nodes: string[];
  adjacencyList: Record<string, AdjacencyEntry[]>;
}

/** Kết quả import JSON: dữ liệu đã lọc hợp lệ kèm danh sách lỗi chi tiết (IP-001/IP-031). */
export interface ImportResult {
  nodes: NodeDTO[];
  edges: EdgeDTO[];
  errors: string[];
}

/** Biên tọa độ thế giới hợp lý khi clamp x/y trong import (IP-031). */
const MAX_COORD = 1000;
const MIN_WEIGHT = 1;
const MAX_WEIGHT = 999;

/** Clamp giá trị số vào [min, max]; chỉ gọi khi value đã được xác nhận finite. */
function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Chuyển id/label thành chuỗi rỗng khi thiếu — không còn chuỗi giả "undefined" (IP-003). */
function toNonEmptyString(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    const text = String(value).trim();
    return text.length > 0 ? text : '';
  }
  return '';
}

export class GraphParser {
  /**
   * IP-042: `graphType` quyết định chiều cạnh — undirected thêm 2 chiều,
   * directed CHỈ thêm 1 chiều theo hướng from→to (A→B thì B không chứa A).
   * Trước đây luôn thêm 2 chiều → payload adjacency của đồ thị có hướng sai.
   */
  static toAdjacencyList(
    nodes: NodeDTO[],
    edges: EdgeDTO[],
    algorithmId = 'dijkstra',
    graphType: 'undirected' | 'directed' = 'undirected',
  ): GraphPayload {
    const adjacencyList: Record<string, AdjacencyEntry[]> = {};
    for (const node of nodes) adjacencyList[node.label] = [];
    for (const edge of edges) {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (fromNode && toNode) {
        adjacencyList[fromNode.label].push({ target: toNode.label, weight: edge.weight });
        if (graphType === 'undirected') {
          adjacencyList[toNode.label].push({ target: fromNode.label, weight: edge.weight });
        }
      }
    }
    return { algorithmId, inputType: 'adjacency-list', nodes: nodes.map(n => n.label), adjacencyList };
  }

  static findIsolatedNodes(nodes: NodeDTO[], edges: EdgeDTO[]): string[] {
    if (nodes.length === 0) return [];
    const adjMap = new Map<string, Set<string>>(nodes.map(n => [n.id, new Set()]));
    for (const edge of edges) {
      adjMap.get(edge.from)?.add(edge.to);
      adjMap.get(edge.to)?.add(edge.from);
    }
    const visited = new Set<string>([nodes[0].id]);
    const queue = [nodes[0].id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = adjMap.get(current);
      if (neighbors) {
        for (const n of neighbors) {
          if (!visited.has(n)) { visited.add(n); queue.push(n); }
        }
      }
    }
    return nodes.filter(n => !visited.has(n.id)).map(n => n.label);
  }

  static exportToJSON(nodes: NodeDTO[], edges: EdgeDTO[]): string {
    return JSON.stringify({ nodes, edges }, null, 2);
  }

  /**
   * IP-001: reject/filter node có x/y không phải Number.isFinite — tránh NaN vào store
   * làm canvas "chết" và ForceDirectedEngine lan NaN toàn bộ vận tốc.
   * IP-031: không biến đổi âm thầm — radius 0 không còn bị đổi thành 20 (clamp tối thiểu 1),
   * weight 0/âm là INVALID (đẩy lỗi, không âm thầm đổi 1); x/y được clamp vào [0, 1000].
   */
  static importFromJSON(jsonStr: string): ImportResult | null {
    try {
      const parsed: unknown = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') return null;
      const record = parsed as Record<string, unknown>;
      if (!Array.isArray(record.nodes) || !Array.isArray(record.edges)) return null;

      const errors: string[] = [];
      const nodes: NodeDTO[] = [];
      const nodeIds = new Set<string>();

      for (const item of record.nodes) {
        const r = (item ?? {}) as Record<string, unknown>;
        const id = toNonEmptyString(r.id);
        const label = toNonEmptyString(r.label);
        const x = Number(r.x);
        const y = Number(r.y);
        const radius = Number(r.radius);
        if (!id) { errors.push(`Bỏ đỉnh thiếu id (phần tử thứ ${nodes.length + 1}).`); continue; }
        if (nodeIds.has(id)) { errors.push(`Bỏ đỉnh trùng id "${id}".`); continue; }
        if (!label) { errors.push(`Bỏ đỉnh "${id}" thiếu nhãn (label không được rỗng).`); continue; }
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          errors.push(`Bỏ đỉnh "${label}" có tọa độ không hợp lệ (x/y phải là số hữu hạn, nhận x=${JSON.stringify(r.x)}, y=${JSON.stringify(r.y)}).`);
          continue;
        }
        if (!Number.isFinite(radius)) {
          errors.push(`Bỏ đỉnh "${label}" có radius không hợp lệ (phải là số hữu hạn).`);
          continue;
        }
        nodeIds.add(id);
        nodes.push({
          id,
          label,
          x: clampNumber(x, 0, MAX_COORD),
          y: clampNumber(y, 0, MAX_COORD),
          radius: clampNumber(radius, 1, MAX_COORD),
        });
      }

      const acceptedIds = new Set(nodes.map(n => n.id));
      const edges: EdgeDTO[] = [];
      for (const item of record.edges) {
        const r = (item ?? {}) as Record<string, unknown>;
        const id = toNonEmptyString(r.id);
        const from = toNonEmptyString(r.from);
        const to = toNonEmptyString(r.to);
        const weight = Number(r.weight);
        if (!id) { errors.push(`Bỏ cạnh thiếu id (phần tử thứ ${edges.length + 1}).`); continue; }
        if (!from || !to) { errors.push(`Bỏ cạnh "${id}" thiếu đỉnh đầu/cuối.`); continue; }
        if (!acceptedIds.has(from) || !acceptedIds.has(to)) {
          errors.push(`Bỏ cạnh "${id}" có đỉnh đầu/cuối không tồn tại (dangling edge).`);
          continue;
        }
        if (!Number.isFinite(weight) || weight < MIN_WEIGHT || weight > MAX_WEIGHT) {
          errors.push(`Bỏ cạnh "${id}" có trọng số không hợp lệ (cần số từ ${MIN_WEIGHT} đến ${MAX_WEIGHT}, nhận: ${JSON.stringify(r.weight)}).`);
          continue;
        }
        edges.push({ id, from, to, weight });
      }

      return { nodes, edges, errors };
    } catch {
      return null;
    }
  }
}
