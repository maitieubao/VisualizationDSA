export interface ParsedGraph {
  nodes: Array<{ id: string }>;
  edges: Array<{ sourceId: string; targetId: string; weight: number }>;
}

export class CustomInputParser {
  /**
   * Phân tích chuỗi mảng tùy biến của sinh viên (ví dụ: "12, 5, 8, 20")
   */
  public static parseNumberArray(input: string): number[] {
    const cleaned = input.trim();
    if (!cleaned) return [];

    // Tách bằng dấu phẩy và làm sạch khoảng trắng
    const tokens = cleaned.split(',').map(t => t.trim());
    const result: number[] = [];

    for (const token of tokens) {
      const num = Number(token);
      if (isNaN(num)) {
        throw new Error(`Giá trị '${token}' không phải là số hợp lệ!`);
      }
      result.push(num);
    }

    if (result.length > 20) {
      throw new Error('Độ dài mảng tùy biến không được vượt quá 20 phần tử!');
    }

    return result;
  }

  /**
   * Phân tích ma trận kề đồ thị dạng chuỗi văn bản (Adjacency Matrix Text Parser)
   * Định dạng mong đợi: "A-B:10, B-C:20, A-C:50"
   */
  public static parseAdjacencyList(input: string): ParsedGraph {
    const cleaned = input.trim();
    if (!cleaned) return { nodes: [], edges: [] };

    const nodesSet = new Set<string>();
    const edges: Array<{ sourceId: string; targetId: string; weight: number }> = [];

    const tokens = cleaned.split(',').map(t => t.trim());

    for (const token of tokens) {
      // Biểu thức Regex kiểm tra định dạng "Source-Target:Weight"
      const match = token.match(/^([A-Za-z0-9]+)-([A-Za-z0-9]+):([0-9]+)$/);
      if (!match) {
        throw new Error(`Định dạng cạnh nối '${token}' không đúng! Định dạng chuẩn: Source-Target:Weight (Ví dụ: A-B:10)`);
      }

      const source = match[1];
      const target = match[2];
      const weight = Number(match[3]);

      nodesSet.add(source);
      nodesSet.add(target);
      edges.push({ sourceId: source, targetId: target, weight });
    }

    const nodes = Array.from(nodesSet).map(id => ({ id }));
    return { nodes, edges };
  }
}
