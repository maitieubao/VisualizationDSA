import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Theme = 'terminal-dark' | 'light';

const THEME_STORAGE_KEY = 'app-theme';

// CU-014: localStorage/matchMedia đều bọc try/catch — môi trường hạn chế
// (Safari private, jsdom không matchMedia) không crash, luôn có fallback mặc định.
function readInitialTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'terminal-dark' || savedTheme === 'light') return savedTheme;
  } catch {
    // localStorage không khả dụng — rơi xuống matchMedia.
  }
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'terminal-dark';
    }
  } catch {
    // matchMedia không khả dụng — fallback mặc định.
  }
  return 'terminal-dark';
}

export const useThemeStore = defineStore('theme', () => {
  // CU-014: khởi tạo ĐỒNG BỘ ngay trong store setup (trước mount) —
  // áp data-theme trước lần render đầu tiên, hết FOUC flash theme.
  const currentTheme = ref<Theme>(readInitialTheme());

  function applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Áp ngay theme đã đọc được — không chờ onMounted (App.vue vẫn gọi initTheme, idempotent).
  applyTheme(currentTheme.value);

  function initTheme(): void {
    applyTheme(currentTheme.value);
  }

  function toggleTheme(): void {
    currentTheme.value = currentTheme.value === 'terminal-dark' ? 'light' : 'terminal-dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme.value);
    } catch {
      // localStorage không khả dụng — theme vẫn áp dụng trong phiên hiện tại.
    }
    applyTheme(currentTheme.value);
  }

  return {
    currentTheme,
    initTheme,
    toggleTheme,
    applyTheme
  };
});
