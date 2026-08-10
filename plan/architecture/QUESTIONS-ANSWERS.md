# ❓ CÂU HỎI THẮC MẮC & LỜI GIẢI THÍCH KHI TRÌNH BÀY ỨNG DỤNG

> Tài liệu chuẩn bị cho buổi trình bày ứng dụng VisualizationDSA trước hội đồng/thầy cô.
> Tập trung vào các **vấn đề nghiệp vụ** có thể bị thắc mắc và **đáp án giải thích**.

---

## 📑 MỤC LỤC

1. [Tính toàn vẹn dữ liệu](#1-tính-toàn-vẹn-dữ-liệu)
2. [Bảo mật & Kiểm soát truy cập](#2-bảo-mật--kiểm-soát-truy-cập)
3. [Gian lận & Lạm dụng hệ thống](#3-gian-lận--lạm-dụng-hệ-thống)
4. [Thanh toán & Xử lý sự cố](#4-thanh-toán--xử-lý-sự-cố)
5. [Mở rộng & Hiệu năng](#5-mở-rộng--hiệu-năng)
6. [Trường hợp đặc biệt (Edge Cases)](#6-trường-hợp-đặc-biệt-edge-cases)
7. [Quyền sở hữu & Nội dung](#7-quyền-sở-hữu--nội-dung)
8. [Điểm số & Tranh chấp](#8-điểm-số--tranh-chấp)
9. [Đồng bộ & Mất kết nối](#9-đồng-bộ--mất-kết-nối)
10. [Kiểm duyệt nội dung](#10-kiểm-duyệt-nội-dung)

---

## 1. TÍNH TOÀN VỮN DỮ LIỆU

### ❓ Câu hỏi 1: "Nếu giảng viên xóa một khóa học đang có học viên theo học thì sao?"

**Đáp án:**
- Hệ thống dùng **soft delete** (`IsDeleted=true`), không xóa cứng
- Khi GV "xóa" course:
  ```
  UPDATE Courses SET IsDeleted=true WHERE Id=@courseId
  ```
- Học viên hiện tại **vẫn xem được** nội dung đã học (progress được giữ)
- Học viên mới **không thấy** course trong danh sách (filter `IsDeleted=false`)
- Dữ liệu không mất: progress, quiz attempts, XP vẫn tồn tại
- **Rollback**: GV có thể "khôi phục" course bằng cách set `IsDeleted=false`

> ✅ **Kết luận**: Không có nguy cơ mất dữ liệu học tập.

---

### ❓ Câu hỏi 2: "Nếu xóa bài học đang có học viên làm dở thì sao?"

**Đáp án:**
- Tương tự soft delete trên Lessons
- `UserLessonProgresses` giữ lại tiến độ đã làm
- Nếu bài bị xóa giữa chừng → học viên thấy thông báo "Bài học không khả dụng" nhưng progress cũ được bảo toàn
- Nếu GV khôi phục bài → học viên tiếp tục từ bước đang dở

> ✅ **Kết luận**: Tiến độ học tập luôn được bảo vệ.

---

### ❓ Câu hỏi 3: "Có tình trạng race condition khi 2 request cùng cộng XP không?"

**Đap án:**
- Có thể xảy ra khi user click nhanh 2 lần
- Giải pháp: **Idempotency check** trước khi award XP:
  ```
  SELECT UserLessonProgresses
  WHERE UserId=@userId AND LessonId=@lessonId AND XPAwarded > 0
  → IF exists → SKIP (đã nhận XP)
  ```
- Thêm **unique constraint** trên `QuizXpGrants(UserId, QuizId)`:
  ```sql
  CREATE UNIQUE INDEX UX_QuizXpGrants_User_Quiz
  ON QuizXpGrants(UserId, QuizId);
  ```
- Database transaction đảm bảo atomicity

> ✅ **Kết luận**: Không thể nhận XP trùng lặp.

---

## 2. BẢO MẬT & KIỂM SOÁT TRUY CẬP

### ❓ Câu hỏi 4: "Học viên có thể truy cập Premium content mà không trả tiền không?"

**Đáp án:**
- **Frontend**: PremiumGate component blur content + hiện nút nâng cấp
- **Backend**: Mỗi API endpoint kiểm tra:
  ```csharp
  if (course.IsPremium && !user.IsPremium)
      return Forbid("Cần tài khoản Premium");
  ```
- **Không thể bypass**: JWT token chứa claim `is_premium`, server verify mỗi request
- Direct API call không có valid token → 403 Forbidden

> ✅ **Kết luận**: Bảo mật 2 lớp (UI + API), không thể truy cập trái phép.

---

### ❓ Câu hỏi 5: "Ai có quyền xem dữ liệu học tập của học viên?"

**Đáp án:**
| Vai trò | Quyền xem |
|---------|-----------|
| **Student** | Chính mình (progress, XP, history) |
| **Teacher** | Học viên trong lớp mình quản lý |
| **Admin** | Tất cả |

- Kiểm tra ở API:
  ```csharp
  if (requester.Role == "Teacher") {
      // Kiểm tra student thuộc classroom của teacher không
      var enrollment = await _db.ClassroomEnrollments
          .FirstOrDefaultAsync(e => e.StudentId == studentId
              && e.Classroom.OwnerTeacherId == teacherId);
      if (enrollment == null) return Forbid();
  }
  ```

> ✅ **Kết luận**: Phân quyền chặt chẽ theo role + ownership.

---

### ❓ Câu hỏi 6: "Làm sao ngăn học viên khác xem được đáp án hidden test case?"

**Đáp án:**
- `CodelabTestCases.IsHidden = true` → không trả về input/output cho frontend
- API response lọc:
  ```json
  {
    "visibleTests": [
      { "input": "5,3,8", "expected": "3,5,8", "actual": "3,5,8", "passed": true }
    ],
    "hiddenTests": [
      { "passed": true }  // Chỉ hiện pass/không, không hiện input/output
    ]
  }
  ```
- Hidden test chỉ trả về `{ passed: true/false }`

> ✅ **Kết luận**: Hidden test bảo mật hoàn toàn.

---

## 3. GIAN LẬN & LỤM DỤNG HỆ THỐNG

### ❓ Câu hỏi 7: "Học viên có thể farming XP bằng cách làm lại quiz nhiều lần không?"

**Đáp án:**
- **KHÔNG THỆ** vì:
  1. `QuizXpGrants` unique constraint → mỗi quiz chỉ nhận XP 1 lần
  2. `UserLessonProgresses.XPAwarded` check → không cộng XP trùng
  3. QuizAttempts vẫn lưu mọi lần làm → có thể retry nhưng không thêm XP

> ✅ **Kết luận**: XP farming là bất khả thi.

---

### ❓ Câu hỏi 8: "Làm sao ngăn chặn gian lận trong Codelab?"

**Đáp án:**
| Loại gian lận | Phòng chống |
|---|---|
| **Copy code bạn học** | Mỗi bài có nhiều test case → code copy có thể không pass |
| **Hardcode output** | Hidden test với input đa dạng → hardcode sẽ fail |
| **Infinite loop** | Timeout 2s → terminate |
| **Memory bomb** | Giới hạn 128MB RAM |
| **System call** | Sandbox Piston API không cho phép |
| **Spam submit** | Rate limit 10 req/min |

- Piston API chạy trong sandbox Docker riêng biệt

> ✅ **Kết luận**: Đa lớp phòng chống gian lận.

---

### ❓ Câu hỏi 9: "Streak có thể bị gaming không? (VD: đăng nhập rồi logout mỗi ngày)"

**Đáp án:**
- Streak tính theo **LastActivityDate**, không phải login
- Phải có **activity thực tế** (xem bài, làm quiz, submit code) cập nhật `LastActivityDate`
- Grace period 2 giờ → hỗ trợ học muộn nhưng không dài dằng dặc
- Reset streak nếu quá 26 giờ không hoạt động

> ✅ **Kết luận**: Streak phản ánh học tập thực, không thể fake bằng login.

---

## 4. THANH TOÁN & XỬ LÝ SỰ CỐ

### ❓ Câu hỏi 10: "Nếu user chuyển khoản nhưng hệ thống không nhận được thông báo thì sao?"

**Đáp án:**
- Order ở trạng thái **Pending** chờ xác nhận
- **Timeout**: Order hết hạn sau 15 phút → user tạo order mới
- **Admin có thể manually confirm**:
  ```sql
  UPDATE Orders SET Status="Completed" WHERE PaymentCode="PAY123"
  UPDATE Users SET IsPremium=true WHERE Id=@userId
  ```
- Lịch sử giao dịch lưu trong Orders → dễ đối chiếu với ngân hàng
- **Reconciliation job** (tương lai): Tự động đối chiếu với VietQR API

> ✅ **Kết luận**: Có cơ chế fallback thủ công + audit trail.

---

### ❓ Câu hỏi 11: "User mua Premium rồi yêu cầu hoàn tiền thì sao?"

**Đáp án:**
- **Chính sách**: Premium là gói lifetime → không hoàn tiền (ghi rõ khi mua)
- Nếu có sự cố kỹ thuật → Admin có thể:
  1. Refund thủ công qua ngân hàng
  2. Set `User.IsPremium = false`
  3. Set `Order.Status = "Refunded"`
  4. Ghi nhận trong `AuditLogs`

> ✅ **Kết luận**: Có audit trail đầy đủ để xử lý tranh chấp.

---

## 5. MỞ RỘNG & HIỆU NĂNG

### ❓ Câu hỏi 12: "Nếu 1000 học viên cùng submit codelab thì hệ thống chịu nổi không?"

**Đáp án:**
- **Piston API** (bên ngoài) xử lý sandbox → không tốn server mình
- Giới hạn: max 10 submissions/phút/user → tránh spam
- **Queue pattern** (tương lai):
  ```
  Submit → Queue → Worker (Piston) → Callback → Update DB
  ```
- Hiện tại: 2s timeout/test × ~5 tests = max 10s/submission
- Stateless API → dễ scale horizontal (thêm server instance)

> ✅ **Kết luậng**: Kiến trúc hiện tại chịu được ~100 concurrent submissions.

---

### ❓ Câu hỏi 13: "Có cache không? Nếu database chậm thì sao?"

**Đáp án:**
- **Không cache** (MVP stage) — mọi query trực tiếp DB
- Các query đã optimize:
  - Index trên `UserId`, `LessonId`, `QuizId`
  - Filter `IsDeleted=false` ở mọi query
- **Tương lai**: Redis cache cho:
  - Course catalog (ít thay đổi)
  - Leaderboard (tính lại mỗi 5 phút)
  - Quiz questions (load 1 lần/session)

> ✅ **Kết luận**: Hiệu năng đủ tốt cho scale nhỏ-vừa (< 10K users).

---

## 6. TRƯỜNG HỢP ĐỶC BIỆT (EDGE CASES)

### ❓ Câu hỏi 14: "Giảng viên xóa tài khoản thì khóa học của GV đó sao?"

**Đáp án:**
- GV xóa account → soft delete (`IsActive=false`)
- Courses giữ nguyên (thay bằng "Giảng viên không còn hoạt động")
- **Transfer ownership** (tương lai):
  ```
  UPDATE Courses SET TeacherId=@newTeacherId
  WHERE TeacherId=@deletedTeacherId
  ```
- Hiện tại: Admin gán lại GV quản lý thủ công

> ✅ **Kết luận**: Nội dung học không bị mất khi GV rời đi.

---

### ❓ Câu hỏi 15: "Học viên đang làm quiz thì mất mạng → progress có mất không?"

**Đáp án:**
- **Progress từng câu**: Lưu local state (Pinia store) → refresh vẫn giữ
- **Chưa submit**: Không mất gì (chưa gọi API)
- **Đang submit**: 
  - Nếu API chưa nhận → retry khi online lại
  - Nếu API nhận nhưng response mất → idempotency check tránh trùng
- **Offline-first**: localStorage backup progress

> ✅ **Kết luận**: Progress được bảo vệ tối đa trong mọi tình huống.

---

### ❓ Câu hỏi 16: "2 GV cùng sửa 1 khóa học thì ai thắng?"

**Đáp án:**
- **Optimistic concurrency**: Dùng `RowVersion` timestamp
- GV A sửa → save thành công (version tăng)
- GV B sửa (dữ liệu cũ) → nhận **409 Conflict**
  ```
  "Nội dung đã được GV khác sửa đổi. Vui lòng tải lại và thử lại."
  ```
- GV B phải refresh → thấy thay đổi mới → sửa lại → save

> ✅ **Kết luận**: Không có nguy cơ ghi đè dữ liệu.

---

### ❓ Câu hỏi 17: "Student chuyển lớp thì progress có theo không?"

**Đáp án:**
- Progress gắn với **User + Lesson**, không gắn Classroom
- Student chuyển lớp → progress giữ nguyên
- Nếu 2 lớp dùng chung lesson → progress shared
- **Override**: `ClassroomModuleItemOverrides` cho phép tùy chỉnh XP/title riêng lớp

> ✅ **Kết luận**: Progress cá nhân luôn đi theo student.

---

## 7. QUYỀN SỞ HỮU & NỘI DUNG

### ❓ Câu hỏi 18: "Ai sở hữu nội dung GV tạo ra?"

**Đáp án:**
- **Terms of Service** (cần bổ sung):
  - GV giữ quyền tác giả
  - Nền tảng có license sử dụng để hiển thị/trình bày
  - GV xóa account → nội dung vẫn thuộc GV (cần GV yêu cầu xóa)
- **Technical**: `Courses.TeacherId` → xác định ownership
- **Audit**: Mọi CRUD đều log trong AuditLogs

> ✅ **Kết luận**: Cần bổsung Terms of Service rõ ràng về IP.

---

### ❓ Câu hỏi 19: "GV có thể xem code bài làm của học viên khác không?"

**Đáp án:**
- **CÓ**, nếu học viên thuộc lớp GV quản lý
- API endpoint: `GET /api/codelabs/{id}/submissions?studentId={id}`
- GV xem được:
  - Source code
  - Test results
  - Runtime/memory stats
- **Use case**: Phát hiện copy code, hỗ trợ debugging

> ✅ **Kết luận**: Transparent cho GV, có audit trail.

---

## 8. ĐIỂM SỐ & TRANH CHẤP

### ❓ Câu hỏi 20: "Học viên phản ánh câu quiz sai đáp án thì sao?"

**Đáp án:**
- Tính năng **Report** (tương lai):
  ```
  INSERT QuizReports { QuestionId, StudentId, Reason, Status="Pending" }
  ```
- Admin review → Accept/Reject
- Nếu Accept:
  ```
  UPDATE QuizQuestions SET CorrectIndex=@newIndex
  UPDATE QuizAttempts SET Score=Recalculate() WHERE QuestionId=@qid
  ```
- Hiện tại: GV/Admin sửa trực tiếp `QuizQuestions.CorrectIndex`

> ✅ **Kết luận**: Có cơ chế sửa sai sót, recalculate điểm.

---

### ❓ Câu hỏi 21: "Làm sao biết học viên hiểu thật hay đoán may?"

**Đáp án:**
- **QuizAttempts** lưu mọi lần làm → phân tích:
  - Số lần làm lại trước khi pass
  - Thời gian hoàn thành
  - Pattern chọn đáp án (nếu random → phân phối đều)
- **Codelab**: Code thật → không thể đoàn may
- **Analytics** (tương lai):
  ```
  SELECT UserId, AVG(AttemptsToPass), AVG(TimeToComplete)
  FROM QuizAttempts GROUP BY UserId
  ```

> ✅ **Kết luận**: Có đủ data để phân tích, cần bổ sung analytics dashboard.

---

## 9. ĐỒNG BỘ & MẤT KẾT NỐI

### ❓ Câu hỏi 22: "User offline thì có thể học không?"

**Đáp án:**
- **Không thể** (hiện tại):
  - Quiz/Codelab cần API để grade
  - Progress cần sync lên server
- **Tương lai** (PWA + Service Worker):
  - Cache nội dung bài học (markdown)
  - Queue khi offline → sync khi online
  - `localStorage` lưu draft answers

> ⚠️ **Kết luận**: Cần bổ sung offline mode cho UX tốt hơn.

---

### ❓ Câu hỏi 23: "Session hết hạng thì user phải login lại không?"

**Đáp án:**
- **Không**, nhờ RefreshToken:
  - AccessToken: 15 phút
  - RefreshToken: 30 ngày
  - Auto-refresh mỗi 13 phút → user không biết
- Chỉ login lại khi:
  - RefreshToken hết hạn (30 ngày không dùng)
  - User logout
  - Admin revoke token

> ✅ **Kết luận**: UX mượt mà, không bị gián đoạn.

---

## 10. KIỂM DUYỆT NỘI DUNG

### ❓ Câu hỏi 24: "Ai kiểm duyệt nội dung GV tạo trước khi public?"

**Đáp án:**
- **Hiện tại**: GV tự publish (không có moderation queue)
- **Workflow**: Draft → GV review → Publish
- **Tương lai** (cần bổ sung):
  - Admin/Moderator duyệt trước khi public
  - `Course.PublishStatus`: Draft → PendingReview → Published/Rejected
  - Flag content vi phạm → Admin remove

> ⚠️ **Kết luận**: Cần bổ sung moderation workflow cho production.

---

### ❓ Câu hỏi 25: "Làm sao ngăn nội dung không phù hợp (violence, NSFW)?"

**Đáp án:**
- **Reporting system** (tương lai):
  ```
  INSERT ContentReports { ContentType, ContentId, ReporterId, Reason }
  ```
- Admin review → Remove + Warn/ Ban user
- **Technical**: Chưa có auto-moderation (AI/image detection)
- **Manual**: Admin audit định kỳ

> ⚠️ **Kết luận**: Cần xây dựng reporting + moderation system.

---

## 📊 TỔNG HỢP MỨC ĐỘ SẴN SÀNG

| Lĩnh vực | Mức độ | Ghi chú |
|---|---|---|
| Data Integrity | ✅ Sẵn sàng | Soft delete, idempotent, audit |
| Security | ✅ Sẵn sàng | JWT, RBAC, 2-layer check |
| Anti-cheat | ✅ Sẵn sàng | Rate limit, sandbox, hidden tests |
| Payment | ✅ Sẵn sàng | Order tracking, fallback |
| Scale | ⚠️ MVP OK | Cần cache/queue khi > 10K users |
| Offline | ⚠️ Thiếu | Cần PWA |
| Content Moderation | ⚠️ Thiếu | Cần reporting workflow |
| Academic Analytics | ⚠️ Thiếu | Cần dashboard chi tiết |
| IP/Terms | ⚠️ Thiếu | Cần legal docs |
| Level Design | ✅ Sẵn sàng | 8 levels, 40 badges, streaks |

> 🎯 **Khuyến nghị**: Ư tiên bổ sung **Content Moderation** và **Offline Mode** trước khi launch production.
