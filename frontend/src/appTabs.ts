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
    groupName: 'Học tập',
    items: [
      { id: 'learning-path', path: '/courses', name: 'Khóa học' }
    ]
  },
  {
    groupName: 'Giải thuật',
    items: [
      { id: 'sorting',     path: '/sorting',     name: 'Sắp xếp' },
      { id: 'graph',       path: '/graph',       name: 'Đồ thị' },
      { id: 'code-ide',    path: '/code-ide',    name: 'Gỡ lỗi Code' }
    ]
  },
  {
    groupName: 'Khái niệm',
    items: [
      { id: 'docs',      path: '/docs',      name: 'Tài liệu tham khảo' },
      { id: 'system',   path: '/system',   name: 'Thiết kế HT' }
    ]
  },
  {
    groupName: 'Tương tác',
    items: [
      { id: 'quiz',          path: '/quiz',          name: 'Trắc nghiệm' },
      { id: 'gamification',  path: '/gamification',  name: 'Bảng xếp hạng' }
    ]
  },
  {
    groupName: 'Tài khoản',
    items: [
      { id: 'dashboard', path: '/dashboard', name: 'Bảng điều khiển', requiresAuth: true },
      { id: 'profile',   path: '/profile',   name: 'Hồ sơ cá nhân', requiresAuth: true },
      { id: 'checkout',  path: '/checkout',  name: 'Nâng cấp Premium' },
      { id: 'teacher',   path: '/teacher',   name: 'Quản lý Giảng viên', requiresAuth: true, requiresRole: 'Teacher' },
      { id: 'admin',     path: '/admin',     name: 'Quản trị Admin', requiresAuth: true, requiresRole: 'Admin' },
    ]
  },
] as const;
