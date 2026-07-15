# 🧬 TRỰC QUAN HÓA NGUYÊN LÝ SOLID (SOLID PRINCIPLES VISUALIZER)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **SOLID Principles Visualizer Engine** - phân hệ trực quan hóa 5 nguyên lý thiết kế hướng đối tượng SOLID của **VisualizationDSA** hỗ trợ biểu diễn nhiệt hóa thẻ lớp vi phạm Single Responsibility, hiệu ứng nứt vỡ rạn nứt laser khi vi phạm Liskov Substitution và mô phỏng luồng phụ thuộc Dependency Inversion. Tài liệu này đặc tả chi tiết các giải thuật tính toán mức độ gắn kết Cohesion, phân tích tính hợp lệ thay thế con trỏ LSP và kiến trúc xây dựng bộ phát hạt lửa nhiệt lượng Canvas 2D mượt mà 60 FPS.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Trực quan hóa SOLID (PRD)](#1-tầm-nhìn-trực-quan-hóa-solid-prd)
2. [Động cơ Tính toán Cohesion & Khớp nối Liskov (TECHNICAL SPEC)](#2-động-cơ-tính-toán-cohesion--khớp-nối-liskov-technical-spec)
3. [Hiện thực hóa Trình phân tích SOLID & Hệ thống hạt (Core Logic)](#3-hiện-thực-hóa-trình-phân-tích-solid--hệ-thống-hạt-core-logic)
4. [Bố cục Nhiệt hóa SRP & Rạn nứt Laser LSP (UI/UX)](#4-bố-cục-nhiệt-hóa-srp--rạn-nứt-laser-lsp-uiux)
5. [Quản lý Trạng thái Pinia useSOLIDVisualizerStore (State Management)](#5-quản-lý-trạng-thái-pinia-usesolidvisualizerstore-state-management)
6. [Hạ tầng Canvas Hạt Lửa Nhiệt & SVG Paths (Infrastructure)](#6-hạ-tầng-canvas-hạt-lửa-nhiệt--svg-paths-infrastructure)
7. [Hợp đồng Siêu dữ liệu SOLID JSON Schema & C# Entity (API Reference)](#7-hợp-đồng-siêu-dữ-liệu-solid-json-schema--c-entity-api-reference)
8. [Quyết định Kiến trúc & Động cơ Lint SOLID Client (ADR)](#8-quyết-định-kiến-trúc--động-cơ-lint-solid-client-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN TRỰC QUAN HÓA SOLID (PRD)

### 1.1. Tầm nhìn: Biến các nguyên lý thiết kế khô khan thành các Tương tác Đồ họa Trực quan
Các nguyên lý thiết kế hệ thống SOLID là đỉnh cao của OOP, nhưng thường được dạy theo kiểu lý thuyết suông hoặc ví dụ code phức tạp khiến sinh viên không nắm bắt được bản chất tác hại của việc vi phạm:
*   *Vấn đề:* Sinh viên học "Single Responsibility" nhưng không có cảm xúc về một "Class ôm đồm quá nhiều việc". Họ học "Liskov Substitution" nhưng không thấy được hệ thống bị "gãy đổ" thế nào khi thay thế lớp con.
*   *Giải pháp:* **SOLID Principles Visualizer Engine** trực quan hóa sống động các hành vi này:
    1.  **SRP Overheating Card:** Khi một lớp gánh vác quá nhiều vai trò (vi phạm SRP), thẻ Class đó sẽ bị "nhiệt hóa" - viền chuyển màu đỏ rực tỏa nhiệt kèm các hạt lửa tia lửa (thermal particle sparks) bắn ra dữ dội. Khi sinh viên bấm nút [ SPLIT ], thẻ lớp vỡ ra thành 3 thẻ chuyên biệt độc lập, nhiệt độ giảm xuống, viền chuyển xanh mát dịu dịu.
    2.  **LSP Laser Fracture:** Trực quan hóa con trỏ đa hình thay thế. Khi thay thế lớp cha bằng lớp con ném lỗi `NotImplementedException` (vi phạm LSP), tia laser kết nối lập tức bị **nứt vỡ, rạn nứt** (SVG Fracture overlay) thành hàng vạn mảnh tinh thể vụn rơi rụng kèm tiếng vỡ thủy tinh.

---

## 2. ĐỘNG CƠ TÍNH TOÁN COHESION & KHỚP NỐI LISKOV (TECHNICAL SPEC)

Để kiểm chứng 5 nguyên lý thiết kế, hệ thống thiết lập bộ máy phân tích tĩnh **SOLIDEvaluatorEngine**:

```
[UserManager Card: Handles DB, Hash, Email]
                     |
                     v (SRP Check) Cohesion = 0.18 < 0.5 (Vi phạm!)
           [Khởi chạy Canvas Hạt Lửa Nhiệt Bắn Tóe]
           [Hiện nút [ SPLIT CLASS ] gợi ý tái cấu trúc]
```

### Thuật toán Đo lường Gắn kết (LCOM - Lack of Cohesion in Methods)
Hệ thống tính toán tỷ lệ tương tác giữa các phương thức và thuộc tính để đưa ra chỉ số cohesion thực tế thời gian thực, điều khiển mức độ bắn tia lửa của hạt Canvas.

---

## 3. HIỆN THỰC HÓA TRÌNH PHÂN TÍCH SOLID & HỆ THỐNG HẠT (CORE LOGIC)

Chúng ta xây dựng các cấu trúc dữ liệu mô tả lớp SOLID và logic chấm điểm bằng TypeScript:

```typescript
export interface SOLIDClassNode {
  nodeId: string;
  className: string;
  responsibilities: string[]; // Các nhiệm vụ lớp đang gánh vác
  methods: string[];
  cohesionScore: number; // Điểm gắn kết 0.0 -> 1.0
  isViolatingSRP: boolean;
}
```
Lớp hạt nhân `SOLIDEvaluatorEngine` sẽ được đặc tả trong tệp core logic.

---

## 4. BỐ CỤC NHIỆT HÓA SRP & RẠN NỨT LASER LSP (UI/UX)

### 4.1. Thiết kế Giao diện Thẻ Lớp Tỏa nhiệt (SRP Thermal Layout)
*   **Thermal Class Card:** Viền thẻ lớp vi phạm SRP chuyển sắc độ HSL đỏ chói tỏa nhiệt mờ ảo, nền Glassmorphic đen sẫm lơ lửng trên lớp Canvas bắn tia lửa.
*   **LSP Glass Fracture overlay:** Hoạt ảnh rạn nứt tuyệt đẹp. Khi vi phạm LSP, tia laser nối nổ tung bừng sáng rồi hiện vệt nứt rạn rách rưới chạy dọc nét vẽ, mô tả vết rạn vỡ cơ cấu liên kết.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA PATH STORE (STATE MANAGEMENT)

Xây dựng store `useSOLIDVisualizerStore.ts` quản lý trạng thái:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSOLIDVisualizerStore = defineStore('solidVisualizer', () => {
  const classNodes = ref<any[]>([]);
  const isSrpOverheated = ref(false);
  const activeViolationType = ref('');

  return { classNodes, isSrpOverheated, activeViolationType };
});
```

---

## 6. HẠ TẦNG CANVAS HẠT LỬA NHIỆT & SVG PATHS (INFRASTRUCTURE)

*   **Bộ máy Canvas 2D phát hạt lửa (Thermal Spark Particle Engine):**
    *   Tự động khởi tạo Canvas 2D lồng phía sau thẻ lớp vi phạm. Sinh ra hàng ngàn hạt lửa nhỏ chịu tác động của lực cản không khí và hướng bay hướng lên, phai màu nhạt dần theo thời gian tạo hoạt ảnh cháy bùng chân thực 60 FPS, tự dọn dẹp giải phóng mảng hạt tránh tràn RAM máy khách.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐỘNG CƠ LINT SOLID CLIENT (ADR)

### ADR-22: Bộ máy Phân tích Tĩnh SOLID Lint & Tái Cấu trúc Trực quan hóa ở Client-side

*   **Quyết định:** Hiện thực hóa bộ máy phân tích cấu trúc mã nguồn tĩnh (LCOM Cohesion parser) và bộ kiểm soát thay thế đa hình chạy 100% Client-side bằng TypeScript thay vì gửi code về backend kiểm thử nặng nề.
*   **Lý do:**
    1.  *Phản hồi nhạy bén tức thì:* Học sinh nhấp "Split" một cái là thẻ lớp tách ra, hạt lửa tắt ngúm bừng sáng mát rượi ngay dưới **10ms**, tạo cảm giác tương tác cực đỉnh.
    2.  *Học thuật hóa cấu trúc thiết kế:* Tạo ra sự ghi nhớ sâu sắc bằng hình ảnh vật lý của các lỗi thiết kế phần mềm trừu tượng.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Thẻ SRP Tỏa nhiệt & Vết nứt Laser LSP (Ngày 1-3):** Dựng thẻ class tỏa nhiệt SRP, bộ phát hạt lửa Canvas, vết nứt SVG Fracture rạn vỡ laser, viền OCP rẽ lối.
2.  **Sprint B: Bộ máy phân tích SOLIDEvaluatorEngine & Tái cấu trúc (Ngày 4-6):** Lập trình logic LCOM cohesion, bộ kiểm khớp substitution LSP, DIP dependency graph, Monaco code split triggers.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Thẻ lớp vi phạm SRP (> 2 responsibilities) bắt buộc kích hoạt bùng cháy hạt lửa tỏa nhiệt Canvas 2D mượt mà 60 FPS.
*   Nhấp Split phân tách thẻ lớp thành công, làm dịu mát viền card, dọn sạch hạt lửa RAM GC.
*   Vi phạm LSP (thay thế ném NotImplementedException) bắt buộc kích hoạt nứt vỡ vụn laser SVG rạn nứt lộng lẫy và âm thanh vỡ thủy tinh sắc mịn.
*   Biểu đồ phụ thuộc DIP đảo chiều mũi tên luồng sáng chuẩn xác khi học viên chèn interface trừu tượng ở giữa.
*   Giải phóng 100% các vòng lặp hoạt ảnh hạt Canvas khi chuyển bài học tránh rò rỉ bộ nhớ CPU/RAM.
