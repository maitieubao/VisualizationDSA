# KẾT QUẢ REVIEW BACKEND (35 controllers) — tích lũy theo đợt

> Mỗi đợt = 5 tiến trình con review 1 controller. Mức: P0 (nghiêm trọng) / P1 (cao) / P2 (trung bình) / P3 (nhẹ).

---

## ĐỢT 1 (Auth/Users/Admin) — 2026-08-04

### AuthController.cs
| # | Mức | Dòng | Vấn đề | Đề xuất |
|---|-----|------|--------|---------|
| 1 | P1 | flow AuthService | User bị khóa (IsActive=false) vẫn đăng nhập được — thiếu check trong LoginAsync (không nhất quán với StatelessAuth) | Thêm check `!user.IsActive` |
| 2 | P1 | Register | User enumeration: message "Email này đã được sử dụng" khác biệt → attacker probe email | Message generic |
| 3 | P1 | /me | MapToUserDto không gán Role → Teacher/Admin trả về "Student", sai điều hướng frontend | Gán `Role = user.Role` |
| 4 | P2 | Logout | Không kiểm tra ownership refresh token (IDOR nhẹ) | Truyền userId, verify |
| 5-11 | P2 | — | Thiếu CancellationToken; rate limit chung; race register; thiếu MaxLength; 200 thay vì 201; formatting; magic strings | — |

### StatelessAuthController.cs — 🚨 NGHIÊM TRỌNG
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 195 | **Auth bypass hoàn toàn**: `ForceAddRefreshToken` cho phép gán bất kỳ chuỗi làm refresh token cho userId tùy chọn → attacker tự dựng token, takeover tài khoản không cần mật khẩu |
| 2 | **P0** | toàn class | **Không có [Authorize] + tin userId từ client** → IDOR đọc/sửa profile/đổi mật khẩu mọi user |
| 3 | **P0** | 447 | **AwardXP không auth + không giới hạn** → tự cày XP/level vô hạn |
| 4 | **P0** | 195 | Memory DoS: `_refreshTokens` phình vô hạn, không TTL |
| 5 | P1 | 376 | Hash SHA256 (salt tĩnh) vs BCrypt (luồng chuẩn) → không nhất quán, mật khẩu yếu, login luồng chuẩn fail sau đổi mật khẩu |
| 6-7 | P1 | 399, 482 | Hardcode/lộ demo credentials; so sánh mật khẩu thô |
| 8 | P1 | 71-92 | Register ghi DB trước khi validate; nuốt lỗi DB vẫn trả 200 |
| 9-10 | P1 | 122, 148 | Bỏ qua check ban khi DB lỗi; stale data DB vs memory (UpdateProfile không persist DB) |
| 11-18 | P2 | — | Validation lỏng; double-write XP; thiếu authorize endpoint; fallback nguy hiểm; level threshold trùng; token không expiry; dead code; nuốt exception |

### UsersController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 134-150 | **IDOR**: GET users/{id}/progress đọc progress/xp/premium của mọi user |
| 2 | P1 | 81-95 | Tự thưởng XP 10.000/lần, không rate limit → phá gamification |
| 3-9 | P2 | — | Validate moduleId; null body; race AwardXP+Badges; trùng projection; Include thừa; formatting |

### AdminController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 629 + JwtHelper:13 | **Hardcoded JWT secret trong source** → forge token Admin tùy ý |
| 2 | P1 | 542-618 | Impersonation mọi user kể cả Admin/self; không rate limit |
| 3 | P1 | 623 | JSON injection khi dựng payload JWT bằng string interpolation |
| 4 | P1 | 111-152 | Dashboard trả dữ liệu GIẢ (Random.Next) khi DB lỗi |
| 5 | P1 | 176 | page<=0 → Skip âm → 500 |
| 6 | P1 | 239-263 | Admin tự khóa/xóa chính mình |
| 7 | P1 | 523 | BanUser không sync stateless strategy |
| 8-20 | P2 | — | Status không nhất quán; không validate Role; impersonate user bị ban; base64 thay base64url; thiếu audit; pageSize không clamp; CountAsync tuần tự; token cũ giữ role cũ; dead code |

### AdminUsersController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 7, 17 | **Thiếu toàn bộ xác thực** — endpoint admin lộ toàn bộ user (email/role/XP) công khai |
| 2 | P1 | 18-20 | Không clamp page/pageSize → 500 / DoS |
| 3-4 | P2 | — | Route không versioned; search không trim/giới hạn |

### UploadController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | P1 | 38-42 | Chỉ check đuôi file, không magic bytes → polyglot file XSS (serve cùng origin) |
| 2 | P2 | 29 | [RequireJwtRole] không role → Student cũng upload |
| 3-6 | P2 | — | Check size sau khi nhận; exception không xử lý; dead code |

