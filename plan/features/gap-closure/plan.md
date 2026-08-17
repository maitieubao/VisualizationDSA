# Kế hoạch đóng khoảng trống tính năng (Gap Closure Plan)

> Mục tiêu: bổ sung các tính năng còn thiếu so với báo cáo `BaoCaoDoAn_PRO2192`, ưu tiên các tính năng nhỏ — demo được ngay — và giữ các feature phát triển **độc lập, không gây ảnh hưởng lẫn nhau**.
>
> Nguồn đối chiếu: phân tích tài liệu + codebase (xem `plan/tracking/progress.md` và báo cáo đối chiếu FR).

---

## 1. Nguyên tắc độc lập (áp dụng cho MỌI feature)

### 1.1. Năm "điểm hàn" duy nhất được phép đụng tới

Mỗi feature chỉ được thêm **đúng 1 dòng** ở mỗi chỗ sau (nếu cần):

| # | File | Nội dung thêm |
|---|---|---|
| 1 | `frontend/src/router/routes.ts` | 1 route entry |
| 2 | `frontend/src/appTabs.ts` | 1 tab entry |
| 3 | `frontend/src/views/admin/AdminPanelView.vue` | 1 dòng tab (chỉ feature có phần admin) |
| 4 | `backend/src/Infrastructure/Data/ApplicationDbContext.cs` | 1 dòng `DbSet` |
| 5 | `backend/src/WebApi/Program.cs` | 1 dòng DI (nếu có service mới) |

Mọi code còn lại nằm TRỌN trong folder riêng của feature.

### 1.2. Quy tắc chống xung đột

1. **1 feature = đúng 1 EF migration.** Migration chỉ được **ADD** bảng/cột mới.
   - CẤM sửa migration cũ, CẤM `database update` từ migration của feature khác.
2. **Feature A không import gì từ folder feature B.** Backend: controller/service riêng. Frontend: `features/<ten>/` riêng.
3. **Test riêng** — không sửa test của feature khác; mỗi feature có file spec riêng.
4. **Nhánh git riêng** — mỗi feature phát triển trên nhánh `feat/fX-<ten>`, merge tuần tự theo thứ tự mục 5.
5. **Không đụng CoreAnimationEngine** — tuân thủ Quy tắc 1 (Open-Closed) trong AGENTS.md.

### 1.3. Định nghĩa hoàn thành (DoD) chung

- [ ] Test backend + frontend của feature pass
- [ ] Chạy full test suite của repo không vỡ test cũ
- [ ] Đã cập nhật `plan/tracking/progress.md` + `plan/features/deep-decomposition/README.md` (nếu thêm feature)
- [ ] Đã cập nhật `plan/tracking/features-tested.md` + `plan/tracking/dependencies.md` (nếu thêm thư viện)
- [ ] Đã cập nhật `plan/features/gap-closure/tracking.md` + `errors.md` (nếu có lỗi)
- [ ] Merge không conflict với feature khác (chỉ đụng đúng 5 điểm hàn)

---

## 2. Tổng quan 9 feature

| ID | Feature | FR liên quan | Migration | Người phụ trách | Trạng thái |
|---|---|---|---|---|---|
| F1 | FAQ công khai | FR-7.2 | Không | TBD | ❌ SPEC ONLY |
| F2 | Benchmark Lab | FR-3.20 | Không (API có sẵn) | TBD | ❌ SPEC ONLY |
| F3 | Phê duyệt giảng viên | FR-1.8 | Không (Role là string) | TBD | ❌ SPEC ONLY |
| F4 | Tìm kiếm bài học | FR-2.5 | Không | TBD | ❌ SPEC ONLY |
| F5 | Ghi chú bài học | FR-2.6 | Có (`LessonNote`) | TBD | ❌ SPEC ONLY |
| F6 | Yêu thích mô phỏng | FR-3.10 | Có (`Favorite`) | TBD | ❌ SPEC ONLY |
| F7 | Cấu hình hệ thống | FR-6.2 | Có (`SystemSetting`) | TBD | ❌ SPEC ONLY |
| F8 | Practice Ladder 3 bậc | FR-4.11, FR-4.3 | Có (`StageProgress`) | TBD | ❌ SPEC ONLY |
| F9 | Learning Path + Tim | FR-2.10, FR-10.1 | Có (4 bảng + 3 cột User) | TBD | ❌ SPEC ONLY |

**Không có dependency chuỗi** — cả 9 feature có thể phát triển song song.

---

## 3. Chi tiết từng feature

### F1 — FAQ công khai (FR-7.2)

