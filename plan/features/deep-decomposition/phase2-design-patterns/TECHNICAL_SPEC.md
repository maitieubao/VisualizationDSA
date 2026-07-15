# 🛠 Technical Specification - Structural Relationship (Phase 2)

Tài liệu này đặc tả chi tiết kiến trúc hạt nhân của bộ vẽ liên kết SVG động (Declarative SVG Relationship Engine) và giải thuật tính toán tọa độ uốn cong kết nối bằng đường cong Cubic Bezier.

---

## 1. Giải thuật Tính toán Đường cong Cubic Bezier Uốn lượn SVG

Để kết nối 2 hộp thẻ lớp (Node Source và Node Target) có kích thước cố định bằng một sợi chỉ uốn lượn mềm mại tự nhiên, hệ thống tính toán đường dẫn Path SVG thông qua công thức Cubic Bezier Curve:

```typescript
export interface Point {
  x: number;
  y: number;
}

export class SVGPathCalculator {
  /**
   * Tính toán đường dẫn Cubic Bezier uốn lượn mượt mà giữa Source và Target
   */
  public static calculateBezierPath(
    source: Point,
    sourceWidth: number,
    sourceHeight: number,
    target: Point,
    targetWidth: number,
    targetHeight: number
  ): string {
    // 1. Tính toán điểm trung tâm rìa cạnh kết nối của Source và Target
    const startX = source.x + sourceWidth / 2;
    const startY = source.y + sourceHeight; // Nối từ đáy hộp Source
    
    const endX = target.x + targetWidth / 2;
    const endY = target.y; // Nối tới đỉnh hộp Target

    // 2. Tính toán khoảng cách chênh lệch chiều dọc để làm điểm neo uốn cong
    const deltaY = Math.abs(endY - startY);
    const controlOffset = Math.min(100, deltaY * 0.5); // Độ uốn cong tự nhiên

    // Hai điểm neo kiểm soát độ cong uốn lượn (Control Points)
    const cp1X = startX;
    const cp1Y = startY + controlOffset;
    
    const cp2X = endX;
    const cp2Y = endY - controlOffset;

    return `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
  }
}
```

---

## 2. Hoạt ảnh Truyền tín hiệu (Observer Path Neon Pulse Animation)

Để vẽ luồng truyền tin nhắn nhấp nháy từ Subject sang Observer chạy dọc theo đường cong SVG Path:

*   Chúng ta sử dụng thuộc tính CSS **`stroke-dasharray`** và **`stroke-dashoffset`** của SVG.
*   Bằng việc dịch chuyển `stroke-dashoffset` liên tục, ta tạo ra hoạt ảnh các vệt sáng tròn chạy dọc trên sợi chỉ liên kết cực kỳ sinh động:

```css
@keyframes path-pulse-dash {
  to {
    stroke-dashoffset: -40;
  }
}

.observer-active-pulse-path {
  stroke: #06B6D4; /* Cyan phát sáng */
  stroke-width: 3;
  stroke-dasharray: 10, 5;
  animation: path-pulse-dash 1.5s infinite linear;
}
```
 Đồ họa Vector Khai báo SVG kết hợp giải thuật uốn cong Cubic Bezier cam kết sơ đồ kiến trúc luôn hiển thị sắc nét tuyệt đối và di chuyển uốn lượn bám đuổi tọa độ hoàn hảo 60 FPS.
