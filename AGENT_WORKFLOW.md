# 🤖 Hướng Dẫn Quy Trình Đọc Tài Liệu Cho Agent (Advanced Agent Reading Workflow)

Tài liệu này là **"Kim Chỉ Nam"** vô cùng quan trọng dành cho các AI Agent hoặc lập trình viên khi tham gia vào siêu dự án **VisualizationDSA**. Hệ thống tài liệu của dự án vô cùng đồ sộ (với gần 400 file Markdown), được tổ chức cực kỳ khoa học để phân rã từ vĩ mô đến vi mô. 

Việc đọc tài liệu sai thứ tự sẽ dẫn đến phá vỡ kiến trúc, vi phạm quy chuẩn thiết kế (Glassmorphism & Neon) hoặc gây sụt giảm hiệu năng (dưới 60 FPS). Hãy tuân thủ nghiêm ngặt **Luồng làm việc 4 Bước** dưới đây.

---

## 📂 1. Cấu Trúc Khối Tài Liệu (Knowledge Base Master Structure)

Hệ thống tài liệu được chia thành hai nhánh chính với độ sâu phân rã đáng kinh ngạc:

1. **`plan/` (Kiến Trúc & Kế Hoạch Vĩ Mô):**
   - `architecture.md`, `roadmap.md`, `roadmap-sprint.md`: Bản thiết kế tổng thể, kiến trúc **Client-First**, và chuẩn chất lượng (DoD).
   - `features/deep-decomposition/`: **TRÁI TIM CỦA DỰ ÁN**. Chứa bản đồ phân rã của 25 phân hệ cốt lõi trải dài qua 2 Phase (từ Core DSA Engine đến OOP/SOLID/System Design Visualizer). File `README.md` tại đây là tấm bản đồ dẫn đường quan trọng nhất.
   - `features/sprint-1` đến `sprint-12`: Kế hoạch chi tiết của từng Sprint.
   - `reports/` & `tracking/`: Lịch sử kiểm thử, báo cáo tiến độ, quyết định kiến trúc và lỗi.

2. **`skills/` (Hệ Thống Thẻ Bài Nhập Vai - Role Prompts):**
   - Chứa các "nhân cách" chuyên biệt chia theo domain: `backend/`, `core/`, `frontend/`, `product/`, `quality/`, `visualization/`. 
   - Agent **bắt buộc** phải nạp kỹ năng của đúng vai trò trước khi viết code (VD: `canvas-rendering-engine.md` cho việc vẽ đồ họa, `api-design.md` cho việc thiết kế RESTful).

---

## 🔄 2. Luồng Đọc Tài Liệu Chuẩn (The 4-Phase Reading Workflow)

Bất cứ khi nào bắt đầu một Task mới, Agent **BẮT BUỘC** phải rà soát thông tin theo thứ tự sau để tránh mất bối cảnh:

### Bước 1: Nắm Bắt Bức Tranh Toàn Cảnh (Macro Context)
*Tuyệt đối không viết code khi chưa hiểu hệ thống hoạt động ra sao.*
1. Đọc `plan/architecture.md`: Nắm vững kiến trúc "Client-First", hiểu luồng dữ liệu truyền từ Frontend (Canvas/Vue) -> Backend (.NET).
2. Đọc `plan/roadmap.md` & `plan/roadmap-sprint.md`: Xác định tính năng đang làm thuộc Phase nào, Sprint nào. Nắm vững 4 Tiêu chí Nghiệm thu (DoD): **>90% Test Coverage**, **Phản hồi <5ms**, **GC RAM 15-22MB**, và **Aesthetics HSL Neon**.

### Bước 2: Truy Xuất Bản Đồ Phân Rã (Deep Decomposition)
*Tìm hiểu chính xác đặc tả của tính năng cụ thể.*
1. Đọc `plan/features/deep-decomposition/README.md`: Xác định phân hệ mình sắp code thuộc nhóm nào trong 25 nhóm cốt lõi (VD: Module 20: OOP Visualizer hay Module 23: State Inspector).
2. Đi sâu vào thư mục tương ứng trong `deep-decomposition/` để đọc chi tiết thuật toán, kiến trúc hạt nhân và quyết định (ADR) của tính năng đó.

### Bước 3: Nạp "Thẻ Bài" Kỹ Năng (Role Adoption) - BƯỚC QUAN TRỌNG NHẤT
*Định vị vai trò để đưa ra quyết định kỹ thuật sắc bén nhất.*
1. Nếu bạn làm giao diện: Đọc `skills/frontend/ui-component-builder.md`.
2. Nếu bạn xử lý đồ họa: Đọc `skills/visualization/canvas-rendering-engine.md`.
3. Nếu bạn thiết kế hệ thống: Đọc `skills/core/project-architect.md`.
4. **Hành động:** Tuân thủ 100% "Mục tiêu", "Trách nhiệm" và "Đặc tả kỹ thuật" được định nghĩa trong file Role đó.

### Bước 4: Khảo Sát API, Database & Tracking (Details & Status)
1. Đọc `plan/api-spec.md` & `plan/database.md`: Để đảm bảo giao thức JSON và Schema không bị phá vỡ.
2. Kiểm tra `plan/tracking/errors.md` và `decisions.md`: Xem có lỗi nào tương tự từng xảy ra không, hay có quy định nào mới được chốt không.

---

## ⚠️ 3. Các Nguyên Tắc Kỹ Thuật "Bất Di Bất Dịch" (Golden Rules)

1. **Client-side First Philosophy:** Các xử lý mô phỏng, tính toán nội suy, uốn SVG Bezier bắt buộc phải chạy ở máy khách dưới **10ms**.
2. **60 FPS Animation Engine:** Tuyệt đối dùng `requestAnimationFrame` cho mọi chuyển động. Không dùng `setTimeout` hay `setInterval` nhàn rỗi. Tối ưu Double Buffering để chống chớp hình.
3. **Thẩm Mỹ Đẳng Cấp (Premium Glassmorphic & Neon):** Giao diện phải mang tone tối (Dark Slate), thiết kế kính mờ (`backdrop-filter: blur(12px)`) kết hợp với ánh sáng Neon rực rỡ HSL (Cyan, Amber, Emerald). Nếu giao diện trông "phổ thông", Agent đã làm sai yêu cầu.
4. **Bảo Toàn Bộ Nhớ (Zero Leaks):** Luôn có cơ chế Garbage Collection. Phải gọi `cancelAnimationFrame` và tháo gỡ các event listener khi Component Unmount.
5. **High Cohesion, Loose Coupling:** Các thuật toán và phân hệ phải hoàn toàn độc lập (VD: Thuật toán Graph sập không được phép làm sập thuật toán Sort).

---
> **TỔNG KẾT MỖI NGÀY:** 
> Sau khi hoàn thành code, Agent có trách nhiệm ghi log vào các file trong `plan/tracking/` (cập nhật tiến độ, test coverage) và `plan/reports/` để User dễ dàng theo dõi. Luôn đi từ **Kiến trúc vĩ mô -> Bản đồ phân rã -> Vai trò cụ thể -> Code chi tiết**.
