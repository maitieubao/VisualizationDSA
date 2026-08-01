export interface TabItem {
  readonly id: string;
  readonly path: string;
  readonly name: string;
  readonly requiresAuth?: boolean;
  readonly requiresRole?: string;
}

export interface TabGroup {
  readonly groupName: string;
  readonly items: readonly TabItem[];
}

export const APP_TABS: readonly (TabGroup | TabItem)[] = [
  {
    groupName: 'Học tập & Tra cứu',
    items: [
      { id: 'roadmap',      path: '/courses',      name: 'Visual / Roadmap' },
      { id: 'cheatsheet',   path: '/cheatsheet',   name: 'DSA CheatSheet' },
    ]
  },
  {
    groupName: 'Cộng đồng & Mở rộng',
    items: [
      { id: 'classrooms',   path: '/classrooms',   name: 'Lớp Học', requiresAuth: true },
      { id: 'gamification', path: '/gamification', name: 'Xếp Hạng' },
      { id: 'ai-assistant', path: '/ai-assistant', name: 'AI Assistant', requiresAuth: true },
      { id: 'gems-shop',    path: '/gems-shop',    name: 'Cửa Hàng Gems', requiresAuth: true }
    ]
  },
  {
    groupName: 'Cá nhân & Quản lý',
    items: [
      { id: 'dashboard',    path: '/dashboard',    name: 'Bảng điều khiển', requiresAuth: true },
      { id: 'profile',      path: '/profile',      name: 'Hồ sơ', requiresAuth: true },
      { id: 'teacher-studio', path: '/teacher-studio', name: 'Teacher Studio', requiresAuth: true, requiresRole: 'Teacher' },
      { id: 'admin',        path: '/admin',        name: 'Quản trị Admin', requiresAuth: true, requiresRole: 'Admin' },
    ]
  }
] as const;

