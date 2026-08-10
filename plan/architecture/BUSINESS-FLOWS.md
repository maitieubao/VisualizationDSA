# 🔄 CHI TIẾT LUỒNG LOGIC NGHIỆP VỤ — VisualizationDSA

> Tài liệu mô tả chi tiết từng luồng nghiệp vụ: logic step-by-step, điều kiện nhánh, xử lý lỗi, chuyển đổi trạng thái, và tương tác Frontend-Backend.

---

## 📑 MỤC LỤC

1. [Đăng ký & Đăng nhập](#1-đăng-ký--đăng-nhập)
2. [Học viên học bài mới](#2-học-viên-học-bài-mới)
3. [Hệ thống Quiz & Chấm điểm](#3-hệ-thống-quiz--chấm-điểm)
4. [Codelab — Chấm code trực tuyến](#4-codelab--chấm-code-trực-tuyến)
5. [Gamification — XP, Level, Streak, Badge](#5-gamification--xp-level-streak-badge)
6. [Giảng viên quản lý Khóa học](#6-giảng-viên-quản-lý-khóa-học)
7. [Giảng viên quản lý Lớp học](#7-giảng-viên-quản-lý-lớp-học)
8. [Quản trị hệ thống (Admin)](#8-quản-trị-hệ-thống-admin)
9. [Thanh toán Premium](#9-thanh-toán-premium)
10. [Knowledge Graph — Đồ thị Kiến thức](#10-knowledge-graph--đồ-thị-kiến-thức)

---

## 1. ĐĂNG KÝ & ĐĂNG NHẬP

### 1.1. State Machine: Authentication Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION STATE MACHINE                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────┐    submit     ┌──────────────┐    success   ┌──────┐ │
│   │ Anonymous│ ───────────→  │ Authenticating│ ──────────→ │ Auth │ │
│   └──────────┘               └──────────────┘              └──────┘ │
│        │                          │                           │      │
│        │ register                 │ fail                      │logout│
│        ▼                          ▼                           ▼      │
│   ┌──────────┐              ┌──────────────┐              ┌──────┐  │
│   │Checking  │              │   AuthError  │              │Anony │  │
│   │Email     │              │   (retry)    │              │mous  │  │
│   └──────────┘              └──────────────┘              └──────┘  │
│        │                                                          │
│        │ success                                                   │
│        ▼                                                          │
│   ┌──────────┐                                                    │
│   │ Create   │                                                    │
│   │ Account  │                                                    │
│   └──────────┘                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2. Sequence: Đăng ký tài khoản
```
Browser                    Frontend (Vue)              Backend (.NET)           PostgreSQL
   │                           │                           │                       │
   │  Nhập email/pass/username │                           │                       │
   │ ─────────────────────────→│                           │                       │
   │                           │  POST /auth/register      │                       │
   │                           │  { email, username,       │                       │
   │                           │    password }             │                       │
   │                           │ ─────────────────────────→│                       │
   │                           │                           │  Validate:            │
   │                           │                           │  - email format       │
   │                           │                           │  - password >= 8      │
   │                           │                           │  - username unique    │
   │                           │                           │                       │
   │                           │                           │  SELECT WHERE email=? │
   │                           │                           │ ─────────────────────→│
   │                           │                           │ ←─────────────────────│
   │                           │                           │  (exists? → 409)      │
   │                           │                           │                       │
   │                           │                           │  Hash password        │
   │                           │                           │  (bcrypt)             │
   │                           │                           │                       │
   │                           │                           │  INSERT Users         │
   │                           │                           │ ─────────────────────→│
   │                           │                           │ ←─────────────────────│
   │                           │                           │                       │
   │                           │                           │  Generate JWT         │
   │                           │                           │  + RefreshToken       │
   │                           │                           │                       │
   │                           │  201 { token, user }      │  INSERT RefreshTokens │
   │                           │ ←─────────────────────────│ ─────────────────────→│
   │                           │                           │                       │
   │                           │  Lưu token vào            │                       │
   │                           │  authStore.token          │                       │
   │                           │  + localStorage           │                       │
   │                           │                           │                       │
   │  Redirect /dashboard      │                           │                       │
   │ ←─────────────────────────│                           │                       │
   │                           │                           │                       │
```

### 1.3. Logic chi tiết: Đăng ký

**Bước 1: Frontend Validation**
```
INPUT: { email, username, password, confirmPassword }
│
├─ email regex: ^[^@]+@[^@]+\.[^@]+$
│  └─ FAIL → toast "Email không hợp lệ"
│
├─ username length >= 3
│  └─ FAIL → toast "Username tối thiểu 3 ký tự"
│
├─ password length >= 8
│  └─ FAIL → toast "Mật khẩu tối thiểu 8 ký tự"
│
├─ password === confirmPassword
│  └─ FAIL → toast "Mật khẩu xác nhận không khớp"
│
└─ PASS → enable submit button
```

**Bước 2: Backend Validation (RegisterCommand)**
```
INPUT: RegisterCommand { Email, Username, Password }
│
├─ Check email exists: SELECT Users WHERE Email = @Email
│  ├─ EXISTS → throw DuplicateEmailException (HTTP 409)
│  └─ NOT FOUND → continue
│
├─ Check username exists: SELECT Users WHERE Username = @Username
│  ├─ EXISTS → throw DuplicateUsernameException (HTTP 409)
│  └─ NOT FOUND → continue
│
├─ Password policy:
│  ├─ MinLength(8)
│  ├─ RequireDigit
│  ├─ RequireUppercase
│  └─ FAIL → throw ValidationException (HTTP 400)
│
├─ Hash password: BCrypt.HashPassword(password, workFactor=12)
│
├─ Create User entity:
│  ├─ Id = Guid.NewGuid()
│  ├─ Email, Username, PasswordHash
│  ├─ Role = "Student" (default)
│  ├─ TotalXP = 0
│  ├─ CurrentLevel = 1
│  ├─ CreatedAt = DateTime.UtcNow
│  └─ IsActive = true
│
├─ Generate tokens:
│  ├─ AccessToken: JWT (expiry 15 min)
│  │  ├─ Claims: sub=userId, email, role, level
│  │  └─ Signing: HMAC-SHA256(JwtSigningKey)
│  │
│  └─ RefreshToken: Random 64 bytes (expiry 30 days)
│     ├─ INSERT RefreshTokens { UserId, Token, ExpiresAt }
│     └─ Return to client
│
├─ INSERT AuditLogs { Action="UserRegistered", UserId, EntityType="User" }
│
└─ RETURN { Token, RefreshToken, UserDto }
```

**Bước 3: Frontend xử lý response**
```
RESPONSE: 201 { token, refreshToken, user }
│
├─ authStore.setToken(token)
│  ├─ localStorage.setItem('vdsa_token', token)
│  └─ axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
│
├─ authStore.setUser(user)
│  ├─ currentUser = user
│  ├─ isAuthenticated = true
│  └─ isPremium = user.isPremium
│
├─ Setup token refresh timer:
│  └─ setTimeout(refreshToken, 13 * 60 * 1000)  // 13 min (before 15 min expiry)
│
└─ Router.push('/dashboard')
```

### 1.4. Sequence: Đăng nhập
```
Browser              Frontend                 Backend                PostgreSQL
   │                     │                       │                      │
   │ Nhập email+pass     │                       │                      │
   │ ───────────────────→│                       │                      │
   │                     │ POST /auth/login      │                      │
   │                     │ {email, password}     │                      │
   │                     │ ─────────────────────→│                      │
   │                     │                       │ SELECT Users         │
   │                     │                       │ WHERE email=?        │
   │                     │                       │ ────────────────────→│
   │                     │                       │ ←────────────────────│
   │                     │                       │                      │
   │                     │                       │ BCrypt.Verify(pass,  │
   │                     │                       │   hash)              │
   │                     │                       │                      │
   │                     │                       │ FAIL → 401           │
   │                     │                       │ "Sai mật khẩu"       │
   │                     │                       │                      │
   │                     │                       │ UPDATE Users         │
   │                     │                       │ LastLoginAt=now      │
   │                     │                       │ ────────────────────→│
   │                     │                       │                      │
   │                     │                       │ Generate JWT+RT      │
   │                     │                       │ INSERT RefreshTokens │
   │                     │                       │ ────────────────────→│
   │                     │                       │                      │
   │                     │ 200 {token, user}     │                      │
   │                     │ ←─────────────────────│                      │
   │                     │                       │                      │
   │                     │ authStore.login()     │                      │
   │                     │ + redirect            │                      │
   │                     │                       │                      │
   │ Vào dashboard       │                       │                      │
   │ ←───────────────────│                       │                      │
```

### 1.5. Logic chi tiết: Refresh Token
```
EVENT: AccessToken sắp hết hạn (mỗi 13 phút)
│
├─ Frontend: axios interceptor (401 response)
│  └─ Gọi POST /auth/refresh { refreshToken }
│     │
│     ├─ Backend: Validate RefreshToken
│     │  ├─ SELECT RefreshTokens WHERE Token=@token
│     │  ├─ Check: RevokedAt == null && ExpiresAt > now
│     │  │  └─ FAIL → 401 "Token expired" → redirect /login
│     │  │
│     │  └─ VALID → Generate new JWT + rotate RefreshToken
│     │     ├─ UPDATE RefreshTokens SET RevokedAt=now WHERE Id=@oldId
│     │     ├─ INSERT RefreshTokens { UserId, Token=newToken, ExpiresAt }
│     │     └─ RETURN { token, refreshToken }
│     │
│     └─ Frontend: Update stored tokens
│        ├─ localStorage.setItem('vdsa_token', newToken)
│        └─ Retry original request with new token
│
└─ FAIL → Clear authStore → redirect /login
```

---

## 2. HỌC VIÊN HỌC BÀI MỚI

### 2.1. State Machine: Lesson Progress
```
┌─────────────────────────────────────────────────────────────────────┐
│                     LESSON PROGRESS STATE MACHINE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────┐   mở bài   ┌────────────┐   xem viz   ┌──────────┐ │
│  │ NotStarted │ ─────────→ │ InProgress │ ──────────→ │ Viewed   │ │
│  └────────────┘            └────────────┘             └──────────┘ │
│                                  │                         │        │
│                                  │ làm quiz                │        │
│                                  ▼                         │        │
│                           ┌────────────┐                   │        │
│                           │ QuizDone   │                   │        │
│                           └────────────┘                   │        │
│                                  │                         │        │
│                                  │ code lab               │        │
│                                  ▼                         │        │
│                           ┌────────────┐                   │        │
│                           │ CodelabDone│                   │        │
│                           └────────────┘                   │        │
│                                  │                         │        │
│                                  │ hoàn tất tất cả         │        │
│                                  ▼                         ▼        │
│                           ┌──────────────────────────────────┐     │
│                           │          Completed                │     │
│                           │  (XP awarded, progress saved)     │     │
│                           └──────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2. Sequence: Học viên hoàn thành 1 bài học
```
Browser          LessonStudyView        LessonStepComponents        Backend API        PostgreSQL
   │                   │                       │                       │                  │
   │ Mount lesson/123  │                       │                       │                  │
   │ ─────────────────→│                       │                       │                  │
   │                   │ GET /lessons/123      │                       │                  │
   │                   │ ─────────────────────→│                       │                  │
   │                   │                       │                       │ SELECT Lessons   │
   │                   │                       │                       │ WHERE id=?       │
   │                   │                       │                       │ ────────────────→│
   │                   │                       │                       │ ←────────────────│
   │                   │                       │                       │                  │
   │                   │ 200 {lesson, progress}│                       │                  │
   │                   │ ←─────────────────────│                       │                  │
   │                   │                       │                       │                  │
   │                   │ UseLessonStore.loadLesson()                   │                  │
   │                   │ ├─ currentLesson = lesson                     │                  │
   │                   │ ├─ activeStep = 1 (Theory)                    │                  │
   │                   │ └─ progress = savedProgress                   │                  │
   │                   │                       │                       │                  │
   │ Hiển thị Step 1   │                       │                       │                  │
   │ (Theory)          │                       │                       │                  │
   │ ←─────────────────│                       │                       │                  │
   │                   │                       │                       │                  │
   │ Đọc xong →        │                       │                       │                  │
   │ Click "Chuyển sang │                       │                       │                  │
   │ Trực Quan Hóa"    │                       │                       │                  │
   │ ─────────────────→│                       │                       │                  │
   │                   │ activeStep = 2 (Viz)  │                       │                  │
   │                   │                       │                       │                  │
   │                   │ ←─────────────────────│ LessonStepViz mount    │                  │
   │                   │                       │                       │                  │
   │                   │                       │ GET /algorithms/execute│                  │
   │                   │                       │ { algoId, inputData }  │                  │
   │                   │                       │ ─────────────────────→│                  │
   │                   │                       │                       │ ExecuteAlgorithm │
   │                   │                       │                       │ (AST compile +   │
   │                   │                       │                       │  yield frames)   │
   │                   │                       │                       │                  │
   │                   │                       │                       │ Save to cache    │
   │                   │                       │                       │ (Redis/memory)   │
   │                   │                       │                       │                  │
   │                   │                       │ 200 { frames[] }      │                  │
   │                   │                       │ ←─────────────────────│                  │
   │                   │                       │                       │                  │
   │ Xem visualizer    │                       │ useAnimationStore      │                  │
   │ chạy hoạt ảnh     │                       │ .setFrames(frames)     │                  │
   │ ←─────────────────│                       │                       │                  │
   │                   │                       │                       │                  │
   │ Viz xong →        │                       │                       │                  │
   │ Click "Tiếp Tục    │                       │                       │                  │
   │ Làm Quiz"         │                       │                       │                  │
   │ ─────────────────→│                       │                       │                  │
   │                   │ activeStep = 3 (Quiz) │                       │                  │
   │                   │                       │                       │                  │
   │                   │ ←─────────────────────│ LessonStepQuiz mount    │                  │
   │                   │                       │                       │                  │
   │                   │                       │ GET /quiz/by-lesson/123│                  │
   │                   │                       │ ─────────────────────→│                  │
   │                   │                       │ 200 { questions[] }   │                  │
   │                   │                       │ ←─────────────────────│                  │
   │                   │                       │                       │                  │
   │ Chọn đáp án →      │                       │                       │                  │
   │ Submit Quiz       │                       │                       │                  │
   │ ─────────────────→│                       │                       │                  │
   │                   │                       │ POST /quiz/submit      │                  │
   │                   │                       │ { lessonId, answers }  │                  │
   │                   │                       │ ─────────────────────→│                  │
   │                   │                       │                       │ Grade answers:   │
   │                   │                       │                       │ correctCount /   │
   │                   │                       │                       │ totalQuestions   │
   │                   │                       │                       │                  │
   │                   │                       │                       │ INSERT QuizAttempt│
   │                   │                       │                       │ ────────────────→│
   │                   │                       │                       │ ←────────────────│
   │                   │                       │                       │                  │
   │                   │                       │                       │ IF passed:       │
   │                   │                       │                       │   awardXP()      │
   │                   │                       │                       │   INSERT XPGrant │
   │                   │                       │                       │ ────────────────→│
   │                   │                       │                       │                  │
   │                   │                       │ 200 { score, passed } │                  │
   │                   │                       │ ←─────────────────────│                  │
   │                   │                       │                       │                  │
   │ Hiển thị kết quả  │                       │ IF score >= 70%        │                  │
   │ ✓/✗ từng câu      │                       │   → unlock CodeLab     │                  │
   │ ←─────────────────│                       │ ELSE → "Làm lại"       │                  │
   │                   │                       │                       │                  │
   │ Click "Mở Khóa     │                       │                       │                  │
   │ Code Lab"         │                       │                       │                  │
   │ ─────────────────→│                       │                       │                  │
   │                   │ activeStep = 4 (CodeLab)                      │                  │
   │                   │                       │                       │                  │
   │                   │ ←─────────────────────│ LessonStepCodeLab mount │                  │
   │                   │                       │                       │                  │
   │                   │                       │ GET /codelabs/by-lesson│                  │
   │                   │                       │ ─────────────────────→│                  │
   │                   │                       │ 200 { task, tests }   │                  │
   │                   │                       │ ←─────────────────────│                  │
   │                   │                       │                       │                  │
   │ Viết code →       │                       │                       │                  │
   │ Submit Solution   │                       │                       │                  │
   │ ─────────────────→│                       │                       │                  │
   │                   │                       │ POST /codelabs/submit  │                  │
   │                   │                       │ { code, language }     │                  │
   │                   │                       │ ─────────────────────→│                  │
   │                   │                       │                       │ Run via Piston   │
   │                   │                       │                       │ API (sandboxed)  │
   │                   │                       │                       │                  │
   │                   │                       │                       │ INSERT Codelab   │
   │                   │                       │                       │ Submissions      │
   │                   │                       │                       │ ────────────────→│
   │                   │                       │                       │                  │
   │                   │                       │ 200 { status, score } │                  │
   │                   │                       │ ←─────────────────────│                  │
   │                   │                       │                       │                  │
   │ Hiển thị PASS/    │                       │ IF all tests PASS:     │                  │
   │ FAIL từng test    │                       │   lesson complete      │                  │
   │ ←─────────────────│                       │   → awardXP + save     │                  │
   │                   │                       │     progress           │                  │
   │                   │                       │                       │                  │
   │ Lesson Complete   │                       │                       │                  │
   │ → Confetti + XP   │                       │                       │                  │
   │ ←─────────────────│                       │                       │                  │
   │                   │                       │                       │                  │
```

### 2.3. Logic chi tiết: Award XP khi hoàn thành bài
```
EVENT: Student hoàn thành Lesson (Quiz passed + Codelab passed)
│
├─ INPUT: { userId, lessonId, quizScore, codelabScore }
│
├─ Tổng XP cộng:
│  ├─ lesson.XPReward (base)
│  ├─ quizBonus = quizScore >= 70% ? 10 : 0
│  ├─ codelabBonus = allTestsPassed ? 20 : 0
│  └─ totalXPAwarded = base + quizBonus + codelabBonus
│
├─ Kiểm tra trùng lặp (idempotent):
│  ├─ SELECT UserLessonProgresses
│  │  WHERE UserId=@userId AND LessonId=@lessonId
│  │  AND XPAwarded > 0
│  │
│  ├─ IF exists → SKIP (không cộng XP trùng)
│  └─ IF not exists → continue
│
├─ Cập nhật UserLessonProgress:
│  ├─ INSERT/UPDATE UserLessonProgresses
│  │  SET HasWatchedVisualizer=true,
│  │      QuizScore=@quizScore,
│  │      CodelabCompleted=true,
│  │      XPAwarded=@totalXPAwarded,
│  │      CompletedAt=now
│
├─ Cập nhật User.TotalXP:
│  ├─ UPDATE Users SET TotalXP = TotalXP + @totalXPAwarded
│  │  WHERE Id=@userId
│
├─ Kiểm tra Level Up:
│  ├─ newLevel = calculateLevel(newTotalXP)
│  │  └─ thresholds: [0, 100, 300, 600, 1000, 1500, 2200, 3000]
│  │
│  ├─ IF newLevel > oldLevel:
│  │  ├─ UPDATE Users SET CurrentLevel=@newLevel
│  │  ├─ INSERT Notifications { Type="LevelUp", Content="Chúc mừng lên level X!" }
│  │  └─ Frontend: show confetti animation
│  │
│  └─ ELSE → no level up
│
├─ Kiểm tra Badge Unlock:
│  ├─ SELECT Badges WHERE Criteria met
│  │  └─ criteria types: xp_threshold, streak_days, lessons_completed,
│  │                     quizzesPassed, algorithms_mastered
│  │
│  ├─ FOR each matching badge:
│  │  ├─ INSERT UserBadges { UserId, BadgeId, EarnedAt=now }
│  │  └─ INSERT Notifications { Type="BadgeUnlocked" }
│  │
│  └─ Frontend: show badge unlock modal + confetti
│
└─ RETURN { xpAwarded, newLevel, badgesUnlocked[] }
```

---

## 3. HỆ THỐNG QUIZ & CHẤM ĐIỂM

### 3.1. State Machine: Quiz Attempt
```
┌─────────────────────────────────────────────────────────────────────┐
│                       QUIZ ATTEMPT STATE MACHINE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────┐   bắt đầu   ┌────────────┐   chọn đáp án  ┌──────┐ │
│  │ NotStarted │ ─────────→  │ InProgress │ ─────────────→ │Answered│
│  └────────────┘             └────────────┘                └──────┘ │
│                                  │                         │        │
│                                  │ next question           │        │
│                                  ▼                         │        │
│                           ┌────────────┐                   │        │
│                           │ NextQuestion│                   │        │
│                           └────────────┘                   │        │
│                                  │                         │        │
│                                  │ hết câu hỏi             │        │
│                                  ▼                         │        │
│                           ┌────────────┐                   │        │
│                           │ Submitting │ ←─────────────────┘        │
│                           └────────────┘                            │
│                                  │                                  │
│                                  │ grade                            │
│                                  ▼                                  │
│                           ┌────────────┐                            │
│                           │  Graded    │                            │
│                           │ (pass/fail)│                            │
│                           └────────────┘                            │
│                                  │                                  │
│                                  │ award XP                         │
│                                  ▼                                  │
│                           ┌────────────┐                            │
│                           │ Completed  │                            │
│                           └────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2. Logic chi tiết: Chấm điểm Quiz
```
INPUT: SubmitQuizCommand { UserId, LessonId, Answers[] }
  Answers[] = { QuestionId, SelectedOptionIndex }

│
├─ 1. Validate attempt:
│  ├─ SELECT Quiz WHERE LessonId=@lessonId
│  ├─ SELECT QuizQuestions WHERE QuizId=@quizId
│  └─ Check: all questions answered?
│     └─ IF missing → 400 "Vui lòng trả lời tất cả câu hỏi"
│
├─ 2. Grade each answer:
│  ├─ FOR each answer:
│  │  ├─ correctIndex = question.CorrectIndex
│  │  ├─ isCorrect = (selectedIndex === correctIndex)
│  │  └─ score += isCorrect ? 1 : 0
│  │
│  ├─ totalQuestions = COUNT(questions)
│  ├─ correctCount = score
│  ├─ percentage = (correctCount / totalQuestions) * 100
│  └─ isPassed = (percentage >= 70)
│
├─ 3. Save attempt:
│  ├─ INSERT QuizAttempts {
│  │    UserId, QuizId,
│  │    Score = correctCount,
│  │    MaxScore = totalQuestions,
│  │    IsPassed = isPassed,
│  │    Answers = JSON(answers),
│  │    SubmittedAt = now
│  │  }
│
├─ 4. Award XP (nếu passed):
│  ├─ Kiểm tra trùng lặp:
│  │  └─ SELECT QuizXpGrants WHERE UserId=@userId AND QuizId=@quizId
│  │     └─ IF exists → SKIP (đã nhận XP)
│  │
│  ├─ IF isPassed AND not granted:
│  │  ├─ xpAmount = quiz.XPReward
│  │  ├─ INSERT QuizXpGrants { UserId, QuizId, XPAmount }
│  │  ├─ UPDATE Users SET TotalXP += xpAmount
│  │  └─ INSERT QuizAttempts.XPAwarded = xpAmount
│  │
│  └─ ELSE → no XP awarded
│
├─ 5. Build response:
│  └─ RETURN {
│       score: correctCount,
│       maxScore: totalQuestions,
│       percentage: percentage,
│       isPassed: isPassed,
│       xpAwarded: xpAmount,
│       results: [
│         { questionId, selectedIndex, correctIndex, isCorrect, explanation }
│       ]
│     }
│
└─ 6. Frontend xử lý:
   ├─ Hiển thị kết quả từng câu (✓/✗ + explanation)
   ├─ Nếu passed → nút "Mở Khóa Code Lab"
   └─ Nếu failed → nút "Làm lại"
```

---

## 4. CODELAB — CHẤM CODE TRỰC TUYẾN

### 4.1. State Machine: Codelab Submission
```
┌─────────────────────────────────────────────────────────────────────┐
│                    CODELAB SUBMISSION STATE MACHINE                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────┐   submit   ┌────────────┐   run tests   ┌────────┐ │
│  │  Editing   │ ─────────→ │ Submitting │ ────────────→ │Running │ │
│  └────────────┘            └────────────┘               └────────┘ │
│                                                               │      │
│                                                               │      │
│                          ┌────────────────────────────────────┤      │
│                          │                                     │      │
│                          ▼                                     ▼      │
│                   ┌────────────┐                         ┌────────┐ │
│                   │   Error    │                         │Graded  │ │
│                   │(timeout/CE)│                         │(P/F)   │ │
│                   └────────────┘                         └────────┘ │
│                          │                                     │      │
│                          │ retry                               │      │
│                          ▼                                     ▼      │
│                   ┌────────────┐                         ┌────────┐ │
│                   │  Editing   │                         │Completed│
│                   └────────────┘                         └────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2. Sequence: Submit & Grade Codelab
```
Browser          CodeLabPanel           Backend              Piston API         PostgreSQL
   │                  │                    │                     │                │
   │ Viết code JS     │                    │                     │                │
   │ ────────────────→│                    │                     │                │
   │                  │                    │                     │                │
   │ Click Submit     │                    │                     │                │
   │ ────────────────→│                    │                     │                │
   │                  │ POST /codelabs/submit                    │                │
   │                  │ { codelabId, code, language }            │                │
   │                  │ ───────────────────→│                     │                │
   │                  │                    │                     │                │
   │                  │                    │ INSERT Codelab      │                │
   │                  │                    │ Submissions         │                │
   │                  │                    │ Status="Pending"    │                │
   │                  │                    │ ────────────────────────────────→    │
   │                  │                    │                     │                │
   │                  │                    │ 202 { submissionId }│                │
   │                  │ ←──────────────────│                     │                │
   │                  │                    │                     │                │
   │ Show "Đang chấm" │                    │                     │                │
   │ ←────────────────│                    │                     │                │
   │                  │                    │                     │                │
   │                  │                    │ SELECT TestCases    │                │
   │                  │                    │ WHERE codelabId=?   │                │
   │                  │                    │ ←─────────────────────────────────    │
   │                  │                    │                     │                │
   │                  │                    │ FOR each testCase:  │                │
   │                  │                    │                     │                │
   │                  │                    │ POST Piston API     │                │
   │                  │                    │ {                   │                │
   │                  │                    │   language,         │                │
   │                  │                    │   source_code,      │                │
   │                  │                    │   stdin: input      │                │
   │                  │                    │ }                   │                │
   │                  │                    │ ───────────────────→│                │
   │                  │                    │                     │                │
   │                  │                    │                     │ Run sandboxed  │
   │                  │                    │                     │ (2s timeout,   │
   │                  │                    │                     │  128MB RAM)    │
   │                  │                    │                     │                │
   │                  │                    │ ←───────────────────│                │
   │                  │                    │ { output, stderr,   │                │
   │                  │                    │   exit_code }       │                │
   │                  │                    │                     │                │
   │                  │                    │ Compare output      │                │
   │                  │                    │ with expectedOutput │                │
   │                  │                    │                     │                │
   │                  │                    │ UPDATE Codelab      │                │
   │                  │                    │ Submissions         │                │
   │                  │                    │ Status="Completed"  │                │
   │                  │                    │ Score = passedCount │                │
   │                  │                    │ ────────────────────────────────→    │
   │                  │                    │                     │                │
   │                  │                    │ 200 { results[] }   │                │
   │                  │ ←──────────────────│                     │                │
   │                  │                    │                     │                │
   │ Hiển thị kết quả │                    │                     │                │
   │ PASS/FAIL/tests  │                    │                     │                │
   │ ←────────────────│                    │                     │                │
```

### 4.3. Logic chi tiết: Grade Code
```
INPUT: SubmitCodelabCommand { CodelabId, UserId, SourceCode, Language }
│
├─ 1. Validate:
│  ├─ Codelab exists AND IsDeleted=false
│  ├─ Language IN Codelab.AllowedLanguages
│  ├─ SourceCode length <= 100KB
│  └─ Rate limit: max 10 submissions/minute per user
│     └─ IF exceeded → 429 "Quá nhiều lần nộp, vui lòng đợi"
│
├─ 2. Create submission record:
│  └─ INSERT CodelabSubmissions {
│       UserId, CodelabId, SourceCode, Language,
│       Status="Pending", SubmittedAt=now
│     }
│
├─ 3. Fetch test cases:
│  └─ SELECT CodelabTestCases WHERE CodelabId=@codelabId
│     ├─ visible tests (IsHidden=false) → shown to user
│     └─ hidden tests (IsHidden=true) → graded but not shown
│
├─ 4. Execute code (for each test case):
│  ├─ POST https://emkc.org/api/v2/piston/execute
│  │  {
│  │    language: "javascript",
│  │    version: "18.15.0",
│  │    files: [{ content: sourceCode }],
│  │    stdin: testCase.input,
│  │    compile_timeout: 10000,
│  │    run_timeout: codelab.MaxRuntimeMs (default 2000),
│  │    compile_memory_limit: 128000000,
│  │    run_memory_limit: codelab.MaxMemoryBytes
│  │  }
│  │
│  ├─ Evaluate result:
│  │  ├─ exit_code === 0 AND output.trim() === expectedOutput.trim()
│  │  │  └─ PASS ✓
│  │  │
│  │  ├─ exit_code !== 0
│  │  │  └─ FAIL ✗ (runtime error)
│  │  │
│  │  ├─ timeout
│  │  │  └─ FAIL ✗ (timeout)
│  │  │
│  │  └─ output !== expected
│  │     └─ FAIL ✗ (wrong answer)
│  │
│  └─ Save test results to submission record
│
├─ 5. Calculate score:
│  ├─ passedCount = COUNT(tests where PASS)
│  ├─ totalCount = COUNT(all tests)
│  ├─ score = (passedCount / totalCount) * 100
│  └─ allPassed = (passedCount === totalCount)
│
├─ 6. Update submission:
│  └─ UPDATE CodelabSubmissions SET
│       Status="Completed",
│       Score=score,
│       RuntimeMs=avgRuntime,
│       MemoryBytes=avgMemory
│
├─ 7. Award XP (if allPassed):
│  ├─ Kiểm tra CodelabCompleted chưa:
│  │  └─ SELECT UserLessonProgresses
│  │     WHERE UserId=@userId AND LessonId=@lessonId
│  │     AND CodelabCompleted=true
│  │     └─ IF exists → SKIP
│  │
│  ├─ IF allPassed AND not completed:
│  │  ├─ UPDATE UserLessonProgresses SET CodelabCompleted=true
│  │  ├─ UPDATE Users SET TotalXP += codelab.XPReward
│  │  └─ Trigger checkBadgeUnlocks()
│  │
│  └─ ELSE → no XP
│
└─ 8. RETURN {
     submissionId,
     status: "Completed",
     score,
     allPassed,
     results: [
       { testCaseId, input, expected, actual, passed, runtimeMs }
       // hidden tests: only shown as passed/failed, no input/output
     ],
     xpAwarded
   }
```

---

## 5. GAMIFICATION — XP, LEVEL, STREAK, BADGE

### 5.1. State Machine: User Level Progression
```
┌─────────────────────────────────────────────────────────────────────┐
│                      LEVEL PROGRESSION SYSTEM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Level 1 (0 XP)                                                       │
│  ════════════════                                                     │
│  │  earn XP >= 100  │                                                │
│  ▼                   ▼                                                │
│  Level 2 (100 XP) ──→ earn XP >= 300 ──→ Level 3 (300 XP)           │
│                            │                                          │
│                            └──→ earn XP >= 600 ──→ Level 4 (600 XP)  │
│                                        │                              │
│                                        └──→ earn XP >= 1000          │
│                                             ──→ Level 5 (1000 XP)    │
│                                                     │                │
│                                                     └──→ Level 6    │
│                                                          (1500 XP)   │
│                                                          │          │
│                                                          └──→ L7     │
│                                                               (2200)  │
│                                                               │       │
│                                                               └──→ L8 │
│                                                                    (3000)│
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2. Logic chi tiết: calculateLevel(totalXP)
```
FUNCTION calculateLevel(totalXP: int) -> int:
  thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000]
  
  FOR i FROM thresholds.length-1 DOWN TO 0:
    IF totalXP >= thresholds[i]:
      RETURN i + 1  // Level is 1-indexed
  
  RETURN 1  // Default level

// Examples:
//   XP=0    → Level 1
//   XP=99   → Level 1
//   XP=100  → Level 2
//   XP=450  → Level 3
//   XP=3000 → Level 8 (max)
```

### 5.3. Logic chi tiết: Streak Calculation
```
FUNCTION calculateUpdatedStreak(
  currentStreak: int,
  lastActivityDate: DateTime?,
  graceHours: int = 2
) -> int:

  today = DateTime.UtcNow.Date
  now = DateTime.utcNow
  
  IF lastActivityDate == null:
    RETURN 1  // First day learning
  
  lastDate = lastActivityDate.Date
  hoursSinceLast = (now - lastActivityDate).TotalHours
  
  IF lastDate == today:
    RETURN currentStreak  // Already studied today, no change
  
  IF hoursSinceLast <= 24 + graceHours:
    RETURN currentStreak + 1  // Continued streak (with grace period)
  
  IF hoursSinceLast > 24 + graceHours:
    RETURN 1  // Streak broken, restart from 1

// Grace hours (2h): Support users who study late at night
// Example: Study at 11PM → next day 1AM still counts as same day
```

### 5.4. Logic chi tiết: Badge Unlock Check
```
FUNCTION checkBadgeUnlocks(userId: Guid) -> Badge[]:
  
  user = SELECT Users WHERE Id=@userId
  unlockedBadges = []
  
  allBadges = SELECT Badges
  alreadyUnlocked = SELECT UserBadges WHERE UserId=@userId
  
  FOR each badge IN allBadges:
    IF badge.Id IN alreadyUnlocked:
      CONTINUE  // Already have this badge
    
    criteria = JSON.parse(badge.Criteria)
    isMet = FALSE
    
    SWITCH criteria.type:
      CASE "xp_threshold":
        isMet = (user.TotalXP >= criteria.value)
      
      CASE "streak_days":
        isMet = (user.StreakDays >= criteria.value)
      
      CASE "lessons_completed":
        completedCount = COUNT(UserLessonProgresses
          WHERE UserId=@userId AND CompletedAt IS NOT NULL)
        isMet = (completedCount >= criteria.value)
      
      CASE "quizzes_passed":
        passedCount = COUNT(QuizAttempts
          WHERE UserId=@userId AND IsPassed=true)
        isMet = (passedCount >= criteria.value)
      
      CASE "algorithms_mastered":
        // Count unique algorithms visualized
        algoCount = COUNT(DISTINCT AlgorithmId FROM visualization history)
        isMet = (algoCount >= criteria.value)
      
      CASE "level_reached":
        isMet = (user.CurrentLevel >= criteria.value)
    
    IF isMet:
      INSERT UserBadges { UserId, BadgeId, EarnedAt=now }
      INSERT Notifications { UserId, Type="BadgeUnlocked", ... }
      unlockedBadges.ADD(badge)
  
  RETURN unlockedBadges
```

### 5.5. Sequence: Earn XP → Level Up → Badge Unlock
```
Event: Student completes activity → earns 50 XP
│
├─ 1. UPDATE Users SET TotalXP = TotalXP + 50
│     Old: 80 XP (Level 1)
│     New: 130 XP (Level 2) ← threshold crossed!
│
├─ 2. Detect Level Up:
│     newLevel = calculateLevel(130) = 2
│     IF newLevel > oldLevel:
│       UPDATE Users SET CurrentLevel = 2
│
├─ 3. INSERT Notifications {
│     UserId, Type="LevelUp",
│     Content="Chúc mừng! Bạn đã lên Level 2!",
│     IsRead=false
│   }
│
├─ 4. Frontend receives { xpAwarded: 50, newLevel: 2 }
│     ├─ Show "+50 XP" floating text
│     ├─ Show Level Up modal + confetti
│     └─ Update header badge (Level 2)
│
├─ 5. Check badges:
│     ├─ Badge "First Steps" (XP >= 100)? → UNLOCK!
│     │  ├─ INSERT UserBadges
│     │  └─ INSERT Notifications { Type="BadgeUnlocked" }
│     │
│     └─ Frontend: Show badge unlock popup
│
└─ 6. Update Streak:
     ├─ calculateUpdatedStreak(currentStreak, lastActivityDate)
     └─ UPDATE Users SET StreakDays = newStreak
```

---

## 6. GIẢNG VIÊN QUẢN LÝ KHÓA HỌC

### 6.1. State Machine: Course Publish Workflow
```
┌─────────────────────────────────────────────────────────────────────┐
│                      COURSE PUBLISH WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐   tạo mới   ┌──────────┐   thêm module   ┌────────┐ │
│  │  Start   │ ─────────→  │  Draft   │ ──────────────→ │Content │ │
│  └──────────┘             └──────────┘                 │Added   │ │
│                               │                        └────────┘ │
│                               │ review                      │      │
│                               ▼                              │      │
│                        ┌──────────┐                          │      │
│                        │ InReview │ ←────────────────────────┘      │
│                        └──────────┘                                 │
│                               │                                     │
│                               │ approve                             │
│                               ▼                                     │
│                        ┌──────────┐                                 │
│                        │Published │                                 │
│                        └──────────┘                                 │
│                               │                                     │
│                               │ archive                             │
│                               ▼                                     │
│                        ┌──────────┐                                 │
│                        │ Archived │                                 │
│                        └──────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2. Sequence: Teacher tạo khóa học với modules và lessons
```
Browser           TeacherCourseTab         CourseBuilder         Backend API        PostgreSQL
   │                    │                      │                    │                  │
   │ Click "Tạo Khóa    │                      │                    │                  │
   │ học"              │                      │                    │                  │
   │ ─────────────────→│                      │                    │                  │
   │                    │ Mount CourseBuilder  │                    │                  │
   │                    │ ────────────────────→│                    │                  │
   │                    │                      │                    │                  │
   │ Nhập thông tin:    │                      │                    │                  │
   │ - Title            │                      │                    │                  │
   │ - Description      │                      │                    │                  │
   │ - Category         │                      │                    │                  │
   │ - Difficulty       │                      │                    │                  │
   │ - Premium?         │                      │                    │                  │
   │ Cover Image        │                      │                    │                  │
   │ ─────────────────→│                      │                    │                  │
   │                    │                      │                    │                  │
   │ Thêm Module:       │                      │                    │                  │
   │ "Module 1:..."     │                      │                    │                  │
   │ ─────────────────→│                      │                    │                  │
   │                    │                      │ POST /courses      │                  │
   │                    │                      │ { title, desc,     │                  │
   │                    │                      │   category, ... }  │                  │
   │                    │                      │ ───────────────────→│                  │
   │                    │                      │                    │ INSERT Courses   │
   │                    │                      │                    │ ────────────────→│
   │                    │                      │                    │ ←────────────────│
   │                    │                      │                    │                  │
   │                    │                      │ 201 { courseId }   │                  │
   │                    │                      │ ←───────────────────│                  │
   │                    │                      │                    │                  │
   │ Thêm Lesson vào    │                      │                    │                  │
   │ Module:            │                      │                    │                  │
   │ - Title            │                      │                    │                  │
   │ - Content Markdown │                      │                    │                  │
   │ - SandboxType      │                      │                    │                  │
   │ - XPReward         │                      │                    │                  │
   │ ─────────────────→│                      │                    │                  │
   │                    │                      │ POST /lessons      │                  │
   │                    │                      │ { moduleId, ... }  │                  │
   │                    │                      │ ───────────────────→│                  │
   │                    │                      │                    │ INSERT Lessons   │
   │                    │                      │                    │ ────────────────→│
   │                    │                      │                    │                  │
   │                    │                      │ POST /modules      │                  │
   │                    │                      │ /items             │                  │
   │                    │                      │ { moduleId,        │                  │
   │                    │                      │   lessonId,        │                  │
   │                    │                      │   itemType }       │                  │
   │                    │                      │ ───────────────────→│                  │
   │                    │                      │                    │ INSERT ModuleItems│
   │                    │                      │                    │ ────────────────→│
   │                    │                      │                    │                  │
   │ Publish Course     │                      │                    │                  │
   │ ─────────────────→│                      │                    │                  │
   │                    │                      │ PUT /courses/       │                  │
   │                    │                      │ { isPublished }    │                  │
   │                    │                      │ ───────────────────→│                  │
   │                    │                      │                    │ UPDATE Courses   │
   │                    │                      │                    │ IsPublished=true │
   │                    │                      │                    │ ────────────────→│
   │                    │                      │                    │                  │
   │                    │                      │                    │ INSERT AuditLogs │
   │                    │                      │                    │ ────────────────→│
   │                    │                      │                    │                  │
   │ Course hiển thị    │                      │                    │                  │
   │ trong /courses     │                      │                    │                  │
   │ ←─────────────────│                      │                    │                  │
```

### 6.3. Logic chi tiết: Validate Course trước khi Publish
```
FUNCTION validateCourseForPublish(courseId: Guid) -> ValidationResult:
  
  course = SELECT Courses WHERE Id=@courseId
  errors = []
  
  // Required fields
  IF course.Title IS NULL OR LENGTH < 5:
    errors.ADD("Tiêu đề phải có ít nhất 5 ký tự")
  
  IF course.Description IS NULL OR LENGTH < 20:
    errors.ADD("Mô tả phải có ít nhất 20 ký tự")
  
  // Must have at least 1 module
  modules = SELECT CourseModules WHERE CourseId=@courseId
  IF modules.COUNT == 0:
    errors.ADD("Khóa học phải có ít nhất 1 module")
  
  // Each module must have at least 1 item
  FOR each module IN modules:
    items = SELECT ModuleItems WHERE ModuleId=@module.Id
    IF items.COUNT == 0:
      errors.ADD($"Module '{module.Title}' chưa có bài học nào")
    
    // Each lesson must be published
    FOR each item IN items:
      IF item.ItemType == "Lesson":
        lesson = SELECT Lessons WHERE Id=@item.LessonId
        IF lesson.PublishStatus != "Published":
          errors.ADD($"Bài '{lesson.Title}' chưa được publish")
      ELSE IF item.ItemType == "Quiz":
        quiz = SELECT Quizzes WHERE Id=@item.QuizId
        questions = SELECT QuizQuestions WHERE QuizId=@quiz.Id
        IF questions.COUNT < 2:
          errors.ADD($"Quiz '{quiz.Title}' phải có ít nhất 2 câu hỏi")
  
  // Premium content check
  IF course.IsPremium AND course.Amount <= 0:
    errors.ADD("Khóa Premium phải có giá > 0")
  
  IF errors.COUNT > 0:
    RETURN { IsValid=false, Errors=errors }
  ELSE:
    RETURN { IsValid=true }
```

---

## 7. GIẢNG VIÊN QUẢN LÝ LỚP HỌC

### 7.1. Sequence: Student join Classroom bằng Invite Code
```
StudentBrowser       Frontend            Backend              PostgreSQL
   │                    │                   │                     │
   │ Nhập invite code   │                   │                     │
   │ "ABC123"           │                   │                     │
   │ ──────────────────→│                   │                     │
   │                    │ POST /classrooms/ │                     │
   │                    │ join              │                     │
   │                    │ { inviteCode }    │                     │
   │                    │ ─────────────────→│                     │
   │                    │                   │ SELECT Classrooms   │
   │                    │                   │ WHERE InviteCode=?  │
   │                    │                   │ ───────────────────→│
   │                    │                   │ ←───────────────────│
   │                    │                   │                     │
   │                    │                   │ Validate:           │
   │                    │                   │ - code exists       │
   │                    │                   │ - not expired       │
   │                    │                   │ - not archived      │
   │                    │                   │ - capacity < max    │
   │                    │                   │                     │
   │                    │                   │ Kiểm tra đã enroll: │
   │                    │                   │ SELECT Enrollments  │
   │                    │                   │ WHERE userId+classId│
   │                    │                   │ ───────────────────→│
   │                    │                   │                     │
   │                    │                   │ IF exists → 409     │
   │                    │                   │ "Đã tham gia lớp"   │
   │                    │                   │                     │
   │                    │                   │ INSERT Enrollments  │
   │                    │                   │ ───────────────────→│
   │                    │                   │                     │
   │                    │                   │ INSERT Notifications│
   │                    │                   │ (to teacher)        │
   │                    │                   │ ───────────────────→│
   │                    │                   │                     │
   │                    │ 201 { classroom } │                     │
   │                    │ ←─────────────────│                     │
   │                    │                   │                     │
   │ Chào mừng +        │                   │                     │
   │ redirect /classroom│                   │                     │
   │ ←──────────────────│                   │                     │
```

---

## 8. QUẢN TRỊ HỆ THỐNG (ADMIN)

### 8.1. Logic chi tiết: Admin xóa/quản lý Quiz
```
FUNCTION adminDeleteQuiz(adminId: Guid, quizId: Guid) -> Result:
  
  // Authorization
  admin = SELECT Users WHERE Id=@adminId
  IF admin.Role != "Admin":
    RETURN 403 "Không có quyền"
  
  // Validate
  quiz = SELECT Quizzes WHERE Id=@quizId
  IF quiz == null:
    RETURN 404 "Không tìm thấy quiz"
  
  // Soft delete (không xóa cứng)
  BEGIN TRANSACTION:
    ├─ UPDATE Quizzes SET IsDeleted=true WHERE Id=@quizId
    ├─ UPDATE QuizQuestions SET IsDeleted=true WHERE QuizId=@quizId
    ├─ INSERT AuditLogs {
    │    UserId=adminId,
    │    Action="QuizDeleted",
    │    EntityType="Quiz",
    │    EntityId=quizId,
    │    Timestamp=now
    │  }
  COMMIT
  
  RETURN 200 { message="Đã xóa quiz" }
```

---

## 9. THANH TOÁN PREMIUM

### 9.1. State Machine: Order Payment Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│                       ORDER PAYMENT STATE MACHINE                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────┐   tạo đơn   ┌────────────┐   user chuyển   ┌──────┐ │
│  │   Idle     │ ─────────→  │  Pending   │ ──────────────→ │Paying│ │
│  └────────────┘             └────────────┘                 └──────┘ │
│                                    │                         │      │
│                                    │ timeout                 │      │
│                                    ▼                         │      │
│                             ┌────────────┐                   │      │
│                             │  Expired   │                   │      │
│                             └────────────┘                   │      │
│                                                              │      │
│                                    ┌─────────────────────────┘      │
│                                    │ bank confirm                   │
│                                    ▼                                │
│                             ┌────────────┐                         │
│                             │ Completed  │                         │
│                             └────────────┘                         │
│                                    │                                │
│                                    │ unlock premium                 │
│                                    ▼                                │
│                             ┌────────────┐                         │
│                             │  Unlocked  │                         │
│                             └────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. KNOWLEDGE GRAPH — ĐỒ THỊ KIẾN THỨC

### 10.1. Logic: Tạo Knowledge Graph từ SemanticConceptNodes
```
FUNCTION buildKnowledgeGraph() -> GraphData:
  
  nodes = SELECT SemanticConceptNodes
  edges = SELECT KnowledgeEdges
  
  graphNodes = []
  graphEdges = []
  
  FOR each node IN nodes:
    graphNodes.ADD({
      id: node.Id,
      label: node.Name,
      type: node.Type,  // Algorithm/DataStructure/Concept
      difficulty: node.Difficulty,
      size: calculateSize(node),  // dựa trên số edges
      color: getColorByType(node.Type)
    })
  
  FOR each edge IN edges:
    graphEdges.ADD({
      source: edge.SourceId,
      target: edge.TargetId,
      relation: edge.RelationType,  // Prerequisite/Related/Extends
      style: getEdgeStyle(edge.RelationType)
    })
  
  RETURN { nodes: graphNodes, edges: graphEdges }

// Edge styles:
// - Prerequisite: solid arrow (cần học trước)
// - Related: dashed line (liên quan)
// - Extends: dotted line (mở rộng)
```

---

## 📌 KẾT LUẬN

Mỗi table trong database đều phục vụ một **nghiệp vụ cụ thể**:

1. **User & Auth**: Xác thực, phân quyền, audit trail
2. **Course & Lesson**: Nội dung học tập, cấu trúc phân cấp
3. **Quiz**: Kiểm tra kiến thức, chấm điểm tự động
4. **Classroom**: Quảo lý lớp học, enroll, customize content
5. **Codelab**: Thực hành code, chấm qua Piston API
6. **Gamification**: Động viên học tập (XP, Level, Streak, Badge)
7. **Payment**: Business model Premium
8. **Knowledge Graph**: Mô tả quan hệ giữa các khái niệm DSA

Mọi luồng đều tuân thủ nguyên tắc:
- **Idempotent**: Không trùng lặp XP, enrollment, v.v.
- **Audit**: Mọi thay đổi có AuditLog
- **Soft Delete**: Không xóa cứng dữ liệu
- **Grace Period**: Hỗ trợ streak calculation linh hoạt
