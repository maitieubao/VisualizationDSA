# 🗄️ Thiết Kế Cơ Sở Dữ Liệu Quan Hệ - Relational Database Schema

Tài liệu này đặc tả chi tiết kiến trúc cơ sở dữ liệu quan hệ (Entity Relationship Schema) trong PostgreSQL phục vụ dự án **VisualizationDSA**. Toàn bộ lược đồ được tối ưu hóa cho hiệu năng phản hồi dưới 5ms, toàn vẹn dữ liệu ở mức cao nhất thông qua các ràng buộc ràng buộc khóa và cơ chế tự động hóa bằng Triggers.

---

## 1. Lược Đồ Thực Thể Quan Hệ (Entity Relationship Diagram - ERD)

Dưới đây là sơ đồ thực thể quan hệ biểu diễn sự liên kết chặt chẽ giữa tài khoản người dùng, tiến trình học tập, thư viện thuật toán động, hệ thống trắc nghiệm canvas tương tác, và cơ cấu widget nhúng Iframe chia sẻ standalone:

```mermaid
erDiagram
    USERS ||--|| USER_PROGRESS : "has progress"
    USERS ||--oN USER_SUBMISSIONS : "submits"
    USERS ||--oN EMBEDDING_WIDGETS : "owns widgets"
    USERS ||--oN USER_CUSTOM_PLAYGROUNDS : "saves playgrounds"
    USERS ||--oN USER_UNLOCKED_ACHIEVEMENTS : "unlocks"
    
    ALGORITHMS ||--oN QUIZZES : "associated with"
    ALGORITHMS ||--oN EMBEDDING_WIDGETS : "visualizes"
    
    QUIZZES ||--oN QUIZ_QUESTIONS : "contains"
    QUIZZES ||--oN USER_SUBMISSIONS : "has submissions"
    
    ACHIEVEMENTS ||--oN USER_UNLOCKED_ACHIEVEMENTS : "earned in"

    USERS {
        VARCHAR_50 id PK
        VARCHAR_100 email UK
        VARCHAR_255 password_hash
        VARCHAR_50 role
        VARCHAR_255 avatar_url
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    USER_PROGRESS {
        VARCHAR_50 id PK
        VARCHAR_50 user_id FK,UK
        INT current_xp
        INT current_level
        INT algorithms_completed
        INT quizzes_completed
        TIMESTAMP updated_at
    }

    ALGORITHMS {
        VARCHAR_50 id PK "slug: dijkstra, bubble-sort"
        VARCHAR_100 name
        TEXT description
        VARCHAR_50 category "SORTING, GRAPH, SOLID..."
        VARCHAR_50 complexity_time
        VARCHAR_50 complexity_space
        VARCHAR_30 difficulty "EASY, MEDIUM, HARD"
        TIMESTAMP created_at
    }

    QUIZZES {
        VARCHAR_50 id PK
        VARCHAR_50 algorithm_id FK,NULL
        VARCHAR_150 title
        TEXT instructions_md
        INT max_score
        INT xp_reward
        INT passing_score
        BOOLEAN is_active
        TIMESTAMP created_at
    }

    QUIZ_QUESTIONS {
        VARCHAR_50 id PK
        VARCHAR_50 quiz_id FK
        TEXT question_text
        VARCHAR_50 question_type "MULTIPLE_CHOICE, FILL_IN_BLANK"
        JSONB options_json
        TEXT correct_answer
        TIMESTAMP created_at
    }

    USER_SUBMISSIONS {
        VARCHAR_50 id PK
        VARCHAR_50 user_id FK
        VARCHAR_50 quiz_id FK
        INT score
        BOOLEAN passed
        INT xp_rewarded
        TEXT submitted_code
        JSONB answers_json
        BOOLEAN compliant "SOLID AST compliant"
        TIMESTAMP submitted_at
    }

    ACHIEVEMENTS {
        VARCHAR_50 id PK
        VARCHAR_100 name
        TEXT description
        VARCHAR_100 badge_icon_neon
        VARCHAR_50 requirement_type "XP, QUIZ_COUNT"
        INT requirement_value
        INT xp_reward
        TIMESTAMP created_at
    }

    USER_UNLOCKED_ACHIEVEMENTS {
        VARCHAR_50 user_id PK,FK
        VARCHAR_50 achievement_id PK,FK
        TIMESTAMP unlocked_at
    }

    EMBEDDING_WIDGETS {
        VARCHAR_50 id PK "UUID format"
        VARCHAR_50 user_id FK,NULL
        VARCHAR_50 algorithm_id FK
        VARCHAR_150 title
        VARCHAR_50 theme "GLASS_SLATE_DARK"
        INT width
        INT height
        BOOLEAN allow_interaction
        JSONB custom_data_json "drawn nodes, edge weights"
        TEXT custom_code
        TIMESTAMP created_at
    }

    USER_CUSTOM_PLAYGROUNDS {
        VARCHAR_50 id PK
        VARCHAR_50 user_id FK
        VARCHAR_100 name
        VARCHAR_50 algorithm_type
        JSONB custom_data_json
        TEXT custom_code
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
```

