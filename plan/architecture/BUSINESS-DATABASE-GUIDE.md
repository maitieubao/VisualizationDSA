# 📘 CẨM NANG NGHIỆP VỤ & DATABASE — VisualizationDSA

> Tài liệu giải thích chi tiết nghiệp vụ của hệ thống, lý do thiết kế từng bảng database, quan hệ giữa các thực thể, và luồng nghiệp vụ chính.

---

## 📑 MỤC LỤC

1. [Tổng quan nghiệp vụ](#1-tổng-quan-nghiệp-vụ)
2. [Nguyên tắc thiết kế Database](#2-nguyên-tắc-thiết-kế-database)
3. [Sơ đồ quan hệ thực thể (ERD tóm tắt)](#3-sơ đồ-quan-hệ-thực-thể-erd-tóm-tắt)
4. [Hướng dẫn chi tiết 40 Table](#4-hướng-dẫn-chi-tiết-40-table)
5. [Luồng nghiệp vụ chính](#5-luồng-nghiệp-vụ-chính)

---

## 1. TỔNG QUAN NGHIỆP VỤ

**VisualizationDSA** là nền tảng học thuật trực quan hóa Cấu trúc Dữ liệu & Giải thuật (DSA) dành cho sinh viên Việt Nam.

### 🎯 Mục tiêu nghiệp vụ
- **Học tập trực quan**: Sinh viên học DSA qua hoạt ảnh 60 FPS thay vì lý thuyết khô khan
- **Hệ thống Giảng viên**: GV tạo khóa học, quiz, codelab, quản lý lớp học
- **Hệ thống Admin**: Quản trị người dùng, quiz, hệ thống
- **Gamification**: Tích lũy XP, lên level, streak, huy hiệu để động viên học
- **Trắc nghiệm tương tác**: Kiểm tra kiến thức qua quiz trong bài giảng
- **Thực hành Code**: Codelab chấm code thực tế qua Piston API

### 👥 Vai trò người dùng (Roles)
| Vai trò | Quyền hạn |
|---------|-----------|
| **Student** | Học bài, làm quiz, codelab, xem tiến độ |
| **Teacher** | Tạo khóa học, quiz, codelab, quản lý lớp |
| **Admin** | Quản lý người dùng, quiz, hệ thống, audit |

### 📊 Metrics theo dõi
- **XP (Experience Point)**: Điểm kinh nghiệm tích lũy khi học
- **Level**: Cấp độ (tính theo ngưỡng XP: 0, 100, 300, 600, 1000, 1500, 2200, 3000)
- **Streak**: Chuỗi ngày học liên tiếp
- **Badges**: Huy hiệu đạt được khi đủ điều kiện
- **Progress**: % hoàn thành bài học, module, khóa học

---

## 2. NGUYÊN TẮC THIẾT KẾ DATABASE

### 🏗️ Kiến trúc: Clean Architecture + Domain-Driven Design
```
┌─────────────────────────────────────────────────────┐
│                    Presentation                       │
│              (Vue 3 Frontend + Vite)                  │
├─────────────────────────────────────────────────────┤
│                    Application                        │
│         (Use Cases, DTOs, Command Handlers)          │
├─────────────────────────────────────────────────────┤
│                      Domain                           │
│     (Entities, Value Objects, Domain Services)       │
├─────────────────────────────────────────────────────┤
│                   Infrastructure                      │
│         (EF Core, PostgreSQL, Repositories)          │
└─────────────────────────────────────────────────────┘
```

### 📐 Nguyên tắc đặt tên
- **Table**: PascalCase số nhiều (Users, Courses, QuizAttempts)
- **Primary Key**: `Id` (Guid)
- **Foreign Key**: `[Entity]Id` (Guid)
- **Navigation**: Virtual ICollection cho lazy loading
- **Timestamps**: `CreatedAt`, `UpdatedAt`, `LastLoginAt`

### 🔐 Nguyên tắc bảo mật
- **Password**: Hash (bcrypt), không lưu plaintext
- **Token**: RefreshToken riêng, JWT access token không lưu DB
- **Audit**: Mọi thay đổi phải có AuditLog
- **Soft Delete**: Dùng `IsDeleted`/`IsActive` thay vì xóa cứng

---

## 3. SƠ ĐỒ QUAN HỆ THỰC THỂ (ERD TÓM TẮT)

```
                                    ┌─────────────┐
                                    │   Users     │
                                    │             │
                                    │  Id (PK)    │
                                    │  Email      │
                                    │  Username   │
                                    │  TotalXP    │
                                    │  Level      │
                                    │  Streak     │
                                    │  IsPremium  │
                                    │  Role       │
                                    └──────┬──────┘
                                           │
          ┌────────────┬─────────────┬──────┴──────┬────────────┬────────────┐
          │            │             │             │            │            │
    ┌─────┴─────┐┌─────┴─────┐┌──────┴──────┐┌────┴────┐┌─────┴─────┐┌────┴────┐
    │  Badges   ││   Quiz    ││   Courses   ││ Orders  ││ Classroom ││Refresh  │
    │           ││           ││             ││         ││           ││ Tokens  │
    │ UserBadges││ Questions ││   Modules   ││         ││ Enrollment││         │
    │           ││ Attempts  ││   Lessons   ││         ││  Lessons  ││         │
    └───────────┘└───────────┘│   Comments  ││         ││  Modules  ││         │
                              │   Progress  ││         ││  Quizzes  ││         │
                              └─────────────┘│         ││  Override ││         │
                                             │         │└───────────┘│         │
                              ┌──────────────┐│         │             │         │
                              │   Codelab    ││         │             │         │
                              │              ││         │             │         │
                              │  Submissions ││         │             │         │
                              │  TestCases   ││         │             │         │
                              │  Templates   ││         │             │         │
                              │  Hints       ││         │             │         │
                              │  HintReveals ││         │             │         │
                              └──────────────┘│         │             │         │
                                             └─────────┘             │         │
                              ┌──────────────┐                       │         │
                              │   Theory     │                       │         │
                              │   Articles   │                       │         │
                              │   Versions   │                       │         │
                              └──────────────┘                       │         │
                                                                     │         │
                              ┌──────────────┐┌──────────────┐       │         │
                              │  Knowledge   ││   System     │       │         │
                              │   Graph      ││   Audit      │       │         │
                              │  (Nodes +    ││  (Events +   │       │         │
                              │   Edges)     ││   Logs)      │       │         │
                              └──────────────┘└──────────────┘       │         │
                                                                     │         │
                                             ┌───────────────────────┘         │
                                             │                                 │
                              ┌──────────────┐┌──────────────┐                 │
                              │ Notification ││  AuditLog    │                 │
                              └──────────────┘└──────────────┘                 │
                                                                               │
───────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. HƯỚNG DẪN CHI TIẾT 40 TABLE

### 🏘️ NHÓM 1: NGƯỜI DÙNG & XÁC THỰC (5 tables)

---

#### 1.1. `Users` — Bảng Người dùng trung tâm
```sql
CREATE TABLE Users (
    Id               UUID PRIMARY KEY,
    Email            VARCHAR NOT NULL UNIQUE,
    Username         VARCHAR NOT NULL UNIQUE,
    PasswordHash     VARCHAR NOT NULL,
    CreatedAt        TIMESTAMPTZ NOT NULL,
    LastLoginAt      TIMESTAMPTZ,
    TotalXP          INTEGER DEFAULT 0,
    CurrentLevel     INTEGER DEFAULT 1,
    StreakDays       INTEGER DEFAULT 0,
    IsPremium        BOOLEAN DEFAULT FALSE,
    Role             VARCHAR DEFAULT 'Student',  -- Student/Teacher/Admin
    IsActive         BOOLEAN DEFAULT TRUE,
    LastActivityDate TIMESTAMPTZ,
    Nickname         VARCHAR,
    Bio              VARCHAR,
    University       VARCHAR
);
```
**Lý do tạo**: 
- Là **hub trung tâm** của toàn bộ hệ thống — mọi entity khác đều liên quan đến User
- Lưu trạng thái gamification (XP, Level, Streak) ngay trong bảng User để query nhanh
- Phân quyền 3 role trong 1 bảng thay vì tách riêng → đơn giản hơn cho authorization

**Quan hệ**:
- 1-N → Badges (qua UserBadge)
- 1-N → Courses (Teacher tạo)
- 1-N → Classrooms (Owner)
- 1-N → Orders (Mua Premium)
- 1-N → QuizAttempts, CodelabSubmissions
- 1-N → LearningProgresses, UserLessonProgresses
- 1-N → RefreshTokens, Notifications, AuditLogs

---

#### 1.2. `Badges` — Bảng Huy hiệu
```sql
CREATE TABLE Badges (
    Id          UUID PRIMARY KEY,
    Name        VARCHAR NOT NULL,
    Description VARCHAR,
    Icon        VARCHAR,
    Color       VARCHAR,
    Criteria    VARCHAR  -- JSON điều kiện đạt badge
);

CREATE TABLE UserBadges (
    Id      UUID PRIMARY KEY,
    UserId  UUID NOT NULL REFERENCES Users(Id),
    BadgeId UUID NOT NULL REFERENCES Badges(Id),
    EarnedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Gamification**: Động viên học tập qua hệ thống thành tựu
- Tách riêng Badge và UserBadges (N-M relationship) → một badge có thể có nhiều người đạt, một người có nhiều badge
- `Criteria` lưu JSON điềi kiện (VD: `{ "type": "xp_threshold", "value": 500 }`)

---

#### 1.3. `RefreshTokens` — Bảng Token làm mới
```sql
CREATE TABLE RefreshTokens (
    Id        UUID PRIMARY KEY,
    UserId    UUID NOT NULL REFERENCES Users(Id),
    Token     VARCHAR NOT NULL UNIQUE,
    ExpiresAt TIMESTAMPTZ NOT NULL,
    CreatedAt TIMESTAMPTZ NOT NULL,
    RevokedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Security**: Refresh token phải lưu DB để có thể revoke khi cần
- JWT access token không lưu DB (stateless), nhưng refresh token cần kiểm soát
- Hỗ trợ logout, force revoke khi phát hiện bất thường

---

#### 1.4. `AuditLogs` — Bảng Nhật ký Kiểm toán
```sql
CREATE TABLE AuditLogs (
    Id        UUID PRIMARY KEY,
    UserId    UUID REFERENCES Users(Id),
    Action    VARCHAR NOT NULL,
    EntityType VARCHAR,
    EntityId  UUID,
    OldValues VARCHAR,  -- JSON
    NewValues VARCHAR,  -- JSON
    Timestamp TIMESTAMPTZ NOT NULL
);
```
**Lý do tạo**:
- **Compliance**: Theo dõi mọi thay đổi quan trọng (tạo/sửa/xóa quiz, course, user)
- Debug khi có sự cố nghiệp vụ
- Yêu cầu của hệ thống Admin → Teacher → Student

---

#### 1.5. `Notifications` — Bảng Thông báo
```sql
CREATE TABLE Notifications (
    Id        UUID PRIMARY KEY,
    UserId    UUID NOT NULL REFERENCES Users(Id),
    Content   VARCHAR NOT NULL,
    Type      VARCHAR,  -- Quiz/Unlock/Streak/System
    IsRead    BOOLEAN DEFAULT FALSE,
    LinkUrl   VARCHAR,
    CreatedAt TIMESTAMPTZ NOT NULL
);
```
**Lý do tạo**:
- **Engagement**: Thông báo quiz mới, huy hiệu đạt được, streak sắp hết
- Real-time qua SignalR + lưu DB để hiển thị lại khi offline

---

### 🏘️ NHÓM 2: KHÓA HỌC & BÀI HỌC (7 tables)

---

#### 2.1. `Courses` — Bảng Khóa học
```sql
CREATE TABLE Courses (
    Id              UUID PRIMARY KEY,
    TeacherId       UUID REFERENCES Users(Id),
    Title           VARCHAR NOT NULL,
    Description     VARCHAR,
    Category        VARCHAR NOT NULL,  -- Sorting/Graph/OOP/SOLID...
    Difficulty      VARCHAR NOT NULL,  -- Beginner/Intermediate/Advanced
    IsPremium       BOOLEAN DEFAULT FALSE,
    CoverImageUrl   VARCHAR,
    IsPublished     BOOLEAN DEFAULT FALSE,
    CreatedAt       TIMESTAMPTZ,
    IsDeleted       BOOLEAN DEFAULT FALSE
);
```
**Lý do tạo**:
- **Nghiệp vụ cốt lõi**: GV tạo khóa học, học viên enroll
- `IsPremium` → cần mới xem được (business model)
- `IsPublished` → draft/trình duyệt trước khi public
- `IsDeleted` → soft delete, giữ data khi GV xóa nhầm

---

#### 2.2. `CourseModules` — Bảng Module trong Khóa học
```sql
CREATE TABLE CourseModules (
    Id          UUID PRIMARY KEY,
    CourseId    UUID NOT NULL REFERENCES Courses(Id),
    Title       VARCHAR NOT NULL,
    Description VARCHAR,
    OrderIndex  INTEGER NOT NULL
);
```
**Lý do tạo**:
- **Cấu trúc phân cấp**: Course → Module → Lesson/Quiz
- `OrderIndex` → sắp xếp thứ tự hiển thị
- Tách module riêng để có thể reuse (Classroom có thể import)

---

#### 2.3. `Lessons` — Bảng Bài học
```sql
CREATE TABLE Lessons (
    Id                UUID PRIMARY KEY,
    Title             VARCHAR NOT NULL,
    ContentMd         TEXT NOT NULL,  -- Markdown content
    SandboxType       VARCHAR,        -- sorting/graph/oop/solid/dsa
    SandboxConfig     VARCHAR,        -- JSON config cho visualizer
    XPReward          INTEGER DEFAULT 0,
    CreatedAt         TIMESTAMPTZ,
    CreatedByTeacherId UUID,
    PublishStatus     VARCHAR DEFAULT 'Draft',
    IsDeleted         BOOLEAN
);
```
**Lý do tạo**:
- **Nội dung học tập**: Lưu markdown + config visualizer
- `SandboxType` + `SandboxConfig` → xác định loại visualizer (Bubble Sort? Graph BFS?)
- `XPReward` → incentive hoàn thành bài
- `PublishStatus` → Draft → Review → Published workflow

---

#### 2.4. `ModuleItems` — Bảng Item trong Module
```sql
CREATE TABLE ModuleItems (
    Id              UUID PRIMARY KEY,
    ModuleId        UUID NOT NULL REFERENCES CourseModules(Id),
    LessonId        UUID REFERENCES Lessons(Id),
    QuizId          UUID REFERENCES Quizzes(Id),
    ItemType        VARCHAR NOT NULL,  -- Lesson/Quiz/Codelab
    OrderIndex      INTEGER,
    IsRequired      BOOLEAN DEFAULT TRUE
);
```
**Lý do tạo**:
- **Composite pattern**: Module chứa cả Lesson, Quiz, Codelab
- `ItemType` → polymorphic, xác định loại item
- `IsRequired` → bắt buộc hay optional

---

#### 2.5. `UserLessonProgresses` — Bảng Tiến độ Bài học
```sql
CREATE TABLE UserLessonProgresses (
    Id                    UUID PRIMARY KEY,
    UserId                UUID NOT NULL REFERENCES Users(Id),
    LessonId              UUID NOT NULL REFERENCES Lessons(Id),
    HasWatchedVisualizer  BOOLEAN DEFAULT FALSE,
    QuizScore             INTEGER,
    CodelabCompleted      BOOLEAN DEFAULT FALSE,
    XPAwarded             INTEGER DEFAULT 0,
    CompletedAt           TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Tracking**: Theo dõi tiến độ từng học viên trong từng bài
- `HasWatchedVisualizer` → đã xem visualizer chưa
- `QuizScore` → điểm quiz cuối bài
- `CodelabCompleted` → đã làm code lab chưa
- `XPAwarded` → tránh trùng lặp thưởng XP

---

#### 2.6. `UserModuleItemProgresses` — Bảng Tiến độ Item
```sql
CREATE TABLE UserModuleItemProgresses (
    Id              UUID PRIMARY KEY,
    UserId          UUID NOT NULL REFERENCES Users(Id),
    ModuleItemId    UUID NOT NULL REFERENCES ModuleItems(Id),
    Status          VARCHAR DEFAULT 'NotStarted',  -- NotStarted/InProgress/Completed
    CompletedAt     TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Fine-grained tracking**: Tiến độ chi tiết từng item (Lesson/Quiz/Codelab) trong module
- `Status` → NotStarted / InProgress / Completed

---

#### 2.7. `LessonComments` — Bảng Bình luận Bài học
```sql
CREATE TABLE LessonComments (
    Id        UUID PRIMARY KEY,
    LessonId  UUID NOT NULL REFERENCES Lessons(Id),
    UserId    UUID NOT NULL REFERENCES Users(Id),
    Content   TEXT NOT NULL,
    ParentId  UUID REFERENCES LessonComments(Id),  -- nested reply
    CreatedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Cộng đồng học tập**: Hỏi đáp, thảo luận trong bài
- `ParentId` → self-referencing cho nested comments (reply)

---

### 🏘️ NHÓM 3: QUIZ & TRẮC NGHIỆM (5 tables)

---

#### 3.1. `Quizzes` — Bảng Quiz
```sql
CREATE TABLE Quizzes (
    Id          UUID PRIMARY KEY,
    Title       VARCHAR NOT NULL,
    Description VARCHAR,
    Topic       VARCHAR NOT NULL,    -- sorting/graph/oop...
    Difficulty  INTEGER NOT NULL,    -- 1-5
    XPReward    INTEGER DEFAULT 0,
    IsDeleted   BOOLEAN DEFAULT FALSE
);
```
**Lý do tạo**:
- **Kiểm tra kiến thức**: Quiz độc lập (dùng trong E-Lecture checkpoint hoặc standalone)
- `Topic` → phân loại theo DSA topic
- `Difficulty` → 1-5 scale

---

#### 3.2. `QuizQuestions` — Bảng Câu hỏi Quiz
```sql
CREATE TABLE QuizQuestions (
    Id             UUID PRIMARY KEY,
    QuizId         UUID NOT NULL REFERENCES Quizzes(Id),
    QuestionText   VARCHAR NOT NULL,
    Options        VARCHAR NOT NULL,  -- JSON array
    CorrectIndex   INTEGER NOT NULL,
    Explanation    VARCHAR
);
```
**Lý do tạo**:
- **1 Quiz : N Questions** → tách riêng để dễ CRUD câu hỏi
- `Options` lưu JSON array → linh hoạt số lượng đáp án
- `Explanation` → giải thích đáp án đúng sau nộp

---

#### 3.3. `QuizAttempts` — Bảng Lần làm Quiz
```sql
CREATE TABLE QuizAttempts (
    Id        UUID PRIMARY KEY,
    UserId    UUID NOT NULL REFERENCES Users(Id),
    QuizId    UUID NOT NULL REFERENCES Quizzes(Id),
    Score     INTEGER,
    MaxScore  INTEGER,
    XPAwarded INTEGER,
    IsPassed  BOOLEAN,
    Answers   VARCHAR,  -- JSON { questionId: selectedIndex }
    SubmittedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **History**: Lưu lại từng lần làm quiz (retry allowed)
- `Answers` JSON → xem lại đáp án đã chọn
- `XPAwarded` → tránh trùng thưởng XP

---

#### 3.4. `QuizXpGrants` — Bảng Thưởng XP Quiz
```sql
CREATE TABLE QuizXpGrants (
    Id              UUID PRIMARY KEY,
    UserId          UUID NOT NULL REFERENCES Users(Id),
    QuizId          UUID NOT NULL REFERENCES Quizzes(Id),
    XPAmount        INTEGER NOT NULL,
    AwardedAt       TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Idempotence**: Đảm bảo không thưởng XP trùng lặp cùng một quiz
- Unique constraint on (UserId, QuizId) → mỗi user chỉ nhận XP 1 lần/quiz

---

#### 3.5. `ClassroomQuizzes` — Bảng Quiz trong Lớp học
```sql
CREATE TABLE ClassroomQuizzes (
    Id           UUID PRIMARY KEY,
    ClassroomId  UUID NOT NULL REFERENCES Classrooms(Id),
    QuizId       UUID NOT NULL REFERENCES Quizzes(Id),
    DueDate      TIMESTAMPTZ,
    CreatedAt    TIMESTAMPTZ
);

CREATE TABLE ClassroomQuizAttempts (
    Id        UUID PRIMARY KEY,
    UserId    UUID NOT NULL REFERENCES Users(Id),
    QuizId    UUID NOT NULL REFERENCES Quizzes(Id),
    Score     INTEGER,
    SubmittedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Context riêng**: Quiz trong lớp học có deadline, attempt riêng
- `DueDate` → deadline nộp bài
- Tách riêng `ClassroomQuizAttempts` để tracking theo lớp

---

### 🏘️ NHÓM 4: LỚP HỌC (7 tables)

---

#### 4.1. `Classrooms` — Bảng Lớp học
```sql
CREATE TABLE Classrooms (
    Id                    UUID PRIMARY KEY,
    Name                  VARCHAR NOT NULL,
    Description           VARCHAR,
    OwnerTeacherId        UUID NOT NULL REFERENCES Users(Id),
    CourseId              UUID REFERENCES Courses(Id),  -- optional base course
    ImportedFromCourseId  UUID,
    InviteCode            VARCHAR NOT NULL UNIQUE,
    IsArchived            BOOLEAN DEFAULT FALSE,
    CreatedAt             TIMESTAMPTZ,
    InviteCodeExpiresAt   TIMESTAMPTZ,
    MaxEnrollmentCapacity INTEGER
);
```
**Lý do tạo**:
- **Nghiệp vụ GV**: GV tạo lớp, share invite code cho học viên
- `InviteCode` → join lớp bằng code (unique)
- `CourseId` → lớp có thể dựa trên khóa học có sẵn
- `MaxEnrollmentCapacity` → giới hạn số lượng học viên

---

#### 4.2. `ClassroomEnrollments` — Bảng Ghi danh Lớp học
```sql
CREATE TABLE ClassroomEnrollments (
    Id           UUID PRIMARY KEY,
    ClassroomId  UUID NOT NULL REFERENCES Classrooms(Id),
    UserId       UUID NOT NULL REFERENCES Users(Id),
    EnrolledAt   TIMESTAMPTZ,
    IsActive     BOOLEAN DEFAULT TRUE
);
```
**Lý do tạo**:
- **N-M relationship**: 1 lớp có nhiều học viên, 1 học viên tham gia nhiều lớp
- Unique (ClassroomId, UserId) → không enroll trùng

---

#### 4.3. `ClassroomLessons` — Bảng Bài học trong Lớp
```sql
CREATE TABLE ClassroomLessons (
    Id          UUID PRIMARY KEY,
    ClassroomId UUID NOT NULL REFERENCES Classrooms(Id),
    LessonId    UUID REFERENCES Lessons(Id),
    OrderIndex  INTEGER,
    UnlockAt    TIMESTAMPTZ  -- scheduled unlock
);
```
**Lý do tạo**:
- **Scheduling**: Bài học có thể unlock theo lịch (drip content)
- Tách riêng để lớp có thể customize thứ tự bài

---

#### 4.4. `ClassroomModules` — Bảng Module trong Lớp
```sql
CREATE TABLE ClassroomModules (
    Id          UUID PRIMARY KEY,
    ClassroomId UUID NOT NULL REFERENCES Classrooms(Id),
    ModuleId    UUID REFERENCES CourseModules(Id),
    Title       VARCHAR,
    OrderIndex  INTEGER
);
```
**Lý do tạo**:
- **Customization**: GV có thể tạo module riêng cho lớp, không bám sổ course gốc
- `ModuleId` nullable → có thể tạo module mới hoặc import từ course

---

#### 4.5. `ClassroomModuleItems` — Bảng Item trong Module Lớp
```sql
CREATE TABLE ClassroomModuleItems (
    Id          UUID PRIMARY KEY,
    ModuleId    UUID NOT NULL REFERENCES ClassroomModules(Id),
    ItemType    VARCHAR,  -- Lesson/Quiz/Codelab
    LessonId    UUID,
    QuizId      UUID,
    OrderIndex  INTEGER
);
```
**Lý do tạu**:
- **Flexibility**: GV tùy chỉnh items trong module lớp
- Có thể trỏ đến Lesson/Quiz/Codelab global hoặc tạo mới

---

#### 4.6. `ClassroomModuleItemOverrides` — Bảng Override Item
```sql
CREATE TABLE ClassroomModuleItemOverrides (
    Id              UUID PRIMARY KEY,
    ModuleItemId    UUID NOT NULL REFERENCES ClassroomModuleItems(Id),
    ClassroomId     UUID NOT NULL REFERENCES Classrooms(Id),
    OverrideTitle   VARCHAR,
    OverrideDescription VARCHAR,
    CustomXP        INTEGER
);
```
**Lý do tạo**:
- **Per-classroom customization**: GV muốn đổi title/XP riêng cho lớp mình
- Không ảnh hưởng đến dữ liệu gốc → override pattern

---

#### 4.7. `ClassroomAnnouncements` — Bảng Thông báo Lớp học
```sql
CREATE TABLE ClassroomAnnouncements (
    Id          UUID PRIMARY KEY,
    ClassroomId UUID NOT NULL REFERENCES Classrooms(Id),
    Title       VARCHAR NOT NULL,
    Content     TEXT,
    CreatedAt   TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Communication**: GV gửi thông báo đến toàn lớp
- Khác Notification hệ thống → chỉ trong context lớp học

---

### 🏘️ NHÓM 5: CODELAB (6 tables)

---

#### 5.1. `Codelabs` — Bảng Bài thực hành Code
```sql
CREATE TABLE Codelabs (
    Id               UUID PRIMARY KEY,
    Title            VARCHAR NOT NULL,
    Description      VARCHAR,
    InitialCode      VARCHAR,       -- starter code
    Difficulty       INTEGER,
    XPReward         INTEGER,
    OwnerId          UUID REFERENCES Users(Id),
    Constraints      VARCHAR,       -- time/memory limits
    Examples         VARCHAR,       -- JSON examples
    Tags             VARCHAR,
    MaxRuntimeMs     INTEGER DEFAULT 2000,
    MaxMemoryBytes   INTEGER DEFAULT 128000000,
    AllowedLanguages VARCHAR DEFAULT 'csharp,python,java,javascript'
);
```
**Lý do tạo**:
- **Nghiệp vụ cốt lõi**: Học viên viết code → chấm qua Piston API
- `MaxRuntimeMs` + `MaxMemoryBytes` → giới hạn resource khi chạy code
- `AllowedLanguages` → hỗ trợ đa ngôn ngữ

---

#### 5.2. `CodelabTestCases` — Bảng Test Case
```sql
CREATE TABLE CodelabTestCases (
    Id          UUID PRIMARY KEY,
    CodelabId   UUID NOT NULL REFERENCES Codelabs(Id),
    Input       VARCHAR,
    ExpectedOutput VARCHAR,
    IsHidden    BOOLEAN DEFAULT FALSE,  -- hidden test cuối
    Description VARCHAR
);
```
**Lý do tạo**:
- **Auto-grading**: Input → run code → compare output với ExpectedOutput
- `IsHidden` → test case ẩn (không hiển thị cho học viên)

---

#### 5.3. `CodelabSubmissions` — Bảng Bài nộp Codelab
```sql
CREATE TABLE CodelabSubmissions (
    Id           UUID PRIMARY KEY,
    UserId       UUID NOT NULL REFERENCES Users(Id),
    CodelabId    UUID NOT NULL REFERENCES Codelabs(Id),
    SourceCode   TEXT NOT NULL,
    Language     VARCHAR,
    Status       VARCHAR,  -- Pending/Running/Completed/Error
    Score        INTEGER,
    RuntimeMs    INTEGER,
    MemoryBytes  INTEGER,
    SubmittedAt  TIMESTAMPTZ
);
```
**Lý do tạo**:
- **History**: Lưu mọi lần submit code
- `Status` → track trạng thái chấm (Piston API bất đồng bộ)
- `Score`/`RuntimeMs`/`MemoryBytes` → kết quả chấm

---

#### 5.4. `CodelabTemplates` — Bảng Template Codelab
```sql
CREATE TABLE CodelabTemplates (
    Id              UUID PRIMARY KEY,
    CodelabId       UUID NOT NULL REFERENCES Codelabs(Id),
    Language        VARCHAR NOT NULL,
    StarterCode     VARCHAR NOT NULL,
    ExpectedOutput  VARCHAR
);
```
**Lý do tạo**:
- **Đa ngôn ngữ**: Cùng 1 codelab có starter code khác nhau cho từng language
- Học viên chọn Python/Java/JS → load template tương ứng

---

#### 5.5. `CodelabHints` — Bảng Gợi ý Codelab
```sql
CREATE TABLE CodelabHints (
    Id         UUID PRIMARY KEY,
    CodelabId  UUID NOT NULL REFERENCES Codelabs(Id),
    Content    VARCHAR NOT NULL,
    Tier       INTEGER,  -- 1/2/3 progressive hint
    XPCost     INTEGER DEFAULT 0  -- trả XP để xem hint
);
```
**Lý do tạo**:
- **Progressive disclosure**: Hint tier 1 → 2 → 3 dần dần rõ hơn
- `XPCost` → trade-off: xem hint bị trừ XP (encourage tự giải)

---

#### 5.6. `CodelabHintReveals` — Bảng Lịch sử mở Hint
```sql
CREATE TABLE CodelabHintReveals (
    Id        UUID PRIMARY KEY,
    UserId    UUID NOT NULL REFERENCES Users(Id),
    HintId    UUID NOT NULL REFERENCES CodelabHints(Id),
    RevealedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Tracking**: Đã mở hint nào, trừ XP bao nhiêu
- Unique (UserId, HintId) → không trừ XP trùng

---

### 🏘️ NHÓM 6: THANH TOÁN & HỆ THỐNG (4 tables)

---

#### 6.1. `Orders` — Bảng Đơn hàng
```sql
CREATE TABLE Orders (
    Id                   UUID PRIMARY KEY,
    UserId               UUID NOT NULL REFERENCES Users(Id),
    PaymentCode          VARCHAR NOT NULL,  -- mã chuyển khoản
    TransactionReference VARCHAR,
    Amount               DECIMAL NOT NULL,
    Status               VARCHAR DEFAULT 'Pending',  -- Pending/Completed/Failed
    CreatedAt            TIMESTAMPTZ,
    CompletedAt          TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Business model**: Premium account (199,000đ lifetime)
- `PaymentCode` → mã VietQR chuyển khoản
- `Status` → tracking trạng thái thanh toán

---

#### 6.2. `SemanticConceptNodes` — Bảng Node Đồ thị Kiến thức
```sql
CREATE TABLE SemanticConceptNodes (
    Id         UUID PRIMARY KEY,
    Name       VARCHAR NOT NULL,      -- "Bubble Sort"
    Type       VARCHAR NOT NULL,      -- Algorithm/DataStructure/Concept
    Description VARCHAR,
    Difficulty VARCHAR
);

CREATE TABLE KnowledgeEdges (
    Id          UUID PRIMARY KEY,
    SourceId    UUID NOT NULL REFERENCES SemanticConceptNodes(Id),
    TargetId    UUID NOT NULL REFERENCES SemanticConceptNodes(Id),
    RelationType VARCHAR  -- Prerequisite/Related/Extends
);
```
**Lý do tạo**:
- **Knowledge Graph**: Mô tả quan hệ giữa các khái niệm DSA
- `RelationType` → Prerequisite (cần học trước), Related, Extends
- Hiển thị trong trang Theory kiểu mindmap

---

#### 6.3. `SystemAuditEventStream` — Bảng Event Stream Hệ thống
```sql
CREATE TABLE SystemAuditEventStream (
    Id        UUID PRIMARY KEY,
    EventType VARCHAR NOT NULL,
    Payload   VARCHAR,  -- JSON
    CreatedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Event Sourcing**: Log tất cả sự kiện hệ thống
- Debug, replay events, phân tích hành vi

---

#### 6.4. `LearningProgresses` — Bảng Tiến độ Học tập (Domain)
```sql
CREATE TABLE LearningProgresses (
    Id          UUID PRIMARY KEY,
    UserId      UUID NOT NULL REFERENCES Users(Id),
    EntityType  VARCHAR,  -- Course/Module/Lesson
    EntityId    UUID,
    ProgressPercent INTEGER,
    CompletedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Generic progress tracking**: Áp dụng cho Course/Module/Lesson
- `EntityType` + `EntityId` → polymorphic tracking

---

### 🏘️ NHÓM 7: LÝ THUYẾT & BÀI VIẾT (3 tables)

---

#### 7.1. `TheoryArticles` — Bảng Bài viết Lý thuyết
```sql
CREATE TABLE TheoryArticles (
    Id         UUID PRIMARY KEY,
    Title      VARCHAR NOT NULL,
    Content    TEXT,
    Category   VARCHAR,  -- OOP/SOLID/Patterns/DI
    AuthorId   UUID REFERENCES Users(Id),
    CreatedAt  TIMESTAMPTZ
);

CREATE TABLE TheoryArticleVersions (
    Id        UUID PRIMARY KEY,
    ArticleId UUID NOT NULL REFERENCES TheoryArticles(Id),
    Content   TEXT,
    Version   INTEGER,
    CreatedAt TIMESTAMPTZ
);

CREATE TABLE LessonTheoryArticles (
    Id        UUID PRIMARY KEY,
    LessonId  UUID NOT NULL REFERENCES Lessons(Id),
    ArticleId UUID NOT NULL REFERENCES TheoryArticles(Id)
);
```
**Lý do tạo**:
- **Content management**: Bài viết lý thuyết cho mỗi concept (OOP, SOLID...)
- `TheoryArticleVersions` → version control (GV có thể sửa, giữ lịch sử)
- `LessonTheoryArticles` → liên kết article vào lesson

---

### 🏘️ NHÓM 8: REVIEW & ĐÁNH GIÁ (1 table)

---

#### 8.1. `LessonReviews` — Bảng Đánh giá Bài học
```sql
CREATE TABLE LessonReviews (
    Id        UUID PRIMARY KEY,
    LessonId  UUID NOT NULL REFERENCES Lessons(Id),
    UserId    UUID NOT NULL REFERENCES Users(Id),
    Rating    INTEGER,  -- 1-5 stars
    Comment   VARCHAR,
    CreatedAt TIMESTAMPTZ
);
```
**Lý do tạo**:
- **Feedback loop**: Học viên đánh giá chất lượng bài học
- GV cải thiện content dựa trên rating

---

## 5. LUỒNG NGHIỆP VỤ CHÍNH

### 🔄 Flow 1: Học viên học bài mới
```
1. Student mở /courses → CoursesListView render danh sách
2. Click khóa học → CourseDetailView load modules + lessons
3. Click bài học → LessonStudyView:
   a. LessonStepTheory: đọc markdown
   b. LessonStepViz: xem visualizer 60 FPS
   c. LessonStepQuiz: làm quiz → submit → chấm điểm → nhận XP
   d. LessonStepCodeLab: viết code → submit → Piston chấm → PASS/FAIL
4. Hoàn thành → LessonCompletionModal → cộng XP + cập nhật User.TotalXP
5. Kiểm tra level up → nếu đủ threshold → level mới
6. Kiểm tra badge unlock → nếu đủ criteria → mở badge + confetti
```

### 🔄 Flow 2: Giảng viên tạo Quiz
```
1. Teacher mở /teacher → TeacherPanelView
2. Tab "Tạo Quiz" → QuizBuilderTab:
   a. Nhập title, topic, difficulty, XP reward
   b. Thêm câu hỏi (question, options, correct index, explanation)
   c. Submit → POST /api/v1/quizzes → tạo Quiz + QuizQuestions
3. Quiz xuất hiện trong ngân hàng quiz (Admin quản lý)
```

### 🔄 Flow 3: Học viên làm Quiz trong bài giảng
```
1. E-Lecture play → đến checkpoint → QuizCardOverlay hiện lên
2. Student chọn đáp án → hiển thị correct/incorrect + explanation
3. Click "Tiếp tục" → tiếp tục phát hoạt ảnh
4. Kết thúc lecture → tổng kết điểm + XP
```

### 🔄 Flow 4: Thanh toán Premium
```
1. User click "Nâng cấp Premium" → /checkout
2. POST /api/v1/payments/create-order → tạo Order + PaymentCode
3. Hiển thị QR VietQR + đếm ngược
4. Poll /api/v1/payments/check-status mỗi 5s
5. Khi bank confirm → Order.Status = "Completed" → User.IsPremium = true
6. Hiển thị CheckoutSuccessScreen
```

### 🔄 Flow 5: Quản lý Lớp học
```
1. Teacher tạo Classroom → tạo InviteCode
2. Share code cho học viên
3. Student join bằng code → ClassroomEnrollment
4. Teacher quản lý:
   - Thêm/bớt bài học (ClassroomLessons)
   - Override item riêng (ClassroomModuleItemOverrides)
   - Gửi thông báo (ClassroomAnnouncements)
   - Xem analytics (TeacherAnalyticsTab)
```

### 🔄 Flow 6: Gamification Loop
```
1. Student hoàn thành activity → nhận XP
2. User.TotalXP cập nhật → kiểm tra level threshold
3. Level up → Notification + confetti
4. Kiểm tra badge criteria → nếu đủ → mở badge
5. Streak tracking: mỗi ngày học → StreakDays++
6. Streak đạt threshold → mở streak badge
```

---

## 📊 THỐNG KÊ TỔNG HỢP

| Nhóm nghiệp vụ | Số Table | Mô tả |
|---|---|---|
| User & Auth | 5 | Users, Badges, UserBadges, RefreshTokens, AuditLogs |
| Course & Lesson | 7 | Courses, CourseModules, Lessons, ModuleItems, Progresses |
| Quiz & Attempt | 5 | Quizzes, QuizQuestions, QuizAttempts, QuizXpGrants, ClassroomQuiz |
| Classroom | 7 | Classrooms, Enrollments, Lessons, Modules, Items, Overrides, Announcements |
| Codelab | 6 | Codelabs, TestCases, Submissions, Templates, Hints, HintReveals |
| Payment & System | 4 | Orders, Notifications, SemanticConceptNodes, KnowledgeEdges |
| Theory & Review | 3 | TheoryArticles, Versions, LessonReviews |
| **TỔNG** | **40** | |

---

> 💡 **Lưu ý**: Các table `concept-sandbox` (OOP/SOLID/Patterns) hiện **chưa có implementation** — chỉ có plan files. Khi implement, sẽ cần thêm tables cho visualization state, animation frames, concept relationships.
