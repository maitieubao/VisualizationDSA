# 📐 TRỰC QUAN HÓA DESIGN PATTERNS & SOLID (STRUCTURAL RELATIONSHIP VISUALIZER)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Structural Relationship Visualizer** - phân hệ trực quan hóa mô hình thiết kế phần mềm Gang of Four (GoF Design Patterns), nguyên lý thiết kế hệ thống SOLID và sơ đồ lớp tương tác động UML thuộc **Phase 2** của **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc của bộ vẽ liên kết SVG động (Declarative SVG Relationship Engine), giải thuật tính toán đường cong kết nối Bezier (Cubic Bezier connection paths), thiết kế các thẻ lớp Glassmorphism và liên kết phát sáng Neon, cùng các giải pháp sư phạm trực quan hóa kiến trúc phần mềm cao cấp.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Sư phạm & Kiến trúc SOLID (PRD)](#1-tầm-nhìn-sư-phạm--kiến-trúc-solid-prd)
2. [Kiến trúc Vẽ Sơ đồ Lớp SVG động (TECHNICAL SPEC)](#2-kiến-trúc-vẽ-sơ-đồ-lớp-svg-động-technical-spec)
3. [Hiện thực hóa Bộ máy Tính đường cong Bezier (Core Logic)](#3-hiện-thực-hóa-bộ-máy-tính-đường-cong-bezier-core-logic)
4. [Thiết kế Thẻ lớp UML Glassmorphism & Viền kết nối Neon (UI/UX)](#4-thiết-kế-thẻ-lớp-uml-glassmorphism--viền-kết-nối-neon-uiux)
5. [Quản lý Trạng thái Pinia Design Patterns Store (State Management)](#5-quản-lý-trạng-thái-pinia-design-patterns-store-state-management)
6. [Hạ tầng Tiền tải Kịch bản Thiết kế Kinh điển (Infrastructure)](#6-hạ-tầng-tiền-tải-kịch-bản-thiết-kế-kinh-điển-infrastructure)
7. [Hợp đồng JSON Schema API Thiết kế Phần mềm (API Reference)](#7-hợp-đồng-json-schema-api-thiết-kế-phần-mềm-api-reference)
8. [Quyết định Kiến trúc & Bộ vẽ Khai báo SVG (ADR)](#8-quyết-định-kiến-trúc--bộ-vẽ-khai-báo-svg-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN SƯ PHẠM & KIẾN TRÚC SOLID (PRD)

### 1.1. Tầm nhìn: Hữu hình hóa các mối liên kết trừu tượng trong Kiến trúc phần mềm
Các khái niệm như nguyên lý Đơn nhiệm (SRP), Đóng mở (OCP), Đảo ngược phụ thuộc (DIP) và các mẫu thiết kế Strategy, Observer, Singleton thường được dạy bằng các đoạn code lý thuyết tĩnh nhàm chán:
*   *Vấn đề:* Sinh viên học "vẹt" định nghĩa nhưng không thể cảm nhận được tại sao Dependency Inversion Principle (DIP) lại giúp hệ thống lỏng lẻo (decoupled) và dễ mở rộng.
*   *Giải pháp:* **Structural Relationship Visualizer** biến các lớp Class thành các hộp thẻ Glassmorphism đẹp mắt trên Canvas. Mối liên kết (kế thừa, hiện thực hóa, phụ thuộc) được biểu diễn bằng các đường cong SVG phát sáng Neon tuyệt đẹp.

### 1.2. Các Kịch bản Trực quan hóa MVP:
*   **Strategy Pattern (Mẫu Chiến lược):** Sinh viên nhấp đổi thuật toán sắp xếp (Bubble Sort $\to$ Quick Sort) tại runtime, đường liên kết phụ thuộc Neon Amber lập tức ngắt khỏi lớp Bubble Sort cũ và uốn lượn uốn cong snap mềm mại vào lớp Quick Sort mới, kèm theo dòng dữ liệu nhấp nháy chuyển dịch qua.
*   **Observer Pattern (Mẫu Quan sát):** Nhấp chuột gửi thông báo từ Subject, đường truyền tín hiệu Neon phát sáng lan tỏa đồng loạt tới 3 Observer đăng ký, đổi màu các hộp Observer rực rỡ.
*   **DIP Decoupling (Đảo ngược Phụ thuộc):** Bật/Tắt nút gạt "DIP Mode" để xem liên kết trực tiếp thô sơ giữa Module cấp cao và cấp thấp (Coupling rất chặt - đường liên kết dày đỏ thô) biến đổi thành đường uốn lượn Cyan mềm mại chui qua Interface trung gian (Loosely coupled).

---

## 2. KIẾN TRÚC VẼ SƠ ĐỒ LỚP SVG ĐỘNG (TECHNICAL SPEC)

Chúng ta xây dựng kiến trúc vẽ liên kết khai báo dựa trên tọa độ trung tâm của các Node thẻ lớp:

### Sơ đồ Liên kết Lớp UML SVG (SVG Relationship Mapping)
```
          [Lớp Client Node] (x: 100, y: 150)
                 |
                 |  Đường cong Cubic Bezier SVG
                 v  Màu Neon Amber (Dependency)
          [Interface Strategy Node] (x: 350, y: 150)
                 |
        +--------+--------+
        |                 |  Đường nét đứt SVG (Implements)
        v                 v
[BubbleSort Strategy]   [QuickSort Strategy]
(x: 500, y: 50)         (x: 500, y: 250)
```

Để vẽ các đường cong uốn lượn mượt mà tránh đè lên các node thẻ khác, hệ thống tính toán đường dẫn bằng công thức **Cubic Bezier Curve**:
$$d = \text{"M } x_1, y_1 \text{ C } x_{c1}, y_{c1} \text{ } x_{c2}, y_{c2} \text{ } x_2, y_2\text{"}$$
Trong đó các điểm kiểm soát $x_{c1}, y_{c1}, x_{c2}, y_{c2}$ được tính toán tự động dựa trên khoảng cách hình học của 2 Node đầu cuối để tạo độ cong uốn lượn tự nhiên.

---

## 3. HIỆN THỰC HÓA BỘ MÁY TÍNH ĐƯỜNG CONG BEZIER (CORE LOGIC)

Chúng ta xây dựng bộ quản lý liên kết bằng TypeScript tính toán tự động tọa độ uốn lượn đường vẽ kết nối SVG.

```typescript
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
```
Lớp `DesignPatternVisualizerEngine` chịu trách nhiệm tự động cập nhật tọa độ liên kết khi sinh viên di chuột kéo thả các Node lớp trên màn hình.

---

## 4. THIẾT KẾ THẺ LỚP UML GLASSMORPHISM & VIỀN NEON (UI/UX)

### 4.1. Thiết kế Giao diện Sơ đồ Lớp UML
*   **Thẻ lớp Class Node:** Thiết kế dạng kính mờ Glassmorphism sang trọng bo góc tròn. Chia làm 3 phần: Tiêu đề lớp, các Thuộc tính (Attributes) và Phương thức (Methods) hiển thị font JetBrains Mono tinh gọn.
*   **Đường vẽ liên kết (Neon links style):** 
    *   **Kế thừa (Inheritance):** Viền màu Emerald xanh lá, mũi tên rỗng tam giác đặc trưng.
    *   **Hiện thực hóa Interface (Realization):** Nét đứt màu Neon Cyan phát sáng lộng lẫy.
    *   **Phụ thuộc (Dependency):** Đường nét đứt màu vàng Amber ấm áp, mũi tên chữ V.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA DESIGN PATTERNS STORE (STATE MANAGEMENT)

Xây dựng bộ quản lý trạng thái Pinia Setup Store `useDesignPatternsStore.ts`:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDesignPatternsStore = defineStore('designPatterns', () => {
  const nodes = ref<UMLNode[]>([]);
  const links = ref<UMLLink[]>([]);
  const activePatternId = ref('strategy-pattern');
  const isDIPEnabled = ref(false);

  return { nodes, links, activePatternId, isDIPEnabled };
});
```

---

## 6. HẠ TẦNG TIỀN TẢI KỊCH BẢN THIẾT KẾ KINH ĐIỂN (INFRASTRUCTURE)

### 6.1. Dịch vụ Tải Sơ đồ (UML Scenario Asset Loader)
Hạ tầng Client tiền tải các tệp JSON cấu trúc của các mẫu thiết kế từ Backend để đảm bảo khi sinh viên bấm chuyển đổi giữa Strategy, Observer hay Singleton, sơ đồ dựng lập tức không có trễ mạng.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & BỘ VẼ KHAI BÁO SVG (ADR)

### ADR-13: SVG-based Declarative Relationship Rendering Engine

*   **Quyết định:** Sử dụng công nghệ **Đồ họa Vector Khai báo (SVG - Scalable Vector Graphics)** kết hợp tương tác kéo thả DOM để vẽ sơ đồ UML, thay vì sử dụng HTML Canvas vẽ tĩnh.
*   **Lý do:** HTML Canvas vẽ dưới dạng bitmap, gây vỡ hạt pixel khi thu phóng sơ đồ. SVG biểu diễn mối liên kết dưới dạng thực thể DOM, cho phép gán trực tiếp các sự kiện chuột `@mousedown`, dễ dàng thay đổi kiểu dáng đường nét đứt Neon lấp lánh bằng CSS class, và hỗ trợ thu phóng vô hạn (vector zoom) cực kỳ sắc nét trên màn hình Retina 4K.
*   **Kết quả:** Sơ đồ UML tương tác sống động, kéo thả các hộp lớp uốn lượn đường vẽ mượt mà 60 FPS, mang lại nhãn quan thực nghiệm tuyệt vời.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Thẻ lớp Glassmorphism & Vẽ Bezier SVG (Ngày 1-3):** Thiết kế hộp Node lớp, viết công thức Cubic Bezier vẽ các đường uốn lượn, hỗ trợ kéo thả kéo thả Node bằng chuột.
2.  **Sprint B: Động cơ Hoạt ảnh Runtime & Decoupling Toggles (Ngày 4-6):** Lập trình chuyển đổi Strategy runtime snap liên kết, hoạt ảnh phát tín hiệu Observer lan tỏa, và nút bật tắt "DIP Mode" đổi màu đỏ/cyan Neon.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Thẻ lớp Class Node hiển thị chuẩn chỉ phân cấp Attributes/Methods đẹp mắt.
*   Kéo thả các hộp lớp bằng chuột di chuyển tự do, các đường liên kết uốn lượn uốn cong bám đuổi tọa độ trơn tru 60 FPS.
*   Sắp xếp Strategy snap mượt mà đường vẽ Neon Amber sang lớp chiến lược mới.
*   Nút bật/tắt DIP chuyển đổi chính xác cấu trúc sơ đồ lớp, thể hiện độ lỏng lẻo decoupled rõ nét.
