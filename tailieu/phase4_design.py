"""
phase4_design.py
Phần 4: Thiết kế – Tech Stack, Sitemap, ERD, Class Diagram
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from helpers import *


def build_phan4(doc: Document) -> None:

    add_heading1(doc, 'PHẦN 4: THIẾT KẾ – DESIGN')
    add_section_divider(doc)

    # ── 4.1 Mô hình công nghệ ─────────────────────────────────────────────────
    add_heading2(doc, '4.1. Mô hình công nghệ (Tech Stack)')

    add_body(doc,
        'Hệ thống VisualizationDSA sử dụng bộ công nghệ hiện đại, được lựa chọn '
        'căn cứ vào khả năng xây dựng giao diện đồ họa tương tác cao hiệu năng '
        'phía client và API backend mạnh mẽ, bảo mật phía server.')

    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'client_server.png'),
              'Hình 4.1: Mô hình công nghệ tổng thể (Tech Stack)', width_cm=14.0)

    tech_data = [
        ('Frontend', 'Vue 3', '3.x', 'Framework JavaScript SPA chính — Composition API, TypeScript, Vite, Pinia Store'),
        ('Frontend', 'TypeScript', '5.x', 'Đảm bảo type-safety toàn bộ codebase frontend, loại bỏ lỗi runtime'),
        ('Frontend', 'Vite', '5.x', 'Build tool hiệu năng cao, HMR tức thì, tối ưu bundle production'),
        ('Frontend', 'Pinia', '2.x', 'State Management: vcrStore, userStore, algorithmStore'),
        ('Frontend', 'HTML5 Canvas 2D', 'Native', 'Vẽ đồ họa animation 60 FPS với kỹ thuật Double Buffering'),
        ('Frontend', 'TailwindCSS + SCSS', '3.x', 'Styling nhanh, responsive, hỗ trợ Dark/Light mode và Glassmorphism'),
        ('Backend', 'ASP.NET Core Web API', '.NET 9 / C#', 'Framework API RESTful hiệu năng cao, Clean Architecture, DI Container tích hợp'),
        ('Backend', 'Entity Framework Core', '9.x', 'ORM ánh xạ Domain Entities sang PostgreSQL, quản lý Migration tự động'),
        ('Backend', 'JWT (JSON Web Token)', 'Bearer', 'Xác thực stateless, bảo mật phiên làm việc, hỗ trợ phân quyền RBAC'),
        ('Backend', 'Serilog', '3.x', 'Structured logging với nhiều sink (Console, File, Seq)'),
        ('Backend', 'Swagger / OpenAPI', '3.0', 'Tự động sinh tài liệu API và giao diện test endpoint tương tác'),
        ('Database', 'PostgreSQL', '16', 'RDBMS mạnh mẽ, hỗ trợ JSONB, Triggers tự động, Index tối ưu hiệu năng'),
        ('Database', 'Supabase', 'Cloud', 'Managed PostgreSQL cloud, Connection Pooling, Auth tích hợp'),
        ('DevTools', 'Git + GitHub', 'Latest', 'Quản lý phiên bản code, branching model Gitflow, PR review'),
        ('DevTools', 'Docker', '24.x', 'Container hóa backend và database để đảm bảo môi trường nhất quán'),
        ('DevTools', 'Visual Studio Code', 'Latest', 'IDE phát triển frontend Vue + TypeScript'),
        ('DevTools', 'Visual Studio 2022', '17.x', 'IDE phát triển backend C# .NET với debugging nâng cao'),
    ]

    table_tech = create_table(doc,
        ['Tầng', 'Công nghệ', 'Phiên bản', 'Mục đích sử dụng'],
        col_widths=[0.9, 1.4, 1.0, 3.6])
    for i, row in enumerate(tech_data):
        add_table_row(table_tech, list(row),
                      centers=[True, False, True, False],
                      bolds=[False, True, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 4.1: Danh sách công nghệ sử dụng trong dự án')

    # ── 4.2 Thiết kế giao diện ────────────────────────────────────────────────
    add_heading2(doc, '4.2. Thiết kế giao diện')

    add_heading3(doc, '4.2.1. Sitemap tổng thể ứng dụng')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'sitemap.png'),
              'Hình 4.2: Sitemap toàn bộ ứng dụng VisualizationDSA', width_cm=14.0)

    sitemap_text = """\
