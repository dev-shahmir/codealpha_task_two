import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('vybeboard_theme') || 'dark');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode) => {
      const dark = mode === 'dark';
      root.classList.toggle('dark', dark);
      setIsDark(dark);
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const listener = (e) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
    apply(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('vybeboard_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
