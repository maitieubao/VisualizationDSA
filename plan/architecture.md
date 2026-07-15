# 🏛️ Kiến Trúc Tổng Thể Hệ Thống - System Architecture Blueprint

Tài liệu này đặc tả chi tiết kiến trúc phân tầng, cơ cấu thư mục chi tiết từ mức tệp tin và luồng luân chuyển dữ liệu hạt nhân trong dự án **VisualizationDSA**.

---

## 1. Sơ Đồ Kiến Trúc Phân Tầng (Layered Architecture Blueprint)

Hệ thống được thiết kế theo mô hình **Client-First Architecture**, tối đa hóa năng lực xử lý ở máy khách dưới 5ms để loại bỏ độ trễ mạng và giảm tải máy chủ:

```
+-----------------------------------------------------------------------+
|                        Premium Glassmorphic UI                        |
|              (Vue 3 Composition API + Pinia Stores)                   |
+------------------------------------+----------------------------------+
                                     |
                                     v
+------------------------------------+----------------------------------+
|                     Monaco Editor Code Sync Shell                     |
|           (Monaco Editor + MonacoGutterClickInterceptor)              |
+------------------------------------+----------------------------------+
                                     |
                                     v
+------------------------------------+----------------------------------+
|                  Core Anim Engine (rAF 60 FPS)                        |
|          (Vector Lerp Point + CompilerStepExecutor AST)               |
+------------------------------------+----------------------------------+
                                     |
                                     v
+------------------------------------+----------------------------------+
|                Offscreen Double Buffered Render Layer                 |
|     (Canvas 2D: Bars, Nodes, Smoke Particles | SVG: Bezier Pointer)   |
+------------------------------------+----------------------------------+
                                     |  HTTPS JWT
                                     v
+------------------------------------+----------------------------------+
|               RESTful Web API Services (C# Backend)                   |
|             (ASP.NET Core Controllers + EF Core Mapper)               |
+------------------------------------+----------------------------------+
                                     |
                                     v
+------------------------------------+----------------------------------+
|                  Relational Database Storage                          |
|             (PostgreSQL Tables + Supabase Pooler)                     |
+-----------------------------------------------------------------------+
```

---

## 2. Các Thành Phần Hạt Nhân Cốt Lõi (Core Components)

### 2.1. Lớp Trình Bày (Glassmorphic Presentation Layer)
*   **Vue 3 Composition API:** Quản lý vòng đời Component, cô lập mã nguồn và tăng cường khả năng tái sử dụng.
*   **Pinia Store System:** Lưu trữ trạng thái VCR Playback thời gian thực và tiến trình người học.
*   **HSL Neon CSS Variables:** Định hình bảng Slate tối, viền mờ 8% trắng và bóng đổ Neon lung linh phản ánh đúng trạng thái vật lý (`--neon-cyan`, `--neon-emerald`, `--neon-amber`, `--neon-crimson`).

### 2.2. Lớp Động Cơ Hoạt Ảnh (Core Engine Layer)
*   **requestAnimationFrame (rAF Loop):** Kích hoạt xung nhịp 60 FPS đều đặn bám sát phần cứng màn hình, tối ưu hóa CPU máy khách.
*   **Vector Lerp Point:** Phép toán nội suy Vector di chuyển các phần tử mảng và nút cây mượt mà:
    $$\vec{P}_{new} = \vec{P}_{current} + (\vec{P}_{target} - \vec{P}_{current}) \times \text{lerpFactor}$$
*   **Offscreen Canvas Double Buffering:** Tạo luồng vẽ đệm vô hình ở RAM trước khi đẩy ra màn hình giúp chống giật chớp hình hoàn hảo.

### 2.3. Lớp Dịch Vụ Máy Chủ (Web API & Db Storage)
*   **C# ASP.NET Core:** Cung cấp API RESTful gọn nhẹ, xử lý xác thực JWT bảo mật, chống gian lận nộp bài và lưu trữ tiến trình thông minh.
*   **PostgreSQL Database:** Lưu trữ thông tin người dùng, tiến trình thăng hạng XP, danh sách bài trắc nghiệm và các cấu hình Iframe nhúng.

---

## 3. Kiến Trúc Thư Mục Chi Tiết Dự Án (Detailed Directory Structure)

Dự án được tách biệt hoàn toàn giữa hai thành phần: Client (Frontend) viết bằng **Vue 3 + Vite + TypeScript** và Server (Backend) viết bằng **C# ASP.NET Core** áp dụng mô hình kiến trúc sạch (Clean Architecture).

### 3.1. Cấu Trúc Frontend (Vue 3 + Vite + TS)

