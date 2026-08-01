import type { RouteRecordRaw } from 'vue-router';

/**
 * Danh sách routes cho toàn bộ ứng dụng.
 * Mỗi tab là một route riêng → code-splitting tự động qua Vite.
 */
export const routes: RouteRecordRaw[] = [
  // ── Landing & Dashboard ──────────────────────────────────────────
  { path: '/',              name: 'landing',       component: () => import('../views/LandingView.vue'),           meta: { title: 'Chào mừng',        public: true } },
  { path: '/dashboard',     name: 'dashboard',     component: () => import('../views/DashboardView.vue'),         meta: { title: 'Bảng điều khiển',   requiresAuth: true } },
  { path: '/teacher',       name: 'teacher',       component: () => import('../views/TeacherPanelView.vue'),      meta: { title: 'Quản lý Giảng viên', requiresAuth: true, requiresRole: 'Teacher' } },

  // ── Core Algorithm Sandboxes ─────────────────────────────────────
  // ── Core Features (Phase 1 legacy kept as hidden or migrated) ─────────────────────────────────────
  { path: '/checkout',      name: 'checkout',      component: () => import('../views/PremiumCheckoutView.vue'),  meta: { title: 'Nâng cấp Premium', icon: 'checkout' } },

  // --- Completely New Phase 2 Routes ---
  { path: '/cheatsheet',    name: 'cheatsheet',    component: () => import('../views/CheatSheetView.vue'),      meta: { title: 'DSA CheatSheet',  icon: 'cheatsheet' } },
  { path: '/ai-assistant',  name: 'ai-assistant',  component: () => import('../views/AIAssistantView.vue'),     meta: { title: 'AI Assistant',    icon: 'ai-assistant', requiresAuth: true } },
  { path: '/profile',       name: 'profile',       component: () => import('../views/ProfileView.vue'),          meta: { title: 'Hồ sơ cá nhân',   requiresAuth: true } },
  { path: '/courses',       name: 'courses',       component: () => import('../views/CoursesListView.vue'),      meta: { title: 'Bản đồ Lộ trình',        icon: 'learning-path', public: true } },
  { path: '/courses/:id',   name: 'course-detail', component: () => import('../views/CourseDetailView.vue'),    meta: { title: 'Chi tiết Lộ trình', requiresAuth: true } },
  { path: '/lessons/:id',   name: 'lesson-study',  component: () => import('../views/LessonStudyView.vue'),     meta: { title: 'Học Bài giảng',    requiresAuth: true } },
  { path: '/classrooms',    name: 'classrooms',    component: () => import('../views/ClassroomDashboard.vue'),  meta: { title: 'Lớp học',          requiresAuth: true } },
  { path: '/classrooms/:id', name: 'classroom-detail', component: () => import('../views/ClassroomDetailView.vue'), meta: { title: 'Chi tiết Lớp học', requiresAuth: true } },
  { path: '/gems-shop',     name: 'gems-shop',     component: () => import('../views/GemsShopView.vue'),        meta: { title: 'Cửa hàng Gems',    requiresAuth: true } },
  { path: '/teacher-studio', name: 'teacher-studio', component: () => import('../views/TeacherStudioView.vue'), meta: { title: 'Teacher Studio', requiresAuth: true, requiresRole: 'Teacher' } },
  { path: '/teacher-studio/:id', name: 'teacher-studio-editor', component: () => import('../views/TeacherStudioRoadmapEditor.vue'), meta: { title: 'Chỉnh sửa Lộ trình', requiresAuth: true, requiresRole: 'Teacher' } },

  // ── Admin Panel ───────────────────────────────────────────────────────
  { path: '/admin',         name: 'admin',         component: () => import('../views/AdminPanelView.vue'),       meta: { title: 'Quản trị Admin',  requiresAuth: true, requiresRole: 'Admin' } },

  // ── 404 Not Found ──────────────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Trang không tồn tại', public: true } },
];