---

## 2. Đặc Tả Chi Tiết Các Bảng Dữ Liệu (Detailed Table Schemas)

### 2.1. Bảng `users` (Thông tin tài khoản người dùng)
*   **Mô tả:** Lưu trữ danh tính học viên, phân quyền và ngày khởi tạo hệ thống.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Khóa chính tự sinh (UUID hoặc Student ID) |
| `email` | `VARCHAR(100)` | | UNIQUE, NOT NULL | Địa chỉ email duy nhất đăng nhập |
| `password_hash` | `VARCHAR(255)` | | NOT NULL | Mật khẩu băm Bcrypt bảo mật cao |
| `role` | `VARCHAR(50)` | | NOT NULL, DEFAULT 'STUDENT' | Quyền truy cập: 'ADMIN', 'STUDENT' |
| `avatar_url` | `VARCHAR(255)` | | NULL | Đường dẫn ảnh đại diện học viên |
| `created_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày tạo tài khoản |
| `updated_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật tài khoản gần nhất |

### 2.2. Bảng `user_progress` (Tiến trình tích lũy XP & Level)
*   **Mô tả:** Lưu trữ điểm kinh nghiệm tích lũy XP thực tế, thăng hạng cấp độ Neon và số lượng bài hoàn thành.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Khóa chính tiến trình |
| `user_id` | `VARCHAR(50)` | FK | UNIQUE, REFERENCES `users`(id) ON DELETE CASCADE | Liên kết tài khoản người dùng duy nhất |
| `current_xp` | `INT` | | DEFAULT 0, CHECK (`current_xp` >= 0) | Điểm kinh nghiệm tích lũy Neon hiện tại |
| `current_level` | `INT` | | DEFAULT 1, CHECK (`current_level` >= 1) | Cấp bậc Neon hiện thời (1-100) |
| `algorithms_completed` | `INT` | | DEFAULT 0, CHECK (`algorithms_completed` >= 0) | Tổng số thuật toán học viên đã click khám phá |
| `quizzes_completed` | `INT` | | DEFAULT 0, CHECK (`quizzes_completed` >= 0) | Tổng số bài trắc nghiệm đã hoàn thành xuất sắc |
| `updated_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Thời gian cập nhật trạng thái gần nhất |

### 2.3. Bảng `algorithms` (Thư viện thuật toán cốt lõi)
*   **Mô tả:** Chứa danh mục thông tin định nghĩa, thời gian và độ phức tạp của các thuật toán được hiển thị.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Định danh duy nhất (dạng slug viết thường, ví dụ: 'dijkstra') |
| `name` | `VARCHAR(100)` | | NOT NULL | Tên hiển thị đầy đủ (ví dụ: 'Dijkstra Shortest Path') |
| `description` | `TEXT` | | NOT NULL | Mô tả chi tiết về nguyên lý hoạt động của thuật toán |
| `category` | `VARCHAR(50)` | | NOT NULL | Danh mục thuật toán: 'SORTING', 'GRAPH', 'BALANCED_TREES', 'SOLID' |
| `complexity_time` | `VARCHAR(50)` | | NOT NULL | Độ phức tạp thời gian Big-O (ví dụ: 'O(E log V)') |
| `complexity_space` | `VARCHAR(50)` | | NOT NULL | Độ phức tạp không gian Big-O (ví dụ: 'O(V + E)') |
| `difficulty` | `VARCHAR(30)` | | NOT NULL, CHECK in ('EASY', 'MEDIUM', 'HARD') | Độ khó phân chia: EASY, MEDIUM, HARD |
| `created_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật thuật toán vào hệ thống |

