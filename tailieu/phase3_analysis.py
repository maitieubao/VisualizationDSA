"""
phase3_analysis.py
Phần 3: Phân tích – Mô hình triển khai, Use Cases (PlantUML), Đặc tả SRS
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from helpers import *


def build_phan3(doc: Document) -> None:

    add_heading1(doc, 'PHẦN 3: PHÂN TÍCH – ANALYSIS')
    add_section_divider(doc)

    # ── 3.1 Mô hình triển khai ────────────────────────────────────────────────
    add_heading2(doc, '3.1. Mô hình triển khai hệ thống')

    add_body(doc,
        'Hệ thống VisualizationDSA được triển khai theo mô hình Client-Server độc lập '
        '(Decoupled Architecture). Frontend Vue 3 và Backend ASP.NET Core Web API '
        'tách biệt hoàn toàn, giao tiếp với nhau thông qua giao thức HTTPS RESTful '
        'với bảo mật JWT Bearer Token.')

    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'client_server.png'),
              'Hình 3.1: Mô hình Client-Server tổng thể hệ thống', width_cm=14.0)

    add_heading3(doc, '3.1.1. Sơ đồ kiến trúc tổng thể (Text-based)')
    arch_text = """\
+─────────────────────────────────────────────────────+
│           TẦNG TRÌNH BÀY (Presentation Layer)       │
│     Vue 3 SPA (Vite + TypeScript + Pinia Store)     │
│   Port: 5173 | Glassmorphic UI | Canvas 60 FPS      │
+──────────────────┬──────────────────────────────────+
                   │ HTTPS / JWT Bearer
                   ▼
+─────────────────────────────────────────────────────+
│          TẦNG WEB API (Presentation/API Layer)       │
│   ASP.NET Core Web API (.NET 9) | Port: 5055        │
│   22 Controllers | Middleware JWT | CORS Policy     │
+──────────────────┬──────────────────────────────────+
                   │ Dependency Injection
                   ▼
+─────────────────────────────────────────────────────+
│         TẦNG ỨNG DỤNG (Application Layer)           │
│       Services | DTOs | Validators | Interfaces     │
│         AuthService | GamificationService           │
+──────────────────┬──────────────────────────────────+
                   │
                   ▼
+─────────────────────────────────────────────────────+
│           TẦNG MIỀN (Domain Layer)                  │
│     Entities | Strategy Pattern (29 Strategies)     │
│   User | Quiz | Badge | Order | LearningProgress    │
+──────────────────┬──────────────────────────────────+
                   │ EF Core ORM
                   ▼
+─────────────────────────────────────────────────────+
│       TẦNG HẠ TẦNG (Infrastructure Layer)           │
│     PostgreSQL (Supabase) | EF Core DbContext       │
│            Migrations | Repositories               │
+─────────────────────────────────────────────────────+"""
    add_code_block(doc, arch_text, lang='Text Architecture Diagram')

    add_heading3(doc, '3.1.2. Các thành phần hạt nhân')
    components = [
        ('Canvas Animation Engine',
         'Module lõi phía Client xử lý vòng lặp requestAnimationFrame (rAF) 60 FPS, '
         'tính toán nội suy Vector Lerp và vẽ đồ họa bằng HTML5 Canvas 2D với '
         'kỹ thuật Double Buffering.'),
        ('Strategy Pattern Backend',
         'Mỗi thuật toán được đóng gói trong một class riêng biệt kế thừa '
         'IAlgorithmStrategy. Backend chạy thuật toán, bắt giữ State Frames '
         'và trả về danh sách JSON để Frontend phát lại.'),
        ('Pinia Store System',
         'Quản lý trạng thái toàn cục: vcrStore (điều khiển VCR Playback), '
         'userStore (JWT Token, XP, Level), algorithmStore (frames hiện tại).'),
        ('PostgreSQL + EF Core',
         'Lưu trữ thông tin người dùng, tiến trình XP, lịch sử nộp bài Quiz, '
         'thành tựu và cấu hình Premium. EF Core quản lý migrations tự động.'),
        ('StatelessAuth Strategy',
         'Cơ chế fallback In-Memory đảm bảo hệ thống vẫn hoạt động khi '
         'PostgreSQL tạm ngắt kết nối — dữ liệu người dùng được cache trong RAM.'),
    ]
    for name, desc in components:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r1 = p.add_run(f'• {name}: ')
        r1.font.name = FONT_NAME; r1.font.size = Pt(12); r1.font.bold = True
        r2 = p.add_run(desc)
        r2.font.name = FONT_NAME; r2.font.size = Pt(12)

    # ── 3.2 Sơ đồ Use Cases ───────────────────────────────────────────────────
    add_heading2(doc, '3.2. Sơ đồ Use Cases')

    add_body(doc,
        'Hệ thống VisualizationDSA phục vụ 4 nhóm người dùng (Actor) với phạm vi '
        'quyền hạn và chức năng khác nhau. Để đảm bảo tính rõ ràng và tránh rối '
        'mắt, Use Case được tách thành 4 sơ đồ riêng biệt theo từng Actor.')

    # ── UC GUEST ──
    add_heading3(doc, '3.2.1. Sơ đồ Use Case – Actor: Guest (Khách vãng lai)')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'uc_guest.png'),
              'Hình 3.2: Sơ đồ Use Case – Guest (Khách vãng lai)', width_cm=12.0)
    plantuml_guest = """\
