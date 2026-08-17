import type { RouteRecordRaw } from 'vue-router';





export const routes: RouteRecordRaw[] = [
  
  { path: '/',              name: 'landing',       component: () => import('../views/landing/LandingView.vue'),           meta: { title: 'Chào mừng',        public: true } },
  { path: '/dashboard',     name: 'dashboard',     component: () => import('../views/dashboard/DashboardView.vue'),         meta: { title: 'Bảng điều khiển',   requiresAuth: true } },
  { path: '/teacher',       name: 'teacher',       component: () => import('../views/teacher/TeacherPanelView.vue'),      meta: { title: 'Quản lý Giảng viên', requiresAuth: true, requiresRole: 'Teacher' } },

  
  { path: '/sorting',       name: 'sorting',       component: () => import('../views/sorting/SortingView.vue'),          meta: { title: 'Sắp xếp',         icon: 'sorting' } },
  { path: '/code-ide',      name: 'code-ide',      component: () => import('../views/code-ide/CodeIDEView.vue'),          meta: { title: 'Gỡ lỗi Code',     icon: 'code-ide' } },
  { path: '/playground',    name: 'playground',    component: () => import('../views/playground/PlaygroundView.vue'),      meta: { title: 'Playground',       icon: 'playground' } },
  { path: '/benchmark',     name: 'benchmark',     component: () => import('../views/benchmark/BenchmarkLabView.vue'),     meta: { title: 'Đo điểm chuẩn',   icon: 'compare' } },
  { path: '/graph',         name: 'graph',         component: () => import('../views/graph/GraphView.vue'),            meta: { title: 'Đồ thị',          icon: 'graph' } },
  { path: '/checkout',      name: 'checkout',      component: () => import('../views/checkout/PremiumCheckoutView.vue'),  meta: { title: 'Nâng cấp Premium', icon: 'checkout' } },
  { path: '/faq',           name: 'faq',           component: () => import('../views/docs/FaqView.vue'),              meta: { title: 'Trợ giúp',         icon: 'help-circle', public: true } },

  
  // `/docs` (topic-level, từ tab "Tài liệu tham khảo") → bài đầu tiên có nội dung thật (DC-011).
  { path: '/docs', redirect: '/docs/intro/intro' },
  { path: '/docs/:pathMatch(.*)*', name: 'docs', component: () => import('../views/docs/DocsView.vue'), meta: { title: 'Tài liệu Tham khảo', icon: 'book' } },
  // Redirect 4 group cũ sang bài đầu mỗi nhóm — không còn redirect tới slug chết (DC-006).
  { path: '/oop', redirect: '/docs/oop/encapsulation' },
  { path: '/solid', redirect: '/docs/solid/srp' },
  { path: '/di', redirect: '/docs/di/basics' },
  { path: '/patterns', redirect: '/docs/patterns/singleton' },
  { path: '/quiz',          name: 'quiz',          component: () => import('../views/quiz/BackendQuizView.vue'),      meta: { title: 'Trắc nghiệm',     icon: 'quiz' } },
  { path: '/gamification',  name: 'gamification',  component: () => import('../views/gamification/GamificationEngineView.vue'),meta: { title: 'Bảng xếp hạng',   icon: 'gamification' } },

  
  { path: '/embed',         name: 'embed',         component: () => import('../views/embed/EmbedWidgetView.vue'),      meta: { title: 'Embed',           icon: 'embed' } },
  { path: '/export-share',  name: 'export-share',  component: () => import('../views/export-share/ExportShareView.vue'),      meta: { title: 'Export/Share',    icon: 'export-share' } },
  // EX-002: route khôi phục phòng lab từ liên kết chia sẻ /s/?state=... (payload lz-string).
  { path: '/s',              name: 'share-restore', component: () => import('../views/export-share/ShareRestoreView.vue'),        meta: { title: 'Khôi phục phòng lab', public: true } },
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
