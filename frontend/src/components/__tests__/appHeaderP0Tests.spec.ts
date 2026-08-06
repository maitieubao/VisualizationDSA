import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useThemeStore } from '../../shared/store/useThemeStore';
import { APP_TABS } from '../../appTabs';
import type { TabGroup, TabItem } from '../../appTabs';

function isTabVisible(tab: TabItem, isAuthenticated: boolean, userRole: string): boolean {
  if (tab.requiresAuth && !isAuthenticated) return false;
  if (tab.requiresRole) {
    if (userRole === 'Admin') return true;
    if (userRole !== tab.requiresRole) return false;
  }
  return true;
}

function filteredTabs(isAuthenticated: boolean, userRole: string): (TabGroup | TabItem)[] {
  return APP_TABS.filter((tabOrGroup) => {
    if ('groupName' in tabOrGroup) {
      const group = tabOrGroup as TabGroup;
      const visibleItems = group.items.filter((item: TabItem) => isTabVisible(item, isAuthenticated, userRole));
      return visibleItems.length > 0;
    }
    return isTabVisible(tabOrGroup as TabItem, isAuthenticated, userRole);
  }).map((tabOrGroup) => {
    if ('groupName' in tabOrGroup) {
      const group = tabOrGroup as TabGroup;
      return {
        ...group,
        items: group.items.filter((item: TabItem) => isTabVisible(item, isAuthenticated, userRole)),
      };
    }
    return tabOrGroup;
  });
}

describe('NA-001 (P0): Nav tabs render — header-nav hiển thị groups', () => {
  it('APP_TABS chứa các group Học tập, Giải thuật, Khái niệm, Tương tác, Tài khoản', () => {
    const groups = APP_TABS.filter(t => 'groupName' in t) as TabGroup[];
    const groupNames = groups.map(g => g.groupName);

    expect(groupNames).toContain('Học tập');
    expect(groupNames).toContain('Giải thuật');
    expect(groupNames).toContain('Khái niệm');
    expect(groupNames).toContain('Tương tác');
    expect(groupNames).toContain('Tài khoản');
  });

  it('filteredTabs trả về đầy đủ groups khi chưa login', () => {
    const tabs = filteredTabs(false, 'Student');

    expect(tabs.length).toBeGreaterThan(0);
    expect(tabs.some(t => 'groupName' in t && t.groupName === 'Học tập')).toBe(true);
    expect(tabs.some(t => 'groupName' in t && t.groupName === 'Giải thuật')).toBe(true);
  });

  it('mỗi group có items đúng path', () => {
    const tabs = filteredTabs(false, 'Student');
    const algoGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Giải thuật') as TabGroup;

    expect(algoGroup).toBeDefined();
    expect(algoGroup.items.length).toBeGreaterThanOrEqual(3);
    expect(algoGroup.items.some(i => i.path === '/sorting')).toBe(true);
    expect(algoGroup.items.some(i => i.path === '/graph')).toBe(true);
  });
});

describe('NA-003 (P0): Theme toggle — themeStore.toggleTheme()', () => {
  let mockDocumentElement: { setAttribute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    setActivePinia(createPinia());
    mockDocumentElement = { setAttribute: vi.fn() };
    Object.defineProperty(global, 'document', {
      value: { documentElement: mockDocumentElement },
      writable: true,
      configurable: true,
    });
  });

  it('toggleTheme chuyển từ terminal-dark sang light', () => {
    const store = useThemeStore();
    expect(store.currentTheme).toBe('terminal-dark');

    store.toggleTheme();
    expect(store.currentTheme).toBe('light');
  });

  it('toggleTheme chuyển ngược từ light sang terminal-dark', () => {
    const store = useThemeStore();
    store.toggleTheme();
    expect(store.currentTheme).toBe('light');

    store.toggleTheme();
    expect(store.currentTheme).toBe('terminal-dark');
  });

  it('toggleTheme lưu vào localStorage', () => {
    const store = useThemeStore();
    store.toggleTheme();

    expect(localStorage.getItem('app-theme')).toBe('light');
  });
});

describe('NA-004 (P0): Hide auth tabs — tab requiresAuth ẩn khi chưa login', () => {
  it('classrooms (requiresAuth) bị ẩn khi chưa login', () => {
    const tabs = filteredTabs(false, 'Student');
    const learningGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Học tập') as TabGroup;

    expect(learningGroup).toBeDefined();
    expect(learningGroup.items.some(i => i.id === 'classrooms')).toBe(false);
  });

  it('dashboard, profile (requiresAuth) bị ẩn khi chưa login', () => {
    const tabs = filteredTabs(false, 'Student');
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(accountGroup).toBeDefined();
    expect(accountGroup.items.some(i => i.id === 'dashboard')).toBe(false);
    expect(accountGroup.items.some(i => i.id === 'profile')).toBe(false);
  });

  it('checkout (không requiresAuth) vẫn hiển thị khi chưa login', () => {
    const tabs = filteredTabs(false, 'Student');
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(accountGroup).toBeDefined();
    expect(accountGroup.items.some(i => i.id === 'checkout')).toBe(true);
  });

  it('khi đã login — tabs requiresAuth hiển thị', () => {
    const tabs = filteredTabs(true, 'Student');
    const learningGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Học tập') as TabGroup;
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(learningGroup.items.some(i => i.id === 'classrooms')).toBe(true);
    expect(accountGroup.items.some(i => i.id === 'dashboard')).toBe(true);
    expect(accountGroup.items.some(i => i.id === 'profile')).toBe(true);
  });

  it('teacher role — hiển thị tab Quản lý Giảng viên', () => {
    const tabs = filteredTabs(true, 'Teacher');
    const accountGroup = tabs.find(t => 'groupName' in t && t.groupName === 'Tài khoản') as TabGroup;

    expect(accountGroup.items.some(i => i.id === 'teacher')).toBe(true);
  });
});

describe('NA-006 (P0): GitHub link — link GitHub render', () => {
  it('APP_TABS không chứa GitHub link (nằm ngoài nav)', () => {
    const allItems: TabItem[] = [];
    for (const tabOrGroup of APP_TABS) {
      if ('groupName' in tabOrGroup) {
        allItems.push(...tabOrGroup.items);
      } else {
        allItems.push(tabOrGroup);
      }
    }

    const githubItem = allItems.find(i => i.path?.includes('github'));
    expect(githubItem).toBeUndefined();
  });

  it('GitHub link có trong AppHeader template với đúng href', () => {
    const fs = require('fs');
    const path = require('path');
    const headerSource = fs.readFileSync(
      path.resolve(__dirname, '../AppHeader.vue'),
      'utf-8'
    );

    expect(headerSource).toContain('https://github.com/maitieubao/VisualizationDSA');
    expect(headerSource).toContain('target="_blank"');
    expect(headerSource).toContain('rel="noopener noreferrer"');
  });
});
