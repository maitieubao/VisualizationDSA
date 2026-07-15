# ✅ DEFINITION OF DONE — VisualizationDSA

> **Mục đích:** Một tính năng hoặc Sprint chỉ được coi là **DONE** khi đáp ứng đầy đủ TẤT CẢ tiêu chí dưới đây.  
> Không được đánh dấu `✅ CODE DONE` chỉ vì code compile thành công hoặc unit test pass.  
> **"Done" không phải là "code xong" — Done là "người dùng thực sự dùng được và hài lòng."**

---

## 🔧 PHẦN 1: TIÊU CHÍ KỸ THUẬT (Technical Criteria)

### 1.1 Build & Compile
- [ ] `dotnet build` — 0 errors, 0 warnings liên quan đến logic nghiệp vụ
- [ ] `vue-tsc -b` — 0 TypeScript errors (bắt buộc dùng `-b`, không dùng `--noEmit` đơn lẻ)
- [ ] `npm run build` (Vite production build) — thành công, sinh ra thư mục `dist/`
- [ ] Không có `any` hoặc `dynamic` không kiểm soát trong code mới

### 1.2 Unit Tests
- [ ] Tất cả unit test hiện có vẫn pass sau khi thêm code mới (`npm run test`, `dotnet test`)
- [ ] Tính năng mới có ít nhất **1 file spec** kiểm thử logic cốt lõi
- [ ] Độ bao phủ test của logic Engine/Store mới ≥ 80%
- [ ] Không có test bị skip hoặc comment tạm thời

### 1.3 Tích hợp API
- [ ] Endpoint API mới có response schema nhất quán với chuẩn `{ data, error, message }`
- [ ] Tất cả lỗi API đều trả về HTTP code đúng ngữ nghĩa (400/401/403/404/500)
- [ ] Không có `console.log`, `Console.WriteLine` debug bị quên trong code production
- [ ] CORS được cấu hình đúng — frontend chỉ gọi được từ origin được whitelist

### 1.4 Bảo mật & Xác thực
- [ ] Mọi endpoint cần auth đều được bảo vệ bằng JWT middleware
- [ ] Mọi endpoint cần phân quyền (Teacher/Admin) đều kiểm tra role trước khi xử lý
- [ ] Không có fallback sang ID dùng chung (ví dụ: `'demo-user-001'`) trong luồng thực
- [ ] Dữ liệu người dùng được đồng bộ giữa in-memory cache và PostgreSQL

### 1.5 Hiệu năng
- [ ] Trang load lần đầu < 3 giây trên mạng thường (Lighthouse score ≥ 75)
- [ ] Canvas animation duy trì ≥ 55 FPS khi hoạt động (đo bằng DevTools Performance)
- [ ] Không có memory leak có thể phát hiện sau 5 phút dùng liên tục
- [ ] Không có vòng lặp vô hạn hoặc request polling không có điều kiện dừng

### 1.6 Database & Persistence
- [ ] Migration mới đã được tạo và áp dụng (`dotnet ef migrations add` + `update database`)
- [ ] Dữ liệu quan trọng (user, order, progress) được lưu vào PostgreSQL, không chỉ RAM
- [ ] Sau khi restart backend, dữ liệu vẫn còn nguyên — không bị mất do chỉ lưu in-memory
- [ ] Seeder tạo đúng dữ liệu mẫu với role/trạng thái chính xác cho từng loại user

---

## 🎨 PHẦN 2: TIÊU CHÍ UX/UI (User Experience Criteria)

### 2.1 Khả năng sử dụng (Usability)
- [ ] Người dùng mới (không đọc tài liệu) có thể hoàn thành luồng chính trong < 2 phút
- [ ] Mỗi hành động quan trọng (submit, delete, upgrade) đều có thông báo phản hồi rõ ràng (toast, modal, trạng thái)
- [ ] Trạng thái loading được hiển thị khi chờ API response (spinner, skeleton, disabled button)
- [ ] Không có nút hoặc link dẫn đến trang trống hoặc lỗi 404

### 2.2 Xử lý lỗi cho người dùng
- [ ] Khi API lỗi, hiển thị thông báo lỗi bằng tiếng Việt — không phải stack trace kỹ thuật
- [ ] Form validation hiển thị lỗi ngay tại trường nhập, không chỉ sau khi submit
- [ ] Khi mạng mất kết nối, ứng dụng không bị crash — hiển thị thông báo phù hợp
- [ ] Trang 404/lỗi đều có nút quay về trang chủ

### 2.3 Thiết kế & Tính nhất quán
- [ ] Màu sắc, font, border-radius nhất quán theo Design System của dự án (Glassmorphism + Neon)
- [ ] Responsive: trang hiển thị đúng trên màn hình 1280px, 768px, 480px
- [ ] Không có text bị tràn container (overflow) hoặc bị cắt mất
- [ ] Các icon, emoji, badge sử dụng nhất quán về ý nghĩa (không dùng ✅ cho cả "done" lẫn "warning")