### 2.4. Bảng `quizzes` (Bài kiểm tra trắc nghiệm tương tác)
*   **Mô tả:** Bài tập trắc nghiệm Canvas liên kết trực tiếp với các mô-đun bài học giải thuật.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Khóa chính bài trắc nghiệm |
| `algorithm_id` | `VARCHAR(50)` | FK | REFERENCES `algorithms`(id) ON DELETE SET NULL | Thuật toán liên quan (có thể NULL nếu là quiz chung) |
| `title` | `VARCHAR(150)` | | NOT NULL | Tiêu đề của bài kiểm tra tương tác |
| `instructions_md` | `TEXT` | | NOT NULL | Hướng dẫn làm bài viết bằng ngôn ngữ Markdown |
| `max_score` | `INT` | | NOT NULL, CHECK (`max_score` > 0) | Điểm tối đa có thể đạt được (ví dụ: 10) |
| `xp_reward` | `INT` | | NOT NULL, CHECK (`xp_reward` >= 0) | Lượng điểm XP thưởng thêm khi hoàn thành |
| `passing_score` | `INT` | | NOT NULL, CHECK (`passing_score` > 0) | Điểm tối thiểu yêu cầu vượt qua bài tập |
| `is_active` | `BOOLEAN` | | DEFAULT TRUE | Trạng thái kích hoạt phục vụ giảng dạy |
| `created_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày khởi tạo bài kiểm tra |

### 2.5. Bảng `quiz_questions` (Chi tiết câu hỏi bài kiểm tra)
*   **Mô tả:** Chứa các câu hỏi chi tiết thuộc từng bộ quiz, lưu trữ cấu trúc tùy chọn đáp án bằng JSONB hiệu năng cao.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Khóa chính câu hỏi |
| `quiz_id` | `VARCHAR(50)` | FK | REFERENCES `quizzes`(id) ON DELETE CASCADE | Thuộc bài kiểm tra nào |
| `question_text` | `TEXT` | | NOT NULL | Nội dung câu hỏi hiển thị cho học sinh |
| `question_type` | `VARCHAR(50)` | | NOT NULL | Thể loại câu hỏi: 'MULTIPLE_CHOICE', 'FILL_IN_BLANK' |
| `options_json` | `JSONB` | | NULL | Mảng JSON chứa các đáp án trắc nghiệm tùy chọn |
| `correct_answer` | `TEXT` | | NOT NULL | Đáp án chính xác được đối chiếu khi chấm điểm |
| `created_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày khởi tạo câu hỏi |

