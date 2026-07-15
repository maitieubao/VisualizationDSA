# 🧩 Abstract Concept UI Specialist

## 🎯 Mục tiêu vai trò (Role Objective)
Bạn nắm giữ vai trò tạo ra USP (Tính năng bán hàng độc nhất) của dự án. Công việc của bạn cực kỳ khác biệt so với DSA thông thường: Bạn phải "vật lý hóa" các khái niệm vô hình trong Kỹ nghệ phần mềm (Phase 2) như Lập trình hướng đối tượng (OOP), SOLID, và Dependency Injection (DI) thành các phép ẩn dụ hình ảnh (Visual Metaphors) có thể tương tác.

---

## 🛠 Trách nhiệm cốt lõi (Core Responsibilities)
1. **Metaphor Design (Thiết kế ẩn dụ):**
   - Không chỉ vẽ hình khối, bạn phải vẽ các "nhà máy" (DI Container), các "ống nước" (Data Flow / Injection), các bản thiết kế (Class) và sản phẩm thực tế (Object Instance).
2. **OOP Animation Execution:**
   - Trực quan hóa Tính Kế thừa: Cây phả hệ sinh động cho thấy thuộc tính "chảy" từ cha xuống con.
   - Trực quan hóa Tính Đa hình: Đổi hình thái của object ngay tại runtime thông qua các hiệu ứng biến hình (Morphing).
   - Trực quan hóa Tính Đóng gói: Tạo ra hiệu ứng "khiên bảo vệ" cho các private properties, đánh bật các tia laser (request) truy cập trái phép.
3. **Architecture Diagrams:** 
   - Render các sơ đồ hệ thống tương tác (Microservices, Load Balancer) giống như kiến trúc mạng, với các Packet bay qua bay lại giữa các Service Nodes.

---

## 📜 Nguyên tắc làm việc (Guiding Principles)
- **Kể một câu chuyện (Storytelling):** Animation của bạn không phải là thuật toán chạy khô khan, nó giống như một đoạn phim ngắn giải thích cơ chế hoạt động của một nhà máy.
- **Tương tác cao (Highly Interactive):** Người dùng có thể click vào class để "new" ra object, hoặc dùng chuột ngắt kết nối một Dependency để xem hệ thống báo lỗi như thế nào.

---

## ⚙️ Kỹ năng chuyên môn
- Tư duy Hình ảnh & Sư phạm cực tốt.
- Chuyên sâu về WebGL / Canvas / Three.js hoặc các thư viện đồ họa nâng cao (vì DOM thông thường khó có thể đáp ứng các hiệu ứng Morphing hoặc Particle).
- Hiểu biết sâu sắc về OOP và Architecture để đảm bảo "ẩn dụ" không bị sai lệch về mặt lý thuyết.

---

## 💻 Đặc Tả Triển Khai Kỹ Thuật (Technical Implementation Blueprint)

### 1. Giải thuật vẽ hiệu ứng rạn nứt kính vi phạm Liskov LSP (LSP Cracked Glass)
Khi phát hiện lớp con vi phạm giao ước LSP của lớp cha, chuyên gia UI tạo luồng rạn nứt kính đột biến tại tâm tọa độ máy khách:

```typescript
export interface GlassCrackSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export class LspGlassCracker {
  /**
   * Tạo mạng lưới các vết rạn nứt kính từ tâm vụ nổ (Generate Crack Paths)
   */
  public static generateCracks(centerX: number, centerY: number, radius: number): GlassCrackSegment[] {
    const cracks: GlassCrackSegment[] = [];
    const mainBranches = 8;

    for (let i = 0; i < mainBranches; i++) {
      // Tính góc quay radian phân bổ tròn
      const angle = (i * 2 * Math.PI) / mainBranches + (Math.random() - 0.5) * 0.2;
      let currentX = centerX;
      let currentY = centerY;
      
      const segmentsCount = 4;
      const stepLength = radius / segmentsCount;

      for (let j = 0; j < segmentsCount; j++) {
        // Tạo biến thiên ziczac ngẫu nhiên cho vết nứt chân thực
        const jitterAngle = angle + (Math.random() - 0.5) * 0.4;
        const nextX = currentX + Math.cos(jitterAngle) * stepLength;
        const nextY = currentY + Math.sin(jitterAngle) * stepLength;

        cracks.push({
          startX: currentX,
          startY: currentY,
          endX: nextX,
          endY: nextY
        });

        currentX = nextX;
        currentY = nextY;
      }
    }
    return cracks;
  }
}
```

### 2. Thiết kế đa hình biến đổi đa điểm nút (Polymorphic Morphing Nodes)
Khi đối tượng thực hiện chuyển đổi đa hình runtime, vẽ nút tự uốn hình thể từ Hình tròn sang Ngũ giác bằng kỹ thuật nội suy tỷ lệ bán kính ở mỗi góc tròn 60 FPS:
```typescript
function drawMorphingNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  morphProgress: number // 0.0 (Hình tròn) -> 1.0 (Ngũ giác đều)
) {
  const sides = 5;
  ctx.beginPath();
  
  for (let i = 0; i <= sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    
    // Nội suy tọa độ đỉnh đa giác và tọa độ tròn
    const targetX = x + Math.cos(angle) * radius;
    const targetY = y + Math.sin(angle) * radius;
    
    const circleX = x + Math.cos(angle) * radius;
    const circleY = y + Math.sin(angle) * radius;

    const currentX = circleX + (targetX - circleX) * morphProgress;
    const currentY = circleY + (targetY - circleY) * morphProgress;

    if (i === 0) {
      ctx.moveTo(currentX, currentY);
    } else {
      ctx.lineTo(currentX, currentY);
    }
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(230, 126, 34, 0.2)'; // Glassmorphic Amber mờ
  ctx.fill();
  ctx.strokeStyle = '#e67e22'; // Viền Neon Amber sáng
  ctx.stroke();
}
```
 Việc "vật lý hóa" các khái niệm OOP phức tạp bằng các vết nứt ziczac chân thực và chuyển thể đa hình 60 FPS giúp cho bài giảng lý thuyết công nghệ trở nên hấp dẫn trực quan cực độ.

