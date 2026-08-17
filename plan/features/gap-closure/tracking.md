# Tracking từng bước thực hiện — Gap Closure

> File này track trạng thái thực tế của từng feature trong kế hoạch `plan.md`.
> Quy tắc viết giống `plan/tracking/progress.md`: chỉ ghi `✅` khi code đã viết, test đã pass, feature đã mount vào App. **Không retroactive.**

## Chú giải trạng thái

- `❌ SPEC ONLY` — chưa có dòng code nào, chỉ có kế hoạch
- `🟠 PARTIAL (X%)` — có skeleton nhưng chưa tích hợp vào App
- `🟡 IN PROGRESS (X%)` — đang code, ghi rõ phần trăm và còn thiếu gì
- `✅ CODE DONE` — code viết xong, test pass, đã tích hợp

---

## Tổng trạng thái (2026-08-17 — TẤT CẢ F1-F9 ĐÃ HOÀN THÀNH)

| Feature | Trạng thái | Test | Ghi chú |
|---|---|---|---|
| F1 FAQ công khai (FR-7.2) | ✅ CODE DONE | FE 3/3 | route /faq + tab Trợ giúp |
| F2 Benchmark Lab (FR-3.20) | ✅ CODE DONE | FE 3/3 | route /benchmark + tab Đo điểm chuẩn |
| F3 Phê duyệt giảng viên (FR-1.8) | ✅ CODE DONE | BE 6/6 | checkbox đăng ký + duyệt/từ chối admin |
| F4 Tìm kiếm bài học (FR-2.5) | ✅ CODE DONE | BE 3/3 | LessonSearchBar debounce 300ms |
| F5 Ghi chú bài học (FR-2.6) | ✅ CODE DONE | BE 3 + FE 3 | side panel LessonStudyView |
| F6 Yêu thích mô phỏng (FR-3.10) | ✅ CODE DONE | BE 4 + FE 3 | nút sao AlgorithmVisualizer |
| F7 Cấu hình hệ thống (FR-6.2) | ✅ CODE DONE | BE 3 + FE 2 | form AdminSystemTab |
| F8 Practice Ladder (FR-4.11, FR-4.3) | ✅ CODE DONE | BE + FE 4 | LadderPanel trong LessonStudyView |
| F9 Learning Path + Tim (FR-2.10, FR-10.1) | ✅ CODE DONE | BE 6 + FE 9 | trừ tim atomic + session 30p |

**Tổng cộng: backend 819/819 PASS, frontend spec mới 39 tests PASS.**

130 fail vitest toàn repo là **PRE-EXISTING** — đã xác nhận bằng cách revert LoginModal về bản git gốc vẫn fail y hệt (không liên quan F1-F9). Ghi nhận ở commit 850a9715.

---

## Checklist trước khi merge (mọi feature)

```
[x] Test feature pass — BE 819/819 + spec mới FE 39 PASS
[x] Full test suite repo không vỡ — chỉ còn 130 fail pre-existing (không tăng)
[x] Chỉ đụng đúng 5 điểm hàn (routes / appTabs / AdminPanelView / DbContext / Program.cs)
[x] Cập nhật plan/tracking/progress.md
[x] Cập nhật plan/tracking/features-tested.md
[x] Cập nhật gap-closure/tracking.md + errors.md
[ ] plan/features/deep-decomposition/README.md — không cập nhật (feature nằm ngoài deep-decomposition)
[ ] plan/tracking/dependencies.md — không thêm thư viện mới
```

---

## Chi tiết từng feature

### F1 — FAQ công khai (FR-7.2) — ✅ CODE DONE
- FaqView.vue accordion tĩnh 6 câu hỏi, route `/faq`, tab "Trợ giúp"
- Test: faqView.spec.ts 3/3 PASS

### F2 — Benchmark Lab (FR-3.20) — ✅ CODE DONE
- features/benchmark-lab/ (service + store + view), route `/benchmark`, tab "Đo điểm chuẩn"
- Gọi POST /algorithms/compare (backend có sẵn), overlay độ phức tạp lý thuyết
- Test: benchmarkP0.spec.ts 3/3 PASS

