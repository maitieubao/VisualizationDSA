# 📜 Nhật Ký Thay Đổi Cấu Trúc Dự Án (VisualizationDSA Changelog)

Tất cả các thay đổi kiến trúc, đặc tả sản phẩm, tài liệu chất lượng và cẩm nang Tác nhân AI của hệ thống **VisualizationDSA** được theo dõi chi tiết dưới đây.

---

## [v1.0.0] - 2026-05-18

### 🚀 Khởi tạo Nền móng Hệ thống (System Foundation Setup)
* **Thiết lập Bản đồ Agile Scrum:** Hoàn tất 12 Sprints đặc tả chi tiết trong thư mục `plan/features/` chi tiết hóa các chặng nghiệp vụ, giao diện, toán học hoạt cảnh, kịch bản sư phạm và bộ kiểm thử biên tự động hóa không có bất kỳ placeholder rỗng nào.
* **Cơ chế hoạt họa uốn cong Parabol (ADR-30):** Thiết lập mô hình dịch chuyển cột mảng theo phương ngang tuyến tính kết hợp độ cao Parabol uốn cong: $y = -4 \cdot h \cdot progress \cdot (1 - progress)$ giúp triệt tiêu hoàn toàn sự đè lấn chồng chéo va chạm vật lý trực quan.
* **Quy chuẩn DI DFS Detection (ADR-34):** Hoàn chỉnh thuật toán đệ quy DFS sử dụng danh sách `visiting` để rà quét và ngăn ngừa triệt để lỗi Cyclic Dependency tiêm nhiễm chéo trong DI Container ở Runtime.
* **Tính toán độ kết dính LCOM4 (ADR-32):** Triển khai ma trận liên kết BFS đo đạc độ rời rạc của các khối Class, tự động kích nổ hiệu ứng rạn nứt kính của Canvas khi chỉ số LCOM4 vượt ngưỡng an toàn $\ge 2$.

### 📂 Tài liệu & Kế hoạch Chi tiết Đã tạo (Created Planning & Roadmap Hub)
* **[architecture.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/architecture.md)**: Đặc tả kiến trúc phân tầng Client-First đồng bộ luồng VCR với Monaco Code Highlight.
* **[api-spec.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/api-spec.md)**: Giao ước API RESTful chuẩn hóa payload JSON của các Frame hoạt ảnh và Quiz học tập.
* **[database.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/database.md)**: Sơ đồ lược đồ PostgreSQL lưu trữ tiến độ, phần thưởng gamification và mã nhúng widget iframe.
* **[roadmap.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/roadmap.md)**: Kế hoạch 3 Giai đoạn dài hạn (DSA Core, SE Sandbox, SaaS Multi-view).
* **[roadmap-sprint.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/roadmap-sprint.md)**: Chu trình chạy chặng Scrum 2 tuần nghiêm ngặt.
* **[future-plan.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/future-plan.md)**: Định hướng 3 tiện ích tương lai (AI complexity evaluator, multiplayer socket tournament, Canvas video exporter).

### 🩺 Hệ thống Giám sát & Đo lường Chất lượng (Tracking & Diagnostics)
* **[progress.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/progress.md)**: Nhật ký chặng ghi nhận hoàn tất thiết kế 100% cho 12 Sprints.
* **[decisions.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/decisions.md)**: Ghi chép ADR-01 đến ADR-05 làm kim chỉ nam kỹ thuật đồ họa và tối ưu hóa GC hạt khói Canvas.
* **[dependencies.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/dependencies.md)**: Quản lý thư viện Monaco, Vue 3, Pinia, SASS, Vitest, và xUnit Backend.
* **[errors.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/errors.md)**: Danh mục mã lỗi và cơ chế tự phục hồi (Failover Recovery) an toàn.
* **[features-tested.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/features-tested.md)**: Bản đồ phủ mã nguồn kiểm thử tự động.
* **[session-notes.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/session-notes.md)**: Khuyến nghị kỹ thuật xử lý click spam VCR và nén GZIP dữ liệu frame mạng.
* **[test-plan.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/test-plan.md)**: Kế hoạch tự động hóa tích hợp CI/CD GitHub Actions.
* **[testing.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/testing.md)**: Hướng dẫn chạy lệnh CLI chạy bộ test Vitest/xUnit.
* **[comparison-quenti.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/plan/tracking/comparison-quenti.md)**: Bảng định lượng hiệu suất CPU/RAM giữa DOM, SVG và Canvas.

### 🎭 Quy hoạch Kỹ năng Tác nhân AI (AI Role Prompts Setup)
Hoàn thiện chi tiết cấu trúc 5 thư mục năng lực chuyên sâu, nạp mã lệnh thực tế mẫu làm tiêu chuẩn đầu ra:
* **[backend/](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/skills/backend)**: Tích hợp mã C# BubbleSort State generator đệ quy, giao ước API nén JSON, và khai báo LifeCycle Service DI Container.
* **[frontend/](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/skills/frontend)**: Tích hợp giải thuật uốn cong Parabol hoán vị mảng, uốn đa hình Polymorphic Morphing tròn sang ngũ giác ở tần số quét 60 FPS, và mã nguồn Pinia Store `vcrPlayback` hoàn chỉnh.
* **[visualization/](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/skills/visualization)**: Lớp Ticker đồng hồ delta-time microsecond, thuật toán setup độ sắc nét Retina Canvas, ma trận Camera zoom-pan chuột và bộ lực kéo đẩy Coulomb/Hooke tự dàn node đồ thị.
* **[product/](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/skills/product)**: Đặc tả JSON Smart Quiz và PRD 4 trụ cột nghiệp vụ thuật toán.
* **[quality/](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/skills/quality)**: Hồ sơ profile rò rỉ bộ nhớ khói, cơ chế fix StackOverflow đệ quy sâu C# và Vitest tự động hóa tua timeline VCR.

### 🤖 Cẩm nang Hợp tác Tác nhân AI (AI Playbook Initialization)
* **[AGENTS.md](file:///c:/Users/maiti/OneDrive/Desktop/New%20folder/VisualizationDSA/AGENTS.md)**: Quy hoạch luồng phối hợp inter-agent tuần tự song hành giữa Product, QA, Backend, Frontend và Kỷ luật sắt Open-Closed khi viết code.
