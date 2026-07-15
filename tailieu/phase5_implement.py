"""
phase5_implement.py
Phần 5: Thực hiện – Database, Layout, Kiến trúc thực tế, Sequence/Activity/Class, API
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from helpers import *


def build_phan5(doc: Document) -> None:

    add_heading1(doc, 'PHẦN 5: THỰC HIỆN – IMPLEMENT')
    add_section_divider(doc)

    # ── 5.1 Database ──────────────────────────────────────────────────────────
    add_heading2(doc, '5.1. Database – Cơ sở dữ liệu PostgreSQL')

    add_body(doc,
        'Cơ sở dữ liệu được xây dựng và quản lý thông qua Entity Framework Core '
        'Migration. Mỗi thay đổi về cấu trúc bảng đều được ghi lại dưới dạng file '
        'Migration C# riêng biệt, đảm bảo khả năng rollback và kiểm tra phiên bản DB.')

    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'db_migration.png'),
              'Hình 5.1: Kết quả migration PostgreSQL thực tế', width_cm=13.0)

    add_heading3(doc, '5.1.1. Câu lệnh tạo Database thực tế')
    sql_create = """\
-- VisualizationDSA Database Schema — PostgreSQL 16
-- Được sinh tự động bởi EF Core Migrations

-- Bảng Users
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(100) NOT NULL UNIQUE,
    username          VARCHAR(50)  NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    total_xp          INT          NOT NULL DEFAULT 0,
    current_level     INT          NOT NULL DEFAULT 1,
    streak_days       INT          NOT NULL DEFAULT 0,
    streak_freezes_count INT       NOT NULL DEFAULT 0, -- Vật phẩm bảo lưu streak
    is_premium        BOOLEAN      NOT NULL DEFAULT FALSE,
    role              VARCHAR(20)  NOT NULL DEFAULT 'Student',
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_login_at     TIMESTAMP,
    last_activity_date TIMESTAMP
);

