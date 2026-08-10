CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP,
    total_xp INTEGER NOT NULL,
    current_level INTEGER NOT NULL,
    streak_days INTEGER NOT NULL,
    is_premium BOOLEAN NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL,
    last_activity_date TIMESTAMP
);

CREATE TABLE courses (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(30) NOT NULL,
    is_premium BOOLEAN NOT NULL,
    cover_image_url VARCHAR(500),
    is_published BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    is_deleted BOOLEAN NOT NULL
);

CREATE TABLE course_modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_deleted BOOLEAN NOT NULL
);

CREATE TABLE lessons (
    id TEXT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content_md TEXT,
    sandbox_type VARCHAR(50),
    sandbox_config TEXT,
    xp_reward INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    created_by_teacher_id TEXT,
    publish_status VARCHAR(30) NOT NULL,
    is_deleted BOOLEAN NOT NULL
);

CREATE TABLE quizzes (
    id TEXT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    topic VARCHAR(100) NOT NULL,
    difficulty INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    is_deleted BOOLEAN NOT NULL
);

CREATE TABLE codelabs (
    id TEXT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    initial_code TEXT,
    difficulty INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL,
    is_deleted BOOLEAN NOT NULL,
    owner_id TEXT,
    constraints TEXT,
    examples TEXT,
    tags VARCHAR(500),
    max_runtime_ms INTEGER NOT NULL,
    max_memory_bytes BIGINT NOT NULL,
    allowed_languages VARCHAR(500) NOT NULL
);

CREATE TABLE module_items (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    classroom_id TEXT,
    item_type VARCHAR(20) NOT NULL,
    lesson_id TEXT,
    quiz_id TEXT,
    codelab_id TEXT,
    override_title VARCHAR(200),
    order_index INTEGER NOT NULL,
    is_required BOOLEAN NOT NULL,
    is_deleted BOOLEAN NOT NULL
);

CREATE TABLE classrooms (
    id TEXT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_teacher_id TEXT NOT NULL,
    course_id TEXT,
    imported_from_course_id TEXT,
    invite_code VARCHAR(50) NOT NULL,
    is_archived BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    invite_code_expires_at TIMESTAMP,
    max_enrollment_capacity INTEGER
);

CREATE TABLE classroom_enrollments (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    joined_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    status_changed_at TIMESTAMP,
    status_changed_by_user_id TEXT,
    status_change_reason TEXT
);

CREATE TABLE classroom_modules (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_deleted BOOLEAN NOT NULL,
    is_hidden BOOLEAN NOT NULL,
    unlock_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    row_version TEXT
);

CREATE TABLE classroom_module_items (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    lesson_id TEXT,
    quiz_id TEXT,
    codelab_id TEXT,
    override_title VARCHAR(200),
    override_description TEXT,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN NOT NULL,
    is_hidden BOOLEAN NOT NULL,
    is_deleted BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    row_version TEXT,
    unlock_at TIMESTAMP,
    due_at TIMESTAMP,
    max_attempts INTEGER,
    is_hidden_for_student BOOLEAN NOT NULL,
    prerequisite_item_id TEXT,
    is_sequential BOOLEAN NOT NULL
);

CREATE TABLE classroom_module_item_overrides (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    module_item_id TEXT NOT NULL,
    open_at TIMESTAMP,
    due_at TIMESTAMP,
    max_attempts INTEGER,
    is_hidden_for_student BOOLEAN NOT NULL,
    prerequisite_item_id INTEGER,
    is_sequential BOOLEAN NOT NULL
);

CREATE TABLE classroom_lessons (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    unlock_at TIMESTAMP,
    is_visible BOOLEAN NOT NULL
);

CREATE TABLE classroom_quizzes (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    open_at TIMESTAMP NOT NULL,
    due_at TIMESTAMP NOT NULL,
    max_attempts INTEGER NOT NULL,
    is_archived BOOLEAN NOT NULL
);

CREATE TABLE classroom_quiz_attempts (
    id TEXT PRIMARY KEY,
    classroom_quiz_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    is_late BOOLEAN NOT NULL
);

CREATE TABLE classroom_announcements (
    id TEXT PRIMARY KEY,
    classroom_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content_md TEXT NOT NULL,
    is_published BOOLEAN NOT NULL,
    is_pinned BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP
);

CREATE TABLE quiz_questions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    question VARCHAR(500) NOT NULL,
    options TEXT,
    correct_index INTEGER NOT NULL,
    explanation TEXT
);

CREATE TABLE quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    attempted_at TIMESTAMP NOT NULL,
    answers TEXT
);