### 2.4 Trải nghiệm theo vai trò người dùng
- [ ] **Học viên (Student):** Có thể xem bài học → chạy animation → làm quiz → xem XP → nâng cấp Premium trong một luồng liền mạch
- [ ] **Giảng viên (Teacher):** Có thể xem thống kê lớp → thêm/sửa/xóa quiz → xem danh sách học viên mà không cần can thiệp kỹ thuật
- [ ] **Khách (Guest):** Có thể xem demo → được mời đăng ký → không bị truy cập tính năng premium

### 2.5 Phản hồi tương tác (Micro-interactions)
- [ ] Nút hover có hiệu ứng rõ ràng (không phải thay đổi con trỏ đơn thuần)
- [ ] Animation chuyển trang/tab mượt mà, không bị giật
- [ ] Thông báo thành công/lỗi tự động ẩn sau 3-5 giây, không chặn nội dung

---

## 📋 PHẦN 3: TIÊU CHÍ NGHIỆP VỤ (Business / Feature Criteria)

### 3.1 Hoàn chỉnh theo User Story
- [ ] **Acceptance Criteria** của User Story được kiểm tra theo từng điều kiện, không phải theo cảm tính
- [ ] Tính năng đã được kiểm thử từ góc nhìn người dùng cuối — không phải chỉ từ góc nhìn lập trình viên
- [ ] Edge case đặc thù của nghiệp vụ đã được xem xét (ví dụ: user premium xóa tài khoản thì sao? Quiz trống thì hiển thị gì?)

### 3.2 Luồng nghiệp vụ hoàn chỉnh (End-to-End Flow)
- [ ] Luồng chính (Happy Path) hoạt động hoàn toàn — từ đầu đến cuối không cần can thiệp thủ công
- [ ] Luồng thất bại (Error Path) được xử lý — hệ thống không bị treo hay mất dữ liệu
- [ ] Luồng biên (Edge Case) đã được kiểm tra: input rỗng, input quá dài, ký tự đặc biệt, số âm

### 3.3 Tích hợp giữa các phân hệ
- [ ] Tính năng mới không làm hỏng tính năng đã có (regression test pass)
- [ ] Dữ liệu được chia sẻ giữa các module nhất quán (ví dụ: XP từ quiz hiện đúng trên Dashboard)
- [ ] Trạng thái Premium được đồng bộ chính xác giữa checkout → dashboard → backend

### 3.4 Dữ liệu mẫu & Môi trường
- [ ] Seeder tạo đủ dữ liệu mẫu thực tế để demo được ngay — không cần nhập tay
- [ ] Tài khoản demo có đủ các role cần thiết với mật khẩu được ghi lại rõ ràng
- [ ] Môi trường Development và Production có cấu hình riêng biệt, không dùng chung secret

### 3.5 Tài liệu
- [ ] File `README.md` hoặc hướng dẫn triển khai đã được cập nhật nếu có thay đổi cấu hình
- [ ] API endpoint mới được ghi vào tài liệu (comment trong code hoặc Swagger)
- [ ] Quyết định kiến trúc quan trọng được ghi vào `plan/tracking/decisions.md`
- [ ] Lỗi đã fix được ghi vào `plan/tracking/errors.md` với nguyên nhân gốc và cách khắc phục

---

## 🚦 BẢNG KIỂM TRA TRƯỚC KHI ĐÁNH DẤU "DONE"

Trước khi chuyển trạng thái sang `✅ CODE DONE`, người thực hiện phải tự trả lời:

| # | Câu hỏi kiểm tra | Trả lời bắt buộc |
|---|---|---|
| 1 | Build và test pass chưa? | ✅ Có / ❌ Chưa |
| 2 | Tôi đã ngồi vào vai người dùng và dùng thử chưa? | ✅ Có / ❌ Chưa |
| 3 | Nếu người dùng nhập sai, hệ thống xử lý được không? | ✅ Có / ❌ Chưa |
| 4 | Sau khi restart server, dữ liệu vẫn còn không? | ✅ Có / ❌ Chưa |
| 5 | Tính năng này có phá vỡ tính năng nào đang chạy không? | ✅ Không / ❌ Có |
| 6 | Đã cập nhật tracking (progress.md / errors.md) chưa? | ✅ Có / ❌ Chưa |

> ❗ Nếu bất kỳ câu nào trả lời ❌ → **CHƯA DONE.**

---

## ⚠️ NHỮNG GÌ KHÔNG ĐƯỢC TÍNH LÀ "DONE"

- ❌ Code viết xong nhưng chưa được test thực tế bởi con người
- ❌ Unit test pass nhưng không có integration test cho luồng thực
- ❌ Tính năng hoạt động nhưng UX sơ sài, người dùng thực không biết cách dùng
- ❌ Tracking được cập nhật nhưng không phản ánh trạng thái thực tế của code
- ❌ Tính năng "hoạt động trên máy dev" nhưng chưa test trên môi trường gần production
- ❌ Lỗi bị biết nhưng chưa fix, chỉ được comment "TODO fix later"
- ❌ Dữ liệu phụ thuộc vào việc tự nhập tay mới chạy được

---

*Tài liệu này áp dụng cho toàn bộ Sprint 1–12 của dự án VisualizationDSA.*  
*Cập nhật lần cuối: 09/06/2026*
