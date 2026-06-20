import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'app_theme';

export type AppTheme = {
  isDark: boolean;
  toggle: () => void;
  bg: string;
  surface: string;
  text: string;
  textSub: string;
  textMuted: string;
  border: string;
  handleBar: string;
  closeBtnBg: string;
  primary: string;
  primaryLight: string;
  brandBg: string;
  brandInputBg: string;
  brandInputBorder: string;
  tileUrl: string;
};

const LIGHT = {
  bg: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSub: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  handleBar: '#E5E7EB',
  closeBtnBg: '#F3F4F6',
  primary: '#0284C7',
  primaryLight: '#E0F2FE',
  brandBg: '#0284C7',
  brandInputBg: 'rgba(255,255,255,0.15)',
  brandInputBorder: 'rgba(255,255,255,0.20)',
  tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

const DARK = {
  bg: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
  textSub: '#94A3B8',
  textMuted: '#475569',
  border: '#334155',
  handleBar: '#475569',
  closeBtnBg: '#334155',
  primary: '#0284C7',
  primaryLight: '#0C2340',
  brandBg: '#0F172A',
  brandInputBg: 'rgba(255,255,255,0.08)',
  brandInputBorder: 'rgba(255,255,255,0.12)',
  tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const ThemeContext = createContext<AppTheme>({
  isDark: false,
  toggle: () => {},
  ...LIGHT,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'dark') setIsDark(true);
    });
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggle, ...(isDark ? DARK : LIGHT) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
