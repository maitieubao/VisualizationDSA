CREATE TABLE `users` (
    `id` VARCHAR(36) PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `last_login_at` DATETIME,
    `total_xp` INT NOT NULL DEFAULT 0,
    `current_level` INT NOT NULL DEFAULT 1,
    `streak_days` INT NOT NULL DEFAULT 0,
    `is_premium` BOOLEAN NOT NULL DEFAULT FALSE,
    `role` VARCHAR(20) NOT NULL DEFAULT 'Student',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `last_activity_date` DATETIME
);

CREATE TABLE `courses` (
    `id` VARCHAR(36) PRIMARY KEY,
    `teacher_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `category` VARCHAR(50) NOT NULL DEFAULT 'Other',
    `difficulty` VARCHAR(30) NOT NULL DEFAULT 'Beginner',
    `is_premium` BOOLEAN NOT NULL DEFAULT FALSE,
    `cover_image_url` VARCHAR(500),
    `is_published` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `course_modules` (
    `id` VARCHAR(36) PRIMARY KEY,
    `course_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `order_index` INT NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `lessons` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `content_md` TEXT,
    `sandbox_type` VARCHAR(50),
    `sandbox_config` TEXT,
    `xp_reward` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL,
    `created_by_teacher_id` VARCHAR(36),
    `publish_status` VARCHAR(30) NOT NULL DEFAULT 'Draft',
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `quizzes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `topic` VARCHAR(100) NOT NULL,
    `difficulty` INT NOT NULL DEFAULT 1,
    `xp_reward` INT NOT NULL DEFAULT 0,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `codelabs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `initial_code` TEXT,
    `difficulty` INT NOT NULL DEFAULT 1,
    `xp_reward` INT NOT NULL DEFAULT 0,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `owner_id` VARCHAR(36),
    `constraints` TEXT,
    `examples` TEXT,
    `tags` VARCHAR(500),
    `max_runtime_ms` INT NOT NULL DEFAULT 2000,
    `max_memory_bytes` BIGINT NOT NULL DEFAULT 128000000,
    `allowed_languages` VARCHAR(500) NOT NULL DEFAULT 'csharp,python,java,javascript'
);