### JwtHelper.cs (ngữ cảnh chung)
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0/P1** | 13, 37-41 | Secret hardcode + so sánh signature bằng base64 chuẩn (không phải base64url) |
| 2 | P1 | 67-97 | ExtractRole/Sub decode KHÔNG verify chữ ký → role giả mạo nếu dùng ngoài RequireToken |
| 3 | P2 | 30-62 | catch{} nuốt lỗi, không log |

---

## ĐỢT 2 (Course/Lesson/Review/Content) — 2026-08-04

### CourseController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 234-258 | IDOR: AddModule/AddModuleItem không check ownership — teacher bất kỳ sửa khóa của người khác (handler cũng không check) |
| 2 | P1 | 39-209 | Lộ nội dung unpublished/premium (không filter IsPublished, không gate premium) |
| 3 | P1 | 177-181 | quizId matching heuristic theo OrderIndex không an toàn |
| 4 | P1 | 304-365 | Admin không tạo/sửa/xóa lesson được (handler chỉ check TeacherId) → 500 |
| 5 | P1 | 211-249 | Enum.Parse case-sensitive → FormatException 500 |
| 6 | P2 | 81-91 | Đếm progress lệch tử/mẫu; không lọc IsDeleted |
| 7 | P2 | 169-175 | N+1 query progress |
| 8 | P2 | 298 | Hard delete không nhất quán với soft-delete; trả entity thay DTO; exception → 500 |
| 9 | P3 | 465+ | Dead DTO; CreateLessonDto.QuizId không được truyền (bỏ qua dữ liệu) |

### LessonController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | P1 | 98-164 | CompleteLesson bỏ qua premium gate + publish check → farm XP qua khóa trả phí |
| 2 | P1 | 34-50 | Đọc bài Draft/Deprecated qua đoán GUID (IDOR) |
| 3 | P1 | 188 | Trả toàn bộ entity Lesson (lộ Progresses của MỌI user) |
| 4 | P2 | 59-66 | Quiz matching sai khi module đan xen (L1,L2,Q1 → Q1 cho L1) |
| 5 | P2 | 184 | UpdateQuizId phá invariant ModuleItem (exactly-one FK) |
| 6 | P2 | 112-133 | Race condition double XP khi CompleteLesson song song |
| 7 | P2 | 168-186 | Validation thiếu → 500 thay vì 400; comment không check lesson tồn tại |
| 8 | P3 | — | QuizId viết hoa; N+1; trùng MarkAsCompleted; 2 lần SaveChanges |

### LessonReviewController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 15 | Auth lệch hệ: [Authorize] JwtBearer vs [RequireJwtRole] key hardcode khác → quyền tách não |
| 2 | **P0** | 25-43 | **Tính năng chết**: KHÔNG nơi nào tạo LessonReview / gọi SubmitForReview → endpoint luôn "Review not found" |
| 3 | P1 | 28-31 | FindFirstValue phụ thuộc claim mapping; token stateless luôn 401 |
| 4 | P2 | 38-45 | Race double-process; bool IsApproved [Required] vô nghĩa (mặc định reject!); thiếu feedback khi reject; exception thô; không notification |

### LecturesController.cs — P2 nhẹ (cache không middleware, DTO thiếu, NRE tiềm ẩn)

### TheoryArticleController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | P1 | 49-61 | IDOR: đọc bài draft qua GUID + trả Versions nội dung |
| 2 | P1 | 27-47 | onlyPublished=false do client kiểm soát → liệt kê bài nháp |
| 3 | P1 | 88,123 | Mâu thuẫn quyền: attribute cho phép Admin nhưng handler chặn Admin không phải tác giả |
| 4 | P2 | — | CreateArticle không try/catch → 500; thiếu validation; page không clamp; viewCount spam; secret hardcode |

### ConceptsController.cs — P2: thiếu CancellationToken/rate-limit/cache; rò rỉ Embedding payload; dead code (frontend không gọi)
## ĐỢT 3 (Quiz/Codelab/Algorithms) — 2026-08-04

### StatelessQuizController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | P1 | 168-247 | Quiz bank: UI báo "+75 XP" nhưng KHÔNG ghi attempt/cộng XP thật (chỉ quiz DB chạy XP) |
| 2 | P1 | 118-135 | NRE khi body thiếu answers → 500 |
| 3 | P1 | 217-242 | XP improvement logic bất nhất (runningMax thay vì baseline pass đầu) |
| 4 | P1 | 62-110 | **Lộ đáp án**: GET quiz không auth trả CorrectIndex/Explanation cho mọi quiz |
| 5 | P1 | 323-447 | Manage ghi 2 nguồn (bank + DB) mất đồng bộ → dữ liệu rác |
| 6 | P2 | — | Race XP; validation lệch DB; thứ tự câu hỏi không đảm bảo; Description bị gán bằng Topic; XPReward không validate; case-sensitive id; duplicate threshold; dead code |

