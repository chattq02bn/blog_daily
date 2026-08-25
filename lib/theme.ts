export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "note-theme";

type ThemeListener = () => void;

const listeners = new Set<ThemeListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(): ThemeMode {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

export function subscribeTheme(listener: ThemeListener): () => void {
  listeners.add(listener);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemChange = () => {
    if (!getStoredTheme()) {
      applyTheme(getSystemTheme());
      notifyListeners();
    }
  };
  media.addEventListener("change", handleSystemChange);

  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", handleSystemChange);
  };
}

export function getThemeSnapshot(): ThemeMode {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function getThemeServerSnapshot(): ThemeMode {
  return "light";
}

export function setTheme(theme: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  applyTheme(theme);
  notifyListeners();
}
