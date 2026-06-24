import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        document.documentElement.setAttribute('data-theme', next);
      },
    }),
    { name: 'theme-store' }
  )
);

// Apply theme on page load (before React hydrates)
export function initTheme() {
  const stored = localStorage.getItem('theme-store');
  const theme = stored ? (JSON.parse(stored)?.state?.theme ?? 'dark') : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}
