# 📝 Nhật Ký Phiên Làm Việc - Session Notes & Architect Recommendations

Tài liệu này tổng hợp biên bản phiên làm việc lập trình pair-programming cùng AI Assistant **Antigravity**, ghi nhận các thành tựu hoàn thành và đưa ra khuyến nghị kiến trúc cho tương lai.

---

## 1. Nhật Ký Phiên Làm Việc (Session Achievements)
*   **Bối cảnh:** Lập trình trực quan hóa kiến trúc nâng cao EdTech **VisualizationDSA** trên nền tảng Client-side.
*   **Thành tựu xuất sắc đạt được:**
    1.  **Hoàn thành Master Design Blueprint (6 files):** Thiết lập hạt nhân hoạt ảnh `CoreAnimationEngine` (rAF 60 FPS), trình biên dịch `CompilerStepExecutor` AST Parser, giải thuật cây AVL xoay/Dijkstra, CSS HSL Neon Glassmorphic và LCOM4 SRP toán học.
    2.  **Hoàn thành 12 Sprints Roadmap & Specs (Sprint 1 - 12):** Thiết kế chi tiết cho tất cả các Sprint trống, viết code TypeScript mô phỏng giải thuật cụ thể kèm các ca Vitest Unit test chặt chẽ.
    3.  **Hoàn thành Hệ thống Tracking hồ sơ (tracking/):** Xây dựng các tệp tin theo dõi tiến độ, quyết định kiến trúc (ADR), phụ thuộc, kịch bản lỗi failover và danh sách kiểm thử.

---

## 2. Khuyến Nghị Kiến Trúc Thực Thi Vue 3 (Architect Recommendations)

Để triển khai mượt mà bộ mã thiết kế đặc tả trên Frontend Vue 3 (Composition API / Pinia / TypeScript) máy khách, hãy lưu ý:
1.  **Sử dụng Canvas 2D thay vì DOM cho hoạt ảnh dồn dập:** Với mưa hạt HTTP request Neon (Sprint 11) hoặc các hạt bụi khói sập nguồn Web Server, vẽ trên Canvas 2D bằng lệnh `requestAnimationFrame` giúp CPU mát mẻ, giảm thiểu 100% chi phí DOM.
2.  **Độc lập hóa Monaco Editor Instance:** Trình soạn thảo Monaco Editor tiêu tốn khá nhiều RAM. Hãy giải phóng instance bằng `.dispose()` khi unmount component (ở các Sprint 3, Sprint 5) tránh rò rỉ bộ nhớ.
3.  **Tận dụng mảng phẳng phẳng hóa Caching VCR Snapshot:** Với mỗi bước hoạt ảnh, hãy lưu snapshot phẳng mảng (đã clone) chỉ ~2KB vào Pinia Store. Tránh lưu các tham chiếu sâu (Deep references) gây giật lag khi kéo scrubber tua lùi tiến dưới **5ms**.