- **Loại:** thuần frontend, không migration, không backend.
- **Frontend:** `views/docs/FaqView.vue` — accordion tĩnh (dữ liệu const trong file), route `/faq`, tab "Trợ giúp".
- **Test:** spec kiểm tra expand/collapse + link tới `/docs`.
- **Rủi ro:** không có. Người làm F1 không cần chạy backend.

### F2 — Benchmark Lab (FR-3.20)

- **Loại:** thuần frontend — backend đã có `POST /algorithms/compare` (`AlgorithmsController`), KHÔNG sửa.
- **Frontend:** `features/benchmark-lab/` — store gọi API so sánh 2+ thuật toán trên cùng input; bảng thời gian/số bước + overlay độ phức tạp lý thuyết; route `/benchmark`, tab "Đo điểm chuẩn".
- **Test:** mock `algorithmsApi`, kiểm tra hiển thị kết quả nhiều kích thước.
- **Ràng buộc:** chỉ render kết quả API trả về, KHÔNG import engine mô phỏng.

### F3 — Phê duyệt giảng viên (FR-1.8)

- **Loại:** không migration — `User.Role` là string.
- **Backend:**
  - `StatelessAuthController.Register`: thêm cờ `isTeacher` → `Role = "PendingTeacher"` (mặc định vẫn `Student`).
  - `AdminController` đã có `PUT users/{id}/role` — dùng luôn, thêm endpoint liệt kê user theo role nếu cần.
- **Frontend:**
  - Form đăng ký thêm checkbox "Tôi là giảng viên".
  - `AdminUsersTab`: filter + 2 nút Duyệt/Từ chối cho user `PendingTeacher`.
  - Màn đăng nhập chặn với thông báo "đang chờ duyệt" cho tài khoản Pending.
- **Test:** unit test Register với cờ isTeacher; test admin duyệt đổi role.
- **Rủi ro:** guard `requiresRole: 'Teacher'` trong `router/index.ts` phải xử lý vai trò mới — chỉ sửa đúng 1 chỗ, báo trước cho cả nhóm.

### F4 — Tìm kiếm bài học (FR-2.5)

- **Loại:** không migration.
- **Backend:** `LessonController` thêm query param `?search=` (lọc `Title` chứa từ khóa).
- **Frontend:** ô search ở `CoursesListView` + debounce 300ms, gợi ý kết quả, bấm mở bài.
- **Test:** backend test lọc; frontend test debounce + hiển thị.

### F5 — Ghi chú bài học (FR-2.6)

- **Migration:** bảng `LessonNote` (`UserId`, `LessonId`, `ContentHtml`, `UpdatedAt`) — unique (UserId, LessonId).
- **Backend:** `LessonNotesController` GET/PUT/DELETE (upsert theo bài học của user hiện tại).
- **Frontend:** panel ghi chú trong `LessonStudyView`, tự lưu sau 1 giây (debounce).
- **Test:** unit test upsert + autosave.

### F6 — Yêu thích mô phỏng (FR-3.10)

- **Migration:** bảng `Favorite` (`UserId`, `SimulationKey`, `InputJson`, `CreatedAt`) — unique (UserId, SimulationKey).
- **Backend:** `FavoritesController` GET/POST/DELETE.
- **Frontend:** nút sao ở `AlgorithmVisualizer` header + danh sách yêu thích trong Profile.
- **Test:** unit test toggle + lưu input.

### F7 — Cấu hình hệ thống (FR-6.2)

- **Migration:** bảng `SystemSetting` (`Key`, `Value`, `Description`, `UpdatedAt`, `UpdatedBy`).
- **Backend:** `SettingsController` GET/PUT (chỉ Admin) + cache in-memory, áp dụng ngay không restart.
- **Frontend:** `AdminSystemTab` bổ sung form chỉnh sửa (section mới trong tab hiện có).
- **Test:** unit test get/put + cache.
- **Lưu ý:** F3 đụng `AdminUsersTab`, F7 đụng `AdminSystemTab` — 2 tab khác nhau, không xung đột.

### F8 — Practice Ladder 3 bậc (FR-4.11, FR-4.3)

- **Migration:** bảng `StageProgress` (`UserId`, `LessonId`, `Stage` 1/2/3, `Status`, `BestScore`, `UpdatedAt`) — unique (UserId, LessonId, Stage).
- **Backend:** `LadderController`:
  - `GET /ladder/{lessonId}` — trạng thái 3 bậc.
  - `POST /ladder/{lessonId}/pass` — guard: chưa pass bậc trước → 403 `LADDER_LOCKED`; chấm điểm phía server.