CREATE TABLE quiz_xp_grants (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quiz_key VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP NOT NULL
);

CREATE TABLE badges (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon VARCHAR(50),
    color VARCHAR(20),
    criteria TEXT
);

CREATE TABLE user_badges (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    badge_id TEXT NOT NULL,
    earned_at TIMESTAMP NOT NULL
);

CREATE TABLE learning_progresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    time_spent_minutes INTEGER NOT NULL
);

CREATE TABLE user_lesson_progresses (
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    completed_at TIMESTAMP,
    xp_rewarded INTEGER NOT NULL,
    last_active_frame_index INTEGER NOT NULL,
    last_scroll_percent DOUBLE PRECISION NOT NULL,
    has_watched_visualizer BOOLEAN NOT NULL,
    quiz_score INTEGER,
    best_score INTEGER NOT NULL,
    codelab_completed BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE user_module_item_progresses (
    user_id TEXT NOT NULL,
    module_item_id TEXT NOT NULL,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL,
    last_active_frame_index INTEGER NOT NULL,
    last_scroll_percent DOUBLE PRECISION NOT NULL,
    progress_percent DOUBLE PRECISION NOT NULL,
    completed_at TIMESTAMP,
    score INTEGER,
    last_accessed_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, module_item_id, attempt_number)
);

CREATE TABLE lesson_comments (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    parent_id TEXT,
    is_edited BOOLEAN NOT NULL,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL
);

CREATE TABLE lesson_reviews (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    reviewer_admin_id TEXT,
    is_approved BOOLEAN,
    feedback TEXT,
    created_at TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP
);

CREATE TABLE theory_articles (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    content_md TEXT NOT NULL,
    category VARCHAR(100),
    difficulty VARCHAR(30) NOT NULL,
    tags VARCHAR(500),
    view_count INTEGER NOT NULL,
    read_time_minutes INTEGER NOT NULL,
    is_published BOOLEAN NOT NULL,
    is_deleted BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE theory_article_versions (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    content_md TEXT NOT NULL,
    change_summary TEXT,
    changed_by TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE lesson_theory_articles (
    lesson_id TEXT NOT NULL,
    theory_article_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    added_at TIMESTAMP NOT NULL,
    PRIMARY KEY (lesson_id, theory_article_id)
);

CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY,
    token VARCHAR(128) NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL
);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    payment_code VARCHAR(50) NOT NULL,
    transaction_reference VARCHAR(100),
    amount DECIMAL(18, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP
);

CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    is_read BOOLEAN NOT NULL,
    link_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE codelab_test_cases (
    id TEXT PRIMARY KEY,
    codelab_id TEXT NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL,
    score_weight INTEGER NOT NULL,
    order_index INTEGER NOT NULL
);

CREATE TABLE codelab_templates (
    id TEXT PRIMARY KEY,
    codelab_id TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    boilerplate_code TEXT NOT NULL
);

CREATE TABLE codelab_hints (
    id TEXT PRIMARY KEY,
    codelab_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_tiered BOOLEAN NOT NULL,
    xp_cost INTEGER NOT NULL,
    order_index INTEGER NOT NULL
);

CREATE TABLE codelab_hint_reveals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    codelab_hint_id TEXT NOT NULL,
    revealed_at TIMESTAMP NOT NULL
);

CREATE TABLE codelab_submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    codelab_id TEXT NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    error_message TEXT,
    runtime_ms INTEGER NOT NULL,
    memory_bytes BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    passed_count INTEGER NOT NULL,
    total_count INTEGER NOT NULL,
    score INTEGER NOT NULL,
    is_submit BOOLEAN NOT NULL,
    per_test_case_result_json TEXT
);

CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    target_id TEXT,
    details VARCHAR(2000),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE semantic_concept_nodes (
    id TEXT PRIMARY KEY,
    concept_key VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(60) NOT NULL,
    description VARCHAR(2000),
    embedding TEXT,
    importance DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE knowledge_edges (
    id TEXT PRIMARY KEY,
    source_node_id TEXT NOT NULL,
    target_node_id TEXT NOT NULL,
    relation_type VARCHAR(60) NOT NULL,
    weight DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE system_audit_event_streams (
    id TEXT PRIMARY KEY,
    event_type VARCHAR(120) NOT NULL,
    user_id TEXT,
    correlation_id VARCHAR(100),
    http_method VARCHAR(10),
    path VARCHAR(500),
    status_code INTEGER,
    payload TEXT,
    sequence BIGINT NOT NULL,
    occurred_at TIMESTAMP NOT NULL
);
