# 🏛️ HỒ SƠ THIẾT KẾ CỐT LÕI HỆ THỐNG VISUALIZATIONDSA (MASTER DESIGN BLUEPRINT)
## 📝 TRUNG TÂM QUẢN TRỊ KIẾN TRÚC & HƯỚNG DẪN THIẾT KẾ HỆ THỐNG

Chào mừng bạn đến với **Master Design Blueprint** của **VisualizationDSA** - tài liệu kỹ thuật tối cao định hình toàn bộ ngôn ngữ thiết kế giao diện, kiến trúc hạt nhân hoạt ảnh và động cơ biên dịch bước giải thuật của hệ thống. Tài liệu này đặc tả chỉ mục chi tiết liên kết 5 bản thiết kế thành phần lõi của Phase 1 và Phase 2, cam kết tính nhất quán kỹ thuật tuyệt đối cho toàn bộ phân hệ.

---

## 📌 BẢN ĐỒ CHỈ MỤC THIẾT KẾ HẠT NHÂN (MASTER DESIGN INDEX)

### 🟢 THIẾT KẾ THÀNH PHẦN PHASE 1 (NỀN TẢNG THỰC HÀNH GIẢI THUẬT)
1.  **[phase1-core-engine.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/features/master-design/phase1-core-engine.md)**
    *   *Nội dung:* Động cơ hoạt ảnh `requestAnimationFrame` 60 FPS, trình biên dịch mã nguồn sinh cấu trúc cây AST và bộ máy lập lịch bước thời gian VCR.
2.  **[phase1-dsa-library.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/features/master-design/phase1-dsa-library.md)**
    *   *Nội dung:* Thư viện trực quan hóa mảng sắp xếp hoán vị, cây nhị phân tự cân bằng (AVL, Red-Black Tree) uốn lượn và đồ thị đường đi ngắn nhất (Dijkstra, A*).
3.  **[phase1-learning-system.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/features/master-design/phase1-learning-system.md)**
    *   *Nội dung:* Hệ thống bài giảng tích hợp VCR, bộ máy đánh giá trắc nghiệm Canvas tương tác và thang đo chấm điểm thuật toán máy khách.
4.  **[phase1-ux-platform.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/features/master-design/phase1-ux-platform.md)**
    *   *Nội dung:* Hệ thống giao diện mờ kính Glassmorphism Slate 900, liên kết Monaco Editor chỉ đọc nâng cao, dải phản hồi âm thanh vật lý và splitters co giãn.

### 🔵 THIẾT KẾ THÀNH PHẦN PHASE 2 (KỸ NGHỆ NÂNG CAO & HỆ THỐNG LỚN)
5.  **[phase2-advanced-cs-concepts.md](file:///c:/Users/maiti/OneDrive/Desktop/LearningEnglishApp/VisualizationDSA/plan/features/master-design/phase2-advanced-cs-concepts.md)**
    *   *Nội dung:* Sandbox phản xạ đa hình OOP, bộ linter kết dính SOLID (SRP LCOM4 DFS graph, LSP crack), Design Patterns uốn lượn, State Inspector RAM 3D, System Design kéo thả failover bốc khói và dòng thời gian VCR caching 5ms.

---

## 🎨 HƯỚNG DẪN KIẾN TRÚC THIẾT KẾ THỐNG NHẤT (UNIFIED ARCHITECTURE RULES)

Toàn bộ hệ thống trực quan hóa **VisualizationDSA** được xây dựng bám sát 4 trụ cột kỹ thuật tối cao sau:

```
+---------------------------------------------------------------------------------+
|                         GIAO DIỆN PREMIUM GLASSMORPHISM                         |
|   Slate 900 base, 8% White Borders, backdrop-filter: blur(16px), Neon Glows.     |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                         ĐỘNG CƠ HOẠT ẢNH MƯỢT MÀ 60 FPS                         |
|   Phép nội suy Vector, requestAnimationFrame (rAF) bám sát xung nhịp màn hình.   |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                       XỬ LÝ CLIENT-SIDE FIRST & RAM CACHING                     |
|   Mô phỏng đệ quy, sập nguồn failover, tua VCR seek chỉ số RAM phản hồi <10ms.  |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                       ĐỒNG BỘ ĐỊNH VỊ DÒNG LỆNH MONACO EDITOR                    |
|   Auto-Scroll revealLineInCenter, deltaDecorations bôi sáng Cyan dòng đang chạy. |
+---------------------------------------------------------------------------------+
```

### 1. Triết lý Giao diện Premium Glassmorphic
*   **Màu nền nền Slate 900:** Tối sâu thẳm, tạo cảm giác chuyên nghiệp huyền bí.
*   **Mờ kính (Backdrop Blur):** `backdrop-filter: blur(16px)` tạo lớp mờ lơ lửng cho tất cả cụm bảng.
*   **Neon Glows:** Đèn LED phát quang HSL phản chiếu trạng thái vật lý (Cyan: Đang chạy, Emerald: Đúng/Khỏe mạnh, Amber: Hoạt động/Đang chọn, Crimson: Sập nguồn/Sai).

### 2. Thu hồi Tài nguyên RAM GC Triệt để (Garbage Collection)
*   Để giữ máy tính của học viên luôn mát lạnh và tối ưu CPU: Mọi component khi kết thúc biên dịch hoặc unmount bắt buộc phải giải phóng listeners window, hủy bỏ `cancelAnimationFrame` và dọn sạch các mảng Caching Snapshot tĩnh dồn ứ RAM máy khách.
