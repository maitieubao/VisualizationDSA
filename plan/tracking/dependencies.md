# 📦 Quản Lý Phụ Thuộc Hệ Thống - Dependency Management Map

Tài liệu này đặc tả chi tiết danh mục thư viện công nghệ, các gói phụ thuộc (dependencies) và vai trò của chúng trong dự án **VisualizationDSA**.

---

## 1. Bản Đồ Công Nghệ Lõi (Core Technology Stack)

```
[Vue 3 Composition API] ===> (State Management via Pinia & TS) ===> [Canvas 2D / SVG Layer]
[Monaco Editor custom] ======> (Code editing shell read-only locks) ===> [Monaco Custom Theme]
[Vitest Testing Engine] ====> (Unit testing LCOM4, DI container DFS) ===> [Automated Test Specs]
[Custom HSL CSS Neon] ======> (Glassmorphism aesthetics variables) ======> [Premium Web UI]
```

---

## 2. Gói Phụ Thuộc Frontend (Frontend Dependencies)

| Tên Thư Viện | Phiên bản | Phân hệ sử dụng | Vai trò cốt lõi |
| :--- | :--- | :--- | :--- |
| **vue** | `^3.4.0` | Toàn hệ thống | Khung sườn Reactive UI Component, Composition API. |
| **pinia** | `^2.1.0` | Core Stores | Quản lý trạng thái chia sẻ (VCR Playback state, User Progress). |
| **typescript** | `^5.3.0` | Toàn hệ thống | Định kiểu tĩnh an toàn chặt chẽ cho toàn bộ động cơ hoạt ảnh. |
| **monaco-editor** | `^0.45.0` | Monaco Editor Shell | Trình soạn thảo viết mã giải thuật và mã giả, click gutter lề. |
| **canvas-confetti** | `^1.6.0` | Gamification | Phun pháo hoa chúc mừng thăng cấp Neon rực rỡ. |

---

## 3. Gói Phụ Thuộc Backend (Backend NuGet Dependencies)

| Tên Gói NuGet | Phiên bản | Phân hệ sử dụng | Vai trò cốt lõi |
| :--- | :--- | :--- | :--- |
| **Asp.Versioning.Mvc** | `8.1.0` | WebApi / Controllers | Quản lý phiên bản API chính thức theo chuẩn RESTful qua route. |
| **Asp.Versioning.Mvc.ApiExplorer** | `8.1.0` | WebApi / Swagger | Hỗ trợ Swagger tự động phát hiện và hiển thị tài liệu các phiên bản API. |
| **FluentValidation.AspNetCore** | `11.3.0` | WebApi / Validation | Tự động hóa kiểm tra tính hợp lệ dữ liệu đầu vào. |
| **Npgsql.EntityFrameworkCore.PostgreSQL** | `9.0.2` | Infrastructure | Adapter kết nối PostgreSQL, hỗ trợ Connection Resiliency và xmin concurrency. |
| **Serilog.AspNetCore** | `8.0.0` | WebApi / Logging | Thay thế ILogger mặc định, ghi log có cấu trúc (Structured Logging). |

---

## 4. Gói Phụ Thuộc Phát Triển & Kiểm Thử (DevDependencies)

| Tên Thư Viện | Phiên bản | Phân hệ sử dụng | Vai trò cốt lõi |
| :--- | :--- | :--- | :--- |
| **vite** | `^5.0.0` | Build Tooling | Máy chủ phát triển HMR siêu nhanh dưới máy khách. |
| **vitest** | `^1.0.0` | Unit Testing | Bộ chạy kiểm thử đơn vị tự động siêu nhạy bén. |
| **sass** | `^1.69.0` | Styling | Bộ biên dịch CSS Glassmorphism Neon hổ phách cao cấp. |

---

## 4. Ràng Buộc Kiến Trúc Phụ Thuộc (Dependency Constraints)
*   **Không dùng thư viện ngoài cho hoạt ảnh DSA:** Toàn bộ thuật toán sắp xếp mảng Lerp Parabol, quay AVL nút cây, hạt HTTP request bay dọc cạnh và khói sập nguồn Canvas đều phải viết bằng mã nguồn TypeScript thuần túy kết hợp Canvas 2D/SVG để tối ưu hiệu năng 60 FPS bám sát rAF.
*   **Monaco Sandbox Security:** Phải cô lập Monaco Editor trong chế độ chặn nhấp chuột select văn bản (read-only pointer blockers) khi chạy VCR playback để bảo toàn dòng code.