-- Bảng Enrollments (Khóa học đăng ký)
CREATE TABLE enrollments (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id              UUID NOT NULL,
    completed_lesson_count INT  NOT NULL DEFAULT 0, -- Cột counter cache tối ưu hóa truy vấn
    is_completed           BOOLEAN NOT NULL DEFAULT FALSE,
    enrolled_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bảng Quizzes
CREATE TABLE quizzes (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(150) NOT NULL,
    topic         VARCHAR(50)  NOT NULL,
    difficulty    VARCHAR(10)  NOT NULL DEFAULT 'medium',
    xp_reward     INT          NOT NULL DEFAULT 100,
    passing_score INT          NOT NULL DEFAULT 7,
    created_by    VARCHAR(100),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Bảng Quiz_Questions  
CREATE TABLE quiz_questions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'multiple_choice',
    options       JSONB NOT NULL,
    correct_answer VARCHAR(500) NOT NULL,
    order_index   INT NOT NULL DEFAULT 0
);

-- Bảng Quiz_Attempts
CREATE TABLE quiz_attempts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id     UUID NOT NULL REFERENCES quizzes(id),
    score       INT  NOT NULL DEFAULT 0,
    max_score   INT  NOT NULL DEFAULT 10,
    passed      BOOLEAN NOT NULL DEFAULT FALSE,
    xp_awarded  INT  NOT NULL DEFAULT 0,
    answers     JSONB,
    attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Bảng Badges
CREATE TABLE badges (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(100) NOT NULL,
    description       TEXT NOT NULL,
    icon_emoji        VARCHAR(10)  NOT NULL,
    requirement_type  VARCHAR(50)  NOT NULL,
    requirement_value INT          NOT NULL DEFAULT 1,
    xp_reward         INT          NOT NULL DEFAULT 50
);

-- Bảng User_Badges (junction)
CREATE TABLE user_badges (
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id  UUID NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- Bảng Orders (Thanh toán)
CREATE TABLE orders (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    package_type     VARCHAR(30)     NOT NULL,
    amount           DECIMAL(10,2)   NOT NULL,
    currency         VARCHAR(5)      NOT NULL DEFAULT 'VND',
    status           VARCHAR(20)     NOT NULL DEFAULT 'pending',
    payment_provider VARCHAR(30),
    transaction_id   VARCHAR(100)    UNIQUE, -- Ràng buộc UNIQUE phục vụ Idempotency
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at       TIMESTAMP
);

-- Bảng Learning_Progresses
CREATE TABLE learning_progresses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id    VARCHAR(50) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes tối ưu hiệu năng truy vấn
CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_role        ON users(role);
CREATE INDEX idx_quiz_attempts_uid ON quiz_attempts(user_id);
CREATE INDEX idx_orders_uid_status ON orders(user_id, status);
CREATE INDEX idx_learning_uid_mid  ON learning_progresses(user_id, module_id);"""
    add_code_block(doc, sql_create, lang='SQL')

    # ── 5.2 Layout thực tế ────────────────────────────────────────────────────
    add_heading2(doc, '5.2. Layout thực tế')
    add_body(doc,
        'Giao diện thực tế được triển khai theo đúng thiết kế Glassmorphism Dark Theme '
        'với Canvas Animation Engine 60 FPS. Dưới đây là ảnh chụp màn hình các giao '
        'diện chính của hệ thống.')

    screens = [
        ('screen_bubble_sort.png',
         'Hình 5.2: Giao diện thực tế – Bubble Sort Visualization (Canvas 60 FPS, VCR Controls)'),
        ('screen_dijkstra.png',
         'Hình 5.3: Giao diện thực tế – Dijkstra Graph Visualization (Node-Edge đồ thị)'),
        ('screen_oop.png',
         'Hình 5.4: Giao diện thực tế – OOP Sandbox (Hạt khói Bezier connector)'),
        ('screen_solid.png',
         'Hình 5.5: Giao diện thực tế – SOLID Principles Visualization'),
        ('screen_admin.png',
         'Hình 5.6: Giao diện thực tế – Admin Panel (Dashboard + User Management)'),
        ('screen_teacher.png',
         'Hình 5.7: Giao diện thực tế – Teacher Panel (Quiz Management)'),
    ]
    for filename, caption in screens:
        add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', filename),
                  caption, width_cm=14.0)

    # ── 5.3 Sơ đồ kiến trúc thực tế ─────────────────────────────────────────
    add_heading2(doc, '5.3. Sơ đồ kiến trúc công nghệ thực tế (Clean Architecture)')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'class_clean_arch.png'),
              'Hình 5.8: Sơ đồ kiến trúc Clean Architecture 4 tầng thực tế', width_cm=14.0)

    add_body(doc,
        'Kiến trúc thực tế của dự án được tổ chức theo chuẩn Clean Architecture '
        '4 tầng phân cấp rõ ràng, đảm bảo tách biệt mối quan tâm (Separation of '
        'Concerns) và khả năng kiểm thử (Testability) cao:')

    ca_text = """\
solution/
├── backend/src/
│   ├── Domain/                         ← Tầng 1: Domain Layer (không phụ thuộc gì)
│   │   ├── Entities/
│   │   │   ├── User.cs                 ← Entity gốc với business logic
│   │   │   ├── Quiz.cs
│   │   │   ├── Badge.cs
│   │   │   ├── Order.cs
│   │   │   └── LearningProgress.cs
│   │   ├── Engine/
│   │   │   ├── FrameDTO.cs             ← Data Transfer Object cho Animation Frames
│   │   │   └── AlgorithmMetadata.cs
│   │   ├── Strategies/
│   │   │   ├── IAlgorithmStrategy.cs   ← Interface chuẩn cho Strategy Pattern
│   │   │   ├── BubbleSortStrategy.cs
│   │   │   ├── QuickSortStrategy.cs
│   │   │   ├── DijkstraStrategy.cs     ← (29 Strategies tổng cộng)
│   │   │   └── StatelessAuthStrategy.cs
│   │   └── Input/
│   │       ├── InputParser.cs          ← Parse mảng từ chuỗi thô
│   │       └── ConstraintResolver.cs   ← Kiểm tra giới hạn kích thước input
│   │
│   ├── Application/                    ← Tầng 2: Application Layer
│   │   ├── DTOs/                       ← Request/Response DTOs
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   └── GamificationService.cs
│   │   └── Interfaces/
│   │
│   ├── Infrastructure/                 ← Tầng 3: Infrastructure Layer
│   │   ├── Data/
│   │   │   └── ApplicationDbContext.cs ← EF Core DbContext, tất cả DbSets
│   │   ├── Migrations/                 ← EF Core Migrations tự động
│   │   ├── Repositories/               ← Repository Pattern
│   │   └── Services/                   ← Infrastructure Services
│   │
│   └── WebApi/                         ← Tầng 4: Presentation/API Layer
│       ├── Controllers/                ← 22 Controllers
│       │   ├── AlgorithmsController.cs
│       │   ├── AdminController.cs
│       │   ├── StatelessAuthController.cs
│       │   └── ...
│       ├── Middleware/                 ← JWT Middleware, Error Handling
│       └── Program.cs                 ← Entry point, DI Container config
│
└── frontend/src/                       ← Vue 3 SPA
    ├── features/
    │   ├── dsa-modules/               ← Canvas Visualization (15+ thuật toán)
    │   ├── animation-engine/          ← Core 60 FPS Animation Engine
    │   ├── oop-visualization/         ← OOP, SOLID, DI Visualizers
    │   ├── quiz-system/               ← Quiz UI và Logic
    │   ├── gamification/              ← XP, Level, Badge UI
    │   └── admin-panel/               ← Admin & Teacher Panels
    └── stores/                        ← Pinia State Management"""
    add_code_block(doc, ca_text, lang='Project Structure')

    # ── 5.4 Các loại sơ đồ ────────────────────────────────────────────────────
    add_heading2(doc, '5.4. Các loại sơ đồ')

    add_heading3(doc, '5.4.1. Sequence Diagram – Luồng thực thi thuật toán')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'seq_algorithm.png'),
              'Hình 5.9: Sequence Diagram – Luồng thực thi thuật toán', width_cm=14.0)

    plantuml_seq_algo = """\
@startuml SequenceDiagram_AlgoExecute
actor User
participant "Vue 3 Frontend\n(DSAModulesView)" as FE
participant "Pinia Store\n(vcrStore)" as Store
participant "ASP.NET Core\nAlgorithmsController" as API
participant "BubbleSortStrategy\n(Domain Layer)" as Strategy

User -> FE : Chọn Bubble Sort, nhập [5,3,8,1,9]
FE -> API : POST /api/v1/algorithms/custom-execute\n{ algorithmId: "bubble-sort", rawInput: "5,3,8,1,9" }
activate API
API -> API : InputParser.ParseArray("5,3,8,1,9")
API -> Strategy : strategy.Execute([5,3,8,1,9], cancelToken)
activate Strategy
Strategy -> Strategy : yield return Frame (mỗi bước hoán đổi)
Strategy -> Strategy : yield return Frame (so sánh, highlight)
Strategy --> API : List<FrameDTO> (47 frames)
deactivate Strategy
API --> FE : 200 OK { frames: [...47 frames...], pseudoCode: "..." }
deactivate API
FE -> Store : vcrStore.loadFrames(frames)
FE -> FE : Canvas.play() → requestAnimationFrame loop
loop Mỗi frame (60 FPS)
  FE -> Store : vcrStore.currentFrame++
  FE -> FE : Canvas.draw(currentFrame)
  FE -> User : Hiển thị hoạt hình thanh biểu đồ
end
@enduml"""
    add_code_block(doc, plantuml_seq_algo, lang='PlantUML')

    add_heading3(doc, '5.4.2. Sequence Diagram – Luồng xác thực JWT')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'seq_auth.png'),
              'Hình 5.10: Sequence Diagram – Luồng xác thực JWT', width_cm=14.0)

    plantuml_seq_auth = """\
@startuml SequenceDiagram_JWT_Auth
actor User
participant "Frontend\n(LoginView.vue)" as FE
participant "StatelessAuth\nController" as Auth
participant "StatelessAuth\nStrategy" as Strategy
participant "PostgreSQL\nDatabase" as DB

User -> FE : Nhập email + mật khẩu, nhấn "Đăng nhập"
FE -> Auth : POST /api/v1/stateless-auth/login\n{ email: "...", password: "..." }
activate Auth
Auth -> Strategy : Authenticate(email, password)
activate Strategy
Strategy -> DB : SELECT * FROM users WHERE email = ?
alt DB Available
  DB --> Strategy : User record
  Strategy -> Strategy : BCrypt.Verify(password, hash)
else DB Offline (Fallback)
  Strategy -> Strategy : Kiểm tra InMemory _users list
end
alt Xác thực thành công
  Strategy -> Strategy : JwtSecurityTokenHandler.CreateToken()
  Strategy --> Auth : { token, userId, role }
  deactivate Strategy
  Auth --> FE : 200 OK { token: "eyJ...", user: {...} }
  FE -> FE : userStore.setToken(token)
  FE -> User : Chuyển đến Dashboard
else Xác thực thất bại
  Auth --> FE : 401 INVALID_CREDENTIALS
  FE -> User : Hiển thị thông báo lỗi đăng nhập
end
deactivate Auth
@enduml"""
    add_code_block(doc, plantuml_seq_auth, lang='PlantUML')

    add_heading3(doc, '5.4.3. Activity Diagram – Luồng làm Quiz và nhận XP')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'activity_quiz.png'),
              'Hình 5.11: Activity Diagram – Luồng làm Quiz và nhận XP', width_cm=13.0)

    plantuml_activity = """\
@startuml ActivityDiagram_Quiz
start
:Student truy cập module bài học;
:Hệ thống hiển thị nút "Làm Quiz";
:Student nhấn nút Quiz;
:Hệ thống tải danh sách câu hỏi\nGET /api/v1/quizzes/{id}/questions;
:Hiển thị 3-5 câu hỏi trắc nghiệm;
repeat
  :Student chọn đáp án cho câu hỏi hiện tại;
repeat while (Còn câu hỏi chưa trả lời?) is (Có)
:Student nhấn nút "Nộp bài";
:POST /api/v1/quizzes/{id}/submit với JWT;
if (JWT Token hợp lệ?) then (Không)
  :Trả lỗi 401 Unauthorized;
  :Yêu cầu đăng nhập lại;
  stop
else (Có)
  :Backend chấm điểm, so sánh đáp án;
  if (Điểm >= passing_score?) then (Có)
    :Cộng XP vào user_progress;
    :Kiểm tra điều kiện mở Badge;
    if (Đủ điều kiện mở Badge?) then (Có)
      :Tạo user_badges record;
      :Hiển thị thông báo "Đã mở huy hiệu";
    else (Không)
    endif
    if (Đủ XP để thăng cấp?) then (Có)
      :Tăng current_level;
      :Hiển thị Level Up Animation;
    else (Không)
    endif
    :Hiển thị kết quả: Điểm, XP nhận, đáp án đúng;
  else (Không)
    :Hiển thị kết quả: Thất bại, đáp án đúng;
    :Khuyến khích xem lại bài học;
  endif
endif
stop
@enduml"""
    add_code_block(doc, plantuml_activity, lang='PlantUML')

    # ── 5.5 API ────────────────────────────────────────────────────────────────
    add_heading2(doc, '5.5. API – Danh sách Controllers và Services')

    add_body(doc,
        'Backend VisualizationDSA cung cấp 22 Controllers RESTful với đầy đủ '
        'tài liệu Swagger/OpenAPI. Tất cả endpoints đều trả về cấu trúc phản hồi '
        'nhất quán theo chuẩn RFC 7807 (Problem Details).')

    controllers = [
        ('1',  'AlgorithmsController',          '/api/v1/algorithms',          '4',  'Thực thi thuật toán, lấy metadata, so sánh đa thuật toán'),
        ('2',  'StatelessAuthController',        '/api/v1/stateless-auth',      '7',  'Đăng ký, đăng nhập, lấy profile, refresh token (In-memory fallback)'),
        ('3',  'AdminController',                '/api/v1/concepts/admin',      '12', 'Dashboard, CRUD users, phân quyền, khóa/mở, Premium, Impersonation'),
        ('4',  'StatelessQuizController',        '/api/v1/quizzes',             '6',  'Lấy danh sách quiz, làm bài, nộp bài, xem lịch sử'),
        ('5',  'StatelessGamificationController','/api/v1/stateless-gamification','5', 'XP, Level, Streak, Badge, Leaderboard in-memory'),
        ('6',  'StatelessPaymentController',     '/api/v1/stateless-payment',   '5',  'Tạo đơn hàng Premium, xác nhận thanh toán, kiểm tra trạng thái'),
        ('7',  'OOPController',                  '/api/v1/oop',                 '3',  'Trực quan hóa OOP: Kế thừa, Đa hình, Đóng gói'),
        ('8',  'SOLIDController',                '/api/v1/solid',               '5',  'Trực quan hóa 5 nguyên tắc SOLID (SRP, OCP, LSP, ISP, DIP)'),
        ('9',  'DIContainerController',          '/api/v1/di-container',        '3',  'Mô phỏng DI Container, Service Registration, Injection'),
        ('10', 'ConceptsController',             '/api/v1/concepts',            '4',  'Tổng hợp khái niệm học thuật, định nghĩa lý thuyết'),
        ('11', 'DesignPatternsController',       '/api/v1/design-patterns',     '4',  'Observer, Factory, Strategy, Decorator Visualization'),
        ('12', 'SystemDesignController',         '/api/v1/system-design',       '3',  'Mô phỏng kiến trúc hệ thống (Load Balancer, Cache, CDN)'),
        ('13', 'LecturesController',             '/api/v1/lectures',            '5',  'Bài giảng kịch bản E-Lecture (slide steps, narration)'),
        ('14', 'QuizzesController',              '/api/v1/teacher/quizzes',     '6',  'Teacher CRUD câu hỏi, import/export quiz'),
        ('15', 'GamificationController',         '/api/v1/gamification',        '5',  'XP Engine, Badge check, Leaderboard (DB-based)'),
        ('16', 'PaymentsController',             '/api/v1/payments',            '5',  'Cổng thanh toán VNPay/MoMo, webhook xác nhận'),
        ('17', 'UsersController',                '/api/v1/users',               '8',  'Hồ sơ người dùng, cập nhật thông tin, avatar'),
        ('18', 'BadgesController',               '/api/v1/badges',              '4',  'Danh sách huy hiệu, kiểm tra đủ điều kiện, trao thưởng'),
        ('19', 'LeaderboardController',          '/api/v1/leaderboard',         '2',  'Top 10 XP, Top 10 Quiz Score'),
        ('20', 'AnalyticsController',            '/api/v1/analytics',           '5',  'Thống kê học tập cá nhân, tiến trình module'),
        ('21', 'AuthController',                 '/api/v1/auth',                '4',  'Auth DB-based: Register, Login, RefreshToken, Logout'),
        ('22', 'DiagnosticsController',          '/api/v1/diagnostics',         '3',  'Health check, ping, version, cấu hình hệ thống'),
    ]

    table_ctrl = create_table(doc,
        ['STT', 'Controller', 'Base Route', 'Actions', 'Chức năng chính'],
        col_widths=[0.4, 1.8, 1.8, 0.6, 2.3])
    for i, row in enumerate(controllers):
        add_table_row(table_ctrl, list(row),
                      centers=[True, False, False, True, False],
                      bolds=[False, True, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 5.1: Danh sách 22 API Controllers và chức năng')

    add_heading3(doc, '5.5.1. Bảng các API Endpoints quan trọng')
    endpoints = [
        ('GET',  '/api/v1/algorithms',                  'Public',  '200', 'Lấy danh sách tất cả thuật toán'),
        ('POST', '/api/v1/algorithms/execute',           'Public',  '200', 'Thực thi thuật toán, trả về frames animation'),
        ('POST', '/api/v1/algorithms/custom-execute',    'Public',  '200', 'Thực thi với input chuỗi thô (parse + validate)'),
        ('POST', '/api/v1/algorithms/compare',           'Public',  '200', 'So sánh tối đa 4 thuật toán cùng input'),
        ('POST', '/api/v1/stateless-auth/register',      'Public',  '201', 'Đăng ký tài khoản mới'),
        ('POST', '/api/v1/stateless-auth/login',         'Public',  '200', 'Đăng nhập, nhận JWT Token'),
        ('GET',  '/api/v1/stateless-auth/profile',       'JWT',     '200', 'Lấy thông tin tài khoản hiện tại'),
        ('GET',  '/api/v1/concepts/admin/dashboard',     'Admin',   '200', 'Dashboard thống kê hệ thống'),
        ('GET',  '/api/v1/concepts/admin/users',         'Admin',   '200', 'Danh sách users có phân trang'),
        ('PUT',  '/api/v1/concepts/admin/users/{id}/role','Admin',  '200', 'Đổi role người dùng'),
        ('PUT',  '/api/v1/concepts/admin/users/{id}/ban', 'Admin',  '200', 'Khóa/Mở khóa tài khoản'),
        ('PUT',  '/api/v1/concepts/admin/users/{id}/premium','Admin','200','Nâng cấp/Hủy Premium'),
        ('GET',  '/api/v1/quizzes',                      'JWT',     '200', 'Danh sách quiz theo topic'),
        ('POST', '/api/v1/quizzes/{id}/submit',          'JWT',     '200', 'Nộp bài quiz, nhận XP'),
        ('GET',  '/api/v1/stateless-gamification/stats', 'JWT',     '200', 'Thống kê XP, Level, Streak, Badge'),
        ('GET',  '/api/v1/leaderboard/top',              'Public',  '200', 'Top 10 bảng xếp hạng XP'),
        ('POST', '/api/v1/stateless-payment/create-order','JWT',   '201', 'Tạo đơn hàng Premium'),
        ('GET',  '/api/v1/diagnostics/health',           'Public',  '200', 'Health check API và DB'),
    ]

    table_ep = create_table(doc,
        ['Method', 'Endpoint', 'Auth', 'HTTP', 'Mô tả'],
        col_widths=[0.6, 2.8, 0.6, 0.5, 2.4])
    for i, row in enumerate(endpoints):
        add_table_row(table_ep, list(row),
                      centers=[True, False, True, True, False],
                      bolds=[True, False, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 5.2: Bảng tổng hợp API Endpoints chính')

    add_page_break(doc)


def run() -> None:
    filepath = get_output_path()
    doc = load_document(filepath)
    print('[Phase 5] Đang thêm: Phần 5 – Thực hiện...')
    build_phan5(doc)
    save_document(doc, filepath)
    print('[Phase 5] HOÀN THÀNH.\n')


if __name__ == '__main__':
    run()
