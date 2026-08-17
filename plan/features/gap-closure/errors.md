# Nhật ký lỗi — Gap Closure

> Ghi chép mọi lỗi phát sinh trong quá trình phát triển các feature F1–F9.
> Quy tắc: mỗi lỗi 1 dòng, ghi **nguyên nhân + cách khắc phục + trạng thái**. Không xóa lỗi cũ, chỉ đổi trạng thái.
> Đồng bộ với `plan/tracking/errors.md` nếu lỗi ảnh hưởng tính năng đã tồn tại.

## Chú giải trạng thái

- 🔴 OPEN — chưa xử lý
- 🟡 IN PROGRESS — đang xử lý
- ✅ FIXED — đã xử lý xong, test pass

---

## Danh sách lỗi

### Ngày: 2026-08-17 (đợt thực thi F1-F9)

| ID | Feature | Mô tả lỗi | Nguyên nhân | Cách khắc phục | Trạng thái |
|---|---|---|---|---|---|
| GC-001 | Chung | `dotnet test` fail MSB3021/MSB3027 "file is locked by WebApi" | Tiến trình WebApi.exe (dev server) đang chạy khóa DLL output | `taskkill /IM WebApi.exe /F` trước khi build/test | ✅ FIXED |
| GC-002 | F9 | Test HeartsEmptyModal render ra HTML rỗng — `wrapper.text()` trống | Component dùng `<Teleport to="body">` → nội dung render vào document.body ngoài wrapper | Mount với `attachTo: document.body` + query qua `document.body`; assert v-model qua parent component | ✅ FIXED |
| GC-003 | F9 | `wrapper.emitted('update:modelValue')` trả undefined dù click nút đóng | Test-utils không ghi nhận emit từ slot Teleport nằm ngoài wrapper | Assert qua parent v-model (ref thay đổi) thay vì emitted | ✅ FIXED |
| GC-004 | F9 | Star icon không tìm thấy (`[data-name="star"]` = 0) trong LearningPathMap test | BaseIcon chưa đăng ký global trong môi trường test (main.ts không chạy) — `stubs` không resolve được component template | Đăng ký qua `global.components: { BaseIcon: BaseIconStub }` (không phải stubs) | ✅ FIXED |
| GC-005 | F9 | Test đóng modal fail vì overlay vẫn còn trong DOM | `<Transition name="modal-fade">` đang chạy animation leave — DOM chưa xóa ngay | Chỉ assert trạng thái v-model đã đổi, không assert DOM đã xóa | ✅ FIXED |
| GC-006 | Chung | `has-pending-model-changes` = "Changes have been made" sau khi hàn Fluent API | (1) LearningPathNode.LessonId FK là SetNull không phải Cascade; (2) thiếu index riêng cho FK (LessonId/NodeId) khớp snapshot | Đọc snapshot migration để khớp chính xác: SetNull + thêm HasIndex FK. Dùng migration probe tạm (GapWeldProbe) để soi khác biệt rồi xóa | ✅ FIXED |
| GC-007 | F7 | adminP0Tests AD-035 fail "Request tới endpoint ngoài allowlist: /api/v1/admin/settings" | SettingsFormSection gọi endpoint mới chưa có trong allowlist test | Thêm `/api/v1/admin/settings` vào ADMIN_ALLOWED_URL_PARTS | ✅ FIXED |
| GC-008 | Chung | 130 fail vitest toàn repo gây nhầm tưởng do hàn | PRE-EXISTING (ghi nhận commit 850a9715 "frontend pre-existing fails documented") | Xác minh: revert LoginModal về bản git gốc vẫn fail y hệt; spec mới F1-F9 đều PASS độc lập | ✅ XÁC NHẬN PRE-EXISTING |
| GC-009 | F3 | `git checkout -- src/...` chạy nhầm working directory làm mất thay đổi LoginModal.vue | Lệnh checkout path chạy từ repo root nhưng path thiếu prefix `frontend/` | Áp dụng lại đầy đủ thay đổi F3 vào LoginModal.vue (checkbox isTeacher + reset form + pass isTeacher vào statelessRegister) | ✅ FIXED |

### Ngày: 2026-08-17 (review code sau thực thi)