### QuizController.cs (stub) + QuizzesController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 17 vs 15 | **Xung đột route**: 2 controller cùng `api/v1/quizzes` → AmbiguousMatchException 500 toàn bộ quiz API |
| 2 | P1 | QuizController | Stub trả "implement query" 200 giả; page không clamp; IDOR teacher sửa quiz người khác |
| 3 | P1 | QuizzesController | Quiz not found → 500 thay vì 404; NRE body null; **lộ CorrectIndex trong QuestionResults sau mỗi submit** (thu hoạch đáp án); GetCurrentUserId Guid.Parse NRE |

### CodelabController.cs + CodelabsController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | P1 | GET {id} | **Rò rỉ hidden test case** (Input/ExpectedOutput) cho student |
| 2 | **P0/P1** | Codelabs GET | **Bypass trừ XP hint**: GET trả Content của MỌI hint kể cả XpCost>0 |
| 3 | P1 | Submit | **Farm XP vô hạn**: submit pass lặp lại vẫn award XP |
| 4 | P1 | reveal-hint | Trừ XP không idempotent + race (lost update), không record đã mở |
| 5 | P1 | Codelab CRUD | IDOR teacher sửa codelab người khác (không OwnerId); soft-delete bị bỏ qua mọi nơi; PUT bỏ qua route id |
| 6 | P2 | — | Trùng 2 controller/2 query; thiếu rate limit run/submit (Piston ngoài); code không giới hạn độ dài; language case; NRE; submission kẹt Pending |

### AlgorithmsController.cs — không P0 (không chạy code user; chỉ nạp int[] vào strategy tin cậy)
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | P1 | 158-172 | DoS payload lớn: RawInput parse trước timeout, không giới hạn độ dài |
| 2 | P1 | 204-219 | Timeout cooperative — strategy không check token có thể treo vô hạn |
| 3 | P2 | — | Budget 2s dùng chung Compare; sai thứ tự lỗi; 2 nguồn constraint drift; catch thiếu; Compare nuốt lỗi |
## ĐỢT 4 (Classroom/OOP/SOLID) — 2026-08-04

### ClassroomController.cs — không P0 (owner check đúng ở handler)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Invite code hết hạn vẫn join được |
| 2 | P1 | Name whitespace → 500 thay vì 400 |
| 3 | P1 | Kick xóa cứng enrollment (mất history) + bị kick vẫn join lại được |
| 4 | P1 | Lộ invite code cho học sinh (GetClassroomDetails trả Code) |
| 5 | P2 | IDOR chéo override item; Admin rơi vào nhánh student; teacher tự enroll; không enforce MaxCapacity; race join trùng; NRE OwnerTeacher.Username |

### ClassroomCurriculumController.cs
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | DeleteModule là STUB — không gửi command, trả NoContent giả |
| 2 | P1 | Route trùng segment "classrooms/classrooms/..." → 404 |
| 3 | P1 | Mapping sai: IsHidden truyền vào isHiddenForStudent → cờ ẩn không bao giờ lưu |
| 4 | P2 | Null body → 500; 401 thay vì 403; thiếu update/delete item; content khóa cứng khi prerequisite ẩn |

### ClassroomGradingController + Service
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Identity từ ExtractSubFromToken không verify chữ ký (rủi ro nếu mất [Authorize]) |
| 2 | P1 | Service: không lọc CourseId khi thống kê; thang điểm quiz vs codelab lệch; CompletionRate >100%; NRE Student null |
| 3 | P2 | Auth không nhất quán (JwtBearer vs RequireJwtRole); pass rate chia sai denominator |

### ClassroomProgressController + UnlockRuleEngine — KHÔNG P0 (complete có gate)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Update progress KHÔNG check unlock (Start/Complete có) |
| 2 | P1 | IsModuleLockedAsync thiếu Include(Items) → mọi module "unlocked" (gate cấp module vô hiệu) |
| 3 | P1 | IsItemUnlockedAsync không check IsHiddenForStudent + required cùng module |
| 4 | P1 | NRE item.Module null; N+1 (3-5 query/item); sync blocking trong vòng lặp |
| 5 | P2 | NewlyUnlocked tính sai (giống hệt previouslyUnlocked); race insert; LockedItems sai; MaxAttempts không enforce |

