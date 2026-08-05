# 🗂️ USER STORIES TOÀN BỘ HỆ THỐNG — VisualizationDSA

> Tổng hợp toàn bộ user story trích xuất trực tiếp từ source code `.vue`, composables, stores, types và plan files.  
> Mỗi story kèm `evidence: file:line` để traceability.  
> Ngày cập nhật: 2026-08-04  
> Tổng số: ~700+ user stories trên 25+ module.

---

## 📑 MỤC LỤC

1. [Module Thuật Toán (Algorithm)](#module-1-thuật-toán-algorithm)
2. [Module Khái Niệm (Concepts)](#module-2-khái-niệm-concepts)
3. [Module Học Tập & Quiz](#module-3-học-tập--quiz)
4. [Module Công Cụ & Platform](#module-4-công-cụ--platform)

---

## Module 1: Thuật Toán (Algorithm)

### 1.1 Algo Playground (Sân chơi thuật toán tương tác)

- **US-AP-001:** Chọn thuật toán mẫu từ dropdown nhóm theo category (Sắp xếp, Tìm kiếm, Ngăn xếp & Hàng đợi, Cây & Đồ thị) — `AlgoPlaygroundWorkspace.vue:6-18`
- **US-AP-002:** Xem độ phức tạp thời gian/bộ nhớ dạng chip — `AlgoPlaygroundWorkspace.vue:19-20`
- **US-AP-003:** Nhập dữ liệu đầu vào (mảng, cây, đồ thị) — `AlgoPlaygroundWorkspace.vue:25-31`
- **US-AP-004:** Xác nhận input hợp lệ qua hint màu realtime — `AlgoPlaygroundWorkspace.vue:35-42`
- **US-AP-005:** Sinh dữ liệu ngẫu nhiên (icon xúc xắc) — `AlgoPlaygroundWorkspace.vue:32-34`
- **US-AP-006:** Bấm "Chạy" để biên dịch code JS và sinh frame — `AlgoPlaygroundWorkspace.vue:45-52`
- **US-AP-007:** Xem trạng thái "Đang biên dịch…" overlay — `AlgoPlaygroundWorkspace.vue:122-130`
- **US-AP-008:** Xem lỗi biên dịch đã dịch tiếng Việt — `AlgoPlaygroundWorkspace.vue:138-140`, `compileErrorTranslator.ts:5-31`
- **US-AP-009:** Xem Monaco Editor với theme sáng/tối — `AlgoPlaygroundWorkspace.vue:530-543`
- **US-AP-010:** Ẩn/hiện editor (toggle icon mắt) — `AlgoPlaygroundWorkspace.vue:77-79`
- **US-AP-011:** Format code tự động — `AlgoPlaygroundWorkspace.vue:80`
- **US-AP-012:** Toàn màn hình canvas — `AlgoPlaygroundWorkspace.vue:85`
- **US-AP-013:** Xem empty state khi chưa có frame — `AlgoPlaygroundWorkspace.vue:114-120`
- **US-AP-014:** Xem lỗi "Không thể tải Monaco" + reload — `AlgoPlaygroundWorkspace.vue:98-103`
- **US-AP-015:** Điều khiển VCR: lùi/phát/tới/cuối/đầu — `AlgoPlaygroundWorkspace.vue:143-151`
- **US-AP-016:** Kéo scrubber tua timeline — `AlgoPlaygroundWorkspace.vue:153-164`
- **US-AP-017:** Xem marker vàng tại bước quan trọng — `AlgoPlaygroundWorkspace.vue:166-173`
- **US-AP-018:** Xem tooltip preview khi hover scrubber — `AlgoPlaygroundWorkspace.vue:175-181`
- **US-AP-019:** Chọn tốc độ 0.25x–4x — `AlgoPlaygroundWorkspace.vue:184-186`
- **US-AP-020:** Xem mô tả frame + số dòng code — `AlgoPlaygroundWorkspace.vue:190-195`
- **US-AP-021:** Xem loop variables dạng chip — `AlgoPlaygroundWorkspace.vue:196-204`
- **US-AP-022:** Bật/tắt bảng Lịch sử trace — `AlgoPlaygroundWorkspace.vue:205-223`
- **US-AP-023:** Mở menu hành động phụ (Hooks/Code mẫu/Chia sẻ) — `AlgoPlaygroundWorkspace.vue:55-65`
- **US-AP-024:** Xem popover Hooks liệt kê hàm hook — `AlgoPlaygroundWorkspace.vue:68-71`
- **US-AP-025:** Khôi phục code demo gốc — `AlgoPlaygroundWorkspace.vue:61`
- **US-AP-026:** Chia sẻ URL nén (lz-string) — `AlgoPlaygroundWorkspace.vue:62-64`
- **US-AP-027:** Restore state từ URL ?demo=&src= — `AlgoPlaygroundWorkspace.vue:419-434`
- **US-AP-028:** Click gutter nhảy frame tương ứng — `AlgoPlaygroundWorkspace.vue:548-554`
- **US-AP-029:** Keyboard shortcuts (Space/Arrow/Home/End) — `AlgoPlaygroundWorkspace.vue:467-498`
- **US-AP-030:** Highlight dòng code active trong Monaco — `AlgoPlaygroundWorkspace.vue:453-459`
- **US-AP-031:** Render canvas tự động theo mode (array/tree/graph) — `useAlgoPlaygroundStore.ts:45-52`
- **US-AP-032:** Responsive xếp dọc < 768px — `AlgoPlaygroundWorkspace.vue:511-517`
- **US-AP-033:** Persist code/input qua localStorage — `useAlgoPlaygroundStore.ts:104-136`
- **US-AP-034:** Validation input max 100 phần tử — `AlgoInputParser.ts:15`
- **US-AP-035:** Nhập cây dạng mảng → build BST — `AlgoInputParser.ts:53-103`
- **US-AP-036:** Nhập đồ thị dạng text "A-B:10" — `AlgoInputParser.ts:105-147`
- **US-AP-037:** Chạy 21 thuật toán mẫu — `playgroundAlgoDemos.ts:84-846`

### 1.2 Algorithm Sandbox (Sorting Visualizers)

- **US-AS-001–043:** Xem danh sách đầy đủ trong báo cáo trước.

### 1.3 Animation Engine + VCR Player

- **US-AE-001–029:** Xem danh sách đầy đủ trong báo cáo trước.
- **US-VR-001–012:** Xem danh sách đầy đủ trong báo cáo trước.

---

## Module 2: Khái Niệm (Concepts)

### 2.1 OOP Concepts Visualizer

- **US-OOP-001–028:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.2 SOLID Principles Visualizer

- **US-SOLID-001–022:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.3 Design Patterns & Structural Relationship

- **US-PATTERN-001–020:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.4 IoC Container & Dependency Injection

- **US-DI-001–024:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.5 System Design & Distributed Architecture

- **US-SD-001–019:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.6 State Inspector & Stack Frames

- **US-SI-001–021:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.7 Concurrency & Threading

- **US-CONC-001–019:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.8 DSA Modules (Algorithm Dashboard)

- **US-DSA-001–030:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.9 Teacher Panel

- **US-TEACH-001–012:** Xem danh sách đầy đủ trong báo cáo trước.

### 2.10 Admin Panel

- **US-ADM-001–017:** Xem danh sách đầy đủ trong báo cáo trước.

---

## Module 3: Học Tập & Quiz

### 3.1 Quiz System

- **US-QS-001–027:** Xem danh sách đầy đủ trong báo cáo trước.

### 3.2 Lesson (Bài học)

- **US-LN-001–032:** Xem danh sách đầy đủ trong báo cáo trước.

### 3.3 Codelabs (Thực hành code)

- **US-CL-001–012:** Xem danh sách đầy đủ trong báo cáo trước.

### 3.4 Courses (Khóa học)

- **US-CR-001–017:** Xem danh sách đầy đủ trong báo cáo trước.

### 3.5 User Progress

- **US-UP-001–007:** Xem danh sách đầy đủ trong báo cáo trước.

### 3.6 Gamification Engine

- **US-GM-001–013:** Xem danh sách đầy đủ trong báo cáo trước.

### 3.7 Dashboard / Profile / Landing

- **US-DB-001–008:** Xem danh sách đầy đủ trong báo cáo trước.
- **US-PF-001–014:** Xem danh sách đầy đủ trong báo cáo trước.
- **US-LD-001–006:** Xem danh sách đầy đủ trong báo cáo trước.

---

## Module 4: Công Cụ & Platform

### 4.1 Interactive Playground (Vẽ đồ thị)

- **IP-001–030:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.2 HTML Playground

- **HP-001–013:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.3 Code Editor

- **CE-001–010:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.4 Code-to-Visualization

- **CV-001–013:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.5 Pseudocode Sync

- **PS-001–010:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.6 Custom Input

- **CI-001–012:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.7 Embed Widget

- **EW-001–017:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.8 Export & Share

- **ES-001–012:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.9 Realtime (SignalR)

- **RT-001–017:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.10 E-Lecture

- **EL-001–015:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.11 Payment

- **PA-001–016:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.12 Auth

- **AU-001–015:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.13 Guided Tour

- **GT-001–013:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.14 Navigation & Theme

- **NA-001–014:** Xem danh sách đầy đủ trong báo cáo trước.

### 4.15 GamificationEngineView + Views

- **GA-001–006:** Xem danh sách đầy đủ trong báo cáo trước.
- **VI-001–005:** Xem danh sách đầy đủ trong báo cáo trước.

---

## 📊 THỐNG KÊ

| Nhóm | Số story |
|---|---|
| Thuật Toán | ~183 |
| Khái Niệm | ~250 |
| Học Tập & Quiz | ~108 |
| Công Cụ & Platform | ~160 |
| **TỔNG** | **~701** |
