import type { RouteRecordRaw } from 'vue-router';





export const routes: RouteRecordRaw[] = [
  
  { path: '/',              name: 'landing',       component: () => import('../views/landing/LandingView.vue'),           meta: { title: 'Chào mừng',        public: true } },
  { path: '/dashboard',     name: 'dashboard',     component: () => import('../views/dashboard/DashboardView.vue'),         meta: { title: 'Bảng điều khiển',   requiresAuth: true } },
  { path: '/teacher',       name: 'teacher',       component: () => import('../views/teacher/TeacherPanelView.vue'),      meta: { title: 'Quản lý Giảng viên', requiresAuth: true, requiresRole: 'Teacher' } },

  // ── Core Algorithm Sandboxes ─────────────────────────────────────
  // ── Core Features (Phase 1 legacy kept as hidden or migrated) ─────────────────────────────────────


  
  
  
  { path: '/docs/:pathMatch(.*)*', name: 'docs', component: () => import('../views/docs/DocsView.vue'), meta: { title: 'Tài liệu Tham khảo', icon: 'book' } },
  { path: '/oop', redirect: '/docs/oop' },
  { path: '/solid', redirect: '/docs/solid' },
  { path: '/di', redirect: '/docs/di' },
  { path: '/patterns', redirect: '/docs/patterns' },
  { path: '/gamification',  name: 'gamification',  component: () => import('../views/gamification/GamificationEngineView.vue'),meta: { title: 'Bảng xếp hạng',   icon: 'gamification' } },

  
  { path: '/embed',         name: 'embed',         component: () => import('../views/embed/EmbedWidgetView.vue'),      meta: { title: 'Embed',           icon: 'embed' } },
  { path: '/export-share',  name: 'export-share',  component: () => import('../views/export-share/ExportShareView.vue'),      meta: { title: 'Export/Share',    icon: 'export-share' } },
  { path: '/profile',       name: 'profile',       component: () => import('../views/profile/ProfileView.vue'),          meta: { title: 'Hồ sơ cá nhân',   requiresAuth: true } },
  { path: '/courses',       name: 'courses',       component: () => import('../views/courses/CoursesListView.vue'),      meta: { title: 'Khóa học',        icon: 'learning-path', public: true } },
  { path: '/courses/:id',   name: 'course-detail', component: () => import('../views/courses/CourseDetailView.vue'),    meta: { title: 'Chi tiết Khóa học', requiresAuth: true } },
  { path: '/lessons/:id',   name: 'lesson-study',  component: () => import('../views/lesson/LessonStudyView.vue'),     meta: { title: 'Học Bài giảng',    requiresAuth: true } },

  
  { path: '/classrooms',         name: 'my-classrooms',     component: () => import('../views/classroom/MyClassroomsView.vue'),     meta: { title: 'Lớp học của tôi',  requiresAuth: true } },
  { path: '/classrooms/:id',     name: 'classroom-study',   component: () => import('../views/classroom/StudentClassroomView.vue'), meta: { title: 'Lớp học',           requiresAuth: true } },
  { path: '/teacher/classrooms/:id/analytics', name: 'classroom-analytics', component: () => import('../views/teacher/TeacherClassroomAnalytics.vue'), meta: { title: 'Phân tích lớp học', requiresAuth: true, requiresRole: 'Teacher' } },

  
  { path: '/admin',         name: 'admin',         component: () => import('../views/admin/AdminPanelView.vue'),       meta: { title: 'Quản trị Admin',  requiresAuth: true, requiresRole: 'Admin' } },

  
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/not-found/NotFoundView.vue'), meta: { title: 'Trang không tồn tại', public: true } },
];
