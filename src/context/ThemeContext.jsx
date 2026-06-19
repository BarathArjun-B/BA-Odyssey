import { createContext, useContext, useEffect, useState } from 'react';
import { useData } from './DataContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { data, updateSettings } = useData();
  const [theme, setTheme] = useState(data?.settings?.theme || 'system');

  useEffect(() => {
    if (data?.settings?.theme) {
      setTheme(data.settings.theme);
    }
  }, [data?.settings?.theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setThemePref = (newTheme) => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemePref }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
