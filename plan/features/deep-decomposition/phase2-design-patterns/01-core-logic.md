# 🧠 SVG Relationship Engine & Bezier Calculations (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của bộ quản lý sơ đồ UML `DesignPatternVisualizerEngine`, giải thuật uốn cong kết nối Cubic Bezier và các ca kiểm thử tự động (Unit Tests).

---

## 1. Bộ máy Quản lý Sơ đồ UML (TypeScript Core Logic)

Lớp `DesignPatternVisualizerEngine` chịu trách nhiệm cập nhật tọa độ kéo thả và tính toán đường dẫn uốn cong Cubic Bezier kết nối SVG động:

```typescript
export interface Point {
  x: number;
  y: number;
}

export interface UMLNode {
  id: string;
  name: string;
  type: 'class' | 'interface' | 'abstract';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UMLLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'inheritance' | 'realization' | 'dependency' | 'association';
}

export class DesignPatternVisualizerEngine {
  private nodes: UMLNode[] = [];
  private links: UMLLink[] = [];

  constructor(initialNodes: UMLNode[], initialLinks: UMLLink[]) {
    this.nodes = initialNodes;
    this.links = initialLinks;
  }

  /**
   * Cập nhật tọa độ của một Node khi người dùng kéo thả trên Canvas
   */
  public updateNodePosition(nodeId: string, x: number, y: number): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.x = x;
      node.y = y;
    }
  }

  /**
   * Tính toán uốn lượn đường vẽ Cubic Bezier giữa Source và Target
   */
  public calculateBezierPath(linkId: string): string {
    const link = this.links.find(l => l.id === linkId);
    if (!link) return '';

    const source = this.nodes.find(n => n.id === link.sourceId);
    const target = this.nodes.find(n => n.id === link.targetId);

    if (!source || !target) return '';

    // Điểm khởi đầu vẽ: Giữa rìa đáy hộp Source
    const startX = source.x + source.width / 2;
    const startY = source.y + source.height;

    // Điểm kết thúc vẽ: Giữa rìa đỉnh hộp Target
    const endX = target.x + target.width / 2;
    const endY = target.y;

    const deltaY = Math.abs(endY - startY);
    const controlOffset = Math.min(100, deltaY * 0.5); // Độ uốn cong tự nhiên

    // Hai điểm neo kiểm soát độ cong
    const cp1X = startX;
    const cp1Y = startY + controlOffset;

    const cp2X = endX;
    const cp2Y = endY - controlOffset;

    return `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
  }

  /**
   * Hoán đổi Strategy Runtime - Snap uốn cong đường dẫn sang Target mới
   */
  public swapStrategyTarget(linkId: string, newTargetId: string): void {
    const link = this.links.find(l => l.id === linkId);
    if (link) {
      link.targetId = newTargetId;
    }
  }

  public getNodes(): UMLNode[] {
    return this.nodes;
  }

  public getLinks(): UMLLink[] {
    return this.links;
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình tính toán uốn lượn Bezier SVG và hoán chuyển Strategy snap mềm mại:

```typescript
import { describe, it, expect } from 'vitest';
import { DesignPatternVisualizerEngine, UMLNode, UMLLink } from './DesignPatternVisualizerEngine';

describe('Design Patterns Engine Unit Tests', () => {
  it('Should correctly calculate path coordinates with uốn lượn Cubic Bezier curves', () => {
    const nodeA: UMLNode = { id: 'N1', name: 'SorterClient', type: 'class', x: 100, y: 100, width: 100, height: 50 };
    const nodeB: UMLNode = { id: 'N2', name: 'ISortStrategy', type: 'interface', x: 100, y: 300, width: 100, height: 50 };
    const link: UMLLink = { id: 'L1', sourceId: 'N1', targetId: 'N2', type: 'dependency' };

    const engine = new DesignPatternVisualizerEngine([nodeA, nodeB], [link]);

    // Lấy tọa độ đường dẫn Cubic Bezier vẽ SVG
    const path = engine.calculateBezierPath('L1');

    // Điểm khởi đầu bắt đầu từ (150, 150), kết thúc tại (150, 300)
    expect(path).toContain('M 150,150');
    expect(path).toContain('C 150,225 150,225 150,300'); // Neo uốn lượn chính giữa
  });

  it('Should snap strategy dependency dynamic arrows successfully on runtime swapping', () => {
    const client: UMLNode = { id: 'Client', name: 'SorterClient', type: 'class', x: 100, y: 100, width: 100, height: 50 };
    const strategyA: UMLNode = { id: 'Bubble', name: 'BubbleSort', type: 'class', x: 100, y: 300, width: 100, height: 50 };
    const strategyB: UMLNode = { id: 'Quick', name: 'QuickSort', type: 'class', x: 300, y: 300, width: 100, height: 50 };
    const link: UMLLink = { id: 'Dependency', sourceId: 'Client', targetId: 'Bubble', type: 'dependency' };

    const engine = new DesignPatternVisualizerEngine([client, strategyA, strategyB], [link]);

    // Học sinh click hoán chuyển BubbleSort -> QuickSort
    engine.swapStrategyTarget('Dependency', 'Quick');

    const updatedLinks = engine.getLinks();
    expect(updatedLinks[0].targetId).toBe('Quick'); // Snap thành công
  });
});
```
 Động cơ quan hệ cấu trúc SVG (UML SVG Engine) và bộ tính toán Cubic Bezier uốn lượn cam kết sơ đồ UML luôn tương tác trơn tru và trực quan hóa chính xác các khớp nối mềm dẻo của SOLID.
