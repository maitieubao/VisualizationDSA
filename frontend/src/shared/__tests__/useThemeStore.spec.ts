// @vitest-environment jsdom
// CU-010 (P1): useThemeStore — initTheme localStorage + matchMedia prefers-light +
// giá trị lẻ → fallback + applyTheme data-theme + try/catch SecurityError (CU-014).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useThemeStore } from '../store/useThemeStore';

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

function stubStorageUnavailable(): void {
  const throwingStorage = {
    getItem: vi.fn(() => { throw new DOMException('The operation is insecure.', 'SecurityError'); }),
    setItem: vi.fn(() => { throw new DOMException('The operation is insecure.', 'SecurityError'); }),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(() => null),
    get length() { return 0; },
  };
  vi.stubGlobal('localStorage', throwingStorage);
}

describe('useThemeStore — CU-010', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    stubMatchMedia(false);
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('localStorage app-theme=light → initTheme chọn light + áp data-theme', () => {
    localStorage.setItem('app-theme', 'light');
    const store = useThemeStore();
    store.initTheme();

    expect(store.currentTheme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('localStorage app-theme=terminal-dark → initTheme chọn terminal-dark', () => {
    localStorage.setItem('app-theme', 'terminal-dark');
    const store = useThemeStore();
    store.initTheme();

    expect(store.currentTheme).toBe('terminal-dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal-dark');
  });

  it('không có giá trị lưu + prefers-light → initTheme chọn light', () => {
    stubMatchMedia(true);
    const store = useThemeStore();
    store.initTheme();

    expect(store.currentTheme).toBe('light');
  });

  it('không có giá trị lưu + prefers-dark → initTheme chọn terminal-dark', () => {
    const store = useThemeStore();
    store.initTheme();

    expect(store.currentTheme).toBe('terminal-dark');
  });

  it('giá trị lẻ (blue) → fallback theo matchMedia', () => {
    localStorage.setItem('app-theme', 'blue');
    const store = useThemeStore();
    store.initTheme();

    expect(store.currentTheme).toBe('terminal-dark');
  });

  it('toggleTheme: đổi theme + lưu localStorage + áp data-theme', () => {
    const store = useThemeStore();
    store.toggleTheme();

    expect(store.currentTheme).toBe('light');
    expect(localStorage.getItem('app-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    store.toggleTheme();

    expect(store.currentTheme).toBe('terminal-dark');
    expect(localStorage.getItem('app-theme')).toBe('terminal-dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal-dark');
  });

  it('applyTheme gán data-theme lên documentElement', () => {
    const store = useThemeStore();
    store.applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    store.applyTheme('terminal-dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('terminal-dark');
  });

  it('CU-014: localStorage SecurityError (getItem) → fallback matchMedia, không crash', () => {
    stubStorageUnavailable();
    const store = useThemeStore();

    expect(() => store.initTheme()).not.toThrow();
    expect(store.currentTheme).toBe('terminal-dark');
  });

  it('CU-014: toggleTheme khi localStorage.setItem throw → vẫn đổi theme + áp data-theme', () => {
    stubStorageUnavailable();
    const store = useThemeStore();

    expect(() => store.toggleTheme()).not.toThrow();
    expect(store.currentTheme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('CU-014: matchMedia không khả dụng → fallback terminal-dark, không crash', () => {
    vi.stubGlobal('matchMedia', undefined);
    const store = useThemeStore();

    expect(() => store.initTheme()).not.toThrow();
    expect(store.currentTheme).toBe('terminal-dark');
  });
});
