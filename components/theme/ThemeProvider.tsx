"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { ConfigProvider } from "antd";
import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
  type ThemeMode,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const baseToken = {
  borderRadius: 8,
  fontFamily: '"Be Vietnam Pro", "Segoe UI", Arial, Roboto, sans-serif',
};

const themeConfigs: Record<ThemeMode, ThemeConfig> = {
  light: {
    token: {
      ...baseToken,
      colorPrimary: "#08131A",
      colorText: "#08131A",
      colorTextSecondary: "#08131AA8",
      colorBorder: "#08131A24",
      colorBgBase: "#FFFFFF",
      colorLink: "#08131A",
    },
  },
  dark: {
    algorithm: antdTheme.darkAlgorithm,
    token: {
      ...baseToken,
      colorPrimary: "#F5F8FA",
      colorText: "#F5F8FA",
      colorTextSecondary: "#F5F8FAA8",
      colorBorder: "#F5F8FA24",
      colorBgBase: "#0D1D26",
      colorLink: "#F5F8FA",
    },
  },
};

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const toggleTheme = useCallback(() => {
    setTheme(getThemeSnapshot() === "dark" ? "light" : "dark");
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={themeConfigs[theme]}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}