### 2.6. Bảng `user_submissions` (Lịch sử nộp bài trắc nghiệm)
*   **Mô tả:** Ghi nhận toàn bộ thông tin nộp bài, điểm số thực tế, mã nguồn đệ trình và kiểm định compliance AST.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Khóa chính lượt nộp bài |
| `user_id` | `VARCHAR(50)` | FK | REFERENCES `users`(id) ON DELETE CASCADE | Học viên nộp bài |
| `quiz_id` | `VARCHAR(50)` | FK | REFERENCES `quizzes`(id) ON DELETE CASCADE | Nộp cho bài trắc nghiệm nào |
| `score` | `INT` | | NOT NULL, CHECK (`score` >= 0) | Điểm số đạt được trong lượt nộp này |
| `passed` | `BOOLEAN` | | NOT NULL | Trạng thái đạt yêu cầu (`score` >= `passing_score`) |
| `xp_rewarded` | `INT` | | DEFAULT 0 | Lượng điểm XP thực nhận (chỉ nhận lần đầu vượt qua) |
| `submitted_code` | `TEXT` | | NULL | Lưu vết mã nguồn Monaco Editor sinh viên nộp |
| `answers_json` | `JSONB` | | NOT NULL | Chi tiết các đáp án học viên đã lựa chọn |
| `compliant` | `BOOLEAN` | | DEFAULT TRUE | Mã nguồn vượt qua kiểm định AST tĩnh (SOLID compliance) |
| `submitted_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Thời điểm nộp bài |

### 2.7. Bảng `achievements` (Danh mục thành tựu & Huy hiệu Neon)
*   **Mô tả:** Định nghĩa các huy hiệu Neon tuyệt đẹp để trao tặng cho nỗ lực học tập của học viên.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Định danh thành tựu (slug) |
| `name` | `VARCHAR(100)` | | NOT NULL | Tên huy hiệu Neon rực rỡ (ví dụ: 'Graph Master') |
| `description` | `TEXT` | | NOT NULL | Mô tả nhiệm vụ cần đạt được để nhận huy hiệu |
| `badge_icon_neon` | `VARCHAR(100)` | | NOT NULL | SVG class hoặc CSS Neon icon bọc mờ kính |
| `requirement_type` | `VARCHAR(50)` | | NOT NULL | Loại yêu cầu: 'XP', 'QUIZ_COUNT', 'ALGO_COUNT' |
| `requirement_value` | `INT` | | NOT NULL, CHECK (`requirement_value` > 0) | Giá trị định lượng cần đạt (ví dụ: 1000 XP) |
| `xp_reward` | `INT` | | DEFAULT 0, CHECK (`xp_reward` >= 0) | XP thưởng thêm khi mở khóa thành quả |
| `created_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật thành tựu vào hệ thống |

### 2.8. Bảng `user_unlocked_achievements` (Lịch sử mở khóa huy hiệu)
*   **Mô tả:** Bảng trung gian lưu vết những huy hiệu Neon từng học viên đã nỗ lực đạt được.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `user_id` | `VARCHAR(50)` | PK, FK | REFERENCES `users`(id) ON DELETE CASCADE | Học viên sở hữu |
| `achievement_id` | `VARCHAR(50)` | PK, FK | REFERENCES `achievements`(id) ON DELETE CASCADE | Huy hiệu tương ứng |
| `unlocked_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày học viên bứt phá mở khóa thành tựu |

### 2.9. Bảng `embedding_widgets` (Cấu hình Iframe nhúng Sandbox)
*   **Mô tả:** Lưu giữ thiết lập Iframe nhúng standalone tùy biến do sinh viên hoặc giảng viên chia sẻ sang các nền tảng khác.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Định danh dạng UUID chuỗi ngẫu nhiên |
| `user_id` | `VARCHAR(50)` | FK | REFERENCES `users`(id) ON DELETE SET NULL, NULL | Người tạo widget (cho phép NULL nếu ẩn danh) |
| `algorithm_id` | `VARCHAR(50)` | FK | REFERENCES `algorithms`(id) ON DELETE CASCADE | Thuật toán cấu hình nhúng hiển thị |
| `title` | `VARCHAR(150)` | | NOT NULL | Tiêu đề của Iframe nhúng |
| `theme` | `VARCHAR(50)` | | DEFAULT 'GLASS_SLATE_DARK' | Phối màu neon hiển thị: GLASS_SLATE_DARK, NEON_CYAN_LIGHT... |
| `width` | `INT` | | NOT NULL, CHECK (`width` >= 200) | Chiều rộng Iframe (đơn vị pixel) |
| `height` | `INT` | | NOT NULL, CHECK (`height` >= 200) | Chiều cao Iframe (đơn vị pixel) |
| `allow_interaction` | `BOOLEAN` | | DEFAULT TRUE | Cho phép học viên khác bấm chạy VCR và tương tác Canvas |
| `custom_data_json` | `JSONB` | | NULL | Chứa các node, cạnh, trọng số đồ thị tự vẽ trước khi chia sẻ |
| `custom_code` | `TEXT` | | NULL | Code Monaco tùy chỉnh lưu trong widget nhúng |
| `created_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày xuất bản Widget nhúng |