```
c:\Users\maiti\OneDrive\Desktop\LearningEnglishApp\VisualizationDSA\frontend\
├── .gitignore                   # Cấu hình bỏ qua tệp tin trong hệ thống Git
├── .vscode/                     # Cấu hình môi trường làm việc VS Code
│   ├── extensions.json          # Các extension được khuyên dùng (Volar, ESLint)
│   └── settings.json            # Cấu hình editor (Format on Save, TS SDK)
├── index.html                   # Điểm khởi đầu HTML duy nhất (SPA Entry Point)
├── package.json                 # Định nghĩa các thư viện phụ thuộc và scripts chạy (dev, build, test)
├── package-lock.json            # Bản khóa chi tiết phiên bản các package npm
├── tsconfig.json                # Cấu hình chung cho dự án TypeScript
├── tsconfig.app.json            # Cấu hình TypeScript cho ứng dụng client-side
├── tsconfig.node.json           # Cấu hình TypeScript cho Vite Dev Server
├── vite.config.ts               # Tệp cấu hình bundler Vite (plugins, aliases, dev port)
├── public/                      # Tài nguyên tĩnh được giữ nguyên khi build
│   ├── favicon.ico              # Biểu tượng ứng dụng
│   └── audio/                   # Phản hồi âm thanh vật lý cao cấp
│       ├── click-neon.wav       # Âm click nút giao diện
│       ├── success-xp.mp3       # Hiệu ứng âm thanh khi giải đúng quiz và nhận XP
│       └── compile-error.mp3    # Âm báo khi code Monaco lỗi biên dịch AST
└── src/                         # Mã nguồn chính của ứng dụng
    ├── main.ts                  # Khởi tạo Vue app, Pinia Store, router và gắn kết vào DOM
    ├── style.css                # Tệp CSS toàn cục (Định nghĩa biến HSL Neon theme, Glassmorphic classes)
    ├── App.vue                  # Component gốc (Thiết lập bố cục chính Split-Pane dạng kính mờ)
    ├── assets/                  # Hình ảnh Vector minh họa
    │   └── logo-neon.svg        # Logo thương hiệu phát sáng Neon
    ├── store/                   # Quản lý trạng thái ứng dụng toàn cục (Pinia Stores)
    │   ├── vcrStore.ts          # Trạng thái điều khiển VCR (speed, status: RUNNING/PAUSED, steps, currentStep)
    │   ├── userStore.ts         # Lưu thông tin JWT token, thông tin học viên, tiến trình XP, level
    │   └── algorithmStore.ts    # Lưu vết thuật toán hiện tại, mã nguồn Monaco và trạng thái biên dịch AST
    ├── components/              # Các thành phần giao diện tái sử dụng
    │   ├── AlgorithmCanvas.vue  # Canvas 2D vẽ đồ họa 60 FPS thuật toán, di chuyển Lerp và khói failover
    │   ├── CodeEditor.vue       # Monaco Editor bọc tùy biến, bắt sự kiện click Gutter dòng và đồng bộ lệnh
    │   ├── PseudocodeViewer.vue # Khung hiển thị mã giả cấu trúc, bôi sáng Cyan dòng mã giả đang chạy tương ứng
    │   ├── VcrControlPanel.vue  # Bảng nút điều khiển VCR Play/Pause/Forward/Backward/Seek-bar
    │   └── HelloWorld.vue       # Component chào mừng mặc định ban đầu
    └── core/                    # Động cơ hạt nhân logic phía Client
        ├── CompilerStepExecutor.ts # Phân tích AST, chạy từng bước thuật toán, sinh Snapshot bộ nhớ
        ├── CoreAnimationEngine.ts  # Lập lịch requestAnimationFrame, điều hướng Lerp di chuyển
        └── __tests__/           # Thư mục chứa các tệp kiểm thử tự động (Vitest Suite)
            ├── CompilerStepExecutor.spec.ts  # Test biên dịch AST và cơ cấu sinh Snapshot từng bước
            └── SOLIDLCOM4Calculator.spec.ts  # Test tính toán kết dính SRP bằng thuật toán BFS đồ thị
```

### 3.2. Cấu Trúc Backend Kế Hoạch (C# ASP.NET Core - Clean Architecture)

Để phục vụ quản lý dữ liệu lớn, xác thực và đồng bộ tiến trình của hàng ngàn học viên song song, dự án triển khai backend C# theo kiến trúc 4 tầng chuẩn Clean Architecture:

