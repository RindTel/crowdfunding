import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

/** Applies the `dark` class to <html> so dark mode is global (dashboard + public). */
function applyTheme(isDark: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', isDark);
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => { const v = !get().isDark; applyTheme(v); set({ isDark: v }); },
      setDark: (v) => { applyTheme(v); set({ isDark: v }); },
    }),
    {
      name: 'ff-theme',
      // Re-apply the persisted choice once the store rehydrates on load.
      onRehydrateStorage: () => (state) => { if (state) applyTheme(state.isDark); },
    }
  )
);
