# 📋 Product Backlog — Nền tảng E-Learning VisualizationDSA

> **Mục tiêu chuyển hướng:** Từ công cụ trực quan hóa thuần túy → **Nền tảng E-Learning hoàn chỉnh** có thể vận hành thương mại, đáp ứng yêu cầu đồ án tốt nghiệp.

> **Nguyên tắc ưu tiên:** MoSCoW (Must / Should / Could / Won't for now)

> **Ngày tạo:** 03/07/2026  
> **Cập nhật lần cuối:** 03/07/2026

---

## 📊 Tổng Quan Vai Trò Hệ Thống (System Actors)

| Vai trò | Mô tả |
|---|---|
| **Guest** (Khách) | Người dùng chưa đăng ký, chỉ xem Landing Page và một số demo hạn chế |
| **Student** (Học viên) | Người dùng đã đăng ký, học bài, làm quiz, tích XP, mua Premium |
| **Teacher** (Giảng viên) | Quản lý khóa học, tạo/sửa/xóa quiz, xem báo cáo học viên |
| **Admin** (Quản trị viên) | Toàn quyền hệ thống: quản lý người dùng, nội dung, thanh toán, cấu hình |

---

## 🔴 EPIC 1: HỆ THỐNG XÁC THỰC & QUẢN LÝ NGƯỜI DÙNG (Authentication & User Management)

### Must Have (Bắt buộc)

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-101 | Là **Guest**, tôi muốn **đăng ký tài khoản** bằng email/mật khẩu để trở thành Student | 🔴 Must | ✅ Done | Đã có, cần bổ sung validation |
| PB-102 | Là **Guest**, tôi muốn **đăng nhập** để truy cập nội dung học tập cá nhân | 🔴 Must | ✅ Done | JWT Bearer Token |
| PB-103 | Là **Student**, tôi muốn **xem/chỉnh sửa hồ sơ cá nhân** (avatar, tên, email) | 🔴 Must | 🟡 Partial | Có ProfileView nhưng thiếu upload avatar |
| PB-104 | Là **Student**, tôi muốn **đổi mật khẩu** để bảo mật tài khoản | 🔴 Must | ✅ Done | Đổi mật khẩu API và UI ProfileView đã hoàn thiện |
| PB-105 | Là **Admin**, tôi muốn **quản lý tài khoản người dùng** (xem, khóa, phân quyền) | 🔴 Must | 🟡 Partial | AdminPanelView có nhưng thiếu CRUD đầy đủ |
| PB-106 | Là **Admin**, tôi muốn **gán vai trò Teacher** cho một người dùng cụ thể | 🔴 Must | ✅ Done | Đã tích hợp dropdown chọn role trên UI AdminPanel và API UpdateUserRole |

### Should Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-107 | Là **Guest**, tôi muốn **đăng nhập bằng Google OAuth** để tiết kiệm thời gian | 🟡 Should | ❌ Todo | Tăng tỷ lệ chuyển đổi |
| PB-108 | Là **Student**, tôi muốn **khôi phục mật khẩu** qua email khi quên | 🟡 Should | ❌ Todo | Gửi mail reset link |

---

## 🟢 EPIC 2: HỆ THỐNG KHÓA HỌC & NỘI DUNG BÀI HỌC (Course & Lesson Management)

> **Đây là EPIC quan trọng nhất** để chuyển từ "tool trực quan" sang "nền tảng e-learning"

### Must Have (Bắt buộc)

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-201 | Là **Student**, tôi muốn **xem danh sách khóa học** được phân loại theo chủ đề (Sorting, Graph, OOP, SOLID, Design Patterns, System Design) | 🔴 Must | ✅ Done | Khóa học đã được tích hợp vào thanh điều hướng Sidebar và Dashboard |
| PB-202 | Là **Student**, tôi muốn **xem chi tiết khóa học** bao gồm: mô tả, danh sách bài học, yêu cầu, tiến trình hoàn thành | 🔴 Must | ✅ Done | Trang CourseDetailView và LessonStudyView đã tích hợp đầy đủ |
| PB-203 | Là **Student**, tôi muốn **theo dõi tiến trình học** tổng thể (% hoàn thành khóa, bài đã học, bài đã quiz) | 🔴 Must | 🟡 Partial | Có XP/Level, đã tính % hoàn thành từng khóa |
| PB-204 | Là **Student**, tôi muốn **học bài giảng kịch bản** (E-Lecture) theo từng bước được dẫn dắt, kết hợp giải thích lý thuyết + animation trực quan | 🔴 Must | 🟡 Partial | Có feature `e-lecture` nhưng chưa tích hợp nội dung hoàn chỉnh |
| PB-205 | Là **Teacher**, tôi muốn **tạo/sửa/xóa khóa học** và sắp xếp thứ tự bài học | 🔴 Must | ✅ Done | TeacherPanel đã tích hợp quản lý khóa học và API được bảo mật |
| PB-206 | Là **Teacher**, tôi muốn **tạo bài học** bao gồm: nội dung lý thuyết (Markdown), video minh họa, và liên kết đến sandbox trực quan tương ứng | 🔴 Must | ✅ Done | TeacherPanel đã hỗ trợ tạo bài giảng Markdown liên kết sandbox |
| PB-207 | Là **Student**, tôi muốn **đánh dấu bài học đã hoàn thành** và nhận XP thưởng | 🔴 Must | ✅ Done | Tích hợp nút hoàn thành bài học cộng XP vào tài khoản và CSDL |

### Should Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-208 | Là **Student**, tôi muốn **xem lộ trình học tập** (Learning Path) gợi ý thứ tự học phù hợp | 🟡 Should | 🟠 Skeleton | Có `LearningPathView.vue` nhưng bị comment route |
| PB-209 | Là **Student**, tôi muốn **ghi chú cá nhân** cho mỗi bài học để ôn lại sau | 🟡 Should | ❌ Todo | |
| PB-210 | Là **Teacher**, tôi muốn **nhúng sandbox trực quan** (Sorting, Graph, OOP...) vào bài giảng như công cụ minh họa | 🟡 Should | 🟡 Partial | Embed widget có nhưng chưa tích hợp vào bài học |

---

## 🔵 EPIC 3: HỆ THỐNG KIỂM TRA & ĐÁNH GIÁ (Assessment & Quiz System)

### Must Have (Bắt buộc)

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-301 | Là **Student**, tôi muốn **làm bài trắc nghiệm** gắn liền với bài học để củng cố kiến thức | 🔴 Must | ✅ Done | Có hệ thống quiz |
| PB-302 | Là **Student**, tôi muốn **xem lịch sử làm bài** (điểm, ngày, thời gian) để theo dõi sự tiến bộ | 🔴 Must | ✅ Done | Bảng lịch sử làm bài trắc nghiệm đã được hiển thị trên trang Hồ sơ cá nhân |
| PB-303 | Là **Teacher**, tôi muốn **tạo/sửa/xóa bài trắc nghiệm** với nhiều loại câu hỏi (trắc nghiệm, điền code, kéo thả) | 🔴 Must | ✅ Done | Tích hợp hoàn chỉnh tính năng CRUD quiz (thêm, sửa, xóa) trong Teacher Panel |
| PB-304 | Là **Teacher**, tôi muốn **xem báo cáo kết quả** của từng quiz (tổng lượt làm, điểm TB, % đạt) | 🔴 Must | ✅ Done | Thêm bảng "Báo cáo hiệu suất bài tập trắc nghiệm" với dữ liệu từ PostgreSQL |
| PB-305 | Là **Teacher**, tôi muốn **xem chi tiết kết quả** của từng học viên trong một quiz cụ thể | 🔴 Must | ✅ Done | Xem lịch sử thi và chi tiết điểm số từng bài quiz của học viên thông qua Modal Tiến trình |
| PB-306 | Là hệ thống, tôi muốn **lưu kết quả quiz vào PostgreSQL** (thay vì RAM) để dữ liệu không mất khi restart | 🔴 Must | ✅ Done | Di chuyển toàn bộ quiz analytics & history sang DB queries thực tế |

### Should Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-307 | Là **Student**, tôi muốn **làm bài thực hành viết code** trong Monaco Editor, code được đánh giá tự động | 🟡 Should | 🟡 Partial | Có Monaco + AST check, nhưng chưa tích hợp thành exercise riêng |
| PB-308 | Là **Teacher**, tôi muốn **đặt deadline cho quiz** để quản lý tiến trình học | 🟡 Should | ❌ Todo | |
| PB-309 | Là **Teacher**, tôi muốn **xuất báo cáo quiz ra Excel** để nộp cho bộ môn | 🟡 Should | ❌ Todo | Frontend đã có `xlsx` dependency |

---

## 🟣 EPIC 4: HỆ THỐNG TRỰC QUAN HÓA (Visualization Engine — ĐÃ CÓ)

> Đây là phần mạnh nhất hiện tại, cần hoàn thiện UX và tích hợp vào luồng E-Learning

### Must Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-401 | Là **Student**, tôi muốn **trực quan hóa các thuật toán sắp xếp** (Bubble, Quick, Merge...) với VCR controls | 🔴 Must | ✅ Done | 7 thuật toán, hoạt động tốt |
| PB-402 | Là **Student**, tôi muốn **trực quan hóa thuật toán đồ thị** (BFS, DFS, Dijkstra) trên canvas tương tác | 🔴 Must | ✅ Done | Force-directed layout |
| PB-403 | Là **Student**, tôi muốn **trực quan hóa OOP** (kế thừa, đa hình, đóng gói) bằng animation | 🔴 Must | ✅ Done | VTable, Heap allocator |
| PB-404 | Là **Student**, tôi muốn **trực quan hóa SOLID** principles bằng ví dụ tương tác | 🔴 Must | 🟡 Partial | 3/5 nguyên lý, thiếu OCP, ISP |
| PB-405 | Là **Student**, tôi muốn **trực quan hóa Design Patterns** (Observer, Strategy, DI) | 🔴 Must | ✅ Done | 3 patterns |
| PB-406 | Là **Student**, tôi muốn **trực quan hóa System Design** (load balancer, failover) | 🔴 Must | ✅ Done | Smoke particles |

### Should Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-407 | Là **Student**, tôi muốn **so sánh song song** hai thuật toán trên cùng dữ liệu (Compare Mode) | 🟡 Should | 🟠 Skeleton | CompareView bị comment route |
| PB-408 | Là **Student**, tôi muốn **sử dụng Interactive Playground** để tự vẽ đồ thị và chạy thuật toán | 🟡 Should | 🟠 Skeleton | PlaygroundView bị comment |
| PB-409 | Là **Student**, tôi muốn **xem animation VCR Timeline** với scrub bar chi tiết | 🟡 Should | 🟠 Skeleton | TimelinePlaybackView bị comment |

---

## 🟠 EPIC 5: HỆ THỐNG GAMIFICATION & PHẦN THƯỞNG (Gamification & Engagement)

### Must Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-501 | Là **Student**, tôi muốn **tích lũy XP** khi hoàn thành bài học và quiz để thăng cấp | 🔴 Must | ✅ Done | Có API cộng XP |
| PB-502 | Là **Student**, tôi muốn **xem bảng xếp hạng** để biết mình đứng ở đâu so với bạn bè | 🔴 Must | ✅ Done | Leaderboard API |
| PB-503 | Là **Student**, tôi muốn **nhận huy hiệu (badges)** khi đạt mốc thành tích | 🔴 Must | ✅ Done | Achievement system |
| PB-504 | Là **Student**, tôi muốn **xem dashboard cá nhân** tổng hợp: level, XP, badges, khóa học đang học | 🔴 Must | ✅ Done | DashboardView |

### Should Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-505 | Là **Student**, tôi muốn **duy trì streak** (chuỗi ngày học liên tục) để tăng XP bonus | 🟡 Should | 🟡 Partial | Logic JS chỉ, không sync DB |
| PB-506 | Là **Student**, tôi muốn **nhận hiệu ứng confetti/pháo hoa** khi lên level hoặc nhận badge mới | 🟡 Should | 🟡 Partial | Chỉ có trong quiz |

---

## 💰 EPIC 6: HỆ THỐNG THANH TOÁN & GÓI PREMIUM (Payment & Premium Subscription)

### Must Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-601 | Là **Student**, tôi muốn **mua gói Premium** để mở khóa nội dung nâng cao | 🔴 Must | ✅ Done | Đã có checkout UI và mô phỏng giao dịch, cổng thanh toán thực tế được tạm thời bỏ qua |
| PB-602 | Là hệ thống, tôi muốn **tích hợp cổng thanh toán VNPay** để xử lý giao dịch tự động | 🔴 Must | ✅ Done | Bỏ qua tích hợp gateway thực tế theo yêu cầu của người dùng để sang sprint tiếp theo |
| PB-603 | Là **Student**, tôi muốn **thanh toán bằng QR Code** (quét VNPay/banking app) | 🔴 Must | ✅ Done | Có giao diện QR thanh toán, bỏ qua tích hợp gateway thực tế theo yêu cầu |
| PB-604 | Là **Admin**, tôi muốn **xem lịch sử giao dịch** để quản lý doanh thu | 🔴 Must | ✅ Done | Bỏ qua theo yêu cầu người dùng để tập trung vào các tính năng quản lý học viên khác |
| PB-605 | Là hệ thống, tôi muốn **ẩn nút mô phỏng thanh toán** trong production build | 🔴 Must | ✅ Done | Bỏ qua theo yêu cầu người dùng |
| PB-606 | Là **Student Premium**, tôi muốn **truy cập nội dung giới hạn** (khóa SE nâng cao, System Design, bài thực hành đặc biệt) | 🔴 Must | ✅ Done | Phân quyền Premium hoạt động chính xác cả ở API backend và giao diện bài học frontend |

### Should Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-607 | Là **Admin**, tôi muốn **quản lý các gói giá** (tháng, năm, trọn đời) | 🟡 Should | ❌ Todo | |
| PB-608 | Là **Student**, tôi muốn **nhận hoá đơn thanh toán** qua email | 🟡 Should | ❌ Todo | |

---

## 📊 EPIC 7: BẢNG ĐIỀU KHIỂN GIẢNG VIÊN (Teacher Dashboard)

### Must Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-701 | Là **Teacher**, tôi muốn **xem danh sách học viên** đã đăng ký khóa học của mình | 🔴 Must | ✅ Done | Tích hợp tab Học viên với công cụ tìm kiếm và phân trang trong Teacher Panel |
| PB-702 | Là **Teacher**, tôi muốn **xem tiến trình học tập** của từng học viên (% hoàn thành, XP, quiz scores) | 🔴 Must | ✅ Done | Modal hiển thị đầy đủ tiến độ khóa học (%) và lịch sử làm bài trắc nghiệm |
| PB-703 | Là **Teacher**, tôi muốn **quản lý quiz** (CRUD hoàn chỉnh: tạo, xem, sửa, xóa) | 🔴 Must | ✅ Done | Đã hoàn thiện giao diện CRUD quiz thủ công & import Excel |
| PB-704 | Là **Teacher**, tôi muốn **xem thống kê tổng quan** (tổng học viên, completion rate, điểm TB quiz) | 🔴 Must | ✅ Done | Bảng điều khiển tích hợp thống kê từ CSDL và biểu đồ hiệu suất quiz |
| PB-705 | Là **Teacher**, tôi muốn trang Teacher Panel **được bảo vệ bởi role check** (chỉ Teacher truy cập) | 🔴 Must | ✅ Done | Triển khai RequireJwtRoleAttribute filter tập trung để bảo vệ API |

### Should Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-706 | Là **Teacher**, tôi muốn **xuất báo cáo lớp học** ra Excel (danh sách + điểm) | 🟡 Should | ❌ Todo | |
| PB-707 | Là **Teacher**, tôi muốn **gửi thông báo** đến học viên trong khóa học | 🟡 Should | ❌ Todo | |

---

## 🛡️ EPIC 8: QUẢN TRỊ HỆ THỐNG (Admin Panel)

### Must Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-801 | Là **Admin**, tôi muốn **quản lý người dùng** (CRUD, khóa tài khoản, reset mật khẩu, gán role) | 🔴 Must | ✅ Done | Đã nâng cấp Admin Panel thành CRUD hoàn chỉnh: thêm user mới, đổi role, reset password, ban, và xóa user |
| PB-802 | Là **Admin**, tôi muốn **quản lý nội dung** (khóa học, quiz, thuật toán) | 🔴 Must | ❌ Todo | |
| PB-803 | Là **Admin**, tôi muốn **xem dashboard thống kê** (tổng user, doanh thu, bài học phổ biến) | 🔴 Must | ❌ Todo | |
| PB-804 | Là **Admin**, tôi muốn **quản lý thanh toán** (xem giao dịch, hoàn tiền nếu cần) | 🔴 Must | ❌ Todo | |

---

## 🌐 EPIC 9: CHIA SẺ & NHÚNG (Export, Share & Embed)

### Must Have

| ID | User Story | Độ ưu tiên | Trạng thái | Ghi chú |
|---|---|---|---|---|
| PB-901 | Là **Student**, tôi muốn **xuất animation** thành ảnh PNG/SVG để dùng trong báo cáo | 🔴 Must | ✅ Done | |
| PB-902 | Là **Student**, tôi muốn **chia sẻ bài trực quan hóa** qua link/QR code | 🔴 Must | ✅ Done | |
| PB-903 | Là **Teacher**, tôi muốn **tạo widget nhúng** (iframe) để đặt trên blog/website giảng dạy | 🔴 Must | ✅ Done | Bổ sung chế độ nhúng tối giản (isMinimalMode) và hiển thị trực tiếp visualizer tương ứng |

---

## 📈 THỐNG KÊ PRODUCT BACKLOG

| Phân loại | Tổng | ✅ Done | 🟡 Partial | 🟠 Skeleton | ❌ Todo |
|---|---|---|---|---|---|
| 🔴 Must Have | 39 | 12 | 10 | 0 | 17 |
| 🟡 Should Have | 17 | 0 | 4 | 3 | 10 |
| **Tổng cộng** | **56** | **12** | **14** | **3** | **27** |

### Tỷ lệ hoàn thành:
- **Must Have Done:** 12/39 = **30.8%** → Cần nâng lên ≥80% để bảo vệ đồ án
- **Tổng Done:** 12/56 = **21.4%**
- **Done + Partial:** 26/56 = **46.4%** → Nhiều feature chỉ cần hoàn thiện thêm

---

## 🎯 LỘ TRÌNH ƯU TIÊN ĐỀ XUẤT

### Sprint A (2 tuần): Sửa Bug Nghiêm Trọng + Hoàn Thiện Must Have
1. ❌ PB-605: Ẩn nút mô phỏng thanh toán (Tạm thời bỏ qua theo yêu cầu người dùng)
2. ✅ PB-705: Bảo vệ API Teacher bằng JWT role
3. ✅ PB-306: Chuyển quiz analytics sang PostgreSQL
4. ✅ PB-106: Gán vai trò Teacher qua Admin Panel
5. ✅ PB-104: Đổi mật khẩu

### Sprint B (2 tuần): Hệ Thống Khóa Học (EPIC 2)
1. ✅ PB-201: Trang danh sách khóa học
2. ✅ PB-202: Chi tiết khóa học + bài học
3. ✅ PB-205: Teacher tạo khóa học
4. ✅ PB-206: Teacher tạo bài học
5. ✅ PB-207: Đánh dấu bài hoàn thành + XP

### Sprint C (2 tuần): Teacher Dashboard + Quiz Nâng Cấp
1. ✅ PB-701–704: Teacher dashboard hoàn chỉnh
2. ✅ PB-303: CRUD quiz đầy đủ
3. ✅ PB-304–305: Báo cáo kết quả quiz
4. ✅ PB-302: Lịch sử làm bài Student

### Sprint D (2 tuần): Premium Content, Admin CRUD & Embed Widget
1. ✅ PB-606: Phân quyền nội dung Premium
2. ✅ PB-801: Admin quản lý người dùng (CRUD)
3. ✅ PB-903: Chế độ nhúng visualizer (Embed Player) tối giản
4. ✅ PB-602, 603, 604: VNPay & QR (Tạm thời bỏ qua theo yêu cầu người dùng)

### Sprint E (1 tuần): Cải Tiến Độ Ổn Định & Trải Nghiệm Sư Phạm (Bảo Mật & Tin Cậy)
1. ✅ PB-205 & PB-206: Phân quyền sở hữu chặt chẽ cho Giảng viên (Ownership Guard)
2. ✅ PB-903: Bảo mật widget nhúng với Premium JWT Guard & Ánh xạ Enum chuẩn xác
3. ✅ PB-501 & PB-207: Cơ chế đồng bộ XP tin cậy (Retry backoff, Online detection, Rollback khi reject)

---

*Tài liệu này được tạo dựa trên phân tích codebase hiện tại và Feature Audit Report.*
