# 🧬 TRỰC QUAN HÓA HƯỚNG ĐỐI TƯỢNG (OOP CONCEPTS VISUALIZER)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **OOP Concepts Visualizer Engine** - phân hệ trực quan hóa 4 trụ cột lập trình hướng đối tượng (Kế thừa, Đa hình, Đóng gói, Trừu tượng) của **VisualizationDSA** hỗ trợ vẽ sơ đồ lớp UML kính mờ tương tác, mô phỏng bảng tra đa hình động VTable Lookup và khóa đóng gói Padlock chỉ định quyền truy cập. Tài liệu này đặc tả chi tiết thuật toán suy diễn kiểu thời gian thực Reflection Engine, các hoạt ảnh bắn tia laser phân giải đa hình và kiến trúc lưu trữ trạng thái đối tượng trên Heap ảo ở Client-side.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Trực quan hóa OOP (PRD)](#1-tầm-nhìn-trực-quan-hóa-oop-prd)
2. [Động cơ Phân giải Đa hình động & VTable (TECHNICAL SPEC)](#2-động-cơ-phân-giải-đa-hình-động--vtable-technical-spec)
3. [Hiện thực hóa Bộ máy Reflection & Heap ảo (Core Logic)](#3-hiện-thực-hóa-bộ-máy-reflection--heap-ảo-core-logic)
4. [Bố cục Sơ đồ Lớp UML & Khóa Padlock Modifiers (UI/UX)](#4-bố-cục-sơ-đồ-lớp-uml--khóa-padlock-modifiers-uiux)
5. [Quản lý Trạng thái Pinia useOOPVisualizerStore (State Management)](#5-quản-lý-trạng-thái-pinia-useoopvisualizerstore-state-management)
6. [Hạ tầng Vẽ Tia Laser Bắn Đa hình SVG Pointer (Infrastructure)](#6-hạ-tầng-vẽ-tia-laser-bắn-đa-hình-svg-pointer-infrastructure)
7. [Hợp đồng Siêu dữ liệu Lớp JSON Schema & C# Entity (API Reference)](#7-hợp-đồng-siêu-dữ-liệu-lớp-json-schema--c-entity-api-reference)
8. [Quyết định Kiến trúc & Động cơ Reflection mô phỏng (ADR)](#8-quyết-định-kiến-trúc--động-cơ-reflection-mô-phỏng-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN TRỰC QUAN HÓA OOP (PRD)

### 1.1. Tầm nhìn: Biến các khái niệm OOP trừu tượng thành các Khối tương tác vật lý
Các khái niệm cốt lõi của Lập trình hướng đối tượng (OOP) cực kỳ trừu tượng và thường bị sinh viên học vẹt mà không hiểu cách chúng vận hành dưới bộ nhớ RAM máy tính:
*   *Vấn đề:* Sinh viên thuộc lòng lý thuyết "Đa hình là ghi đè phương thức" nhưng không biết tại sao cùng gọi `shape.draw()` mà máy tính lại tự chọn vẽ hình tròn thay vì hình vuông ở Runtime. Họ học access modifiers (`private`, `protected`, `public`) nhưng không thấy được "bức tường bảo vệ" đóng gói ngăn chặn truy cập ngoài thế nào.
*   *Giải pháp:* **OOP Concepts Visualizer Engine** hiện thực hóa trực quan vật lý các khái niệm này:
    1.  **Polymorphism VTable Sandbox:** Mô phỏng bảng tra VTable sống động. Khi người dùng chạy lệnh `shape.draw()`, một tia laser phát sáng bắn từ con trỏ đối tượng, duyệt qua bảng VTable của lớp cha rồi định tuyến sang phương thức ghi đè `Circle.draw()` của lớp con, làm bừng sáng mã nguồn tương ứng.
    2.  **Padlocks Modifiers:** Hiển thị ổ khóa trực quan ngay cạnh thuộc tính: khóa đỏ đóng chặt (`private`), khóa vàng hé mở (`protected`), khóa xanh lục mở toang (`public`). Click truy cập trái phép thuộc tính `private` lập tức làm rung lắc thẻ lớp kèm tiếng bíp báo động lỗi đóng gói Glassmorphic.

---

## 2. ĐỘNG CƠ PHÂN GIẢI ĐA HÌNH ĐỘNG & VTABLE (TECHNICAL SPEC)

Để mô phỏng đa hình động chính xác, hệ thống thiết lập bộ giải quyết con trỏ hàm **Virtual Method Table (VTable)**:

```
[Biến: Shape shape] ---> [Heap Object: Circle Instance]
                                 |
                                 v VTable Lookup
                         [Bảng VTable của Circle]
                         - draw()  ===> Circle.draw() [Tia Laser Reroute]
                         - area()  ===> Shape.area()  [Inherited Method]
```

### Thuật toán Tra cứu VTable (Virtual Dynamic Dispatch Resolve)
Hệ thống sử dụng giải thuật duyệt tìm kiếm từ lớp con ngược lên lớp cha (Inheritance Chain Lookup) để định vị đúng con trỏ hàm sẽ thực thi khi có lệnh kích hoạt.

---

## 3. HIỆN THỰC HÓA BỘ MÁY REFLECTION & HEAP ẢO (CORE LOGIC)

Chúng ta xây dựng bộ mô phỏng khai báo lớp, khởi tạo đối tượng Heap ảo bằng TypeScript:

```typescript
export interface ClassMember {
  name: string;
  type: 'FIELD' | 'METHOD';
  accessModifier: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  isOverridden?: boolean;
}

export interface ClassDefinition {
  className: string;
  parentClass?: string;
  members: ClassMember[];
}
```
Lớp hạt nhân `OOPReflectionEngine` và `HeapObjectManager` sẽ được đặc tả trong tệp core logic.

---

## 4. BỐ CỤC SƠ ĐỒ LỚP UML & KHÓA PADLOCK MODIFIERS (UI/UX)

### 4.1. Thiết kế Giao diện Khối Lớp UML Kính mờ (Glassmorphic Class Cards)
*   **UML Glassmorphic Card:** Các thẻ mô tả lớp thiết kế viền mờ trong suốt lơ lửng trên nền lưới tối, hiển thị tên Class phía trên, thuộc tính ở giữa và phương thức phía dưới.
*   **Neon Access Padlocks:** Ổ khóa bảo vệ quyền truy cập:
    *   `private` (khóa đóng đỏ rực neon): Khi click cố tình truy cập từ đối tượng bên ngoài, thẻ lớp rung lắc theo hiệu ứng chấn động (encapsulation breach wiggle animation) kèm viền đỏ nhấp nháy.
    *   `protected` (khóa hé vàng neon): Cho phép truy cập trong lớp kế thừa con.
    *   `public` (khóa mở lục neon): Cho phép truy cập tự do từ mọi nơi.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA PATH STORE (STATE MANAGEMENT)

Xây dựng store `useOOPVisualizerStore.ts` quản lý bộ nhớ Heap ảo:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOOPVisualizerStore = defineStore('oopVisualizer', () => {
  const heapObjects = ref<any[]>([]);
  const activeClassHierarchy = ref<string[]>([]);
  const currentDynamicDispatchStep = ref('');

  return { heapObjects, activeClassHierarchy, currentDynamicDispatchStep };
});
```

---

## 6. HẠ TẦNG VẼ TIA LASER BẮN ĐA HÌNH SVG POINTER (INFRASTRUCTURE)

*   **Bộ vẽ tia Laser Phân giải đa hình (SVG Dynamic Pointer Laser):**
    *   Khi kích hoạt cuộc gọi đa hình, hạ tầng SVG tự động trích xuất vị trí tọa độ của nút gọi hàm `shape.draw()` trong Monaco Editor, vẽ một đường laser phát sáng cuộn từ nguồn bắn trực chỉ vào bảng tra cứu VTable của Heap Object, rồi uốn cong phản phản chiếu (rerouting) bắn trực tiếp vào ô phương thức `Circle.draw()` của lớp con. Tất cả hoạt ảnh vẽ laser được tối ưu hóa mượt mà 60 FPS qua `requestAnimationFrame`.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐỘNG CƠ REFLECTION MÔ PHỎNG (ADR)

### ADR-20: Bộ mô phỏng Siêu dữ liệu Meta-Object Reflection Simulator chạy ở Client-side

*   **Quyết định:** Hiện thực hóa một bộ máy tự lập trình Reflection (Meta-Object System) mô phỏng chính xác hành vi hướng đối tượng thuần túy ở Client-side, cho phép người dùng tự định nghĩa lớp, kế thừa, ghi đè phương thức và phân bổ Heap ảo trực tiếp tại trình duyệt mà không cần trình biên dịch Backend cồng kềnh.
*   **Lý do:**
    1.  *Tương tác phản hồi tức thời dưới 10ms (Micro-feedback Loops):* Giúp sinh viên gõ thử nghiệm đổi modifier từ `public` sang `private` nhìn thấy ổ khóa sập đỏ rực ngay lập tức mà không phải chờ đợi máy chủ biên dịch lại code.
    2.  *Học thuật hóa bộ nhớ Heap/Stack:* Trực quan hóa chính xác cơ chế cấp phát ô nhớ, bảng tra VTable và liên kết con trỏ tham chiếu lướt êm ái trên màn hình.

---

## 8. KẾ HẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Thẻ Lớp UML & Ổ khóa Neon (Ngày 1-3):** Dựng thẻ class kính mờ UML, các biểu tượng ổ khóa Neon access modifiers, hoạt ảnh rung chấn động khi lỗi đóng gói.
2.  **Sprint B: Bộ máy Reflection, Heap ảo & Tia Laser VTable (Ngày 4-6):** Lập trình `OOPReflectionEngine`, cấp phát Heap ảo, vẽ tia laser VTable dynamic dispatch uốn lượn SVG, đồng bộ hóa Monaco call trigger.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Bộ giải tra cứu VTable dynamic dispatch định tuyến con trỏ đa hình chính xác 100% (gọi lớp cha gọi đúng override lớp con).
*   Tia Laser SVG bắn phát sáng chuẩn xác tọa độ giữa nơi gọi và ô nhớ VTable, không lệch line.
*   Click vi phạm đóng gói `private` kích hoạt hiệu ứng wiggle chấn động đỏ rực và âm thanh cảnh báo thành công.
*   Tủ danh sách Heap Object liệt kê trực quan tọa độ địa chỉ nhớ giả lập (Ví dụ: `0x7FFF32`).
*   Hoạt ảnh di chuyển chuyển động laser mượt mà đạt chuẩn 60 FPS trên thiết bị sinh viên.
