import React, { createContext, useContext } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { lightColors, darkColors } from '@/constants/Colors';

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: typeof lightColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme: themePreference, getSystemTheme } = useThemeStore();

  const resolvedTheme = themePreference === 'system' ? getSystemTheme() : themePreference;
  const colors = resolvedTheme === 'dark' ? darkColors : lightColors;
  const isDark = resolvedTheme === 'dark';

  const value = {
    theme: resolvedTheme,
    colors,
    isDark,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