### 2.10. Bảng `user_custom_playgrounds` (Sân chơi tự do được lưu trữ)
*   **Mô tả:** Cho phép học sinh lưu giữ lại toàn bộ các thiết kế đồ thị Dijkstra tự vẽ, mảng hoán vị Bubble Sort, hay thiết kế System Design server bốc khói để tiếp tục chỉnh sửa sau.

| Tên trường | Kiểu dữ liệu | Khóa | Ràng buộc | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `VARCHAR(50)` | PK | NOT NULL | Khóa chính sân chơi tự do |
| `user_id` | `VARCHAR(50)` | FK | REFERENCES `users`(id) ON DELETE CASCADE | Chủ nhân sở hữu sân chơi |
| `name` | `VARCHAR(100)` | | NOT NULL | Tên sân chơi tự đặt (ví dụ: 'Dijkstra Đồ Thị Bài Tập 1') |
| `algorithm_type` | `VARCHAR(50)` | | NOT NULL | Loại sân chơi thuật toán liên quan |
| `custom_data_json` | `JSONB` | | NOT NULL | Dữ liệu đồ họa tự thiết kế (tọa độ các node, liên kết...) |
| `custom_code` | `TEXT` | | NULL | Code Monaco cá nhân hóa của sinh viên trong sân chơi này |
| `created_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày lưu trữ ban đầu |
| `updated_at` | `TIMESTAMP` | | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật thay đổi cuối cùng |

---

## 3. Bản Kịch Bản DDL Tạo Bảng Cơ Sở Dữ Liệu (DDL SQL Creation Script)

Dưới đây là mã SQL DDL chuẩn hóa PostgreSQL thiết lập toàn bộ cơ cấu bảng, ràng buộc và xử lý khóa ngoại tự động:

```sql
-- Kích hoạt extension hỗ trợ sinh UUID ngẫu nhiên nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. BẢNG USERS
-- =========================================================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 2. BẢNG USER_PROGRESS
-- =========================================================================
CREATE TABLE user_progress (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    current_xp INT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    algorithms_completed INT NOT NULL DEFAULT 0,
    quizzes_completed INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_xp CHECK (current_xp >= 0),
    CONSTRAINT chk_level CHECK (current_level >= 1),
    CONSTRAINT chk_algos CHECK (algorithms_completed >= 0),
    CONSTRAINT chk_quizzes CHECK (quizzes_completed >= 0)
);

-- =========================================================================
-- 3. BẢNG ALGORITHMS
-- =========================================================================
CREATE TABLE algorithms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    complexity_time VARCHAR(50) NOT NULL,
    complexity_space VARCHAR(50) NOT NULL,
    difficulty VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_difficulty CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD'))
);

-- =========================================================================
-- 4. BẢNG QUIZZES
-- =========================================================================
CREATE TABLE quizzes (
    id VARCHAR(50) PRIMARY KEY,
    algorithm_id VARCHAR(50) NULL,
    title VARCHAR(150) NOT NULL,
    instructions_md TEXT NOT NULL,
    max_score INT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 100,
    passing_score INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_quizzes_algo FOREIGN KEY (algorithm_id) REFERENCES algorithms(id) ON DELETE SET NULL,
    CONSTRAINT chk_max_score CHECK (max_score > 0),
    CONSTRAINT chk_xp_reward CHECK (xp_reward >= 0),
    CONSTRAINT chk_passing CHECK (passing_score > 0)
);

-- =========================================================================
-- 5. BẢNG QUIZ_QUESTIONS
-- =========================================================================
CREATE TABLE quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    options_json JSONB NULL,
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- =========================================================================
-- 6. BẢNG USER_SUBMISSIONS
-- =========================================================================
CREATE TABLE user_submissions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    quiz_id VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    passed BOOLEAN NOT NULL,
    xp_rewarded INT NOT NULL DEFAULT 0,
    submitted_code TEXT NULL,
    answers_json JSONB NOT NULL,
    compliant BOOLEAN NOT NULL DEFAULT TRUE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT chk_score CHECK (score >= 0)
);