```
c:\Users\maiti\OneDrive\Desktop\LearningEnglishApp\VisualizationDSA\backend\
├── VisualizationDSA.sln                        # Tệp quản lý toàn bộ các dự án thành phần của Visual Studio
├── src/
│   ├── VisualizationDSA.Domain/                # LỚP HẠT NHÂN DOMAIN (Không phụ thuộc vào lớp nào khác)
│   │   ├── VisualizationDSA.Domain.csproj
│   │   ├── Entities/                           # Các thực thể nghiệp vụ cốt lõi ánh xạ database
│   │   │   ├── User.cs                         # Thông tin tài khoản người dùng
│   │   │   ├── UserProgress.cs                 # Lưu giữ Level, XP và lịch sử hoạt động học tập
│   │   │   ├── Algorithm.cs                    # Danh sách các thuật toán được quản lý (Bubble, Dijkstra...)
│   │   │   ├── Quiz.cs                         # Bài kiểm tra trắc nghiệm liên kết thuật toán
│   │   │   ├── QuizQuestion.cs                 # Các câu hỏi chi tiết của Quiz (nhiều lựa chọn/điền code)
│   │   │   ├── UserSubmission.cs               # Kết quả nộp bài, điểm số và mã nguồn của sinh viên
│   │   │   ├── EmbeddingWidget.cs              # Cấu hình iframe nhúng chia sẻ (theme, width, height...)
│   │   │   └── Achievement.cs                  # Định nghĩa các huy hiệu Neon để khen thưởng học viên
│   │   ├── Exceptions/                         # Custom Exception để kiểm soát lỗi nghiệp vụ sạch
│   │   │   ├── DomainException.cs
│   │   │   └── EntityNotFoundException.cs
│   │   └── ValueObjects/                       # Các đối tượng giá trị không có định danh độc lập
│   │       └── Dimension.cs                    # Bọc kích thước (Width, Height) của Widget nhúng
│   │
│   ├── VisualizationDSA.Application/           # LỚP NGHIỆP VỤ APPLICATION (Định nghĩa Services & DTOs)
│   │   ├── VisualizationDSA.Application.csproj
│   │   ├── Interfaces/                         # Trừu tượng hóa kết nối (Abstractions)
│   │   │   ├── IApplicationDbContext.cs        # Interface cầu nối cơ sở dữ liệu
│   │   │   ├── IUserService.cs
│   │   │   ├── IProgressService.cs             # Cộng XP, kiểm định gian lận, thăng cấp bậc
│   │   │   └── IWidgetService.cs               # Tạo mã iframe, kiểm duyệt sandbox
│   │   ├── DTOs/                               # Đối tượng vận chuyển dữ liệu trao đổi qua API
│   │   │   ├── AuthDto.cs                      # Request/Response đăng ký, đăng nhập
│   │   │   ├── ProgressDto.cs                  # Trạng thái đồng bộ XP học tập
│   │   │   ├── QuizSubmissionDto.cs            # Payload nộp bài giải thuật và đáp án
│   │   │   └── WidgetDto.cs                    # Bản thiết kế cấu hình Iframe nhận về
│   │   ├── Services/                           # Triển khai các ca sử dụng nghiệp vụ ứng dụng
│   │   │   ├── UserService.cs
│   │   │   ├── ProgressService.cs              # Cộng XP, cập nhật level, kiểm định mở khóa Huy hiệu
│   │   │   └── WidgetService.cs                # Tạo mới mã nhúng, lấy thông tin widget độc lập
│   │   └── Validators/                         # Bộ lọc dữ liệu đầu vào ngăn chặn spam bằng FluentValidation
│   │       ├── XpSubmissionValidator.cs
│   │       └── QuizSubmissionValidator.cs
│   │
│   ├── VisualizationDSA.Infrastructure/        # LỚP HẠ TẦNG INFRASTRUCTURE (Kết nối PostgreSQL, EF Core)
│   │   ├── VisualizationDSA.Infrastructure.csproj
│   │   ├── Persistence/                        # Triển khai tầng lưu trữ dữ liệu
│   │   │   ├── ApplicationDbContext.cs         # EF Core DbContext kết nối PostgreSQL
│   │   │   ├── ApplicationDbContextSeed.cs     # Tự động gieo dữ liệu mẫu (Algorithms, Quizzes, Questions)
│   │   │   └── Migrations/                     # Chứa các bản cập nhật lược đồ SQL được sinh ra tự động
│   │   ├── Security/                           # Quản lý mã hóa bảo mật
│   │   │   ├── PasswordHasher.cs               # Mã hóa Bcrypt bảo vệ mật khẩu người học
│   │   │   └── JwtTokenGenerator.cs            # Sinh mã token JWT phục vụ đăng nhập không trạng thái
│   │   └── Caching/                            # Tăng tốc độ truy vấn xếp hạng và Widget tĩnh
│   │       └── RedisCacheService.cs            # Tích hợp Redis tăng tốc độ nạp dữ liệu dưới 15ms
│   │
│   └── VisualizationDSA.WebApi/                # LỚP CỔNG API PRESENTATION (Endpoints & Middlewares)
│       ├── VisualizationDSA.WebApi.csproj
│       ├── Program.cs                          # Điểm khởi chạy API, đăng ký Dependency Injection, CORS, JWT
│       ├── appsettings.json                    # File chứa các chuỗi kết nối Database và cấu hình biến môi trường
│       ├── appsettings.Development.json
│       ├── Controllers/                        # Định tuyến RESTful API
│       │   ├── BaseApiController.cs
│       │   ├── AuthController.cs               # Đăng ký, đăng nhập tài khoản
│       │   ├── ProgressController.cs           # Lấy Leaderboard, nộp XP tiến trình
│       │   ├── QuizController.cs               # Phục vụ tải quiz và nộp bài chấm điểm
│       │   └── WidgetController.cs             # Lưu trữ và tải cấu hình widget nhúng Iframe
│       └── Middlewares/                        # Bộ lọc đường truyền
│           ├── ErrorHandlingMiddleware.cs      # Bắt lỗi Exception tập trung, trả JSON chuẩn 500/400
│           └── SecurityHeadersMiddleware.cs    # Thêm header bảo mật CORS, XSS Protection
│
└── tests/
    ├── VisualizationDSA.UnitTests/             # Thử nghiệm đơn vị logic Services cốt lõi
    │   ├── Services/
    │   │   └── ProgressServiceTests.cs         # Test tính logic cộng điểm XP và thăng cấp
    │   └── Domain/
    └── VisualizationDSA.IntegrationTests/      # Kiểm thử tích hợp từ Controller xuống DB Postgres thật
        ├── Controllers/
        │   └── ProgressControllerTests.cs
        └── CustomWebApplicationFactory.cs      # Khởi tạo máy chủ ảo tích hợp SQLite/Postgres Test Container
```