- **Frontend:** `features/ladder/` — chuỗi 3 bậc:
  - Bậc 1: quiz hiện có.
  - Bậc 2: Interactive Lab tối giản — thao tác tay trên mảng + nút "Nộp" so trạng thái cuối + giới hạn số bước.
  - Bậc 3: Codelab hiện có.
- **Test:** unit test guard thứ tự bậc + chấm trạng thái cuối.
- **Độc lập với F9:** Ladder gắn theo `LessonId`, không cần biết Learning Path tồn tại.

### F9 — Learning Path + Tim (FR-2.10, FR-10.1)

- **Migration (lớn nhất):**
  - Bảng mới: `LearningPath`, `LearningPathNode`, `UserNodeProgress`, `NodeSession`.
  - `User`: **chỉ ADD** cột `Hearts`, `HeartsMax`, `LastHeartAt` — không đụng logic User hiện có.
- **Backend:** `LearningPathController`:
  - `GET /learning-path/{id}` — bản đồ node kèm trạng thái.
  - `POST /learning-path/{id}/nodes/{nodeId}/enter` — trừ 1 tim **atomic** + tạo/gia hạn session 30 phút; 403 `HEARTS_EMPTY` khi hết tim; hồi tim theo giờ server.
- **Frontend:** `features/learning-path/` — bản đồ node (khóa/đang học/đã pass 1-3 sao), widget tim ở header, modal hết tim, resume session.
- **Test:** unit test trừ tim (kể cả 2 request song song → chỉ trừ 1), hồi tim, mở khóa node kế.
- **Độc lập với F8:** Path lưu trạng thái node riêng, không import Ladder. Sau này muốn "pass Ladder mới pass node" thì nối qua tham số `nodeId → lessonId`, không sửa code cũ.

---

## 4. Phân công đề xuất (4 người, chạy song song)

| Người | Feature | Ghi chú |
|---|---|---|
| Người 1 | F2 (Benchmark) → F4 (Tìm kiếm) | |
| Người 2 | F1 (FAQ) → F6 (Yêu thích) → F5 (Ghi chú) | |
| Người 3 | F3 (Phê duyệt GV) → F7 (Settings) | |
| Người 4 | F8 (Ladder) → F9 (Learning Path + Tim) | F9 lớn nhất, làm riêng |

## 5. Thứ tự merge

1. F1 → F7 trước (nhỏ, kiểm chứng quy trình).
2. F8, F9 cuối.
3. Nếu quỹ thời gian cạn: **F9 là ứng viên bỏ đầu tiên** — sửa tài liệu thay vì build.

---

## 6. Danh sách "không nên làm" (sửa tài liệu thay vì build)

| Tính năng | Lý do |
|---|---|
| Gems Shop (FR-10.2) + Daily Quest (FR-10.3) | Scope creep ngoài 4 trụ cột; tốn công thiết kế kinh tế |
| 2FA (FR-1.11) | Ưu tiên "Thấp" trong tài liệu, cần hạ tầng email |
| Khôi phục mật khẩu qua email thật (FR-1.6) | Cần SMTP + template; admin reset-password là đủ |
| Import CSV câu hỏi (FR-4.10) | Ưu tiên "Thấp", không ai demo |
| Call stack đệ quy (FR-3.14) + điểm dừng điều kiện (FR-3.15) | Kỹ thuật cao, khó thấy giá trị khi demo |
| Di cư SQLite → SQL Server | Code có nhiều xử lý đặc thù SQLite (ERR-216, QZ-047); rủi ro vỡ test. **Sửa tài liệu thành SQLite** |
| Bổ sung đủ 44 mô phỏng theo Phụ lục D | 22 mô phỏng hiện tại đã vượt KPI G2 (≥14); mỗi thao tác mới cần generator + pseudocode + giải thích riêng. **Sửa Phụ lục D theo catalog thật** |
| Đổi routes theo Bảng 4.2 sitemap | Vỡ links + tests. **Giữ route hiện tại, sửa bảng trong tài liệu** |

## 7. Việc tài liệu bắt buộc phải sửa cho trung thực (không phụ thuộc code)

- [ ] Bỏ kết quả PASS "điền sẵn" ở Bảng 6.3–6.5 trong khi mục 6.2 ghi "chưa chạy" — mâu thuẫn nội tại dễ bị soi nhất.
- [ ] Sửa CSDL (SQL Server → SQLite) và số bảng cho khớp thực tế.
- [ ] Sửa catalog mô phỏng + KPI G1/G2 theo số liệu đo được thật.
- [ ] Sửa 2 heading "Error! Bookmark not defined" trong mục lục.

---

## 8. Tài liệu liên quan

- Tracking từng bước: [`tracking.md`](./tracking.md)
- Nhật ký lỗi: [`errors.md`](./errors.md)