@startuml UC_GUEST
skinparam actorStyle awesome
skinparam backgroundColor #1a1a2e
skinparam actor {
  BackgroundColor #0f3460
  BorderColor #e94560
  FontColor white
}
skinparam usecase {
  BackgroundColor #16213e
  BorderColor #e94560
  FontColor white
}

left to right direction
actor "Guest\\n(Khách vãng lai)" as Guest #0f3460

rectangle "VisualizationDSA System" {
  usecase "UC-G01\\nXem Landing Page" as G1
  usecase "UC-G02\\nXem demo\\nVisualization" as G2
  usecase "UC-G03\\nXem giới thiệu\\ncác Module" as G3
  usecase "UC-G04\\nĐăng ký\\ntài khoản" as G4
  usecase "UC-G05\\nĐăng nhập\\ntài khoản" as G5
}

Guest --> G1
Guest --> G2
Guest --> G3
Guest --> G4
Guest --> G5
G4 .> G5 : <<include>>
@enduml"""
    add_code_block(doc, plantuml_guest, lang='PlantUML')

    # ── UC STUDENT ──
    add_heading3(doc, '3.2.2. Sơ đồ Use Case – Actor: Student (Học viên)')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'uc_student.png'),
              'Hình 3.3: Sơ đồ Use Case – Student (Học viên)', width_cm=14.0)
    plantuml_student = """\
@startuml UC_STUDENT
skinparam actorStyle awesome
left to right direction
actor "Student\\n(Học viên)" as Student

rectangle "VisualizationDSA – Student Functions" {
  package "Visualization" {
    usecase "UC-S01 Xem Visualization\\nDSA (Sort, Graph, Tree)" as S1
    usecase "UC-S02 Điều khiển VCR\\n(Play/Pause/Seek)" as S2
    usecase "UC-S03 Nhập dữ liệu\\ntùy chỉnh" as S3
    usecase "UC-S04 So sánh\\nthuật toán" as S4
    usecase "UC-S05 Vẽ Graph\\ntự do (Playground)" as S5
  }
  package "OOP & SE Concepts" {
    usecase "UC-S06 Xem OOP\\nVisualization" as S6
    usecase "UC-S07 Xem SOLID\\nPrinciples Viz" as S7
    usecase "UC-S08 Xem Design\\nPatterns Viz" as S8
    usecase "UC-S09 Xem DI Container\\nSimulation" as S9
  }
  package "Learning & Gamification" {
    usecase "UC-S10 Xem E-Lecture\\nbài giảng" as S10
    usecase "UC-S11 Làm Quiz\\nvà nộp bài" as S11
    usecase "UC-S12 Nhận điểm XP\\nvà thăng cấp" as S12
    usecase "UC-S13 Xem huy hiệu\\nthành tựu" as S13
    usecase "UC-S14 Xem bảng\\nxếp hạng" as S14
  }
  package "Account" {
    usecase "UC-S15 Quản lý\\nhồ sơ cá nhân" as S15
    usecase "UC-S16 Nâng cấp\\nPremium" as S16
  }
}

Student --> S1
S1 .> S2 : <<include>>
S1 .> S3 : <<extend>>
Student --> S4
Student --> S5
Student --> S6
Student --> S7
Student --> S8
Student --> S9
Student --> S10
Student --> S11
S11 .> S12 : <<include>>
Student --> S13
Student --> S14
Student --> S15
Student --> S16
@enduml"""
    add_code_block(doc, plantuml_student, lang='PlantUML')

    # ── UC TEACHER ──
    add_heading3(doc, '3.2.3. Sơ đồ Use Case – Actor: Teacher (Giảng viên)')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'uc_teacher.png'),
              'Hình 3.4: Sơ đồ Use Case – Teacher (Giảng viên)', width_cm=13.0)
    plantuml_teacher = """\