CREATE TABLE `module_items` (
    `id` VARCHAR(36) PRIMARY KEY,
    `module_id` VARCHAR(36) NOT NULL,
    `classroom_id` VARCHAR(36),
    `item_type` VARCHAR(20) NOT NULL,
    `lesson_id` VARCHAR(36),
    `quiz_id` VARCHAR(36),
    `codelab_id` VARCHAR(36),
    `override_title` VARCHAR(200),
    `order_index` INT NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `classrooms` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `owner_teacher_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36),
    `imported_from_course_id` VARCHAR(36),
    `invite_code` VARCHAR(50) NOT NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL,
    `invite_code_expires_at` DATETIME,
    `max_enrollment_capacity` INT
);

CREATE TABLE `classroom_enrollments` (
    `id` VARCHAR(36) PRIMARY KEY,
    `classroom_id` VARCHAR(36) NOT NULL,
    `student_id` VARCHAR(36) NOT NULL,
    `joined_at` DATETIME NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
    `status_changed_at` DATETIME,
    `status_changed_by_user_id` VARCHAR(36),
    `status_change_reason` TEXT
);

CREATE TABLE `classroom_modules` (
    `id` VARCHAR(36) PRIMARY KEY,
    `classroom_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `order_index` INT NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_hidden` BOOLEAN NOT NULL DEFAULT FALSE,
    `unlock_at` DATETIME,
    `created_at` DATETIME NOT NULL,
    `row_version` VARCHAR(255)
);

CREATE TABLE `classroom_module_items` (
    `id` VARCHAR(36) PRIMARY KEY,
    `module_id` VARCHAR(36) NOT NULL,
    `item_type` VARCHAR(20) NOT NULL,
    `lesson_id` VARCHAR(36),
    `quiz_id` VARCHAR(36),
    `codelab_id` VARCHAR(36),
    `override_title` VARCHAR(200),
    `override_description` TEXT,
    `order_index` INT NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_hidden` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL,
    `row_version` VARCHAR(255),
    `unlock_at` DATETIME,
    `due_at` DATETIME,
    `max_attempts` INT,
    `is_hidden_for_student` BOOLEAN NOT NULL DEFAULT FALSE,
    `prerequisite_item_id` VARCHAR(36),
    `is_sequential` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `classroom_module_item_overrides` (
    `id` VARCHAR(36) PRIMARY KEY,
    `classroom_id` VARCHAR(36) NOT NULL,
    `module_item_id` VARCHAR(36) NOT NULL,
    `open_at` DATETIME,
    `due_at` DATETIME,
    `max_attempts` INT,
    `is_hidden_for_student` BOOLEAN NOT NULL DEFAULT FALSE,
    `prerequisite_item_id` INT,
    `is_sequential` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `classroom_lessons` (
    `id` VARCHAR(36) PRIMARY KEY,
    `classroom_id` VARCHAR(36) NOT NULL,
    `lesson_id` VARCHAR(36) NOT NULL,
    `order_index` INT NOT NULL,
    `unlock_at` DATETIME,
    `is_visible` BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE `classroom_quizzes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `classroom_id` VARCHAR(36) NOT NULL,
    `quiz_id` VARCHAR(36) NOT NULL,
    `open_at` DATETIME NOT NULL,
    `due_at` DATETIME NOT NULL,
    `max_attempts` INT NOT NULL DEFAULT 1,
    `is_archived` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `classroom_quiz_attempts` (
    `id` VARCHAR(36) PRIMARY KEY,
    `classroom_quiz_id` VARCHAR(36) NOT NULL,
    `student_id` VARCHAR(36) NOT NULL,
    `score` INT NOT NULL DEFAULT 0,
    `max_score` INT NOT NULL DEFAULT 0,
    `submitted_at` DATETIME NOT NULL,
    `is_late` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `classroom_announcements` (
    `id` VARCHAR(36) PRIMARY KEY,
    `classroom_id` VARCHAR(36) NOT NULL,
    `author_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content_md` TEXT NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL,
    `published_at` DATETIME
);

CREATE TABLE `quiz_questions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `quiz_id` VARCHAR(36) NOT NULL,
    `question` VARCHAR(500) NOT NULL,
    `options` TEXT,
    `correct_index` INT NOT NULL,
    `explanation` TEXT
);

CREATE TABLE `quiz_attempts` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `quiz_id` VARCHAR(36) NOT NULL,
    `score` INT NOT NULL DEFAULT 0,
    `max_score` INT NOT NULL DEFAULT 0,
    `attempted_at` DATETIME NOT NULL,
    `answers` TEXT
);

CREATE TABLE `quiz_xp_grants` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `quiz_key` VARCHAR(100) NOT NULL,
    `granted_at` DATETIME NOT NULL
);

CREATE TABLE `badges` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500),
    `icon` VARCHAR(50),
    `color` VARCHAR(20),
    `criteria` TEXT
);

CREATE TABLE `user_badges` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `badge_id` VARCHAR(36) NOT NULL,
    `earned_at` DATETIME NOT NULL
);

CREATE TABLE `learning_progresses` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `module_id` VARCHAR(100) NOT NULL,
    `completed_at` DATETIME NOT NULL,
    `time_spent_minutes` INT NOT NULL DEFAULT 0
);

