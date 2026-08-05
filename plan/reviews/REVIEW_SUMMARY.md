# KẾT QUẢ REVIEW TOÀN DIỆN — TỔNG HỢP (2026-08-04)

> 62 tiến trình review song song: **36/36 backend controllers** + **27/27 frontend modules** (một controller đợt cuối).
> Chi tiết từng mục: `backend/REVIEW_RESULTS.md` (phần backend) + phần frontend cùng file.
> Mức độ: **P0** = nghiêm trọng khai thác ngay · **P1** = cao, cần sửa trước release · **P2** = trung bình · **P3** = nhẹ.

---

## 📊 THỐNG KÊ

| Hạng mục | P0 | P1 | Ghi chú |
|---|---|---|---|
| **Backend (36 controllers)** | 13 | ~45 | JwtHelper/StatelessAuth/StatelessPayment/Payment/Quiz route... |
| **Frontend (27 modules)** | 5 | ~40 | html-playground sandbox, XSS v-html, payment secret client... |
| **Tổng** | **18** | **~85** | + ~150 P2/P3 |

---

## 🔴 18 LỖI P0 (sửa ngay)

### Backend (13)
| # | Vị trí | Vấn đề |
|---|---|---|
| 1 | JwtHelper.cs:13,37-41 | **Secret JWT hardcode trong source** + so sánh signature base64 chuẩn vs base64url → token thật (AuthService) bị 401, ai đọc repo forge được token Admin |
| 2 | StatelessAuthController.cs:195 | `ForceAddRefreshToken` — attacker tự dựng refresh token cho userId tùy ý → **account takeover không cần mật khẩu** |
| 3 | StatelessAuthController.cs (toàn class) | Không [Authorize] + tin userId từ client → IDOR đọc/sửa profile/đổi mật khẩu mọi user |
| 4 | StatelessAuthController.cs:447 | AwardXP không auth không giới hạn → tự cày XP vô hạn |
| 5 | AdminUsersController.cs:7 | Endpoint admin lộ toàn bộ user (email/role/XP) **không cần đăng nhập** |
| 6 | UsersController.cs:134-150 | IDOR: users/{id}/progress đọc progress/XP/premium của mọi user |
| 7 | CourseController.cs:234-258 | IDOR: teacher bất kỳ thêm module/item vào khóa học của người khác |
| 8 | StatelessPaymentController.cs:115-131 | simulate-webhook không auth → tự cấp Premium |
| 9 | StatelessPaymentController.cs:44-87 | Checkout/Verify theo userId client tự khai, không auth → cấp premium cho người khác |
| 10 | StatelessGamificationController.cs:21-94 | award-xp anonymous ghi DB → tự cày XP vô hạn |
| 11 | QuizController vs QuizzesController | **Xung đột route** `api/v1/quizzes` → AmbiguousMatchException, chết toàn bộ quiz API |
| 12 | LessonReviewController.cs:15,25-43 | Auth lệch hệ + **tính năng chết** (không nơi nào tạo LessonReview) |

### Frontend (5)
| # | Vị trí | Vấn đề |
|---|---|---|
| 13 | html-playground PlaygroundPreview.vue:4 | iframe `allow-same-origin + allow-scripts` → code user đọc localStorage/cookie; + link chia sẻ = 1 URL đánh cắp session |
| 14 | algo-playground AlgoPlaygroundWorkspace.vue:194 | XSS v-html: code user `log('<img onerror>')` chạy trên main thread |
| 15 | payment paymentApi.ts:59 | **Webhook secret lộ trong bundle client** + backend chấp nhận API-key → kích hoạt Premium miễn phí |
| 16 | payment usePaymentStore.ts:218-254 | simulatePaymentSuccess gọi thẳng webhook — gọi được từ console ở production |
| 17 | export-share useExportShareStore.ts:67-69 | setInterval fake-progress không clear khi export fail → rò rỉ vĩnh viễn |
| 18 | codelabs codelabApi.ts:50-52 | revealHint gọi route sai → luôn 404 (module hiện dead code) |

---

## 🟠 P1 NỔI BẬT (tóm tắt theo nhóm)

