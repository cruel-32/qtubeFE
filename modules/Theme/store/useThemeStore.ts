import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeState = {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  getSystemTheme: () => 'light' | 'dark';
};

const THEME_STORAGE_KEY = 'qtube-theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  setTheme: async (theme) => {
    set({ theme });
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  },
  getSystemTheme: () => {
    return Appearance.getColorScheme() || 'light';
  },
}));

// Load theme from AsyncStorage on app start
(async () => {
  const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
    useThemeStore.getState().setTheme(storedTheme as 'light' | 'dark' | 'system');
  }
})();