/ (Landing Page)
├── /dashboard          → Dashboard học viên (XP, Level, Achievements)
├── /dsa                → DSA Modules Hub
│   ├── /sorting        → Sorting Visualization (Bubble, Quick, Merge, Heap, Radix, Counting, Bucket)
│   ├── /graph          → Graph Visualization (BFS, DFS, Dijkstra)
│   ├── /search         → Search Algorithms (Binary Search, Linear Search)
│   └── /structures     → Data Structures (Stack, Queue, Monotonic Stack)
├── /oop                → OOP Concepts Visualization
├── /solid              → SOLID Principles Visualization  
├── /patterns           → Design Patterns Visualization
├── /di                 → DI Container Simulation
├── /system             → System Design Visualization
├── /compare            → Algorithm Comparison Tool
├── /playground         → Interactive Playground (Draw Graph)
├── /quiz               → Quiz Hub
│   └── /quiz/:id       → Làm Quiz cụ thể
├── /leaderboard        → Bảng xếp hạng
├── /profile            → Hồ sơ cá nhân
├── /premium            → Nâng cấp Premium (Checkout)
├── /teacher            → Teacher Panel (Role: Teacher)
├── /admin              → Admin Panel (Role: Admin)
└── /404                → Not Found Page"""
    add_code_block(doc, sitemap_text, lang='Sitemap Tree')

    add_heading3(doc, '4.2.2. Nguyên tắc thiết kế giao diện')
    design_principles = [
        'Glassmorphism Dark/Light Theme: Nền tối Slate #0f172a / Nền sáng, các Card và Panel dùng hiệu ứng kính mờ (backdrop-filter: blur), viền trong suốt 8% trắng. Hỗ trợ chuyển đổi theme toàn bộ hệ thống.',
        'Bảng màu HSL Neon chuẩn hóa: Cyan (#06b6d4) cho trạng thái đang chạy, Emerald (#10b981) cho đúng/thành công, Amber (#f59e0b) cho cảnh báo, Crimson (#ef4444) cho lỗi. Đặt biệt, hiển thị banner ghim màu đỏ nổi bật ở đầu trang khi Admin đang đóng vai người dùng khác.',
        'Typography: Font Inter/Arial cho văn bản, Font Courier New cho code và pseudocode. Kích thước tối thiểu 14px.',
        'Micro-interactions & Confetti: Hover effect có transition 200ms, button click có ripple effect, card load có fade-in animation, pháo hoa canvas chúc mừng khi làm quiz đạt điểm tuyệt đối hoặc nâng cấp Premium thành công.',
        'Responsive Mobile Layout: Hỗ trợ linh hoạt các màn hình 1920px, 1440px, 1280px. Trên thiết bị di động (screen < 768px), giao diện tự động chuyển từ chia đôi màn hình (Split screen) sang giao diện Tabs (Lý thuyết / Trực quan) hoặc cuộn dọc Stacked Layout co giãn.',
        'Keyboard Accessibility: Điều khiển VCR Playback dễ dàng bằng phím tắt (Space để play/pause, phím mũi tên Trái/Phải để step backward/forward, Esc để thoát chế độ fullscreen).',
    ]
    for principle in design_principles:
        add_bullet(doc, principle)

    add_heading3(doc, '4.2.3. Wireframe giao diện chính')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'wireframe_main.png'),
              'Hình 4.3: Wireframe trang Visualization chính', width_cm=14.0)

    wireframe_text = """\