| ID | Feature | Mô tả lỗi | Nguyên nhân | Cách khắc phục | Trạng thái |
|---|---|---|---|---|---|
| GC-010 | F9 | EnterNode trừ 1 Tim khi vào lại node ĐÃ PASS — vi phạm FR-10.1 "bài học đã hoàn thành mở lại ôn tập không bị trừ Tim" | Không check UserNodeProgress trước khi claim session | Thêm nhánh sớm: node đã pass → trả resumed + hearts hiện tại, không đụng session/tim. Test mới `EnterPassedNode_DoesNotDeductHeart` | ✅ FIXED |
| GC-011 | F9 | `ClaimResult.UserNotFound` không được xử lý → trả 500 thay vì 404 | Helper trả flag nhưng caller không check | Check `result.UserNotFound` ngay sau claim → NotFound USER_NOT_FOUND | ✅ FIXED |
| GC-012 | F5 | PUT note cho lessonId không tồn tại → FK violation 500 | Không validate lesson trước khi Add/SaveChanges | Thêm check `Lessons.AnyAsync` → 404 LESSON_NOT_FOUND. Test mới `Upsert_OnMissingLesson_ReturnsNotFound` | ✅ FIXED |
| GC-013 | F6 | Bắt DbUpdateException bằng `when` match message "UNIQUE constraint"/"duplicate key" — mong manh giữa SQLite/Postgres (message khác nhau → race rethrow 500) | Match string message của provider | Bỏ `when` — catch DbUpdateException chung, re-query bản ghi; có thì idempotent OK, không thì rethrow | ✅ FIXED |
| GC-014 | F9 | FE store không nhận diện được lỗi HEARTS_EMPTY (modal hết tim không bao giờ hiện) | Backend trả `{ error: "HEARTS_EMPTY" }` nhưng apiClient parseErrorBody chỉ map status/title/detail — field `error` KHÔNG nằm trong ApiError | `isHeartsEmptyError` check thêm `err.error` ngoài `detail` | ✅ FIXED |
| GC-015 | F9 | Components LearningPathMap/HeartsWidget/HeartsEmptyModal KHÔNG được mount vào bất kỳ view nào — feature "xong" nhưng người dùng không thấy gì; DB không có LearningPath nào | Agent E hết lượt trước bước mount; không ai seed lộ trình mẫu | Gắn vào DashboardView (card Lộ trình học + stat-card Tim + modal hết tim); HeartsWidget tự load path đầu khi mount; DbSeeder.SeedLearningPathAsync (upsert theo title, gắn 3 lesson đầu) | ✅ FIXED |
| GC-016 | Dashboard | 3 test dashboard fail vì thêm stat-card Tim (thứ 5) | Test cũ assert đúng 4 cards | Cập nhật test: 5 cards, card hearts chỉ check label. Backend 821/821, FE vùng liên quan 86/86 PASS | ✅ FIXED |

---

## Lỗi dự kiến trước (đọc trước khi code để né)

| Feature | Lỗi dự kiến | Cách né |
|---|---|---|
| F3 | Guard `requiresRole: 'Teacher'` chặn nhầm PendingTeacher | Sửa đúng 1 chỗ trong `router/index.ts`, báo cả nhóm trước khi merge |
| F3 | User PendingTeacher lọt vào báo cáo/leaderboard | Filter role ở mọi query hiện có; test role Pending không xuất hiện |
| F5/F6/F7/F8/F9 | Conflict migration khi nhiều người cùng tạo migration | 1 feature = 1 migration ADD-only; merge nhánh tuần tự; cấm sửa migration cũ |
| F5/F6/F7/F8/F9 | SQLite không hỗ trợ đầy đủ migration một số kiểu dữ liệu | Chỉ dùng kiểu đã có sẵn trong project (Guid, string, int, DateTime); tham khảo comment ERR-216 |
| F9 | Trừ tim 2 lần khi 2 tab cùng enter | Trừ tim atomic trong transaction; test concurrency (2 request song song) |
| F9 | Hồi tim bị gian lận bằng cách chỉnh đồng hồ máy | Tính hồi tim theo giờ SERVER, không theo client |
| F8 | Ladder bậc sau mở được khi chưa pass bậc trước (bypass API) | Guard phía server, không chỉ frontend |
| F2 | API compare trả dữ liệu không khớp UI mong đợi | Đọc kỹ `CompareResultDto` trước khi code UI |
| F4 | Tìm kiếm bị lỗi ký tự tiếng Việt (case/unicode) | Normalize + `ToLower()` trước khi lọc |
| F1/F2 | Route mới conflict với route `/:pathMatch(.*)*` | Thêm route TRƯỚC wildcard trong `routes.ts` |

---

## Lỗi đã fix (log mẫu)

_(Điền theo định dạng trên khi có lỗi thật.)_
