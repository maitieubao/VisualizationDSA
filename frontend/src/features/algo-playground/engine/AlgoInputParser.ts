import type { GraphSnapshotEdge, GraphSnapshotNode, TreeSnapshotNode } from '../../../core/CompilerStepExecutor';

export type AlgoInputKind = 'array' | 'tree' | 'graph';

export interface AlgoInputOptions {
  array?: number[];
  treeNodes?: TreeSnapshotNode[];
  graphNodes?: GraphSnapshotNode[];
  graphEdges?: GraphSnapshotEdge[];
}

const GRAPH_EDGE_REGEX = /^(\w+)\s*([>\-])\s*(\w+)(?:\s*:\s*([-+]?\d+(?:\.\d+)?))?$/;

/** Số phần tử tối đa cho mảng input của playground (chống quá tải 10000 bước thực thi) */
export const MAX_ARRAY_LENGTH = 100;

export class AlgoInputParser {
  public static parse(raw: string, kind: AlgoInputKind): AlgoInputOptions {
    switch (kind) {
      case 'array':
        return { array: AlgoInputParser.parseNumberArray(raw) };
      case 'tree':
        return { treeNodes: AlgoInputParser.buildTreeFromArray(AlgoInputParser.parseNumberArray(raw)) };
      case 'graph':
        return AlgoInputParser.buildGraphFromText(raw);
      default:
        return {};
    }
  }

  public static parseNumberArray(raw: string): number[] {
    const parts = raw
      .split(/[,;\s]+/)
      .map(part => part.trim())
      .filter(part => part.length > 0);

    const result: number[] = [];
    for (const part of parts) {
      const num = Number(part);
      if (Number.isNaN(num)) {
        throw new Error(`Giá trị '${part}' không phải là số hợp lệ!`);
      }
      result.push(num);
    }

    if (result.length > MAX_ARRAY_LENGTH) {
      throw new Error(`Độ dài mảng tối đa ${MAX_ARRAY_LENGTH} phần tử (hiện tại: ${result.length})!`);
    }

    return result;
  }

  public static buildTreeFromArray(values: number[]): TreeSnapshotNode[] {
    if (values.length === 0) {
      values = [5, 3, 8, 4, 2];
    }
    const nodes: TreeSnapshotNode[] = [];
    const nodeById = new Map<string, TreeSnapshotNode>();
    const valueCount = new Map<number, number>();

    const ensureNode = (value: number): TreeSnapshotNode => {
      const count = (valueCount.get(value) ?? 0) + 1;
      valueCount.set(value, count);
      const id = count === 1 ? String(value) : `${value}_${count}`;
      let node = nodeById.get(id);
      if (!node) {
        node = { id, value, leftId: null, rightId: null };
        nodeById.set(id, node);
        nodes.push(node);
      }
      return node;
    };

    if (values.length > 0) {
      const root = ensureNode(values[0]);
      for (let i = 1; i < values.length; i++) {
        const value = values[i];
        let current = root;
        const inserted = ensureNode(value);
        while (true) {
          if (value < current.value) {
            if (current.leftId === null) {
              current.leftId = inserted.id;
              break;
            }
            const left = nodeById.get(current.leftId);
            if (!left) break;
            current = left;
          } else {
            if (current.rightId === null) {
              current.rightId = inserted.id;
              break;
            }
            const right = nodeById.get(current.rightId);
            if (!right) break;
            current = right;
          }
        }
      }
    }

    return nodes;
  }

  public static buildGraphFromText(raw: string): { graphNodes: GraphSnapshotNode[]; graphEdges: GraphSnapshotEdge[] } {
    const edges: GraphSnapshotEdge[] = [];
    const nodeIds: string[] = [];
    const seen = new Set<string>();

    const parts = raw.split(',').map(part => part.trim()).filter(part => part.length > 0);

    for (const part of parts) {
      const match = part.match(GRAPH_EDGE_REGEX);
      if (!match) {
        throw new Error(`Định dạng cạnh '${part}' không đúng! Định dạng chuẩn: A-B:10 (vô hướng) hoặc A>B (có hướng)`);
      }
      const a = match[1];
      const directed = match[2] === '>';
      const b = match[3];
      const weight = match[4] !== undefined ? Number(match[4]) : undefined;
      edges.push({ from: a, to: b, weight, directed });
      for (const id of [a, b]) {
        if (!seen.has(id)) {
          seen.add(id);
          nodeIds.push(id);
        }
      }
    }

    if (nodeIds.length === 0) {
      nodeIds.push('A', 'B', 'C', 'D');
      edges.push({ from: 'A', to: 'B', weight: 4 }, { from: 'B', to: 'C', weight: 2 }, { from: 'A', to: 'C', weight: 1 });
    }

    const n = nodeIds.length;
    const graphNodes: GraphSnapshotNode[] = nodeIds.map((id, index) => {
      const angle = (2 * Math.PI * index) / n - Math.PI / 2;
      return {
        id,
        label: id,
        x: 0.5 + 0.38 * Math.cos(angle),
        y: 0.5 + 0.38 * Math.sin(angle),
      };
    });

    return { graphNodes, graphEdges: edges };
  }
}
