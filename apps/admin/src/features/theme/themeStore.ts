import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

const KEY = 'mytutor-admin-theme';

function load(): ThemePreference {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

/** Applies the preference as `data-theme` on <html>; "system" follows prefers-color-scheme. */
function apply(preference: ThemePreference) {
  const root = document.documentElement;
  if (preference === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', preference);
}

type ThemeState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  preference: load(),
  setPreference: (preference) => {
    try {
      localStorage.setItem(KEY, preference);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this tab only.
    }
    apply(preference);
    set({ preference });
  },
}));

export function initTheme() {
  apply(useThemeStore.getState().preference);
}