+─────────────────────────────────────────────────────────────+
│  HEADER: Logo | Nav Links | User Avatar | XP Bar | Level    │
+──────────────┬──────────────────────────────────────────────+
│              │                                              │
│   SIDEBAR    │          MAIN CANVAS AREA (Canvas 2D)        │
│  (Algorithm  │    ┌────────────────────────────────────┐   │
│   List)      │    │  [ Visualization Canvas 60 FPS ]   │   │
│              │    │  Bars / Nodes / Graph / Tree...     │   │
│  • Sort      │    └────────────────────────────────────┘   │
│  • Graph     │                                              │
│  • Tree      │    [ VCR Controls: ◀ ⏸ ▶ ⏭ ]  Speed: 1x  │
│  • OOP       │    [████████████░░░░░░░░░░░░] Seekbar        │
│  • SOLID     │                                              │
│  • DI        │    ┌─────────────┐  ┌───────────────────┐   │
│              │    │  Pseudocode │  │   Code Editor     │   │
│  [PREMIUM]   │    │  Viewer     │  │  (Monaco Editor)  │   │
│              │    └─────────────┘  └───────────────────┘   │
+──────────────┴──────────────────────────────────────────────+"""
    add_code_block(doc, wireframe_text, lang='Wireframe ASCII')

    # ── 4.3 Thiết kế dữ liệu ERD ──────────────────────────────────────────────
    add_heading2(doc, '4.3. Thiết kế dữ liệu (ERD)')

    add_body(doc,
        'Cơ sở dữ liệu hệ thống VisualizationDSA được xây dựng trên PostgreSQL, '
        'thiết kế theo mô hình quan hệ (Relational Model) với 8 bảng chính, '
        'đảm bảo toàn vẹn dữ liệu thông qua ràng buộc Khóa ngoại và Triggers tự động.')

    add_heading3(doc, '4.3.1. Sơ đồ ERD tổng quan')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'erd_overview.png'),
              'Hình 4.4: Sơ đồ ERD tổng quan cơ sở dữ liệu', width_cm=15.0)

    erd_mermaid = """\