### OOPController + SOLIDController — không P0 (scenario whitelist, không chạy code user)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P2 | Cache thundering herd; thiếu catch OperationCanceled; public endpoint; inject concrete thay interface; SOLID thiếu try/catch + error shape khác OOP; DRY trùng toàn bộ pattern |
## ĐỢT 5 (Concept controllers + Analytics/Diagnostics) — 2026-08-04

### DesignPatternsController / DIContainerController / SystemDesignController — không P0 (scenario whitelist, không chạy code client)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | SystemDesign: ReplicationLagMs là dead param — client gửi 5000 nhưng engine hardcode 1000 |
| 2 | P2 | Thiếu auth toàn bộ nhóm concept (có thể chủ ý — cần ADR); error contract lệch OOPController; cache race; SetSize vô hiệu; RequestAborted tham số chết; duplicate 50 dòng execute/frames; cache key không version |

### AnalyticsController.cs
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | GetOverview/GetPopularModules thiếu [Authorize] — lộ thống kê toàn hệ thống ẩn danh |
| 2 | P1 | GetQuizAnalytics ToListAsync toàn bảng QuizAttempt rồi tính client |
| 3 | P2 | Cache null không kiểm tra; Unauthorized thay vì BadRequest; thiếu CancellationToken; clamp 2 lớp; [FromServices] IMediator style lệch |

### DiagnosticsController.cs
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | simulate-error public — flood log, probe lỗi; không giới hạn Development |
| 2 | P1 | Exception message bị nuốt ở Production (mô phỏng không khớp) |
| 3 | P2 | Health() trả success=true dù DB chết (false positive) + lộ tên môi trường |
## ĐỢT 6 (Gamification/Leaderboard/Notification/Payment/Badges) — 2026-08-04

### GamificationController.cs — không P0 (level thresholds trùng 2 nguồn; object[] thiếu type; trùng StatelessGamification config)

### LeaderboardController.cs — không IDOR (userId từ token)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P2 | GET /top thiếu [Authorize] (cần xác nhận chủ ý); Rank=-1 trả 200 OK thay vì 404; 2 hệ auth |
| 2 | P2 | LeaderboardService: rank cùng XP xếp ngẫu nhiên; 2 query tuần tự; thiếu index TotalXP |

### NotificationsController.cs — không P0, không IDOR (lọc UserId)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P2 | Route `/concepts/Notifications` sai — FE gọi /api/v1/notifications 404; N+1 MarkAllAsRead; không phân trang; SaveChanges vô nghĩa khi rỗng |

### PaymentsController.cs — 🚨
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | P1 | 85-125 | Verify chữ ký fail-open (OR): request không gửi signature vẫn qua Apikey — chỉ cần vượt 1 trong 2 |
| 2 | P1 | 88-97 | Nhánh HMAC dead: SePay không gửi X-SePay-Signature; băm sai field (code vs referenceCode) |
| 3 | P1 | 135-160 | **Order CANCELLED vẫn được cấp Premium** (chỉ early-return khi Completed) |
| 4 | P1 | 142-146 | Không đối chiếu AccountNumber — ai biết mã payment code kích hoạt premium |
| 5 | P1 | 78,143 | NRE body null; leak ex.Message qua webhook anonymous |
| 6 | P2 | — | Race webhook; Random() sinh mã 6 ký tự đoán được |

### StatelessPaymentController.cs — 🚨🚨
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 115-131 | simulate-webhook không auth — tự cấp Premium |
| 2 | **P0** | 44-87 | Checkout/Verify theo UserId client tự khai, không auth — cấp premium cho người khác |
| 3 | P1 | 160-165 | transactions không auth trả log mọi user; thiếu [Authorize] toàn controller; fail-open feature check |

### BadgesController.cs
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | GetCurrentUserId dùng sai claim NameIdentifier (token dùng "sub") → 500 hàng loạt |
| 2 | P2 | N+1 query badge; trả entity thay DTO |
## ĐỢT 7 (StatelessGamification + Frontend: algo-playground, algorithm-sandbox, animation-engine, auth, code-editor) — 2026-08-04

### StatelessGamificationController.cs
| # | Mức | Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | 21-94 | Thiếu auth hoàn toàn: award-xp anonymous ghi DB user demo; ai cũng tự cày XP vô hạn |
| 2 | P1 | 64-94 | Cô lập người dùng = 0 (mọi session chung _demoProfile Singleton); race mutate XP không lock |
| 3 | P2 | 110-156 | Leaderboard đọc DB nhưng profile từ in-memory — 2 nguồn lệch; level table nhân bản lần 3 |

---

# KẾT QUẢ REVIEW FRONTEND (27 modules) — tích lũy theo đợt

## ĐỢT 7 (5 modules)

