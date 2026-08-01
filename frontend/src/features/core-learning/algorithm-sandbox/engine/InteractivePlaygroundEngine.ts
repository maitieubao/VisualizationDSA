export interface Vertex {
  id: string;
  x: number;
  y: number;
}

export class InteractivePlaygroundEngine {
  private vertices: Vertex[] = [];
  private selectedVertexId: string | null = null;
  private onStateChange: (vertices: Vertex[]) => void;

  constructor(onStateChange: (vertices: Vertex[]) => void) {
    this.onStateChange = onStateChange;
  }

  /**
   * Tạo Vertex đồ thị mới khi nhấp đúp chuột lên tọa độ Canvas
   */
  public handleDoubleClick(x: number, y: number): void {
    const nextId = String.fromCharCode(65 + this.vertices.length);

    const isOverlap = this.vertices.some((v) => {
      const dist = Math.hypot(v.x - x, v.y - y);
      return dist < 50;
    });

    if (isOverlap) return;

    this.vertices.push({ id: nextId, x, y });
    this.onStateChange([...this.vertices]);
  }

  public selectVertex(id: string): void {
    this.selectedVertexId = id;
  }

  public getSelectedVertexId(): string | null {
    return this.selectedVertexId;
  }

  public clear(): void {
    this.vertices = [];
    this.selectedVertexId = null;
    this.onStateChange([]);
  }
}