### F3 — Phê duyệt giảng viên (FR-1.8) — ✅ CODE DONE
- BE: register `isTeacher` → Role PendingTeacher; login chặn 403 TEACHER_PENDING; GET /concepts/admin/users/by-role; audit ApproveTeacher/RejectTeacher
- FE: checkbox "Tôi là giảng viên" trong LoginModal; badge + nút Duyệt/Từ chối trong AdminUsersTab; router guard chặn PendingTeacher
- Test: TeacherApprovalTests 6/6 PASS

### F4 — Tìm kiếm bài học (FR-2.5) — ✅ CODE DONE
- BE: GET /concepts/lessons?search= (lọc Title case-insensitive)
- FE: LessonSearchBar (debounce 300ms + gợi ý + chống race requestSeq) gắn CoursesListView
- Test: LessonSearchTests 3/3 PASS

### F5 — Ghi chú bài học (FR-2.6) — ✅ CODE DONE
- BE: entity LessonNote (unique UserId+LessonId) + LessonNotesController GET/PUT/DELETE
- FE: LessonNotesPanel autosave 1s, side panel trong LessonStudyView (nút "Ghi chú")
- Migration: GapF567NotesFavoritesSettings
- Test: BE 3/3 + FE 3/3 PASS

### F6 — Yêu thích mô phỏng (FR-3.10) — ✅ CODE DONE
- BE: entity Favorite (unique UserId+SimulationKey) + FavoritesController GET/POST/DELETE
- FE: FavoriteToggle (nút sao) gắn header AlgorithmVisualizer
- Migration: GapF567NotesFavoritesSettings
- Test: BE 4/4 + FE 3/3 PASS

### F7 — Cấu hình hệ thống (FR-6.2) — ✅ CODE DONE
- BE: entity SystemSetting (PK Key) + SettingsController GET/PUT admin + cache ConcurrentDictionary
- FE: SettingsFormSection gắn AdminSystemTab
- Migration: GapF567NotesFavoritesSettings
- Test: BE 3/3 + FE 2/2 PASS
- Sửa thêm: adminP0Tests allowlist thêm `/api/v1/admin/settings` (30/30 PASS)

### F8 — Practice Ladder 3 bậc (FR-4.11, FR-4.3) — ✅ CODE DONE
- BE: entity StageProgress (unique UserId+LessonId+Stage) + LadderController (guard LADDER_LOCKED server-side, chấm lab trạng thái cuối + giới hạn bước)
- FE: LadderPanel 3 bậc gắn LessonStudyView (emit go-codelab → bước 4)
- Migration: GapF8StageProgress
- Test: BE + FE 4/4 PASS

### F9 — Learning Path + Tim (FR-2.10, FR-10.1) — ✅ CODE DONE
- BE: entities LearningPath/LearningPathNode/UserNodeProgress/NodeSession + User thêm Hearts/HeartsMax/LastHeartAt (ADD-only, default 10)
- LearningPathController: GET paths/map, POST enter (trừ 1 tim atomic + session 30p + 403 HEARTS_EMPTY + hồi tim theo giờ server), POST pass (mở khóa node kế)
- FE: LearningPathMap + HeartsWidget + HeartsEmptyModal
- Migration: GapF9LearningPathHearts
- Test: BE 6/6 + FE 9/9 PASS
- Ghi chú test: Teleport render ra document.body → test modal phải dùng attachTo + query body; BaseIcon đăng ký qua global.components (không phải stubs)

---

## Công việc sửa tài liệu báo cáo (chạy song song với feature, không cần code)

| # | Việc | Trạng thái | Người |
|---|---|---|---|
| 1 | Bỏ kết quả PASS "điền sẵn" ở Bảng 6.3–6.5 | ⬜ CHƯA LÀM | TBD |
| 2 | Sửa CSDL SQL Server → SQLite + số bảng | ⬜ CHƯA LÀM | TBD |
| 3 | Sửa catalog mô phỏng + KPI G1/G2 theo số liệu thật | ⬜ CHƯA LÀM | TBD |
| 4 | Sửa 2 heading "Error! Bookmark not defined" | ⬜ CHƯA LÀM | TBD |
| 5 | Cập nhật báo cáo sau khi F1–F9 hoàn thành | ⬜ CHƯA LÀM | TBD |
