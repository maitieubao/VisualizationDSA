import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Theme = 'terminal-dark' | 'light';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('terminal-dark');

  function initTheme() {
    const savedTheme = localStorage.getItem('app-theme') as Theme | null;
    if (savedTheme && (savedTheme === 'terminal-dark' || savedTheme === 'light')) {
      currentTheme.value = savedTheme;
    } else {
      // Default to dark theme instead of relying on OS preference
      currentTheme.value = 'terminal-dark';
    }
    applyTheme(currentTheme.value);
  }

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'terminal-dark' ? 'light' : 'terminal-dark';
    localStorage.setItem('app-theme', currentTheme.value);
    applyTheme(currentTheme.value);
  }

  function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  return {
    currentTheme,
    initTheme,
    toggleTheme,
    applyTheme
  };
});