erDiagram
    USERS ||--o{ QUIZ_ATTEMPTS : "submits"
    USERS ||--o{ LEARNING_PROGRESSES : "tracks"
    USERS ||--o{ USER_BADGES : "earns"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ REFRESH_TOKENS : "has"

    QUIZZES ||--o{ QUIZ_ATTEMPTS : "attempted via"
    QUIZZES ||--o{ QUIZ_QUESTIONS : "contains"
    BADGES ||--o{ USER_BADGES : "awarded in"

    USERS {
        UUID id PK
        string email UK
        string username
        string password_hash
        int total_xp
        int current_level
        int streak_days
        bool is_premium
        string role
        bool is_active
        datetime created_at
        datetime last_login_at
        datetime last_activity_date
    }
    QUIZZES {
        UUID id PK
        string title
        string topic
        string difficulty
        int xp_reward
        int passing_score
        string created_by
        datetime created_at
    }
    QUIZ_QUESTIONS {
        UUID id PK
        UUID quiz_id FK
        string question_text
        string question_type
        jsonb options
        string correct_answer
        int order_index
    }
    QUIZ_ATTEMPTS {
        UUID id PK
        UUID user_id FK
        UUID quiz_id FK
        int score
        int max_score
        bool passed
        int xp_awarded
        jsonb answers
        datetime attempted_at
    }
    BADGES {
        UUID id PK
        string name
        string description
        string icon_emoji
        string requirement_type
        int requirement_value
        int xp_reward
    }
    USER_BADGES {
        UUID user_id PK,FK
        UUID badge_id PK,FK
        datetime earned_at
    }
    ORDERS {
        UUID id PK
        UUID user_id FK
        string package_type
        decimal amount
        string currency
        string status
        string payment_provider
        string transaction_id
        datetime created_at
        datetime expires_at
    }
    LEARNING_PROGRESSES {
        UUID id PK
        UUID user_id FK
        string module_id
        datetime completed_at
    }"""
    add_code_block(doc, erd_mermaid, lang='Mermaid ERD')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'erd_detail.png'),
              'Hình 4.5: Sơ đồ ERD chi tiết bảng users và user_progress', width_cm=12.0)

    add_heading3(doc, '4.3.2. Đặc tả chi tiết các bảng dữ liệu chính')

    # Bảng USERS
    add_heading3(doc, 'Bảng: users — Thông tin tài khoản người dùng')
    users_cols = [
        ('id', 'UUID', 'PK', 'NOT NULL', 'Khóa chính, tự sinh GUID'),
        ('email', 'VARCHAR(100)', 'UK', 'NOT NULL', 'Email đăng nhập duy nhất'),
        ('username', 'VARCHAR(50)', '', 'NOT NULL', 'Tên hiển thị của người dùng'),
        ('password_hash', 'VARCHAR(255)', '', 'NOT NULL', 'Mật khẩu đã mã hóa BCrypt'),
        ('total_xp', 'INT', '', 'DEFAULT 0', 'Tổng điểm kinh nghiệm tích lũy'),
        ('current_level', 'INT', '', 'DEFAULT 1', 'Cấp bậc hiện tại (1-8)'),
        ('streak_days', 'INT', '', 'DEFAULT 0', 'Số ngày đăng nhập liên tiếp'),
        ('is_premium', 'BOOLEAN', '', 'DEFAULT FALSE', 'Trạng thái Premium'),
        ('role', 'VARCHAR(20)', '', 'DEFAULT Student', 'Phân quyền: Student/Teacher/Admin'),
        ('is_active', 'BOOLEAN', '', 'DEFAULT TRUE', 'Tài khoản có bị khóa hay không'),
        ('created_at', 'TIMESTAMP', '', 'DEFAULT NOW()', 'Ngày đăng ký tài khoản'),
        ('last_login_at', 'TIMESTAMP', '', 'NULLABLE', 'Lần đăng nhập gần nhất'),
        ('last_activity_date', 'TIMESTAMP', '', 'NULLABLE', 'Ngày có hoạt động học tập gần nhất'),
    ]
    table_users = create_table(doc,
        ['Tên cột', 'Kiểu dữ liệu', 'Khóa', 'Ràng buộc', 'Mô tả'],
        col_widths=[1.3, 1.2, 0.5, 1.1, 2.8])
    for i, row in enumerate(users_cols):
        add_table_row(table_users, list(row),
                      centers=[False, True, True, False, False],
                      bolds=[True, False, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 4.2: Đặc tả bảng users – Thông tin tài khoản người dùng')

    # Bảng QUIZZES
    add_heading3(doc, 'Bảng: quizzes — Ngân hàng bài kiểm tra')
    quizzes_cols = [
        ('id', 'UUID', 'PK', 'NOT NULL', 'Khóa chính bài quiz'),
        ('title', 'VARCHAR(150)', '', 'NOT NULL', 'Tiêu đề bài kiểm tra'),
        ('topic', 'VARCHAR(50)', '', 'NOT NULL', 'Chủ đề: sorting, graph, oop, solid...'),
        ('difficulty', 'VARCHAR(10)', '', 'NOT NULL', 'Độ khó: easy/medium/hard'),
        ('xp_reward', 'INT', '', 'DEFAULT 100', 'XP thưởng khi hoàn thành'),
        ('passing_score', 'INT', '', 'DEFAULT 7', 'Điểm tối thiểu để pass (trên 10)'),
        ('created_by', 'VARCHAR(50)', '', 'NULLABLE', 'Email người tạo quiz'),
        ('created_at', 'TIMESTAMP', '', 'DEFAULT NOW()', 'Thời điểm tạo bài quiz'),
    ]
    table_quizzes = create_table(doc,
        ['Tên cột', 'Kiểu dữ liệu', 'Khóa', 'Ràng buộc', 'Mô tả'],
        col_widths=[1.3, 1.2, 0.5, 1.1, 2.8])
    for i, row in enumerate(quizzes_cols):
        add_table_row(table_quizzes, list(row),
                      centers=[False, True, True, False, False],
                      bolds=[True, False, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 4.3: Đặc tả bảng quizzes – Ngân hàng bài kiểm tra')

    # Bảng orders
    add_heading3(doc, 'Bảng: orders — Lịch sử thanh toán Premium')
    orders_cols = [
        ('id', 'UUID', 'PK', 'NOT NULL', 'Khóa chính đơn hàng'),
        ('user_id', 'UUID', 'FK', 'REFERENCES users', 'Người mua'),
        ('package_type', 'VARCHAR(30)', '', 'NOT NULL', 'Gói: MONTHLY/QUARTERLY/YEARLY'),
        ('amount', 'DECIMAL(10,2)', '', 'NOT NULL', 'Số tiền thanh toán (VND)'),
        ('status', 'VARCHAR(20)', '', 'NOT NULL', 'pending/paid/failed/refunded'),
        ('payment_provider', 'VARCHAR(30)', '', 'NULLABLE', 'vnpay/momo/zalopay'),
        ('transaction_id', 'VARCHAR(100)', '', 'NULLABLE', 'Mã giao dịch từ cổng thanh toán'),
        ('created_at', 'TIMESTAMP', '', 'DEFAULT NOW()', 'Thời điểm tạo đơn hàng'),
        ('expires_at', 'TIMESTAMP', '', 'NULLABLE', 'Ngày hết hạn gói Premium'),
    ]
    table_orders = create_table(doc,
        ['Tên cột', 'Kiểu dữ liệu', 'Khóa', 'Ràng buộc', 'Mô tả'],
        col_widths=[1.3, 1.2, 0.5, 1.1, 2.8])
    for i, row in enumerate(orders_cols):
        add_table_row(table_orders, list(row),
                      centers=[False, True, True, False, False],
                      bolds=[True, False, False, False, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 4.4: Đặc tả bảng orders – Lịch sử thanh toán Premium')

    # ── 4.4 Sơ đồ lớp ─────────────────────────────────────────────────────────
    add_heading2(doc, '4.4. Sơ đồ lớp (Class Diagram)')

    add_body(doc,
        'Thay thế cho sơ đồ DAO truyền thống của Java, hệ thống .NET áp dụng '
        'Strategy Pattern và Repository Pattern để tổ chức code. Dưới đây là '
        'hai sơ đồ lớp quan trọng nhất: Kiến trúc Clean Architecture tổng thể '
        'và Strategy Pattern cho module Algorithm.')

    add_heading3(doc, '4.4.1. Sơ đồ lớp – Kiến trúc Clean Architecture')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'class_clean_arch.png'),
              'Hình 4.6: Sơ đồ lớp – Kiến trúc Clean Architecture (.NET 9)', width_cm=14.0)

    plantuml_arch = """\
@startuml ClassDiagram_CleanArch
skinparam classAttributeIconSize 0
skinparam backgroundColor #1a1a2e
skinparam class {
  BackgroundColor #16213e
  BorderColor #e94560
  FontColor white
  ArrowColor #e94560
}

package "WebApi Layer" {
  class AlgorithmsController {
    -_strategies: IEnumerable<IAlgorithmStrategy>
    +GetAll(): ActionResult
    +Execute(req): ActionResult<AlgorithmResult>
    +CustomExecute(req): Task<ActionResult>
    +Compare(req): ActionResult
  }
  class AdminController {
    -_dbContext: ApplicationDbContext
    -_authStrategy: StatelessAuthStrategy
    +GetDashboard(): IActionResult
    +GetUsers(): IActionResult
    +SetRole(id, req): IActionResult
    +TogglePremium(id, req): IActionResult
  }
  class StatelessAuthController {
    -_authStrategy: StatelessAuthStrategy
    +Register(req): IActionResult
    +Login(req): IActionResult
    +GetProfile(): IActionResult
  }
}

package "Application Layer" {
  interface IAlgorithmStrategy {
    +AlgorithmId: string
    +Name: string
    +Category: string
    +Execute(input, ct): List<FrameDTO>
    +GetMetadata(): AlgorithmMetadata
  }
  class AuthService {
    +Register(email, password): Task<User>
    +Login(email, password): Task<string>
    +ValidateToken(token): ClaimsPrincipal
  }
}

package "Domain Layer" {
  class User {
    +Id: Guid
    +Email: string
    +TotalXP: int
    +CurrentLevel: int
    +Role: string
    +IsActive: bool
    +AwardXP(amount): void
    +RecordActivity(): void
    +SetRole(role): void
    +SetActiveStatus(active): void
  }
  class BubbleSortStrategy {
    +AlgorithmId: string = "bubble-sort"
    +Execute(input, ct): List<FrameDTO>
    +GetMetadata(): AlgorithmMetadata
  }
  class DijkstraStrategy {
    +AlgorithmId: string = "dijkstra"
    +Execute(input, ct): List<FrameDTO>
  }
  class StatelessAuthStrategy {
    -_users: List<InMemoryUser>
    +Authenticate(email, pwd): InMemoryUser?
    +Register(email, username, pwd): InMemoryUser
    +GetAllUsers(): List<InMemoryUser>
    +GenerateToken(user): string
  }
}

package "Infrastructure Layer" {
  class ApplicationDbContext {
    +Users: DbSet<User>
    +Quizzes: DbSet<Quiz>
    +Badges: DbSet<Badge>
    +Orders: DbSet<Order>
    +OnModelCreating(): void
  }
}

AlgorithmsController --> IAlgorithmStrategy
AdminController --> ApplicationDbContext
AdminController --> StatelessAuthStrategy
StatelessAuthController --> StatelessAuthStrategy
BubbleSortStrategy ..|> IAlgorithmStrategy
DijkstraStrategy ..|> IAlgorithmStrategy
ApplicationDbContext --> User
AuthService --> ApplicationDbContext
@enduml"""
    add_code_block(doc, plantuml_arch, lang='PlantUML')

    add_heading3(doc, '4.4.2. Sơ đồ lớp – Strategy Pattern cho Algorithm Module')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'class_strategy.png'),
              'Hình 4.7: Sơ đồ lớp – Strategy Pattern cho Algorithm Module', width_cm=13.0)

    add_body(doc,
        'Strategy Pattern được áp dụng nhất quán cho toàn bộ 29 lớp Algorithm '
        'trong hệ thống. Khi cần thêm thuật toán mới, chỉ cần tạo thêm một class '
        'mới kế thừa IAlgorithmStrategy — không cần sửa bất kỳ code hiện có nào '
        '(tuân thủ nguyên tắc Open/Closed Principle của SOLID).')

    strategy_list = [
        ('Sorting', 'BubbleSortStrategy, QuickSortStrategy, MergeSortStrategy, HeapSortStrategy, RadixSortStrategy, CountingSortStrategy, BucketSortStrategy'),
        ('Graph', 'BFSStrategy, DFSStrategy, DijkstraStrategy'),
        ('Trees', 'BSTStrategy'),
        ('Search', 'BinarySearchStrategy, LinearSearchStrategy'),
        ('Structures', 'StackStrategy, QueueStrategy, MonotonicStackStrategy, SlidingWindowStrategy'),
        ('Concepts', 'OOPConceptsStrategy, SOLIDPrinciplesStrategy, DIContainerStrategy, DesignPatternsStrategy, SystemDesignStrategy'),
        ('Business', 'GamificationStrategy, QuizBankStrategy, StatelessAuthStrategy, StatelessPaymentStrategy'),
    ]

    table_strat = create_table(doc, ['Danh mục', 'Các Strategy Classes'],
                               col_widths=[1.3, 5.6])
    for i, (cat, strategies) in enumerate(strategy_list):
        add_table_row(table_strat, [cat, strategies],
                      centers=[True, False],
                      bolds=[True, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 4.5: Danh sách 29 Algorithm Strategy Classes phân theo danh mục')

    add_page_break(doc)


def run() -> None:
    filepath = get_output_path()
    doc = load_document(filepath)
    print('[Phase 4] Đang thêm: Phần 4 – Thiết kế...')
    build_phan4(doc)
    save_document(doc, filepath)
    print('[Phase 4] HOÀN THÀNH.\n')


if __name__ == '__main__':
    run()