-- =========================================================================
-- 7. BẢNG ACHIEVEMENTS
-- =========================================================================
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    badge_icon_neon VARCHAR(100) NOT NULL,
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_req_val CHECK (requirement_value > 0),
    CONSTRAINT chk_ach_xp CHECK (xp_reward >= 0)
);

-- =========================================================================
-- 8. BẢNG USER_UNLOCKED_ACHIEVEMENTS
-- =========================================================================
CREATE TABLE user_unlocked_achievements (
    user_id VARCHAR(50) NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, achievement_id),
    CONSTRAINT fk_unlocked_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_unlocked_ach FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- =========================================================================
-- 9. BẢNG EMBEDDING_WIDGETS
-- =========================================================================
CREATE TABLE embedding_widgets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NULL,
    algorithm_id VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    theme VARCHAR(50) NOT NULL DEFAULT 'GLASS_SLATE_DARK',
    width INT NOT NULL,
    height INT NOT NULL,
    allow_interaction BOOLEAN NOT NULL DEFAULT TRUE,
    custom_data_json JSONB NULL,
    custom_code TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_widgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_widgets_algo FOREIGN KEY (algorithm_id) REFERENCES algorithms(id) ON DELETE CASCADE,
    CONSTRAINT chk_width CHECK (width >= 200),
    CONSTRAINT chk_height CHECK (height >= 200)
);

