# ⚙️ Technical Specification - State Inspector Stack-Heap & DSL Engine (Sprint 10)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình giám sát bộ nhớ **StateInspectorEngine** uốn cong pointer Bezier SVG và bộ biên dịch tập lệnh DSL **DSLEngine** trong Sprint 10.

---

## 1. Trình Giám Sát Call Stack & Pointer Bezier SVG (StateInspectorEngine TS)

Lớp hạt nhân tính toán tọa độ uốn cong Bezier của mũi tên trỏ pointer kết nối ô Stack sang Node Heap bám sát kéo co màn hình dưới 5ms:

```typescript
export interface BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BezierCurvePath {
  pathD: string; // Chuỗi định nghĩa d="M x0 y0 C x1 y1, x2 y2, x3 y3"
  arrowheadAngle: number;
}

export class StateInspectorEngine {
  /**
   * Tính toán đường cong Bezier Cubic kết nối ô Stack sang Node Heap (Stack-to-Heap Bezier)
   * @param source Cực bắt đầu (Stack Element)
   * @param target Cực kết thúc (Heap Node Card)
   */
  public static calculatePointerCurve(
    source: BoundingRect,
    target: BoundingRect
  ): BezierCurvePath {
    // 1. Xác định điểm bắt đầu bên phải ô Stack (Right Center)
    const x0 = source.x + source.width;
    const y0 = source.y + source.height / 2;

    // 2. Xác định điểm kết thúc bên trái Node Heap (Left Center)
    const x3 = target.x;
    const y3 = target.y + target.height / 2;

    // 3. Tính toán các điểm điều khiển kéo uốn mềm mại (Cubic Bezier Control Points)
    const dx = Math.abs(x3 - x0);
    const controlOffset = Math.min(dx * 0.5, 150); // Giới hạn uốn tối đa 150px

    const x1 = x0 + controlOffset;
    const y1 = y0;

    const x2 = x3 - controlOffset;
    const y2 = y3;

    // 4. Tạo chuỗi SVG Path D
    const pathD = `M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;

    // 5. Tính góc quay cho đầu mũi tên (Arrowhead rotation angle)
    const dy = y3 - y2;
    const dxControl = x3 - x2;
    const arrowheadAngle = Math.atan2(dy, dxControl) * (180 / Math.PI);

    return {
      pathD,
      arrowheadAngle
    };
  }
}
```

---

## 2. Động Cơ Biên Dịch Lệnh DSL Tùy Biến (DSLEngine TS)

Bộ biên dịch tập lệnh cấu trúc dữ liệu tối giản (DSL Engine) phục vụ hoạt ảnh trực quan hóa nhanh:

```typescript
export type DSLCommandType = 'ALLOC' | 'PUSH' | 'LINK';

export interface DSLCommand {
  type: DSLCommandType;
  params: string[];
}

export class DSLEngine {
  /**
   * Phân tích biên dịch một dòng lệnh DSL (DSL Line Parser)
   * @param line Dòng lệnh ví dụ: "ALLOC NodeA 12", "PUSH StackB", "LINK NodeA->NodeB"
   */
  public static parseDSLCommand(line: string): DSLCommand {
    const cleaned = line.trim();
    if (!cleaned) {
      throw new Error('Dòng lệnh DSL rỗng!');
    }

    const tokens = cleaned.split(/\s+/);
    const typeToken = tokens[0].toUpperCase();

    if (typeToken === 'ALLOC') {
      if (tokens.length < 3) {
        throw new Error("Lệnh ALLOC sai cú pháp! Định dạng đúng: ALLOC <nodeId> <value>");
      }
      return { type: 'ALLOC', params: [tokens[1], tokens[2]] };
    } else if (typeToken === 'PUSH') {
      if (tokens.length < 2) {
        throw new Error("Lệnh PUSH sai cú pháp! Định dạng đúng: PUSH <value>");
      }
      return { type: 'PUSH', params: [tokens[1]] };
    } else if (typeToken === 'LINK') {
      if (tokens.length < 2 || !tokens[1].includes('->')) {
        throw new Error("Lệnh LINK sai cú pháp! Định dạng đúng: LINK <sourceId>-><targetId>");
      }
      const linkParts = tokens[1].split('->');
      return { type: 'LINK', params: [linkParts[0], linkParts[1]] };
    }

    throw new Error(`Từ khóa lệnh DSL '${typeToken}' không được hỗ trợ!`);
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động State Inspector & DSL (Unit Test Specs)

```typescript
import { describe, it, expect } from 'vitest';
import { StateInspectorEngine, BoundingRect, DSLEngine } from './StateInspectorEngine';

describe('Sprint 10 State Inspector & DSL Compiler Unit Tests', () => {
  it('Should correctly compute Bezier control coordinates and arrowhead angle', () => {
    const source: BoundingRect = { x: 100, y: 100, width: 50, height: 40 }; // Stack Element
    const target: BoundingRect = { x: 400, y: 300, width: 80, height: 60 }; // Heap Node Card

    const curve = StateInspectorEngine.calculatePointerCurve(source, target);

    // Điểm bắt đầu (150, 120), Kết thúc (400, 330)
    expect(curve.pathD).toContain('M 150 120');
    expect(curve.pathD).toContain('C');
    expect(curve.pathD).toContain('400 330');
    expect(curve.arrowheadAngle).toBeCloseTo(0, 0); // Mũi tên hướng ngang phải gần đúng
  });

  it('Should successfully compile custom DSL commands and reject invalid syntax', () => {
    // 1. Kiểm tra lệnh ALLOC
    const cmdAlloc = DSLEngine.parseDSLCommand('ALLOC NodeA 12');
    expect(cmdAlloc.type).toBe('ALLOC');
    expect(cmdAlloc.params).toEqual(['NodeA', '12']);

    // 2. Kiểm tra lệnh LINK
    const cmdLink = DSLEngine.parseDSLCommand('LINK NodeA->NodeB');
    expect(cmdLink.type).toBe('LINK');
    expect(cmdLink.params).toEqual(['NodeA', 'NodeB']);

    // 3. Sai từ khóa lệnh -> Phải ném ngoại lệ báo lỗi sập
    expect(() => {
      DSLEngine.parseDSLCommand('DELETE NodeA');
    }).toThrowError("Từ khóa lệnh DSL 'DELETE' không được hỗ trợ!");
  });
});
```
 Thiết kế giải thuật tính toán uốn cong pointer Bezier SVG bám sát resize cửa sổ cực nhạy dưới 5ms cùng bộ biên dịch tập lệnh DSL tùy biến siêu nhanh 100% Client-side đảm bảo môi trường giám sát bộ nhớ Call Stack-Heap của sinh viên luôn chuẩn chỉ và sống động nhất.