@startuml UC_TEACHER
skinparam actorStyle awesome
left to right direction
actor "Teacher\\n(Giảng viên)" as Teacher
actor "Student\\n(Học viên)" as Student

rectangle "VisualizationDSA – Teacher Panel" {
  usecase "UC-T01 Đăng nhập\\nTeacher Panel" as T1
  usecase "UC-T02 Xem Dashboard\\nthống kê lớp" as T2
  usecase "UC-T03 Quản lý Quiz\\n(CRUD)" as T3
  usecase "UC-T04 Thêm câu hỏi\\nmới vào Quiz" as T4
  usecase "UC-T05 Sửa câu hỏi\\nhiện có" as T5
  usecase "UC-T06 Xóa câu hỏi\\nkhỏi Quiz" as T6
  usecase "UC-T07 Xem danh sách\\nhọc viên" as T7
  usecase "UC-T08 Xem kết quả\\nnộp bài học viên" as T8
  usecase "UC-T09 Thực hiện\\ncác chức năng Student" as T9
}

Teacher --> T1
T1 .> T2 : <<include>>
Teacher --> T3
T3 .> T4 : <<extend>>
T3 .> T5 : <<extend>>
T3 .> T6 : <<extend>>
Teacher --> T7
Teacher --> T8
Teacher --> T9
T9 ..> Student : <<generalize>>
@enduml"""
    add_code_block(doc, plantuml_teacher, lang='PlantUML')

    # ── UC ADMIN ──
    add_heading3(doc, '3.2.4. Sơ đồ Use Case – Actor: Admin (Quản trị viên)')
    add_image(doc, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images', 'uc_admin.png'),
              'Hình 3.5: Sơ đồ Use Case – Admin (Quản trị viên)', width_cm=13.0)
    plantuml_admin = """\
@startuml UC_ADMIN
skinparam actorStyle awesome
left to right direction
actor "Admin\\n(Quản trị viên)" as Admin

rectangle "VisualizationDSA – Admin Panel" {
  package "Dashboard" {
    usecase "UC-A01 Xem Dashboard\\nthống kê hệ thống" as A1
  }
  package "User Management" {
    usecase "UC-A02 Xem danh sách\\ntất cả người dùng" as A2
    usecase "UC-A03 Tìm kiếm\\nngười dùng" as A3
    usecase "UC-A04 Phân quyền\\nRole (Student/Teacher)" as A4
    usecase "UC-A05 Khóa / Mở khóa\\ntài khoản" as A5
    usecase "UC-A06 Nâng cấp / Hủy\\nPremium người dùng" as A6
    usecase "UC-A07 Đóng vai\\n(Impersonate) người dùng" as A7
  }
  package "Quiz Management" {
    usecase "UC-A08 Xem danh sách\\nQuiz toàn hệ thống" as A8
    usecase "UC-A09 Xóa Quiz\\nkhỏi hệ thống" as A9
  }
  package "System" {
    usecase "UC-A10 Thực hiện\\ncác chức năng Teacher" as A10
  }
}

