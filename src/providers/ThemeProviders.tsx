import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme as tokens } from '../theme/theme';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof tokens.colors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(STORAGE_KEY)) as Theme | null;
        if (saved === 'light' || saved === 'dark') {
          setTheme(saved);
        } else {
          const system = Appearance.getColorScheme();
          setTheme(system === 'dark' ? 'dark' : 'light');
        }
      } catch {
        setTheme('light');
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(p => (p === 'light' ? 'dark' : 'light'));

  const colors = useMemo(
    () => (theme === 'dark' ? tokens.colors.dark : tokens.colors.light),
    [theme],
  );

  const value = useMemo(() => ({ theme, toggleTheme, colors }), [theme, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