### algo-playground — 🚨
| # | Mức | File:Dòng | Vấn đề |
|---|-----|------|--------|
| 1 | **P0** | AlgoPlaygroundWorkspace.vue:194 | **XSS**: v-html parseEmojiToSvg không escape — code user log('<img onerror=...>') chạy trên main thread |
| 2 | P1 | compileWorker.ts:50-58 | Race worker: onmessage ghi đè + terminate worker shared khi timeout → timeout giả, kill request khác |
| 3 | P1 | useAlgoAnimation.ts:39-56 | Race autoplay sau compile: watcher isPlaying bị watcher frames pause → tự phát không chạy |
| 4 | P2 | store:55-66 | traceLogs O(n²); setInput không invalidate; pendingPlay không xóa khi pause; persist mỗi ký tự; RAF 60fps khi idle; parse Input chấp nhận Infinity; radix digit âm; sandbox worker lỏng (self.postMessage/fetch) |

### algorithm-sandbox — không P0 (53/53 test pass, thuật toán đúng)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | CustomInputParser chấp nhận Infinity/1e999 → radix exp*=10 vô hạn; nửa composable dead code; CustomInputPanel.vue TOÀN BỘ dead code (không mount đâu) |
| 2 | P2 | Phantom swap quickSort khi pivot đã đúng chỗ; màu heap violation sai thứ tự; recompile 3 lần khi mount; truncate mảng im lặng |

### animation-engine — không P0
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | store stop() không resolve playUntil → lecture kẹt isWaitingForAnimation vĩnh viễn |
| 2 | P1 | InteractivePlayground deep-watch nodes/edges → kéo đỉnh = reset + resimulate toàn bộ |
| 3 | P2 | playUntilFrame không guard isPlaying (2 timer song song); v-html emojiParser không escape (backend tin cậy); hotkey Space double-handler; algorithmApi không timeout; BubbleSortRenderer dead code; rAF/getComputedStyle mỗi frame |

### auth (useAuthStore + services + LoginModal)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Timer refresh gọi classic endpoint khi đang stateless mode → clearSession xóa session đang sống |
| 2 | P1 | Race refresh: timer bỏ qua dedupe refreshPromise → 2 request song song, 1 bị vô hiệu |
| 3 | P1 | logOut/clearSession không xóa vdsa_stateless_user_id → định tuyến refresh nhầm chế độ |
| 4 | P2 | refresh token localStorage (XSS = mất phiên); statelessLogout không clear impersonate keys; vdsa_access_expires ghi không đọc; getMe dead code |

### code-editor (CodeEditor.vue) — không P0, không leak (cleanup đúng thứ tự)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P2 | Theme đổi không áp dụng (không watcher setTheme); onDidChangeModelContent reset VCR mỗi ký tự không debounce; loadPreset không guard editorInstance |
## ĐỢT 8 (Frontend: codelabs, code-to-visualization, courses, custom-input, docs) — 2026-08-04

### codelabs (CodelabPlayer.vue) — module DEAD (không mount đâu; LessonStepCodeLab dùng API khác)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | **P0** | revealHint gọi route sai (POST /hints/{idx}/reveal vs backend /reveal-hint) → luôn 404 |
| 2 | P1 | xpReward sai case → undefined ("+undefined XP"); v-html description không sanitize (stored XSS); toggleHint bypass XP cost; catch nuốt lỗi vẫn reveal; submit/run không timeout/abort |
| 3 | P2 | Leaderboard mock hardcode; "Ctrl+Enter" tuyên bố nhưng không có handler; result ref<any>; không watch props.codelabId; submissionHistory vô hạn |

### code-to-visualization — không XSS (an toàn), không leak nghiêm trọng
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | WorkerLifecycleCoordinator race: state global chung mọi session; terminate không reject promise → treo vĩnh viễn; onmessage trễ giết worker khác |
| 2 | P1 | ASTInstrumentation: chọn nhầm hàm entry (hàm helper đầu tiên / arrow function không chạy mà vẫn báo success); variables/activeLine không bao giờ được set |
| 3 | P2 | __loopCounter global không reset; timeout 1500ms gắt; traceAssign thiếu index thứ 2; MAX_FRAMES cắt âm thầm; WasmComputeWorker TOÀN BỘ dead code; MonacoEditorPanel race unmount |

### courses — 🚨 progress + XSS
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Progress đếm sai: so XP bài với XP trung bình (xpReward/totalLessons), totalLessons=0 → Infinity; API list không trả lessons → progress LUÔN 0 |
| 2 | P1 | Premium gate bypass khi CHƯA ĐĂNG NHẬP (chỉ check role==='Student') |
| 3 | P1 | Router-link lồng nhau (a trong a); non-reactive (đọc localStorage trong computed); mock loadCourses bất nhất; LessonStepTheory v-html không escape inline (stored XSS) |
| 4 | P2 | Không watch route.params.id → hiển thị khóa cũ; idx+1 thay vì orderIndex; CourseBuilder + LessonListItem dead code |

