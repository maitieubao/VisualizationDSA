export interface ParsedGraph {
  nodes: Array<{ id: string }>;
  edges: Array<{ sourceId: string; targetId: string; weight: number }>;
}

export class CustomInputParser {
  


  public static parseNumberArray(input: string): number[] {
    const cleaned = input.trim();
    if (!cleaned) return [];

    
    const tokens = cleaned.split(',').map(t => t.trim());
    const result: number[] = [];

    for (const token of tokens) {
      const num = Number(token);
      if (isNaN(num)) {
        throw new Error(`Giá trị '${token}' không phải là số hợp lệ!`);
      }
      result.push(num);
    }

    if (result.length > 15) {
      throw new Error('Độ dài mảng tùy biến không được vượt quá 15 phần tử!');
    }

    return result;
  }

  



  public static parseAdjacencyList(input: string): ParsedGraph {
    const cleaned = input.trim();
    if (!cleaned) return { nodes: [], edges: [] };

    const nodesSet = new Set<string>();
    const edges: Array<{ sourceId: string; targetId: string; weight: number }> = [];

    const tokens = cleaned.split(',').map(t => t.trim());

    for (const token of tokens) {
      
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