---

## 4. Luồng Tương Tác Giữa Các Thành Phần (Sequence Flow Diagram)

Sơ đồ dưới đây mô tả chi tiết luồng tương tác thực tế từ khi học viên viết mã tùy biến trên Monaco Editor cho đến khi thuật toán chạy 60 FPS, sinh phần thưởng XP, nộp bài lên C# Web API và ghi nhận tiến trình vào database PostgreSQL:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Học Viên (Browser)
    participant Monaco as Monaco Editor Vue
    participant AST as CompilerStepExecutor
    participant Canvas as AlgorithmCanvas (60 FPS)
    participant WebAPI as C# ASP.NET Core Web API
    participant DB as PostgreSQL Database

    Student->>Monaco: Viết code tùy biến và nhấn nút "Compile"
    Monaco->>AST: Gửi chuỗi mã nguồn sạch
    activate AST
    Note over AST: Phân tích cú pháp AST<br/>Tạo đồ thị liên kết dòng lệnh<br/>Phát hiện lỗi biên dịch tĩnh
    alt Phát hiện lỗi cú pháp
        AST-->>Monaco: Trả về danh sách Lỗi dòng (Gutter error)
        Monaco-->>Student: Đánh dấu đỏ dòng lỗi & Phát âm thanh compile-error.mp3
    else Biên dịch thành công
        AST-->>Monaco: Sinh bộ danh sách steps & Memory snapshots
    end
    deactivate AST

    Monaco->>Canvas: Kích hoạt động cơ hoạt ảnh với Snapshots
    activate Canvas
    loop 60 FPS rAF animation loop
        Canvas->>Canvas: Tính toán phép Lerp Vector di chuyển node mảng/cây
        Canvas->>Student: Vẽ offscreen double-buffered khung hình mượt mà
        Canvas->>Monaco: Đồng bộ dòng chạy sáng (highlight) theo VCR ticks
    end
    deactivate Canvas

    Student->>Canvas: Làm bài trắc nghiệm tương tác trên Canvas thành công
    Canvas->>WebAPI: POST /api/v1/progress/xp (JWT + earnedXp: 200 + actionToken)
    activate WebAPI
    Note over WebAPI: Xác thực JWT Bearer Token<br/>Kiểm tra tính hợp lệ của actionToken (Idempotency)<br/>Tính toán XP và kiểm duyệt thăng hạng
    WebAPI->>DB: UPDATE user_progress SET current_xp = new_xp WHERE user_id = @uid
    DB-->>WebAPI: Cập nhật thành công
    WebAPI-->>Canvas: Trả phản hồi 200 OK (leveledUp: true, currentLevel: 2)
    deactivate WebAPI

    Canvas-->>Student: Bắn pháo hoa hạt cát Neon, phát âm thanh success-xp.mp3 thăng cấp!
```

Tài liệu này cam kết đặc tả đúng, đủ, chi tiết cơ cấu hoạt động và cấu trúc chuẩn hóa cho toàn bộ dự án **VisualizationDSA**.