### custom-input — không XSS ({{ }} an toàn)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | catch nuốt MỌI lỗi → fallback bubble-sort giả (user xem animation sai không biết); parseInt không chặn > int32 (BE OverflowException) |
| 2 | P1 | submitCustomInput hardcode 'bubble-sort'; CustomInputParser: Number('')=0 → "1,,2" thành [1,0,2]; chấp nhận 0x10/1e3/Infinity/12.5 (lệch FE/BE) |
| 3 | P2 | Không timeout fetch → isLoading kẹt; Accept-Encoding forbidden; parseAdjacencyList không giới hạn; CustomInputPanel rebuild đồ thị mỗi keystroke; deep-watch x/y khi kéo |

### docs (DocsMarkdownRenderer + DocsView) — 🚨
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Copy button vỡ với code chứa `'` (C# char literal) — 45+ chỗ |
| 2 | P1 | Heading render raw (**/backtick lộ thiên) + TOC sai |
| 3 | P1 | Link nội bộ /docs/* vỡ với hash router → click = reload về trang chủ (79 link) |
| 4 | P2 | v-html không sanitize (displayTitle/error/heading raw); race async render (render cũ ghi đè mới); marked.use tích lũy mỗi lần render; 5 bài trees/* MỒ CÔI (không có trong nav); vòng lặp 404 /docs/intro; trùng heading id |
## ĐỢT 9 (Frontend: dsa-modules, e-lecture, embed-widget, export-share, gamification-engine) — 2026-08-04

### dsa-modules — không XSS, không leak
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Keyboard trùng handler qua KeepAlive: Space/←/→ điều khiển ĐỒNG THỜI cả VCR sorting lẫn animStore DSA |
| 2 | P1 | generateCountingSort chỉ sắp theo hàng đơn vị (%10) → kết quả SAI |
| 3 | P2 | generateRadixSort số âm → NaN; parser lệch format graph; GraphRenderer mutate frame prop khi kéo + pan/zoom sai đơn vị DPR + tooltip world coords; BarChart Math.max(...spread) RangeError; Timer chạy nền khi rời tab |

### e-lecture
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Race stale-continuation khi skip PLAY_UNTIL liền nhau → isWaitingForAnimation ghi đè sai |
| 2 | P1 | Không guard in-flight: double-click Next → nhảy 2 slide; exitLecture unlock vô điều kiện (mở khóa quiz checkpoint) |
| 3 | P1 | State-leak khi rời route: không exitLecture ở onUnmounted → interactionLocked khóa VCR vĩnh viễn |
| 4 | P2 | v-html không sanitize (nội dung trusted hiện tại); lectureLoader fetch thô hardcode base path; endpoint backend dead do bundled ưu tiên |

### embed-widget — không XSS (interpolation an toàn)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Bridge mặc định allowedOrigins=['*'] + fail-open khi whitelist rỗng → nhận mọi origin |
| 2 | P1 | Host script (EmbedCodeSnippet) KHÔNG verify event.origin + không validate height → CSS injection (UI redressing) |
| 3 | P2 | sendMessage targetOrigin='*'; engine toàn bộ dead code (chỉ test dùng); sandbox iframe allow-same-origin + allow-scripts vô hiệu; protocol STEP_* không wire |

### export-share — 🚨 (GIF CHƯA triển khai — chỉ PNG/SVG)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | **P0** | setInterval fake-progress chỉ clear ở nhánh thành công → export thất bại = interval rò rỉ vĩnh viễn |
| 2 | P1 | Share link 20.000 ký tự vượt giới hạn URL thực (~8KB); inject TOÀN BỘ CSSOM vào SVG (file MB + giật UI); QR không render khi mở lại modal (watch không immediate); QR crash với link dài >2953 bytes |

### gamification-engine — 🚨
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Confetti không bao giờ bắn: unlockedBadges gán TRƯỚC khi đọc prevBadgeCount |
| 2 | P1 | Sync server set activeStreak nhưng không set lastActiveDate → streak reset về 1 |
| 3 | P1 | earnXPWithSync optimistic không rollback khi fail → mất XP; 2 request song song ghi đè |
| 4 | P1 | StreakFreeze chỉ giảm biến đếm, calculator không đọc freezes → "nút giả" |
| 5 | P1 | Bug timezone: yesterdayStr tính UTC trong múi âm → reset streak sai |
| 6 | P1 | requiredAlgorithmId BỊ BỎ QUA trong checkNewUnlockedBadges → badge mở khóa không cần hoàn thành thuật toán |
| 7 | P1 | CanvasConfettiEngine cũ không destroy khi bật lại → RAF leak vẽ lên canvas đã gỡ |
| 8 | P2 | v-html parseEmojiToSvg badge.icon không escape; mock leaderboard tên thật; 2 pipeline XP song song (1 không auth); dead code loạt |
## ĐỢT 10 (Frontend: guided-tour, html-playground, interactive-playground, lesson) — 2026-08-04

### guided-tour — KHÔNG P0 (không crash), nhưng ~80% selector DEAD
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Sai tọa độ scroll: spotlight dùng absolute trong fixed nhưng cộng window.scrollY → LỆCH mọi tour khi trang cuộn |
| 2 | P1 | switchToTab1/2 query data-tour-id="algo-tab-switch" KHÔNG tồn tại → tour sorting/graph không chuyển tab |
| 3 | P1 | 90/100 selector trỏ element không tồn tại; 8/12 page-tour trỏ route 404 → dead code |
| 4 | P2 | Race double-click nhảy 2 step; initTour chạy default tour trên MỌI route; không cleanup khi đổi route; v-html không sanitize (latent) |

### html-playground — 🚨🚨
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | **P0** | Sandbox vô hiệu: iframe allow-same-origin + allow-scripts cùng origin → code user đọc localStorage/cookie/parent.document; kết hợp link chia sẻ (code nén trong URL) → attacker 1 link đánh cắp session |
| 2 | P1 | Debounce vô hiệu: srcDoc computed đổi từng ký tự → N reload/giây + 1 reload thừa sau 800ms |
| 3 | P2 | Monaco model không dispose (leak qua các lần chuyển mode); timer copied không cleanup |

### interactive-playground
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | **XSS**: v-html parseEmojiToSvg(explanation) — label từ Import JSON (dữ liệu người dùng) lọt vào explanation |
| 2 | P1 | **Directed graph duyệt SAI như undirected**: edge.from !== currId && edge.to !== currId cho phép đi ngược mũi tên — BFS/DFS/Dijkstra sai semantics |
| 3 | P2 | Deep watch nodes/edges mỗi tick physics (12.5fps) + mỗi mousemove → resimulate + reset index; Import không validate (bypass MAX_NODES, NaN); clamp drag sai khi zoom; wheel passive; click chọn source reset playback |
| 4 | P2 | PlaygroundCanvas: clamp drag sai zoom; wheel passive — e.preventDefault bị bỏ qua |

### lesson (lesson flow mới) — 🚨
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | loadLesson không guard race: chuyển bài nhanh A→B, response A trả sau ghi đè bài B |
| 2 | P1 | Bài KHÔNG có CodeLab: chỉ cấp XP quiz nhưng modal hiển thị +xpReward đầy đủ; isLessonComplete luôn false |
| 3 | P1 | **bestScore bị ghi đè bằng điểm thấp hơn** (lessonApi:99) — làm lại 3/5 sau khi đạt 5/5 → server giảm bestScore |
| 4 | P1 | **XSS**: LessonStepTheory v-html contentMd không sanitize inline/table cell |
| 5 | P1 | codelabExecutor fallback chạy new Function trên MAIN THREAD không kill-switch → loop vô hạn đứng băng trang |
| 6 | P2 | XP at-least-once (awardXp success + network fail → sync lại → cộng 2 lần); retry timer vô hạn; listener online/offline không gỡ; XP client-tự-tin; quiz threshold 2 nguồn; step 2 không guard |

### graph — ⚠️ KẾT QUẢ TRỐNG (agent lỗi), sẽ chạy lại riêng
## ĐỢT 11 (Frontend: payment, pseudocode-sync, quiz, quiz-system, realtime) — 2026-08-04

### payment — 🚨🚨 (không XSS, không v-html)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | **P0** | **Lộ webhook secret trong bundle client** ('Apikey vdsa_secret_key...') + backend chấp nhận nhánh API key → bất kỳ ai đọc JS là kích hoạt Premium miễn phí |
| 2 | **P0** | simulatePaymentSuccess gọi thẳng webhook endpoint — gọi được từ console ở production |
| 3 | P1 | Stateless mode DEAD-END: startPolling chỉ chạy nhánh real → user kẹt 'paying' vĩnh viễn; status 3 nơi khác nhau ('Completed'/'paid'); premium activate thuần client (devtools set isPremium=true qua gate); zombie interval 5 phút sau logout |

### pseudocode-sync — không P0, không XSS khai thác được (escape trước)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | syntaxHighlighter regex lỗi thứ tự: comment #.* nuốt span đã chèn (color:#60a5fa) → HTML lồng nhau hỏng, mọi dòng highlight vỡ |
| 2 | P1 | Regex dấu câu thay :; BÊN TRONG attribute span vừa chèn → attribute vỡ |
| 3 | P1 | VisualizationPlayer watch algorithmId không reset store khi script không tồn tại → stale code panel |
| 4 | P2 | Badge occurrence off-by-one; O(L×F) mỗi frame; singleton store (2 player ghi đè); smooth scroll giật |

### quiz (legacy, phần lớn dead code) + quiz-system
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | syncSessionToServer DEAD — điểm checkpoint quiz không bao giờ lên server; 3 nguồn ngưỡng passed (0.6/0.8/server) |
| 2 | P1 | allCheckpointsCompleted = "đã kích hoạt" chứ không phải "đã trả lời" → modal Tổng kết chồng modal câu hỏi cuối |
| 3 | P1 | QuizStatsManager crash khi localStorage hỏng (getStats không validate, TypeError ngoài try/catch) |
| 4 | P1 | backendQuizError chỉ render khi displayedQuizzes.length===0 (luôn có 6 fallback) → lỗi submit VÔ HÌNH |
| 5 | P2 | Seek/jump bỏ lỡ checkpoint; QuizSchemaValidator không check correctOptionIndex < options.length; 2 lớp API quiz song song; features/quiz toàn module dead (trừ ExcelQuizImporter) |

### realtime — TOÀN BỘ FEATURE DEAD CODE (không nơi nào import)
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Race duplicate connection: guard không chặn state 'connecting' → 2 HubConnection song song, sự kiện đến 2 lần, connection cũ không stop (leak) |
| 2 | P1 | badgeNotifications/levelUpNotifications unshift vô hạn |
| 3 | P2 | Token chốt cứng lúc connect → reconnect sau JWT hết hạn chết vĩnh viễn; onreconnected không sync lại dữ liệu; nhận chuỗi từ server không validate (XSS latent); LeaderboardHub backend không [Authorize] → flood |
## ĐỢT 12 (Frontend: graph, user-progress, vcr-player) — 2026-08-04 — HOÀN TẤT 27/27 MODULES

### graph — features/graph CHỈ có 1 file store collab, TOÀN BỘ DEAD CODE; graph thật nằm ở dsa-modules/interactive-playground
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | XSS: v-html parseEmojiToSvg(explanation) — label nhập qua Import JSON (chứa HTML) lọt vào explanation |
| 2 | P1 | Collab store: applyRemoteUpdate không đánh dấu origin → vòng lặp echo ping-pong vô hạn |
| 3 | P1 | BFS/DFS/Dijkstra BỎ QUA tính directed (edge.from!==currId && edge.to!==currId) → sai thuật toán |
| 4 | P1 | RAF physics chạy vĩnh viễn (isStable không bao giờ gọi); Bellman-Ford aliasing dist (frame đầu hiển thị giá trị cuối); arrowhead vẽ trên undirected; drag mutate props frame; ForceDirectedEngine: dist=0 → 2 node dính nhau không tách |
| 5 | P2 | Import JSON không validate (id trùng, edge ảo, NaN, bypass MAX_NODES); clamp drag sai không gian khi zoom; tooltip không theo zoom; 2 physics engine trùng nhau |

### user-progress — không XSS
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | isStateless = env || TRUE → luôn stateless: nhánh JWT dead; user thật gọi endpoint stateless với userId undefined; markModuleComplete không bao giờ persist |
| 2 | P1 | markModuleComplete throw Error thường → store check instanceof ApiError không bao giờ đúng → rollback không hoạt động |
| 3 | P1 | Công thức level local khác backend (sqrt vs bảng ngưỡng) → level nhấp nháy; xpToNextLevel không recompute sau optimistic |
| 4 | P1 | SkillRadarChart hiển thị SỐ ẢO (base=30+level*5, hash userName) |
| 5 | P2 | Listener online không gỡ (leak test/HMR); double-flush queue → double-award XP; queue kẹt sau khi clear; completeModule không retry |

### vcr-player — không P0, không XSS trong module
| # | Mức | Vấn đề |
|---|-----|--------|
| 1 | P1 | Timer setInterval sống nền vô hạn khi rời route không pause (store singleton, consumer khác không cleanup) |
| 2 | P1 | Race play khi frames rỗng/lỗi: customCompileFn lỗi → frames GIỮ dữ liệu cũ → phát dữ liệu cũ không báo lỗi |
| 3 | P2 | alert() chặn luồng chính khi lỗi compile; Play ở frame cuối chết im lặng; speed 0/âm → hot loop; VcrControlPanel + VcrArrayInput dead code 100% (trùng VcrDockBar) + double keydown latent; SPEED_OPTIONS 2 nguồn lệch; counter "1/0" |