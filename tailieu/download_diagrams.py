# -*- coding: utf-8 -*-
"""
download_diagrams.py
Tự động gọi Kroki API để tải về tất cả các sơ đồ PlantUML và Mermaid thành ảnh PNG thực tế.
"""
import os
import urllib.request
import urllib.parse
import json
import sys
import io

# Fix Unicode output tren Windows console
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


# Danh sách diagram định nghĩa
DIAGRAMS = {
    # ── 1. Client-Server Model ──
    'client_server.png': ('plantuml', """
@startuml
skinparam backgroundColor #1a1a2e
skinparam ArrowColor #00d2ff
skinparam rectangle {
  BackgroundColor #16213e
  BorderColor #00d2ff
  FontColor white
}
node "TẦNG TRÌNH BÀY (Vue 3 SPA)" as FE #16213e {
  [Vite + TypeScript]
  [Pinia Store System]
  [Canvas 60 FPS Engine]
}
node "TẦNG WEB API (ASP.NET Core)" as BE #0f3460 {
  [22 REST Controllers]
  [Middleware JWT]
  [Strategy Pattern]
}
database "CƠ SỞ DỮ LIỆU" as DB #e94560 {
  [PostgreSQL (Supabase)]
}
FE --> BE : "HTTPS / JWT Bearer"
BE --> DB : "EF Core ORM"
@enduml
"""),

    # ── 2. Use Case Guest ──
    'uc_guest.png': ('plantuml', """
@startuml
left to right direction
skinparam actorStyle awesome
actor "Guest\\n(Khách vãng lai)" as Guest
rectangle "VisualizationDSA System" {
  usecase "UC-G01: Xem Landing Page" as G1
  usecase "UC-G02: Xem demo Visualization" as G2
  usecase "UC-G03: Xem giới thiệu các Module" as G3
  usecase "UC-G04: Đăng ký tài khoản" as G4
  usecase "UC-G05: Đăng nhập tài khoản" as G5
}
Guest --> G1
Guest --> G2
Guest --> G3
Guest --> G4
Guest --> G5
G4 .> G5 : <<include>>
@enduml
"""),

    # ── 3. Use Case Student ──
    'uc_student.png': ('plantuml', """
@startuml
left to right direction
skinparam actorStyle awesome
actor "Student\\n(Học viên)" as Student
rectangle "VisualizationDSA – Student" {
  usecase "UC-S01: Xem Visualization DSA" as S1
  usecase "UC-S02: Điều khiển VCR Playback" as S2
  usecase "UC-S03: So sánh thuật toán" as S3
  usecase "UC-S04: Vẽ Graph Playground" as S4
  usecase "UC-S05: Xem OOP & SOLID Visualizer" as S5
  usecase "UC-S06: Làm Quiz và nộp bài" as S6
  usecase "UC-S07: Nhận XP & Thăng cấp" as S7
  usecase "UC-S08: Quản lý hồ sơ" as S8
  usecase "UC-S09: Nâng cấp Premium" as S9
}
Student --> S1
S1 .> S2 : <<include>>
Student --> S3
Student --> S4
Student --> S5
Student --> S6
S6 .> S7 : <<include>>
Student --> S8
Student --> S9
@enduml
"""),

    # ── 4. Use Case Teacher ──
    'uc_teacher.png': ('plantuml', """
@startuml
left to right direction
skinparam actorStyle awesome
actor "Teacher\\n(Giảng viên)" as Teacher
rectangle "VisualizationDSA – Teacher Panel" {
  usecase "UC-T01: Xem Dashboard lớp" as T1
  usecase "UC-T02: Quản lý Quiz (CRUD)" as T2
  usecase "UC-T03: Xem kết quả nộp bài" as T3
  usecase "UC-T04: Thực hiện chức năng Student" as T4
}
Teacher --> T1
Teacher --> T2
Teacher --> T3
Teacher --> T4
@enduml
"""),

    # ── 5. Use Case Admin ──
    'uc_admin.png': ('plantuml', """
@startuml
left to right direction
skinparam actorStyle awesome
actor "Admin\\n(Quản trị viên)" as Admin
rectangle "VisualizationDSA – Admin Panel" {
  usecase "UC-A01: Xem Dashboard hệ thống" as A1
  usecase "UC-A02: Quản lý Users (CRUD, Ban)" as A2
  usecase "UC-A03: Phân quyền Role" as A3
  usecase "UC-A04: Đóng vai (Impersonate) User" as A4
  usecase "UC-A05: Xem danh sách Quiz" as A5
}
Admin --> A1
Admin --> A2
Admin --> A3
Admin --> A4
Admin --> A5
@enduml
"""),

    # ── 6. ERD Overview ──
    'erd_overview.png': ('mermaid', """
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
        bool is_premium
        string role
        bool is_active
    }
"""),

    # ── 7. ERD Detail ──
    'erd_detail.png': ('mermaid', """
erDiagram
    USERS ||--o{ LEARNING_PROGRESSES : "has"
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
    LEARNING_PROGRESSES {
        UUID id PK
        UUID user_id FK
        string module_id
        datetime completed_at
    }
"""),

    # ── 8. Class Clean Arch ──
    'class_clean_arch.png': ('plantuml', """
@startuml
skinparam classAttributeIconSize 0
package "WebApi" {
  class AlgorithmsController
  class AdminController
  class StatelessAuthController
}
package "Application" {
  interface IAlgorithmStrategy
  class AuthService
}
package "Domain" {
  class User
  class BubbleSortStrategy
  class StatelessAuthStrategy
}
package "Infrastructure" {
  class ApplicationDbContext
}
AlgorithmsController --> IAlgorithmStrategy
AdminController --> ApplicationDbContext
AdminController --> StatelessAuthStrategy
StatelessAuthController --> StatelessAuthStrategy
BubbleSortStrategy ..|> IAlgorithmStrategy
ApplicationDbContext --> User
AuthService --> ApplicationDbContext
@enduml
"""),

    # ── 9. Class Strategy ──
    'class_strategy.png': ('plantuml', """
@startuml
interface IAlgorithmStrategy {
  +AlgorithmId: string
  +Name: string
  +Execute(input, token): List<Frame>
}
class BubbleSortStrategy {
  +Execute(input, token): List<Frame>
}
class QuickSortStrategy {
  +Execute(input, token): List<Frame>
}
class DijkstraStrategy {
  +Execute(input, token): List<Frame>
}
BubbleSortStrategy ..|> IAlgorithmStrategy
QuickSortStrategy ..|> IAlgorithmStrategy
DijkstraStrategy ..|> IAlgorithmStrategy
@enduml
"""),

    # ── 10. Sequence Algorithm ──
    'seq_algorithm.png': ('plantuml', """
@startuml
actor User
participant "Vue 3 Frontend" as FE
participant "vcrStore (Pinia)" as Store
participant "Web API" as API
participant "Strategy" as Strat
User -> FE : Nhấn "Run / Visualize"
FE -> API : POST /api/v1/algorithms/custom-execute
activate API
API -> Strat : Execute(input)
activate Strat
Strat --> API : List<FrameDTO>
deactivate Strat
API --> FE : 200 OK { frames: [...] }
deactivate API
FE -> Store : loadFrames(frames)
loop Animation Loop (60 FPS)
  FE -> FE : draw(currentFrame)
end
@enduml
"""),

    # ── 11. Sequence Auth ──
    'seq_auth.png': ('plantuml', """
@startuml
actor User
participant "LoginView.vue" as FE
participant "AuthController" as Auth
participant "StatelessAuthStrategy" as Strategy
participant "PostgreSQL DB" as DB
User -> FE : Nhập email + password
FE -> Auth : POST /api/v1/stateless-auth/login
activate Auth
Auth -> Strategy : Authenticate(email, password)
activate Strategy
Strategy -> DB : Query User
alt DB Available
  DB --> Strategy : User
else DB Offline (Fallback)
  Strategy -> Strategy : Check In-Memory list
end
Strategy --> Auth : Token
deactivate Strategy
Auth --> FE : 200 OK { token }
deactivate Auth
@enduml
"""),

    # ── 12. Activity Quiz ──
    'activity_quiz.png': ('plantuml', """
@startuml
start
:Học viên nhấn nút Làm Quiz;
:Hiển thị danh sách câu hỏi;
:Học viên chọn các đáp án;
:Nhấn nộp bài;
if (Đạt điểm tối thiểu?) then (Có)
  :Cộng điểm XP;
  if (Đủ XP thăng cấp?) then (Có)
    :Tăng Cấp bậc;
    :Hiển thị hiệu ứng thăng cấp;
  endif
else (Không)
  :Hiển thị kết quả, gợi ý học lại;
endif
stop
@enduml
"""),

    # ── 13. Deploy Flow ──
    'deploy_flow.png': ('mermaid', """
graph TD
    A[Source Code] --> B{Build}
    B -->|Frontend| C[Vite Build dist/]
    B -->|Backend| D[Dotnet Publish publish/]
    C --> E[Vercel Static Hosting]
    D --> F[Docker Container]
    F --> G[Production Hosting / Server]
"""),
}


def download_all():
    image_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'images')
    os.makedirs(image_dir, exist_ok=True)
    
    print("======================================================")
    print("   DOWNLOAD DIAGRAMS FROM KROKI API TO IMAGES DIR")
    print("======================================================")

    for filename, (diag_type, diag_src) in DIAGRAMS.items():
        filepath = os.path.join(image_dir, filename)
        print(f"-> Đang tải {filename} ({diag_type})...")
        
        # Kroki API URL
        url = f"https://kroki.io/{diag_type}/png"
        
        try:
            req = urllib.request.Request(
                url, 
                data=diag_src.strip().encode('utf-8'), 
                headers={
                    'Content-Type': 'text/plain',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }, 
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                png_data = response.read()
                
            with open(filepath, 'wb') as f:
                f.write(png_data)
            print(f"   [OK] Đã lưu vào {filepath}")
        except Exception as e:
            print(f"   [LỖI] Không thể tải {filename}: {e}")

    print("\n======================================================")
    print("   HOÀN THÀNH TẢI TẤT CẢ DIAGRAMS!")
    print("======================================================")


if __name__ == '__main__':
    download_all()