Admin --> A1
Admin --> A2
A2 .> A3 : <<extend>>
Admin --> A4
Admin --> A5
Admin --> A6
Admin --> A7
Admin --> A8
A8 .> A9 : <<extend>>
Admin --> A10
@enduml"""
    add_code_block(doc, plantuml_admin, lang='PlantUML')

    # ── 3.3 Đặc tả SRS ────────────────────────────────────────────────────────
    add_heading2(doc, '3.3. Đặc tả yêu cầu hệ thống (SRS)')

    add_body(doc,
        'Dưới đây là đặc tả chi tiết cho các Use Case quan trọng nhất của hệ thống, '
        'bao gồm luồng chính (Main Flow), luồng thay thế (Alternative Flow) '
        'và điều kiện tiên quyết (Pre-condition).')

    # UC-01
    add_heading3(doc, 'UC-01: Xem trực quan hóa thuật toán')
    uc01 = [
        ('Mã UC', 'UC-01'),
        ('Tên Use Case', 'Xem trực quan hóa thuật toán (Visualization)'),
        ('Actor', 'Guest, Student, Teacher, Admin'),
        ('Mô tả', 'Người dùng chọn một thuật toán từ danh sách và xem hoạt hình Canvas 60 FPS trực quan hóa quá trình thực thi từng bước.'),
        ('Điều kiện tiên quyết', 'Hệ thống đang hoạt động, người dùng đang ở màn hình chính hoặc module cụ thể.'),
        ('Luồng chính', '1. Người dùng truy cập vào module DSA.\n2. Chọn thuật toán từ danh sách (VD: Bubble Sort).\n3. Nhập mảng dữ liệu hoặc dùng dữ liệu mẫu ngẫu nhiên.\n4. Nhấn nút "Run / Visualize".\n5. Frontend gọi POST /api/v1/algorithms/execute.\n6. Backend chạy thuật toán, sinh State Frames JSON.\n7. Canvas phát lại hoạt hình 60 FPS từ Frames.\n8. Người dùng điều khiển VCR: Play/Pause/Seek/Speed.'),
        ('Luồng thay thế', 'A1: Người dùng nhập dữ liệu không hợp lệ → Hiển thị lỗi validation, yêu cầu nhập lại.\nA2: Kích thước mảng vượt giới hạn an toàn → Trả về lỗi 422 SIZE_LIMIT_EXCEEDED.\nA3: Mạng ngắt kết nối → Hiển thị thông báo "Không thể kết nối máy chủ".'),
        ('Điều kiện sau', 'Hoạt hình đang phát, người dùng có thể tương tác với VCR Controls.'),
        ('File liên quan', 'AlgorithmsController.cs, BubbleSortStrategy.cs, DSAModulesView.vue, BarChartRenderer.vue'),
    ]
    table_uc01 = create_table(doc, ['Thuộc tính', 'Nội dung đặc tả'],
                               col_widths=[1.5, 5.4])
    for i, (attr, val) in enumerate(uc01):
        add_table_row(table_uc01, [attr, val],
                      centers=[False, False],
                      bolds=[True, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 3.1: Đặc tả Use Case UC-01 – Xem trực quan hóa thuật toán')

    # UC-02
    add_heading3(doc, 'UC-02: Đăng ký tài khoản mới')
    uc02 = [
        ('Mã UC', 'UC-02'),
        ('Tên Use Case', 'Đăng ký tài khoản mới'),
        ('Actor', 'Guest'),
        ('Mô tả', 'Người dùng chưa có tài khoản điền thông tin đăng ký để tạo tài khoản học viên mới trong hệ thống.'),
        ('Điều kiện tiên quyết', 'Người dùng chưa đăng nhập, đang ở màn hình Landing hoặc form đăng ký.'),
        ('Luồng chính', '1. Người dùng nhấp nút "Đăng ký / Sign Up".\n2. Điền Email, Username và Mật khẩu.\n3. Nhấn "Tạo tài khoản".\n4. Frontend gọi POST /api/v1/auth/register.\n5. Backend validate dữ liệu, hash mật khẩu BCrypt.\n6. Tạo bản ghi User trong DB, khởi tạo UserProgress XP=0, Level=1.\n7. Trả về userId và thông báo thành công.\n8. Frontend chuyển người dùng vào màn hình đăng nhập.'),
        ('Luồng thay thế', 'A1: Email đã tồn tại → Trả về lỗi 409 EMAIL_ALREADY_EXISTS.\nA2: Mật khẩu không đủ mạnh → Hiển thị yêu cầu mật khẩu, yêu cầu nhập lại.\nA3: Kết nối DB lỗi → Fallback in-memory, tạo tài khoản tạm thời.'),
        ('Điều kiện sau', 'Tài khoản Student được tạo thành công, UserProgress khởi tạo XP=0.'),
        ('File liên quan', 'StatelessAuthController.cs, StatelessAuthStrategy.cs, AuthService.cs'),
    ]
    table_uc02 = create_table(doc, ['Thuộc tính', 'Nội dung đặc tả'],
                               col_widths=[1.5, 5.4])
    for i, (attr, val) in enumerate(uc02):
        add_table_row(table_uc02, [attr, val],
                      centers=[False, False],
                      bolds=[True, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 3.2: Đặc tả Use Case UC-02 – Đăng ký tài khoản')

    # UC-03
    add_heading3(doc, 'UC-03: Làm Quiz và nhận điểm XP')
    uc03 = [
        ('Mã UC', 'UC-03'),
        ('Tên Use Case', 'Làm bài Quiz tương tác và nhận điểm XP thưởng'),
        ('Actor', 'Student'),
        ('Mô tả', 'Học viên đã đăng nhập làm bài trắc nghiệm tương tác liên kết với bài học, nộp bài và nhận XP thưởng nếu vượt qua ngưỡng điểm đạt.'),
        ('Điều kiện tiên quyết', 'Student đã đăng nhập, JWT Token còn hiệu lực.'),
        ('Luồng chính', '1. Student chọn bài học và nhấp vào Quiz.\n2. Hệ thống hiển thị các câu hỏi trắc nghiệm/điền khuyết.\n3. Student chọn đáp án hoặc nhập đoạn code còn thiếu.\n4. Nhấn nút "Nộp bài".\n5. Frontend gọi POST /api/v1/quizzes/submit với JWT.\n6. Backend chuẩn hóa mã nguồn (loại bỏ khoảng trắng thừa, chuẩn hóa dấu nháy) để chấm điểm chính xác câu hỏi điền khuyết.\n7. Nếu tổng điểm đạt >= passing_score (ngưỡng đỗ cấu hình riêng cho từng bài): cộng XP vào user_progress.\n8. Kiểm tra và mở khóa huy hiệu (thêm vào Bộ sưu tập trên Profile, cho phép chia sẻ Web Share API).\n9. Trả về kết quả: điểm số, trạng thái Đạt/Không đạt, XP nhận (chỉ trao lần đầu để chống cày điểm), và giải thích đáp án (bao gồm chỉ số chọn đúng X/Y đáp án đối với câu hỏi chọn nhiều).'),
        ('Luồng thay thế', 'A1: Token hết hạn → Trả lỗi 401, yêu cầu đăng nhập lại.\nA2: Không đạt điểm tối thiểu → Hiển thị kết quả Không đạt, hiển thị giải thích đáp án, không cộng XP.\nA3: Đã vượt qua quiz này trước đó → Trả kết quả thành công, hiển thị thông báo "Bạn đã nhận XP cho bài kiểm tra này rồi".'),
        ('Điều kiện sau', 'Lịch sử nộp bài được lưu vào user_submissions, XP cộng vào user_progress (chỉ cộng lần đầu).'),
        ('File liên quan', 'StatelessQuizController.cs, QuizBankStrategy.cs, GamificationStrategy.cs'),
    ]
    table_uc03 = create_table(doc, ['Thuộc tính', 'Nội dung đặc tả'],
                               col_widths=[1.5, 5.4])
    for i, (attr, val) in enumerate(uc03):
        add_table_row(table_uc03, [attr, val],
                      centers=[False, False],
                      bolds=[True, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 3.3: Đặc tả Use Case UC-03 – Làm Quiz và nhận XP')

    # UC-04
    add_heading3(doc, 'UC-04: Quản lý người dùng (Admin)')
    uc04 = [
        ('Mã UC', 'UC-04'),
        ('Tên Use Case', 'Quản lý người dùng hệ thống'),
        ('Actor', 'Admin'),
        ('Mô tả', 'Admin truy cập Admin Panel để xem, tìm kiếm, phân quyền, khóa/mở và nâng cấp Premium cho người dùng.'),
        ('Điều kiện tiên quyết', 'Admin đã đăng nhập, JWT Token có Role = "Admin".'),
        ('Luồng chính', '1. Admin đăng nhập và truy cập /admin.\n2. Gọi GET /api/v1/concepts/admin/dashboard lấy thống kê.\n3. Gọi GET /api/v1/concepts/admin/users?page=1 lấy danh sách.\n4. Tìm kiếm user theo email hoặc tên.\n5. Chọn hành động: Đổi role / Khóa tài khoản / Nâng cấp Premium.\n6. Admin gọi API tương ứng với JWT Admin Token.\n7. Backend thực hiện thay đổi và trả về kết quả.'),
        ('Luồng thay thế', 'A1: DB offline → Hệ thống fallback sang in-memory, vẫn hiển thị dữ liệu.\nA2: Admin cố truy cập bằng tài khoản không phải Admin → Lỗi 403 FORBIDDEN.'),
        ('Điều kiện sau', 'Thay đổi được lưu vào DB, giao diện cập nhật tức thì.'),
        ('File liên quan', 'AdminController.cs, AdminPanelView.vue, StatelessAuthStrategy.cs'),
    ]
    table_uc04 = create_table(doc, ['Thuộc tính', 'Nội dung đặc tả'],
                               col_widths=[1.5, 5.4])
    for i, (attr, val) in enumerate(uc04):
        add_table_row(table_uc04, [attr, val],
                      centers=[False, False],
                      bolds=[True, False],
                      alt_row=(i % 2 == 1))
    doc.add_paragraph()
    add_caption(doc, 'Bảng 3.4: Đặc tả Use Case UC-04 – Quản lý người dùng (Admin)')

    add_page_break(doc)


def run() -> None:
    filepath = get_output_path()
    doc = load_document(filepath)
    print('[Phase 3] Đang thêm: Phần 3 – Phân tích...')
    build_phan3(doc)
    save_document(doc, filepath)
    print('[Phase 3] HOÀN THÀNH.\n')


if __name__ == '__main__':
    run()