**Bảo mật/auth:**
- AuthService: user bị khóa vẫn login · user enumeration register · `/me` trả Role sai "Student"
- ExtractRole/Sub decode KHÔNG verify chữ ký (dùng ngoài RequireToken = forge role)
- PaymentsController: Order **Cancelled vẫn cấp Premium** · không đối chiếu AccountNumber · webhook verify fail-open
- UploadController: không check magic bytes → polyglot XSS (serve cùng origin)
- Codelab: rò rỉ hidden testcase + hint Content miễn phí (bypass XP cost) · farm XP vô hạn · trừ XP không idempotent
- StatelessQuiz: **lộ đáp án** CorrectIndex/Explanation qua GET public · quiz bank không bao giờ cấp XP thật
- TheoryArticle: IDOR đọc draft + onlyPublished=false client kiểm soát
- Lesson: CompleteLesson bỏ qua premium gate · đọc bài Draft qua GUID · trả entity Lesson (lộ progress mọi user)
- Analytics/Diagnostics: overview không auth · simulate-error public
- embed-widget: Bridge mặc định `['*']` + fail-open whitelist rỗng · host script không verify origin (CSS injection)
- interactive-playground: XSS explanation (label từ import) · directed graph chạy sai như undirected

**Logic nghiêm trọng:**
- progress roadmap LUÔN 0 (API list không trả lessons + so XP trung bình)
- courses: premium gate bypass khi chưa đăng nhập
- lesson: bestScore ghi đè bằng điểm THẤP hơn · XP hiển thị sai bài không codelab · loadLesson race · codelabExecutor fallback main-thread không kill-switch
- gamification: confetti không bao giờ bắn · streak reset sau sync · freezes "nút giả" · requiredAlgorithmId bị bỏ qua · RAF leak confetti
- user-progress: `isStateless || true` → markModuleComplete không persist · SkillRadarChart số ảo
- docs: copy button vỡ với `'` · heading hiển thị `**` · link /docs vỡ hash router (79 link) · 5 bài trees/ mồ côi
- dsa-modules: countingSort SAI kết quả · keyboard trùng qua KeepAlive
- e-lecture: race skip PLAY_UNTIL · exit không unlock đúng chủ quyền · interactionLocked kẹt khi rời route
- realtime: duplicate connection race · feature toàn dead code
- guided-tour: 90/100 selector chết · sai tọa độ scroll (lệch mọi tour)

---

## ✅ NHỮNG PHẦN SẠCH (đã xác minh, không có vấn đề nghiêm trọng)

- **Thuật toán sorting (algorithm-sandbox): 53/53 test pass, edge case đúng, không P0**
- **Không có SQL injection** ở bất kỳ controller nào (toàn EF tham số hóa)
- **Không có RCE/execution injection**: AlgorithmsController chỉ nạp int[] vào strategy tin cậy; code user qua Piston sandbox ngoài
- **Cleanup lifecycle tốt**: Monaco/RAF/ResizeObserver/workers được dispose đúng ở hầu hết nơi
- **XSS thực thi được**: chỉ 3 điểm (AlgoPlaygroundWorkspace, LessonStepTheory, InteractivePlayground explanation) + sandbox iframe P0; phần còn lại dùng interpolation an toàn

---

## 📋 ĐỀ XUẤT LỘ TRÌNH SỬA (ưu tiên)

1. **Đợt A (P0, ~1-2 ngày):** JwtHelper (secret→config + base64url + FixedTimeEquals) · StatelessAuth (bỏ ForceAddRefreshToken, thêm [Authorize]) · xóa QuizController stub · AdminUsersController auth · 2 P0 payment frontend + backend · html-playground sandbox · 3 XSS v-html
2. **Đợt B (P1 bảo mật):** Payments Cancelled/AccountNumber · Codelab leak testcase/hint/XP · StatelessQuiz lộ đáp án · premium gate (Course/Lesson frontend+backend) · directed graph
3. **Đợt C (P1 logic):** progress roadmap · bestScore · countingSort · gamification sync · user-progress isStateless · docs renderer
4. **Đợt D (P2/P3 + dọn dead code):** xóa ~15 module/component dead (features/graph, features/quiz legacy, CodelabPlayer, VcrControlPanel, CustomInputPanel, WasmComputeWorker...) → giảm ~3000 dòng, hết bundle phình
