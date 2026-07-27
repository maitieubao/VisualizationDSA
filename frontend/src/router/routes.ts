import type { RouteRecordRaw } from 'vue-router';

/**
 * Danh sách routes cho toàn bộ ứng dụng.
 * Mỗi tab là một route riêng → code-splitting tự động qua Vite.
 */
export const routes: RouteRecordRaw[] = [
  // ── Landing & Dashboard ──────────────────────────────────────────
  { path: '/',              name: 'landing',       component: () => import('../views/landing/LandingView.vue'),           meta: { title: 'Chào mừng',        public: true } },
  { path: '/dashboard',     name: 'dashboard',     component: () => import('../views/dashboard/DashboardView.vue'),         meta: { title: 'Bảng điều khiển',   requiresAuth: true } },
  { path: '/teacher',       name: 'teacher',       component: () => import('../views/teacher/TeacherPanelView.vue'),      meta: { title: 'Quản lý Giảng viên', requiresAuth: true, requiresRole: 'Teacher' } },

  // ── Core Algorithm Sandboxes ─────────────────────────────────────
  { path: '/sorting',       name: 'sorting',       component: () => import('../views/sorting/SortingView.vue'),          meta: { title: 'Sắp xếp',         icon: 'sorting' } },
  // { path: '/animation',     name: 'animation',     component: () => import('../views/AnimationView.vue'),        meta: { title: 'Animation',       icon: 'animation' } },
  // { path: '/dsa',           name: 'dsa',           component: () => import('../views/DSAModulesView.vue'),       meta: { title: 'DSA Modules',     icon: 'dsa' } },
  { path: '/code-ide',      name: 'code-ide',      component: () => import('../views/code-ide/CodeIDEView.vue'),          meta: { title: 'Gỡ lỗi Code',     icon: 'code-ide' } },
  // { path: '/compare',       name: 'compare',       component: () => import('../views/CompareView.vue'),          meta: { title: 'So sánh thuật toán', icon: 'compare' } },
  // { path: '/concurrency',   name: 'concurrency',   component: () => import('../views/ConcurrencyView.vue'),      meta: { title: 'Đa luồng',        icon: 'concurrency' } },
  // { path: '/debug',         name: 'debug',         component: () => import('../views/DebugView.vue'),            meta: { title: 'Debug',           icon: 'debug' } },
  { path: '/graph',         name: 'graph',         component: () => import('../views/graph/GraphView.vue'),            meta: { title: 'Đồ thị',          icon: 'graph' } },
  // { path: '/playground',    name: 'playground',    component: () => import('../views/PlaygroundView.vue'),       meta: { title: 'Sandbox',         icon: 'playground' } },
  // { path: '/di',            name: 'di',            component: () => import('../views/di/DIView.vue'),               meta: { title: 'DI/IoC',          icon: 'di' } },
  // { path: '/patterns',      name: 'patterns',      component: () => import('../views/patterns/PatternsView.vue'),         meta: { title: 'Mẫu thiết kế',    icon: 'patterns' } },
  // { path: '/leaderboard',   name: 'leaderboard',   component: () => import('../views/LeaderboardView.vue'),      meta: { title: 'Leaderboard',     icon: 'leaderboard' } },
  { path: '/checkout',      name: 'checkout',      component: () => import('../views/checkout/PremiumCheckoutView.vue'),  meta: { title: 'Nâng cấp Premium', icon: 'checkout' } },

  // --- Phase 2 Upgraded Sandboxes ---
  { path: '/docs/:pathMatch(.*)*', name: 'docs', component: () => import('../views/docs/DocsView.vue'), meta: { title: 'Tài liệu Tham khảo', icon: 'book' } },
  { path: '/oop', redirect: '/docs/oop' },
  { path: '/solid', redirect: '/docs/solid' },
  { path: '/di', redirect: '/docs/di' },
  { path: '/patterns', redirect: '/docs/patterns' },
  // { path: '/state',         name: 'state',         component: () => import('../views/StateInspectorView.vue'),   meta: { title: 'State Inspector', icon: 'state' } },
  { path: '/system',        name: 'system',        component: () => import('../views/system-design/SystemDesignVizView.vue'),  meta: { title: 'Thiết kế HT',     icon: 'system' } },
  { path: '/quiz',          name: 'quiz',          component: () => import('../views/quiz/BackendQuizView.vue'),      meta: { title: 'Trắc nghiệm',     icon: 'quiz' } },
  { path: '/gamification',  name: 'gamification',  component: () => import('../views/gamification/GamificationEngineView.vue'),meta: { title: 'Bảng xếp hạng',   icon: 'gamification' } },

  // --- Completely New Phase 2 Routes ---
  { path: '/embed',         name: 'embed',         component: () => import('../views/embed/EmbedWidgetView.vue'),      meta: { title: 'Embed',           icon: 'embed' } },
  { path: '/export-share',  name: 'export-share',  component: () => import('../views/export-share/ExportShareView.vue'),      meta: { title: 'Export/Share',    icon: 'export-share' } },
  // { path: '/learning-path', name: 'learning-path', component: () => import('../views/LearningPathView.vue'),     meta: { title: 'Learning Path',   icon: 'learning-path' } },
  // { path: '/multi-view',    name: 'multi-view',    component: () => import('../views/MultiViewView.vue'),        meta: { title: 'Multi-View',      icon: 'multi-view' } },
  // { path: '/state',         name: 'state',         component: () => import('../views/StateInspectorView.vue'),   meta: { title: 'State Inspector', icon: 'state' } },
  // { path: '/timeline',      name: 'timeline',      component: () => import('../views/TimelinePlaybackView.vue'), meta: { title: 'Timeline',        icon: 'timeline' } },
  { path: '/profile',       name: 'profile',       component: () => import('../views/profile/ProfileView.vue'),          meta: { title: 'Hồ sơ cá nhân',   requiresAuth: true } },
  { path: '/courses',       name: 'courses',       component: () => import('../views/courses/CoursesListView.vue'),      meta: { title: 'Khóa học',        icon: 'learning-path', public: true } },
  { path: '/courses/:id',   name: 'course-detail', component: () => import('../views/courses/CourseDetailView.vue'),    meta: { title: 'Chi tiết Khóa học', requiresAuth: true } },
  { path: '/lessons/:id',   name: 'lesson-study',  component: () => import('../views/lesson/LessonStudyView.vue'),     meta: { title: 'Học Bài giảng',    requiresAuth: true } },

  // ── Admin Panel ───────────────────────────────────────────────────────
  { path: '/admin',         name: 'admin',         component: () => import('../views/admin/AdminPanelView.vue'),       meta: { title: 'Quản trị Admin',  requiresAuth: true, requiresRole: 'Admin' } },

  // ── 404 Not Found ──────────────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/not-found/NotFoundView.vue'), meta: { title: 'Trang không tồn tại', public: true } },
];