-- =========================================================================
-- 10. BẢNG USER_CUSTOM_PLAYGROUNDS
-- =========================================================================
CREATE TABLE user_custom_playgrounds (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    algorithm_type VARCHAR(50) NOT NULL,
    custom_data_json JSONB NOT NULL,
    custom_code TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_playgrounds_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 4. Tự Động Hóa Kịch Bản Cập Nhật Triggers & Functions (Triggers automation)

Để đảm bảo hiệu năng và tính tự động hóa cao nhất, PostgreSQL chịu trách nhiệm cập nhật thời gian sửa đổi và tự động khởi tạo tiến trình XP ngay khi học viên đăng ký tài khoản thành công:

```sql
-- =========================================================================
-- TRIGGER 1: TỰ ĐỘNG CẬP NHẬT cột 'updated_at' KHI CÓ EDIT
-- =========================================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn trigger cho bảng users
CREATE TRIGGER trg_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();

-- Gắn trigger cho bảng user_custom_playgrounds
CREATE TRIGGER trg_playgrounds_timestamp
BEFORE UPDATE ON user_custom_playgrounds
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();

-- =========================================================================
-- TRIGGER 2: TỰ ĐỘNG TẠO BẢN GHI 'user_progress' KHI CÓ USER MỚI
-- =========================================================================
CREATE OR REPLACE FUNCTION fn_initialize_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_progress (id, user_id, current_xp, current_level, algorithms_completed, quizzes_completed)
    VALUES (
        'PRG_' || TG_TABLE_NAME || '_' || substring(NEW.id, 1, 8) || '_' || to_char(CURRENT_TIMESTAMP, 'FMHH24MISS'),
        NEW.id,
        0,
        1,
        0,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn trigger tự tạo bảng tiến trình khi thêm mới người dùng thành công
CREATE TRIGGER trg_init_user_progress
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION fn_initialize_user_progress();
```

---

## 5. Đánh Chỉ Mục Tăng Tốc Tìm Kiếm (Performance Database Indexes)

Để cam kết độ nhạy phản hồi dữ liệu máy chủ luôn luôn dưới **5ms** cho học sinh ngay cả khi số lượng dữ liệu mở rộng hàng ngàn bản ghi, chúng ta đặt các index tối ưu hóa:

```sql
-- Tăng tốc độ truy cập hồ sơ tiến trình và thăng hạng xếp hạng học viên
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_xp ON user_progress(current_xp DESC);

-- Tăng tốc tải danh sách câu hỏi theo bài kiểm tra
CREATE INDEX idx_questions_quiz_id ON quiz_questions(quiz_id);

-- Tăng tốc độ truy xuất các widget nhúng Iframe theo thuật toán và người sở hữu
CREATE INDEX idx_widgets_search ON embedding_widgets(algorithm_id, user_id);

-- Tối ưu hóa truy vấn tìm kiếm lịch sử làm bài trắc nghiệm của sinh viên
CREATE INDEX idx_submissions_lookup ON user_submissions(user_id, quiz_id);

-- Tăng tốc tìm kiếm sân chơi lưu trữ cá nhân theo người sở hữu
CREATE INDEX idx_playgrounds_owner ON user_custom_playgrounds(user_id);
```

---

## 6. Gieo Dữ Liệu Khởi Tạo Mẫu (Seed Data Script)

Bộ dữ liệu mẫu phục vụ phát triển ngay từ giai đoạn 1, bao gồm các cấu trúc dữ liệu kinh điển và bài kiểm tra trắc nghiệm tương tác:

```sql
-- Gieo dữ liệu Thuật toán
INSERT INTO algorithms (id, name, description, category, complexity_time, complexity_space, difficulty) VALUES
('bubble-sort', 'Bubble Sort (Sắp xếp nổi bọt)', 'Thuật toán sắp xếp đơn giản hoạt động bằng cách hoán đổi liên tiếp các phần tử liền kề nếu chúng sai vị trí.', 'SORTING', 'O(N^2)', 'O(1)', 'EASY'),
('dijkstra', 'Dijkstra (Tìm đường đi ngắn nhất)', 'Tìm đường đi ngắn nhất từ một nút nguồn đến mọi nút còn lại trong đồ thị có trọng số không âm.', 'GRAPH', 'O(E log V)', 'O(V + E)', 'MEDIUM'),
('avl-tree', 'AVL Tree Balancing (Cân bằng cây AVL)', 'Cây tìm kiếm nhị phân tự cân bằng, duy trì chênh lệch chiều cao giữa hai cây con trái/phải không vượt quá 1.', 'BALANCED_TREES', 'O(log N)', 'O(N)', 'HARD'),
('solid-srp', 'Single Responsibility Principle (SRP)', 'Đo lường độ kết dính các phương thức lớp (Cohesion LCOM4) và minh chứng trực quan nguyên lý SOLID đơn trách nhiệm.', 'SOLID', 'O(V + E)', 'O(V + E)', 'MEDIUM');

-- Gieo dữ liệu bài trắc nghiệm tương tác
INSERT INTO quizzes (id, algorithm_id, title, instructions_md, max_score, xp_reward, passing_score, is_active) VALUES
('QZ_BUBBLE_SORT', 'bubble-sort', 'Trắc Nghiệm Bubble Sort Học Phần 1', 'Hãy chứng minh bạn hiểu rõ nguyên lý hoán vị Bubble Sort qua việc trả lời 2 câu hỏi sau để giành lấy 150 XP thưởng.', 10, 150, 10, TRUE),
('QZ_DIJKSTRA', 'dijkstra', 'Thử Thách Đồ Thị Dijkstra', 'Nhấp các nút tương tác để kiểm tra khả năng tìm kiếm đường đi tối ưu Dijkstra.', 10, 200, 10, TRUE);

-- Gieo các câu hỏi chi tiết
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, options_json, correct_answer) VALUES
('Q_BS_1', 'QZ_BUBBLE_SORT', 'Độ phức tạp thời gian trường hợp xấu nhất (Worst-case) của Bubble Sort là gì?', 'MULTIPLE_CHOICE', '["O(N)", "O(N log N)", "O(N^2)", "O(1)"]', 'O(N^2)'),
('Q_BS_2', 'QZ_BUBBLE_SORT', 'Hãy điền lệnh hoán đổi 2 phần tử mảng arr tại vị trí i và j bằng biến tạm temp.', 'FILL_IN_BLANK', NULL, 'temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;');
```

Tài liệu này cam kết cung cấp một thiết kế cơ sở dữ liệu quan hệ hoàn hảo, toàn vẹn và tối ưu hóa hiệu năng cao bậc nhất cho ứng dụng **VisualizationDSA**.