CREATE TABLE `user_lesson_progresses` (
    `user_id` VARCHAR(36) NOT NULL,
    `lesson_id` VARCHAR(36) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'NotStarted',
    `completed_at` DATETIME,
    `xp_rewarded` INT NOT NULL DEFAULT 0,
    `last_active_frame_index` INT NOT NULL DEFAULT 0,
    `last_scroll_percent` FLOAT NOT NULL DEFAULT 0,
    `has_watched_visualizer` BOOLEAN NOT NULL DEFAULT FALSE,
    `quiz_score` INT,
    `best_score` INT NOT NULL DEFAULT 0,
    `codelab_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`user_id`, `lesson_id`)
);

CREATE TABLE `user_module_item_progresses` (
    `user_id` VARCHAR(36) NOT NULL,
    `module_item_id` VARCHAR(36) NOT NULL,
    `attempt_number` INT NOT NULL DEFAULT 1,
    `status` VARCHAR(30) NOT NULL DEFAULT 'NotStarted',
    `last_active_frame_index` INT NOT NULL DEFAULT 0,
    `last_scroll_percent` FLOAT NOT NULL DEFAULT 0,
    `progress_percent` FLOAT NOT NULL DEFAULT 0,
    `completed_at` DATETIME,
    `score` INT,
    `last_accessed_at` DATETIME NOT NULL,
    PRIMARY KEY (`user_id`, `module_item_id`, `attempt_number`)
);

CREATE TABLE `lesson_comments` (
    `id` VARCHAR(36) PRIMARY KEY,
    `lesson_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `content` VARCHAR(2000) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `parent_id` VARCHAR(36),
    `is_edited` BOOLEAN NOT NULL DEFAULT FALSE,
    `edited_at` DATETIME,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `lesson_reviews` (
    `id` VARCHAR(36) PRIMARY KEY,
    `lesson_id` VARCHAR(36) NOT NULL,
    `reviewer_admin_id` VARCHAR(36),
    `is_approved` BOOLEAN,
    `feedback` TEXT,
    `created_at` DATETIME NOT NULL,
    `reviewed_at` DATETIME
);

CREATE TABLE `theory_articles` (
    `id` VARCHAR(36) PRIMARY KEY,
    `author_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(250) NOT NULL,
    `content_md` TEXT NOT NULL,
    `category` VARCHAR(100),
    `difficulty` VARCHAR(30) NOT NULL DEFAULT 'Beginner',
    `tags` VARCHAR(500),
    `view_count` INT NOT NULL DEFAULT 0,
    `read_time_minutes` INT NOT NULL DEFAULT 0,
    `is_published` BOOLEAN NOT NULL DEFAULT FALSE,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME NOT NULL,
    `published_at` DATETIME,
    `updated_at` DATETIME NOT NULL
);

CREATE TABLE `theory_article_versions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `article_id` VARCHAR(36) NOT NULL,
    `content_md` TEXT NOT NULL,
    `change_summary` TEXT,
    `changed_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME NOT NULL
);

CREATE TABLE `lesson_theory_articles` (
    `lesson_id` VARCHAR(36) NOT NULL,
    `theory_article_id` VARCHAR(36) NOT NULL,
    `order_index` INT NOT NULL DEFAULT 0,
    `added_at` DATETIME NOT NULL,
    PRIMARY KEY (`lesson_id`, `theory_article_id`)
);

CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(36) PRIMARY KEY,
    `token` VARCHAR(128) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `orders` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `payment_code` VARCHAR(50) NOT NULL,
    `transaction_reference` VARCHAR(100),
    `amount` DECIMAL(18,2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
    `created_at` DATETIME NOT NULL,
    `completed_at` DATETIME
);

CREATE TABLE `notifications` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `content` VARCHAR(1000) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `link_url` VARCHAR(500),
    `created_at` DATETIME NOT NULL
);

CREATE TABLE `codelab_test_cases` (
    `id` VARCHAR(36) PRIMARY KEY,
    `codelab_id` VARCHAR(36) NOT NULL,
    `input` TEXT NOT NULL,
    `expected_output` TEXT NOT NULL,
    `is_hidden` BOOLEAN NOT NULL DEFAULT FALSE,
    `score_weight` INT NOT NULL DEFAULT 1,
    `order_index` INT NOT NULL DEFAULT 0
);

CREATE TABLE `codelab_templates` (
    `id` VARCHAR(36) PRIMARY KEY,
    `codelab_id` VARCHAR(36) NOT NULL,
    `language` VARCHAR(50) NOT NULL,
    `boilerplate_code` TEXT NOT NULL
);

CREATE TABLE `codelab_hints` (
    `id` VARCHAR(36) PRIMARY KEY,
    `codelab_id` VARCHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `is_tiered` BOOLEAN NOT NULL DEFAULT FALSE,
    `xp_cost` INT NOT NULL DEFAULT 0,
    `order_index` INT NOT NULL DEFAULT 0
);

CREATE TABLE `codelab_hint_reveals` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `codelab_hint_id` VARCHAR(36) NOT NULL,
    `revealed_at` DATETIME NOT NULL
);

CREATE TABLE `codelab_submissions` (
    `id` VARCHAR(36) PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `codelab_id` VARCHAR(36) NOT NULL,
    `code` TEXT NOT NULL,
    `language` VARCHAR(50) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
    `error_message` TEXT,
    `runtime_ms` INT NOT NULL DEFAULT 0,
    `memory_bytes` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL,
    `passed_count` INT NOT NULL DEFAULT 0,
    `total_count` INT NOT NULL DEFAULT 0,
    `score` INT NOT NULL DEFAULT 0,
    `is_submit` BOOLEAN NOT NULL DEFAULT FALSE,
    `per_test_case_result_json` TEXT
);

CREATE TABLE `audit_logs` (
    `id` VARCHAR(36) PRIMARY KEY,
    `action` VARCHAR(100) NOT NULL,
    `actor_id` VARCHAR(36) NOT NULL,
    `actor_name` VARCHAR(100) NOT NULL,
    `target_id` VARCHAR(36),
    `details` VARCHAR(2000),
    `created_at` DATETIME NOT NULL
);

CREATE TABLE `semantic_concept_nodes` (
    `id` VARCHAR(36) PRIMARY KEY,
    `concept_key` VARCHAR(150) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `category` VARCHAR(60) NOT NULL,
    `description` VARCHAR(2000),
    `embedding` TEXT,
    `importance` FLOAT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL
);

CREATE TABLE `knowledge_edges` (
    `id` VARCHAR(36) PRIMARY KEY,
    `source_node_id` VARCHAR(36) NOT NULL,
    `target_node_id` VARCHAR(36) NOT NULL,
    `relation_type` VARCHAR(60) NOT NULL,
    `weight` FLOAT NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL
);

CREATE TABLE `system_audit_event_streams` (
    `id` VARCHAR(36) PRIMARY KEY,
    `event_type` VARCHAR(120) NOT NULL,
    `user_id` VARCHAR(36),
    `correlation_id` VARCHAR(100),
    `http_method` VARCHAR(10),
    `path` VARCHAR(500),
    `status_code` INT,
    `payload` TEXT,
    `sequence` BIGINT NOT NULL,
    `occurred_at` DATETIME NOT NULL
);

ALTER TABLE `courses` ADD FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`);
ALTER TABLE `course_modules` ADD FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`);
ALTER TABLE `lessons` ADD FOREIGN KEY (`created_by_teacher_id`) REFERENCES `users`(`id`);
ALTER TABLE `module_items` ADD FOREIGN KEY (`module_id`) REFERENCES `course_modules`(`id`);
ALTER TABLE `module_items` ADD FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`);
ALTER TABLE `module_items` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`);
ALTER TABLE `module_items` ADD FOREIGN KEY (`codelab_id`) REFERENCES `codelabs`(`id`);
ALTER TABLE `codelabs` ADD FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`);
ALTER TABLE `classrooms` ADD FOREIGN KEY (`owner_teacher_id`) REFERENCES `users`(`id`);
ALTER TABLE `classrooms` ADD FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`);
ALTER TABLE `classrooms` ADD FOREIGN KEY (`imported_from_course_id`) REFERENCES `courses`(`id`);
ALTER TABLE `classroom_enrollments` ADD FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`);
ALTER TABLE `classroom_enrollments` ADD FOREIGN KEY (`student_id`) REFERENCES `users`(`id`);
ALTER TABLE `classroom_enrollments` ADD FOREIGN KEY (`status_changed_by_user_id`) REFERENCES `users`(`id`);
ALTER TABLE `classroom_modules` ADD FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`);
ALTER TABLE `classroom_module_items` ADD FOREIGN KEY (`module_id`) REFERENCES `classroom_modules`(`id`);
ALTER TABLE `classroom_module_items` ADD FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`);
ALTER TABLE `classroom_module_items` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`);
ALTER TABLE `classroom_module_items` ADD FOREIGN KEY (`codelab_id`) REFERENCES `codelabs`(`id`);
ALTER TABLE `classroom_module_items` ADD FOREIGN KEY (`prerequisite_item_id`) REFERENCES `classroom_module_items`(`id`);
ALTER TABLE `classroom_module_item_overrides` ADD FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`);
ALTER TABLE `classroom_module_item_overrides` ADD FOREIGN KEY (`module_item_id`) REFERENCES `classroom_module_items`(`id`);
ALTER TABLE `classroom_module_item_overrides` ADD FOREIGN KEY (`prerequisite_item_id`) REFERENCES `classroom_module_items`(`id`);
ALTER TABLE `classroom_lessons` ADD FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`);
ALTER TABLE `classroom_lessons` ADD FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`);
ALTER TABLE `classroom_quizzes` ADD FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`);
ALTER TABLE `classroom_quizzes` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`);
ALTER TABLE `classroom_quiz_attempts` ADD FOREIGN KEY (`classroom_quiz_id`) REFERENCES `classroom_quizzes`(`id`);
ALTER TABLE `classroom_quiz_attempts` ADD FOREIGN KEY (`student_id`) REFERENCES `users`(`id`);
ALTER TABLE `classroom_announcements` ADD FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`);
ALTER TABLE `classroom_announcements` ADD FOREIGN KEY (`author_id`) REFERENCES `users`(`id`);
ALTER TABLE `quiz_questions` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`);
ALTER TABLE `quiz_attempts` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `quiz_attempts` ADD FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`);
ALTER TABLE `quiz_xp_grants` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `user_badges` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `user_badges` ADD FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`);
ALTER TABLE `learning_progresses` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `user_lesson_progresses` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `user_lesson_progresses` ADD FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`);
ALTER TABLE `user_module_item_progresses` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `user_module_item_progresses` ADD FOREIGN KEY (`module_item_id`) REFERENCES `classroom_module_items`(`id`);
ALTER TABLE `lesson_comments` ADD FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`);
ALTER TABLE `lesson_comments` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `lesson_comments` ADD FOREIGN KEY (`parent_id`) REFERENCES `lesson_comments`(`id`);
ALTER TABLE `lesson_reviews` ADD FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`);
ALTER TABLE `lesson_reviews` ADD FOREIGN KEY (`reviewer_admin_id`) REFERENCES `users`(`id`);
ALTER TABLE `theory_articles` ADD FOREIGN KEY (`author_id`) REFERENCES `users`(`id`);
ALTER TABLE `theory_article_versions` ADD FOREIGN KEY (`article_id`) REFERENCES `theory_articles`(`id`);
ALTER TABLE `theory_article_versions` ADD FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`);
ALTER TABLE `lesson_theory_articles` ADD FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`);
ALTER TABLE `lesson_theory_articles` ADD FOREIGN KEY (`theory_article_id`) REFERENCES `theory_articles`(`id`);
ALTER TABLE `refresh_tokens` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `orders` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `notifications` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `codelab_test_cases` ADD FOREIGN KEY (`codelab_id`) REFERENCES `codelabs`(`id`);
ALTER TABLE `codelab_templates` ADD FOREIGN KEY (`codelab_id`) REFERENCES `codelabs`(`id`);
ALTER TABLE `codelab_hints` ADD FOREIGN KEY (`codelab_id`) REFERENCES `codelabs`(`id`);
ALTER TABLE `codelab_hint_reveals` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `codelab_hint_reveals` ADD FOREIGN KEY (`codelab_hint_id`) REFERENCES `codelab_hints`(`id`);
ALTER TABLE `codelab_submissions` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
ALTER TABLE `codelab_submissions` ADD FOREIGN KEY (`codelab_id`) REFERENCES `codelabs`(`id`);
ALTER TABLE `audit_logs` ADD FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`);

ALTER TABLE `knowledge_edges` ADD FOREIGN KEY (`source_node_id`) REFERENCES `semantic_concept_nodes`(`id`);
ALTER TABLE `knowledge_edges` ADD FOREIGN KEY (`target_node_id`) REFERENCES `semantic_concept_nodes`(`id`);
ALTER TABLE `system_audit_event_streams` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);
